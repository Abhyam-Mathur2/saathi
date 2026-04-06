import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { AlertTriangle, MapPin, Navigation, Loader2 } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';

export default function EmergencyAlert() {
  const [type, setType] = useState('Medical');
  const [description, setDescription] = useState('');
  const [radius, setRadius] = useState(5);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState(null);
  const [sent, setSent] = useState(false);

  const types = ['Flood', 'Fire', 'Medical', 'Missing Person', 'Other'];
  const radiuses = [1, 5, 10];

  const handleLocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, address: 'Current Location' });
          toast.success('Location found');
        },
        () => toast.error('Could not get location')
      );
    }
  };

  const handleSend = async () => {
    if (!description.trim()) {
      toast.error('Please describe the emergency');
      return;
    }
    if (!location) {
      toast.error('Please provide your location');
      return;
    }

    setLoading(true);
    if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);

    try {
      const res = await fetch('/api/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, description, location, radiusKm: radius })
      });
      const data = await res.json();
      
      setLoading(false);
      setSent(true);
      toast.success(`Alert sent to ${data.notifiedCount || 'nearby'} volunteers`);
    } catch (e) {
      setLoading(false);
      toast.error('Failed to send alert. Try calling 100.');
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-rose-50 flex flex-col items-center justify-center p-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl p-8 shadow-xl text-center max-w-sm">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="font-heading font-bold text-2xl mb-2 text-slate-800">Alert Broadcasted</h2>
          <p className="text-slate-600 mb-8">Nearby volunteers have been notified. Stay calm, help is on the way.</p>
          <Button onClick={() => window.history.back()} className="w-full">Return Home</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-50 pb-safe">
      <div className="bg-red-600 text-white p-4 safe-top sticky top-0 z-30 shadow-md">
        <div className="flex items-center space-x-3">
          <button onClick={() => window.history.back()} className="p-2 -ml-2 hover:bg-red-700 rounded-full transition-colors">
            <Navigation className="w-5 h-5 rotate-[270deg]" />
          </button>
          <h1 className="font-heading font-bold text-xl flex items-center">
            <AlertTriangle className="w-6 h-6 mr-2" /> Emergency Alert
          </h1>
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto mt-4">
        <div className="bg-rose-100 text-rose-800 p-4 rounded-2xl text-sm mb-6 flex items-start border border-rose-200">
          <AlertTriangle className="w-5 h-5 mr-3 shrink-0 mt-0.5" />
          <p><strong>Use only for genuine emergencies.</strong> False alerts may lead to an account ban. If life is in immediate danger, call 100 or 108 first.</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-3">Type of Emergency</label>
            <div className="flex flex-wrap gap-2">
              {types.map(t => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all ${type === t ? 'border-red-500 bg-red-50 text-red-700' : 'border-warm-200 bg-white text-slate-600 hover:border-red-200'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">Location</label>
            {!location ? (
              <Button variant="outline" onClick={handleLocate} className="w-full h-14 border-red-200 text-red-600 hover:bg-red-50">
                <MapPin className="w-5 h-5 mr-2" /> Use Current Location
              </Button>
            ) : (
              <div className="bg-green-50 text-green-700 border border-green-200 p-4 rounded-xl flex items-center justify-between">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span className="font-medium">{location.address}</span>
                </div>
                <button onClick={handleLocate} className="text-xs font-bold underline">Update</button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">Details</label>
            <textarea
              className="w-full bg-white border border-warm-200 rounded-xl p-4 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none h-32"
              placeholder="E.g., Heavy flooding in sector 4, ground floor submerged, 5 people trapped."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-800 mb-3">Alert Radius</label>
            <div className="flex space-x-3">
              {radiuses.map(r => (
                <button
                  key={r}
                  onClick={() => setRadius(r)}
                  className={`flex-1 py-3 rounded-xl font-semibold border-2 transition-all ${radius === r ? 'border-red-500 bg-red-50 text-red-700' : 'border-warm-200 bg-white text-slate-600 hover:border-red-200'}`}
                >
                  {r} km
                </button>
              ))}
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={loading}
            className="w-full bg-red-600 text-white font-bold text-lg h-16 rounded-2xl shadow-[0_8px_0_rgb(185,28,28)] active:shadow-[0_0px_0_rgb(185,28,28)] active:translate-y-2 transition-all mt-4 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-[0_8px_0_rgb(185,28,28)]"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'SEND EMERGENCY ALERT'}
          </motion.button>
        </div>
      </div>
    </div>
  );
}