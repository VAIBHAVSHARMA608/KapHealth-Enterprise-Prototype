import {
  CheckCircle2,
  Clock3,
  AlertTriangle,
  XCircle,
  Loader2,
} from "lucide-react";

const STATUS = {
  success: {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    icon: CheckCircle2,
  },

  pending: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    icon: Clock3,
  },

  warning: {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    icon: AlertTriangle,
  },

  danger: {
    bg: "bg-red-100",
    text: "text-red-700",
    icon: XCircle,
  },

  processing: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    icon: Loader2,
  },

  info: {
    bg: "bg-cyan-100",
    text: "text-cyan-700",
    icon: Clock3,
  },

  gray: {
    bg: "bg-slate-100",
    text: "text-slate-600",
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