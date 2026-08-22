const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
const { assertEnv } = require("./config/env");
const { initVideoChatSocket } = require("./sockets/videoChat");
const { startAppointmentReminderJob } = require("./jobs/appointmentReminders");

assertEnv();

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();

  const httpServer = http.createServer(app);
  initVideoChatSocket(httpServer);
  startAppointmentReminderJob();

  httpServer.listen(PORT, () => {
    console.log(`[server] KapHealth API listening on port ${PORT}`);
  });
}

start();
