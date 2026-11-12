import React from 'react';
import { IssueType } from '../types';

interface IssueTagProps {
  type: IssueType;
  className?: string;
}

const TAG_CONFIG: Record<
  IssueType,
  { label: string; textClass: string; bgClass: string; borderClass?: string }
> = {
  spelling: {
    label: 'Spelling',
    textClass: 'text-[#ff8a80] dark:text-[#ff8a80] text-[#c53030]',
    bgClass: 'bg-[#fee2e2] dark:bg-[#3d2224]',
  },
  repeated_word: {
    label: 'Repeated word',
    textClass: 'text-[#ff8a80] dark:text-[#ff8a80] text-[#c53030]',
    bgClass: 'bg-[#fee2e2] dark:bg-[#3d2224]',
  },
  grammar: {
    label: 'Grammar',
    textClass: 'text-[#ffb86b] dark:text-[#ffb86b] text-[#b7791f]',
    bgClass: 'bg-[#fefcbf] dark:bg-[#3a2c1a]',
  },
  punctuation: {
    label: 'Punctuation',
    textClass: 'text-[#ffb86b] dark:text-[#ffb86b] text-[#b7791f]',
    bgClass: 'bg-[#fefcbf] dark:bg-[#3a2c1a]',
  },
  consistency: {
    label: 'Consistency',
    textClass: 'text-[#b8a4ff] dark:text-[#b8a4ff] text-[#6b46c1]',
    bgClass: 'bg-[#e9d8fd] dark:bg-[#2d2644]',
  },
  duplicate: {
    label: 'Duplicate',
    textClass: 'text-[#b8a4ff] dark:text-[#b8a4ff] text-[#6b46c1]',
    bgClass: 'bg-[#e9d8fd] dark:bg-[#2d2644]',
  },
  placeholder: {
    label: 'Placeholder',
    textClass: 'text-[#5fd3c4] dark:text-[#5fd3c4] text-[#234e52]',
    bgClass: 'bg-[#e6fffa] dark:bg-[#183633]',
  },
  cut_off: {
    label: 'Cut off',
    textClass: 'text-[#5fd3c4] dark:text-[#5fd3c4] text-[#234e52]',
    bgClass: 'bg-[#e6fffa] dark:bg-[#183633]',
  },
  style: {
    label: 'Style',
    textClass: 'text-[#a8a8a8] dark:text-[#a8a8a8] text-[#4a5568]',
    bgClass: 'bg-[#edf2f7] dark:bg-[#2c2c2c]',
  },
  brand_inconsistency: {
    label: 'Brand consistency',
    textClass: 'text-[#b8a4ff] dark:text-[#b8a4ff] text-[#6b46c1]',
    bgClass: 'bg-[#e9d8fd] dark:bg-[#2d2644]',
  },
  format_inconsistency: {
    label: 'Format consistency',
    textClass: 'text-[#b8a4ff] dark:text-[#b8a4ff] text-[#6b46c1]',
    bgClass: 'bg-[#e9d8fd] dark:bg-[#2d2644]',
  },
  capitalization: {
    label: 'Capitalization',
    textClass: 'text-[#b8a4ff] dark:text-[#b8a4ff] text-[#6b46c1]',
    bgClass: 'bg-[#e9d8fd] dark:bg-[#2d2644]',
  },
  unreadable: {
    label: 'Unreadable',
    textClass: 'text-[#e8a24a] dark:text-[#e8a24a] text-[#c05621]',
    bgClass: 'bg-transparent',
    borderClass: 'border border-dashed border-[#e8a24a]/60',
  },
};

export function IssueTag({ type, className = '' }: IssueTagProps) {
  const config = TAG_CONFIG[type] || TAG_CONFIG.spelling;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium tracking-tight ${config.textClass} ${config.bgClass} ${config.borderClass || ''} ${className}`}
    >
      {config.label}
    </span>
  );
}
