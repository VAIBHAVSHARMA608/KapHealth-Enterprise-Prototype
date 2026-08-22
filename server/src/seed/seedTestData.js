/**
 * Run once: `node src/seed/seedTestData.js` (or `npm run seed:test`)
 * (Run `npm run seed:demo` first -- this script needs the medicine catalog
 * it creates.)
 *
 * Seeds a full, realistic test dataset: doctors + patients (with a shared
 * TEST PASSWORD so you can log in instantly via the "test credentials" link
 * on the login page -- no WhatsApp/Twilio account needed), appointments in
 * every status (including one live-right-now consult and one confirmed
 * upcoming slot for testing the video call in real time), e-prescriptions,
 * prescription-based orders AND OTC store orders (Phase 2), payments,
 * doctor/order reviews, and support complaints.
 *
 * Safe to re-run: it wipes only the test-data collections below (never the
 * admin account, and never Medicine/Faq/Coupon, which live in seedDemoData).
 */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const connectDB = require("../config/db");

const User = require("../models/User");
const PatientProfile = require("../models/PatientProfile");
const DoctorProfile = require("../models/DoctorProfile");
const Appointment = require("../models/Appointment");
const Prescription = require("../models/Prescription");
const Order = require("../models/Order");
const Payment = require("../models/Payment");
const Review = require("../models/Review");
const Complaint = require("../models/Complaint");
const Medicine = require("../models/Medicine");
const LabTest = require("../models/LabTest");
const LabTestBooking = require("../models/LabTestBooking");
const HealthRecord = require("../models/HealthRecord");
const Payout = require("../models/Payout");
const { generateOrderNumber, generateLabBookingNumber } = require("../utils/orderNumber");

const DAY = 24 * 60 * 60 * 1000;
const MIN = 60 * 1000;
const TEST_PASSWORD = process.env.TEST_ACCOUNT_PASSWORD || "Kap@Test123";

async function run() {
  await connectDB();

  const medicines = await Medicine.find({});
  if (medicines.length === 0) {
    console.error("No medicines found -- run `npm run seed:demo` first.");
    process.exit(1);
  }
  const findMed = (name) => medicines.find((m) => m.name === name);
  const otcMeds = medicines.filter((m) => !m.requiresPrescription);

  // ---- Wipe previous test data (never touches admin users or the catalog) ----
  const testUsers = await User.find({ role: { $in: ["patient", "doctor"] } }).select("_id");
  const testUserIds = testUsers.map((u) => u._id);
  await Promise.all([
    Appointment.deleteMany({}),
    Prescription.deleteMany({}),
    Order.deleteMany({}),
    Payment.deleteMany({}),
    Review.deleteMany({}),
    Complaint.deleteMany({}),
    PatientProfile.deleteMany({}),
    DoctorProfile.deleteMany({}),
    LabTestBooking.deleteMany({}),
    HealthRecord.deleteMany({}),
    Payout.deleteMany({}),
  ]);
  if (testUserIds.length) await User.deleteMany({ _id: { $in: testUserIds } });

  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 10);

  // ---- Doctors ----
  const doctorSeeds = [
    { name: "Dr. Ananya Rao", phone: "+919810000001", email: "doctor1@kaptest.dev", specializations: ["General Physician"], fee: 399, exp: 8, reg: "MCI-88213", gender: "female", rating: 4.7, ratingCount: 214 },
    { name: "Dr. Vikram Sethi", phone: "+919810000002", email: "doctor2@kaptest.dev", specializations: ["Cardiologist"], fee: 799, exp: 14, reg: "MCI-71029", gender: "male", rating: 4.6, ratingCount: 168 },
    { name: "Dr. Priya Nair", phone: "+919810000003", email: "doctor3@kaptest.dev", specializations: ["Dermatologist"], fee: 599, exp: 6, reg: "MCI-90441", gender: "female", rating: 4.5, ratingCount: 97 },
    { name: "Dr. Rohan Mehta", phone: "+919810000004", email: "doctor4@kaptest.dev", specializations: ["Endocrinologist"], fee: 699, exp: 10, reg: "MCI-65310", gender: "male", rating: 4.8, ratingCount: 253 },
    { name: "Dr. Kavita Deshmukh", phone: "+919810000005", email: "doctor5@kaptest.dev", specializations: ["Pediatrician"], fee: 499, exp: 11, reg: "MCI-77218", gender: "female", rating: 4.9, ratingCount: 340 },
    { name: "Dr. Arjun Malhotra", phone: "+919810000006", email: "doctor6@kaptest.dev", specializations: ["Orthopedic"], fee: 649, exp: 9, reg: "MCI-55672", gender: "male", rating: 4.4, ratingCount: 112 },
    { name: "Dr. Sneha Kulkarni", phone: "+919810000007", email: "doctor7@kaptest.dev", specializations: ["Gynecologist"], fee: 599, exp: 12, reg: "MCI-44890", gender: "female", rating: 4.7, ratingCount: 187 },
  ];

  const doctors = [];
  async function createDoctor(d, { approved }) {
    const user = await User.create({
      name: d.name,
      phone: d.phone,
      email: d.email,
      isEmailVerified: true,
      role: "doctor",
      isPhoneVerified: true,
      passwordHash,
      authProviders: { whatsapp: true, password: true },
      avatarUrl: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(d.name)}`,
    });
    const profile = await DoctorProfile.create({
      user: user._id,
      dateOfBirth: new Date(1975 + Math.floor(Math.random() * 15), 3, 12),
      gender: d.gender,
      bloodGroup: "O+",
      registrationCouncil: "Medical Council of India",
      registrationNumber: d.reg,
      registrationYear: 2025 - d.exp,
      qualifications: d.qualifications || ["MBBS", "MD"],
      specializations: d.specializations,
      yearsOfExperience: d.exp,
      languagesSpoken: ["English", "Hindi"],
      clinicOrHospital: "KapHealth Partner Clinic",
      consultationFee: d.fee,
      bio: `${d.name} is an experienced ${d.specializations[0]} focused on accessible, patient-first telemedicine care.`,
      availability: [0, 1, 2, 3, 4, 5, 6].map((day) => ({ dayOfWeek: day, startTime: "09:00", endTime: "20:00", slotDurationMinutes: 15 })),
      onboardingStatus: approved ? "approved" : "pending_review",
      reviewedAt: approved ? new Date() : undefined,
      ratingAverage: approved ? d.rating : 0,
      ratingCount: approved ? d.ratingCount : 0,
    });
    return { user, profile };
  }

  for (const d of doctorSeeds) {
    doctors.push(await createDoctor(d, { approved: true }));
  }

  // ---- Two doctors sitting in "pending review", exactly as if they had just
  // self-registered through the real onboarding form -- use these to test
  // the admin approval flow itself (approve/reject/request changes) live
  // in the admin panel, rather than seeing everything pre-approved.
  const pendingDoctorSeeds = [
    { name: "Dr. Das", phone: "+919810000008", email: "doctor.das@kaptest.dev", specializations: ["General Physician"], qualifications: ["MBBS"], fee: 299, exp: 3, reg: "MCI-99001", gender: "male" },
    { name: "Dr. Sanjeev Jain", phone: "+919810000009", email: "doctor.sanjeevjain@kaptest.dev", specializations: ["Cardiologist"], qualifications: ["MBBS", "MD - General Medicine"], fee: 699, exp: 15, reg: "MCI-99002", gender: "male" },
  ];
  const pendingDoctors = [];
  for (const d of pendingDoctorSeeds) {
    pendingDoctors.push(await createDoctor(d, { approved: false }));
  }

  // ---- Patients ----
  const patientSeeds = [
    { name: "Aditya Sharma", phone: "+919820000001", email: "patient1@kaptest.dev", city: "Panipat", gender: "male" },
    { name: "Meera Iyer", phone: "+919820000002", email: "patient2@kaptest.dev", city: "Bengaluru", gender: "female" },
    { name: "Kabir Khanna", phone: "+919820000003", email: "patient3@kaptest.dev", city: "Delhi", gender: "male" },
    { name: "Sanya Kapoor", phone: "+919820000004", email: "patient4@kaptest.dev", city: "Mumbai", gender: "female" },
    { name: "Rahul Verma", phone: "+919820000005", email: "patient5@kaptest.dev", city: "Pune", gender: "male" },
  ];

  const patients = [];
  for (const p of patientSeeds) {
    const user = await User.create({
      name: p.name,
      phone: p.phone,
      email: p.email,
      isEmailVerified: true,
      role: "patient",
      isPhoneVerified: true,
      passwordHash,
      authProviders: { whatsapp: true, password: true },
      avatarUrl: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(p.name)}`,
    });
    const profile = await PatientProfile.create({
      user: user._id,
      dateOfBirth: new Date(1985 + Math.floor(Math.random() * 20), 6, 15),
      gender: p.gender,
      bloodGroup: "B+",
      heightCm: 165 + Math.floor(Math.random() * 20),
      weightKg: 55 + Math.floor(Math.random() * 25),
      allergies: [],
      chronicConditions: [],
      currentMedications: [],
      addresses: [
        {
          label: "Home",
          line1: `${100 + Math.floor(Math.random() * 800)}, MG Road`,
          line2: "Near City Mall",
          city: p.city,
          state: "State",
          pincode: `${110000 + Math.floor(Math.random() * 9999)}`,
          isDefault: true,
        },
      ],
      emergencyContact: { name: "Emergency Contact", phone: "+919999999999", relation: "Sibling" },
    });
    patients.push({ user, profile, city: p.city });
  }

  const rxSample = [
    { name: "Paracetamol 500mg", dosage: "500mg", frequency: "1-0-1 after food", durationDays: 5, instructions: "Take with water" },
    { name: "Cetirizine 10mg", dosage: "10mg", frequency: "0-0-1 at night", durationDays: 5, instructions: "May cause drowsiness" },
  ];

  let ordersCreated = 0;
  let paymentsCreated = 0;
  let reviewsCreated = 0;

  async function payAppointment(appointment, { refunded = false } = {}) {
    const payment = await Payment.create({
      user: appointment.patient,
      purpose: "appointment",
      referenceId: appointment._id,
      amount: appointment.consultationFee,
      method: "razorpay",
      razorpayOrderId: `dev_seed_${appointment._id}`,
      razorpayPaymentId: `dev_seed_pay_${appointment._id}`,
      status: refunded ? "refunded" : "captured",
    });
    appointment.payment = payment._id;
    await appointment.save();
    paymentsCreated++;
  }

  // ================================================================
  // Two hero appointments built specifically for live end-to-end testing
  // ================================================================

  // 1) LIVE CONSULT -- already "in progress" right now, no prescription yet.
  //    Log in as the doctor below and issue a prescription to test real
  //    e-prescription generation (PDF). Log in as the patient to watch the
  //    same appointment and join the same video room.
  const livePatient = patients[0];
  const liveDoctor = doctors[0];
  const liveAppointment = await Appointment.create({
    patient: livePatient.user._id,
    doctor: liveDoctor.user._id,
    scheduledStart: new Date(Date.now() - 2 * MIN),
    scheduledEnd: new Date(Date.now() + 13 * MIN),
    reasonForVisit: "Fever and body ache for 2 days",
    status: "in_progress",
    consultationFee: liveDoctor.profile.consultationFee,
    paymentStatus: "paid",
    roomId: `apt_${uuidv4()}`,
    callStartedAt: new Date(Date.now() - 2 * MIN),
  });
  await payAppointment(liveAppointment);

  // 2) UPCOMING CONFIRMED SLOT -- starts in ~10 minutes, already paid, ready
  //    to join. Use this to test the "join call" experience without also
  //    needing to test payment first (see the booking test below for that).
  const upcomingPatient = patients[1];
  const upcomingDoctor = doctors[1];
  const upcomingAppointment = await Appointment.create({
    patient: upcomingPatient.user._id,
    doctor: upcomingDoctor.user._id,
    scheduledStart: new Date(Date.now() + 10 * MIN),
    scheduledEnd: new Date(Date.now() + 25 * MIN),
    reasonForVisit: "Follow-up on blood pressure medication",
    status: "confirmed",
    consultationFee: upcomingDoctor.profile.consultationFee,
    paymentStatus: "paid",
    roomId: `apt_${uuidv4()}`,
  });
  await payAppointment(upcomingAppointment);

  console.log(`\nLive consult ready NOW: patient ${livePatient.user.phone} <-> doctor ${liveDoctor.user.phone} (appointment ${liveAppointment._id})`);
  console.log(`Upcoming confirmed slot in ~10 min: patient ${upcomingPatient.user.phone} <-> doctor ${upcomingDoctor.user.phone} (appointment ${upcomingAppointment._id})`);
  console.log(`To test a brand-new booking + payment from scratch, log in as any patient and book any OTHER doctor/slot -- payment auto-completes in dev mode (no Razorpay account needed) unless you've set real RAZORPAY_KEY_ID/SECRET in .env.\n`);

  // ================================================================
  // Broader spread of appointments across every status + history
  // ================================================================
  const statuses = ["completed", "completed", "confirmed", "pending_payment", "cancelled", "completed"];
  let apptIndex = 0;

  for (const patient of patients) {
    for (let i = 0; i < 2; i++) {
      const doctor = doctors[(apptIndex + 2) % doctors.length]; // offset past the two hero doctors' slots
      const status = statuses[apptIndex % statuses.length];
      const dayOffset = status === "completed" || status === "cancelled" ? -(apptIndex + 1) : apptIndex + 2;
      const scheduledStart = new Date(Date.now() + dayOffset * DAY);
      const scheduledEnd = new Date(scheduledStart.getTime() + 15 * MIN);

      const appointment = await Appointment.create({
        patient: patient.user._id,
        doctor: doctor.user._id,
        scheduledStart,
        scheduledEnd,
        reasonForVisit: "General check-up and consultation",
        status,
        consultationFee: doctor.profile.consultationFee,
        paymentStatus: status === "pending_payment" ? "unpaid" : "paid",
        roomId: `apt_${uuidv4()}`,
        callStartedAt: status === "completed" ? scheduledStart : undefined,
        callEndedAt: status === "completed" ? scheduledEnd : undefined,
        cancelledBy: status === "cancelled" ? "patient" : null,
        cancellationReason: status === "cancelled" ? "Schedule conflict" : undefined,
      });

      if (status !== "pending_payment") {
        await payAppointment(appointment, { refunded: status === "cancelled" });
      }

      if (status === "completed") {
        const prescription = await Prescription.create({
          appointment: appointment._id,
          patient: patient.user._id,
          doctor: doctor.user._id,
          diagnosis: "Mild viral fever with seasonal allergy symptoms",
          notesForPatient: "Stay hydrated, rest well, and follow up if symptoms persist beyond 5 days.",
          medicines: rxSample,
          followUpDate: new Date(Date.now() + 7 * DAY),
          signedAt: scheduledEnd,
          isOrdered: apptIndex % 2 === 0,
        });
        appointment.prescription = prescription._id;
        await appointment.save();

        await Review.create({
          author: patient.user._id,
          targetType: "doctor",
          doctor: doctor.user._id,
          appointment: appointment._id,
          rating: 4 + (apptIndex % 2),
          comment: "Attentive doctor, explained everything clearly over video call.",
        });
        reviewsCreated++;

        if (prescription.isOrdered) {
          const rxMeds = [findMed("Paracetamol 500mg"), findMed("Cetirizine 10mg")].filter(Boolean);
          const items = rxMeds.map((m) => ({ medicine: m._id, name: m.name, quantity: 1, unitPrice: m.sellingPrice }));
          const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
          const deliveryFee = subtotal >= 499 ? 0 : 49;
          const total = subtotal + deliveryFee;
          const orderStatus = apptIndex % 4 === 0 ? "delivered" : "shipped";

          const order = await Order.create({
            orderNumber: generateOrderNumber(),
            patient: patient.user._id,
            prescription: prescription._id,
            orderSource: "prescription",
            items,
            deliveryAddress: {
              line1: patient.profile.addresses[0].line1,
              line2: patient.profile.addresses[0].line2,
              city: patient.profile.addresses[0].city,
              state: patient.profile.addresses[0].state,
              pincode: patient.profile.addresses[0].pincode,
              phone: patient.user.phone,
            },
            subtotal,
            deliveryFee,
            total,
            paymentMethod: apptIndex % 2 === 0 ? "cod" : "online",
            paymentStatus: orderStatus === "delivered" ? "paid" : "cod_pending",
            status: orderStatus,
            statusHistory: [
              { status: "placed", note: "Order placed by patient" },
              { status: "confirmed", note: "Pharmacy confirmed the order" },
              ...(orderStatus === "delivered" ? [{ status: "delivered", note: "Delivered to patient" }] : [{ status: "shipped", note: "Out with courier" }]),
            ],
            deliveredAt: orderStatus === "delivered" ? new Date() : undefined,
            courierName: "Delhivery",
            trackingId: `DLV${100000 + apptIndex}`,
          });
          ordersCreated++;

          if (orderStatus === "delivered") {
            await Review.create({
              author: patient.user._id,
              targetType: "order",
              order: order._id,
              rating: 5,
              comment: "Medicines delivered on time, well packaged.",
            });
            reviewsCreated++;
          }
        }
      }

      apptIndex++;
    }
  }

  // ---- Phase 2: OTC store orders (no prescription) ----
  for (let i = 0; i < patients.length; i++) {
    const patient = patients[i];
    const picks = [otcMeds[i % otcMeds.length], otcMeds[(i + 3) % otcMeds.length]];
    const items = picks.map((m) => ({ medicine: m._id, name: m.name, quantity: 1 + (i % 2), unitPrice: m.sellingPrice }));
    const subtotal = items.reduce((s, it) => s + it.unitPrice * it.quantity, 0);
    const deliveryFee = subtotal >= 499 ? 0 : 49;
    const total = subtotal + deliveryFee;
    const status = i % 2 === 0 ? "delivered" : "out_for_delivery";

    await Order.create({
      orderNumber: generateOrderNumber(),
      patient: patient.user._id,
      orderSource: "store",
      items,
      deliveryAddress: {
        line1: patient.profile.addresses[0].line1,
        line2: patient.profile.addresses[0].line2,
        city: patient.profile.addresses[0].city,
        state: patient.profile.addresses[0].state,
        pincode: patient.profile.addresses[0].pincode,
        phone: patient.user.phone,
      },
      subtotal,
      deliveryFee,
      discount: i === 0 ? 50 : 0,
      couponCode: i === 0 ? "WELCOME50" : undefined,
      total: total - (i === 0 ? 50 : 0),
      paymentMethod: i % 2 === 0 ? "cod" : "online",
      paymentStatus: status === "delivered" ? "paid" : "cod_pending",
      status,
      statusHistory: [
        { status: "placed", note: "Store order placed" },
        { status: "confirmed", note: "Confirmed for dispatch" },
        ...(status === "delivered" ? [{ status: "delivered", note: "Delivered" }] : [{ status: "out_for_delivery", note: "With delivery partner" }]),
      ],
      deliveredAt: status === "delivered" ? new Date() : undefined,
      courierName: "Delhivery",
      trackingId: `DLV${200000 + i}`,
    });
    ordersCreated++;
  }

  // ---- Complaints ----
  await Complaint.insertMany([
    {
      author: patients[0].user._id,
      authorRole: "patient",
      category: "order_delivery_issue",
      subject: "Order delayed by 2 days",
      description: "My medicine order was supposed to arrive yesterday but the tracking hasn't updated.",
      status: "open",
      priority: "medium",
    },
    {
      author: patients[1].user._id,
      authorRole: "patient",
      category: "video_call_issue",
      subject: "Call kept freezing during consultation",
      description: "The video call froze multiple times during my appointment and audio cut out.",
      status: "in_review",
      priority: "high",
    },
    {
      author: doctors[0].user._id,
      authorRole: "doctor",
      category: "payment_issue",
      subject: "Weekly payout not received",
      description: "This week's consultation payout hasn't reflected in my linked bank account yet.",
      status: "open",
      priority: "medium",
    },
  ]);

  // ================================================================
  // Phase 3: a dependent, a couple of health records, a lab booking,
  // and a settled payout -- so there's real data to look at right away.
  // ================================================================

  // One family member for the "live consult" patient, to test the
  // "who is this for" picker and family-booking flow.
  await PatientProfile.findOneAndUpdate(
    { user: livePatient.user._id },
    { $push: { dependents: { name: "Aarav Sharma", relation: "child", dateOfBirth: new Date(2016, 4, 20), gender: "male", bloodGroup: "B+" } } }
  );

  await HealthRecord.insertMany([
    {
      patient: livePatient.user._id,
      title: "Old blood test report (2025)",
      recordType: "lab_report",
      fileUrl: "/uploads/health-records/sample-placeholder.pdf",
      recordDate: new Date(Date.now() - 200 * DAY),
      notes: "Routine annual checkup",
      uploadedBy: "patient",
    },
    {
      patient: livePatient.user._id,
      title: "COVID-19 vaccination certificate",
      recordType: "vaccination",
      fileUrl: "/uploads/health-records/sample-placeholder.pdf",
      recordDate: new Date(Date.now() - 400 * DAY),
      uploadedBy: "patient",
    },
  ]);

  const labTestsCatalog = await LabTest.find({});
  let labBookingCreated = false;
  if (labTestsCatalog.length > 0) {
    const picks = labTestsCatalog.slice(0, 2);
    const testLines = picks.map((t) => ({ labTest: t._id, name: t.name, price: t.price }));
    const subtotal = testLines.reduce((s, t) => s + t.price, 0);
    await LabTestBooking.create({
      bookingNumber: generateLabBookingNumber(),
      patient: upcomingPatient.user._id,
      bookingFor: { type: "self" },
      tests: testLines,
      scheduledDate: new Date(Date.now() + 2 * DAY),
      timeSlot: "09:00 AM - 11:00 AM",
      collectionAddress: {
        line1: upcomingPatient.profile.addresses[0].line1,
        city: upcomingPatient.profile.addresses[0].city,
        state: upcomingPatient.profile.addresses[0].state,
        pincode: upcomingPatient.profile.addresses[0].pincode,
        phone: upcomingPatient.user.phone,
      },
      subtotal,
      total: subtotal,
      paymentMethod: "cod",
      paymentStatus: "cod_pending",
      status: "booked",
      statusHistory: [{ status: "booked", note: "Booking placed by patient" }],
    });
    labBookingCreated = true;
  }

  // A settled payout for doctor1, covering last week, so the payout history
  // and analytics dashboard both have something real to show.
  const payoutGross = liveDoctor.profile.consultationFee * 3;
  const payoutFeePercent = 15;
  const payoutFee = Math.round((payoutGross * payoutFeePercent) / 100);
  await Payout.create({
    doctor: liveDoctor.user._id,
    periodStart: new Date(Date.now() - 14 * DAY),
    periodEnd: new Date(Date.now() - 7 * DAY),
    consultationCount: 3,
    grossAmount: payoutGross,
    platformFeePercent: payoutFeePercent,
    platformFee: payoutFee,
    netAmount: payoutGross - payoutFee,
    status: "paid",
    transactionRef: "TXN-DEV-000123",
    paidAt: new Date(Date.now() - 6 * DAY),
  });

  console.log(`Seeded: ${doctors.length} doctors (+2 pending review), ${patients.length} patients, ${apptIndex + 2} appointments, ${ordersCreated} orders (incl. OTC store orders), ${paymentsCreated} payments, ${reviewsCreated} reviews, 3 complaints, 1 dependent, 2 health records, ${labBookingCreated ? 1 : 0} lab booking, 1 paid payout.`);
  console.log("\n================= TEST LOGIN CREDENTIALS =================");
  console.log(`Shared password for every account below: ${TEST_PASSWORD}\n`);
  console.log("Role      | Email                              | Notes");
  console.log("--------- | ---------------------------------- | ---------------------------------------------");
  console.log(`Patient   | ${livePatient.user.email.padEnd(34)} | Has a LIVE consult happening right now`);
  console.log(`Doctor    | ${liveDoctor.user.email.padEnd(34)} | Same LIVE consult -- issue a prescription to test PDF generation`);
  console.log(`Patient   | ${upcomingPatient.user.email.padEnd(34)} | Confirmed slot starting in ~10 min`);
  console.log(`Doctor    | ${upcomingDoctor.user.email.padEnd(34)} | Same upcoming slot -- test joining the video call`);
  console.log(`Doctor    | ${pendingDoctors[0].user.email.padEnd(34)} | PENDING admin review (Dr. Das, MBBS)`);
  console.log(`Doctor    | ${pendingDoctors[1].user.email.padEnd(34)} | PENDING admin review (Dr. Sanjeev Jain, MD)`);
  console.log(`Admin     | (set via ADMIN_SEED_EMAIL, run npm run seed:admin) | Approve/reject the two pending doctors above`);
  console.log("\nPhone numbers work too (e.g. " + livePatient.user.phone + ") if you prefer -- same password.");
  console.log("============================================================\n");
  console.log("Phase 3 quick-test pointers:");
  console.log(`- ${livePatient.user.email} has a dependent (Aarav Sharma) -- try booking/lab-booking "for" him.`);
  console.log(`- ${livePatient.user.email} has 2 sample health records already in their vault.`);
  console.log(`- ${upcomingPatient.user.email} has a lab booking already placed -- track it under Lab Bookings.`);
  console.log(`- ${liveDoctor.user.email} has one PAID payout in their earnings history.`);
  console.log("- Log in as admin to see the Analytics dashboard, and to generate a new payout for any doctor.");
  console.log("============================================================\n");

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
