import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import api from "../services/api.js";

const RELATED_PATH = {
  appointment: (id, role) => (role === "doctor" ? `/doctor/appointments/${id}` : `/patient/appointments/${id}`),
  order: (id) => `/patient/orders/${id}`,
  prescription: () => `/patient/orders`,
  labBooking: (id) => `/patient/lab-bookings/${id}`,
  doctorProfile: () => `/doctor/dashboard`,
  complaint: () => `/help/complaints`,
  payout: () => `/doctor/earnings`,
};

export default function NotificationBell({ role }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef(null);

  function load() {
    api.get("/notifications", { params: { limit: 10 } }).then(({ data }) => {
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    });
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function openNotification(n) {
    if (!n.readAt) {
      await api.patch(`/notifications/${n._id}/read`);
      setNotifications((ns) => ns.map((x) => (x._id === n._id ? { ...x, readAt: new Date() } : x)));
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    setOpen(false);
    const pathFn = n.relatedType && RELATED_PATH[n.relatedType];
    if (pathFn && n.relatedId) navigate(pathFn(n.relatedId, role));
  }

  async function markAllRead() {
    await api.patch("/notifications/read-all");
    setNotifications((ns) => ns.map((n) => ({ ...n, readAt: n.readAt || new Date() })));
    setUnreadCount(0);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-full p-2.5 text-slate-400 transition hover:bg-white/5 hover:text-primary-dark"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-white/10 bg-slate-900/90 shadow-glass backdrop-blur-2xl">
          <div className="flex items-center justify-between border-b border-white/10 p-3">
            <p className="text-sm font-semibold text-ink">Notifications</p>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs font-medium text-primary hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 && <p className="p-4 text-center text-sm text-muted">No notifications yet.</p>}
            {notifications.map((n) => (
              <button
                key={n._id}
                onClick={() => openNotification(n)}
                className={`block w-full border-b border-white/5 p-3 text-left text-sm transition hover:bg-white/5 ${!n.readAt ? "bg-primary-light/40" : ""}`}
              >
                <p className="font-medium text-ink">{n.title}</p>
                <p className="mt-0.5 line-clamp-2 text-xs text-muted">{n.message}</p>
                <p className="mt-1 text-[11px] text-muted">{new Date(n.createdAt).toLocaleString()}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
