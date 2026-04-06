import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Camera, MapPin, CheckCircle2, ChevronRight, ChevronLeft, HeartPulse, Wheat, BookOpen, Wrench, ShieldAlert, Leaf, Truck, Users } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import PageHeader from '../components/ui/PageHeader';
import { saveSession } from '../utils/roleAuth';

const CAUSES = [
  { id: 'Medical', label: 'Medical Aid', icon: HeartPulse, color: 'bg-red-100 text-red-600' },
  { id: 'Food Distribution', label: 'Food Distribution', icon: Wheat, color: 'bg-amber-100 text-amber-600' },
  { id: 'Education', label: 'Education', icon: BookOpen, color: 'bg-blue-100 text-blue-600' },
  { id: 'Construction', label: 'Construction', icon: Wrench, color: 'bg-orange-100 text-orange-600' },
  { id: 'Counseling', label: 'Counseling', icon: Users, color: 'bg-purple-100 text-purple-600' },
  { id: 'Tech Support', label: 'Tech Support', icon: Cpu, color: 'bg-indigo-100 text-indigo-600' },
  { id: 'Transportation', label: 'Transportation', icon: Truck, color: 'bg-slate-100 text-slate-600' },
  { id: 'Disaster Relief', label: 'Disaster Relief', icon: ShieldAlert, color: 'bg-rose-100 text-rose-600' },
  { id: 'Environmental Cleanup', label: 'Environmental Cleanup', icon: Leaf, color: 'bg-emerald-100 text-emerald-600' },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIMES = ['Morning', 'Afternoon', 'Evening'];

// Basic SVG Icon fallback
function Cpu(props) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round" {...props}><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>;
}

export default function VolunteerRegistration() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '',
    address: '', lat: null, lng: null,
    availabilityDays: [], availabilityTimes: [],
    skills: [],
    password: '', confirmPassword: '',
    citizenAlso: true
  });

  const nextStep = () => setStep(s => Math.min(4, s + 1));
  const prevStep = () => setStep(s => Math.max(1, s - 1));

  const toggleArray = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData(prev => ({ ...prev, lat: pos.coords.latitude, lng: pos.coords.longitude, address: 'Current Location (GPS)' }));
          toast.success('Location found!');
        },
        () => toast.error('Location access denied')
      );
    }
  };

  const handleSubmit = async () => {
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      // Mock registration call
      const res = await fetch('/api/volunteers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          location: { address: formData.address, coordinates: [formData.lng || 77, formData.lat || 28] },
          skills: formData.skills,
          availability: { days: formData.availabilityDays, times: formData.availabilityTimes },
          status: 'Active'
        })
      });
      
      const data = await res.json();
      
      if (formData.citizenAlso) {
        // Also register as citizen (mocking by pushing to local storage)
        const citizens = JSON.parse(localStorage.getItem('saathi.citizenUsers') || '[]');
        citizens.push({ id: crypto.randomUUID(), name: formData.name, username: formData.email, password: formData.password, phone: formData.phone });
        localStorage.setItem('saathi.citizenUsers', JSON.stringify(citizens));
      }

      saveSession('volunteer', { id: data.data?._id || crypto.randomUUID(), name: formData.name, email: formData.email, phone: formData.phone });
      localStorage.setItem('saathi.activeRole', 'volunteer');
      
      toast.success('Registered successfully! 🎉');
      navigate('/volunteer');
    } catch (e) {
      toast.error('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm-50 pb-safe">
      <PageHeader title="Join as Volunteer" />
      
      <div className="px-4 py-6 max-w-md mx-auto">
        {/* Progress dots */}
        <div className="flex justify-center space-x-2 mb-8">
          {[1,2,3,4].map(i => (
            <div key={i} className={`h-2 rounded-full transition-all duration-300 ${step === i ? 'w-8 bg-primary-500' : step > i ? 'w-2 bg-primary-300' : 'w-2 bg-warm-200'}`} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-heading font-bold text-2xl text-slate-800">Personal Details</h2>
                  <p className="text-slate-500 text-sm mt-1">Let's get to know you better.</p>
                </div>
                
                <div className="flex justify-center">
                  <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center border-2 border-dashed border-primary-300 text-primary-500 cursor-pointer">
                    <Camera className="w-8 h-8" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <input type="text" className="w-full bg-white border border-warm-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Amit Sharma" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                    <input type="tel" className="w-full bg-white border border-warm-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+91 9876543210" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                    <input type="email" className="w-full bg-white border border-warm-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="amit@example.com" />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-heading font-bold text-2xl text-slate-800">Where & When</h2>
                  <p className="text-slate-500 text-sm mt-1">Help us match you with nearby needs.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Your Location</label>
                  <div className="flex space-x-2">
                    <input type="text" className="flex-1 bg-white border border-warm-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Enter area or tap GPS" />
                    <button onClick={handleLocation} className="bg-primary-100 text-primary-600 p-3 rounded-xl hover:bg-primary-200 transition-colors">
                      <MapPin className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Days Available</label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS.map(d => (
                      <button key={d} onClick={() => toggleArray('availabilityDays', d)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${formData.availabilityDays.includes(d) ? 'bg-primary-500 text-white shadow-md' : 'bg-white border border-warm-200 text-slate-600 hover:bg-warm-100'}`}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Preferred Times</label>
                  <div className="flex flex-wrap gap-2">
                    {TIMES.map(t => (
                      <button key={t} onClick={() => toggleArray('availabilityTimes', t)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${formData.availabilityTimes.includes(t) ? 'bg-accent-500 text-white shadow-md' : 'bg-white border border-warm-200 text-slate-600 hover:bg-warm-100'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-heading font-bold text-2xl text-slate-800">Your Skills</h2>
                  <p className="text-slate-500 text-sm mt-1">What causes do you want to support?</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {CAUSES.map(cause => {
                    const Icon = cause.icon;
                    const isSelected = formData.skills.includes(cause.id);
                    return (
                      <div 
                        key={cause.id} 
                        onClick={() => toggleArray('skills', cause.id)}
                        className={`p-4 rounded-2xl cursor-pointer border-2 transition-all duration-200 relative overflow-hidden ${isSelected ? 'border-primary-500 bg-primary-50 shadow-sm' : 'border-transparent bg-white shadow-sm hover:shadow-md'}`}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 text-primary-500">
                            <CheckCircle2 className="w-5 h-5 fill-primary-100" />
                          </div>
                        )}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${cause.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-slate-800 text-sm leading-tight">{cause.label}</h3>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-heading font-bold text-2xl text-slate-800">Almost Done!</h2>
                  <p className="text-slate-500 text-sm mt-1">Set a password to secure your account.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                    <input type="password" className="w-full bg-white border border-warm-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                    <input type="password" className="w-full bg-white border border-warm-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} placeholder="••••••••" />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-warm-200 shadow-sm mt-6">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input type="checkbox" className="w-5 h-5 text-primary-600 rounded mt-0.5" checked={formData.citizenAlso} onChange={e => setFormData({...formData, citizenAlso: e.target.checked})} />
                    <div>
                      <span className="block font-bold text-slate-800 text-sm">Register as Citizen too?</span>
                      <span className="block text-xs text-slate-500 mt-1">Allows you to also report issues in your community using the same account.</span>
                    </div>
                  </label>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-10 flex justify-between">
          {step > 1 ? (
            <Button variant="ghost" onClick={prevStep} className="px-4">
              <ChevronLeft className="w-5 h-5 mr-1" /> Back
            </Button>
          ) : <div></div>}
          
          {step < 4 ? (
            <Button onClick={nextStep} className="px-8 shadow-md">
              Next <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} isLoading={loading} className="px-8 shadow-md">
              Complete Registration
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}