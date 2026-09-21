const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../src/.env') });
const axios = require('axios');

async function run() {
  try {
    const serverBase = `http://localhost:${process.env.PORT || 5000}`;
    const email = process.env.ADMIN_SEED_EMAIL;
    const password = process.env.ADMIN_SEED_PASSWORD;
    console.log('Attempting admin login for', email);

    const loginRes = await axios.post(`${serverBase}/api/auth/admin-login`, { email, password }, { withCredentials: true });
    console.log('Login response status:', loginRes.status);
    const accessToken = loginRes.data?.accessToken;
    if (!accessToken) {
      console.error('No access token received');
      process.exit(1);
    }

    const adminKey = process.env.ADMIN_ACCESS_KEY;
    const dashRes = await axios.get(`${serverBase}/api/admin/dashboard`, { headers: { Authorization: `Bearer ${accessToken}`, 'x-admin-key': adminKey }, withCredentials: true });
    console.log('Dashboard fetch status:', dashRes.status);
    console.log('Dashboard keys:', Object.keys(dashRes.data || {}));
    process.exit(0);
  } catch (err) {
    console.error('Error during admin test:', err.response?.status, err.response?.data || err.message);
    process.exit(1);
  }
}

run();
