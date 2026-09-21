import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  Heart,
  LogOut,
  Menu,
  Search,
  ShoppingCart,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import Logo from "./Logo.jsx";
import NotificationBell from "./NotificationBell.jsx";

const primaryLinks = [
  { label: "Find Doctors", to: "/patient/doctors" },
  { label: "Store", to: "/patient/store" },
  { label: "Lab Tests", to: "/patient/lab-tests" },
  { label: "Wellness", to: "/patient/wellness" },
  { label: "Help Center", to: "/help" },
];

function initials(name = "") {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U"
  );
}

/**
 * Uiverse-inspired navigation item:
 * - expanding corner field from the card reference
 * - restrained KapHealth green accent
 * - active state stays readable without becoming a giant pill
 */
function NavItem({ to, label, active, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={[
        "group relative isolate overflow-hidden rounded-xl px-3.5 py-2.5",
        "text-[13px] font-semibold tracking-[-0.01em]",
        "transition-[color,transform,box-shadow] duration-300 ease-out",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
        active
          ? "text-primary"
          : "text-slate-600 hover:-translate-y-px hover:text-slate-950",
      ].join(" ")}
    >
      {/* Expanding corner hover field */}
      <span
        aria-hidden="true"
        className={[
          "absolute -right-5 -top-5 -z-10 h-10 w-10 rounded-full",
          "bg-primary/[0.11] blur-[1px]",
          "transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)]",
          "group-hover:scale-[7]",
          active ? "scale-[4.5] opacity-100" : "scale-0 opacity-0",
        ].join(" ")}
      />

      {/* Fine glass highlight */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-2 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-70"
      />

      <span className="relative z-10">{label}</span>

      {/* Active / hover underline */}
      <span
        aria-hidden="true"
        className={[
          "absolute bottom-1 left-1/2 h-[2px] -translate-x-1/2 rounded-full bg-primary",
          "transition-all duration-300 ease-out",
          active
            ? "w-5 opacity-100"
            : "w-0 opacity-0 group-hover:w-4 group-hover:opacity-70",
        ].join(" ")}
      />
    </Link>
  );
}

/**
 * Tactile Uiverse-inspired action button.
 * Keeps the reference's layered border/shadow language, but uses the KapHealth palette.
 */
function GlowAction({
  children,
  className = "",
  as = "button",
  ...props
}) {
  const Tag = as;

  return (
    <Tag
      {...props}
      className={[
        "group relative isolate inline-flex items-center justify-center overflow-hidden rounded-full p-px",
        "transition-transform duration-300 hover:-translate-y-px active:translate-y-0",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
        className,
      ].join(" ")}
    >
      {/* Moving/expanding border light */}
      <span
        aria-hidden="true"
        className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-primary/40 via-emerald-300/30 to-primary/40 opacity-70 transition-all duration-500 group-hover:scale-[1.08] group-hover:opacity-100"
      />

      <span
        aria-hidden="true"
        className="absolute -left-8 top-1/2 -z-10 h-8 w-20 -translate-y-1/2 rounded-full bg-primary/30 blur-xl transition-all duration-700 group-hover:left-[70%] group-hover:bg-emerald-300/35"
      />

      <span className="relative z-10 flex w-full items-center justify-center gap-2 rounded-full border border-white/70 bg-white/72 px-3 py-2 backdrop-blur-xl">
        {children}
      </span>
    </Tag>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const dashboardPath =
    user?.role === "doctor"
      ? "/doctor/dashboard"
      : "/patient/dashboard";

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") setProfileOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const isActive = (to) =>
    location.pathname === to || location.pathname.startsWith(`${to}/`);

  const closeMenu = () => setMobileOpen(false);

  const handleLogout = async () => {
    setProfileOpen(false);
    setMobileOpen(false);
    await logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4 lg:px-6">
      <div className="mx-auto max-w-[1380px]">
        <nav
          aria-label="Primary navigation"
          className={[
            "relative flex h-[68px] items-center rounded-[1.4rem]",
            "border border-white/75 bg-white/65 px-3",
            "shadow-[0_18px_55px_rgba(15,23,42,0.10),inset_0_1px_0_rgba(255,255,255,0.9)]",
            "backdrop-blur-2xl backdrop-saturate-150",
            "sm:px-4 lg:px-5",
          ].join(" ")}
        >
          {/* Outer glass glints */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-16 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-90"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 top-1/2 h-28 w-28 -translate-y-1/2 rounded-full bg-primary/[0.06] blur-3xl"
          />

          {/* Brand */}
          <Link
            to="/"
            aria-label="Kapstone Healthcare home"
            className="relative z-10 shrink-0 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            <Logo />
          </Link>

          {/* Desktop nav */}
          <div className="ml-6 hidden items-center rounded-2xl border border-white/65 bg-white/38 p-1 backdrop-blur-xl lg:flex xl:ml-9">
            {primaryLinks.map((link) => (
              <NavItem
                key={link.to}
                to={link.to}
                label={link.label}
                active={isActive(link.to)}
              />
            ))}

            {user?.role === "patient" && (
              <NavItem
                to="/patient/appointments"
                label="Appointments"
                active={isActive("/patient/appointments")}
              />
            )}

            {user?.role === "doctor" && (
              <NavItem
                to="/doctor/dashboard"
                label="Dashboard"
                active={isActive("/doctor/dashboard")}
              />
            )}
          </div>

          {/* Desktop utilities */}
          <div className="ml-auto hidden items-center gap-1.5 lg:flex">
            {user && <NotificationBell role={user.role} />}

            {user?.role === "patient" && (
              <>
                <GlowAction
                  as={Link}
                  to="/patient/wishlist"
                  aria-label="Wishlist"
                  className="h-10 w-10"
                >
                  <Heart
                    size={17}
                    strokeWidth={1.8}
                    className="text-slate-600 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[-8deg] group-hover:text-primary"
                  />
                </GlowAction>

                <GlowAction
                  as={Link}
                  to="/patient/cart"
                  aria-label={`Cart${itemCount > 0 ? `, ${itemCount} items` : ""}`}
                  className="relative h-10 w-10"
                >
                  <ShoppingCart
                    size={17}
                    strokeWidth={1.8}
                    className="text-slate-600 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-[-5deg] group-hover:text-primary"
                  />

                  {itemCount > 0 && (
                    <span className="absolute right-0 top-0 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[8px] font-bold leading-4 text-white shadow-sm ring-2 ring-white">
                      {itemCount > 99 ? "99+" : itemCount}
                    </span>
                  )}
                </GlowAction>
              </>
            )}

            <div className="mx-1.5 h-7 w-px bg-slate-200/80" />

            {user ? (
              <div ref={profileRef} className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen((open) => !open)}
                  aria-expanded={profileOpen}
                  aria-haspopup="menu"
                  className={[
                    "group relative flex items-center gap-2 rounded-full p-px",
                    "transition-all duration-300 hover:-translate-y-px",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                  ].join(" ")}
                >
                  <span className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/30 via-emerald-300/25 to-primary/30 opacity-50 transition-transform duration-500 group-hover:scale-[1.05] group-hover:opacity-100" />

                  <span className="relative flex items-center gap-2 rounded-full border border-white/70 bg-white/72 px-1.5 py-1 backdrop-blur-xl">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#0F6E5B] to-[#147C68] text-[10px] font-bold text-white shadow-sm">
                      {user?.name ? initials(user.name) : <User size={14} />}
                    </span>

                    <span className="hidden max-w-[115px] text-left xl:block">
                      <span className="block truncate text-[11px] font-semibold text-slate-800">
                        {user?.name || "Account"}
                      </span>
                      <span className="block text-[9px] capitalize text-slate-500">
                        {user?.role || "User"}
                      </span>
                    </span>

                    <ChevronDown
                      size={13}
                      className={[
                        "mr-1 text-slate-400 transition-transform duration-300",
                        profileOpen ? "rotate-180 text-primary" : "",
                      ].join(" ")}
                    />
                  </span>
                </button>

                {profileOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-[calc(100%+10px)] w-64 overflow-hidden rounded-2xl border border-white/75 bg-white/85 p-1.5 shadow-[0_24px_70px_rgba(15,23,42,0.14)] backdrop-blur-2xl animate-scale-in"
                  >
                    <div className="rounded-xl bg-primary/[0.035] px-3 py-3">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {user?.name || "Account"}
                      </p>
                      <p className="mt-0.5 text-xs capitalize text-slate-500">
                        {user?.role || "User"} account
                      </p>
                    </div>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setProfileOpen(false);
                        navigate(dashboardPath);
                      }}
                      className="group mt-1 flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-primary/[0.06] hover:text-primary"
                    >
                      <User size={15} />
                      Dashboard
                      <ArrowIcon />
                    </button>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="group flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      <LogOut size={15} />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <GlowAction
                as={Link}
                to="/login"
                className="min-w-[104px]"
              >
                <Sparkles
                  size={14}
                  className="text-primary transition-transform duration-500 group-hover:rotate-[-15deg] group-hover:scale-110"
                />
                <span className="text-xs font-semibold text-slate-800 transition group-hover:text-primary">
                  Sign in
                </span>
              </GlowAction>
            )}
          </div>

          {/* Mobile controls */}
          <div className="ml-auto flex items-center gap-1 lg:hidden">
            {user && <NotificationBell role={user.role} />}

            {user?.role === "patient" && (
              <GlowAction
                as={Link}
                to="/patient/cart"
                aria-label="Cart"
                className="relative h-10 w-10"
              >
                <ShoppingCart size={17} className="text-slate-600" />

                {itemCount > 0 && (
                  <span className="absolute right-0 top-0 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[8px] font-bold text-white ring-2 ring-white">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </GlowAction>
            )}

            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              className={[
                "flex h-10 w-10 items-center justify-center rounded-full border border-white/70",
                "bg-white/65 text-slate-700 shadow-sm backdrop-blur-xl transition-all duration-300",
                "hover:-translate-y-px hover:bg-white/85 hover:text-primary",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
              ].join(" ")}
              aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </nav>

        {/* Mobile navigation panel */}
        {mobileOpen && (
          <div className="mt-2 overflow-hidden rounded-[1.4rem] border border-white/75 bg-white/80 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-2xl animate-scale-in lg:hidden">
            <div className="p-3">
              <div className="mb-2 flex items-center gap-2 rounded-xl border border-slate-200/70 bg-slate-50/70 px-3.5 py-2.5 text-slate-400">
                <Search size={16} />
                <span className="text-xs">Search healthcare services</span>
              </div>

              <div className="space-y-1">
                {primaryLinks.map((link) => (
                  <NavItem
                    key={link.to}
                    to={link.to}
                    label={link.label}
                    active={isActive(link.to)}
                    onClick={closeMenu}
                  />
                ))}

                {user?.role === "patient" && (
                  <>
                    <NavItem
                      to="/patient/appointments"
                      label="Appointments"
                      active={isActive("/patient/appointments")}
                      onClick={closeMenu}
                    />
                    <NavItem
                      to="/patient/orders"
                      label="Medicine Orders"
                      active={isActive("/patient/orders")}
                      onClick={closeMenu}
                    />
                    <NavItem
                      to="/patient/lab-bookings"
                      label="Lab Bookings"
                      active={isActive("/patient/lab-bookings")}
                      onClick={closeMenu}
                    />
                    <NavItem
                      to="/patient/wishlist"
                      label="Wishlist"
                      active={isActive("/patient/wishlist")}
                      onClick={closeMenu}
                    />
                    <NavItem
                      to="/patient/family"
                      label="Family Members"
                      active={isActive("/patient/family")}
                      onClick={closeMenu}
                    />
                    <NavItem
                      to="/patient/health-vault"
                      label="Health Vault"
                      active={isActive("/patient/health-vault")}
                      onClick={closeMenu}
                    />
                  </>
                )}

                {user?.role === "doctor" && (
                  <NavItem
                    to="/doctor/earnings"
                    label="Earnings"
                    active={isActive("/doctor/earnings")}
                    onClick={closeMenu}
                  />
                )}
              </div>

              <div className="mt-3 border-t border-slate-200/70 pt-3">
                {user ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        closeMenu();
                        navigate(dashboardPath);
                      }}
                      className="group flex w-full items-center gap-3 rounded-xl border border-white/70 bg-white/65 px-3.5 py-3 text-left shadow-sm backdrop-blur-xl"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#0F6E5B] to-[#147C68] text-[10px] font-bold text-white">
                        {user?.name ? initials(user.name) : <User size={14} />}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-slate-900">
                          {user?.name || "Account"}
                        </span>
                        <span className="block text-xs capitalize text-slate-500">
                          Open dashboard
                        </span>
                      </span>

                      <ArrowIcon />
                    </button>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                    >
                      <LogOut size={15} />
                      Sign out
                    </button>
                  </>
                ) : (
                  <Link
                    onClick={closeMenu}
                    to="/login"
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-300 bg-gradient-to-b from-white to-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 shadow-[0_4px_3px_#fff,0_6px_10px_rgba(148,163,184,.25)] transition hover:-translate-y-px hover:text-primary"
                  >
                    <Sparkles size={15} className="text-primary" />
                    Sign in
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function ArrowIcon() {
  return (
    <span className="ml-auto text-slate-300 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-primary">
      →
    </span>
  );
}
