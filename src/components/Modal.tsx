import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Props = {
  open: boolean;
  title?: string;
  onClose?: () => void;
  children: ReactNode;
  accent?: string;
};

export default function Modal({ open, title, onClose, children, accent = "border-slate-700" }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={`w-full max-w-md rounded-3xl border-2 ${accent} bg-slate-900 p-6 shadow-2xl`}
            initial={{ scale: 0.85, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {title && <h3 className="mb-4 text-xl font-bold text-white">{title}</h3>}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
