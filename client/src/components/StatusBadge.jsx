import {
  CheckCircle2,
  Clock3,
  AlertTriangle,
  XCircle,
  Loader2,
} from "lucide-react";

const STATUS = {
  success: {
    bg: "bg-status-success/15 border border-status-success/30",
    text: "text-status-success",
    icon: CheckCircle2,
  },

  pending: {
    bg: "bg-status-pending/15 border border-status-pending/30",
    text: "text-status-pending",
    icon: Clock3,
  },

  warning: {
    bg: "bg-status-pending/15 border border-status-pending/30",
    text: "text-status-pending",
    icon: AlertTriangle,
  },

  danger: {
    bg: "bg-accent/15 border border-accent/30",
    text: "text-accent",
    icon: XCircle,
  },

  processing: {
    bg: "bg-status-active/15 border border-status-active/30",
    text: "text-status-active",
    icon: Loader2,
  },

  info: {
    bg: "bg-status-active/15 border border-status-active/30",
    text: "text-status-active",
    icon: Clock3,
  },

  gray: {
    bg: "bg-white/5 border border-white/10",
    text: "text-muted",
    icon: Clock3,
  },
};

export default function StatusBadge({
  tone = "gray",
  children,
}) {
  const current = STATUS[tone] || STATUS.gray;
  const Icon = current.icon;

  return (
    <span
      className={`
      inline-flex
      items-center
      gap-2
      rounded-full
      px-3
      py-1.5
      text-xs
      font-semibold
      tracking-wide
      shadow-sm
      transition-all
      duration-300
      hover:scale-105
      ${current.bg}
      ${current.text}
    `}
    >
      <Icon
        size={14}
        className={
          tone === "processing"
            ? "animate-spin"
            : ""
        }
      />

      {children}
    </span>
  );
}