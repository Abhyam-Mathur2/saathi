import React from 'react';
import { twMerge } from 'tailwind-merge';

const UrgencyBadge = ({ level, className }) => {
  const getColors = (l) => {
    if (l >= 8) return 'bg-red-100 text-red-700 border-red-200';
    if (l >= 5) return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  };

  return (
    <span className={twMerge(
      'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
      getColors(level),
      className
    )}>
      Urgency: {level}/10
    </span>
  );
};

export default UrgencyBadge;
