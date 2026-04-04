import React from 'react';
import { AlertTriangle, Users, Activity } from 'lucide-react';

const PredictionCard = ({ prediction }) => {
    if (!prediction) return null;
    return (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4 w-80">
            <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary-600" /> AI Prediction
            </h3>
            <div className="space-y-3">
                <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
                    <span className="text-sm font-medium text-slate-600">Predicted Urgency</span>
                    <span className="text-lg font-bold text-red-600">{prediction.predictedUrgency}/10</span>
                </div>
                <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500 mt-1" />
                    <div>
                        <p className="text-sm font-semibold text-slate-800">Most Likely Crisis</p>
                        <p className="text-xs text-slate-600">{prediction.crisisType || prediction.predictedCrisisType}</p>
                    </div>
                </div>
                <div className="flex items-start gap-2">
                    <Users className="w-4 h-4 text-blue-500 mt-1" />
                    <div>
                        <p className="text-sm font-semibold text-slate-800">Needed Skills</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {(prediction.recommendedSkills || []).map((skill, i) => (
                                <span key={i} className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{skill}</span>
                            ))}
                        </div>
                    </div>
                </div>
                <details className="mt-2 text-xs">
                    <summary className="text-primary-600 cursor-pointer font-medium">View AI Reasoning</summary>
                    <p className="mt-1 text-slate-600 italic">{prediction.reasoning}</p>
                </details>
            </div>
        </div>
    );
};

export default PredictionCard;