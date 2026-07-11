/**
 * Extra gate in front of every /api/admin/* route, on top of normal auth.
 *
 * Defense in depth for the "hidden, only-you" panel:
 *  1. requireAuth() already verified a valid JWT.
 *  2. requireRole("admin") already verified the account's role.
 *  3. This middleware ALSO requires a secret header (x-admin-key) that only
 *     you hold, so even a leaked/forged admin JWT is useless without it.
 *
 * In production, additionally consider an IP allowlist at the
 * load-balancer/nginx layer for /api/admin and the admin frontend route.
 */
function requireAdminKey(req, res, next) {
  const key = req.headers["x-admin-key"];
  if (!key || key !== process.env.ADMIN_ACCESS_KEY) {
    // Intentionally vague message + same status as "not found" to avoid
    // revealing that an admin surface exists at all.
    return res.status(404).json({ message: "Not found" });
  }
  next();
}

module.exports = { requireAdminKey };
