"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function Select({ value, onChange, options, placeholder, className = "", disabled = false }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value) || options.find(opt => opt.label === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative rounded-[var(--radius-control)] ${className} ${disabled ? "opacity-70 cursor-not-allowed pointer-events-none" : ""}`} ref={containerRef}>
      <div
        onClick={() => {
          if (!disabled) setIsOpen(!isOpen);
        }}
        className={`w-full h-full flex items-center justify-between rounded-[var(--radius-control)] outline-none ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder || "Chọn..."}
        </span>
        <ChevronDown size={16} className={`transition-transform duration-200 opacity-50 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`} />
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 left-0 right-0 mt-2 neo-surface rounded-[var(--radius-panel)] shadow-2xl flex flex-col max-h-48 overflow-y-auto custom-scroll border border-[rgba(0,0,0,0.1)]">
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-3 text-sm font-bold transition-all cursor-pointer first:rounded-t-[var(--radius-panel)] last:rounded-b-[var(--radius-panel)] hover:bg-black/5 ${
                value === option.value || value === option.label ? "text-[var(--color-primary)] bg-black/5" : "text-[var(--color-text)]"
              }`}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
