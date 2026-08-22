/**
 * Extra gate in front of every /api/admin/* route, on top of normal auth.
 *
 * Defense in depth for the "hidden, only-you" panel:
 *  1. requireAuth() already verified a valid JWT.
 *  2. requireRole("admin") already verified the account's role.
 *  3. This middleware ALSO requires a secret header (x-admin-key) that only
 *     you hold, so even a leaked/forged admin JWT is useless without it.
 *
 * ADMIN_ACCESS_KEY has no hardcoded fallback here on purpose -- assertEnv()
 * (config/env.js) already refuses to boot in production without a real,
 * non-default value set, so if we got this far it's safe to read directly.
 * In production, additionally consider an IP allowlist at the
 * load-balancer/nginx layer for /api/admin and the admin frontend route.
 */
function requireAdminKey(req, res, next) {
  const expected = process.env.ADMIN_ACCESS_KEY;
  const key = typeof req.headers["x-admin-key"] === "string"
    ? req.headers["x-admin-key"].trim()
    : "";

  if (!expected || !key || key !== expected) {
    return res.status(404).json({ message: "Not found" });
  }

  next();
}

module.exports = { requireAdminKey };
