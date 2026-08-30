import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";
import "./Toast.css";

export default function Toast({ message, type = "success", duration = 3000 }) {
  const [isVisible, setIsVisible] = useState(!!message);

  useEffect(() => {
    if (!message) {
      setIsVisible(false);
      return;
    }

    setIsVisible(true);
    const timer = setTimeout(() => setIsVisible(false), duration);
    return () => clearTimeout(timer);
  }, [message, duration]);

  return (
    <AnimatePresence>
      {isVisible && message && (
        <motion.div
          className={`toast toast--${type}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
        >
          <span className="toast-message">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}