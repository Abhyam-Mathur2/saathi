import React from 'react';

export default function Avatar({ name = '', src, className = '', size = 'md' }) {
  const getInitials = (n) => {
    const parts = n.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    if (parts.length === 1 && parts[0]) return parts[0][0].toUpperCase();
    return '?';
  };

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-xl',
  };

  return (
    <div className={`${sizes[size]} rounded-full flex items-center justify-center bg-primary-500 text-white font-bold overflow-hidden shrink-0 ${className}`}>
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        getInitials(name)
      )}
    </div>
  );
}