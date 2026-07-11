const TONES = {
  green: "bg-primary-light text-primary-dark",
  amber: "bg-amber-100 text-amber-700",
  red: "bg-red-100 text-red-700",
  coral: "bg-accent-light text-accent-dark",
  gray: "bg-black/5 text-muted",
};

export default function StatusBadge({ tone = "gray", children }) {
  return <span className={`badge ${TONES[tone] || TONES.gray}`}>{children}</span>;
}
