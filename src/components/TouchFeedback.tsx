import { motion } from "motion/react";
import { ReactNode } from "react";

interface TouchFeedbackProps {
  children: ReactNode;
  className?: string;
}

export function TouchFeedback({ children, className = "" }: TouchFeedbackProps) {
  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
