import React from 'react';
import { motion } from 'framer-motion';
import { 
  ClipboardList, 
  CheckCircle, 
  XCircle, 
  BadgeCheck, 
  FileText, 
  Wifi, 
  WifiOff, 
  User, 
  HandHeart, 
  Send, 
  Bell, 
  Sparkles, 
  Calendar, 
  Trophy,
  MapPin,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ACTIVITY_ICONS = {
  TASK_ASSIGNED:          <ClipboardList size={16} />,
  TASK_ACCEPTED:          <CheckCircle size={16} />,
  TASK_DECLINED:          <XCircle size={16} />,
  TASK_COMPLETED:         <BadgeCheck size={16} />,
  REPORT_SUBMITTED:       <FileText size={16} />,
  AVAILABILITY_ON:        <Wifi size={16} />,
  AVAILABILITY_OFF:       <WifiOff size={16} />,
  ROLE_SWITCHED_CITIZEN:  <User size={16} />,
  ROLE_SWITCHED_VOLUNTEER:<HandHeart size={16} />,
  PING_SENT:              <Send size={16} />,
  PING_RECEIVED:          <Bell size={16} />,
  JOINED:                 <Sparkles size={16} />,
  EVENT_REGISTERED:       <Calendar size={16} />,
  BADGE_EARNED:           <Trophy size={16} />,
};

const ACTIVITY_COLORS = {
  TASK_COMPLETED:         'bg-emerald-500',
  TASK_ACCEPTED:          'bg-teal-500',
  TASK_ASSIGNED:          'bg-blue-500',
  TASK_DECLINED:          'bg-red-400',
  REPORT_SUBMITTED:       'bg-amber-500',
  AVAILABILITY_ON:        'bg-green-400',
  AVAILABILITY_OFF:       'bg-gray-400',
  ROLE_SWITCHED_CITIZEN:  'bg-purple-500',
  ROLE_SWITCHED_VOLUNTEER:'bg-purple-500',
  PING_SENT:              'bg-sky-500',
  PING_RECEIVED:          'bg-sky-500',
  JOINED:                 'bg-amber-500',
  EVENT_REGISTERED:       'bg-violet-500',
  BADGE_EARNED:           'bg-yellow-400',
};

const ACTIVITY_TITLES = {
  TASK_ASSIGNED:          'New Task Assigned',
  TASK_ACCEPTED:          'Task Accepted',
  TASK_DECLINED:          'Task Declined',
  TASK_COMPLETED:         'Task Completed ✓',
  REPORT_SUBMITTED:       'Report Submitted',
  AVAILABILITY_ON:        'Marked Available',
  AVAILABILITY_OFF:       'Marked Busy',
  ROLE_SWITCHED_CITIZEN:  'Switched to Citizen Mode',
  ROLE_SWITCHED_VOLUNTEER:'Switched to Volunteer Mode',
  PING_SENT:              'Sent Help Request',
  PING_RECEIVED:          'Received Help Request',
  JOINED:                 'Joined Saathi 🎉',
  EVENT_REGISTERED:       'Registered for Event',
  BADGE_EARNED:           'Badge Earned',
};

const ActivityEntry = ({ activity, isLast, compact = false }) => {
  const { type, title, description, createdAt, meta } = activity;
  const icon = ACTIVITY_ICONS[type] || <Sparkles size={16} />;
  const colorClass = ACTIVITY_COLORS[type] || 'bg-slate-400';
  const displayTitle = title || ACTIVITY_TITLES[type] || type;

  return (
    <div className="flex gap-4 group">
      {/* Left Timeline Connector */}
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full ${colorClass} text-white flex items-center justify-center shadow-sm z-10 transition-transform group-hover:scale-110 duration-300`}>
          {icon}
        </div>
        {!isLast && (
          <div className="w-0.5 h-full bg-slate-100 -mt-1 group-last:hidden" />
        )}
      </div>

      {/* Right Content Card */}
      <div className={`flex-1 ${!isLast ? 'pb-8' : ''}`}>
        <motion.div 
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-50 hover:shadow-md transition-shadow duration-300"
        >
          <div className="flex justify-between items-start mb-1">
            <h4 className="font-heading font-semibold text-slate-800 text-[14px]">
              {displayTitle}
            </h4>
            <span className="text-[11px] text-slate-400 font-body flex items-center gap-1">
              <Clock size={10} />
              {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
            </span>
          </div>

          {description && (
            <p className="text-slate-500 text-[13px] font-body mb-2 leading-relaxed">
              {description}
            </p>
          )}

          {meta && (
            <div className="flex flex-wrap gap-2 mt-2">
              {meta.issueType && (
                <span className="px-2 py-0.5 bg-teal-50 text-teal-600 text-[10px] font-semibold rounded-full">
                  {meta.issueType}
                </span>
              )}
              {meta.urgency && (
                <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                  meta.urgency >= 8 ? 'bg-red-50 text-red-600' : 
                  meta.urgency >= 5 ? 'bg-amber-50 text-amber-600' : 
                  'bg-blue-50 text-blue-600'
                }`}>
                  Urgency {meta.urgency}
                </span>
              )}
              {meta.location && (
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <MapPin size={10} />
                  {meta.location.split(',')[0]}
                </span>
              )}
              {meta.completionPhoto && (
                <div className="mt-1">
                   <img 
                    src={meta.completionPhoto} 
                    alt="Task Completion" 
                    className="w-10 h-10 rounded-lg object-cover border border-slate-100 cursor-zoom-in hover:scale-105 transition-transform"
                    onClick={() => window.open(meta.completionPhoto, '_blank')}
                  />
                </div>
              )}
              {meta.badgeName && (
                <span className="px-2 py-0.5 bg-yellow-50 text-yellow-700 text-[10px] font-semibold rounded-full flex items-center gap-1">
                  {meta.badgeIcon} {meta.badgeName}
                </span>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ActivityEntry;
