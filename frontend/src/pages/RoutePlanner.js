import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { apiUrl } from '../config/api';
import RouteCard from '../components/RouteCard';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Loader2, Route as RouteIcon } from 'lucide-react';

const RoutePlanner = () => {
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRoutes = async () => {
            try {
                // Currently mock fetching all via optimize-all, normally we fetch /routes/all 
                const res = await axios.post(apiUrl('/api/routes/optimize-all'));
                setRoutes(res.data.data);
            } catch(e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchRoutes();
    }, []);

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-primary-600" /></div>;

    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2"><RouteIcon className="text-primary-600" /> Route Planner</h1>
                    <p className="text-slate-500 mt-2">Optimized travel paths for deployed volunteers.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-4 max-h-[80vh] overflow-y-auto pr-2">
                    {routes.map((r, i) => (
                        <RouteCard key={i} route={r} volunteer={{ name: `Volunteer ${r.volunteer}` }} />
                    ))}
                    {routes.length === 0 && <p className="text-slate-500 italic p-4">No active routes today.</p>}
                </div>
                
                <div className="lg:col-span-2 h-[80vh] rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative z-0">
                    <MapContainer center={[22.5, 78.0]} zoom={5} style={{ height: '100%', width: '100%' }}>
                        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                        {routes.map((r, rIdx) => {
                            const color = colors[rIdx % colors.length];
                            const positions = r.routePoints.map(p => [p.lat, p.lng]);
                            return (
                                <React.Fragment key={rIdx}>
                                    <Polyline positions={positions} pathOptions={{ color, weight: 3 }} />
                                    {r.routePoints.map((p, i) => (
                                        <Marker key={i} position={[p.lat, p.lng]}>
                                            <Popup><b>Stop {i+1}</b><br/>{p.taskTitle}</Popup>
                                        </Marker>
                                    ))}
                                </React.Fragment>
                            );
                        })}
                    </MapContainer>
                </div>
            </div>
        </div>
    );
};

export default RoutePlanner;