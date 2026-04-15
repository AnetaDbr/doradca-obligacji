"use client";

import { useState } from "react";

interface TooltipProps {
  term: string;
  explanation: string;
}

export default function InfoTooltip({ term, explanation }: TooltipProps) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex items-center">
      <span>{term}</span>
      <button
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold ml-1 cursor-pointer shrink-0"
        style={{
          backgroundColor: "var(--border)",
          color: "var(--text-secondary)",
        }}
        aria-label={`Wyjaśnienie: ${term}`}
      >
        i
      </button>
      {open && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 rounded-xl text-xs leading-relaxed shadow-lg z-50"
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border)",
            color: "var(--text-secondary)",
          }}
        >
          {explanation}
          <div
            className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 rotate-45"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderTop: "none",
              borderLeft: "none",
              marginTop: "-5px",
            }}
          />
        </div>
      )}
    </span>
  );
}
