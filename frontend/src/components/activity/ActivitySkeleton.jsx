import React from 'react';

const ActivitySkeleton = () => {
  return (
    <div className="flex gap-4 mb-6 animate-pulse">
      {/* Left icon circle skeleton */}
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-slate-200" />
        <div className="w-0.5 h-full bg-slate-100 mt-1" />
      </div>

      {/* Right card skeleton */}
      <div className="flex-1">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-50">
          <div className="flex justify-between items-center mb-2">
            <div className="h-4 w-32 bg-slate-200 rounded" />
            <div className="h-3 w-16 bg-slate-100 rounded" />
          </div>
          <div className="h-3 w-full bg-slate-100 rounded mb-2" />
          <div className="h-3 w-2/3 bg-slate-100 rounded" />
        </div>
      </div>
    </div>
  );
};

export default ActivitySkeleton;
