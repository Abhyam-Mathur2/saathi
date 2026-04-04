import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, UserPlus, Heart, Users, LogOut, Shield, HeartHandshake, UserRound } from 'lucide-react';
import NotificationBell from './NotificationBell';
import { getSession, logoutSession } from '../utils/roleAuth';

const Navbar = () => {
  const location = useLocation();
  const [session, setSession] = useState(getSession());

  useEffect(() => {
    const syncSession = () => setSession(getSession());
    window.addEventListener('role-auth-changed', syncSession);
    window.addEventListener('focus', syncSession);
    return () => {
      window.removeEventListener('role-auth-changed', syncSession);
      window.removeEventListener('focus', syncSession);
    };
  }, []);

  const baseItems = [
    { name: 'Home', path: '/', icon: LayoutDashboard },
  ];

  const roleItems = session?.role === 'admin'
    ? [
        { name: 'Admin', path: '/admin', icon: Shield },
        { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Volunteers', path: '/volunteers', icon: Users },
        { name: 'Reports', path: '/report', icon: FileText },
      ]
    : session?.role === 'volunteer'
      ? [
          { name: 'Volunteer', path: '/volunteer', icon: HeartHandshake },
          { name: 'Reports', path: '/report', icon: FileText },
          { name: 'Directory', path: '/volunteers', icon: Users },
        ]
      : session?.role === 'citizen'
        ? [
            { name: 'Citizen', path: '/citizen', icon: UserRound },
            { name: 'Report Need', path: '/report', icon: FileText },
          ]
        : [
            { name: 'Staff Login', path: '/login', icon: Shield },
            { name: 'Citizen Login', path: '/citizen/login', icon: UserRound },
          { name: 'Citizen Signup', path: '/citizen/signup', icon: UserPlus },
          ];

  const navItems = [...baseItems, ...roleItems];

  const handleLogout = () => {
    logoutSession();
    setSession(null);
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <Heart className="h-8 w-8 text-primary-600 fill-primary-600" />
              <span className="text-xl font-bold text-slate-900 tracking-tight">Saathi</span>
            </Link>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'border-primary-500 text-slate-900'
                        : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {session ? (
              <>
                <span className="hidden sm:inline text-sm font-medium text-slate-600">{session.name} ({session.role})</span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
                <NotificationBell />
              </>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
