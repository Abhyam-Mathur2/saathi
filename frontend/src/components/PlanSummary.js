import React from 'react';
import { Bot, CheckCircle2, AlertCircle, Clock, User } from 'lucide-react';

const PlanSummary = ({ plan }) => {
    if (!plan) return null;

    const assignedTasksCount = plan.assignments?.reduce((acc, curr) => acc + curr.tasks.length, 0) || 0;
    const unassignedCount = plan.unassignedTasks?.length || 0;
    const volCount = plan.assignments?.length || 0;

    return (
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl shadow-xl p-6 text-white mb-6">
            <div className="flex items-center gap-3 mb-4">
                <Bot className="w-8 h-8 text-indigo-300" />
                <div>
                    <h2 className="text-xl font-bold">AI Work Plan Generated</h2>
                    <p className="text-indigo-200 text-sm">Generated at {new Date(plan.generatedAt || Date.now()).toLocaleString()}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-white/10 rounded-xl p-4 border border-white/5">
                    <div className="flex items-center gap-2 text-emerald-400 mb-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-sm font-medium">Assigned</span>
                    </div>
                    <p className="text-3xl font-bold">{assignedTasksCount}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4 border border-white/5">
                    <div className="flex items-center gap-2 text-rose-400 mb-1">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Unassigned</span>
                    </div>
                    <p className="text-3xl font-bold">{unassignedCount}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4 border border-white/5">
                    <div className="flex items-center gap-2 text-indigo-300 mb-1">
                        <User className="w-4 h-4" />
                        <span className="text-sm font-medium">Volunteers</span>
                    </div>
                    <p className="text-3xl font-bold">{volCount}</p>
                </div>
                <div className="bg-white/10 rounded-xl p-4 border border-white/5">
                    <div className="flex items-center gap-2 text-amber-300 mb-1">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">Avg Tasks/Vol</span>
                    </div>
                    <p className="text-3xl font-bold">{volCount > 0 ? (assignedTasksCount / volCount).toFixed(1) : 0}</p>
                </div>
            </div>
            
            <div className="mt-6 text-sm text-indigo-200 bg-black/20 p-3 rounded-lg">
                <p><strong>AI Summary:</strong> {plan.planSummary}</p>
            </div>
        </div>
    );
};

export default PlanSummary;