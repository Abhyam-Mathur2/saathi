import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Phone, MapPin, Trash2, Search, Loader2, MessageCircle } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import ChatbotWidget from '../components/ChatbotWidget';
import { apiUrl } from '../config/api';

const VolunteerManagement = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sendingTo, setSendingTo] = useState('');

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    try {
      const response = await axios.get(apiUrl('/api/volunteers'));
      setVolunteers(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch volunteers');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this volunteer?')) {
      try {
        await axios.delete(apiUrl(`/api/volunteers/${id}`));
        toast.success('Volunteer removed');
        setVolunteers(volunteers.filter(v => v._id !== id));
      } catch (error) {
        toast.error('Failed to remove volunteer');
      }
    }
  };

  const handleSendWhatsApp = async (volunteer) => {
    try {
      setSendingTo(volunteer._id);
      await axios.post(apiUrl('/api/whatsapp/send'), {
        to: volunteer.phone,
        message: `Hi ${volunteer.name || 'Volunteer'}, thank you for supporting Saathi.`,
      });
      toast.success(`Message sent to ${volunteer.name}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send WhatsApp message');
    } finally {
      setSendingTo('');
    }
  };

  const filteredVolunteers = volunteers.filter(v => 
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="w-12 h-12 animate-spin text-primary-600" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Toaster position="top-right" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Volunteer Management</h1>
          <p className="text-slate-500">View and manage your network of {volunteers.length} volunteers.</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
          <input 
            type="text"
            placeholder="Search by name or skill..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 rounded-xl border-slate-200 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVolunteers.map((volunteer) => (
          <div key={volunteer._id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                    {volunteer.profileImage ? (
                      <img src={volunteer.profileImage} alt={volunteer.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{volunteer.name}</h3>
                    <p className="text-xs text-slate-500">{volunteer.email}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(volunteer._id)}
                  className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-slate-600 gap-2">
                  <Phone className="w-4 h-4 text-slate-400" /> {volunteer.phone}
                </div>
                <div className="flex items-center text-sm text-slate-600 gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" /> {volunteer.location.address || 'Location hidden'}
                </div>
                <button
                  type="button"
                  onClick={() => handleSendWhatsApp(volunteer)}
                  disabled={sendingTo === volunteer._id}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800 disabled:opacity-60"
                >
                  <MessageCircle className="w-4 h-4" /> Send WhatsApp
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Skills</p>
                <div className="flex flex-wrap gap-1">
                  {volunteer.skills.map(skill => (
                    <span key={skill} className="text-[10px] bg-primary-50 text-primary-700 px-2 py-1 rounded-md font-medium border border-primary-100">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex justify-between items-center">
              <span className="text-[10px] text-slate-400">Joined {new Date(volunteer.createdAt).toLocaleDateString()}</span>
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Active</span>
            </div>
          </div>
        ))}
      </div>

      {filteredVolunteers.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
          <User className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 italic">No volunteers found matching your criteria.</p>
        </div>
      )}
      <ChatbotWidget defaultRole="admin" />
    </div>
  );
};

export default VolunteerManagement;
