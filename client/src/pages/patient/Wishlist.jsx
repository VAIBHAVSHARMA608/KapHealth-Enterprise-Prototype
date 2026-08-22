import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import api from "../../services/api.js";
import { useCart } from "../../context/CartContext.jsx";

export default function Wishlist() {
  const { refreshCart } = useCart();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  function load() {
    api.get("/store/wishlist").then(({ data }) => {
      setMedicines(data.medicines);
      setLoading(false);
    });
  }

  useEffect(load, []);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 1800);
  }

  async function remove(id) {
    await api.delete(`/store/wishlist/${id}`);
    setMedicines((ms) => ms.filter((m) => m._id !== id));
  }

  async function addToCart(med) {
    if (med.requiresPrescription) return showToast("This item needs a prescription");
    await api.post("/store/cart/items", { medicineId: med._id, quantity: 1 });
    await refreshCart();
    showToast(`Added ${med.name} to cart`);
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-4xl px-6 py-10">
        <p className="eyebrow mb-2">Saved for later</p>
        <h1 className="font-display text-2xl font-medium">Your wishlist</h1>

        {!loading && medicines.length === 0 && (
          <div className="card mt-6 p-8 text-center">
            <Heart size={28} className="mx-auto text-muted" />
            <p className="mt-3 text-sm text-muted">Nothing saved yet.</p>
            <Link to="/patient/store" className="btn-primary mt-4 inline-flex">Browse the store</Link>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {medicines.map((med) => (
            <div key={med._id} className="card p-4">
              <div className="flex items-start justify-between gap-2">
                <span className="eyebrow">{med.category}</span>
                <button onClick={() => remove(med._id)} className="text-muted hover:text-red-600"><Trash2 size={16} /></button>
              </div>
              <h3 className="mt-2 font-display text-base font-medium">{med.name}</h3>
              <p className="mt-1 font-mono text-sm font-semibold">₹{med.sellingPrice}</p>
              <button
                disabled={med.requiresPrescription}
                onClick={() => addToCart(med)}
                className="btn-secondary mt-3 w-full !py-2 text-xs disabled:opacity-40"
              >
                <ShoppingCart size={14} /> {med.requiresPrescription ? "Needs prescription" : "Add to cart"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
