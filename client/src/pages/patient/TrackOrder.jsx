import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle2, Circle, Star } from "lucide-react";
import Navbar from "../../components/Navbar.jsx";
import api from "../../services/api.js";

const TIMELINE_STEPS = ["placed", "confirmed", "packed", "shipped", "out_for_delivery", "delivered"];
const LABELS = {
  placed: "Order placed", confirmed: "Confirmed", packed: "Packed",
  shipped: "Shipped", out_for_delivery: "Out for delivery", delivered: "Delivered",
};

export default function TrackOrder() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewed, setReviewed] = useState(false);

  useEffect(() => { api.get(`/orders/${id}`).then(({ data }) => setOrder(data.order)); }, [id]);

  async function submitReview(e) {
    e.preventDefault();
    await api.post("/reviews", { targetType: "order", targetId: order._id, rating, comment });
    setReviewed(true);
  }

  if (!order) return <div className="min-h-screen"><Navbar /><p className="p-10 text-muted">Loading order...</p></div>;

  const currentIdx = TIMELINE_STEPS.indexOf(order.status);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto max-w-2xl px-6 py-10">
        <p className="eyebrow mb-2">Order {order.orderNumber}</p>
        <h1 className="font-display text-2xl font-medium">Tracking your medicines</h1>

        <div className="card mt-6 p-6">
          {order.status === "cancelled" || order.status === "returned" ? (
            <p className="text-sm text-red-600">This order was {order.status}.</p>
          ) : (
            <div className="space-y-5">
              {TIMELINE_STEPS.map((step, i) => (
                <div key={step} className="flex items-start gap-3">
                  {i <= currentIdx ? <CheckCircle2 className="text-primary" size={20} /> : <Circle className="text-line" size={20} />}
                  <div>
                    <p className={`text-sm font-medium ${i <= currentIdx ? "text-ink" : "text-muted"}`}>{LABELS[step]}</p>
                    {i === currentIdx && order.trackingId && (
                      <p className="font-mono text-xs text-muted">Tracking ID: {order.trackingId} {order.courierName ? `· ${order.courierName}` : ""}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card mt-6 p-6">
          <h2 className="mb-3 font-display text-lg font-medium">Items</h2>
          {order.items.map((it, i) => (
            <div key={i} className="flex justify-between border-b border-line py-2 text-sm last:border-0">
              <span>{it.name} × {it.quantity}</span>
              <span>₹{it.unitPrice * it.quantity}</span>
            </div>
          ))}
          <div className="mt-2 flex justify-between border-t border-line pt-2 text-sm font-semibold"><span>Total</span><span>₹{order.total}</span></div>
          <p className="mt-2 text-xs text-muted">Payment: {order.paymentMethod === "cod" ? "Cash on delivery" : "Paid online"} · {order.paymentStatus}</p>
        </div>

        {order.status === "delivered" && !reviewed && !order.review && (
          <form onSubmit={submitReview} className="card mt-6 p-6">
            <h2 className="font-display text-lg font-medium">Rate this delivery</h2>
            <div className="mt-3 flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button type="button" key={n} onClick={() => setRating(n)}>
                  <Star size={22} className={n <= rating ? "fill-amber-500 text-amber-500" : "text-line"} />
                </button>
              ))}
            </div>
            <textarea className="input mt-3" rows={3} placeholder="Optional feedback" value={comment} onChange={(e) => setComment(e.target.value)} />
            <button className="btn-primary mt-3 w-full">Submit review</button>
          </form>
        )}
        {reviewed && <p className="mt-6 text-center text-sm text-primary">Thanks for your feedback!</p>}
      </div>
    </div>
  );
}
