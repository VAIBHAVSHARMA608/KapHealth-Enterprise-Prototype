require("dotenv").config();
const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
const { assertEnv } = require("./config/env");
const { initVideoChatSocket } = require("./sockets/videoChat");

assertEnv();

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();

  const httpServer = http.createServer(app);
  initVideoChatSocket(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`[server] KapHealth API listening on port ${PORT}`);
  });
}

start();
