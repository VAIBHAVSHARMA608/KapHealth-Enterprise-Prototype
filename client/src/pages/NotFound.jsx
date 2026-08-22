import { Link } from "react-router-dom";
import { Compass, Home as HomeIcon } from "lucide-react";
import Navbar from "../components/Navbar.jsx";

export default function NotFound() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Compass size={28} className="text-primary" />
        </div>
        <p className="eyebrow mt-6">404</p>
        <h1 className="font-display text-3xl font-medium">This page doesn't exist</h1>
        <p className="mt-3 max-w-md text-sm text-muted">
          The link you followed might be broken, or the page may have moved. Let's get you back on track.
        </p>
        <Link to="/" className="btn-primary mt-8">
          <HomeIcon size={16} /> Back to home
        </Link>
      </div>
    </div>
  );
}
