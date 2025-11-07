from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
import os
from datetime import datetime

load_dotenv("python.env")

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")
COMICS_COLLECTION = os.getenv("COLLECTION_NAME")
USERS_COLLECTION = os.getenv("USERS_COLLECTION", "users")
ALLOWED_USER_ID = os.getenv("ALLOWED_USER_ID")

app = Flask(__name__)
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")
ALLOWED_ORIGINS_LIST = [o.strip() for o in ALLOWED_ORIGINS.split(",") if o.strip()]

CORS(
    app,
    resources={r"/api/*": {"origins": ALLOWED_ORIGINS_LIST}},
    supports_credentials=True,
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"]
)

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
    
@app.route("/api/Batcave/<user_id>", methods=["GET"])
def get_admin_page(user_id):
    try:
        if user_id != ALLOWED_USER_ID:
            return jsonify({"error": "Access denied"}), 403

        user = users_collection.find_one({"sub": user_id})
        if not user:
            return jsonify({"error": "User not found"}), 404

        return jsonify({
            "message": f"Welcome home Master Wayne, {user_id}!",
            "secret_data": "Admin-only information here."
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
