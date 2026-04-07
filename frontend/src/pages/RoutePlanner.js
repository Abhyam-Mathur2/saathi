import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { apiUrl } from '../config/api';
import RouteCard from '../components/RouteCard';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Loader2, Route as RouteIcon } from 'lucide-react';
import { getSession } from '../utils/roleAuth';
import { getActiveRole } from '../utils/roleSwitch';
import L from 'leaflet';

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const RoutePlanner = () => {
    const session = getSession();
    const role = getActiveRole(session);
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [routeGeometries, setRouteGeometries] = useState({});
    const [userLocation, setUserLocation] = useState([22.5, 78.0]);

    useEffect(() => {
        // Option to pre-fetch user geo location for fallback center
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
                (err) => console.log(err)
            );
        }

        const fetchRoutes = async () => {
            try {
                let fetchedRoutes = [];
                if (role === 'volunteer' && session?.id) {
                    const res = await axios.get(apiUrl(`/api/routes/volunteer/${session.id}`));
                    if (res.data.data) fetchedRoutes = [res.data.data];
                } else {
                    const res = await axios.post(apiUrl('/api/routes/optimize-all'));
                    fetchedRoutes = res.data.data || [];
                }
                setRoutes(fetchedRoutes);

                // Fetch OSRM geometry for each route
                const geometries = {};
                for (let i = 0; i < fetchedRoutes.length; i++) {
                    const r = fetchedRoutes[i];
                    if (!r.routePoints || r.routePoints.length < 2) continue;
                    
                    const coords = r.routePoints.map(p => `${p.lng},${p.lat}`).join(';');
                    try {
                        const osrmRes = await axios.get(`https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`);
                        if (osrmRes.data.routes && osrmRes.data.routes.length > 0) {
                            // Convert [lng, lat] to [lat, lng] for Leaflet
                            geometries[i] = osrmRes.data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
                        }
                    } catch (err) {
                        console.error('OSRM fetch error:', err);
                    }
                }
                setRouteGeometries(geometries);

            } catch(e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchRoutes();
    }, [role, session?.id]);

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
                        <RouteCard key={i} route={r} volunteer={{ name: r.volunteer?.name || `Volunteer ${r.volunteer}` }} />
                    ))}
                    {routes.length === 0 && <p className="text-slate-500 italic p-4">No active routes today.</p>}
                </div>
                
                <div className="lg:col-span-2 h-[80vh] rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative z-0">
                    <MapContainer key={`map-${userLocation[0]}-${routes.length}`} center={routes[0]?.routePoints?.[0] ? [routes[0].routePoints[0].lat, routes[0].routePoints[0].lng] : userLocation} zoom={routes.length > 0 ? 12 : 5} style={{ height: '100%', width: '100%' }}>
                        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                        {routes.map((r, rIdx) => {
                            const color = colors[rIdx % colors.length];
                            
                            // Use OSRM geometry if fetched, else fallback to straight lines
                            const positions = routeGeometries[rIdx] || r.routePoints.map(p => [p.lat, p.lng]);
                            
                            return (
                                <React.Fragment key={rIdx}>
                                    <Polyline positions={positions} pathOptions={{ color, weight: 4 }} />
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