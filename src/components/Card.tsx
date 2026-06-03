import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface Props {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function Card({ children, className = "", delay = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.2, 0.9, 0.2, 1] }}
      className={`rounded-2xl bg-white/[0.04] ring-1 ring-white/10 backdrop-blur-sm p-4 shadow-card ${className}`}
    >
      {children}
    </motion.div>
  );
}
