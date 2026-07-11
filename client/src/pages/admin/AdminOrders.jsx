import { useEffect, useState } from "react";
import { useAdminAuth } from "../../context/AdminAuthContext.jsx";

const STATUSES = ["placed", "confirmed", "packed", "shipped", "out_for_delivery", "delivered", "cancelled", "returned"];

export default function AdminOrders() {
  const { adminApi } = useAdminAuth();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("");

  function load() {
    adminApi.get("/orders", { params: filter ? { status: filter } : {} }).then(({ data }) => setOrders(data.orders));
  }
  useEffect(load, [adminApi, filter]);

  async function updateStatus(id, status) {
    let extra = {};
    if (status === "shipped") {
      extra.courierName = window.prompt("Courier name?") || "";
      extra.trackingId = window.prompt("Tracking ID?") || "";
    }
    await adminApi.patch(`/orders/${id}/status`, { status, ...extra });
    load();
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-medium">Orders</h1>
      <select className="input mt-4 max-w-xs" value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option value="">All statuses</option>
        {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
      </select>

      <div className="mt-6 overflow-x-auto rounded-xl2 border border-line bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-black/[0.02] text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Patient</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Update</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 font-mono">{o.orderNumber}</td>
                <td className="px-4 py-3">{o.patient?.name}</td>
                <td className="px-4 py-3">₹{o.total}</td>
                <td className="px-4 py-3">{o.paymentMethod} · {o.paymentStatus}</td>
                <td className="px-4 py-3 capitalize">{o.status.replace(/_/g, " ")}</td>
                <td className="px-4 py-3">
                  <select className="input !py-1.5 text-xs" value={o.status} onChange={(e) => updateStatus(o._id, e.target.value)}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
