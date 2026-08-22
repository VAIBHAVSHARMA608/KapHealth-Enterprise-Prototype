/**
 * Run once: `node src/seed/seedDemoData.js`
 * Seeds the OTC store catalog (prescription drugs + everyday essentials),
 * discount coupons, and FAQs. Safe to re-run -- it wipes and reseeds these
 * three collections only (never touches Users/Appointments/Orders).
 */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Medicine = require("../models/Medicine");
const Faq = require("../models/Faq");
const Coupon = require("../models/Coupon");
const LabTest = require("../models/LabTest");

const medicines = [
  // ---- Prescription drugs (requiresPrescription: true) ----
  { name: "Paracetamol 500mg", genericName: "Paracetamol", manufacturer: "Cipla", unit: "strip of 10", mrp: 30, sellingPrice: 25, requiresPrescription: false, stockQuantity: 500, category: "Fever & Cold", description: "Fast relief from fever, headache and body ache.", tags: ["fever", "pain", "headache"], ratingAverage: 4.5, ratingCount: 812 },
  { name: "Azithromycin 500mg", genericName: "Azithromycin", manufacturer: "Sun Pharma", unit: "strip of 3", mrp: 120, sellingPrice: 99, requiresPrescription: true, stockQuantity: 200, category: "Fever & Cold", description: "Broad-spectrum antibiotic for bacterial infections.", tags: ["antibiotic", "infection"], ratingAverage: 4.3, ratingCount: 210 },
  { name: "Cetirizine 10mg", genericName: "Cetirizine", manufacturer: "Dr. Reddy's", unit: "strip of 10", mrp: 40, sellingPrice: 32, requiresPrescription: false, stockQuantity: 300, category: "Fever & Cold", description: "Relieves sneezing, runny nose and allergy symptoms.", tags: ["allergy", "cold"], ratingAverage: 4.4, ratingCount: 455 },
  { name: "Pantoprazole 40mg", genericName: "Pantoprazole", manufacturer: "Alkem", unit: "strip of 15", mrp: 150, sellingPrice: 120, requiresPrescription: true, stockQuantity: 150, category: "Digestive Care", description: "Reduces stomach acid; used for acidity and reflux.", tags: ["acidity", "reflux"], ratingAverage: 4.2, ratingCount: 189 },
  { name: "Amoxicillin 500mg", genericName: "Amoxicillin", manufacturer: "GSK", unit: "strip of 10", mrp: 90, sellingPrice: 75, requiresPrescription: true, stockQuantity: 180, category: "Fever & Cold", description: "Penicillin-based antibiotic for common infections.", tags: ["antibiotic"], ratingAverage: 4.1, ratingCount: 143 },
  { name: "Metformin 500mg", genericName: "Metformin", manufacturer: "USV", unit: "strip of 15", mrp: 60, sellingPrice: 48, requiresPrescription: true, stockQuantity: 260, category: "Diabetes Care", description: "First-line medication for type 2 diabetes management.", tags: ["diabetes", "blood sugar"], ratingAverage: 4.4, ratingCount: 322 },
  { name: "Amlodipine 5mg", genericName: "Amlodipine", manufacturer: "Cipla", unit: "strip of 10", mrp: 45, sellingPrice: 36, requiresPrescription: true, stockQuantity: 200, category: "Cardiac Care", description: "Calcium channel blocker used to treat high blood pressure.", tags: ["bp", "hypertension"], ratingAverage: 4.3, ratingCount: 176 },
  { name: "Atorvastatin 10mg", genericName: "Atorvastatin", manufacturer: "Dr. Reddy's", unit: "strip of 10", mrp: 85, sellingPrice: 68, requiresPrescription: true, stockQuantity: 140, category: "Cardiac Care", description: "Lowers LDL cholesterol to reduce heart disease risk.", tags: ["cholesterol", "heart"], ratingAverage: 4.2, ratingCount: 98 },

  // ---- OTC essentials (requiresPrescription: false) -- Phase 2 store ----
  { name: "Vitamin C 500mg Chewable", genericName: "Ascorbic Acid", manufacturer: "HealthKart", unit: "bottle of 30", mrp: 220, sellingPrice: 179, requiresPrescription: false, stockQuantity: 400, category: "Vitamins & Supplements", description: "Boosts immunity with a tangy orange chewable tablet.", tags: ["immunity", "vitamin c"], ratingAverage: 4.6, ratingCount: 934 },
  { name: "Multivitamin Daily Tablets", genericName: "Multivitamin", manufacturer: "Revital", unit: "bottle of 30", mrp: 399, sellingPrice: 329, requiresPrescription: false, stockQuantity: 350, category: "Vitamins & Supplements", description: "Daily multivitamin, mineral and antioxidant support.", tags: ["multivitamin", "energy"], ratingAverage: 4.5, ratingCount: 1204 },
  { name: "Vitamin D3 60K IU", genericName: "Cholecalciferol", manufacturer: "Mankind", unit: "strip of 4", mrp: 110, sellingPrice: 89, requiresPrescription: false, stockQuantity: 300, category: "Vitamins & Supplements", description: "Weekly Vitamin D3 sachet for bone and immune health.", tags: ["vitamin d", "bones"], ratingAverage: 4.4, ratingCount: 512 },
  { name: "Omega-3 Fish Oil Capsules", genericName: "Fish Oil", manufacturer: "HealthKart", unit: "bottle of 60", mrp: 599, sellingPrice: 449, requiresPrescription: false, stockQuantity: 220, category: "Vitamins & Supplements", description: "EPA/DHA rich fish oil for heart and brain health.", tags: ["omega3", "heart"], ratingAverage: 4.3, ratingCount: 267 },
  { name: "ORS Electrolyte Sachets", genericName: "Oral Rehydration Salts", manufacturer: "Electral", unit: "box of 10", mrp: 60, sellingPrice: 49, requiresPrescription: false, stockQuantity: 500, category: "First Aid", description: "Rehydration salts for dehydration, diarrhoea and heat.", tags: ["hydration", "electrolyte"], ratingAverage: 4.6, ratingCount: 688 },
  { name: "Antiseptic Liquid 100ml", genericName: "Chlorhexidine + Povidone", manufacturer: "Dettol", unit: "bottle", mrp: 95, sellingPrice: 79, requiresPrescription: false, stockQuantity: 400, category: "First Aid", description: "All-purpose antiseptic for cuts, wounds and disinfection.", tags: ["antiseptic", "wound care"], ratingAverage: 4.7, ratingCount: 1023 },
  { name: "Adhesive Bandages (Pack of 40)", genericName: "Sterile Bandages", manufacturer: "Band-Aid", unit: "pack", mrp: 85, sellingPrice: 69, requiresPrescription: false, stockQuantity: 350, category: "First Aid", description: "Assorted sterile adhesive bandages for minor cuts.", tags: ["bandage", "first aid"], ratingAverage: 4.5, ratingCount: 402 },
  { name: "Digital Thermometer", genericName: "Thermometer", manufacturer: "Dr. Trust", unit: "piece", mrp: 299, sellingPrice: 199, requiresPrescription: false, stockQuantity: 150, category: "Devices & Essentials", description: "Fast, accurate digital thermometer with fever alarm.", tags: ["thermometer", "device"], ratingAverage: 4.4, ratingCount: 356 },
  { name: "Pulse Oximeter", genericName: "Oximeter", manufacturer: "Dr. Trust", unit: "piece", mrp: 1499, sellingPrice: 999, requiresPrescription: false, stockQuantity: 90, category: "Devices & Essentials", description: "Fingertip SpO2 and pulse rate monitor.", tags: ["oximeter", "device"], ratingAverage: 4.5, ratingCount: 289 },
  { name: "Digital Blood Pressure Monitor", genericName: "BP Monitor", manufacturer: "Omron", unit: "piece", mrp: 2999, sellingPrice: 2199, requiresPrescription: false, stockQuantity: 60, category: "Devices & Essentials", description: "Automatic upper-arm BP monitor with irregular heartbeat detection.", tags: ["bp monitor", "device"], ratingAverage: 4.6, ratingCount: 178 },
  { name: "N95 Face Masks (Pack of 5)", genericName: "Respirator Mask", manufacturer: "Venus", unit: "pack", mrp: 250, sellingPrice: 199, requiresPrescription: false, stockQuantity: 600, category: "Devices & Essentials", description: "5-layer N95 masks with snug nose clip fit.", tags: ["mask", "protection"], ratingAverage: 4.3, ratingCount: 521 },
  { name: "Hand Sanitizer 500ml", genericName: "Alcohol-based Sanitizer", manufacturer: "Dettol", unit: "bottle", mrp: 220, sellingPrice: 169, requiresPrescription: false, stockQuantity: 450, category: "Personal Care", description: "70% alcohol sanitizer gel that kills 99.9% germs.", tags: ["sanitizer", "hygiene"], ratingAverage: 4.5, ratingCount: 640 },
  { name: "Baby Diaper Rash Cream", genericName: "Zinc Oxide Cream", manufacturer: "Himalaya", unit: "tube of 50g", mrp: 140, sellingPrice: 112, requiresPrescription: false, stockQuantity: 260, category: "Baby Care", description: "Soothes and protects baby's skin from diaper rash.", tags: ["baby", "rash"], ratingAverage: 4.6, ratingCount: 388 },
  { name: "Baby Diapers Medium (Pack of 44)", genericName: "Diapers", manufacturer: "Pampers", unit: "pack", mrp: 899, sellingPrice: 749, requiresPrescription: false, stockQuantity: 180, category: "Baby Care", description: "12-hour dry, soft diapers for babies 6-11kg.", tags: ["baby", "diapers"], ratingAverage: 4.7, ratingCount: 902 },
  { name: "Gentle Baby Wipes (Pack of 80)", genericName: "Baby Wipes", manufacturer: "Himalaya", unit: "pack", mrp: 199, sellingPrice: 159, requiresPrescription: false, stockQuantity: 300, category: "Baby Care", description: "Alcohol-free, fragrance-free wipes for sensitive skin.", tags: ["baby", "wipes"], ratingAverage: 4.5, ratingCount: 421 },
  { name: "Sunscreen SPF 50 PA+++", genericName: "Broad Spectrum Sunscreen", manufacturer: "Neutrogena", unit: "tube of 50g", mrp: 599, sellingPrice: 479, requiresPrescription: false, stockQuantity: 200, category: "Skin Care", description: "Lightweight, non-greasy broad-spectrum sun protection.", tags: ["sunscreen", "skin"], ratingAverage: 4.6, ratingCount: 733 },
  { name: "Aloe Vera Gel 300ml", genericName: "Aloe Vera", manufacturer: "Patanjali", unit: "bottle", mrp: 150, sellingPrice: 119, requiresPrescription: false, stockQuantity: 320, category: "Skin Care", description: "Soothing gel for skin hydration and mild sunburn relief.", tags: ["aloe vera", "skin"], ratingAverage: 4.4, ratingCount: 288 },
  { name: "Acne Care Face Wash", genericName: "Salicylic Acid Face Wash", manufacturer: "Cetaphil", unit: "bottle of 150ml", mrp: 450, sellingPrice: 369, requiresPrescription: false, stockQuantity: 210, category: "Skin Care", description: "Gentle cleanser that helps clear acne-prone skin.", tags: ["acne", "face wash"], ratingAverage: 4.3, ratingCount: 199 },
  { name: "Glucometer with 10 Strips", genericName: "Blood Glucose Meter", manufacturer: "Accu-Chek", unit: "kit", mrp: 1199, sellingPrice: 899, requiresPrescription: false, stockQuantity: 120, category: "Diabetes Care", description: "Simple, accurate at-home blood glucose monitoring kit.", tags: ["diabetes", "glucometer"], ratingAverage: 4.5, ratingCount: 244 },
  { name: "Sugar-Free Sweetener Pellets", genericName: "Sucralose", manufacturer: "Sugar Free", unit: "bottle of 300", mrp: 175, sellingPrice: 149, requiresPrescription: false, stockQuantity: 260, category: "Diabetes Care", description: "Zero-calorie sweetener safe for diabetics.", tags: ["diabetes", "sweetener"], ratingAverage: 4.2, ratingCount: 156 },
  { name: "Ashwagandha Capsules", genericName: "Withania Somnifera", manufacturer: "Himalaya", unit: "bottle of 60", mrp: 320, sellingPrice: 259, requiresPrescription: false, stockQuantity: 240, category: "Ayurveda & Herbal", description: "Adaptogenic herb traditionally used for stress relief.", tags: ["ayurveda", "stress"], ratingAverage: 4.4, ratingCount: 367 },
  { name: "Chyawanprash 500g", genericName: "Herbal Immunity Jam", manufacturer: "Dabur", unit: "jar", mrp: 260, sellingPrice: 219, requiresPrescription: false, stockQuantity: 300, category: "Ayurveda & Herbal", description: "Traditional Ayurvedic immunity-boosting herbal jam.", tags: ["ayurveda", "immunity"], ratingAverage: 4.5, ratingCount: 512 },
  { name: "Protein Bar (Pack of 6)", genericName: "Whey Protein Bar", manufacturer: "RiteBite", unit: "pack", mrp: 359, sellingPrice: 299, requiresPrescription: false, stockQuantity: 200, category: "Vitamins & Supplements", description: "High-protein, low-sugar snack bars for on-the-go energy.", tags: ["protein", "snack"], ratingAverage: 4.1, ratingCount: 145 },
];

const faqs = [
  { audience: "patient", category: "booking", question: "How do I book a check-up?", answer: "Choose a doctor, pick an available slot, pay the consultation fee, and you'll get a link to join the video call at that time.", order: 1 },
  { audience: "patient", category: "orders", question: "Can I pay cash on delivery for medicines?", answer: "Yes -- Cash on Delivery is available at checkout alongside online payment for every prescription order.", order: 2 },
  { audience: "patient", category: "store", question: "Do I need a prescription to buy from the store?", answer: "No. Everyday essentials -- vitamins, first-aid, devices, personal care -- can be added straight to your cart and checked out without a prescription. Items marked \"Prescription required\" still need a valid e-prescription from a doctor.", order: 3 },
  { audience: "patient", category: "store", question: "How do coupon codes work?", answer: "Apply a coupon code in your cart before checkout. It's validated against the minimum order value and expiry automatically, and the discount is reflected in your total before you pay.", order: 4 },
  { audience: "doctor", category: "onboarding", question: "What documents do I need to onboard?", answer: "A government ID, your medical registration certificate, degree certificate, and a profile photo.", order: 1 },
  { audience: "doctor", category: "payouts", question: "When do I get paid for consultations?", answer: "Consultation fees are settled to your linked bank account weekly, after KapHealth's platform fee.", order: 2 },
];

const coupons = [
  { code: "WELCOME50", description: "Flat ₹50 off on your first order", discountType: "flat", discountValue: 50, minOrderValue: 199, usageLimit: 1000, expiresAt: new Date("2026-12-31") },
  { code: "HEALTH10", description: "10% off on all essentials (up to ₹150)", discountType: "percent", discountValue: 10, maxDiscount: 150, minOrderValue: 299, usageLimit: null, expiresAt: new Date("2026-12-31") },
  { code: "VITAMIN15", description: "15% off orders above ₹500", discountType: "percent", discountValue: 15, maxDiscount: 250, minOrderValue: 500, usageLimit: 500, expiresAt: new Date("2026-10-31") },
  { code: "FREESHIP", description: "Flat ₹49 off to cover delivery", discountType: "flat", discountValue: 49, minOrderValue: 0, usageLimit: null, expiresAt: new Date("2027-01-01") },
];

const labTests = [
  { name: "Complete Blood Count (CBC)", category: "General Blood Work", description: "Measures red cells, white cells and platelets to screen for infection, anemia and more.", sampleType: "Blood", fastingRequired: false, reportTimeHours: 12, mrp: 500, price: 349, parametersCovered: 24 },
  { name: "Fasting Blood Sugar", category: "Diabetes", description: "Measures blood glucose after an 8-10 hour fast.", sampleType: "Blood", fastingRequired: true, reportTimeHours: 6, mrp: 200, price: 149, parametersCovered: 1 },
  { name: "HbA1c (Glycated Hemoglobin)", category: "Diabetes", description: "Average blood sugar over the past 3 months -- key for diabetes management.", sampleType: "Blood", fastingRequired: false, reportTimeHours: 24, mrp: 600, price: 449, parametersCovered: 1 },
  { name: "Thyroid Profile (T3, T4, TSH)", category: "Thyroid", description: "Checks thyroid hormone levels for hypo/hyperthyroidism.", sampleType: "Blood", fastingRequired: false, reportTimeHours: 24, mrp: 700, price: 499, parametersCovered: 3 },
  { name: "Liver Function Test (LFT)", category: "Liver", description: "Assesses liver health via enzymes, bilirubin and proteins.", sampleType: "Blood", fastingRequired: true, reportTimeHours: 24, mrp: 800, price: 599, parametersCovered: 12 },
  { name: "Kidney Function Test (KFT)", category: "Kidney", description: "Checks creatinine, urea and electrolytes for kidney health.", sampleType: "Blood", fastingRequired: false, reportTimeHours: 24, mrp: 750, price: 549, parametersCovered: 10 },
  { name: "Lipid Profile", category: "Cardiac", description: "Cholesterol and triglyceride levels to assess heart disease risk.", sampleType: "Blood", fastingRequired: true, reportTimeHours: 24, mrp: 700, price: 499, parametersCovered: 8 },
  { name: "Vitamin D (25-OH)", category: "Vitamin & Mineral", description: "Checks Vitamin D levels -- commonly deficient, affects bones and immunity.", sampleType: "Blood", fastingRequired: false, reportTimeHours: 48, mrp: 1500, price: 999, parametersCovered: 1 },
  { name: "Vitamin B12", category: "Vitamin & Mineral", description: "Checks B12 levels -- deficiency can cause fatigue and nerve issues.", sampleType: "Blood", fastingRequired: false, reportTimeHours: 48, mrp: 1200, price: 799, parametersCovered: 1 },
  { name: "COVID-19 RT-PCR", category: "COVID-19", description: "Gold-standard test to detect active COVID-19 infection.", sampleType: "Swab", fastingRequired: false, reportTimeHours: 24, mrp: 800, price: 599, parametersCovered: 1 },
  { name: "PSA (Prostate Specific Antigen)", category: "Men's Health", description: "Screens for prostate conditions including cancer risk.", sampleType: "Blood", fastingRequired: false, reportTimeHours: 24, mrp: 900, price: 649, parametersCovered: 1 },
  { name: "PCOS Hormone Panel", category: "Women's Health", description: "Hormone panel to assess PCOS/PCOD -- LH, FSH, prolactin and more.", sampleType: "Blood", fastingRequired: true, reportTimeHours: 48, mrp: 2200, price: 1599, parametersCovered: 6 },
  { name: "CA-125 (Ovarian Cancer Marker)", category: "Cancer Screening", description: "Tumor marker used in ovarian cancer screening and monitoring.", sampleType: "Blood", fastingRequired: false, reportTimeHours: 48, mrp: 1400, price: 999, parametersCovered: 1 },
  { name: "Full Body Checkup - Essential", category: "Full Body Checkup", description: "CBC, sugar, lipid, liver and kidney profile bundled together.", sampleType: "Blood", fastingRequired: true, reportTimeHours: 24, mrp: 2500, price: 1499, parametersCovered: 60 },
  { name: "Full Body Checkup - Comprehensive", category: "Full Body Checkup", description: "72-parameter checkup covering blood, hormones, vitamins and cardiac risk.", sampleType: "Blood", fastingRequired: true, reportTimeHours: 48, mrp: 4999, price: 2999, parametersCovered: 72 },
];

async function run() {
  await connectDB();

  await Promise.all([Medicine.deleteMany({}), Faq.deleteMany({}), Coupon.deleteMany({}), LabTest.deleteMany({})]);

  await Medicine.insertMany(medicines);
  await Faq.insertMany(faqs);
  await Coupon.insertMany(coupons);
  await LabTest.insertMany(labTests);

  console.log(`Seeded ${medicines.length} medicines, ${faqs.length} FAQs, ${coupons.length} coupons, ${labTests.length} lab tests.`);
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
