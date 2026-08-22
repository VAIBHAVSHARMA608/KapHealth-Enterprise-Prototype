const required = [
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "MONGO_URI",
  "ADMIN_ACCESS_KEY",
];

// Values that ship in .env.example as working local defaults. They're fine
// for development, but must never be used in a real deployment -- if any of
// these leak into production the JWTs and the hidden admin panel are both
// forgeable by anyone who's read this repo (or this chat).
const INSECURE_DEFAULTS = new Set([
  "dev_access_secret_change_me",
  "dev_refresh_secret_change_me",
  "dev_admin_access_key_change_me",
  "kap-ops-9f2a1c",
]);

function assertEnv() {
  const isProd = process.env.NODE_ENV === "production";
  const missing = required.filter((k) => !process.env[k]);
  const insecure = required.filter((k) => process.env[k] && INSECURE_DEFAULTS.has(process.env[k]));

  if (missing.length) {
    const msg = `Missing required env vars: ${missing.join(", ")}. Copy .env.example to .env and fill values.`;
    if (isProd) throw new Error(`[env] ${msg}`);
    console.warn(`[env] Warning: ${msg}`);
  }

  if (insecure.length) {
    const msg = `These env vars are still set to their bundled example/dev values: ${insecure.join(", ")}. Generate real random secrets before deploying.`;
    if (isProd) throw new Error(`[env] ${msg}`);
    console.warn(`[env] Warning: ${msg}`);
  }

  if (isProd && process.env.ENABLE_TEST_LOGIN !== "false") {
    throw new Error(
      "[env] ENABLE_TEST_LOGIN must be explicitly set to \"false\" in production -- it's a password-login bypass meant for local QA only."
    );
  }
}

module.exports = { assertEnv };
