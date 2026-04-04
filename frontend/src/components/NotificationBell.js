import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Welcome to VolunteerIQ Dashboard", time: "Just now", read: false }
  ]);
  const [showDropdown, setShowDropdown] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button 
        onClick={() => setShowDropdown(!showDropdown)}
        className="p-2 text-slate-500 hover:text-slate-700 focus:outline-none transition-colors relative"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-lg bg-white p-4 shadow-xl ring-1 ring-slate-200 focus:outline-none z-50">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
            <button className="text-xs text-primary-600 hover:text-primary-700">Mark all as read</button>
          </div>
          <div className="space-y-3">
            {notifications.map((n) => (
              <div key={n.id} className="flex flex-col border-b border-slate-100 pb-2 last:border-0">
                <p className="text-sm text-slate-700">{n.text}</p>
                <span className="text-[10px] text-slate-400">{n.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
