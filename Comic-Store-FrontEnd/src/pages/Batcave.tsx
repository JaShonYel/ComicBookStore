import React, { useEffect, useState, ChangeEvent } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

type InventoryItem = {
  id: string;
  title: string;
  price: number;
  image: string;
  description: string;
};

export default function Batcave() {
  const [message, setMessage] = useState<string | null>(null);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({ title: "", price: 2.0, image: "", description: "" });
  const [searchQuery, setSearchQuery] = useState<string>("");

  const API_URL = (process.env.REACT_APP_API_URL as string) || "http://localhost:5000";

  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      navigate("/", { replace: true });
      return;
    }

    const init = async () => {
      try {
        const token = await getAccessTokenSilently();
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

  const userId = user.sub;
  const res = await axios.get(`http://localhost:5000/api/batcave/${userId}`);
        if (!res.data || !res.data.message) {
          navigate("/", { replace: true });
          return;
        }
        setMessage(res.data.message);
        await loadInventory();
      } catch (err) {
        navigate("/", { replace: true });
      }
    };

    init();
  }, [isAuthenticated, isLoading, user, getAccessTokenSilently, navigate]);

  async function loadInventory() {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get("http://localhost:5000/api/comics?limit=200");
      const results = res.data.results || res.data || [];
      const parsePrice = (raw: any) => {
        if (raw == null) return 2.0;
        if (typeof raw === "number") return Math.round(raw * 100) / 100;
  const cleaned = String(raw).replace(/[^0-9.-]+/g, "");
        const p = parseFloat(cleaned);
        if (Number.isNaN(p) || p === 0) return 2.0;
        return Math.round(p * 100) / 100;
      };

      const normalized = results.map((c: any) => ({
        id: String(c.id ?? c._id ?? "").trim(),
        title: c.title || "",
        price: parsePrice(c.price ?? c.price_formatted ?? c.cost),
        image: c.img || c.image || "",
        description: c.description || "",
      }));
      console.debug("Batcave: loaded inventory sample:", normalized.slice(0, 5).map((i: any) => ({ id: i.id, title: i.title })));
      setInventory(normalized);
    } catch (err: any) {
      setError(err.response.data.error || err.response.data.message || err.message || "Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }

  function handleFieldChange(id: string, field: keyof InventoryItem, value: string | number) {
    setInventory((prev) => prev.map((it) => (it.id === id ? { ...it, [field]: value } : it)));
  }

  async function saveItem(item: InventoryItem) {
    setSavingId(item.id);
    setError(null);
    try {
  const parsed = Number(item.price);
  const payload: InventoryItem = { ...item, price: Number.isNaN(parsed) || parsed === 0 ? 2.0 : parsed };
  await axios.put(`http://localhost:5000/api/admin/inventory/${item.id}`, payload);
      await loadInventory();
    } catch (err: any) {
      setError(err.response.data.error || err.response.data.message || err.message || "Failed to save item");
    } finally {
      setSavingId(null);
    }
  }

  async function deleteItem(id: string) {
    if (!window.confirm("Delete this item?")) return;
    setError(null);
    try {
  await axios.delete(`http://localhost:5000/api/admin/inventory/${id}`);
      setInventory((prev) => prev.filter((it) => it.id !== id));
    } catch (err: any) {
      setError(err.response.data.error || err.response.data.message || err.message || "Failed to delete item");
    }
  }

  async function addItem() {
    if (!newItem.title || newItem.title.trim() === "") {
      setError("Title is required");
      return;
    }
    if (newItem.price == null || Number.isNaN(newItem.price)) {
      setError("Price must be a number");
      return;
    }

    setError(null);
    try {
  const priceVal = Number(newItem.price);
  const finalPrice = Number.isNaN(priceVal) || priceVal === 0 ? 2.0 : priceVal;
  const toSend = { ...newItem, price: finalPrice };
  const res = await axios.post(`http://localhost:5000/api/admin/inventory`, toSend);
      const created: InventoryItem = res.data;
  setInventory((prev) => [{ ...created, price: finalPrice }, ...prev]);
  setNewItem({ title: "", price: 2.0, image: "", description: "" });
    } catch (err: any) {
      setError(err.response.data.error || err.response.data.message || err.message || "Failed to add item");
    }
  }

  function handleSearchChange(e: ChangeEvent<HTMLInputElement>) {
    setSearchQuery(e.target.value);
  }

  const handleSearch = async (e: React.FormEvent, newPage = 1) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/api/comics?search=${encodeURIComponent(searchQuery)}: ""}`
      );
      const data = await res.json();
      const safeComics = (data.results ?? []).map((c: any) => ({
        ...c,
        price: c.price != null && Number(c.price) > 0 ? Number(c.price) : 2.0
      }));
      setInventory(safeComics);
    } catch (error) {
      console.error("Error fetching comics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div style={{ padding: "2rem" }}>
      {message && (
        <>
          <h1>{message}</h1>

          <section style={{ margin: "1rem 0", padding: "1rem", border: "1px solid #ddd" }}>
            <h2 style={{ marginTop: 0 }}>Add New Item</h2>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <input
                placeholder="Title"
                value={newItem.title}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewItem((s) => ({ ...s, title: e.target.value }))}
                style={{ padding: "0.5rem", minWidth: 200 }}
              />
              <input
                placeholder="Price"
                type="number"
                value={newItem.price as any}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewItem((s) => ({ ...s, price: Number(e.target.value) }))}
                style={{ padding: "0.5rem", width: 100 }}
              />
              <input
                placeholder="Image URL (optional)"
                value={newItem.image}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewItem((s) => ({ ...s, image: e.target.value }))}
                style={{ padding: "0.5rem", minWidth: 250 }}
              />
              <input
                placeholder="Description (optional)"
                value={newItem.description}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewItem((s) => ({ ...s, description: e.target.value }))}
                style={{ padding: "0.5rem", minWidth: 300 }}
              />
              <button onClick={addItem} style={{ padding: "0.5rem 1rem" }}>
                Add Item
              </button>
            </div>
          </section>

          <section style={{ marginTop: "1rem" }}>
            <h2 style={{ marginTop: 0 }}>Inventory</h2>
            {error && <div style={{ color: "red", marginBottom: "0.5rem" }}>{error}</div>}
            <div style={{ marginBottom: "0.5rem", display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
              <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <input
                  placeholder="Search by title or description"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  style={{ padding: "0.5rem", minWidth: 260 }}
                />
                <button type="submit" style={{ padding: "0.4rem 0.6rem" }}>
                  Search
                </button>
                <button type="button" onClick={() => { setSearchQuery(""); }} style={{ padding: "0.4rem 0.6rem" }}>
                  Clear
                </button>
              </form>
              <div>
                <button onClick={loadInventory} disabled={loading} style={{ padding: "0.4rem 0.6rem" }}>
                  {loading ? "Loading..." : "Reload"}
                </button>
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ borderBottom: "1px solid #ddd", textAlign: "left", padding: "0.5rem" }}>Title</th>
                    <th style={{ borderBottom: "1px solid #ddd", textAlign: "left", padding: "0.5rem" }}>Price</th>
                    <th style={{ borderBottom: "1px solid #ddd", textAlign: "left", padding: "0.5rem" }}>Image URL</th>
                    <th style={{ borderBottom: "1px solid #ddd", textAlign: "left", padding: "0.5rem" }}>Description</th>
                    <th style={{ borderBottom: "1px solid #ddd", padding: "0.5rem" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: "1rem", color: "#666" }}>
                        No items found.
                      </td>
                    </tr>
                  )}
                  {(() => {
                    const q = searchQuery.trim().toLowerCase();
                    const filtered = q
                      ? inventory.filter((it) => (it.title || "").toLowerCase().includes(q) || (it.description || "").toLowerCase().includes(q) || (it.id || "").toLowerCase().includes(q))
                      : inventory;

                    if (inventory.length > 0 && filtered.length === 0) {
                      return (
                        <tr key="no-match">
                          <td colSpan={5} style={{ padding: "1rem", color: "#666" }}>
                            No items match your search.
                          </td>
                        </tr>
                      );
                    }

                    return filtered.map((it) => (
                      <tr key={it.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                        <td style={{ padding: "0.5rem" }}>
                          <input
                            value={it.title}
                            onChange={(e) => handleFieldChange(it.id, "title", e.target.value)}
                            style={{ width: "100%", padding: "0.35rem" }}
                          />
                        </td>
                        <td style={{ padding: "0.5rem", width: 120 }}>
                          <input
                            type="number"
                            value={it.price as any}
                            onChange={(e) => handleFieldChange(it.id, "price", Number(e.target.value))}
                            style={{ width: "100%", padding: "0.35rem" }}
                          />
                        </td>
                        <td style={{ padding: "0.5rem" }}>
                          <input
                            value={it.image || ""}
                            onChange={(e) => handleFieldChange(it.id, "image", e.target.value)}
                            style={{ width: "100%", padding: "0.35rem" }}
                          />
                        </td>
                        <td style={{ padding: "0.5rem" }}>
                          <input
                            value={it.description || ""}
                            onChange={(e) => handleFieldChange(it.id, "description", e.target.value)}
                            style={{ width: "100%", padding: "0.35rem" }}
                          />
                        </td>
                        <td style={{ padding: "0.5rem", whiteSpace: "nowrap" }}>
                          <button
                            onClick={() => saveItem(it)}
                            disabled={savingId === it.id}
                            style={{ marginRight: 8, padding: "0.35rem 0.6rem" }}
                          >
                            {savingId === it.id ? "Saving..." : "Save"}
                          </button>
                          <button onClick={() => deleteItem(it.id)} style={{ padding: "0.35rem 0.6rem" }}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
