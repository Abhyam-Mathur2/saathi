import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { canUserSwitch, getActiveRole, toggleRole } from '../utils/roleSwitch';

export default function RoleToggle({ session }) {
  const [canSwitch, setCanSwitch] = useState(false);
  const [role, setRole] = useState('citizen');

  useEffect(() => {
    if (session) {
      setCanSwitch(canUserSwitch(session));
      setRole(getActiveRole(session) || session.role);
    }
  }, [session]);

  const handleToggle = () => {
    toggleRole(session);
    const newRole = getActiveRole(session);
    setRole(newRole);
    toast.success(`Switched to ${newRole === 'volunteer' ? 'Volunteer' : 'Citizen'} mode ${newRole === 'volunteer' ? '🤝' : '🏠'}`);
    setTimeout(() => {
      window.location.href = newRole === 'volunteer' ? '/volunteer' : '/citizen';
    }, 500);
  };

  if (!canSwitch) return null;

  const isVolunteer = role === 'volunteer';

  return (
    <div className="flex justify-center my-4">
      <div 
        className="relative flex items-center bg-warm-200 rounded-full p-1 cursor-pointer shadow-inner w-64 h-12"
        onClick={handleToggle}
      >
        <motion.div
          className="absolute h-10 bg-primary-500 rounded-full shadow-sm"
          animate={{ x: isVolunteer ? '100%' : '0%' }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          style={{ width: 'calc(50% - 4px)' }}
        />
        <div className={`flex-1 text-center z-10 font-semibold text-sm transition-colors ${!isVolunteer ? 'text-white' : 'text-slate-600'}`}>
          🏠 Citizen
        </div>
        <div className={`flex-1 text-center z-10 font-semibold text-sm transition-colors ${isVolunteer ? 'text-white' : 'text-slate-600'}`}>
          🤝 Volunteer
        </div>
      </div>
    </div>
  );
}