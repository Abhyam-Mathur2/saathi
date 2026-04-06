import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Compass, User, UserPlus, HelpCircle, LayoutDashboard, FileText, Users, Map, MoreHorizontal, CheckSquare, MessageCircle, Navigation, AlertTriangle, Calendar } from 'lucide-react';
import { getSession } from '../../utils/roleAuth';
import { getActiveRole } from '../../utils/roleSwitch';

export default function BottomNav() {
  const location = useLocation();
  const session = getSession();
  const role = getActiveRole(session);

  let tabs = [];

  if (!session) {
    tabs = [
      { path: '/', label: 'Home', icon: Home },
      { path: '/login', label: 'Login', icon: User },
      { path: '/register', label: 'Sign Up', icon: UserPlus },
    ];
  } else if (role === 'admin') {
    tabs = [
      { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/admin/reports', label: 'Reports', icon: FileText },
      { path: '/admin/volunteers', label: 'Volunteers', icon: Users },
      { path: '/admin/planner', label: 'Planner', icon: Map },
      { path: '/admin/events', label: 'Events', icon: Calendar },
    ];
  } else if (role === 'volunteer') {
    tabs = [
      { path: '/volunteer', label: 'Home', icon: Home },
      { path: '/volunteer/tasks', label: 'Tasks', icon: CheckSquare },
      { path: '/volunteer/reports', label: 'Reports', icon: FileText },
      { path: '/route-planner', label: 'Map', icon: Navigation },
    ];
  } else {
    // citizen
    tabs = [
      { path: '/citizen', label: 'Home', icon: Home },
      { path: '/report', label: 'Report', icon: FileText },
      { path: '/track', label: 'Track', icon: Map },
      { path: '/emergency', label: 'Emergency', icon: AlertTriangle },
    ];
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-bottom-nav safe-bottom z-40 pb-2">
      <div className="flex items-center justify-around h-16 px-2 relative">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          // Simple matching, could be improved based on specific paths
          const isActive = location.pathname === tab.path || (tab.path !== '/' && location.pathname.startsWith(tab.path));

          return (
            <Link
              key={tab.path}
              to={tab.path}
              className="flex flex-col items-center justify-center w-full h-full relative"
            >
              <div className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-colors ${isActive ? 'text-primary-600' : 'text-slate-400 hover:bg-warm-50'}`}>
                <Icon className={`w-6 h-6 mb-1 ${isActive ? 'fill-primary-100/50' : ''}`} />
                <span className={`text-[10px] font-medium transition-all ${isActive ? 'text-primary-700' : 'text-slate-500'}`}>
                  {tab.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute -bottom-1 w-1 h-1 bg-primary-600 rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}