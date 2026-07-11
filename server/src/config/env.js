const required = [
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "MONGO_URI",
  "ADMIN_ACCESS_KEY",
];

function assertEnv() {
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) {
    console.warn(
      `[env] Warning: missing env vars: ${missing.join(", ")}. Copy .env.example to .env and fill values.`
    );
  }
}

module.exports = { assertEnv };
