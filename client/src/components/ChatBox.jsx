import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  CheckCheck,
  LockKeyhole,
  MoreVertical,
  Paperclip,
  Send,
  Smile,
} from "lucide-react";

function formatMessageTime(date) {
  const value = new Date(date);

  if (Number.isNaN(value.getTime())) return "";

  return value.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getSenderName(message, mine) {
  if (mine) return "You";

  if (typeof message.sender === "object" && message.sender?.name) {
    return message.sender.name;
  }

  return "Care team";
}

function formatMessageDay(date) {
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return "";

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (value.toDateString() === today.toDateString()) return "Today";
  if (value.toDateString() === yesterday.toDateString()) return "Yesterday";

  return value.toLocaleDateString([], {
    day: "numeric",
    month: "short",
    year: value.getFullYear() === today.getFullYear() ? undefined : "numeric",
  });
}

export default function ChatBox({
  messages = [],
  onSend,
  myUserId,
}) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [focused, setFocused] = useState(false);

  const endRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({
      behavior: messages.length > 1 ? "smooth" : "auto",
    });
  }, [messages]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 128)}px`;
  }, [text]);

  const groupedMessages = useMemo(() => {
    let previousDay = null;

    return messages.map((message, index) => {
      const day = message.createdAt ? formatMessageDay(message.createdAt) : "";
      const showDay = day && day !== previousDay;
      previousDay = day || previousDay;

      return { message, index, day, showDay };
    });
  }, [messages]);

  const handleSubmit = async (e) => {
    e?.preventDefault();

    const message = text.trim();

    if (!message || sending) return;

    try {
      setSending(true);
      await onSend(message);
      setText("");
    } finally {
      setSending(false);
      requestAnimationFrame(() => textareaRef.current?.focus());
    }
  };

  return (
    <section className="flex h-full min-h-[520px] flex-col overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/70 shadow-[0_18px_55px_rgba(15,23,42,0.08)] backdrop-blur-2xl">
      {/* Header */}
      <header className="relative border-b border-slate-200/70 bg-white/60 px-4 py-3.5 sm:px-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/10">
              <LockKeyhole size={18} strokeWidth={1.8} />

              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="truncate text-sm font-semibold tracking-tight text-slate-900 sm:text-base">
                  Consultation Chat
                </h2>

                <span className="hidden rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-700 sm:inline-flex">
                  Secure
                </span>
              </div>

              <p className="mt-0.5 truncate text-[11px] text-slate-500">
                Private messages between you and your care team
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="hidden rounded-full border border-slate-200 bg-white/70 px-2 py-1 text-[9px] font-semibold text-slate-400 sm:inline-flex">
              Live
            </span>
            <button
              type="button"
              aria-label="Chat options"
              title="Chat options"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              <MoreVertical size={17} />
            </button>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent" />
      </header>

      {/* Messages */}
      <div className="relative flex-1 overflow-y-auto scrollbar-thin bg-gradient-to-b from-slate-50/80 via-white/40 to-primary/[0.025] px-3 py-5 sm:px-5">
        {/* Subtle conversation watermark */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.025]">
          <LockKeyhole size={150} strokeWidth={1} />
        </div>

        {messages.length === 0 ? (
          <div className="relative flex h-full min-h-[360px] items-center justify-center px-5">
            <div className="max-w-sm text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/10 bg-primary/[0.06] text-primary shadow-sm">
                <LockKeyhole size={27} strokeWidth={1.6} />
              </div>

              <span className="inline-flex rounded-full bg-primary/8 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-primary">
                Secure consultation
              </span>

              <h3 className="mt-3 text-base font-semibold tracking-tight text-slate-800 sm:text-lg">
                Start your conversation
              </h3>

              <p className="mt-1.5 text-xs leading-5 text-slate-500 sm:text-sm">
                Messages shared during this consultation stay within your
                secure Kapstone care session.
              </p>
            </div>
          </div>
        ) : (
          <div className="relative space-y-5">
            {groupedMessages.map(({ message, index, day, showDay }) => {
              const mine =
                (message.sender?._id || message.sender) === myUserId;

              const previous = messages[index - 1];
              const previousMine =
                previous &&
                (previous.sender?._id || previous.sender) === myUserId;

              const grouped = previous && previousMine === mine;

              return (
                <div key={message._id || index}>
                  {showDay && (
                    <div className="mb-4 mt-2 flex items-center justify-center">
                      <span className="rounded-full border border-slate-200/80 bg-white/80 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400 shadow-sm backdrop-blur">
                        {day}
                      </span>
                    </div>
                  )}

                  <div
                  className={[
                    "flex w-full animate-fade-up",
                    mine ? "justify-end" : "justify-start",
                    grouped ? "mt-[-0.75rem]" : "",
                  ].join(" ")}
                  style={{ animationDelay: `${Math.min(index * 25, 150)}ms` }}
                >
                  <div className="max-w-[88%] sm:max-w-[76%] lg:max-w-[70%]">
                    {!grouped && (
                      <p
                        className={[
                          "mb-1.5 px-1 text-[10px] font-semibold text-slate-400",
                          mine ? "text-right" : "text-left",
                        ].join(" ")}
                      >
                        {getSenderName(message, mine)}
                      </p>
                    )}

                    <div
                      className={[
                        "relative break-words px-4 py-2.5 shadow-sm transition-shadow duration-200",
                        mine
                          ? [
                              "rounded-2xl rounded-br-md",
                              "bg-primary text-white",
                              "shadow-primary/10",
                              "hover:shadow-md hover:shadow-primary/15",
                            ].join(" ")
                          : [
                              "rounded-2xl rounded-bl-md",
                              "border border-slate-200/80 bg-white text-slate-800",
                              "shadow-slate-900/[0.035]",
                              "hover:shadow-md",
                            ].join(" "),
                        grouped
                          ? mine
                            ? "rounded-tr-md"
                            : "rounded-tl-md"
                          : "",
                      ].join(" ")}
                    >
                      <p className="whitespace-pre-wrap text-[13px] leading-5.5 sm:text-sm sm:leading-6">
                        {message.text}
                      </p>

                      {message.createdAt && (
                        <div
                          className={[
                            "mt-1.5 flex items-center justify-end gap-1.5 text-[10px]",
                            mine ? "text-white/65" : "text-slate-400",
                          ].join(" ")}
                        >
                          <span>{formatMessageTime(message.createdAt)}</span>

                          {mine &&
                            (message.readAt ? (
                              <CheckCheck size={12} />
                            ) : (
                              <Check size={12} />
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                </div>
              );
            })}

            <div ref={endRef} />
          </div>
        )}
      </div>

      {/* Composer */}
      <footer className="border-t border-slate-200/70 bg-white/75 p-3 sm:p-4">
        <form onSubmit={handleSubmit}>
          <div
            className={[
              "relative flex items-end gap-2 rounded-2xl border bg-white/80 p-1.5",
              "shadow-sm backdrop-blur-xl transition-all duration-200",
              focused
                ? "border-primary/35 ring-4 ring-primary/8"
                : "border-slate-200 hover:border-slate-300",
            ].join(" ")}
          >
            <button
              type="button"
              aria-label="Attach a file"
              className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              <Paperclip size={17} />
            </button>

            <textarea
              ref={textareaRef}
              rows={1}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Write a secure message..."
              aria-label="Message"
              maxLength={2000}
              className="max-h-32 min-h-[38px] flex-1 resize-none bg-transparent px-1.5 py-2 text-sm leading-5 text-slate-800 outline-none placeholder:text-slate-400"
            />

            <button
              type="button"
              aria-label="Add emoji"
              className="mb-0.5 hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:flex"
            >
              <Smile size={17} />
            </button>

            <button
              type="submit"
              disabled={!text.trim() || sending}
              aria-label="Send message"
              className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-sm shadow-primary/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-md disabled:pointer-events-none disabled:opacity-35"
            >
              {sending ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
              ) : (
                <Send size={17} />
              )}
            </button>
          </div>

          <div className="mt-2 flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400">
              <LockKeyhole size={11} className="text-primary/70" />
              Secure consultation chat
              <span className="text-slate-300">•</span>
              <span>{text.length}/2000</span>
            </div>

            <span className="hidden text-[10px] text-slate-400 sm:inline">
              Enter to send · Shift + Enter for new line
            </span>
          </div>
        </form>
      </footer>
    </section>
  );
}
