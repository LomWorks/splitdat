import { motion } from "motion/react";
import "../styles/Button.css";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  icon,
  className = "",
  ...props
}) {
  return (
    <motion.button
      className={`button button--${variant} button--${size} ${className}`}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      {...props}
    >
      {loading && <span className="button-spinner" aria-hidden="true" />}
      {icon && <span className="button-icon">{icon}</span>}
      <span>{children}</span>
    </motion.button>
  );
}