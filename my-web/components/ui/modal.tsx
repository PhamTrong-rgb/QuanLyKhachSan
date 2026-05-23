"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Modal({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-[var(--color-surface)]/60 backdrop-blur-sm overflow-hidden"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="neo-surface-lg rounded-[1.5rem] w-full max-w-2xl max-h-full flex flex-col shadow-2xl"
          >
            <div className="px-6 py-4 border-b border-slate-200/50 flex-shrink-0 flex justify-between items-center z-10 bg-[var(--color-surface)] rounded-t-[1.5rem]">
              <h2 className="text-lg font-bold text-[var(--color-text)]">{title}</h2>
              <button 
                type="button"
                onClick={onClose} 
                className="p-2 text-[var(--color-text)] opacity-50 hover:opacity-100 hover:text-[var(--color-danger)] rounded-full hover:bg-black/5 active:scale-90 transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 flex-1 min-h-0 relative">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
