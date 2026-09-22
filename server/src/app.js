const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const path = require("path");

const { apiLimiter } = require("./middleware/rateLimiters");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const authRoutes = require("./routes/auth.routes");
const doctorRoutes = require("./routes/doctor.routes");
const appointmentRoutes = require("./routes/appointment.routes");
const prescriptionRoutes = require("./routes/prescription.routes");
const orderRoutes = require("./routes/order.routes");
const paymentRoutes = require("./routes/payment.routes");
const reviewRoutes = require("./routes/review.routes");
const complaintRoutes = require("./routes/complaint.routes");
const faqRoutes = require("./routes/faq.routes");
const adminRoutes = require("./routes/admin.routes");
const patientRoutes = require("./routes/patient.routes");
const medicineRoutes = require("./routes/medicine.routes");
const cartRoutes = require("./routes/cart.routes");
const wishlistRoutes = require("./routes/wishlist.routes");
const couponRoutes = require("./routes/coupon.routes");
const notificationRoutes = require("./routes/notification.routes");
const labTestRoutes = require("./routes/labTest.routes");
const healthRecordRoutes = require("./routes/healthRecord.routes");
const wellnessRoutes = require("./routes/wellness.routes");

const app = express();

app.set("trust proxy", 1);

const allowedOrigins = [
  process.env.CLIENT_URL || "http://localhost:5173",
  process.env.ADMIN_CLIENT_URL || "http://localhost:5174",
];

// ---- Security middleware ----
app.use(
  helmet({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  })
);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());
app.use(mongoSanitize()); // strip $ and . from user input to prevent NoSQL injection
app.use(xss()); // sanitize user input against XSS
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use("/api", apiLimiter);

// Static file serving for uploaded documents / generated prescription PDFs
app.use("/uploads", express.static(path.join(process.cwd(), process.env.UPLOAD_DIR || "uploads")));

app.get("/api/health", (req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

// ---- Feature routes ----
app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api/store/medicines", medicineRoutes);
app.use("/api/store/cart", cartRoutes);
app.use("/api/store/wishlist", wishlistRoutes);
app.use("/api/store/coupons", couponRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/lab-tests", labTestRoutes);
app.use("/api/health-records", healthRecordRoutes);
app.use("/api/wellness", wellnessRoutes);

// ---- Hidden admin surface ----
// Note: obscurity of the mount path is NOT the security boundary -- the
// requireAuth + requireRole("admin") + requireAdminKey chain inside
// admin.routes.js is. The unusual path just avoids advertising the panel.
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
