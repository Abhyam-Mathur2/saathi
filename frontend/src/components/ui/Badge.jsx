import React from 'react';

export default function Badge({ children, type = 'default', urgency, className = '' }) {
  let colorClasses = 'bg-warm-200 text-slate-700';

  if (type === 'issue') {
    colorClasses = 'bg-primary-100 text-primary-800';
  } else if (type === 'urgency' && urgency !== undefined) {
    if (urgency >= 8) colorClasses = 'bg-red-100 text-red-800';
    else if (urgency >= 5) colorClasses = 'bg-orange-100 text-orange-800';
    else colorClasses = 'bg-green-100 text-green-800';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colorClasses} ${className}`}>
      {children}
    </span>
  );
}