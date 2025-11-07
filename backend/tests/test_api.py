import os
import sys
import re
import json
import random

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import App as app_module
from App import app as flask_app
import os
import sys
import re
import random

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
import App as app_module
from App import app as flask_app

import pytest


class FakeCursor:
    def __init__(self, items):
        self.items = list(items)
        self._skip = 0
        self._limit = None
        self._sort_key = None
        self._sort_direction = 1

    def sort(self, key, direction):
        self._sort_key = key
        self._sort_direction = direction
        def val(item):
            if key == "prices.price":
                p = item.get("prices")
                if isinstance(p, list) and len(p) > 0 and isinstance(p[0], dict):
                    return p[0].get("price", 2.0)
                return 2.0
            return item.get(key)

        self.items.sort(key=val, reverse=(direction < 0))
        return self

    def skip(self, n):
        self._skip = n
        return self

    def limit(self, n):
        self._limit = n
        return self

    def __iter__(self):
        start = self._skip
        end = None if self._limit is None else start + self._limit
        for it in self.items[start:end]:
            yield it


class FakeCollection:
    def __init__(self, items=None):
        self.items = list(items or [])

    def find(self, query=None):
        if not query:
            return FakeCursor(self.items)

        if "$or" in query and isinstance(query["$or"], list):
            patterns = []
            for clause in query["$or"]:
                title_q = clause.get("title")
                if isinstance(title_q, dict):
                    regex = title_q.get("$regex")
                    flags = title_q.get("$options", "")
                    if regex:
                        patterns.append(re.compile(regex, re.IGNORECASE if "i" in flags else 0))

            if patterns:
                def matches_any(item):
                    t = item.get("title", "")
                    return any(p.search(t) for p in patterns)

                filtered = [it for it in self.items if matches_any(it)]
                return FakeCursor(filtered)

        if "title" in query and isinstance(query["title"], dict):
            regex = query["title"].get("$regex")
            flags = query["title"].get("$options", "")
            if regex:
                pattern = re.compile(regex, re.IGNORECASE if "i" in flags else 0)
                filtered = [it for it in self.items if pattern.search(it.get("title", ""))]
                return FakeCursor(filtered)

        return FakeCursor(self.items)

    def aggregate(self, pipeline):
        # support only sample stage
        for stage in pipeline:
            if "$sample" in stage:
                size = stage["$sample"].get("size", 1)
                return random.sample(self.items, k=min(size, len(self.items)))
        return self.items

    def count_documents(self, query=None):
        return len(list(self.find(query)))

    def find_one(self, query):
        key, value = next(iter(query.items()))
        for it in self.items:
            if it.get(key) == value:
                return it
        return None


class FakeUserCollection(FakeCollection):
    def insert_one(self, doc):
        self.items.append(doc)
        return doc

    def update_one(self, filter_q, update_q, upsert=False):
        sub = filter_q.get("sub")
        user = self.find_one({"sub": sub})
        set_obj = update_q.get("$set", {})
        if user:
            user.update(set_obj)
            return True
        if upsert:
            new = {"sub": sub}
            new.update(set_obj)
            self.items.append(new)
            return True
        return False


@pytest.fixture
def client(monkeypatch):
    comics = [
        {
            "_id": 1,
            "title": "Amazing Spider-Man #1",
            "thumbnail": {"path": "http://example.com/spidey"},
            "description": "Spidey!",
            "prices": [{"type": "printPrice", "price": 3.5}],
            "dates": [{"type": "onsaleDate", "date": "2020-01-01T00:00:00"}],
        },
        {
            "_id": 2,
            "title": "Batman: Year One",
            "thumbnail": {"path": "http://example.com/bat"},
            "description": "Dark Knight",
            "prices": [{"type": "printPrice", "price": 4.0}],
            "dates": [{"type": "onsaleDate", "date": "1987-02-10T00:00:00"}],
        },
        {
            "_id": 3,
            "title": "Small Indie Comic",
            "thumbnail": None,
            "description": "Indie",
            "prices": [],
            "dates": [],
        },
    ]

    users = [
        {"sub": "admin", "cart": [], "favorites": []}
    ]

    fake_comics = FakeCollection(comics)
    fake_users = FakeUserCollection(users)

    monkeypatch.setattr(app_module, "comics_collection", fake_comics)
    monkeypatch.setattr(app_module, "users_collection", fake_users)
    monkeypatch.setattr(app_module, "ALLOWED_USER_ID", "admin")

    flask_app.config["TESTING"] = True
    with flask_app.test_client() as client:
        yield client

def test_query_parameter_operator_injection_ignored(client):
    resp = client.get("/api/comics?search[$ne]=1")
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["totalResults"] == 3


def test_update_cart_operator_keys_stored_as_data(client):
    payload = {"cart": [{"id": "abc", "title": "T", "price": "5.25"}, {"$set": {"admin": True}}]}
    resp = client.put("/api/users/attacker/cart", json=payload)
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["success"] is True

    resp2 = client.get("/api/users/attacker")
    assert resp2.status_code == 200
    stored = resp2.get_json()
    assert "admin" not in stored
    assert any(isinstance(item, dict) and "$set" in item for item in stored.get("cart", []))


def test_favorites_operator_like_payload_is_stored_as_data(client):
    payload = {"favorites": [{"id": "x", "$where": "this.sub == 'admin'"}]}
    resp = client.put("/api/users/attacker/favorites", json=payload)
    assert resp.status_code == 200

    resp2 = client.get("/api/users/attacker")
    stored = resp2.get_json()
    assert "where" not in stored
    assert any(isinstance(item, dict) and "$where" in item for item in stored.get("favorites", []))


def test_cors_header_present(client):
    resp = client.get("/api/comics")
    assert "Access-Control-Allow-Origin" in resp.headers


def test_invalid_page_param_does_not_expose_secrets(client):
    orig_testing = flask_app.config.get("TESTING")
    flask_app.config["TESTING"] = False
    try:
        resp = client.get("/api/comics?page=notanumber")
        assert resp.status_code in (400, 500)
        text = resp.get_data(as_text=True)
        assert "MONGO_URI" not in text
        assert "ComicBooks" not in text
    finally:
        flask_app.config["TESTING"] = orig_testing


def test_update_favorites_rejects_malformed_body(client):
    resp = client.put("/api/users/abc/favorites", data="notjson", content_type="text/plain")
    text = resp.get_data(as_text=True)
    assert "Traceback" not in text


if __name__ == "__main__":
    pytest.main(["-q", os.path.dirname(__file__)])
    resp = client.put("/api/users/abc/favorites", data="notjson", content_type="text/plain")
    text = resp.get_data(as_text=True)
    assert "Traceback" not in text


def test_query_parameter_operator_injection_ignored(client):
    resp = client.get("/api/comics?search[$ne]=1")
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["totalResults"] == 3


def test_update_cart_operator_keys_stored_as_data(client):
    payload = {"cart": [{"id": "abc", "title": "T", "price": "5.25"}, {"$set": {"admin": True}}]}
    resp = client.put("/api/users/attacker/cart", json=payload)
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["success"] is True

    resp2 = client.get("/api/users/attacker")
    assert resp2.status_code == 200
    stored = resp2.get_json()
    assert "admin" not in stored
    assert any(isinstance(item, dict) and "$set" in item for item in stored.get("cart", []))


def test_favorites_operator_like_payload_is_stored_as_data(client):
    payload = {"favorites": [{"id": "x", "$where": "this.sub == 'admin'"}]}
    resp = client.put("/api/users/attacker/favorites", json=payload)
    assert resp.status_code == 200

    resp2 = client.get("/api/users/attacker")
    stored = resp2.get_json()
    assert "where" not in stored
    assert any(isinstance(item, dict) and "$where" in item for item in stored.get("favorites", []))


if __name__ == "__main__":
    pytest.main(["-q", os.path.dirname(__file__)])
