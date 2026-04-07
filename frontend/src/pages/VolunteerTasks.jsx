import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, CheckCircle2, Check, X, Navigation, Camera, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import axios from 'axios';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import BottomSheet from '../components/ui/BottomSheet';
import { getSession } from '../utils/roleAuth';

const API = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const statusColor = (status) => {
    switch (status) {
        case 'Pending': return 'bg-amber-100 text-amber-700';
        case 'Accepted': return 'bg-blue-100 text-blue-700';
        case 'In Progress': return 'bg-indigo-100 text-indigo-700';
        case 'Completed': return 'bg-green-100 text-green-700';
        case 'Declined': return 'bg-red-100 text-red-700';
        default: return 'bg-slate-100 text-slate-600';
    }
};

export default function VolunteerTasks() {
    const session = getSession();
    const { width, height } = useWindowSize();
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showConfetti, setShowConfetti] = useState(false);

    // Completion Modal
    const [isCompleteOpen, setIsCompleteOpen] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [completionPhoto, setCompletionPhoto] = useState('');
    const [completionNote, setCompletionNote] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchAssignments = useCallback(async () => {
        if (!session?.id) return;
        try {
            setLoading(true);
            const res = await fetch(`${API}/volunteers/${session.id}/assignments`);
            const data = await res.json();
            if (data.success) setAssignments(data.data);
        } catch (e) {
            toast.error('Could not load tasks.');
        } finally {
            setLoading(false);
        }
    }, [session?.id]);

    useEffect(() => { fetchAssignments(); }, [session?.id, fetchAssignments]);

    const handleAccept = async (assignment) => {
        try {
            const res = await fetch(`${API}/volunteers/${session.id}/assignments/${assignment._id}/accept`, { method: 'PUT' });
            const data = await res.json();
            if (data.success) {
                setAssignments(prev => prev.map(a => a._id === assignment._id ? { ...a, status: 'Accepted' } : a));
                toast.success('Task accepted! Navigate to get started.');
            } else {
                toast.error(data.message);
            }
        } catch {
            toast.error('Failed to accept task.');
        }
    };

    const handleDecline = async (assignment) => {
        toast.loading('Declining and reassigning...', { id: 'decline' });
        try {
            const res = await fetch(`${API}/reports/${assignment.report._id}/decline`, { 
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ volunteerId: session.id })
            });
            const data = await res.json();
            if (data.success) {
                setAssignments(prev => prev.filter(a => a._id !== assignment._id));
                toast.success('Task declined. Auto-reassigning to next volunteer.', { id: 'decline' });
            } else {
                toast.error(data.message, { id: 'decline' });
            }
        } catch {
            toast.error('Failed to decline.', { id: 'decline' });
        }
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
        setSubmitting(true);
        try {
            const res = await fetch(`${API}/volunteers/${session.id}/assignments/${selectedAssignment._id}/complete`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completionPhoto, completionNote })
            });
            const data = await res.json();
            if (data.success) {
                setAssignments(prev => prev.filter(a => a._id !== selectedAssignment._id));
                setIsCompleteOpen(false);
                setShowConfetti(true);
                toast.success('Great work! You have helped your community 🎉');
                setTimeout(() => setShowConfetti(false), 5000);
                setCompletionPhoto('');
                setCompletionNote('');
                setSelectedAssignment(null);
            } else {
                toast.error(data.message);
            }
        } catch {
            toast.error('Failed to submit completion.');
        } finally {
            setSubmitting(false);
        }
    };

    const openMaps = (coords, address) => {
        const [lng, lat] = coords;
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const url = isIOS
            ? `maps://maps.apple.com/?daddr=${lat},${lng}`
            : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(address)}`;
        window.open(url, '_blank');
    };

    const activeAssignments = assignments.filter(a => !['Completed', 'Declined'].includes(a.status));
    const pastAssignments = assignments.filter(a => ['Completed', 'Declined'].includes(a.status));

    if (loading) return (
        <div className="min-h-screen bg-warm-50 flex items-center justify-center">
            <Loader2 className="animate-spin w-8 h-8 text-primary-600" />
        </div>
    );

    return (
        <div className="min-h-screen bg-warm-50 pb-safe">
            {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />}
            <PageHeader title="My Tasks" />

            <div className="px-4 py-4 max-w-lg mx-auto space-y-6">
                {/* Active Tasks */}
                <div>
                    <h2 className="font-heading font-bold text-lg text-slate-800 mb-3">
                        Active Tasks ({activeAssignments.length})
                    </h2>

                    {activeAssignments.length === 0 ? (
                        <div className="text-center py-10 bg-white rounded-3xl border border-warm-200">
                            <CheckCircle2 className="w-12 h-12 text-warm-300 mx-auto mb-3" />
                            <h3 className="font-bold text-slate-800">All Caught Up!</h3>
                            <p className="text-sm text-slate-500">No active tasks assigned to you.</p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {activeAssignments.map(assignment => {
                                const report = assignment.report;
                                const isPending = assignment.status === 'Pending';
                                const isAccepted = assignment.status === 'Accepted' || assignment.status === 'In Progress';

                                return (
                                    <motion.div
                                        key={assignment._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="relative overflow-hidden mb-4"
                                    >
                                        <Card className="pl-6 border-0">
                                            <div className={`absolute left-0 top-0 bottom-0 w-2 ${report?.urgency >= 8 ? 'bg-red-500' : report?.urgency >= 5 ? 'bg-amber-500' : 'bg-green-500'}`} />

                                            <div className="flex justify-between items-start mb-2">
                                                <Badge type="issue">{report?.issueType}</Badge>
                                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusColor(assignment.status)}`}>
                                                    {assignment.status}
                                                </span>
                                            </div>

                                            <p className="font-bold text-slate-800 text-sm mb-2 line-clamp-2">
                                                {report?.description}
                                            </p>

                                            {report?.organization && (
                                                <p className="text-xs text-primary-600 font-medium mb-2">
                                                    📍 {report.organization.name}
                                                </p>
                                            )}

                                            <div className="flex items-start text-xs text-slate-500 mb-3">
                                                <MapPin className="w-4 h-4 mr-1 shrink-0 text-slate-400" />
                                                <span>{report?.location?.address}</span>
                                            </div>

                                            <div className="flex items-center text-xs text-slate-400 mb-4">
                                                <AlertCircle className="w-3.5 h-3.5 mr-1" />
                                                Urgency: <strong className="ml-1 text-slate-600">{report?.urgency}/10</strong>
                                                <Clock className="w-3.5 h-3.5 ml-3 mr-1" />
                                                {new Date(assignment.assignedAt).toLocaleDateString()}
                                            </div>

                                            {isPending ? (
                                                <div className="flex space-x-3">
                                                    <Button variant="primary" onClick={() => handleAccept(assignment)} className="flex-1 py-2">
                                                        <Check className="w-4 h-4 mr-1" /> Accept
                                                    </Button>
                                                    <Button variant="outline" onClick={() => handleDecline(assignment)} className="flex-1 py-2 border-red-200 text-red-600 hover:bg-red-50">
                                                        <X className="w-4 h-4 mr-1" /> Decline
                                                    </Button>
                                                </div>
                                            ) : isAccepted ? (
                                                <div className="space-y-3">
                                                    <div className="flex space-x-3">
                                                        <Button variant="accent" onClick={() => openMaps(report?.location?.coordinates, report?.location?.address)} className="flex-1 py-2 text-xs">
                                                            <Navigation className="w-4 h-4 mr-1" /> Navigate
                                                        </Button>
                                                        <Button variant="primary" onClick={() => { setSelectedAssignment(assignment); setIsCompleteOpen(true); }} className="flex-1 py-2 text-xs">
                                                            <Camera className="w-4 h-4 mr-1" /> Complete
                                                        </Button>
                                                    </div>
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                const city = session?.city;
                                                                const resVols = await axios.get(`${API}/volunteers?city=${city}`);
                                                                const nearbyVols = (resVols.data?.data || []).filter(v => v._id !== session.id);

                                                                if (nearbyVols.length === 0) {
                                                                    toast.error('No other volunteers found in your city.');
                                                                    return;
                                                                }

                                                                await axios.post(`${API}/activity/ping`, {
                                                                    senderId: session.id,
                                                                    senderName: session.name,
                                                                    targetVolunteerIds: nearbyVols.map(v => v._id),
                                                                    reportId: assignment.report._id
                                                                });

                                                                const message = `BACKUP NEEDED: Volunteer ${session.name} needs help with a ${assignment.report.issueType} task at ${assignment.report.location.address}. Join if available.`;
                                                                for (const vol of nearbyVols.slice(0, 3)) {
                                                                    await axios.post(`${API}/whatsapp/send`, { to: vol.phone, message });
                                                                }

                                                                toast.success(`Ping sent to ${nearbyVols.length} volunteers!`);
                                                            } catch (error) {
                                                                console.error('Ping error:', error);
                                                                toast.error('Failed to send pings.');
                                                            }
                                                        }}
                                                        className="w-full py-2 text-xs font-bold text-sky-600 bg-sky-50 hover:bg-sky-100 rounded-xl transition-colors"
                                                    >
                                                        Request Backup (Ping Nearby)
                                                    </button>
                                                </div>
                                            ) : null}
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    )}
                </div>

                {/* Past Tasks */}
                {pastAssignments.length > 0 && (
                    <div>
                        <h2 className="font-heading font-bold text-lg text-slate-800 mb-3">
                            History ({pastAssignments.length})
                        </h2>
                        <div className="space-y-3">
                            {pastAssignments.map(a => (
                                <div key={a._id} className="bg-white rounded-2xl p-4 border border-warm-200 flex items-start gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${a.status === 'Completed' ? 'bg-green-100' : 'bg-red-100'}`}>
                                        {a.status === 'Completed'
                                            ? <CheckCircle2 className="w-5 h-5 text-green-600" />
                                            : <X className="w-5 h-5 text-red-500" />}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="font-bold text-sm text-slate-800 truncate">
                                            {a.report?.issueType} — {a.report?.location?.address}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {a.status} · {new Date(a.completedAt || a.declinedAt || a.assignedAt).toLocaleDateString()}
                                        </p>
                                        {a.completionNote && <p className="text-xs text-slate-500 mt-1 italic">{a.completionNote}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Completion Bottom Sheet */}
            <BottomSheet isOpen={isCompleteOpen} onClose={() => setIsCompleteOpen(false)}>
                <h2 className="font-heading font-bold text-2xl text-slate-800 mb-2">Mark Complete</h2>
                <p className="text-slate-500 text-sm mb-6">Upload a photo proof of task completion.</p>

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
                    placeholder="Any notes about the resolution... (Optional)"
                    value={completionNote}
                    onChange={(e) => setCompletionNote(e.target.value)}
                />

                <Button onClick={submitCompletion} isLoading={submitting} className="w-full py-4 text-base shadow-md">
                    Submit Completion
                </Button>
            </BottomSheet>
        </div>
    );
}