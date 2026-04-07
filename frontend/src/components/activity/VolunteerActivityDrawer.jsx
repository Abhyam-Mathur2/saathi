import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, User, MapPin, Calendar } from 'lucide-react';
import ActivityFeed from './ActivityFeed';
import Avatar from '../ui/Avatar';

const VolunteerActivityDrawer = ({ volunteer, isOpen, onClose }) => {
  if (!volunteer) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-slate-50 shadow-2xl z-[70] flex flex-col"
          >
            {/* Header */}
            <div className="bg-white p-6 border-b border-slate-100 relative">
              <button 
                onClick={onClose}
                className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-4">
                <Avatar 
                  src={volunteer.avatar} 
                  name={volunteer.name} 
                  size="lg"
                  className="ring-4 ring-primary-50"
                />
                <div>
                  <h3 className="font-heading font-bold text-xl text-slate-800">{volunteer.name}</h3>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <User size={12} />
                      Volunteer
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <MapPin size={12} />
                      {volunteer.city}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Calendar size={12} />
                      Joined {new Date(volunteer.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
              <div className="mb-6 flex items-center justify-between">
                <h4 className="font-heading font-bold text-slate-800 flex items-center gap-2">
                  <Activity size={18} className="text-primary-500" />
                  Mission History
                </h4>
              </div>

              <ActivityFeed 
                volunteerId={volunteer._id} 
                limit={30} 
                showStats={true}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default VolunteerActivityDrawer;
