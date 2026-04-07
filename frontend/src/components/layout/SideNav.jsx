import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, LayoutDashboard, FileText, Users, Map, Calendar, LogOut, Home, Navigation, AlertTriangle, CheckSquare, X } from 'lucide-react';
import { getSession, logoutSession } from '../../utils/roleAuth';
import { getActiveRole } from '../../utils/roleSwitch';
import Avatar from '../ui/Avatar';
import { useLanguage } from '../../contexts/LanguageContext';
import { translateLabel } from '../../i18n/translations';

export default function SideNav() {
  const location = useLocation();
  const session = getSession();
  const role = getActiveRole(session);
  const { language } = useLanguage();
  const [collapsed] = useState(false); // Could be toggled
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setMobileOpen(prev => !prev);
    window.addEventListener('toggle-mobile-menu', handleToggle);
    return () => window.removeEventListener('toggle-mobile-menu', handleToggle);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  if (!session) return null;

  let navItems = [];
  if (role === 'admin') {
    navItems = [
      { path: '/admin', label: translateLabel(language, 'Dashboard'), icon: LayoutDashboard },
      { path: '/admin/reports', label: translateLabel(language, 'Reports'), icon: FileText },
      { path: '/admin/volunteers', label: translateLabel(language, 'Volunteers'), icon: Users },
      { path: '/admin/planner', label: translateLabel(language, 'Planner'), icon: Map },
      { path: '/admin/events', label: translateLabel(language, 'Events'), icon: Calendar },
    ];
  } else if (role === 'volunteer') {
    navItems = [
      { path: '/volunteer', label: translateLabel(language, 'Home'), icon: Home },
      { path: '/volunteer/tasks', label: translateLabel(language, 'My Tasks'), icon: CheckSquare },
      { path: '/volunteer/reports', label: translateLabel(language, 'Find Reports'), icon: FileText },
      { path: '/route-planner', label: translateLabel(language, 'Map'), icon: Navigation },
    ];
  } else {
    navItems = [
      { path: '/citizen', label: translateLabel(language, 'Home'), icon: Home },
      { path: '/report', label: translateLabel(language, 'Report Issue'), icon: FileText },
      { path: '/track', label: translateLabel(language, 'Track Reports'), icon: Map },
      { path: '/emergency', label: translateLabel(language, 'Emergency'), icon: AlertTriangle },
    ];
  }

  const handleLogout = () => {
    logoutSession();
    window.location.href = '/';
  };

  return (
    <>
      {mobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <div className={`flex flex-col fixed top-0 left-0 bottom-0 bg-primary-900 text-white z-50 transition-transform duration-300 ${collapsed ? 'w-20' : 'w-60'} ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 flex flex-col relative items-center">
          {mobileOpen && (
            <button className="md:hidden absolute top-4 right-4 p-2 text-slate-300 hover:text-white" onClick={() => setMobileOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          )}
          <Link to="/" className="flex items-center">
            <Heart className="w-8 h-8 text-accent-400 fill-current" />
            {!collapsed && (
              <span className="ml-3 font-heading font-bold text-2xl tracking-tight text-white">
                {translateLabel(language, 'Saathi')}
              </span>
            )}
          </Link>
          {!collapsed && (
            <div className="mt-4 px-3 py-1 bg-primary-800 rounded-full text-xs font-semibold text-accent-300 uppercase tracking-wider text-center">
              {role} {translateLabel(language, 'Dashboard')}
            </div>
          )}
        </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/' && item.path !== '/admin' && item.path !== '/volunteer' && item.path !== '/citizen' && location.pathname.startsWith(item.path));

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${isActive ? 'bg-accent-500 text-white shadow-md' : 'text-primary-100 hover:bg-white/10 hover:text-white'}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-primary-300 group-hover:text-white'}`} />
              {!collapsed && (
                <span className="ml-3 font-body font-medium">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 bg-primary-950 mt-auto">
        {!collapsed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 overflow-hidden">
              <Avatar name={session.name} size="sm" className="bg-primary-600 border border-primary-500" />
              <div className="flex flex-col truncate">
                <span className="text-sm font-semibold truncate">{session.name}</span>
                <span className="text-xs text-primary-300 truncate capitalize">{role}</span>
              </div>
            </div>
            <button onClick={handleLogout} className="p-2 text-primary-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title={translateLabel(language, 'Logout')}>
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <button onClick={handleLogout} className="w-full p-2 flex justify-center text-primary-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title={translateLabel(language, 'Logout')}>
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
    </>
  );
}