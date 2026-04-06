import React from 'react';
import { motion } from 'framer-motion';

export default function Button({ children, variant = 'primary', className = '', onClick, type = 'button', disabled = false, isLoading = false }) {
  const baseClasses = 'rounded-full px-5 py-2.5 font-body font-semibold text-sm transition-colors flex items-center justify-center';
  const variants = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600',
    accent: 'bg-accent-500 text-white hover:bg-accent-600',
    outline: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-50',
    ghost: 'text-slate-600 hover:bg-warm-100',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  };

  return (
    <motion.button
      type={type}
      className={`${baseClasses} ${variants[variant]} ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled || isLoading}
      whileTap={!(disabled || isLoading) ? { scale: 0.95 } : undefined}
    >
      {isLoading ? (
        <span className="flex space-x-1">
          <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
          <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
          <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
        </span>
      ) : children}
    </motion.button>
  );
}