import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/auth/Login.jsx";
import Help from "./pages/Help.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";

import PatientOnboarding from "./pages/patient/PatientOnboarding.jsx";
import DoctorList from "./pages/patient/DoctorList.jsx";
import DoctorProfileBook from "./pages/patient/DoctorProfileBook.jsx";
import MyAppointments from "./pages/patient/MyAppointments.jsx";
import AppointmentDetail from "./pages/patient/AppointmentDetail.jsx";
import ConsultRoom from "./pages/patient/ConsultRoom.jsx";
import PrescriptionView from "./pages/patient/PrescriptionView.jsx";
import OrderMedicines from "./pages/patient/OrderMedicines.jsx";
import OrdersList from "./pages/patient/OrdersList.jsx";
import TrackOrder from "./pages/patient/TrackOrder.jsx";

import DoctorOnboarding from "./pages/doctor/DoctorOnboarding.jsx";
import DoctorDashboard from "./pages/doctor/DoctorDashboard.jsx";
import DoctorConsultRoom from "./pages/doctor/DoctorConsultRoom.jsx";

import AdminLogin from "./pages/admin/AdminLogin.jsx";
import AdminLayout from "./pages/admin/AdminLayout.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminDoctorApprovals from "./pages/admin/AdminDoctorApprovals.jsx";
import AdminOrders from "./pages/admin/AdminOrders.jsx";
import AdminComplaints from "./pages/admin/AdminComplaints.jsx";
import AdminFaqEditor from "./pages/admin/AdminFaqEditor.jsx";

const ADMIN_ROUTE_SECRET = import.meta.env.VITE_ADMIN_ROUTE_SECRET || "kap-ops-9f2a1c";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/help" element={<Help />} />

      {/* ---- Patient flow ---- */}
      <Route path="/patient/onboarding" element={<ProtectedRoute role="patient"><PatientOnboarding /></ProtectedRoute>} />
      <Route path="/patient/doctors" element={<DoctorList />} />
      <Route path="/patient/doctors/:doctorId" element={<DoctorProfileBook />} />
      <Route path="/patient/appointments" element={<ProtectedRoute role="patient"><MyAppointments /></ProtectedRoute>} />
      <Route path="/patient/appointments/:id" element={<ProtectedRoute role="patient"><AppointmentDetail /></ProtectedRoute>} />
      <Route path="/patient/consult/:id" element={<ProtectedRoute role="patient"><ConsultRoom /></ProtectedRoute>} />
      <Route path="/patient/prescriptions/:id" element={<ProtectedRoute role="patient"><PrescriptionView /></ProtectedRoute>} />
      <Route path="/patient/order/:prescriptionId" element={<ProtectedRoute role="patient"><OrderMedicines /></ProtectedRoute>} />
      <Route path="/patient/orders" element={<ProtectedRoute role="patient"><OrdersList /></ProtectedRoute>} />
      <Route path="/patient/orders/:id" element={<ProtectedRoute role="patient"><TrackOrder /></ProtectedRoute>} />

      {/* ---- Doctor flow ---- */}
      <Route path="/doctor/onboarding" element={<ProtectedRoute role="doctor"><DoctorOnboarding /></ProtectedRoute>} />
      <Route path="/doctor/dashboard" element={<ProtectedRoute role="doctor"><DoctorDashboard /></ProtectedRoute>} />
      <Route path="/doctor/consult/:id" element={<ProtectedRoute role="doctor"><DoctorConsultRoom /></ProtectedRoute>} />

      {/* ---- Hidden admin console ---- */}
      {/* Deliberately not linked from any nav/menu -- see server/src/middleware/adminGate.js
          for the actual security boundary. This unusual path only avoids advertising it. */}
      <Route path={`/${ADMIN_ROUTE_SECRET}/login`} element={<AdminLogin />} />
      <Route path={`/${ADMIN_ROUTE_SECRET}`} element={<AdminLayout />}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="doctors" element={<AdminDoctorApprovals />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="complaints" element={<AdminComplaints />} />
        <Route path="faqs" element={<AdminFaqEditor />} />
      </Route>

      <Route path="*" element={<Home />} />
    </Routes>
  );
}
