import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { User, MapPin, Award, Calendar, ChevronLeft, CheckCircle, ShieldCheck, MessageCircle } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import ChatbotWidget from '../components/ChatbotWidget';
import { apiUrl } from '../config/api';
import { getSession } from '../utils/roleAuth';

const MatchingPanel = () => {
  const { reportId } = useParams();
  const session = getSession();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingTo, setSendingTo] = useState('');
  const [assigning, setAssigning] = useState('');

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const orgParam = session?.orgId ? `?orgId=${session.orgId}` : '';
        const response = await axios.get(apiUrl(`/api/reports/match/${reportId}${orgParam}`));
        setMatches(response.data.data);
      } catch (error) {
        console.error('Error fetching matches:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, [reportId]);

  const handleAssign = async (volunteer) => {
    setAssigning(volunteer._id);
    try {
      const res = await axios.put(apiUrl(`/api/reports/${reportId}/assign`), {
        volunteerId: volunteer._id,
        adminId: session?.id,
        orgId: session?.orgId
      });
      if (res.data.success) {
        toast.success(`✅ ${volunteer.name} assigned! Task sent.`);
      } else {
        toast.error(res.data.message || 'Assignment failed');
      }
    } catch (e) {
      toast.error('Failed to assign volunteer.');
    } finally {
      setAssigning('');
    }
  };


  const handleSendMessage = async (volunteer) => {
    try {
      setSendingTo(volunteer._id);
      await axios.post(apiUrl('/api/whatsapp/send'), {
        to: volunteer.phone,
        message: `Hi ${volunteer.name || 'Volunteer'}, you have a new community task from Saathi.`,
      });
      toast.success(`WhatsApp message sent to ${volunteer.name}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send message');
    } finally {
      setSendingTo('');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Toaster position="top-right" />
      
      <Link to="/admin/dashboard" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-primary-600 mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Volunteer Match Engine</h1>
        <p className="text-slate-500 mt-2">AI-driven prioritization and multi-factor matching for optimal resource allocation.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-500" />
          Top 3 Best Matches
        </h3>

        {matches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {matches.map((match, index) => (
              <div 
                key={match.volunteer._id} 
                className={`relative bg-white rounded-2xl border-2 transition-all p-6 ${index === 0 ? 'border-primary-500 shadow-lg shadow-primary-50' : 'border-slate-100 shadow-sm hover:border-slate-200'}`}
              >
                {index === 0 && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                    Best Match
                  </span>
                )}

                <div className="flex flex-col items-center text-center mb-6">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 ${index === 0 ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-500'}`}>
                    <User className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-lg">{match.volunteer.name}</h4>
                  <p className="text-xs text-slate-500 flex items-center mt-1">
                    <MapPin className="w-3 h-3 mr-1" /> {match.distance} km away
                  </p>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-slate-400 uppercase">Match Score</span>
                    <span className="text-2xl font-black text-primary-600">{match.totalScore}<span className="text-xs font-normal text-slate-400 ml-1">/10</span></span>
                  </div>
                  
                  {/* Score Breakdown Bars */}
                  <div className="space-y-2">
                    {[
                      { label: 'Skills', val: match.breakdown.skillScore, color: 'bg-emerald-500' },
                      { label: 'Proximity', val: match.breakdown.proximityScore, color: 'bg-blue-500' },
                      { label: 'Urgency', val: match.breakdown.urgencyScore, color: 'bg-red-500' },
                      { label: 'Availability', val: match.breakdown.availabilityScore, color: 'bg-amber-500' },
                    ].map(s => (
                      <div key={s.label}>
                        <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                          <span>{s.label}</span>
                          <span>{s.val}</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${s.color}`} style={{ width: `${s.val * 10}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                   <div className="flex items-start gap-2">
                    <Award className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div className="flex flex-wrap gap-1">
                      {match.volunteer.skills.map(skill => (
                        <span key={skill} className="text-[10px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-100">{skill}</span>
                      ))}
                    </div>
                   </div>
                   <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="text-[10px] text-slate-600 truncate">{match.volunteer.availability.days.join(', ')}</span>
                   </div>
                </div>

                <div className="space-y-2">
                  <button 
                    onClick={() => handleAssign(match.volunteer)}
                    disabled={assigning === match.volunteer._id}
                    className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${index === 0 ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-md shadow-primary-100' : 'bg-slate-900 text-white hover:bg-slate-800'} disabled:opacity-50`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    {assigning === match.volunteer._id ? 'Assigning...' : 'Assign Task'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendMessage(match.volunteer)}
                    disabled={sendingTo === match.volunteer._id}
                    className="w-full py-3 rounded-xl font-bold text-sm border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-all flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Send Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-500 italic">
            No suitable volunteers found for this report.
          </div>
        )}
      </div>
      <ChatbotWidget defaultRole="admin" />
    </div>
  );
};

export default MatchingPanel;
