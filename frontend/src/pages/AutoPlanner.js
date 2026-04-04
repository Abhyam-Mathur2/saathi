import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { apiUrl } from '../config/api';
import PlanSummary from '../components/PlanSummary';
import { Loader2, Wand2, FileDown, Navigation } from 'lucide-react';
import { jsPDF } from 'jspdf';

const AutoPlanner = () => {
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingMsg, setLoadingMsg] = useState('');

    useEffect(() => {
        const fetchLatest = async () => {
            try {
                const res = await axios.get(apiUrl('/api/planner/latest'));
                if (res.data.data) setPlan(res.data.data);
            } catch(e) {}
        };
        fetchLatest();
    }, []);

    const runPlanner = async () => {
        setLoading(true);
        setLoadingMsg('🤖 AI is analyzing tasks and volunteers...');
        try {
            const res = await axios.post(apiUrl('/api/planner/run'));
            setPlan(res.data.data);
        } catch(e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const exportPDF = () => {
        if (!plan) return;
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text("Saathi - AutoPlanner Plan", 20, 20);
        doc.setFontSize(12);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 30);
        
        let y = 40;
        plan.assignments?.forEach((a, i) => {
            doc.text(`${i+1}. Volunteer: ${a.volunteerName || 'Unknown'} - ${a.tasks.length} Tasks`, 20, y);
            y += 10;
        });

        doc.save("VolunteerPlan.pdf");
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Auto Planner</h1>
                    <p className="text-slate-500 mt-1">AI-driven automated dispatch and task assignment.</p>
                </div>
                <div className="flex gap-2">
                    {plan && (
                        <button onClick={exportPDF} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg flex items-center gap-2 transition-colors">
                            <FileDown className="w-4 h-4" /> Export PDF
                        </button>
                    )}
                    <button onClick={runPlanner} disabled={loading} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all disabled:opacity-70">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                        {loading ? 'Processing...' : 'Run Auto-Planner'}
                    </button>
                </div>
            </div>

            {loading && (
                <div className="py-20 flex flex-col items-center justify-center text-indigo-600">
                    <Loader2 className="w-12 h-12 animate-spin mb-4" />
                    <p className="text-lg font-medium animate-pulse">{loadingMsg}</p>
                </div>
            )}

            {!loading && plan && (
                <>
                    <PlanSummary plan={plan} />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {plan.assignments?.map((a, i) => (
                            <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                                <h3 className="font-bold text-lg text-slate-900 border-b pb-2 mb-3">{a.volunteerName || 'Volunteer'}</h3>
                                <p className="text-sm text-slate-600 mb-4 flex items-center gap-1"><Navigation className="w-4 h-4 text-indigo-500"/> {a.routeSummary || 'Route summary unavailable'}</p>
                                <div className="space-y-2">
                                    {a.tasks.map((t, idx) => (
                                        <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                            <p className="text-sm font-bold text-slate-800">{t.taskTitle}</p>
                                            <p className="text-xs text-slate-500 mt-1">{t.location}</p>
                                            <span className="inline-block mt-2 text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-rose-100 text-rose-700 rounded text-center w-fit">Urgency: {t.urgency}/10</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {!loading && !plan && (
                <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                    <Wand2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-600">No active plan</h3>
                    <p className="text-sm text-slate-400">Click "Run Auto-Planner" to generate optimal assignments.</p>
                </div>
            )}
        </div>
    );
};

export default AutoPlanner;