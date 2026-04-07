import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ActivityEntry from './ActivityEntry';
import ActivitySkeleton from './ActivitySkeleton';
import ActivityStats from './ActivityStats';
import { apiUrl } from '../../config/api';

const ActivityFeed = ({ volunteerId, limit = 20, showStats = false }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      const url = volunteerId
        ? apiUrl(`/api/activity/volunteer/${volunteerId}?limit=${limit}`)
        : apiUrl(`/api/activity/recent?limit=${limit}`);
      
      const response = await axios.get(url);
      if (response.data.success) {
        setActivities(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
      setError('Could not load activity history.');
    } finally {
      setLoading(false);
    }
  }, [volunteerId, limit]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map(i => <ActivitySkeleton key={i} />)}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
        <p className="text-slate-400 text-sm font-body">{error}</p>
        <button 
          onClick={fetchActivities}
          className="mt-3 text-primary-600 font-semibold text-sm hover:underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="p-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
        <p className="text-slate-400 text-sm font-body">No activity recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {showStats && (
        <div className="mb-6">
          <ActivityStats activities={activities} />
        </div>
      )}
      
      <div className="relative">
        {activities.map((activity, index) => (
          <ActivityEntry 
            key={activity._id} 
            activity={activity} 
            isLast={index === activities.length - 1} 
          />
        ))}
      </div>
      
      <div className="mt-8 text-center">
        <button className="text-slate-400 font-heading font-semibold text-xs hover:text-slate-600 transition-colors uppercase tracking-wider">
          View Full History
        </button>
      </div>
    </div>
  );
};

export default ActivityFeed;
