const { verifyAccessToken } = require("../utils/jwt");
const User = require("../models/User");

/**
 * Verifies the Bearer access token and attaches `req.user` (lean identity:
 * id, role, status). Does not hit the DB unless the token is valid, keeping
 * unauthenticated requests cheap.
 */
async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Authentication required" });

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.sub).select("_id role status");
    if (!user || user.status !== "active") {
      return res.status(401).json({ message: "Account not active" });
    }
    req.user = { id: user._id.toString(), role: user.role };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

/** Restrict a route to one or more roles, e.g. requireRole("doctor") */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "You do not have access to this resource" });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
