import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut, ShoppingBag, ShoppingCart, Heart } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import Logo from "./Logo.jsx";
import NotificationBell from "./NotificationBell.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);

  const dashboardPath =
    user?.role === "doctor"
      ? "/doctor/dashboard"
      : "/patient/dashboard";

  const closeMenu = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-2xl">

      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">

        <Link to="/" className="shrink-0">
          <Logo />
        </Link>

        {/* Desktop */}

        <div className="hidden items-center gap-8 lg:flex">

          <Link
            to="/patient/doctors"
            className="text-sm font-medium text-slate-300 transition hover:text-primary-dark"
          >
            Find Doctors
          </Link>

          <Link
            to="/patient/store"
            className="text-sm font-medium text-slate-300 transition hover:text-primary-dark"
          >
            Store
          </Link>

          <Link
            to="/patient/lab-tests"
            className="text-sm font-medium text-slate-300 transition hover:text-primary-dark"
          >
            Lab Tests
          </Link>

          <Link
            to="/patient/wellness"
            className="text-sm font-medium text-slate-300 transition hover:text-primary-dark"
          >
            Wellness
          </Link>

          <Link
            to="/help"
            className="text-sm font-medium text-slate-300 transition hover:text-primary-dark"
          >
            Help Center
          </Link>

          <Link
            to="/showcase"
            className="text-sm font-medium text-slate-300 transition hover:text-primary-dark"
          >
            Showcase
          </Link>

          {user?.role === "patient" && (
            <>
              <Link
                to="/patient/appointments"
                className="text-sm font-medium text-slate-300 hover:text-primary-dark"
              >
                Appointments
              </Link>

              <Link
                to="/patient/orders"
                className="text-sm font-medium text-slate-300 hover:text-primary-dark"
              >
                Medicine Orders
              </Link>
            </>
          )}

          {user?.role === "doctor" && (
            <Link
              to="/doctor/dashboard"
              className="text-sm font-medium text-slate-300 hover:text-primary-dark"
            >
              Dashboard
            </Link>
          )}

        </div>

        {/* Right */}

        <div className="hidden items-center gap-3 lg:flex">

          {user && <NotificationBell role={user.role} />}

          {user?.role === "patient" && (
            <>
              <Link
                to="/patient/wishlist"
                className="rounded-full p-2.5 text-slate-400 transition hover:bg-white/5 hover:text-primary-dark"
                aria-label="Wishlist"
              >
                <Heart size={20} />
              </Link>

              <Link
                to="/patient/cart"
                className="relative rounded-full p-2.5 text-slate-400 transition hover:bg-white/5 hover:text-primary-dark"
                aria-label="Cart"
              >
                <ShoppingCart size={20} />
                {itemCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
                    {itemCount}
                  </span>
                )}
              </Link>
            </>
          )}

          {user ? (
            <>
              <button
  onClick={() => navigate(dashboardPath)}
  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-white/10"
>
  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 text-base font-bold text-white">
    {user?.name
      ? user.name.charAt(0).toUpperCase()
      : <User size={18} />}
  </div>

  <div className="text-left">
    <p className="text-[11px] uppercase tracking-wider text-slate-500">
      Welcome
    </p>

    <p className="max-w-[150px] truncate text-sm font-semibold text-white">
      {user?.name || "Guest"}
    </p>
  </div>
</button>

              <button
                onClick={async () => {
                  await logout();
                  navigate("/");
                }}
                className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-white transition hover:bg-red-600"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-xl bg-primary px-6 py-3 font-medium text-white transition hover:scale-105 hover:shadow-lg"
            >
              Login
            </Link>
          )}

        </div>

        {/* Mobile */}

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 lg:hidden"
        >
          {mobileOpen ? <X /> : <Menu />}
        </button>

      </nav>

      {/* Mobile Menu */}

      {mobileOpen && (

        <div className="border-t border-white/10 bg-slate-950/95 backdrop-blur-2xl lg:hidden">

          <div className="flex flex-col gap-1 p-5">

            <Link
              onClick={closeMenu}
              to="/patient/doctors"
              className="rounded-lg px-3 py-3 text-slate-300 hover:bg-white/5 hover:text-white"
            >
              Find Doctors
            </Link>

            <Link
              onClick={closeMenu}
              to="/patient/store"
              className="rounded-lg px-3 py-3 text-slate-300 hover:bg-white/5 hover:text-white"
            >
              Store
            </Link>

            <Link
              onClick={closeMenu}
              to="/patient/lab-tests"
              className="rounded-lg px-3 py-3 text-slate-300 hover:bg-white/5 hover:text-white"
            >
              Lab Tests
            </Link>

            <Link
              onClick={closeMenu}
              to="/patient/wellness"
              className="rounded-lg px-3 py-3 text-slate-300 hover:bg-white/5 hover:text-white"
            >
              Wellness
            </Link>

            <Link
              onClick={closeMenu}
              to="/help"
              className="rounded-lg px-3 py-3 text-slate-300 hover:bg-white/5 hover:text-white"
            >
              Help Center
            </Link>

            <Link
              onClick={closeMenu}
              to="/showcase"
              className="rounded-lg px-3 py-3 text-slate-300 hover:bg-white/5 hover:text-white"
            >
              Showcase
            </Link>

            {user?.role === "patient" && (
              <>
                <Link
                  onClick={closeMenu}
                  to="/patient/cart"
                  className="flex items-center justify-between rounded-lg px-3 py-3 text-slate-300 hover:bg-white/5 hover:text-white"
                >
                  Cart {itemCount > 0 && <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-white">{itemCount}</span>}
                </Link>

                <Link
                  onClick={closeMenu}
                  to="/patient/wishlist"
                  className="rounded-lg px-3 py-3 text-slate-300 hover:bg-white/5 hover:text-white"
                >
                  Wishlist
                </Link>
              </>
            )}

            {user?.role === "patient" && (
              <>
                <Link
                  onClick={closeMenu}
                  to="/patient/dashboard"
                  className="rounded-lg px-3 py-3 text-slate-300 hover:bg-white/5 hover:text-white"
                >
                  Dashboard
                </Link>

                <Link
                  onClick={closeMenu}
                  to="/patient/appointments"
                  className="rounded-lg px-3 py-3 text-slate-300 hover:bg-white/5 hover:text-white"
                >
                  My Appointments
                </Link>

                <Link
                  onClick={closeMenu}
                  to="/patient/orders"
                  className="rounded-lg px-3 py-3 text-slate-300 hover:bg-white/5 hover:text-white"
                >
                  Medicine Orders
                </Link>

                <Link
                  onClick={closeMenu}
                  to="/patient/lab-bookings"
                  className="rounded-lg px-3 py-3 text-slate-300 hover:bg-white/5 hover:text-white"
                >
                  Lab Bookings
                </Link>

                <Link
                  onClick={closeMenu}
                  to="/patient/family"
                  className="rounded-lg px-3 py-3 text-slate-300 hover:bg-white/5 hover:text-white"
                >
                  Family Members
                </Link>

                <Link
                  onClick={closeMenu}
                  to="/patient/health-vault"
                  className="rounded-lg px-3 py-3 text-slate-300 hover:bg-white/5 hover:text-white"
                >
                  Health Vault
                </Link>
              </>
            )}

            {user?.role === "doctor" && (
              <>
                <Link
                  onClick={closeMenu}
                  to="/doctor/dashboard"
                  className="rounded-lg px-3 py-3 text-slate-300 hover:bg-white/5 hover:text-white"
                >
                  Dashboard
                </Link>

                <Link
                  onClick={closeMenu}
                  to="/doctor/earnings"
                  className="rounded-lg px-3 py-3 text-slate-300 hover:bg-white/5 hover:text-white"
                >
                  Earnings
                </Link>
              </>
            )}

            <hr className="my-3" />

            {user ? (
              <>
                <button
                  onClick={() => {
                    closeMenu();
                    navigate(dashboardPath);
                  }}
                  className="rounded-xl border border-white/10 px-4 py-3 text-left text-slate-200"
                >
                  {user.name}
                </button>

                <button
                  onClick={async () => {
                    closeMenu();
                    await logout();
                    navigate("/");
                  }}
                  className="mt-2 rounded-xl bg-red-500 px-4 py-3 text-white"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                onClick={closeMenu}
                to="/login"
                className="rounded-xl bg-primary px-4 py-3 text-center text-white"
              >
                Login
              </Link>
            )}

          </div>

        </div>

      )}

    </header>
  );
}