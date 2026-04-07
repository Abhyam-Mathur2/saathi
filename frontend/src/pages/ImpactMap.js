import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { apiUrl } from '../config/api';
import PredictionCard from '../components/PredictionCard';
import { Loader2, AlertTriangle, Users, ThermometerSun } from 'lucide-react';
import { getSession } from '../utils/roleAuth';


const HeatmapLayer = ({ zones }) => {
    return (
        <>
            {zones.map((zone, i) => {
                let color = 'green';
                if (zone.currentUrgency > 7) color = 'red';
                else if (zone.currentUrgency > 4) color = 'orange';

                return (
                    <CircleMarker 
                        key={i} 
                        center={[zone.lat, zone.lng]} 
                        radius={20}
                        pathOptions={{ color, fillColor: color, fillOpacity: 0.5 }}
                    >
                        <Popup>
                            <strong>{zone.placeName}</strong><br/>
                            Urgency: {zone.currentUrgency}/10<br/>
                            Type: {zone.crisisType || 'General'}<br/>
                            Affected: {zone.affectedPopulation}
                        </Popup>
                    </CircleMarker>
                );
            })}
        </>
    );
};

const ImpactMap = () => {
    const session = getSession();
    const city = session?.city || '';
    const [zones, setZones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedZonePrediction, setSelectedZonePrediction] = useState(null);

    useEffect(() => {
        const fetchZones = async () => {
            try {
                const query = city ? `?city=${encodeURIComponent(city)}` : '';
                const res = await axios.get(apiUrl(`/api/impact/heatmap${query}`));
                setZones(res.data.data);
            } catch(e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchZones();
    }, [city]);

    const fetchPrediction = async (zoneId) => {
        setSelectedZonePrediction(null);
        try {
            const res = await axios.get(apiUrl(`/api/impact/predict/${zoneId}`));
            setSelectedZonePrediction(res.data.data);
        } catch(e) {
            console.error(e);
        }
    };

    const hasCritical = zones.some(z => z.currentUrgency >= 9);

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary-600" /></div>;

    return (
        <div className="relative h-[calc(100vh-64px)] w-full overflow-hidden flex flex-col md:flex-row">
            {/* Top Critical Alert */}
            {hasCritical && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-red-600 text-white px-4 py-2 rounded-full shadow-lg font-bold flex items-center gap-2 animate-pulse">
                    <AlertTriangle className="w-5 h-5" /> 
                    CRITICAL ALERT: High Urgency Zones Detected
                </div>
            )}

            <div className="flex-1 relative z-0 h-full">
                <MapContainer center={[22.5, 78.0]} zoom={5} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                    <HeatmapLayer zones={zones} />
                </MapContainer>
            </div>

            {/* Sidebar List */}
            <div className="w-full md:w-96 bg-white shadow-xl z-[1000] h-full overflow-y-auto flex flex-col">
                <div className="p-4 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800">Impact Zones</h2>
                    <p className="text-sm text-slate-500">{zones.length} active areas</p>
                </div>
                
                {selectedZonePrediction && (
                    <div className="p-4 border-b border-slate-200 bg-slate-50">
                        <PredictionCard prediction={selectedZonePrediction} />
                    </div>
                )}

                <div className="flex-1 p-2 space-y-2">
                    {zones.sort((a,b) => b.currentUrgency - a.currentUrgency).map((z, i) => (
                        <div key={i} onClick={() => fetchPrediction(z.zoneId)} className="cursor-pointer bg-white p-3 rounded-lg border border-slate-200 hover:border-primary-500 hover:shadow-md transition-all">
                            <div className="flex justify-between">
                                <h3 className="font-bold text-slate-800 text-sm">{z.placeName}</h3>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${z.currentUrgency > 7 ? 'bg-red-100 text-red-700' : z.currentUrgency > 4 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                                    {z.currentUrgency}/10
                                </span>
                            </div>
                            <div className="mt-2 text-xs text-slate-500 flex gap-3">
                                <span className="flex items-center gap-1"><Users className="w-3 h-3"/> {z.affectedPopulation}</span>
                                <span className="flex items-center gap-1"><ThermometerSun className="w-3 h-3"/> {z.weatherSeverity > 7 ? 'Severe' : 'Normal'}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ImpactMap;