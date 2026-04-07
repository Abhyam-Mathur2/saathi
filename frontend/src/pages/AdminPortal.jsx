import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Activity, FileText, Map, CheckCircle2, ChevronRight, MapPin, Loader2, Trophy } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { getSession } from '../utils/roleAuth';

const API = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

export default function AdminPortal() {
    const location = useLocation();
    const navigate = useNavigate();
    const session = getSession();
    const [activeTab, setActiveTab] = useState('Overview');
    const [stats, setStats] = useState(null);
    const [reports, setReports] = useState([]);
    const [volunteers, setVolunteers] = useState([]);
    const [loading, setLoading] = useState(true);

    const orgId = session?.orgId;
    const orgName = session?.ngoName || session?.orgName || 'Your Organization';
    const orgCity = session?.city || '';

    useEffect(() => {
        if (location.pathname.includes('/reports')) setActiveTab('Reports');
        else if (location.pathname.includes('/volunteers')) setActiveTab('Volunteers');
        else if (location.pathname.includes('/planner')) setActiveTab('Auto Planner');
        else setActiveTab('Overview');
    }, [location.pathname]);

    useEffect(() => {
        if (!orgId) return;
        const query = `?orgId=${orgId}`;

        setLoading(true);
        Promise.all([
            fetch(`${API}/dashboard/stats${query}`).then(r => r.json()),
            fetch(`${API}/reports${query}`).then(r => r.json()),
            fetch(`${API}/volunteers${query}`).then(r => r.json()),
        ]).then(([statsData, reportsData, volsData]) => {
            if (statsData.success) setStats(statsData.data);
            if (reportsData.success) setReports(reportsData.data);
            if (volsData.success) setVolunteers(volsData.data);
        }).catch(console.error)
          .finally(() => setLoading(false));
    }, [orgId]);

    const tabs = ['Overview', 'Reports', 'Volunteers', 'Auto Planner'];
    const urgentReports = reports.filter(r => r.urgency >= 7 && r.status === 'Pending').slice(0, 10);

    if (loading && activeTab === 'Overview') return (
        <div className="min-h-screen bg-warm-50 flex items-center justify-center">
            <Loader2 className="animate-spin w-8 h-8 text-primary-600" />
        </div>
    );

    return (
        <div className="min-h-screen bg-warm-50 md:p-6 pb-safe">
            {/* Header */}
            <div className="bg-white sticky top-0 md:relative md:bg-transparent z-30 pt-4 px-4 md:px-0 md:pt-0">
                <div className="hidden md:flex items-start justify-between mb-4">
                    <div>
                        <h1 className="font-heading font-bold text-2xl text-slate-800">Admin Dashboard</h1>
                        <p className="text-sm text-slate-500">
                            {orgName} · <span className="text-primary-600 font-semibold">📍 {orgCity}</span>
                        </p>
                    </div>
                </div>

                <div className="flex overflow-x-auto space-x-2 pb-3 mb-2 md:mb-6 hide-scrollbar border-b border-warm-200 md:border-0">
                    {tabs.map(tab => (
                        <button key={tab}
                            onClick={() => {
                                setActiveTab(tab);
                                if (tab === 'Reports') navigate('/admin/reports');
                                else if (tab === 'Volunteers') navigate('/admin/volunteers');
                                else if (tab === 'Auto Planner') navigate('/admin/planner');
                                else navigate('/admin');
                            }}
                            className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${activeTab === tab ? 'bg-primary-600 text-white shadow-md' : 'bg-white border border-warm-200 text-slate-600 hover:bg-warm-100'}`}>
                            {tab}
                        </button>
                    ))}
                    <button onClick={() => navigate('/admin/events')} className="px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap bg-white border border-warm-200 text-slate-600 hover:bg-warm-100">
                        Events
                    </button>
                </div>
            </div>

            <div className="p-4 md:p-0 flex flex-col md:flex-row gap-6">
                {/* MAIN CONTENT */}
                <div className="flex-1">
                    {activeTab === 'Overview' && stats && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <Card className="flex flex-col border-t-4 border-t-primary-500">
                                    <span className="text-slate-500 text-xs font-semibold uppercase mb-1">Total Reports</span>
                                    <span className="text-3xl font-heading font-bold text-slate-800">{stats.summary?.totalReports || 0}</span>
                                    <span className="text-xs text-slate-400 mt-1">{orgCity} region</span>
                                </Card>
                                <Card className="flex flex-col border-t-4 border-t-red-500">
                                    <span className="text-slate-500 text-xs font-semibold uppercase mb-1">Urgent (≥8)</span>
                                    <span className="text-3xl font-heading font-bold text-red-600">{stats.summary?.urgentReports || 0}</span>
                                </Card>
                                <Card className="flex flex-col border-t-4 border-t-emerald-500">
                                    <span className="text-slate-500 text-xs font-semibold uppercase mb-1">Active Vols</span>
                                    <span className="text-3xl font-heading font-bold text-emerald-600">{stats.summary?.totalVolunteers || 0}</span>
                                </Card>
                                <Card className="flex flex-col border-t-4 border-t-amber-500">
                                    <span className="text-slate-500 text-xs font-semibold uppercase mb-1">Assignments</span>
                                    <span className="text-3xl font-heading font-bold text-amber-600">{stats.summary?.totalAssignments || 0}</span>
                                </Card>
                            </div>

                            {/* Urgent Reports */}
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-lg text-slate-800">
                                        Urgent Reports
                                        <span className="ml-2 text-sm text-slate-400 font-normal">({urgentReports.length} pending)</span>
                                    </h3>
                                    <button className="text-sm text-primary-600 font-semibold" onClick={() => setActiveTab('Reports')}>View All</button>
                                </div>
                                <div className="space-y-3">
                                    {urgentReports.length === 0 ? (
                                        <Card className="text-center py-8">
                                            <CheckCircle2 className="w-10 h-10 text-emerald-300 mx-auto mb-2" />
                                            <p className="text-slate-500 text-sm">No urgent reports! Great work.</p>
                                        </Card>
                                    ) : urgentReports.map(r => (
                                        <Card key={r._id} className="p-4">
                                            <div className="flex items-start gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${r.urgency >= 8 ? 'bg-red-500' : 'bg-amber-500'}`}>
                                                    {r.urgency}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                        <Badge type="issue">{r.issueType}</Badge>
                                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                                            r.status === 'Pending' ? 'bg-orange-100 text-orange-600' :
                                                            r.status === 'Assigned' ? 'bg-blue-100 text-blue-700' :
                                                            r.status === 'In Progress' ? 'bg-indigo-100 text-indigo-700' :
                                                            'bg-green-100 text-green-700'
                                                        }`}>{r.status}</span>
                                                    </div>
                                                    <p className="font-semibold text-sm text-slate-800 line-clamp-2 mb-1">{r.description}</p>
                                                    <div className="flex items-center text-xs text-slate-500">
                                                        <MapPin className="w-3.5 h-3.5 mr-1 shrink-0" />
                                                        {r.location?.address || r.city}
                                                    </div>
                                                    {r.submittedByName && (
                                                        <p className="text-xs text-slate-400 mt-1">
                                                            Reported by: <span className="font-medium">{r.submittedByName}</span>
                                                        </p>
                                                    )}
                                                </div>
                                                <Button variant="outline" size="sm" className="hidden sm:flex shrink-0" onClick={() => navigate(`/match/${r._id}`)}>
                                                    Assign →
                                                </Button>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>

                            {/* Volunteer Work Leaderboard */}
                            {stats.workLeaderboard?.length > 0 && (
                                <div>
                                    <h3 className="font-bold text-lg text-slate-800 mb-3 flex items-center">
                                        <Trophy className="w-5 h-5 text-amber-500 mr-2" /> Volunteer Leaderboard
                                    </h3>
                                    <div className="space-y-2">
                                        {stats.workLeaderboard.map((vol, i) => (
                                            <div key={vol._id} className="bg-white rounded-2xl p-3 border border-warm-100 flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-slate-100 text-slate-600' : 'bg-orange-50 text-orange-600'}`}>
                                                    #{i + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-sm text-slate-800">{vol.name}</p>
                                                    <p className="text-xs text-slate-400">{vol.city} · {vol.organization?.name || 'Independent'}</p>
                                                </div>
                                                <span className="text-sm font-bold text-primary-600">{vol.completedTasks} tasks</span>
                                                <button onClick={() => navigate(`/volunteers`)} className="text-xs text-slate-400 hover:text-primary-600 ml-1">
                                                    <ChevronRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'Reports' && (
                        <div className="space-y-3">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold text-lg text-slate-800">All Reports — {orgCity}</h3>
                                <span className="text-sm text-slate-400">{reports.length} total</span>
                            </div>
                            {reports.map(r => (
                                <Card key={r._id} className="p-4">
                                    <div className="flex items-start gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${r.urgency >= 8 ? 'bg-red-500' : r.urgency >= 5 ? 'bg-amber-500' : 'bg-green-500'}`}>
                                            {r.urgency}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <Badge type="issue">{r.issueType}</Badge>
                                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                                    r.status === 'Pending' ? 'bg-orange-100 text-orange-600' :
                                                    r.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                                                    'bg-blue-100 text-blue-700'
                                                }`}>{r.status}</span>
                                            </div>
                                            <p className="font-semibold text-sm text-slate-800 line-clamp-2 mb-1">{r.description}</p>
                                            <div className="flex items-center text-xs text-slate-500">
                                                <MapPin className="w-3.5 h-3.5 mr-1 shrink-0" />{r.location?.address || r.city}
                                            </div>
                                            <p className="text-xs text-slate-400 mt-1">
                                                By: {r.submittedByName || 'Anonymous'} · {new Date(r.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        {r.status === 'Pending' && (
                                            <Button variant="outline" size="sm" className="shrink-0" onClick={() => navigate(`/match/${r._id}`)}>
                                                Assign
                                            </Button>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}

                    {activeTab === 'Volunteers' && (
                        <div className="space-y-3">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold text-lg text-slate-800">Volunteers — {orgName}</h3>
                                <span className="text-sm text-slate-400">{volunteers.length} total</span>
                            </div>
                            {volunteers.map(v => (
                                <Card key={v._id} className="p-4 flex items-start gap-4">
                                    <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center font-bold text-primary-600 text-lg shrink-0">
                                        {v.name[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <h4 className="font-bold text-slate-800">{v.name}</h4>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${v.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                                {v.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 mb-1">{v.city} · {v.organization?.name || 'Independent'}</p>
                                        <p className="text-xs text-slate-400 mb-2">{v.phone}</p>
                                        <div className="flex flex-wrap gap-1 mb-2">
                                            {v.skills?.map(s => (
                                                <span key={s} className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full">{s}</span>
                                            ))}
                                        </div>
                                        <p className="text-xs text-emerald-600 font-semibold">✅ {v.completedTasks} tasks completed</p>
                                    </div>
                                    <Button variant="ghost" size="sm" className="shrink-0 text-primary-600" onClick={() => navigate(`/volunteers`)}>
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                </Card>
                            ))}
                        </div>
                    )}

                    {activeTab === 'Auto Planner' && (
                        <div className="text-center py-12 bg-white rounded-3xl border border-warm-200">
                            <Map className="w-12 h-12 text-warm-300 mx-auto mb-3" />
                            <h3 className="font-bold text-slate-800 mb-2">AI Auto Planner</h3>
                            <p className="text-sm text-slate-500 mb-4">Automatically assign all pending reports to best-matched volunteers.</p>
                            <Button onClick={() => navigate('/auto-planner')}>Open Auto Planner</Button>
                        </div>
                    )}
                </div>

                {/* RIGHT SIDEBAR (Desktop) */}
                <div className="hidden lg:block w-80 space-y-6">
                    <Card className="bg-primary-900 text-white border-0">
                        <h3 className="font-bold mb-4 flex items-center">
                            <Activity className="w-5 h-5 mr-2 text-primary-300" /> Org Info
                        </h3>
                        <div className="space-y-2 text-sm text-primary-100">
                            <p>🏢 <span className="font-bold text-white">{orgName}</span></p>
                            <p>📍 {orgCity}, {session?.state}</p>
                            <p>📊 Serving {session?.serviceRadiusKm || 50}km radius</p>
                        </div>
                    </Card>

                    <Card>
                        <h3 className="font-bold text-slate-800 mb-4">Quick Actions</h3>
                        <div className="space-y-2">
                            <Button className="w-full justify-start" onClick={() => navigate('/auto-planner')}>
                                <Map className="w-4 h-4 mr-2" /> Run Auto Planner
                            </Button>
                            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/admin/dashboard')}>
                                <FileText className="w-4 h-4 mr-2" /> Analytics Dashboard
                            </Button>
                            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/impact-map')}>
                                <MapPin className="w-4 h-4 mr-2" /> Impact Heatmap
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}