import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Cell 
} from 'recharts';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Users, FileWarning, CheckCircle, Clock, 
  AlertTriangle, MapPin, ChevronRight, LayoutDashboard 
} from 'lucide-react';
import UrgencyBadge from '../components/UrgencyBadge';
import { Link } from 'react-router-dom';
import { apiUrl } from '../config/api';

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const emptyStats = {
  summary: {
    totalReports: 0,
    urgentReports: 0,
    totalVolunteers: 0,
    totalAssignments: 0,
  },
  categories: [],
  reportsTrend: [],
  topUrgent: [],
};

const Dashboard = () => {
  const [stats, setStats] = useState(emptyStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(apiUrl('/api/dashboard/stats'));
        setStats({
          ...emptyStats,
          ...response.data.data,
          summary: {
            ...emptyStats.summary,
            ...(response.data.data?.summary || {}),
          },
          categories: response.data.data?.categories || [],
          reportsTrend: response.data.data?.reportsTrend || [],
          topUrgent: response.data.data?.topUrgent || [],
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStats(emptyStats);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
    </div>
  );

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <LayoutDashboard className="w-8 h-8 text-primary-600" />
            Admin Dashboard
          </h1>
          <p className="text-slate-500">Real-time community needs and resource allocation overview.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/report" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm font-medium">
            New Report
          </Link>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Reports" value={stats.summary?.totalReports ?? 0} icon={FileWarning} color="bg-primary-500" />
        <StatCard title="Urgent Issues" value={stats.summary?.urgentReports ?? 0} icon={AlertTriangle} color="bg-red-500" />
        <StatCard title="Volunteers" value={stats.summary?.totalVolunteers ?? 0} icon={Users} color="bg-emerald-500" />
        <StatCard title="Assignments" value={stats.summary?.totalAssignments ?? 0} icon={CheckCircle} color="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Reports by Category Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Issues by Category</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.categories || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={40}>
                   {(stats.categories || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#0ea5e9', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'][index % 6]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Reports Over Time Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Reports (Last 7 Days)</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.reportsTrend || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Line type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={3} dot={{fill: '#0ea5e9', strokeWidth: 2}} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Heatmap/Map Container */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary-600" />
            Needs Heatmap
          </h3>
          <div className="rounded-lg overflow-hidden border border-slate-200">
            <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '400px', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {(stats.topUrgent || []).map((report) => (
                <Marker key={report._id} position={[report.location.coordinates[1], report.location.coordinates[0]]}>
                  <Popup>
                    <div className="p-1">
                      <p className="font-bold text-slate-900">{report.issueType}</p>
                      <p className="text-xs text-slate-600 mb-2">{report.address}</p>
                      <UrgencyBadge level={report.urgency} />
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* Priority List */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-red-500" />
            Urgent Tasks
          </h3>
          <div className="space-y-4 flex-1 overflow-y-auto pr-1">
            {(stats.topUrgent || []).length > 0 ? (stats.topUrgent || []).map((report) => (
              <div key={report._id} className="p-4 rounded-lg bg-slate-50 border border-slate-100 hover:border-primary-200 transition-colors group">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{report.issueType}</span>
                  <UrgencyBadge level={report.urgency} />
                </div>
                <p className="text-sm text-slate-700 font-medium line-clamp-2 mb-3">{report.description}</p>
                <div className="flex items-center justify-between">
                   <div className="flex items-center text-[11px] text-slate-500">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span className="truncate max-w-[120px]">{report.location.address || 'Unknown'}</span>
                   </div>
                   <Link 
                    to={`/match/${report._id}`}
                    className="text-xs font-semibold text-primary-600 flex items-center group-hover:translate-x-1 transition-transform"
                   >
                    Match <ChevronRight className="w-3 h-3 ml-1" />
                   </Link>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 italic">
                No urgent tasks pending.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
