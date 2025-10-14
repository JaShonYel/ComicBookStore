#bring in flask, pymongo, and dotenv for the project
# Also set up CORS to handle cross-origin requests
#and coonect to MongoDB using environment variables for security
#fetch comics from the database for search functionality

from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from dotenv import load_dotenv
import os
#imports angry but i call CAP. they work just fine


load_dotenv("python.env")

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")
COLLECTION_NAME = os.getenv("COLLECTION_NAME")

print("MONGO_URI:", MONGO_URI)
print("DB_NAME:", DB_NAME)
print("COLLECTION_NAME:", COLLECTION_NAME)


app = Flask(__name__)
CORS(app)


client = MongoClient(MONGO_URI)
db = client[DB_NAME]
comics_collection = db[COLLECTION_NAME]


try:
    client.admin.command("ping")
    print(f"Connected to MongoDB Atlas: {DB_NAME}.{COLLECTION_NAME}")
except Exception as e:
    print("MongoDB connection failed:", e)


@app.route("/api/comics")
def get_comics():
    search = request.args.get("search", "").strip()
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 50))
    skip = (page - 1) * limit

    query = {}
    if search:
        keywords = search.split()
        query = {"$or": [{"title": {"$regex": word, "$options": "i"}} for word in keywords]}

    try:
        # Count total results
        total_results = comics_collection.count_documents(query)
        total_pages = (total_results + limit - 1) // limit

        # Fetch only the requested page
        comics_cursor = comics_collection.find(query).skip(skip).limit(limit)

        comics = []
        for comic in comics_cursor:
            price_value = None
            raw_prices = comic.get("prices", None)

            if isinstance(raw_prices, list):
                for p in raw_prices:
                    try:
                        if p.get("type") == "printPrice":
                            price_value = p.get("price")
                            break
                    except Exception:
                        pass
            elif isinstance(raw_prices, dict):
                price_value = raw_prices.get("price")

            if price_value == 0 or price_value is None:
                price_value = 2.0

            comics.append({
                "id": str(comic["_id"]),
                "title": comic.get("title", ""),
                "img": (
                    comic.get("thumbnail", {}).get("path", "") + ".jpg"
                    if comic.get("thumbnail")
                    else "https://placedog.net/500/280"
                ),
                "description": comic.get("description", ""),
                "price": price_value,
            })

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

        comics = []
        for comic in comics_cursor:
            price_value = None
            raw_prices = comic.get("prices", None)

            if isinstance(raw_prices, list):
                for p in raw_prices:
                    if isinstance(p, dict) and p.get("type") == "printPrice":
                        price_value = p.get("price")
                        break

            elif isinstance(raw_prices, dict):
                price_value = raw_prices.get("price")

            if price_value == 0 or price_value is None:
                price_value = 2.0

            comics.append({
                "id": str(comic["_id"]),
                "title": comic.get("title", ""),
                "img": (
                    comic.get("thumbnail", {}).get("path", "") + ".jpg"
                    if comic.get("thumbnail")
                    else "https://placedog.net/500/280"
                ),
                "description": comic.get("description", ""),
                "price": price_value,
            })

        return jsonify(comics)

    except Exception as e:
        return jsonify({"error": str(e)}), 500



    
@app.route("/api/comics/series/<series_name>")
def get_comics_by_series(series_name):
    try:
        # Case-insensitive regex to find titles containing the series name
        query = {"title": {"$regex": series_name, "$options": "i"}}
        comics_cursor = comics_collection.find(query)

        comics = []
        for comic in comics_cursor:
            price_value = None
            raw_prices = comic.get("prices", None)

            if isinstance(raw_prices, list):
                for p in raw_prices:
                    try:
                        if p.get("type") == "printPrice":
                            price_value = p.get("price")
                            break
                    except Exception:
                        pass
            elif isinstance(raw_prices, dict):
                price_value = raw_prices.get("price")

            if price_value == 0 or price_value is None:
                price_value = 2.0

            comics.append({
                "id": str(comic["_id"]),
                "title": comic.get("title", ""),
                "img": (
                    comic.get("thumbnail", {}).get("path", "") + ".jpg"
                    if comic.get("thumbnail")
                    else "https://placedog.net/500/280"
                ),
                "description": comic.get("description", ""),
                "price": price_value,
            })

        return jsonify(comics)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
