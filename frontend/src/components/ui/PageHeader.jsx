import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PageHeader({ title, rightAction }) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between p-4 bg-white sticky top-0 z-30 shadow-sm safe-top">
      <div className="flex items-center space-x-3">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-warm-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-700" />
        </button>
        <h1 className="font-heading font-bold text-lg text-slate-800">{title}</h1>
      </div>
      {rightAction && (
        <div>{rightAction}</div>
      )}
    </div>
  );
}