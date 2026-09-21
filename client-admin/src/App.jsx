import { Routes, Route, Navigate } from "react-router-dom";
import { AdminAuthProvider } from "./context/AdminAuthContext.jsx";

import AdminLogin from "./pages/AdminLogin.jsx";
import AdminLayout from "./pages/AdminLayout.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminDoctorApprovals from "./pages/AdminDoctorApprovals.jsx";
import AdminOrders from "./pages/AdminOrders.jsx";
import AdminComplaints from "./pages/AdminComplaints.jsx";
import AdminFaqEditor from "./pages/AdminFaqEditor.jsx";
import AdminMedicines from "./pages/AdminMedicines.jsx";
import AdminCoupons from "./pages/AdminCoupons.jsx";
import AdminLabTests from "./pages/AdminLabTests.jsx";
import AdminLabBookings from "./pages/AdminLabBookings.jsx";
import AdminPayouts from "./pages/AdminPayouts.jsx";
import AdminAnalytics from "./pages/AdminAnalytics.jsx";
import AdminWorkoutTemplates from "./pages/AdminWorkoutTemplates.jsx";
import AdminFoods from "./pages/AdminFoods.jsx";
import AdminWellnessTips from "./pages/AdminWellnessTips.jsx";

export default function App() {
  return (
    <AdminAuthProvider>
      <Routes>
        <Route path="/login" element={<AdminLogin />} />

        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="doctors" element={<AdminDoctorApprovals />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="medicines" element={<AdminMedicines />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="lab-tests" element={<AdminLabTests />} />
          <Route path="lab-bookings" element={<AdminLabBookings />} />
          <Route path="payouts" element={<AdminPayouts />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="workout-templates" element={<AdminWorkoutTemplates />} />
          <Route path="foods" element={<AdminFoods />} />
          <Route path="wellness-tips" element={<AdminWellnessTips />} />
          <Route path="complaints" element={<AdminComplaints />} />
          <Route path="faqs" element={<AdminFaqEditor />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AdminAuthProvider>
  );
}
