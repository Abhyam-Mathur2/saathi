import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, MessageSquare, Navigation, ChevronRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { getSession } from '../utils/roleAuth';
import ChatbotWidget from '../components/ChatbotWidget';
import axios from 'axios';
import { apiUrl } from '../config/api';
import ActivityFeed from '../components/activity/ActivityFeed';
import { Activity as ActivityIcon } from 'lucide-react';

export default function VolunteerPortal() {
  const session = getSession();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Home');
  const [isAvailable, setIsAvailable] = useState(true);
  const [pendingReports, setPendingReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newChatMsg, setNewChatMsg] = useState('');
  const [events, setEvents] = useState([]);

  const fetchChatMessages = React.useCallback(async () => {
    if (!session?.city) return;
    try {
      const res = await axios.get(apiUrl(`/api/community/${session.city}`));
      if (res.data.success) setChatMessages(res.data.data);
    } catch (e) {
      console.error('Chat error:', e);
    }
  }, [session?.city]);

  const toggleAvailability = () => {
    setIsAvailable(!isAvailable);
    fetch(`/api/volunteers/${session.id}/toggle-availability`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ available: !isAvailable })
    }).catch(console.error);
  };

  React.useEffect(() => {
    if (activeTab === 'My Tasks') {
      navigate('/volunteer/tasks');
      return;
    }

    if (activeTab === 'Find Reports') {
      const fetchPending = async () => {
        setLoadingReports(true);
        try {
          const res = await axios.get(apiUrl(`/api/reports?city=${session?.city || ''}&status=Pending`));
          setPendingReports(res.data.data || []);
        } catch (e) {
          console.error('Failed to fetch pending reports', e);
        } finally {
          setLoadingReports(false);
        }
      };
      fetchPending();
    } else if (activeTab === 'Messages') {
      fetchChatMessages();
    } else if (activeTab === 'Home') {
      fetch(`${apiUrl('/api/events')}?audience=volunteers`)
          .then(r => r.json())
          .then(d => { if (Array.isArray(d)) setEvents(d); })
          .catch(console.error);
    }
  }, [activeTab, fetchChatMessages, navigate, session?.city]);

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!newChatMsg.trim()) return;
    try {
      const res = await axios.post(apiUrl('/api/community'), {
        city: session.city,
        senderId: session.id,
        senderName: session.name,
        content: newChatMsg
      });
      if (res.data.success) {
        setChatMessages([...chatMessages, res.data.data]);
        setNewChatMsg('');
      }
    } catch(e) {
       toast.error('Failed to send message');
    }
  };

  const handleAcceptTask = async (reportId) => {
    try {
      const res = await axios.put(apiUrl(`/api/reports/${reportId}/assign`), {
        volunteerId: session.id,
        orgId: session.orgId
      });
      if (res.data.success) {
        toast.success('Task Assigned!');
        setPendingReports(prev => prev.filter(r => r._id !== reportId));
      }
    } catch(e) {
      toast.error('Failed to accept task');
    }
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

      {/* Tabs */}
      <div className="flex overflow-x-auto space-x-2 py-2 mb-6 hide-scrollbar">
        {['Home', 'My Tasks', 'Find Reports', 'Messages', 'Activity'].map(tab => (
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

               {/* Upcoming Volunteer Events */}
               {events.length > 0 && (
                   <div className="mb-4">
                       <h3 className="font-bold text-slate-800 mb-2 mt-4 text-sm">Volunteer Events</h3>
                       <div className="flex overflow-x-auto pb-4 space-x-3 hide-scrollbar">
                          {events.map(event => (
                             <Card key={event._id} className="min-w-[220px] flex-shrink-0 shadow-sm border border-warm-200 p-3">
                                 <Badge type="issue" className="mb-2 w-max text-[10px]">{event.eventType}</Badge>
                                 <h3 className="font-bold text-slate-800 text-xs mb-1 line-clamp-1">{event.title}</h3>
                                 <p className="text-[10px] text-slate-500 mb-2 line-clamp-2">{event.description}</p>
                                 <div className="flex items-center text-[10px] text-slate-500 font-medium">
                                    <span className="flex items-center">🗓 {new Date(event.date).toLocaleDateString()}</span>
                                 </div>
                             </Card>
                          ))}
                       </div>
                   </div>
               )}

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
               {loadingReports ? (
                 <p className="text-sm text-slate-500 text-center py-4">Loading reports...</p>
               ) : pendingReports.length === 0 ? (
                 <p className="text-sm text-slate-500 text-center py-4">No pending reports in {session?.city || 'your area'}.</p>
               ) : (
                 pendingReports.map(report => (
                   <Card key={report._id} className="border-0 shadow-sm relative overflow-hidden">
                     <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-400"></div>
                     <div className="flex justify-between items-start mb-2">
                       <Badge type="issue">{report.issueType}</Badge>
                       <span className="text-xs text-slate-400">{report.location?.address || 'Unknown distance'}</span>
                     </div>
                     <p className="font-bold text-slate-800 text-sm mb-3 line-clamp-2">{report.description}</p>
                     <Button className="w-full py-2 shadow-none" onClick={() => handleAcceptTask(report._id)}>Accept Task</Button>
                   </Card>
                 ))
               )}
            </div>
          )}

          {activeTab === 'Messages' && (
             <div className="bg-white rounded-3xl border border-warm-200 overflow-hidden flex flex-col h-[60vh]">
               <div className="bg-warm-50 p-4 border-b border-warm-200 text-center">
                  <h3 className="font-bold text-slate-800">Community: {session.city}</h3>
                  <p className="text-xs text-slate-500">Coordinate with volunteers around you</p>
               </div>
               <div className="flex-1 overflow-y-auto p-4 space-y-4">
                 {chatMessages.length === 0 ? (
                    <div className="text-center py-10 opacity-50">
                      <MessageSquare className="w-10 h-10 mx-auto mb-2" />
                      <p className="text-sm">No messages yet. Be the first to say hi!</p>
                    </div>
                 ) : (
                    chatMessages.map(msg => (
                      <div key={msg._id} className={`flex flex-col ${msg.senderId === session.id ? 'items-end' : 'items-start'}`}>
                         <span className="text-[10px] text-slate-400 mb-1 px-1">{msg.senderName}</span>
                         <div className={`px-4 py-2 rounded-2xl max-w-[85%] text-sm ${msg.senderId === session.id ? 'bg-primary-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'}`}>
                            {msg.content}
                         </div>
                      </div>
                    ))
                 )}
               </div>
               <form onSubmit={handleSendChat} className="p-3 border-t border-warm-200 flex gap-2">
                 <input 
                   type="text" 
                   value={newChatMsg}
                   onChange={e => setNewChatMsg(e.target.value)}
                   placeholder="Message your city..."
                   className="flex-1 rounded-full border-slate-200 text-sm focus:ring-primary-500 bg-slate-50"
                 />
                 <Button type="submit" className="rounded-full w-10 h-10 p-0 flex items-center justify-center shrink-0">
                   <Navigation className="w-4 h-4 rotate-90 ml-1" />
                 </Button>
               </form>
             </div>
          )}

          {activeTab === 'Activity' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-600">
                  <ActivityIcon size={20} />
                </div>
                <div>
                  <h2 className="font-heading font-bold text-xl text-slate-800">My Mission Log</h2>
                  <p className="text-slate-500 text-xs">Your impact journey in one place</p>
                </div>
              </div>
              
              <ActivityFeed 
                volunteerId={session.id} 
                limit={25} 
                showStats={true} 
              />
            </div>
          )}

        </motion.div>
      </AnimatePresence>
      <ChatbotWidget defaultRole="volunteer" />
    </div>
  );
}
