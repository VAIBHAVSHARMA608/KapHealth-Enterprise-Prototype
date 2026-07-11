import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Logo from "./Logo.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const dashboardPath = user?.role === "doctor" ? "/doctor/dashboard" : "/patient/doctors";

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/"><Logo /></Link>
        <div className="hidden items-center gap-6 text-sm font-medium text-muted md:flex">
          <Link to="/patient/doctors" className="hover:text-ink">Find a doctor</Link>
          <Link to="/help" className="hover:text-ink">Help & FAQs</Link>
          {user?.role === "patient" && <Link to="/patient/appointments" className="hover:text-ink">My appointments</Link>}
          {user?.role === "patient" && <Link to="/patient/orders" className="hover:text-ink">My orders</Link>}
          {user?.role === "doctor" && <Link to="/doctor/dashboard" className="hover:text-ink">My schedule</Link>}
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <button onClick={() => navigate(dashboardPath)} className="btn-ghost">
                Hi, {user.name?.split(" ")[0]}
              </button>
              <button
                onClick={async () => { await logout(); navigate("/"); }}
                className="btn-secondary !px-4 !py-2"
              >
                Log out
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-primary !px-5 !py-2.5">Log in</Link>
          )}
        </div>
      </nav>
    </header>
  );
}
