import { X } from "lucide-react";

export default function Modal({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-surface)]/60 backdrop-blur-sm transition-all duration-300">
      <div className="neo-surface-lg rounded-2xl w-full max-w-lg transform scale-100 transition-transform">
        <div className="px-6 py-4 border-b border-white/20 flex justify-between items-center bg-transparent">
          <h2 className="text-lg font-bold text-[var(--color-text)]">{title}</h2>
          <button onClick={onClose} className="p-2 text-[var(--color-text)] opacity-50 hover:opacity-100 hover:text-[var(--color-danger)] rounded-full hover:neo-pressed transition-all">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
