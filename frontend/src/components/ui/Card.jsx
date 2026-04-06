import React from 'react';

export default function Card({ children, className = '', onClick }) {
  return (
    <div 
      className={`rounded-3xl bg-white shadow-card hover:shadow-card-hover transition-shadow p-5 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}