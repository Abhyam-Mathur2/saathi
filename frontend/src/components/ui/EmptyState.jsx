import React from 'react';
import { motion } from 'framer-motion';

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
    >
      <div className="w-16 h-16 bg-primary-50 text-primary-500 rounded-full flex items-center justify-center mb-4">
        {Icon && <Icon className="w-8 h-8" />}
      </div>
      <h3 className="font-heading font-semibold text-lg text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-500 text-sm mb-6 max-w-xs">{description}</p>
      {action && <div>{action}</div>}
    </motion.div>
  );
}