const { Server } = require("socket.io");
const { verifyAccessToken } = require("../utils/jwt");
const Appointment = require("../models/Appointment");
const ChatMessage = require("../models/ChatMessage");

/**
 * WebRTC signaling + text chat over socket.io, scoped per-appointment room.
 * This server only relays SDP offers/answers and ICE candidates between the
 * two participants — actual audio/video travels peer-to-peer (or via TURN)
 * once the connection is established, never through this server.
 */
function initVideoChatSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_URL || "*", credentials: true },
  });

  // Authenticate every socket connection using the same access token as the REST API.
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication required"));
      const decoded = verifyAccessToken(token);
      socket.user = { id: decoded.sub, role: decoded.role };
      next();
    } catch (err) {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("join-room", async ({ roomId }) => {
      try {
        const appointment = await Appointment.findOne({ roomId });
        if (!appointment) return socket.emit("error-message", "Room not found");

        const isParticipant =
          appointment.patient.toString() === socket.user.id || appointment.doctor.toString() === socket.user.id;
        if (!isParticipant) return socket.emit("error-message", "Not authorized for this room");

        socket.join(roomId);
        socket.roomId = roomId;
        socket.senderRole = appointment.patient.toString() === socket.user.id ? "patient" : "doctor";

        socket.to(roomId).emit("peer-joined", { userId: socket.user.id, role: socket.senderRole });

        // Send chat history so a reconnect doesn't lose the transcript
        const history = await ChatMessage.find({ appointment: appointment._id }).sort({ createdAt: 1 }).limit(200);
        socket.emit("chat-history", history);
      } catch (err) {
        socket.emit("error-message", "Failed to join room");
      }
    });

    // ---- WebRTC signaling relay ----
    socket.on("webrtc-offer", ({ roomId, offer }) => {
      socket.to(roomId).emit("webrtc-offer", { offer, fromUserId: socket.user.id });
    });
    socket.on("webrtc-answer", ({ roomId, answer }) => {
      socket.to(roomId).emit("webrtc-answer", { answer, fromUserId: socket.user.id });
    });
    socket.on("webrtc-ice-candidate", ({ roomId, candidate }) => {
      socket.to(roomId).emit("webrtc-ice-candidate", { candidate, fromUserId: socket.user.id });
    });

    // ---- Text chat (persisted) ----
    socket.on("chat-message", async ({ roomId, text }) => {
      try {
        const appointment = await Appointment.findOne({ roomId });
        if (!appointment) return;
        const message = await ChatMessage.create({
          appointment: appointment._id,
          sender: socket.user.id,
          senderRole: socket.senderRole,
          text: text.slice(0, 2000),
        });
        io.to(roomId).emit("chat-message", message);
      } catch (err) {
        socket.emit("error-message", "Message failed to send");
      }
    });

    socket.on("call-ended", ({ roomId }) => {
      socket.to(roomId).emit("call-ended", { by: socket.user.id });
    });

    socket.on("disconnect", () => {
      if (socket.roomId) {
        socket.to(socket.roomId).emit("peer-left", { userId: socket.user.id });
      }
    });
  });

  return io;
}

module.exports = { initVideoChatSocket };
