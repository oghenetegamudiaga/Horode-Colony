import React from 'react';

/**
 * Horode Proof - UI/UX Style Guide Icon Policy:
 * Default is no icon. Text does the job.
 * Exactly four glyphs are allowed across the entire app:
 * 1. Sidebar toggle
 * 2. Chevron
 * 3. Ellipsis
 * 4. Close (x)
 * Plus the workspace logo mark at the top of the sidebar.
 * No icon library is used.
 */

export function SidebarToggleGlyph({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2.5" width="12" height="11" rx="2" />
      <line x1="6" y1="2.5" x2="6" y2="13.5" />
    </svg>
  );
}

export function ChevronGlyph({
  direction = "right",
  className = "w-3.5 h-3.5"
}: {
  direction?: "right" | "down" | "left" | "up";
  className?: string;
}) {
  const rotation = {
    right: "rotate-0",
    down: "rotate-90",
    left: "rotate-180",
    up: "-rotate-90",
  }[direction];

  return (
    <svg
      className={`${className} transform ${rotation} transition-transform duration-150 shrink-0`}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="6 3.5 10.5 8 6 12.5" />
    </svg>
  );
}

export function EllipsisGlyph({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <circle cx="3" cy="8" r="1.25" />
      <circle cx="8" cy="8" r="1.25" />
      <circle cx="13" cy="8" r="1.25" />
    </svg>
  );
}

export function CloseGlyph({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="3.5" y1="3.5" x2="12.5" y2="12.5" />
      <line x1="12.5" y1="3.5" x2="3.5" y2="12.5" />
    </svg>
  );
}

export function HorodeLogo({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-label="Horode Studio Logo">
      <rect width="24" height="24" rx="5" fill="#2383E2" />
      <path d="M7 6V18M17 6V18M7 12H17" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
