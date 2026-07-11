import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";

/**
 * Manages one WebRTC peer connection + the socket.io signaling channel for a
 * single appointment room. Kept as a hook so both the patient and doctor
 * consult-room pages can share identical call logic.
 */
export function useVideoCall({ roomId, accessToken, iceServers }) {
  const [connected, setConnected] = useState(false);
  const [remoteJoined, setRemoteJoined] = useState(false);
  const [messages, setMessages] = useState([]);
  const [callEnded, setCallEnded] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const socketRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);

  const sendMessage = useCallback((text) => {
    if (!text.trim()) return;
    socketRef.current?.emit("chat-message", { roomId, text });
  }, [roomId]);

  const hangUp = useCallback(() => {
    socketRef.current?.emit("call-ended", { roomId });
    pcRef.current?.close();
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    setCallEnded(true);
  }, [roomId]);

  useEffect(() => {
    if (!roomId || !accessToken) return;
    let cancelled = false;

    async function setup() {
      const pc = new RTCPeerConnection({ iceServers: iceServers?.length ? iceServers : [{ urls: "stun:stun.l.google.com:19302" }] });
      pcRef.current = pc;

      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (cancelled) return;
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
      };

      const socket = io("/", { path: "/socket.io", auth: { token: accessToken } });
      socketRef.current = socket;

      pc.onicecandidate = (event) => {
        if (event.candidate) socket.emit("webrtc-ice-candidate", { roomId, candidate: event.candidate });
      };

      socket.on("connect", () => {
        setConnected(true);
        socket.emit("join-room", { roomId });
      });

      socket.on("chat-history", (history) => setMessages(history));
      socket.on("chat-message", (msg) => setMessages((m) => [...m, msg]));

      // Whoever's already in the room when a peer joins makes the offer.
      socket.on("peer-joined", async () => {
        setRemoteJoined(true);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("webrtc-offer", { roomId, offer });
      });

      socket.on("webrtc-offer", async ({ offer }) => {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("webrtc-answer", { roomId, answer });
        setRemoteJoined(true);
      });

      socket.on("webrtc-answer", async ({ answer }) => {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      });

      socket.on("webrtc-ice-candidate", async ({ candidate }) => {
        try { await pc.addIceCandidate(candidate); } catch { /* ignore late candidates */ }
      });

      socket.on("peer-left", () => setRemoteJoined(false));
      socket.on("call-ended", () => setCallEnded(true));
    }

    setup();

    return () => {
      cancelled = true;
      socketRef.current?.disconnect();
      pcRef.current?.close();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [roomId, accessToken, iceServers]);

  return { localVideoRef, remoteVideoRef, connected, remoteJoined, messages, sendMessage, hangUp, callEnded };
}
