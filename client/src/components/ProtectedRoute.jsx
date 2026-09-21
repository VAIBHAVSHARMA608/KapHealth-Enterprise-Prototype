import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Loading State
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="text-center">

          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>

          <h2 className="text-xl font-semibold text-slate-800">
            Loading...
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Please wait while we securely load your account.
          </p>

        </div>
      </div>
    );
  }

  // Not Logged In
  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // Wrong Role
  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}