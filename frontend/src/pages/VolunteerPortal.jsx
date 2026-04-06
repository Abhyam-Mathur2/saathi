import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, FileText, MessageSquare, User, Navigation, CheckCircle2, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import RoleToggle from '../components/RoleToggle';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Avatar from '../components/ui/Avatar';
import { getSession } from '../utils/roleAuth';
import ChatbotWidget from '../components/ChatbotWidget';

export default function VolunteerPortal() {
  const session = getSession();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Home');
  const [isAvailable, setIsAvailable] = useState(true);

  const toggleAvailability = () => {
    setIsAvailable(!isAvailable);
    fetch(`/api/volunteers/${session.id}/toggle-availability`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ available: !isAvailable })
    }).catch(console.error);
  };

  return (
    <div className="min-h-screen bg-warm-50 pb-safe p-4">
      <div className="flex justify-between items-start mb-4 mt-2">
        <div>
          <h1 className="font-heading font-bold text-2xl text-slate-800">Good morning, {session?.name?.split(' ')[0]} 👋</h1>
          <p className="text-slate-500 text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
        </div>
        <button 
          onClick={toggleAvailability}
          className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors flex items-center ${isAvailable ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}
        >
          <span className={`w-2 h-2 rounded-full mr-2 ${isAvailable ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
          {isAvailable ? 'Available' : 'Busy'}
        </button>
      </div>

      <RoleToggle session={session} />

      {/* Tabs */}
      <div className="flex overflow-x-auto space-x-2 py-2 mb-6 hide-scrollbar">
        {['Home', 'My Tasks', 'Find Reports', 'Messages'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${activeTab === tab ? 'bg-primary-600 text-white shadow-md' : 'bg-white border border-warm-200 text-slate-600'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'Home' && (
            <div className="space-y-6">
              {/* Quick Summary */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-primary-50 border border-primary-100 flex flex-col justify-center text-center p-4">
                  <span className="text-3xl font-heading font-bold text-primary-600 mb-1">2</span>
                  <span className="text-xs font-semibold text-primary-800 uppercase tracking-wide">Active Tasks</span>
                </Card>
                <Card className="bg-amber-50 border border-amber-100 flex flex-col justify-center text-center p-4">
                  <span className="text-3xl font-heading font-bold text-amber-600 mb-1">14</span>
                  <span className="text-xs font-semibold text-amber-800 uppercase tracking-wide">Hours Given</span>
                </Card>
              </div>

              {/* Action Cards */}
              <div className="space-y-3">
                <motion.div whileTap={{ scale: 0.98 }} onClick={() => navigate('/volunteer/tasks')} className="bg-white rounded-3xl p-5 shadow-card flex items-center cursor-pointer">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mr-4 text-primary-600">
                    <CheckSquare className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800">My Tasks</h3>
                    <p className="text-xs text-slate-500">View and complete assignments</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </motion.div>

                <motion.div whileTap={{ scale: 0.98 }} onClick={() => navigate('/route-planner')} className="bg-white rounded-3xl p-5 shadow-card flex items-center cursor-pointer">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mr-4 text-emerald-600">
                    <Navigation className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800">Route Planner</h3>
                    <p className="text-xs text-slate-500">Optimized map for your tasks</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </motion.div>
              </div>

              <div className="bg-gradient-to-r from-accent-500 to-accent-600 rounded-3xl p-6 text-white shadow-card relative overflow-hidden">
                 <div className="relative z-10">
                   <h3 className="font-bold text-lg mb-2">Need Help?</h3>
                   <p className="text-sm text-accent-100 mb-4 max-w-[200px]">Chat with Saathi AI for guidance on handling tasks.</p>
                   <Button variant="outline" className="bg-white/20 border-0 text-white hover:bg-white/30" onClick={() => window.dispatchEvent(new CustomEvent('open-chatbot'))}>
                     Open Chat
                   </Button>
                 </div>
                 <div className="absolute right-0 bottom-0 text-[100px] opacity-20 leading-none translate-y-4 translate-x-4">🤖</div>
              </div>
            </div>
          )}

          {activeTab === 'My Tasks' && (
            <div className="text-center py-10">
               <h3 className="font-bold text-slate-800">My Tasks</h3>
               <p className="text-sm text-slate-500 mb-4">Redirecting...</p>
            </div>
          )}

          {activeTab === 'Find Reports' && (
            <div className="space-y-4">
               <h3 className="font-bold text-slate-800">Nearby Pending Reports</h3>
               {/* Mock pending report */}
               <Card className="border-0 shadow-sm relative overflow-hidden">
                 <div className="absolute left-0 top-0 bottom-0 w-1 bg-warm-300"></div>
                 <div className="flex justify-between items-start mb-2">
                   <Badge type="issue">Food</Badge>
                   <span className="text-xs text-slate-400">2.1 km away</span>
                 </div>
                 <p className="font-bold text-slate-800 text-sm mb-3">Community kitchen needs volunteers for serving dinner.</p>
                 <Button className="w-full py-2 shadow-none" onClick={() => toast.success('Task Assigned!')}>Accept Task</Button>
               </Card>
            </div>
          )}

          {activeTab === 'Messages' && (
             <div className="text-center py-12 px-4 bg-white rounded-3xl border border-warm-200">
               <MessageSquare className="w-12 h-12 text-warm-300 mx-auto mb-4" />
               <h3 className="font-bold text-slate-800 mb-2">No Messages Yet</h3>
               <p className="text-sm text-slate-500">When you collaborate with other volunteers or citizens, messages will appear here.</p>
             </div>
          )}

        </motion.div>
      </AnimatePresence>
      <ChatbotWidget defaultRole="volunteer" />
    </div>
  );
}