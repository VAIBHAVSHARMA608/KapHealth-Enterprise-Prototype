import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";

export default function ChatBox({ messages, onSend, myUserId }) {
  const [text, setText] = useState("");
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.length === 0 && <p className="text-center text-xs text-muted">Messages during this call appear here.</p>}
        {messages.map((m) => {
          const mine = (m.sender?._id || m.sender) === myUserId;
          return (
            <div key={m._id || Math.random()} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${mine ? "bg-primary text-white" : "bg-black/5 text-ink"}`}>
                {m.text}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      <form
        onSubmit={(e) => { e.preventDefault(); onSend(text); setText(""); }}
        className="flex items-center gap-2 border-t border-line p-3"
      >
        <input className="input flex-1" placeholder="Type a message" value={text} onChange={(e) => setText(e.target.value)} />
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white"><Send size={16} /></button>
      </form>
    </div>
  );
}
