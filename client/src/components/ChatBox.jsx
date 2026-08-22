import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";

export default function ChatBox({
  messages = [],
  onSend,
  myUserId,
}) {
  const [text, setText] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!text.trim()) return;

    onSend(text.trim());
    setText("");
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-2xl shadow-glass">

      {/* Header */}

      <div className="border-b border-white/10 bg-white/5 px-5 py-4">
        <h2 className="text-lg font-semibold text-ink">
          Consultation Chat
        </h2>

        <p className="mt-1 text-xs text-muted">
          🔒 Secure & Encrypted Messages
        </p>
      </div>

      {/* Messages */}

      <div className="flex-1 overflow-y-auto px-4 py-5">

        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">

              <div className="mb-3 text-5xl">
                💬
              </div>

              <h3 className="font-semibold text-ink">
                Start Consultation
              </h3>

              <p className="mt-1 text-sm text-muted">
                Messages exchanged during this consultation will appear here.
              </p>

            </div>
          </div>
        ) : (

          <div className="space-y-4">

            {messages.map((m, index) => {

              const mine =
                (m.sender?._id || m.sender) === myUserId;

              return (

                <div
                  key={m._id || index}
                  className={`flex ${
                    mine
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >

                  <div
                    className={`
                    max-w-[90%]
                    sm:max-w-[75%]
                    lg:max-w-[60%]
                    rounded-2xl
                    px-4
                    py-3
                    shadow-sm
                    break-words
                    ${
                      mine
                        ? "bg-primary text-white rounded-br-md"
                        : "bg-white/10 border border-white/10 text-ink rounded-bl-md backdrop-blur-md"
                    }
                  `}
                  >

                    <p className="leading-6">
                      {m.text}
                    </p>

                    {m.createdAt && (
                      <p
                        className={`mt-2 text-[11px] ${
                          mine
                            ? "text-white/80"
                            : "text-muted"
                        }`}
                      >
                        {new Date(
                          m.createdAt
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    )}

                  </div>

                </div>

              );

            })}

            <div ref={endRef} />

          </div>

        )}

      </div>

      {/* Input */}

      <form
        onSubmit={handleSubmit}
        className="border-t border-white/10 bg-white/5 p-4"
      >

        <div className="flex items-end gap-3">

          <textarea
            rows={1}
            value={text}
            onChange={(e) =>
              setText(e.target.value)
            }
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey
              ) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Type your message..."
            className="
            min-h-[48px]
            max-h-32
            flex-1
            resize-none
            rounded-xl
            border
            border-white/15 bg-white/5 text-ink placeholder:text-muted/60
            px-4
            py-3
            text-sm
            outline-none
            transition
            focus:border-primary
            focus:ring-2
            focus:ring-primary/20
            "
          />

          <button
            type="submit"
            disabled={!text.trim()}
            className="
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-xl
            bg-primary
            text-white
            transition-all
            hover:scale-105
            hover:shadow-lg
            disabled:cursor-not-allowed
            disabled:opacity-40
            "
          >
            <Send size={18} />
          </button>

        </div>

      </form>

    </div>
  );
}