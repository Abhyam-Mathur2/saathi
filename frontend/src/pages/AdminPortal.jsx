import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Activity, Users, AlertTriangle, FileText, CheckCircle2, ChevronRight, MapPin, Phone, Map } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';

export default function AdminPortal() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const [stats, setStats] = useState({ total: 0, urgent: 0, volunteers: 0 });
  const [recentReports, setRecentReports] = useState([]);

  // Derive tab from location or just use internal state
  useEffect(() => {
    if (location.pathname.includes('/reports')) setActiveTab('Reports');
    else if (location.pathname.includes('/volunteers')) setActiveTab('Volunteers');
    else if (location.pathname.includes('/planner')) setActiveTab('Auto Planner');
    else setActiveTab('Overview');
    
    // Mock Fetch
    setStats({ total: 124, urgent: 12, volunteers: 48 });
    setRecentReports([
      { id: '1', issueType: 'Food', urgency: 9, description: 'Flood victims need food', status: 'Pending', address: 'Sector 4' },
      { id: '2', issueType: 'Health', urgency: 8, description: 'Medical camp required', status: 'Assigned', address: 'City Hall' }
    ]);
  }, [location.pathname]);

  const tabs = ['Overview', 'Reports', 'Volunteers', 'Auto Planner'];

  return (
    <div className="min-h-screen bg-warm-50 md:p-6 pb-safe">
      <div className="bg-white sticky top-0 md:relative md:bg-transparent z-30 pt-4 px-4 md:px-0 md:pt-0">
        <h1 className="font-heading font-bold text-2xl text-slate-800 mb-4 hidden md:block">Admin Dashboard</h1>
        
        {/* Horizontal Tabs */}
        <div className="flex overflow-x-auto space-x-2 pb-3 mb-2 md:mb-6 hide-scrollbar border-b border-warm-200 md:border-0">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                if (tab === 'Reports') navigate('/admin/reports');
                else if (tab === 'Volunteers') navigate('/admin/volunteers');
                else if (tab === 'Auto Planner') navigate('/admin/planner');
                else navigate('/admin');
              }}
              className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${activeTab === tab ? 'bg-primary-600 text-white shadow-md' : 'bg-white border border-warm-200 text-slate-600 hover:bg-warm-100'}`}
            >
              {tab}
            </button>
          ))}
          <button onClick={() => navigate('/admin/events')} className="px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap bg-white border border-warm-200 text-slate-600 hover:bg-warm-100">
            Events
          </button>
        </div>
      </div>

      <div className="p-4 md:p-0 flex flex-col md:flex-row gap-6">
        
        {/* MAIN CONTENT AREA */}
        <div className="flex-1">
          {activeTab === 'Overview' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="flex flex-col border-t-4 border-t-primary-500">
                  <span className="text-slate-500 text-xs font-semibold uppercase mb-1">Total Reports</span>
                  <span className="text-3xl font-heading font-bold text-slate-800">{stats.total}</span>
                </Card>
                <Card className="flex flex-col border-t-4 border-t-red-500">
                  <span className="text-slate-500 text-xs font-semibold uppercase mb-1">Urgent (≥8)</span>
                  <span className="text-3xl font-heading font-bold text-red-600">{stats.urgent}</span>
                </Card>
                <Card className="flex flex-col border-t-4 border-t-emerald-500">
                  <span className="text-slate-500 text-xs font-semibold uppercase mb-1">Active Vols</span>
                  <span className="text-3xl font-heading font-bold text-emerald-600">{stats.volunteers}</span>
                </Card>
                <Card className="flex flex-col border-t-4 border-t-amber-500">
                  <span className="text-slate-500 text-xs font-semibold uppercase mb-1">Assignments</span>
                  <span className="text-3xl font-heading font-bold text-amber-600">89</span>
                </Card>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg text-slate-800">Recent Urgent Reports</h3>
                  <button className="text-sm text-primary-600 font-semibold">View All</button>
                </div>
                <div className="space-y-3">
                  {recentReports.map(r => (
                    <Card key={r.id} className="p-4 flex items-center justify-between">
                       <div className="flex items-center space-x-4">
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${r.urgency >= 8 ? 'bg-red-500' : 'bg-amber-500'}`}>
                           {r.urgency}
                         </div>
                         <div>
                           <div className="flex items-center space-x-2 mb-1">
                             <Badge type="issue">{r.issueType}</Badge>
                             <span className="text-xs text-slate-400">{r.status}</span>
                           </div>
                           <h4 className="font-bold text-sm text-slate-800 truncate max-w-[200px] md:max-w-md">{r.description}</h4>
                         </div>
                       </div>
                       <Button variant="outline" size="sm" className="hidden sm:flex" onClick={() => navigate(`/match/${r.id}`)}>Assign &rarr;</Button>
                    </Card>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'Reports' && (
            <div className="text-center py-12 bg-white rounded-3xl border border-warm-200">
              <FileText className="w-12 h-12 text-warm-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800">Reports Table</h3>
              <p className="text-sm text-slate-500 mb-4">A filterable list of all reports would go here.</p>
            </div>
          )}

          {activeTab === 'Volunteers' && (
            <div className="text-center py-12 bg-white rounded-3xl border border-warm-200">
              <Users className="w-12 h-12 text-warm-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800">Volunteers Directory</h3>
              <p className="text-sm text-slate-500 mb-4">Manage and view volunteer status here.</p>
            </div>
          )}

          {activeTab === 'Auto Planner' && (
            <div className="text-center py-12 bg-white rounded-3xl border border-warm-200">
               <h3 className="font-bold text-slate-800">Auto Planner</h3>
               <p className="text-sm text-slate-500 mb-4">Redirecting...</p>
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR (Desktop) */}
        <div className="hidden lg:block w-80 space-y-6">
          <Card className="bg-primary-900 text-white border-0">
            <h3 className="font-bold mb-4 flex items-center"><Activity className="w-5 h-5 mr-2 text-primary-300" /> Live Feed</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 mr-2 shrink-0"></div>
                <p className="text-sm text-primary-100"><span className="font-bold text-white">Amit S.</span> is now available as a volunteer.</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 mr-2 shrink-0"></div>
                <p className="text-sm text-primary-100">New high urgency report in Sector 4.</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 mr-2 shrink-0"></div>
                <p className="text-sm text-primary-100"><span className="font-bold text-white">Priya P.</span> completed a task.</p>
              </div>
            </div>
          </Card>

          <Card>
             <h3 className="font-bold text-slate-800 mb-4">Quick Actions</h3>
             <div className="space-y-2">
               <Button className="w-full justify-start" onClick={() => navigate('/auto-planner')}><Map className="w-4 h-4 mr-2" /> Run Auto Planner</Button>
               <Button variant="outline" className="w-full justify-start"><FileText className="w-4 h-4 mr-2" /> Export PDF Report</Button>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}