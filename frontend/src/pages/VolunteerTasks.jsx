import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, MessageCircle, CheckCircle2, ChevronRight, Check, X, Navigation, Users, Camera } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import BottomSheet from '../components/ui/BottomSheet';
import { getSession } from '../utils/roleAuth';

export default function VolunteerTasks() {
  const session = getSession();
  const { width, height } = useWindowSize();
  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Completion Modal State
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [completionPhoto, setCompletionPhoto] = useState('');
  const [completionNote, setCompletionNote] = useState('');
  const [submittingComplete, setSubmittingComplete] = useState(false);

  useEffect(() => {
    // Mock fetching assigned tasks for this volunteer
    setTimeout(() => {
      setTasks([
        {
          _id: 't1',
          issueType: 'Food',
          description: 'Deliver 50 dry ration kits to flood-affected families.',
          urgency: 9,
          status: 'Assigned',
          location: { address: 'Danapur, Patna, Bihar', coordinates: [85.1376, 25.5941] },
          distanceKm: 2.4,
          citizenPhone: '9876543210',
          citizenName: 'Rahul Kumar'
        },
        {
          _id: 't2',
          issueType: 'Infrastructure',
          description: 'Help clear fallen trees from main approach road.',
          urgency: 7,
          status: 'Confirmed',
          location: { address: 'Sector 4 Main Road', coordinates: [85.1400, 25.6000] },
          distanceKm: 5.1,
          citizenPhone: '9123456789',
          citizenName: 'Priya Singh'
        }
      ]);
      setCompletedTasks([
        {
          _id: 'c1',
          issueType: 'Medical',
          description: 'Delivered first aid kits.',
          resolvedAt: new Date(Date.now() - 86400000).toISOString(),
          completionPhoto: 'https://via.placeholder.com/150'
        }
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const handleAccept = (taskId) => {
    setTasks(tasks.map(t => t._id === taskId ? { ...t, status: 'Confirmed' } : t));
    toast.success('Task accepted! Citizen notified.');
  };

  const handleDecline = async (taskId) => {
    // Mock backend call
    toast.loading('Reassigning task...', { id: 'decline' });
    try {
      await fetch(`/api/volunteers/${session.id}/decline-task/${taskId}`, { method: 'PUT' });
      setTasks(tasks.filter(t => t._id !== taskId));
      toast.success('Task reassigned successfully', { id: 'decline' });
    } catch (e) {
      setTasks(tasks.filter(t => t._id !== taskId));
      toast.success('Task reassigned successfully', { id: 'decline' }); // Mock success
    }
  };

  const openMaps = (lat, lng, address) => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const url = isIOS
      ? `maps://maps.apple.com/?daddr=${lat},${lng}`
      : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCompletionPhoto(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const submitCompletion = async () => {
    if (!completionPhoto) {
      toast.error('Please upload a proof photo');
      return;
    }
    setSubmittingComplete(true);
    try {
      await fetch(`/api/reports/${selectedTask._id}/complete`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completionPhoto, note: completionNote })
      });
      
      setTasks(tasks.filter(t => t._id !== selectedTask._id));
      setCompletedTasks([{ ...selectedTask, resolvedAt: new Date().toISOString(), completionPhoto }, ...completedTasks]);
      
      setIsCompleteOpen(false);
      setShowConfetti(true);
      toast.success('Great work! You have helped your community 🎉');
      setTimeout(() => setShowConfetti(false), 5000);
      
      // Reset form
      setCompletionPhoto('');
      setCompletionNote('');
      setSelectedTask(null);
    } catch (e) {
      toast.error('Failed to submit completion');
    } finally {
      setSubmittingComplete(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-warm-50 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="min-h-screen bg-warm-50 pb-safe">
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />}
      <PageHeader title="My Tasks" />
      
      <div className="px-4 py-4 max-w-md mx-auto">
        <h2 className="font-heading font-bold text-xl text-slate-800 mb-4">Active Tasks ({tasks.length})</h2>
        
        {tasks.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-3xl border border-warm-200">
            <CheckCircle2 className="w-12 h-12 text-warm-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800">All Caught Up!</h3>
            <p className="text-sm text-slate-500">You have no active tasks.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {tasks.map(task => {
                const isConfirmed = task.status === 'Confirmed';
                
                return (
                  <motion.div 
                    key={task._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                    className="relative overflow-hidden"
                  >
                    <Card className="pl-6 border-0">
                      {/* Urgency Color Bar */}
                      <div className={`absolute left-0 top-0 bottom-0 w-2 ${task.urgency >= 8 ? 'bg-red-500' : task.urgency >= 5 ? 'bg-amber-500' : 'bg-green-500'}`}></div>
                      
                      <div className="flex justify-between items-start mb-2">
                        <Badge type="issue">{task.issueType}</Badge>
                        <Badge type="urgency" urgency={task.urgency}>{task.urgency}/10 Urgency</Badge>
                      </div>
                      
                      <p className="font-bold text-slate-800 text-sm mb-3 line-clamp-2">{task.description}</p>
                      
                      <div className="flex items-start text-xs text-slate-500 mb-4">
                        <MapPin className="w-4 h-4 mr-1 shrink-0 text-slate-400" />
                        <span>{task.location?.address} • <span className="font-semibold text-slate-700">{task.distanceKm} km away</span></span>
                      </div>
                      
                      {!isConfirmed ? (
                        <div className="flex space-x-3 mt-4">
                          <Button variant="primary" onClick={() => handleAccept(task._id)} className="flex-1 py-2">
                            <Check className="w-4 h-4 mr-1" /> Accept
                          </Button>
                          <Button variant="outline" onClick={() => handleDecline(task._id)} className="flex-1 py-2 border-red-200 text-red-600 hover:bg-red-50">
                            <X className="w-4 h-4 mr-1" /> Decline
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3 mt-4 pt-4 border-t border-warm-100">
                          <div className="flex space-x-3">
                            <Button variant="accent" onClick={() => openMaps(task.location.coordinates[1], task.location.coordinates[0], task.location.address)} className="flex-1 py-2 text-xs">
                              <Navigation className="w-4 h-4 mr-1" /> Navigate
                            </Button>
                            <Button variant="primary" onClick={() => { setSelectedTask(task); setIsCompleteOpen(true); }} className="flex-1 py-2 text-xs">
                              <Camera className="w-4 h-4 mr-1" /> Complete
                            </Button>
                          </div>
                          <div className="flex items-center justify-center pt-2">
                            <button className="text-xs font-bold text-primary-600 flex items-center hover:text-primary-800 transition-colors">
                              <Users className="w-3.5 h-3.5 mr-1" /> Request Backup
                            </button>
                          </div>
                        </div>
                      )}
                    </Card>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}

        {completedTasks.length > 0 && (
          <div className="mt-8">
            <h2 className="font-heading font-bold text-lg text-slate-800 mb-4 px-1">Completed ({completedTasks.length})</h2>
            <div className="space-y-3">
              {completedTasks.map(task => (
                <div key={task._id} className="bg-white rounded-2xl p-3 border border-warm-200 flex items-center">
                  <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 mr-3 relative">
                    <img src={task.completionPhoto || 'https://via.placeholder.com/150'} alt="Proof" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-white drop-shadow-md" />
                    </div>
                  </div>
                  <div className="overflow-hidden flex-1">
                    <h4 className="font-bold text-sm text-slate-800 truncate">{task.issueType} Task</h4>
                    <p className="text-xs text-slate-500 truncate">{new Date(task.resolvedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomSheet isOpen={isCompleteOpen} onClose={() => setIsCompleteOpen(false)}>
        <h2 className="font-heading font-bold text-2xl text-slate-800 mb-2">Mark Complete</h2>
        <p className="text-slate-500 text-sm mb-6">Upload a photo to verify task completion.</p>

        <label className={`block w-full border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-colors mb-4 ${completionPhoto ? 'border-primary-500 bg-primary-50' : 'border-warm-300 hover:bg-warm-100 bg-white'}`}>
          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoUpload} />
          {completionPhoto ? (
            <div className="w-full h-40 rounded-xl overflow-hidden">
              <img src={completionPhoto} alt="Preview" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="flex flex-col items-center py-6">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-3">
                <Camera className="w-8 h-8 text-primary-500" />
              </div>
              <h3 className="font-bold text-slate-700">Take a Photo</h3>
            </div>
          )}
        </label>

        <textarea 
          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:ring-2 focus:ring-primary-500 outline-none resize-none h-24 mb-6"
          placeholder="Add any notes about the resolution... (Optional)"
          value={completionNote}
          onChange={(e) => setCompletionNote(e.target.value)}
        />

        <Button onClick={submitCompletion} isLoading={submittingComplete} className="w-full py-4 text-base shadow-md">
          Submit Completion
        </Button>
      </BottomSheet>
    </div>
  );
}