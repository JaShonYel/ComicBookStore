import pytest
from unittest.mock import MagicMock, patch
from App import app

# ---------------------------
# Pytest fixture for test client
# ---------------------------
@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


# ---------------------------
# Test /api/comics
# ---------------------------
@patch("App.comics_collection")
def test_get_comics(mock_comics_collection, client):
    # Mock a cursor object with skip() and limit()
    mock_cursor = MagicMock()
    mock_cursor.skip.return_value = mock_cursor
    mock_cursor.limit.return_value = [
        {
            "_id": "123",
            "title": "Spider-Man",
            "thumbnail": {"path": "https://example.com/spiderman"},
            "description": "Friendly neighborhood hero",
            "prices": [{"type": "printPrice", "price": 3.99}],
        }
    ]

    mock_comics_collection.count_documents.return_value = 1
    mock_comics_collection.find.return_value = mock_cursor

    response = client.get("/api/comics")
    data = response.get_json()

    assert response.status_code == 200
    assert "results" in data
    assert len(data["results"]) == 1
    assert data["results"][0]["title"] == "Spider-Man"
    assert data["results"][0]["price"] == 3.99


# ---------------------------
# Test /api/comics/featured
# ---------------------------
@patch("App.comics_collection")
def test_get_featured_comics(mock_comics_collection, client):
    mock_comics_collection.aggregate.return_value = [
        {
            "_id": "456",
            "title": "Iron Man",
            "thumbnail": {"path": "https://example.com/ironman"},
            "description": "Genius billionaire hero",
            "prices": [{"type": "printPrice", "price": 4.99}],
        }
    ]

    response = client.get("/api/comics/featured")
    data = response.get_json()

    assert response.status_code == 200
    assert len(data) == 1
    assert data[0]["title"] == "Iron Man"
    assert data[0]["price"] == 4.99


# ---------------------------
# Test /api/comics/series/<series_name>
# ---------------------------
@patch("App.comics_collection")
def test_get_comics_by_series(mock_comics_collection, client):
    mock_comics_collection.find.return_value = [
        {
            "_id": "789",
            "title": "Spider-Man Vol.2",
            "thumbnail": {"path": "https://example.com/spiderman2"},
            "description": "Another adventure",
            "prices": [{"type": "printPrice", "price": 3.5}],
        }
    ]

    response = client.get("/api/comics/series/Spider-Man")
    data = response.get_json()

    assert response.status_code == 200
    assert len(data) == 1
    assert data[0]["title"] == "Spider-Man Vol.2"
    assert data[0]["price"] == 3.5


# ---------------------------
# Test /api/users/<user_id>
# ---------------------------
@patch("App.users_collection")
def test_get_user_data(mock_users_collection, client):
    mock_users_collection.find_one.return_value = {
        "sub": "user123",
        "cart": [],
        "favorites": [],
    }

    response = client.get("/api/users/user123")
    data = response.get_json()

    assert response.status_code == 200
    assert data["sub"] == "user123"
    assert data["cart"] == []
    assert data["favorites"] == []


# ---------------------------
# Test /api/users/<user_id>/cart
# ---------------------------
@patch("App.users_collection")
def test_update_cart(mock_users_collection, client):
    payload = {"cart": [{"id": "123", "title": "Spider-Man", "price": 3.99}]}

    response = client.put("/api/users/user123/cart", json=payload)
    data = response.get_json()

    assert response.status_code == 200
    assert data["success"] is True
    assert len(data["cart"]) == 1
    assert data["cart"][0]["price"] == 3.99


# ---------------------------
# Test /api/users/<user_id>/favorites
# ---------------------------
@patch("App.users_collection")
def test_update_favorites(mock_users_collection, client):
    payload = {"favorites": [{"id": "456", "title": "Iron Man", "price": 4.99}]}

    response = client.put("/api/users/user123/favorites", json=payload)
    data = response.get_json()

    assert response.status_code == 200
    assert data["success"] is True
    assert len(data["favorites"]) == 1
    assert data["favorites"][0]["price"] == 4.99
