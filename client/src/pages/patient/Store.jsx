import { useEffect, useState, useCallback } from "react";
import { Search, ShoppingCart, Heart, ShieldCheck } from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import api from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useCart } from "../../context/CartContext.jsx";

export default function Store() {
  const { user } = useAuth();
  const { refreshCart } = useCart();

  const [categories, setCategories] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("popular");
  const [wishlistIds, setWishlistIds] = useState([]);
  const [addingId, setAddingId] = useState(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    api.get("/store/medicines/categories").then(({ data }) => setCategories(data.categories));
  }, []);

  useEffect(() => {
    if (user?.role === "patient") {
      api.get("/store/wishlist").then(({ data }) => setWishlistIds(data.medicines.map((m) => m._id)));
    }
  }, [user]);

  const load = useCallback(() => {
    const params = { sort };
    if (search) params.search = search;
    if (category) params.category = category;
    api.get("/store/medicines", { params }).then(({ data }) => {
      setMedicines(data.medicines);
      setTotal(data.total);
    });
  }, [search, category, sort]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 1800);
  }

  async function addToCart(med) {
    if (!user) return showToast("Log in to add items to your cart");
    if (med.requiresPrescription) return showToast("This item needs a prescription -- order it from your consult instead");
    setAddingId(med._id);
    try {
      await api.post("/store/cart/items", { medicineId: med._id, quantity: 1 });
      await refreshCart();
      showToast(`Added ${med.name} to cart`);
    } catch (err) {
      showToast(err.response?.data?.message || "Couldn't add to cart");
    } finally {
      setAddingId(null);
    }
  }

  async function toggleWishlist(med) {
    if (!user) return showToast("Log in to save items");
    const isSaved = wishlistIds.includes(med._id);
    try {
      if (isSaved) {
        await api.delete(`/store/wishlist/${med._id}`);
        setWishlistIds((ids) => ids.filter((id) => id !== med._id));
      } else {
        await api.post("/store/wishlist", { medicineId: med._id });
        setWishlistIds((ids) => [...ids, med._id]);
      }
    } catch {
      showToast("Something went wrong");
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-7xl px-6 py-10">
        <p className="eyebrow mb-2">KapHealth Store</p>
        <h1 className="font-display text-3xl font-medium">Everyday health essentials</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Vitamins, first aid, personal care, devices and more -- no prescription needed for these. Items marked
          "Prescription required" can only be ordered against a doctor's e-prescription.
        </p>

        {/* Search + sort */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              className="input pl-9"
              placeholder="Search vitamins, first aid, devices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="input sm:w-52" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="popular">Most popular</option>
            <option value="rating">Top rated</option>
            <option value="price_low">Price: low to high</option>
            <option value="price_high">Price: high to low</option>
            <option value="newest">Newest</option>
          </select>
        </div>

        {/* Category chips */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setCategory("")}
            className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${!category ? "border-primary bg-primary-light text-primary-dark" : "border-line text-muted hover:text-ink"}`}
          >
            All ({categories.reduce((s, c) => s + c.count, 0)})
          </button>
          {categories.map((c) => (
            <button
              key={c.name}
              onClick={() => setCategory(c.name)}
              className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${category === c.name ? "border-primary bg-primary-light text-primary-dark" : "border-line text-muted hover:text-ink"}`}
            >
              {c.name} ({c.count})
            </button>
          ))}
        </div>

        <p className="mt-4 text-xs text-muted">{total} item{total === 1 ? "" : "s"}</p>

        {/* Grid */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {medicines.map((med) => (
            <div key={med._id} className="card flex flex-col p-4">
              <div className="flex items-start justify-between gap-2">
                <span className="eyebrow">{med.category}</span>
                <button onClick={() => toggleWishlist(med)} aria-label="Save to wishlist">
                  <Heart
                    size={18}
                    className={wishlistIds.includes(med._id) ? "fill-accent text-accent" : "text-muted"}
                  />
                </button>
              </div>
              <h3 className="mt-2 font-display text-base font-medium leading-snug">{med.name}</h3>
              <p className="mt-1 line-clamp-2 text-xs text-muted">{med.description}</p>
              <div className="mt-2 flex items-center gap-2 text-xs text-muted">
                <span>{med.unit}</span>
                {med.ratingCount > 0 && <span>· ★ {med.ratingAverage.toFixed(1)} ({med.ratingCount})</span>}
              </div>
              {med.requiresPrescription && (
                <span className="mt-2 inline-flex w-fit items-center gap-1 rounded-full border border-status-pending/30 bg-status-pending/10 px-2.5 py-1 text-[11px] font-medium text-status-pending">
                  <ShieldCheck size={12} /> Prescription required
                </span>
              )}
              <div className="mt-3 flex items-end justify-between">
                <div>
                  <p className="font-mono text-lg font-semibold">₹{med.sellingPrice}</p>
                  {med.mrp > med.sellingPrice && <p className="font-mono text-xs text-muted line-through">₹{med.mrp}</p>}
                </div>
                <button
                  disabled={med.requiresPrescription || addingId === med._id}
                  onClick={() => addToCart(med)}
                  className="btn-secondary !px-3 !py-2 text-xs disabled:opacity-40"
                  title={med.requiresPrescription ? "Needs a prescription" : "Add to cart"}
                >
                  <ShoppingCart size={14} /> {addingId === med._id ? "Adding..." : "Add"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {medicines.length === 0 && <p className="mt-10 text-center text-sm text-muted">No items match your search.</p>}
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
