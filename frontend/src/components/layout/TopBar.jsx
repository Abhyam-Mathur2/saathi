import React, { useState, useEffect } from 'react';
import { Heart, Menu } from 'lucide-react';
import Avatar from '../ui/Avatar';
import NotificationBell from '../NotificationBell';
import { getSession } from '../../utils/roleAuth';
import { useLanguage } from '../../contexts/LanguageContext';
import { translateLabel } from '../../i18n/translations';

export default function TopBar() {
  const [scrolled, setScrolled] = useState(false);
  const session = getSession();
  const { language, toggleLanguage } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`fixed top-0 left-0 right-0 h-14 md:left-60 z-40 transition-all duration-200 flex items-center justify-between px-4 safe-top ${scrolled ? 'bg-white/80 backdrop-blur-md border-b border-warm-200 shadow-sm' : 'bg-white'}`}>
      <div className="flex items-center md:hidden">
        <button 
          onClick={() => window.dispatchEvent(new Event('toggle-mobile-menu'))} 
          className="mr-3 p-1 rounded-md text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <Heart className="w-6 h-6 text-primary-500 fill-current" />
        <span className="ml-2 font-heading font-bold text-lg bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
          {translateLabel(language, 'Saathi')}
        </span>
      </div>
      
      <div className="hidden md:flex flex-1">
        {/* Desktop title could go here */}
      </div>

      <div className="flex items-center space-x-4 ml-auto">
        <button
          onClick={toggleLanguage}
          className="px-3 py-1.5 rounded-full border border-primary-200 bg-white text-xs font-bold text-primary-700 hover:bg-primary-50 transition-colors"
          aria-label="Toggle language"
        >
          {language === 'en' ? 'EN' : 'HI'}
        </button>
        <NotificationBell />
        {session && (
          <Avatar name={session.name} size="sm" className="ring-2 ring-white shadow-sm" />
        )}
      </div>
    </div>
  );
}