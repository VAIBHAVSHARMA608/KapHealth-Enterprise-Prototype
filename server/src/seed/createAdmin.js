/**
 * Run once: `npm run seed:admin`
 * Creates (or updates the password of) the single owner admin account used
 * to log into the hidden panel. There is intentionally NO public signup
 * route for the admin role -- this script is the only way to create one.
 */
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const User = require("../models/User");

async function run() {
  await connectDB();

  const email = process.env.ADMIN_SEED_EMAIL;
  const password = process.env.ADMIN_SEED_PASSWORD;
  if (!email || !password) {
    console.error("Set ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD in .env first.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const existing = await User.findOne({ email, role: "admin" });

  if (existing) {
    existing.passwordHash = passwordHash;
    existing.authProviders.password = true;
    await existing.save();
    console.log(`Updated password for existing admin: ${email}`);
  } else {
    await User.create({
      name: "KapHealth Admin",
      email,
      passwordHash,
      role: "admin",
      isEmailVerified: true,
      authProviders: { password: true },
    });
    console.log(`Created admin account: ${email}`);
  }

  console.log("Remember: also set ADMIN_ACCESS_KEY in .env -- it's required on every admin API call.");
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
