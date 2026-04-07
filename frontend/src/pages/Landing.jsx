import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, CheckCircle2, Cpu, FileText, Building2, Users, LayoutDashboard, Heart, Languages } from 'lucide-react';
import Button from '../components/ui/Button';
import { useLanguage } from '../contexts/LanguageContext';
import { translateLabel } from '../i18n/translations';

export default function Landing() {
  const navigate = useNavigate();
  const { language, toggleLanguage } = useLanguage();
  const [stats, setStats] = useState({ volunteers: 0, reports: 0, districts: 0 });

  useEffect(() => {
    // Mock animation for live stats
    const duration = 2000;
    const target = { volunteers: 12450, reports: 8900, districts: 42 };
    let start = null;

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      
      setStats({
        volunteers: Math.floor(progress * target.volunteers),
        reports: Math.floor(progress * target.reports),
        districts: Math.floor(progress * target.districts),
      });

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, []);

  return (
    <div className="min-h-screen bg-warm-50 overflow-x-hidden">
      {/* Section 1: Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-primary-900 via-primary-700 to-primary-500 overflow-hidden px-4 py-20 text-center">
        {/* Animated background bubbles */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

        <button
          type="button"
          onClick={toggleLanguage}
          className="absolute top-6 right-6 z-20 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/15 transition-colors"
          aria-label={translateLabel(language, 'Language')}
        >
          <Languages className="h-4 w-4" />
          <span>{translateLabel(language, 'Language')}:</span>
          <span>{language === 'hi' ? translateLabel(language, 'Hindi') : translateLabel(language, 'English')}</span>
        </button>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="z-10 max-w-3xl flex flex-col items-center"
        >
          <span className="bg-accent-500/20 text-accent-300 border border-accent-500/30 px-4 py-1.5 rounded-full text-sm font-semibold mb-6 flex items-center shadow-sm">
            <span className="mr-2 text-base">🇮🇳</span> {translateLabel(language, 'Built for Bharat')}
          </span>
          <h1 className="font-heading font-extrabold text-5xl md:text-7xl text-white mb-6 tracking-tight">
            Saa<span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-300 to-accent-500">thi</span>
          </h1>
          <p className="font-body text-xl md:text-2xl text-white mb-4">
            {translateLabel(language, 'Connecting communities, one act of kindness at a time')}
          </p>
          <p className="font-body text-base text-primary-100 max-w-xl mb-10 leading-relaxed">
            {translateLabel(language, 'Empowering NGOs, volunteers, and citizens to coordinate relief, report needs, and rebuild communities — together.')}
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Button variant="accent" onClick={() => document.getElementById('roles').scrollIntoView({ behavior: 'smooth' })} className="px-8 py-3 text-lg h-14">
              {translateLabel(language, 'Get Started')} &rarr;
            </Button>
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-3 text-lg h-14 bg-white/5 backdrop-blur-sm">
              {translateLabel(language, 'Learn More')} &darr;
            </Button>
          </div>
        </motion.div>
        
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-10 z-10 text-white/50"
        >
          <ChevronDown className="w-8 h-8" />
        </motion.div>
      </section>

      {/* Section 2: Role Cards */}
      <section id="roles" className="py-20 px-4 max-w-7xl mx-auto -mt-10 relative z-20">
        <div className="flex overflow-x-auto md:grid md:grid-cols-3 gap-6 pb-8 snap-x snap-mandatory hide-scrollbar">
          
          {/* Admin Card */}
          <motion.div whileHover={{ y: -5 }} className="min-w-[85vw] md:min-w-0 snap-center rounded-3xl p-8 bg-gradient-to-br from-slate-800 to-slate-900 shadow-xl border border-slate-700 relative overflow-hidden group cursor-pointer" onClick={() => navigate('/login')}>
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-6 text-primary-300 group-hover:scale-110 transition-transform">
              <LayoutDashboard className="w-8 h-8" />
            </div>
            <h2 className="font-heading font-bold text-2xl text-white mb-4">{translateLabel(language, 'Staff / Admin')}</h2>
            <ul className="space-y-3 mb-8">
              {['Manage volunteers & NGOs', 'AI-driven task assignment', 'Live impact tracking'].map((f, i) => (
                <li key={i} className="flex items-start text-sm text-slate-300">
                  <CheckCircle2 className="w-4 h-4 mr-2 text-primary-400 mt-0.5 shrink-0" /> {translateLabel(language, f)}
                </li>
              ))}
            </ul>
            <div className="inline-flex px-6 py-2 rounded-full border border-white/20 text-white font-medium hover:bg-white/10 transition-colors">
              {translateLabel(language, 'Staff Portal')} &rarr;
            </div>
          </motion.div>

          {/* Volunteer Card */}
          <motion.div whileHover={{ y: -5 }} className="min-w-[85vw] md:min-w-0 snap-center rounded-3xl p-8 bg-gradient-to-br from-primary-600 to-primary-800 shadow-xl relative overflow-hidden group cursor-pointer" onClick={() => navigate('/volunteer/signup')}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-500/20 rounded-bl-full"></div>
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-6 text-accent-300 group-hover:scale-110 transition-transform relative z-10">
              <Users className="w-8 h-8" />
            </div>
            <h2 className="font-heading font-bold text-2xl text-white mb-4 relative z-10">{translateLabel(language, 'Volunteer')}</h2>
            <ul className="space-y-3 mb-6 relative z-10">
              {['Find tasks near you', 'Skill-based matching', 'Help the community'].map((f, i) => (
                <li key={i} className="flex items-start text-sm text-primary-100">
                  <CheckCircle2 className="w-4 h-4 mr-2 text-accent-300 mt-0.5 shrink-0" /> {translateLabel(language, f)}
                </li>
              ))}
            </ul>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/volunteer/signup');
                }}
                className="w-full h-12 rounded-full bg-white text-primary-800 font-semibold text-sm shadow-sm hover:bg-primary-50 transition-colors"
              >
                {translateLabel(language, 'Join as Volunteer')} &rarr;
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/volunteer/login');
                }}
                className="w-full h-12 rounded-full border border-white/30 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
              >
                {translateLabel(language, 'Volunteer Login')}
              </button>
            </div>
          </motion.div>

          {/* Citizen Card */}
          <motion.div whileHover={{ y: -5 }} className="min-w-[85vw] md:min-w-0 snap-center rounded-3xl p-8 bg-gradient-to-br from-emerald-600 to-teal-700 shadow-xl relative overflow-hidden group cursor-pointer" onClick={() => navigate('/citizen/login')}>
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform">
              <FileText className="w-8 h-8" />
            </div>
            <h2 className="font-heading font-bold text-2xl text-white mb-4">{translateLabel(language, 'Citizen')}</h2>
            <ul className="space-y-3 mb-8">
              {['Report local issues easily', 'Get help quickly', 'Track resolution live'].map((f, i) => (
                <li key={i} className="flex items-start text-sm text-emerald-50">
                  <CheckCircle2 className="w-4 h-4 mr-2 text-white mt-0.5 shrink-0" /> {translateLabel(language, f)}
                </li>
              ))}
            </ul>
            <div className="inline-flex px-6 py-2 rounded-full border border-white/30 text-white font-medium hover:bg-white/10 transition-colors">
              {translateLabel(language, 'Citizen Portal')} &rarr;
            </div>
          </motion.div>

        </div>

        {/* NGO Registration Banner */}
        <div className="mt-6 md:mt-10 rounded-3xl bg-gradient-to-r from-accent-500 to-accent-600 p-1 md:p-1.5 shadow-card hover:shadow-card-hover transition-all cursor-pointer group" onClick={() => navigate('/ngo/register')}>
          <div className="bg-white/10 backdrop-blur-sm rounded-[1.3rem] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between border border-white/20">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0 mr-4">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg md:text-xl text-white">{translateLabel(language, 'Are you an NGO?')}</h3>
                <p className="text-accent-50 text-sm">{translateLabel(language, 'Partner with Saathi to coordinate volunteers at scale.')}</p>
              </div>
            </div>
            <div className="shrink-0 bg-white text-accent-700 font-bold px-6 py-3 rounded-full flex items-center group-hover:scale-105 transition-transform">
              {translateLabel(language, 'Register NGO')} &rarr;
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Live Stats */}
      <section className="py-16 bg-primary-900 text-white text-center">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="text-4xl md:text-5xl font-heading font-bold text-accent-400 mb-2">{stats.volunteers.toLocaleString()}+</div>
            <div className="text-primary-200 font-medium">{translateLabel(language, 'Volunteers Registered')}</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-heading font-bold text-accent-400 mb-2">{stats.reports.toLocaleString()}+</div>
            <div className="text-primary-200 font-medium">{translateLabel(language, 'Reports Resolved')}</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-heading font-bold text-accent-400 mb-2">{stats.districts}</div>
            <div className="text-primary-200 font-medium">{translateLabel(language, 'Districts Covered')}</div>
          </div>
        </div>
      </section>

      {/* Section 4: How it Works */}
      <section className="py-24 px-4 bg-warm-50 max-w-6xl mx-auto text-center">
        <h2 className="font-heading font-bold text-3xl md:text-4xl text-slate-800 mb-16">{translateLabel(language, 'How Saathi Works')}</h2>
        <div className="flex flex-col md:flex-row items-center justify-between relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-0.5 bg-warm-200 -z-10 border-t-2 border-dashed border-warm-300"></div>
          
          <div className="flex flex-col items-center mb-10 md:mb-0 bg-white p-6 rounded-3xl shadow-sm z-10 max-w-[280px]">
            <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-4 shadow-inner text-xl font-bold border-4 border-white">1</div>
            <FileText className="w-8 h-8 text-primary-500 mb-4" />
            <h3 className="font-bold text-lg mb-2">{translateLabel(language, 'Citizen Reports')}</h3>
            <p className="text-slate-500 text-sm">{translateLabel(language, 'A citizen snaps a photo and reports an issue in their area.')}</p>
          </div>
          
          <div className="flex flex-col items-center mb-10 md:mb-0 bg-white p-6 rounded-3xl shadow-sm z-10 max-w-[280px]">
            <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-4 shadow-inner text-xl font-bold border-4 border-white">2</div>
            <Cpu className="w-8 h-8 text-primary-500 mb-4" />
            <h3 className="font-bold text-lg mb-2">{translateLabel(language, 'AI Matching')}</h3>
            <p className="text-slate-500 text-sm">{translateLabel(language, 'Saathi AI instantly finds the best skilled volunteer nearby.')}</p>
          </div>
          
          <div className="flex flex-col items-center bg-white p-6 rounded-3xl shadow-sm z-10 max-w-[280px]">
            <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-4 shadow-inner text-xl font-bold border-4 border-white">3</div>
            <CheckCircle2 className="w-8 h-8 text-primary-500 mb-4" />
            <h3 className="font-bold text-lg mb-2">{translateLabel(language, 'Issue Resolved')}</h3>
            <p className="text-slate-500 text-sm">{translateLabel(language, 'The volunteer fixes the issue and uploads proof.')}</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-50 py-12 px-4 text-center">
        <div className="flex items-center justify-center mb-4 text-primary-700">
          <Heart className="w-6 h-6 mr-2 fill-current" />
          <span className="font-heading font-bold text-xl">{translateLabel(language, 'Saathi')}</span>
        </div>
        <p className="text-primary-800/60 text-sm mb-2">{translateLabel(language, 'Empowering communities across India.')}</p>
        <p className="text-primary-800/40 text-xs">&copy; 2026 {translateLabel(language, 'Saathi')} – {translateLabel(language, 'Smart Resource Allocation System')}</p>
      </footer>
    </div>
  );
}