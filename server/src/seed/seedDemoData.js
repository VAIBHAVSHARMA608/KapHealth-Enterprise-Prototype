/** Run once: `node src/seed/seedDemoData.js` -- adds sample medicines + FAQs for local demo/testing. */
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Medicine = require("../models/Medicine");
const Faq = require("../models/Faq");

async function run() {
  await connectDB();

  await Medicine.insertMany([
    { name: "Paracetamol 500mg", genericName: "Paracetamol", manufacturer: "Cipla", unit: "strip of 10", mrp: 30, sellingPrice: 25, requiresPrescription: false, stockQuantity: 500 },
    { name: "Azithromycin 500mg", genericName: "Azithromycin", manufacturer: "Sun Pharma", unit: "strip of 3", mrp: 120, sellingPrice: 99, requiresPrescription: true, stockQuantity: 200 },
    { name: "Cetirizine 10mg", genericName: "Cetirizine", manufacturer: "Dr. Reddy's", unit: "strip of 10", mrp: 40, sellingPrice: 32, requiresPrescription: false, stockQuantity: 300 },
    { name: "Pantoprazole 40mg", genericName: "Pantoprazole", manufacturer: "Alkem", unit: "strip of 15", mrp: 150, sellingPrice: 120, requiresPrescription: true, stockQuantity: 150 },
  ]);

  await Faq.insertMany([
    { audience: "patient", category: "booking", question: "How do I book a check-up?", answer: "Choose a doctor, pick an available slot, pay the consultation fee, and you'll get a link to join the video call at that time.", order: 1 },
    { audience: "patient", category: "orders", question: "Can I pay cash on delivery for medicines?", answer: "Yes -- Cash on Delivery is available at checkout alongside online payment for every prescription order.", order: 2 },
    { audience: "doctor", category: "onboarding", question: "What documents do I need to onboard?", answer: "A government ID, your medical registration certificate, degree certificate, and a profile photo.", order: 1 },
    { audience: "doctor", category: "payouts", question: "When do I get paid for consultations?", answer: "Consultation fees are settled to your linked bank account weekly, after KapHealth's platform fee.", order: 2 },
  ]);

  console.log("Seeded demo medicines + FAQs");
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
