import React from 'react';
import { Target, FileText, Zap, Send } from 'lucide-react';

const ActivityStats = ({ activities = [] }) => {
  // Calculate stats from activities array
  const tasksCompleted = activities.filter(a => a.type === 'TASK_COMPLETED').length;
  const reportsFiled = activities.filter(a => a.type === 'REPORT_SUBMITTED').length;
  const pingsSent = activities.filter(a => a.type === 'PING_SENT').length;

  // Calculate Avg Response Time
  let totalResponseTime = 0;
  let responseCount = 0;

  // Find TASK_ASSIGNED and TASK_ACCEPTED pairs for the same reportId
  const assignments = activities.filter(a => a.type === 'TASK_ASSIGNED');
  assignments.forEach(assign => {
    const accept = activities.find(a => 
      a.type === 'TASK_ACCEPTED' && 
      a.meta?.reportId === assign.meta?.reportId &&
      new Date(a.createdAt) > new Date(assign.createdAt)
    );
    
    if (accept) {
      const diff = new Date(accept.createdAt) - new Date(assign.createdAt);
      totalResponseTime += diff;
      responseCount++;
    }
  });

  const avgResponseTime = responseCount > 0 
    ? Math.round(totalResponseTime / responseCount / (1000 * 60 * 60)) 
    : 0;

  const stats = [
    { label: 'Tasks Completed', count: tasksCompleted, icon: <Target size={14} className="text-emerald-500" /> },
    { label: 'Reports Filed', count: reportsFiled, icon: <FileText size={14} className="text-amber-500" /> },
    { label: 'Avg Response', count: `~${avgResponseTime}h`, icon: <Zap size={14} className="text-primary-500" /> },
    { label: 'Pings Sent', count: pingsSent, icon: <Send size={14} className="text-sky-500" /> },
  ];

  return (
    <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar">
      {stats.map((stat, idx) => (
        <div 
          key={idx}
          className="flex-shrink-0 flex items-center gap-2 bg-white px-3.5 py-2 rounded-full shadow-sm border border-slate-50"
        >
          {stat.icon}
          <div className="flex items-baseline gap-1.5">
            <span className="font-heading font-bold text-slate-800 text-[14px]">{stat.count}</span>
            <span className="font-body text-slate-400 text-[11px] whitespace-nowrap">{stat.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityStats;
