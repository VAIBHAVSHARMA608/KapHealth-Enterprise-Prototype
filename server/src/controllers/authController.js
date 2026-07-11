const User = require("../models/User");
const PatientProfile = require("../models/PatientProfile");
const OtpChallenge = require("../models/OtpChallenge");
const { generateOtpCode, hashOtp, verifyOtpHash, sendWhatsAppOtp } = require("../utils/whatsapp");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../utils/jwt");
const { OAuth2Client } = require("google-auth-library");
const bcrypt = require("bcryptjs");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function issueTokens(res, user) {
  const payload = { sub: user._id.toString(), role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  res.cookie("kap_refresh", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: "/api/auth/refresh",
  });

  return accessToken;
}

/** STEP 1: request a WhatsApp OTP for login or signup */
async function requestOtp(req, res, next) {
  try {
    const { phone, purpose } = req.body;

    const code = generateOtpCode();
    const codeHash = await hashOtp(code);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await OtpChallenge.deleteMany({ phone, purpose }); // invalidate previous codes
    await OtpChallenge.create({ phone, codeHash, purpose, expiresAt });

    await sendWhatsAppOtp(phone, code);

    res.json({ message: "OTP sent via WhatsApp", expiresInSeconds: 300 });
  } catch (err) {
    next(err);
  }
}

/** STEP 2: verify the code, create the user if new, and log them in */
async function verifyOtp(req, res, next) {
  try {
    const { phone, code, name, role } = req.body;

    const challenge = await OtpChallenge.findOne({ phone, purpose: "login" }).sort({ createdAt: -1 });
    if (!challenge) return res.status(400).json({ message: "Request a new OTP" });
    if (challenge.expiresAt < new Date()) return res.status(400).json({ message: "OTP expired" });
    if (challenge.attempts >= 5) return res.status(429).json({ message: "Too many attempts, request a new OTP" });

    const isMatch = await verifyOtpHash(code, challenge.codeHash);
    if (!isMatch) {
      challenge.attempts += 1;
      await challenge.save();
      return res.status(400).json({ message: "Incorrect code" });
    }

    challenge.verified = true;
    await challenge.save();

    let user = await User.findOne({ phone });
    let isNewUser = false;
    if (!user) {
      isNewUser = true;
      user = await User.create({
        name: name || "New User",
        phone,
        role: role || "patient",
        isPhoneVerified: true,
        authProviders: { whatsapp: true },
      });
      if (user.role === "patient") {
        await PatientProfile.create({ user: user._id });
      }
    } else if (!user.isPhoneVerified) {
      user.isPhoneVerified = true;
      user.authProviders.whatsapp = true;
      await user.save();
    }

    user.lastLoginAt = new Date();
    await user.save();

    const accessToken = issueTokens(res, user);
    res.json({
      accessToken,
      isNewUser,
      user: { id: user._id, name: user.name, phone: user.phone, role: user.role },
    });
  } catch (err) {
    next(err);
  }
}

/** Google Sign-In (One Tap / OAuth code flow -> ID token verified server-side) */
async function googleLogin(req, res, next) {
  try {
    const { idToken, role } = req.body;

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email_verified) {
      return res.status(401).json({ message: "Google account not verified" });
    }

    let user = await User.findOne({ $or: [{ googleId: payload.sub }, { email: payload.email }] });
    let isNewUser = false;
    if (!user) {
      isNewUser = true;
      user = await User.create({
        name: payload.name || payload.email.split("@")[0],
        email: payload.email,
        googleId: payload.sub,
        avatarUrl: payload.picture || "",
        role: role || "patient",
        isEmailVerified: true,
        authProviders: { google: true },
      });
      if (user.role === "patient") {
        await PatientProfile.create({ user: user._id });
      }
    } else if (!user.googleId) {
      user.googleId = payload.sub;
      user.authProviders.google = true;
      await user.save();
    }

    user.lastLoginAt = new Date();
    await user.save();

    const accessToken = issueTokens(res, user);
    res.json({
      accessToken,
      isNewUser,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl },
    });
  } catch (err) {
    next(err);
  }
}

/** Rotate an access token using the httpOnly refresh cookie */
async function refresh(req, res, next) {
  try {
    const token = req.cookies?.kap_refresh;
    if (!token) return res.status(401).json({ message: "No refresh token" });
    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.sub);
    if (!user || user.status !== "active") return res.status(401).json({ message: "Invalid session" });
    const accessToken = issueTokens(res, user);
    res.json({ accessToken });
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired refresh token" });
  }
}

async function logout(req, res) {
  res.clearCookie("kap_refresh", { path: "/api/auth/refresh" });
  res.json({ message: "Logged out" });
}

/** Separate credential login for the hidden admin panel only (no OTP/Google). */
async function adminLogin(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, role: "admin" }).select("+passwordHash");
    if (!user || !user.passwordHash) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    user.lastLoginAt = new Date();
    await user.save();

    const accessToken = issueTokens(res, user);
    res.json({ accessToken, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

module.exports = { requestOtp, verifyOtp, googleLogin, refresh, logout, adminLogin, me };
