import React from 'react';
import { User, Clock, Navigation, Map } from 'lucide-react';

const RouteCard = ({ route, volunteer }) => {
    if (!route || !route.routePoints) return null;
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-4">
            <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900">{volunteer?.name || 'Volunteer'}</h3>
                        <p className="text-sm text-slate-500">{route.routePoints.length} tasks assigned</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="flex items-center gap-1 text-sm font-semibold text-slate-700 justify-end">
                        <Clock className="w-4 h-4 text-primary-500" /> 
                        {route.estimatedDurationHours.toFixed(1)} hrs
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500 justify-end mt-1">
                        <Navigation className="w-3 h-3" /> 
                        {route.totalDistanceKm.toFixed(1)} km
                    </div>
                </div>
            </div>
            
            <div className="space-y-3 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                {route.routePoints.map((point, idx) => (
                    <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-200 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                            <span className="text-sm font-bold">{idx + 1}</span>
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-3 rounded-lg border border-slate-200 bg-white shadow-sm">
                            <h4 className="font-bold text-slate-800 text-sm">{point.taskTitle || 'Task'}</h4>
                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><Map className="w-3 h-3"/> {point.address}</p>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                <button className="flex-1 py-2 text-sm font-semibold bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors">
                    View on Map
                </button>
                <button className="flex-1 py-2 text-sm font-semibold bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors">
                    Send to Phone
                </button>
            </div>
        </div>
    );
};

export default RouteCard;