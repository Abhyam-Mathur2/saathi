import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BottomSheet({ isOpen, onClose, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100) onClose();
            }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-xl max-h-[90vh] overflow-y-auto safe-bottom"
          >
            <div className="flex justify-center p-4 sticky top-0 bg-white z-10">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>
            <div className="px-6 pb-6">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}