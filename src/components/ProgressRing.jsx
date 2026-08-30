import { motion } from "motion/react";
import "../styles/ProgressRing.css";

export default function ProgressRing({
  total,
  claimed,
  unclaimed,
  size = "lg",
}) {
  const percentage = total > 0 ? (claimed / total) * 100 : 0;
  const radius = size === "sm" ? 40 : size === "md" ? 60 : 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`progress-ring progress-ring--${size}`}>
      <svg viewBox="0 0 200 200" width={radius * 2.5} height={radius * 2.5}>
        {/* Background circle */}
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="var(--mist-100)"
          strokeWidth="8"
        />

        {/* Progress circle */}
        <motion.circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          stroke="var(--blue-600)"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          strokeLinecap="round"
        />
      </svg>

      <div className="progress-ring-content">
        <div className="progress-ring-value">
          <span className="progress-percentage">
            <motion.span
              key={Math.floor(percentage)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {Math.round(percentage)}%
            </motion.span>
          </span>
        </div>
        <div className="progress-ring-label">Assigned</div>
      </div>
    </div>
  );
}