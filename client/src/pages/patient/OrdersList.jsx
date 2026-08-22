import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar.jsx";
import StatusBadge from "../../components/StatusBadge.jsx";
import api from "../../services/api.js";

const TONE = {
  placed: "pending", confirmed: "success", packed: "success", shipped: "processing",
  out_for_delivery: "processing", delivered: "success", cancelled: "danger", returned: "gray",
};

export default function OrdersList() {
  const [orders, setOrders] = useState([]);
  useEffect(() => { api.get("/orders").then(({ data }) => setOrders(data.orders)); }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-2xl px-6 py-10">
        <p className="eyebrow mb-2">My orders</p>
        <h1 className="font-display text-2xl font-medium">Track your medicines</h1>
        <div className="mt-6 space-y-3">
          {orders.length === 0 && <p className="text-muted">No orders yet.</p>}
          {orders.map((o) => (
            <Link key={o._id} to={`/patient/orders/${o._id}`} className="card flex items-center justify-between p-4">
              <div>
                <p className="font-mono text-sm font-medium">{o.orderNumber}</p>
                <p className="text-xs text-muted">{new Date(o.createdAt).toLocaleDateString()} · ₹{o.total}</p>
              </div>
              <StatusBadge tone={TONE[o.status]}>{o.status.replace(/_/g, " ")}</StatusBadge>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
