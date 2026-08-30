import { motion } from "motion/react";
import "../styles/Card.css";

export default function Card({
  children,
  variant = "default",
  elevated = false,
  className = "",
  ...props
}) {
  return (
    <motion.div
      className={`card card--${variant} ${elevated ? "card--elevated" : ""} ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}