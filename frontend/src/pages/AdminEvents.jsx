import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Users, Plus } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { apiUrl } from '../config/api';

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', eventType: 'Donation', date: '', address: '', targetAudience: 'both'
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch(apiUrl('/api/events'));
      const data = await res.json();
      setEvents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await fetch(apiUrl('/api/events'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, location: { address: formData.address } })
      });
      setIsModalOpen(false);
      setFormData({ title: '', description: '', eventType: 'Donation', date: '', address: '', targetAudience: 'both' });
      fetchEvents();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(apiUrl(`/api/events/${id}`), { method: 'DELETE' });
      fetchEvents();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading Events...</div>;

  return (
    <div className="min-h-screen bg-warm-50 pb-safe">
      <PageHeader 
        title="Community Events" 
        rightAction={<Button size="sm" onClick={() => setIsModalOpen(true)}><Plus className="w-4 h-4 mr-1" /> Create Event</Button>} 
      />
      
      <div className="p-4 max-w-4xl mx-auto space-y-4">
        {events.length === 0 ? (
          <div className="text-center py-12 text-slate-500">No events found. Create one!</div>
        ) : (
          events.map(event => (
            <Card key={event._id} className="flex flex-col sm:flex-row relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-2 bg-purple-500"></div>
              
              <div className="flex flex-col sm:flex-row flex-1 px-4 py-2">
                <div className="bg-purple-50 rounded-xl p-4 text-center sm:mr-6 mb-4 sm:mb-0 w-24 shrink-0 flex flex-col justify-center">
                  <span className="block text-3xl font-bold text-purple-600 leading-none">{new Date(event.date).getDate()}</span>
                  <span className="block text-sm font-semibold text-purple-400 uppercase mt-1">{new Date(event.date).toLocaleDateString('en-US', {month:'short'})}</span>
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <Badge className="bg-purple-100 text-purple-700">{event.eventType}</Badge>
                    <Badge className="bg-slate-100 text-slate-600">{event.status}</Badge>
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 mb-2">{event.title}</h3>
                  <p className="text-sm text-slate-600 mb-3">{event.description}</p>
                  
                  <div className="flex items-center text-xs text-slate-500 space-x-4">
                    <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1" /> {event.location?.address}</span>
                    <span className="flex items-center"><Users className="w-3.5 h-3.5 mr-1" /> {event.registeredVolunteers?.length || 0} Registered</span>
                  </div>
                </div>
              </div>
              
              <div className="border-t sm:border-t-0 sm:border-l border-warm-100 p-4 flex sm:flex-col justify-end space-x-2 sm:space-x-0 sm:space-y-2 mt-4 sm:mt-0">
                <Button variant="danger" className="text-xs py-1.5" onClick={() => handleDelete(event._id)}>Delete</Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="font-heading font-bold text-xl mb-4">Create New Event</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Title</label>
                <input required type="text" className="w-full bg-slate-50 rounded-xl p-3 outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Description</label>
                <textarea required className="w-full bg-slate-50 rounded-xl p-3 outline-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-1">Type</label>
                  <select className="w-full bg-slate-50 rounded-xl p-3 outline-none" value={formData.eventType} onChange={e => setFormData({...formData, eventType: e.target.value})}>
                    <option>Donation</option><option>Medical Camp</option><option>Cleanup</option><option>Education</option><option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold mb-1">Date</label>
                  <input required type="date" className="w-full bg-slate-50 rounded-xl p-3 outline-none" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Address</label>
                <input required type="text" className="w-full bg-slate-50 rounded-xl p-3 outline-none" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              <div className="flex space-x-3 mt-6">
                <Button type="button" variant="ghost" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="flex-1">Create Event</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}