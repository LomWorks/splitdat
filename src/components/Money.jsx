import { motion } from "motion/react";

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function Money({
  amount,
  size = "md",
  highlight = false,
  animate = true,
  className = "",
}) {
  const sizeClass = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-2xl",
  }[size];

  const content = (
    <span
      className={`money ${sizeClass} ${highlight ? "money--highlight" : ""} ${className}`}
      style={{
        fontVariantNumeric: "tabular-nums",
        fontWeight: highlight ? 700 : 600,
        color: highlight ? "var(--ink-950)" : "var(--text-secondary)",
      }}
    >
      {formatter.format(amount)}
    </span>
  );

  if (!animate) return content;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {content}
    </motion.div>
  );
}