import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Phone, MessageCircle, CheckCircle2, ChevronRight, Clock, Map, User } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Avatar from '../components/ui/Avatar';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import TwitterPostCard, { shouldShowTwitterCard } from '../components/tracking/TwitterPostCard';

export default function ReportTracking() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);

  useEffect(() => {
    // In real app, fetch from `/api/reports/${reportId}`
    // Mocking with local storage
    const store = JSON.parse(localStorage.getItem('saathi_citizen_reports') || '[]');
    let r = store.find(x => x._id === reportId || x.id === reportId);
    
    // Fallback mock if not found
    if (!r) {
      r = {
        _id: reportId || 'demo-123',
        issueType: 'Infrastructure',
        urgency: 8,
        status: 'Assigned',
        description: 'Fallen tree blocking main road.',
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        location: { address: 'Sector 4, Main Road' },
        assignedVolunteer: {
          name: 'Amit Sharma',
          phone: '9876543210',
          skills: ['Logistics', 'Construction']
        }
      };
    }
    setReport(r);
  }, [reportId]);

  if (!report) return <div className="p-4 text-center mt-20">Loading...</div>;

  const statusSteps = [
    { id: 'Pending', label: 'Submitted', icon: Clock },
    { id: 'Assigned', label: 'Volunteer Assigned', icon: User },
    { id: 'Resolved', label: 'Resolved', icon: CheckCircle2 }
  ];

  const currentStepIndex = statusSteps.findIndex(s => s.id === report.status) || 0;

  return (
    <div className="min-h-screen bg-warm-50 pb-safe">
      <PageHeader title="Track Report" />
      
      <div className="px-4 py-6 max-w-md mx-auto space-y-6">
        
        {/* Hero Card */}
        <Card className="bg-gradient-to-br from-primary-600 to-primary-800 text-white shadow-xl relative overflow-hidden border-0">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <Badge className="bg-white/20 text-white border-0 mb-2 backdrop-blur-sm">{report.issueType}</Badge>
              <h2 className="font-bold text-xl leading-tight">{report.description.substring(0, 50)}...</h2>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0 backdrop-blur-sm font-bold text-xl">
              {report.urgency}
            </div>
          </div>
          <div className="flex items-center text-primary-100 text-sm relative z-10">
            <MapPin className="w-4 h-4 mr-1 shrink-0" />
            <span className="truncate">{report.location?.address || report.address}</span>
          </div>
        </Card>

        {/* Timeline */}
        <Card>
          <h3 className="font-bold text-slate-800 mb-6">Progress</h3>
          <div className="relative pl-4">
            <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-warm-200"></div>
            
            {statusSteps.map((step, index) => {
              const isActive = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const Icon = step.icon;
              
              return (
                <div key={step.id} className="relative flex items-start mb-8 last:mb-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 border-4 border-white ${isActive ? 'bg-primary-500 text-white' : 'bg-warm-200 text-slate-400'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="ml-4 mt-1">
                    <h4 className={`font-bold text-sm ${isActive ? 'text-slate-800' : 'text-slate-400'}`}>{step.label}</h4>
                    {isCurrent && index === 0 && <p className="text-xs text-slate-500 mt-1">Reviewing your report</p>}
                    {isCurrent && index === 1 && <p className="text-xs text-slate-500 mt-1">Help is on the way</p>}
                    {isCurrent && index === 2 && <p className="text-xs text-green-600 mt-1">Task completed successfully</p>}
                  </div>
                </div>
              );
            })}
          </div>
          </Card>

          {/* Twitter Escalation Card */}
          {shouldShowTwitterCard(report) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="mt-6"
          >
            <TwitterPostCard report={report} />
          </motion.div>
          )}

          {/* Volunteer Info */}
        {report.status !== 'Pending' && report.assignedVolunteer && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h3 className="font-heading font-bold text-lg text-slate-800 mb-3 px-2">Assigned Volunteer</h3>
            <Card className="flex flex-col">
              <div className="flex items-center mb-4">
                <Avatar name={report.assignedVolunteer.name} size="lg" className="mr-4" />
                <div>
                  <h4 className="font-bold text-slate-800 text-lg">{report.assignedVolunteer.name}</h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {report.assignedVolunteer.skills?.map(s => (
                      <span key={s} className="bg-primary-50 text-primary-600 text-[10px] px-2 py-0.5 rounded-full font-bold">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <a href={`tel:${report.assignedVolunteer.phone}`} className="flex items-center justify-center p-3 rounded-xl bg-warm-100 hover:bg-warm-200 text-slate-700 font-bold text-sm transition-colors">
                  <Phone className="w-4 h-4 mr-2" /> Call
                </a>
                <a href={`https://wa.me/91${report.assignedVolunteer.phone}`} target="_blank" rel="noreferrer" className="flex items-center justify-center p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-sm transition-colors">
                  <MessageCircle className="w-4 h-4 mr-2" /> Message
                </a>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Proof Photo (If resolved) */}
        {report.status === 'Resolved' && report.completionPhoto && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
             <h3 className="font-heading font-bold text-lg text-slate-800 mb-3 px-2">Completion Proof</h3>
             <Card className="p-2">
               <img src={report.completionPhoto} alt="Completed task" className="w-full h-48 object-cover rounded-2xl" />
             </Card>
          </motion.div>
        )}

      </div>
    </div>
  );
}