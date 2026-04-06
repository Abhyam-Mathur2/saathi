import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, CheckCircle2, Cpu, FileText, Building2, TrendingUp, Users, MapPin, LayoutDashboard, Heart } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

export default function Landing() {
  const navigate = useNavigate();
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
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="z-10 max-w-3xl flex flex-col items-center"
        >
          <span className="bg-accent-500/20 text-accent-300 border border-accent-500/30 px-4 py-1.5 rounded-full text-sm font-semibold mb-6 flex items-center shadow-sm">
            <span className="mr-2 text-base">🇮🇳</span> Built for Bharat
          </span>
          <h1 className="font-heading font-extrabold text-5xl md:text-7xl text-white mb-6 tracking-tight">
            Saa<span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-300 to-accent-500">thi</span>
          </h1>
          <p className="font-body text-xl md:text-2xl text-white mb-4">
            Connecting communities, one act of kindness at a time
          </p>
          <p className="font-body text-base text-primary-100 max-w-xl mb-10 leading-relaxed">
            Empowering NGOs, volunteers, and citizens to coordinate relief, report needs, and rebuild communities — together.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Button variant="accent" onClick={() => document.getElementById('roles').scrollIntoView({ behavior: 'smooth' })} className="px-8 py-3 text-lg h-14">
              Get Started &rarr;
            </Button>
            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 py-3 text-lg h-14 bg-white/5 backdrop-blur-sm">
              Learn More &darr;
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
            <h2 className="font-heading font-bold text-2xl text-white mb-4">Staff / Admin</h2>
            <ul className="space-y-3 mb-8">
              {['Manage volunteers & NGOs', 'AI-driven task assignment', 'Live impact tracking'].map((f, i) => (
                <li key={i} className="flex items-start text-sm text-slate-300">
                  <CheckCircle2 className="w-4 h-4 mr-2 text-primary-400 mt-0.5 shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <div className="inline-flex px-6 py-2 rounded-full border border-white/20 text-white font-medium hover:bg-white/10 transition-colors">
              Staff Portal &rarr;
            </div>
          </motion.div>

          {/* Volunteer Card */}
          <motion.div whileHover={{ y: -5 }} className="min-w-[85vw] md:min-w-0 snap-center rounded-3xl p-8 bg-gradient-to-br from-primary-600 to-primary-800 shadow-xl relative overflow-hidden group cursor-pointer" onClick={() => navigate('/register')}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-500/20 rounded-bl-full"></div>
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-6 text-accent-300 group-hover:scale-110 transition-transform relative z-10">
              <Users className="w-8 h-8" />
            </div>
            <h2 className="font-heading font-bold text-2xl text-white mb-4 relative z-10">Volunteer</h2>
            <ul className="space-y-3 mb-8 relative z-10">
              {['Find tasks near you', 'Skill-based matching', 'Help the community'].map((f, i) => (
                <li key={i} className="flex items-start text-sm text-primary-100">
                  <CheckCircle2 className="w-4 h-4 mr-2 text-accent-300 mt-0.5 shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <div className="inline-flex px-6 py-2 rounded-full border border-white/30 text-white font-medium hover:bg-white/10 transition-colors relative z-10">
              Join as Volunteer &rarr;
            </div>
          </motion.div>

          {/* Citizen Card */}
          <motion.div whileHover={{ y: -5 }} className="min-w-[85vw] md:min-w-0 snap-center rounded-3xl p-8 bg-gradient-to-br from-emerald-600 to-teal-700 shadow-xl relative overflow-hidden group cursor-pointer" onClick={() => navigate('/citizen/login')}>
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform">
              <FileText className="w-8 h-8" />
            </div>
            <h2 className="font-heading font-bold text-2xl text-white mb-4">Citizen</h2>
            <ul className="space-y-3 mb-8">
              {['Report local issues easily', 'Get help quickly', 'Track resolution live'].map((f, i) => (
                <li key={i} className="flex items-start text-sm text-emerald-50">
                  <CheckCircle2 className="w-4 h-4 mr-2 text-white mt-0.5 shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <div className="inline-flex px-6 py-2 rounded-full border border-white/30 text-white font-medium hover:bg-white/10 transition-colors">
              Citizen Portal &rarr;
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
                <h3 className="font-heading font-bold text-lg md:text-xl text-white">Are you an NGO?</h3>
                <p className="text-accent-50 text-sm">Partner with Saathi to coordinate volunteers at scale.</p>
              </div>
            </div>
            <div className="shrink-0 bg-white text-accent-700 font-bold px-6 py-3 rounded-full flex items-center group-hover:scale-105 transition-transform">
              Register NGO &rarr;
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Live Stats */}
      <section className="py-16 bg-primary-900 text-white text-center">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="text-4xl md:text-5xl font-heading font-bold text-accent-400 mb-2">{stats.volunteers.toLocaleString()}+</div>
            <div className="text-primary-200 font-medium">Volunteers Registered</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-heading font-bold text-accent-400 mb-2">{stats.reports.toLocaleString()}+</div>
            <div className="text-primary-200 font-medium">Reports Resolved</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-heading font-bold text-accent-400 mb-2">{stats.districts}</div>
            <div className="text-primary-200 font-medium">Districts Covered</div>
          </div>
        </div>
      </section>

      {/* Section 4: How it Works */}
      <section className="py-24 px-4 bg-warm-50 max-w-6xl mx-auto text-center">
        <h2 className="font-heading font-bold text-3xl md:text-4xl text-slate-800 mb-16">How Saathi Works</h2>
        <div className="flex flex-col md:flex-row items-center justify-between relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-0.5 bg-warm-200 -z-10 border-t-2 border-dashed border-warm-300"></div>
          
          <div className="flex flex-col items-center mb-10 md:mb-0 bg-white p-6 rounded-3xl shadow-sm z-10 max-w-[280px]">
            <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-4 shadow-inner text-xl font-bold border-4 border-white">1</div>
            <FileText className="w-8 h-8 text-primary-500 mb-4" />
            <h3 className="font-bold text-lg mb-2">Citizen Reports</h3>
            <p className="text-slate-500 text-sm">A citizen snaps a photo and reports an issue in their area.</p>
          </div>
          
          <div className="flex flex-col items-center mb-10 md:mb-0 bg-white p-6 rounded-3xl shadow-sm z-10 max-w-[280px]">
            <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-4 shadow-inner text-xl font-bold border-4 border-white">2</div>
            <Cpu className="w-8 h-8 text-primary-500 mb-4" />
            <h3 className="font-bold text-lg mb-2">AI Matching</h3>
            <p className="text-slate-500 text-sm">Saathi AI instantly finds the best skilled volunteer nearby.</p>
          </div>
          
          <div className="flex flex-col items-center bg-white p-6 rounded-3xl shadow-sm z-10 max-w-[280px]">
            <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-4 shadow-inner text-xl font-bold border-4 border-white">3</div>
            <CheckCircle2 className="w-8 h-8 text-primary-500 mb-4" />
            <h3 className="font-bold text-lg mb-2">Issue Resolved</h3>
            <p className="text-slate-500 text-sm">The volunteer fixes the issue and uploads proof.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-50 py-12 px-4 text-center">
        <div className="flex items-center justify-center mb-4 text-primary-700">
          <Heart className="w-6 h-6 mr-2 fill-current" />
          <span className="font-heading font-bold text-xl">Saathi</span>
        </div>
        <p className="text-primary-800/60 text-sm mb-2">Empowering communities across India.</p>
        <p className="text-primary-800/40 text-xs">&copy; 2026 Saathi – Smart Resource Allocation System</p>
      </footer>
    </div>
  );
}