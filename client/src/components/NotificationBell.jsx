import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Check,
  CheckCheck,
  Clock3,
  ExternalLink,
  Loader2,
  ShieldCheck,
  X,
} from "lucide-react";
import api from "../services/api.js";

const RELATED_PATH = {
  appointment: (id, role) =>
    role === "doctor"
      ? `/doctor/appointments/${id}`
      : `/patient/appointments/${id}`,
  order: (id) => `/patient/orders/${id}`,
  prescription: () => `/patient/orders`,
  labBooking: (id) => `/patient/lab-bookings/${id}`,
  doctorProfile: () => `/doctor/dashboard`,
  complaint: () => `/help/complaints`,
  payout: () => `/doctor/earnings`,
};

function formatNotificationTime(date) {
  const value = new Date(date);
  const diff = Date.now() - value.getTime();

  if (Number.isNaN(value.getTime())) return "";

  if (diff < 60 * 1000) return "Just now";
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000));
    return `${minutes}m ago`;
  }
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    return `${hours}h ago`;
  }
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    return `${days}d ago`;
  }

  return value.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: value.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
}

function getNotificationIcon(type) {
  switch (type) {
    case "appointment":
      return "📅";
    case "order":
      return "📦";
    case "prescription":
      return "Rx";
    case "labBooking":
      return "🧪";
    case "payout":
      return "₹";
    case "complaint":
      return "!";
    default:
      return "•";
  }
}

export default function NotificationBell({ role }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState("");
  const ref = useRef(null);

  async function load({ silent = false } = {}) {
    if (!silent) setLoading(true);

    try {
      const { data } = await api.get("/notifications", {
        params: { limit: 10 },
      });

      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
      setError("");
    } catch {
      if (!silent) setError("Unable to load notifications.");
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    load();

    const interval = setInterval(() => {
      load({ silent: true });
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function onClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    }

    function onEscape(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);

    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  async function openNotification(notification) {
    if (!notification.readAt) {
      try {
        await api.patch(`/notifications/${notification._id}/read`);

        setNotifications((items) =>
          items.map((item) =>
            item._id === notification._id
              ? { ...item, readAt: new Date().toISOString() }
              : item
          )
        );

        setUnreadCount((count) => Math.max(0, count - 1));
      } catch {
        // Navigation remains available even if the read request fails.
      }
    }

    setOpen(false);

    const pathFn =
      notification.relatedType && RELATED_PATH[notification.relatedType];

    if (pathFn && notification.relatedId) {
      navigate(pathFn(notification.relatedId, role));
    }
  }

  async function markAllRead() {
    if (!unreadCount || markingAll) return;

    setMarkingAll(true);

    try {
      await api.patch("/notifications/read-all");

      const now = new Date().toISOString();

      setNotifications((items) =>
        items.map((notification) => ({
          ...notification,
          readAt: notification.readAt || now,
        }))
      );

      setUnreadCount(0);
    } finally {
      setMarkingAll(false);
    }
  }

  return (
    <div className="relative" ref={ref}>
      {/* Bell trigger */}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} unread`
            : "Notifications"
        }
        aria-expanded={open}
        aria-haspopup="dialog"
        className={[
          "group relative flex h-10 w-10 items-center justify-center rounded-xl",
          "border border-transparent text-slate-500 transition-all duration-200",
          "hover:border-white/70 hover:bg-white/70 hover:text-slate-900 hover:shadow-sm",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
          open
            ? "border-white/70 bg-white/75 text-primary shadow-sm backdrop-blur-xl"
            : "",
        ].join(" ")}
      >
        <Bell
          size={19}
          strokeWidth={1.8}
          className={[
            "transition-transform duration-300",
            open ? "rotate-[-8deg]" : "group-hover:rotate-[-8deg]",
          ].join(" ")}
        />

        {unreadCount > 0 && (
          <>
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-accent ring-2 ring-white/90" />
            <span className="absolute -right-1 -top-1 flex min-h-[17px] min-w-[17px] items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold leading-none text-white shadow-sm ring-2 ring-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          </>
        )}
      </button>

      {/* Notification popover */}
      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className={[
            "absolute right-0 top-[calc(100%+10px)] z-[100] w-[min(390px,calc(100vw-2rem))]",
            "origin-top-right overflow-hidden rounded-2xl",
            "border border-white/70 bg-white/80 shadow-[0_24px_70px_rgba(15,23,42,0.14)]",
            "backdrop-blur-2xl backdrop-saturate-150",
            "animate-scale-in",
          ].join(" ")}
        >
          {/* Popover header */}
          <div className="border-b border-slate-200/70 px-4 py-3.5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold tracking-tight text-slate-900">
                    Notifications
                  </h3>

                  {unreadCount > 0 && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                <p className="mt-0.5 text-[11px] text-slate-500">
                  Updates from your Kapstone account
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                aria-label="Close notifications"
              >
                <X size={15} />
              </button>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                disabled={markingAll}
                className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary transition hover:text-primary/80 disabled:opacity-50"
              >
                {markingAll ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <CheckCheck size={13} />
                )}
                Mark all as read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div className="max-h-[420px] overflow-y-auto scrollbar-thin">
            {loading ? (
              <div className="space-y-1 p-2">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="flex gap-3 rounded-xl p-3"
                  >
                    <div className="h-9 w-9 shrink-0 animate-pulse rounded-xl bg-slate-200" />
                    <div className="min-w-0 flex-1 space-y-2 py-1">
                      <div className="h-3 w-3/5 animate-pulse rounded bg-slate-200" />
                      <div className="h-2.5 w-11/12 animate-pulse rounded bg-slate-100" />
                      <div className="h-2 w-1/4 animate-pulse rounded bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="px-5 py-10 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-500">
                  <Bell size={18} />
                </div>
                <p className="mt-3 text-sm font-medium text-slate-800">
                  Notifications unavailable
                </p>
                <p className="mt-1 text-xs text-slate-500">{error}</p>
                <button
                  type="button"
                  onClick={() => load()}
                  className="mt-3 text-xs font-semibold text-primary hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-400">
                  <Bell size={20} strokeWidth={1.7} />
                </div>

                <p className="mt-3 text-sm font-semibold text-slate-800">
                  All caught up
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  You have no new notifications right now.
                </p>
              </div>
            ) : (
              notifications.map((notification) => {
                const unread = !notification.readAt;
                const hasDestination =
                  notification.relatedType &&
                  RELATED_PATH[notification.relatedType] &&
                  notification.relatedId;

                return (
                  <button
                    key={notification._id}
                    type="button"
                    onClick={() => openNotification(notification)}
                    className={[
                      "group relative flex w-full gap-3 border-b border-slate-100/80 px-4 py-3.5 text-left",
                      "transition-all duration-200 focus:outline-none focus-visible:bg-primary/5",
                      unread
                        ? "bg-primary/[0.035] hover:bg-primary/[0.07]"
                        : "bg-transparent hover:bg-slate-50/80",
                    ].join(" ")}
                  >
                    {/* Unread accent */}
                    {unread && (
                      <span className="absolute bottom-3 left-0 top-3 w-0.5 rounded-r-full bg-primary" />
                    )}

                    <div
                      className={[
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold",
                        unread
                          ? "border border-primary/10 bg-primary/10 text-primary"
                          : "border border-slate-200 bg-slate-50 text-slate-500",
                      ].join(" ")}
                    >
                      {getNotificationIcon(notification.relatedType)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p
                          className={[
                            "line-clamp-1 text-[13px] leading-5",
                            unread
                              ? "font-semibold text-slate-900"
                              : "font-medium text-slate-700",
                          ].join(" ")}
                        >
                          {notification.title}
                        </p>

                        {unread && (
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        )}
                      </div>

                      <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-slate-500">
                        {notification.message}
                      </p>

                      <div className="mt-2 flex items-center gap-2 text-[10px] font-medium text-slate-400">
                        <Clock3 size={11} />
                        {formatNotificationTime(notification.createdAt)}

                        {unread && (
                          <>
                            <span className="h-0.5 w-0.5 rounded-full bg-slate-300" />
                            <span className="text-primary">Unread</span>
                          </>
                        )}

                        {hasDestination && (
                          <>
                            <span className="ml-auto inline-flex items-center gap-1 text-slate-400 transition group-hover:text-primary">
                              View
                              <ExternalLink size={10} />
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          {!loading && !error && notifications.length > 0 && (
            <div className="border-t border-slate-200/70 bg-white/45 px-4 py-2.5">
              <div className="flex items-center justify-center gap-1.5 text-[10px] font-medium text-slate-400">
                <ShieldCheck size={12} className="text-primary/70" />
                Kapstone secure notifications
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
