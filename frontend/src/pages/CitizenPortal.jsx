import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FileText, Map, AlertTriangle, Calendar, ChevronRight } from 'lucide-react';
import RoleToggle from '../components/RoleToggle';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { getSession } from '../utils/roleAuth';

export default function CitizenPortal() {
  const session = getSession();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const store = JSON.parse(localStorage.getItem('saathi_citizen_reports') || '[]');
    setReports(store.slice(0, 3));

    fetch('/api/events?audience=citizens')
      .then(r => r.json())
      .then(data => setEvents(data))
      .catch(console.error);
  }, []);

  const openChatbot = () => {
    window.dispatchEvent(new CustomEvent('open-chatbot'));
  };

  return (
    <div className="min-h-screen bg-warm-50 pb-safe p-4">
      <div className="mb-6 mt-4">
        <h1 className="font-heading font-bold text-2xl text-slate-800">Hello, {session?.name?.split(' ')[0]} 👋</h1>
        <p className="text-slate-500">How can Saathi help today?</p>
      </div>

      <RoleToggle session={session} />

      <div className="grid grid-cols-2 gap-4 mb-8">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => navigate('/report')} className="bg-gradient-to-br from-primary-400 to-primary-600 rounded-3xl p-5 text-white shadow-card cursor-pointer">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-bold mb-1">Report Need</h3>
          <p className="text-xs text-primary-100">Help your area</p>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => navigate('/track')} className="bg-gradient-to-br from-accent-400 to-accent-600 rounded-3xl p-5 text-white shadow-card cursor-pointer">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
            <Map className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-bold mb-1">Track Reports</h3>
          <p className="text-xs text-accent-50">View status</p>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => navigate('/emergency')} className="bg-gradient-to-br from-red-500 to-rose-600 rounded-3xl p-5 text-white shadow-card cursor-pointer">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-bold mb-1">Emergency</h3>
          <p className="text-xs text-red-100">Send alert</p>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => navigate('/events')} className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl p-5 text-white shadow-card cursor-pointer">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-bold mb-1">View Events</h3>
          <p className="text-xs text-purple-100">Join drives</p>
        </motion.div>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-bold text-lg text-slate-800">My Recent Reports</h2>
          <button onClick={() => navigate('/track')} className="text-sm font-semibold text-primary-600">See All</button>
        </div>
        
        {reports.length === 0 ? (
          <Card className="text-center py-8">
            <div className="w-16 h-16 bg-warm-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText className="w-8 h-8 text-warm-400" />
            </div>
            <p className="text-slate-500 text-sm">No active reports</p>
          </Card>
        ) : (
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 hide-scrollbar">
            {reports.map(r => (
              <motion.div key={r.id} onClick={() => navigate(`/track/${r.id}`)} className="snap-center min-w-[280px] bg-white rounded-3xl p-5 shadow-card cursor-pointer flex-shrink-0">
                <div className="flex justify-between items-start mb-3">
                  <Badge type="issue">{r.issueType}</Badge>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${r.status === 'Pending' ? 'bg-orange-100 text-orange-600' : r.status === 'Assigned' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>{r.status}</span>
                </div>
                <h4 className="font-bold text-sm text-slate-800 mb-4 line-clamp-2">{r.description}</h4>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-xs text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {events.length > 0 && (
        <div className="mb-8">
          <h2 className="font-heading font-bold text-lg text-slate-800 mb-4">Upcoming Events</h2>
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 hide-scrollbar">
            {events.map(e => (
              <Card key={e._id} className="snap-center min-w-[280px] flex-shrink-0">
                <div className="flex items-start">
                  <div className="bg-primary-50 rounded-xl p-3 text-center mr-4">
                    <span className="block text-2xl font-bold text-primary-600 leading-none">{new Date(e.date).getDate()}</span>
                    <span className="block text-xs font-semibold text-primary-400 uppercase mt-1">{new Date(e.date).toLocaleDateString('en-US', {month:'short'})}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm mb-1">{e.title}</h4>
                    <p className="text-xs text-slate-500 mb-2">{e.location?.address}</p>
                    <button className="text-xs font-bold text-accent-600 bg-accent-50 px-3 py-1 rounded-full">Learn More</button>
                  </div>
                </div>
            </Card>
            ))}
          </div>
        </div>
      )}

      <Card className="bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200" onClick={openChatbot}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-primary-800 mb-1 flex items-center">
              <span className="text-lg mr-2">🤖</span> Ask Saathi AI
            </h3>
            <p className="text-xs text-primary-600">Need help? Ask me anything.</p>
          </div>
          <Button variant="primary" className="px-4 py-2" onClick={openChatbot}>Chat</Button>
        </div>
      </Card>
    </div>
  );
}