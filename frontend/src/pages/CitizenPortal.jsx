import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FileText, Map, AlertTriangle, Calendar, ChevronRight, Building2, MessageCircle, Phone, MapPin, Loader2 } from 'lucide-react';
import RoleToggle from '../components/RoleToggle';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { getSession } from '../utils/roleAuth';

const API = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

export default function CitizenPortal() {
    const session = getSession();
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [events, setEvents] = useState([]);
    const [orgs, setOrgs] = useState([]);
    const [loadingOrgs, setLoadingOrgs] = useState(true);

    useEffect(() => {
        // Fetch citizen's own reports
        if (session?.id) {
            fetch(`${API}/reports/citizen/${session.id}`)
                .then(r => r.json())
                .then(d => { if (d.success) setReports(d.data.slice(0, 3)); })
                .catch(console.error);
        }

        // Fetch Events scoped to citizens
        fetch(`${API}/events?audience=citizens`)
            .then(r => r.json())
            .then(d => { if (Array.isArray(d)) setEvents(d.slice(0, 3)); })
            .catch(console.error);

        // Fetch NGOs in citizen's city
        const city = session?.city || '';
        const endpoint = city
            ? `${API}/orgs?city=${encodeURIComponent(city)}`
            : `${API}/orgs`;
        fetch(endpoint)
            .then(r => r.json())
            .then(d => { if (d.success) setOrgs(d.data); })
            .catch(console.error)
            .finally(() => setLoadingOrgs(false));
    }, []);

    const openWhatsApp = (number) => {
        const clean = number.replace(/[^0-9]/g, '');
        window.open(`https://wa.me/${clean}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-warm-50 pb-safe p-4">
            <div className="mb-6 mt-4">
                <h1 className="font-heading font-bold text-2xl text-slate-800">
                    Hello, {session?.name?.split(' ')[0]} 👋
                </h1>
                <p className="text-slate-500">
                    {session?.city ? `📍 ${session.city}` : 'How can Saathi help today?'}
                </p>
            </div>

            <RoleToggle session={session} />

                {/* Upcoming Events Module */}
                {events.length > 0 && (
                    <div className="mb-8 mt-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-heading font-bold text-lg text-slate-800">Upcoming Events</h2>
                        </div>
                        <div className="flex overflow-x-auto pb-4 space-x-4 hide-scrollbar">
                           {events.map(event => (
                              <Card key={event._id} className="min-w-[260px] flex-shrink-0 shadow-sm border border-warm-200 p-4">
                                  <Badge type="info" className="mb-2 w-max text-[10px]">{event.eventType}</Badge>
                                  <h3 className="font-bold text-slate-800 text-sm mb-1 line-clamp-1">{event.title}</h3>
                                  <p className="text-xs text-slate-500 mb-2 line-clamp-2">{event.description}</p>
                                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                                     <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1 text-primary-400" /> {new Date(event.date).toLocaleDateString()}</span>
                                  </div>
                              </Card>
                           ))}
                        </div>
                    </div>
                )}

            {/* Organizations / NGOs */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/report')}
                    className="bg-gradient-to-br from-primary-400 to-primary-600 rounded-3xl p-5 text-white shadow-card cursor-pointer">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
                        <FileText className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold mb-1">Report Need</h3>
                    <p className="text-xs text-primary-100">Help your area</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/track')}
                    className="bg-gradient-to-br from-accent-400 to-accent-600 rounded-3xl p-5 text-white shadow-card cursor-pointer">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
                        <Map className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold mb-1">Track Reports</h3>
                    <p className="text-xs text-accent-50">View status</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/emergency')}
                    className="bg-gradient-to-br from-red-500 to-rose-600 rounded-3xl p-5 text-white shadow-card cursor-pointer">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold mb-1">Emergency</h3>
                    <p className="text-xs text-red-100">Send alert</p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/impact-map')}
                    className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl p-5 text-white shadow-card cursor-pointer">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
                        <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold mb-1">Impact Map</h3>
                    <p className="text-xs text-purple-100">View hotspots</p>
                </motion.div>
            </div>

            {/* My Recent Reports */}
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
                        <p className="text-slate-500 text-sm">No reports yet</p>
                        <button onClick={() => navigate('/report')} className="mt-3 text-sm font-semibold text-primary-600">Submit your first report →</button>
                    </Card>
                ) : (
                    <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 hide-scrollbar">
                        {reports.map(r => (
                            <motion.div key={r._id}
                                onClick={() => navigate(`/track/${r._id}`)}
                                className="snap-center min-w-[280px] bg-white rounded-3xl p-5 shadow-card cursor-pointer flex-shrink-0">
                                <div className="flex justify-between items-start mb-3">
                                    <Badge type="issue">{r.issueType}</Badge>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                                        r.status === 'Pending' ? 'bg-orange-100 text-orange-600' :
                                        r.status === 'Resolved' ? 'bg-green-100 text-green-600' :
                                        'bg-blue-100 text-blue-600'
                                    }`}>{r.status}</span>
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

            {/* NGO Directory */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-heading font-bold text-lg text-slate-800">
                        NGOs Near You {session?.city && <span className="text-sm text-slate-400 font-normal">· {session.city}</span>}
                    </h2>
                </div>

                {loadingOrgs ? (
                    <div className="flex justify-center py-6">
                        <Loader2 className="w-6 h-6 animate-spin text-primary-400" />
                    </div>
                ) : orgs.length === 0 ? (
                    <Card className="text-center py-8">
                        <Building2 className="w-12 h-12 text-warm-300 mx-auto mb-3" />
                        <p className="text-slate-500 text-sm">No NGOs found in your city</p>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {orgs.map(org => (
                            <motion.div key={org._id} whileTap={{ scale: 0.99 }}>
                                <Card className="border-0 shadow-sm">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center shrink-0">
                                            <Building2 className="w-6 h-6 text-primary-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-slate-800 text-sm truncate">{org.name}</h3>
                                            <div className="flex items-center text-xs text-slate-500 mt-1 mb-2">
                                                <MapPin className="w-3.5 h-3.5 mr-1 shrink-0" />
                                                {org.city}, {org.state}
                                            </div>
                                            {org.description && (
                                                <p className="text-xs text-slate-500 line-clamp-2 mb-2">{org.description}</p>
                                            )}
                                            <div className="flex flex-wrap gap-1 mb-3">
                                                {org.categories?.map(cat => (
                                                    <span key={cat} className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full font-medium">
                                                        {cat}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="flex gap-2">
                                                {org.whatsappNumber && (
                                                    <button
                                                        onClick={() => openWhatsApp(org.whatsappNumber)}
                                                        className="flex items-center gap-1.5 text-xs bg-green-500 text-white px-3 py-1.5 rounded-full font-semibold hover:bg-green-600 transition"
                                                    >
                                                        <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                                                    </button>
                                                )}
                                                {org.contactPhone && (
                                                    <button
                                                        onClick={() => window.open(`tel:${org.contactPhone}`, '_self')}
                                                        className="flex items-center gap-1.5 text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full font-semibold hover:bg-slate-200 transition"
                                                    >
                                                        <Phone className="w-3.5 h-3.5" /> Call
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* AI Chat */}
            <Card className="bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200"
                onClick={() => window.dispatchEvent(new CustomEvent('open-chatbot'))}>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-primary-800 mb-1 flex items-center">
                            <span className="text-lg mr-2">🤖</span> Ask Saathi AI
                        </h3>
                        <p className="text-xs text-primary-600">Need help? Ask me anything.</p>
                    </div>
                    <Button variant="primary" className="px-4 py-2"
                        onClick={() => window.dispatchEvent(new CustomEvent('open-chatbot'))}>
                        Chat
                    </Button>
                </div>
            </Card>
        </div>
    );
}