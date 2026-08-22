import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home.jsx";
import Login from "./pages/auth/Login.jsx";
import Help from "./pages/Help.jsx";
import Showcase from "./pages/Showcase.jsx";
import NotFound from "./pages/NotFound.jsx";

import { ProtectedRoute } from "./components/ProtectedRoute.jsx";

/* ---------------- Patient ---------------- */

const PatientOnboarding = lazy(() => import("./pages/patient/PatientOnboarding.jsx"));
const PatientDashboard = lazy(() => import("./pages/patient/PatientDashboard.jsx"));
const DoctorList = lazy(() => import("./pages/patient/DoctorList.jsx"));
const DoctorProfileBook = lazy(() => import("./pages/patient/DoctorProfileBook.jsx"));
const MyAppointments = lazy(() => import("./pages/patient/MyAppointments.jsx"));
const AppointmentDetail = lazy(() => import("./pages/patient/AppointmentDetail.jsx"));
const ConsultRoom = lazy(() => import("./pages/patient/ConsultRoom.jsx"));
const PrescriptionView = lazy(() => import("./pages/patient/PrescriptionView.jsx"));
const OrderMedicines = lazy(() => import("./pages/patient/OrderMedicines.jsx"));
const OrdersList = lazy(() => import("./pages/patient/OrdersList.jsx"));
const TrackOrder = lazy(() => import("./pages/patient/TrackOrder.jsx"));
const Store = lazy(() => import("./pages/patient/Store.jsx"));
const Cart = lazy(() => import("./pages/patient/Cart.jsx"));
const Checkout = lazy(() => import("./pages/patient/Checkout.jsx"));
const Wishlist = lazy(() => import("./pages/patient/Wishlist.jsx"));
const LabTests = lazy(() => import("./pages/patient/LabTests.jsx"));
const LabTestCheckout = lazy(() => import("./pages/patient/LabTestCheckout.jsx"));
const LabBookings = lazy(() => import("./pages/patient/LabBookings.jsx"));
const LabBookingDetail = lazy(() => import("./pages/patient/LabBookingDetail.jsx"));
const Family = lazy(() => import("./pages/patient/Family.jsx"));
const HealthVault = lazy(() => import("./pages/patient/HealthVault.jsx"));
const WellnessDashboard = lazy(() => import("./pages/patient/WellnessDashboard.jsx"));
const VitalsTracker = lazy(() => import("./pages/patient/VitalsTracker.jsx"));
const DietPlanner = lazy(() => import("./pages/patient/DietPlanner.jsx"));
const CalorieCounter = lazy(() => import("./pages/patient/CalorieCounter.jsx"));
const WorkoutPlanner = lazy(() => import("./pages/patient/WorkoutPlanner.jsx"));
const AiReviewer = lazy(() => import("./pages/patient/AiReviewer.jsx"));
const WellnessTips = lazy(() => import("./pages/patient/WellnessTips.jsx"));

/* ---------------- Doctor ---------------- */

const DoctorOnboarding = lazy(() => import("./pages/doctor/DoctorOnboarding.jsx"));
const DoctorDashboard = lazy(() => import("./pages/doctor/DoctorDashboard.jsx"));
const DoctorConsultRoom = lazy(() => import("./pages/doctor/DoctorConsultRoom.jsx"));
const DoctorEarnings = lazy(() => import("./pages/doctor/DoctorEarnings.jsx"));

/* ---------------- Admin ---------------- */

const AdminLogin = lazy(() => import("./pages/admin/AdminLogin.jsx"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout.jsx"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard.jsx"));
const AdminDoctorApprovals = lazy(() => import("./pages/admin/AdminDoctorApprovals.jsx"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders.jsx"));
const AdminComplaints = lazy(() => import("./pages/admin/AdminComplaints.jsx"));
const AdminFaqEditor = lazy(() => import("./pages/admin/AdminFaqEditor.jsx"));
const AdminMedicines = lazy(() => import("./pages/admin/AdminMedicines.jsx"));
const AdminCoupons = lazy(() => import("./pages/admin/AdminCoupons.jsx"));
const AdminLabTests = lazy(() => import("./pages/admin/AdminLabTests.jsx"));
const AdminLabBookings = lazy(() => import("./pages/admin/AdminLabBookings.jsx"));
const AdminPayouts = lazy(() => import("./pages/admin/AdminPayouts.jsx"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics.jsx"));
const AdminWorkoutTemplates = lazy(() => import("./pages/admin/AdminWorkoutTemplates.jsx"));
const AdminFoods = lazy(() => import("./pages/admin/AdminFoods.jsx"));
const AdminWellnessTips = lazy(() => import("./pages/admin/AdminWellnessTips.jsx"));

const ADMIN_ROUTE_SECRET =
  import.meta.env.VITE_ADMIN_ROUTE_SECRET ||
  "kap-ops-9f2a1c";

export default function App() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <Routes>

      {/* ---------- Public ---------- */}

      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/help" element={<Help />} />
      <Route path="/showcase" element={<Showcase />} />

      {/* ---------- Patient ---------- */}

      <Route
        path="/patient/onboarding"
        element={
          <ProtectedRoute role="patient">
            <PatientOnboarding />
          </ProtectedRoute>
        }
      />

      <Route
        path="/patient/dashboard"
        element={
          <ProtectedRoute role="patient">
            <PatientDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/patient/doctors"
        element={<DoctorList />}
      />

      <Route
        path="/patient/doctors/:doctorId"
        element={<DoctorProfileBook />}
      />

      <Route
        path="/patient/appointments"
        element={
          <ProtectedRoute role="patient">
            <MyAppointments />
          </ProtectedRoute>
        }
      />

      <Route
        path="/patient/appointments/:id"
        element={
          <ProtectedRoute role="patient">
            <AppointmentDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/patient/consult/:id"
        element={
          <ProtectedRoute role="patient">
            <ConsultRoom />
          </ProtectedRoute>
        }
      />

      <Route
        path="/patient/prescriptions/:id"
        element={
          <ProtectedRoute role="patient">
            <PrescriptionView />
          </ProtectedRoute>
        }
      />

      <Route
        path="/patient/order/:prescriptionId"
        element={
          <ProtectedRoute role="patient">
            <OrderMedicines />
          </ProtectedRoute>
        }
      />

      <Route
        path="/patient/orders"
        element={
          <ProtectedRoute role="patient">
            <OrdersList />
          </ProtectedRoute>
        }
      />

      <Route
        path="/patient/orders/:id"
        element={
          <ProtectedRoute role="patient">
            <TrackOrder />
          </ProtectedRoute>
        }
      />

      {/* ---------- Store (Phase 2: OTC essentials) ---------- */}

      <Route path="/patient/store" element={<Store />} />

      <Route
        path="/patient/cart"
        element={
          <ProtectedRoute role="patient">
            <Cart />
          </ProtectedRoute>
        }
      />

      <Route
        path="/patient/checkout"
        element={
          <ProtectedRoute role="patient">
            <Checkout />
          </ProtectedRoute>
        }
      />

      <Route
        path="/patient/wishlist"
        element={
          <ProtectedRoute role="patient">
            <Wishlist />
          </ProtectedRoute>
        }
      />

      {/* ---------- Diagnostics, family & health vault (Phase 3) ---------- */}

      <Route path="/patient/lab-tests" element={<LabTests />} />

      <Route
        path="/patient/lab-tests/checkout"
        element={
          <ProtectedRoute role="patient">
            <LabTestCheckout />
          </ProtectedRoute>
        }
      />

      <Route
        path="/patient/lab-bookings"
        element={
          <ProtectedRoute role="patient">
            <LabBookings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/patient/lab-bookings/:id"
        element={
          <ProtectedRoute role="patient">
            <LabBookingDetail />
          </ProtectedRoute>
        }
      />

      <Route
        path="/patient/family"
        element={
          <ProtectedRoute role="patient">
            <Family />
          </ProtectedRoute>
        }
      />

      <Route
        path="/patient/health-vault"
        element={
          <ProtectedRoute role="patient">
            <HealthVault />
          </ProtectedRoute>
        }
      />

      {/* ---------- Wellness (Phase 5) ---------- */}

      <Route
        path="/patient/wellness"
        element={
          <ProtectedRoute role="patient">
            <WellnessDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/patient/wellness/vitals"
        element={
          <ProtectedRoute role="patient">
            <VitalsTracker />
          </ProtectedRoute>
        }
      />

      <Route
        path="/patient/wellness/diet-planner"
        element={
          <ProtectedRoute role="patient">
            <DietPlanner />
          </ProtectedRoute>
        }
      />

      <Route
        path="/patient/wellness/calorie-counter"
        element={
          <ProtectedRoute role="patient">
            <CalorieCounter />
          </ProtectedRoute>
        }
      />

      <Route
        path="/patient/wellness/workouts"
        element={
          <ProtectedRoute role="patient">
            <WorkoutPlanner />
          </ProtectedRoute>
        }
      />

      <Route
        path="/patient/wellness/ai-reviewer"
        element={
          <ProtectedRoute role="patient">
            <AiReviewer />
          </ProtectedRoute>
        }
      />

      <Route
        path="/patient/wellness/tips"
        element={
          <ProtectedRoute role="patient">
            <WellnessTips />
          </ProtectedRoute>
        }
      />

      {/* ---------- Doctor ---------- */}

      <Route
        path="/doctor/onboarding"
        element={
          <ProtectedRoute role="doctor">
            <DoctorOnboarding />
          </ProtectedRoute>
        }
      />

      <Route
        path="/doctor/dashboard"
        element={
          <ProtectedRoute role="doctor">
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/doctor/earnings"
        element={
          <ProtectedRoute role="doctor">
            <DoctorEarnings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/doctor/consult/:id"
        element={
          <ProtectedRoute role="doctor">
            <DoctorConsultRoom />
          </ProtectedRoute>
        }
      />

      {/* ---------- Admin ---------- */}

      <Route
        path={`/${ADMIN_ROUTE_SECRET}/login`}
        element={<AdminLogin />}
      />

      <Route
        path={`/${ADMIN_ROUTE_SECRET}`}
        element={<AdminLayout />}
      >
        <Route
          path="dashboard"
          element={<AdminDashboard />}
        />

        <Route
          path="doctors"
          element={<AdminDoctorApprovals />}
        />

        <Route
          path="orders"
          element={<AdminOrders />}
        />

        <Route
          path="complaints"
          element={<AdminComplaints />}
        />

        <Route
          path="faqs"
          element={<AdminFaqEditor />}
        />

        <Route
          path="medicines"
          element={<AdminMedicines />}
        />

        <Route
          path="coupons"
          element={<AdminCoupons />}
        />

        <Route
          path="lab-tests"
          element={<AdminLabTests />}
        />

        <Route
          path="lab-bookings"
          element={<AdminLabBookings />}
        />

        <Route
          path="payouts"
          element={<AdminPayouts />}
        />

        <Route
          path="analytics"
          element={<AdminAnalytics />}
        />

        <Route
          path="workout-templates"
          element={<AdminWorkoutTemplates />}
        />

        <Route
          path="foods"
          element={<AdminFoods />}
        />

        <Route
          path="wellness-tips"
          element={<AdminWellnessTips />}
        />
      </Route>

      {/* ---------- 404 ---------- */}

      <Route path="*" element={<NotFound />} />

    </Routes>
    </Suspense>
  );
}