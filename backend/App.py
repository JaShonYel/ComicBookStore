from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
import os
from datetime import datetime, timezone
from bson.objectid import ObjectId

load_dotenv("python.env")

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")
COMICS_COLLECTION = os.getenv("COLLECTION_NAME")
USERS_COLLECTION = os.getenv("USERS_COLLECTION", "users")
ALLOWED_USER_ID = os.getenv("ALLOWED_USER_ID")

app = Flask(__name__)
CORS(app)

client = MongoClient(MONGO_URI)
db = client[DB_NAME]
comics_collection = db[COMICS_COLLECTION]
users_collection = db[USERS_COLLECTION]

try:
    client.admin.command("ping")
    print(f"Connected to MongoDB Atlas: {DB_NAME}.{COMICS_COLLECTION}")
except Exception as e:
    print("MongoDB connection failed:", e)


def extract_price(raw_prices):
    default_price = 2.0
    if isinstance(raw_prices, list):
        print_price = next(
            (p.get("price") for p in raw_prices if isinstance(p, dict) and p.get("type") == "printPrice"),
            None
        )
        return float(print_price) if print_price is not None else default_price
    elif isinstance(raw_prices, dict):
        return float(raw_prices.get("price", default_price))
    else:
        return default_price


def format_comic(comic):
    price_value = extract_price(comic.get("prices"))
    return {
        "id": str(comic["_id"]),
        "title": comic.get("title", ""),
        "img": (comic.get("thumbnail", {}).get("path", "") + ".jpg"
                if comic.get("thumbnail") else "https://placedog.net/500/280"),
        "description": comic.get("description", ""),
        "price": price_value,
    }


@app.route("/api/comics")
def get_comics():
    search = request.args.get("search", "").strip()
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 50))
    skip = (page - 1) * limit

    price_range = request.args.get("priceRange", "all")
    sort_order = request.args.get("sortOrder", "asc")
    category = request.args.get("category", "all")
    format_type = request.args.get("format", "all")
    year = request.args.get("year", "all")

    query = {}

    if search:
        keywords = search.split()
        query["$or"] = [{"title": {"$regex": word, "$options": "i"}} for word in keywords]

    if category != "all":
        query["collections.name"] = {"$regex": category, "$options": "i"}

    if format_type != "all":
        query["format"] = {"$regex": f"^{format_type}$", "$options": "i"}

    price_filter = {}
    if price_range != "all":
        if price_range == "0-5":
            price_filter = {"$lt": 5}
        elif price_range == "5-10":
            price_filter = {"$gte": 5, "$lte": 10}
        elif price_range == "10-20":
            price_filter = {"$gte": 10, "$lte": 20}
        elif price_range == "20+":
            price_filter = {"$gt": 20}
        query["prices.price"] = price_filter

    if year != "all":
        start_date = datetime(int(year), 1, 1)
        end_date = datetime(int(year), 12, 31, 23, 59, 59)
        query["dates"] = {
            "$elemMatch": {
                "type": "onsaleDate",
                "date": {"$gte": start_date, "$lte": end_date}
            }
        }

    sort_direction = 1 if sort_order == "asc" else -1

    try:
        total_results = comics_collection.count_documents(query)
        total_pages = (total_results + limit - 1) // limit

        comics_cursor = (
            comics_collection.find(query)
            .sort("prices.price", sort_direction)
            .skip(skip)
            .limit(limit)
        )

        comics = [format_comic(c) for c in comics_cursor]

        return jsonify({
            "page": page,
            "totalPages": total_pages,
            "totalResults": total_results,
            "results": comics
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500



@app.route("/api/comics/featured")
def get_featured_comics():
    try:
        comics_cursor = comics_collection.aggregate([{"$sample": {"size": 5}}])
        comics = [format_comic(c) for c in comics_cursor]
        return jsonify(comics)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/comics/series/<series_name>")
def get_comics_by_series(series_name):
    try:
        query = {"title": {"$regex": series_name, "$options": "i"}}
        comics_cursor = comics_collection.find(query)
        comics = [format_comic(c) for c in comics_cursor]
        return jsonify(comics)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def get_or_create_user(user_id: str, defaults=None):
    if defaults is None:
        defaults = {"cart": [], "favorites": []}
    user = users_collection.find_one({"sub": user_id})
    if not user:
        users_collection.insert_one({"sub": user_id, **defaults})
        user = users_collection.find_one({"sub": user_id})
    return user


@app.route("/api/users/<user_id>", methods=["GET"])
def get_user_data(user_id):
    try:
        user = get_or_create_user(user_id)
        return jsonify({
            "sub": user["sub"],
            "cart": user.get("cart", []),
            "favorites": user.get("favorites", [])
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/users/<user_id>/cart", methods=["PUT"])
def update_cart(user_id):
    try:
        cart = request.json.get("cart", [])
        
        for item in cart:
            item["price"] = float(item.get("price", 2.0))
        users_collection.update_one(
            {"sub": user_id},
            {"$set": {"cart": cart}},
            upsert=True
        )
        return jsonify({"success": True, "cart": cart})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/users/<user_id>/favorites", methods=["PUT"])
def update_favorites(user_id):
    try:
        favorites = request.json.get("favorites", [])
        
        for item in favorites:
            item["price"] = float(item.get("price", 2.0))
        users_collection.update_one(
            {"sub": user_id},
            {"$set": {"favorites": favorites}},
            upsert=True
        )
        return jsonify({"success": True, "favorites": favorites})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/api/batcave/<user_id>", methods=["GET"])
def get_admin_page(user_id):
    try:
        if user_id != ALLOWED_USER_ID:
            return jsonify({"error": "Access denied"}), 403

        user = users_collection.find_one({"sub": user_id})
        if not user:
            return jsonify({"error": "User not found"}), 404

        return jsonify({
            "message": f"Welcome home Master Wayne!",
            "secret_data": "Admin-only information here."
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def format_admin_item(doc):

    try:
        price_val = float(doc.get("price", 2.0)) if doc.get("price") is not None else extract_price(doc.get("prices"))
    except Exception:
        price_val = 2.0
    return {
        "id": str(doc.get("_id")),
        "title": doc.get("title", ""),
        "price": price_val,
        "image": doc.get("image") or (doc.get("thumbnail", {}).get("path", "") + ".jpg" if doc.get("thumbnail") else "https://placedog.net/500/280"),
        "description": doc.get("description", "")
    }

@app.route("/api/admin/inventory", methods=["GET"])
def admin_get_inventory():
    try:
        items_cursor = comics_collection.find({})
        items = [format_admin_item(d) for d in items_cursor]
        return jsonify(items)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/admin/inventory", methods=["POST"])
def admin_create_item():
    try:
        data = request.json or {}
        doc = {
            "title": data.get("title", "Untitled"),
            "price": float(data.get("price", 2.0)),
            "image": data.get("image"),
            "description": data.get("description", ""),
            "createdAt": datetime.now(timezone.utc)
        }
        res = comics_collection.insert_one(doc)
        created = comics_collection.find_one({"_id": res.inserted_id})
        return jsonify(format_admin_item(created))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/admin/inventory/<item_id>", methods=["PUT"])
def admin_update_item(item_id):
    try:
        data = request.json or {}
        update_fields = {}
        if "title" in data:
            update_fields["title"] = data["title"]
        if "price" in data:
            update_fields["price"] = float(data["price"]) if data["price"] is not None else None
        if "image" in data:
            update_fields["image"] = data["image"]
        if "description" in data:
            update_fields["description"] = data["description"]
#it looks gross cuz of the trys but it works well and i dont wanna mess with it
        query = None
        try:
            query = {"_id": ObjectId(item_id)}
        except Exception:
            try:
                query = {"_id": item_id}
            except Exception:
                try:
                    num = int(item_id)
                    query = {"_id": num}
                except Exception:
                    query = {"_id": item_id}

        if not update_fields:
            return jsonify({"error": "No updatable fields provided"}), 400

        result = comics_collection.update_one(query, {"$set": update_fields})
        
        if result.matched_count == 0:
            return jsonify({"error": "Item not found", "matched_count": 0}), 404

        updated = comics_collection.find_one(query)
        if updated is None:
            return jsonify({"error": "Item matched but could not be retrieved after update"}), 500

        response = format_admin_item(updated)
        if result.modified_count == 0:
            response["_meta"] = {"matched_count": result.matched_count, "modified_count": result.modified_count}

        return jsonify(response)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/admin/inventory/<item_id>", methods=["DELETE"])
def admin_delete_item(item_id):
#same method as before i copy and pasted it down here
    try:
        query = None
        try:
            query = {"_id": ObjectId(item_id)}
        except Exception:
            try:
                query = {"_id": item_id}
            except Exception:
                try:
                    num = int(item_id)
                    query = {"_id": num}
                except Exception:
                    query = {"_id": item_id}

        result = comics_collection.delete_one(query)
        if result.deleted_count == 0:
            return jsonify({"error": "Item not found"}), 404
        return jsonify({"success": True, "deleted_count": result.deleted_count})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
