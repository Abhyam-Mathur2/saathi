import React, { useState } from 'react';
import axios from 'axios';
import { User, Phone, Mail, MapPin, CheckCircle2, Loader2 } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

const VolunteerRegistration = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    skills: [],
    address: '',
    longitude: 77.1025,
    latitude: 28.7041,
    availability: {
      days: [],
      times: ['Morning', 'Afternoon']
    }
  });

  const skillsOptions = ['Medical', 'Food Distribution', 'Education', 'Construction', 'Logistics', 'Counseling', 'Tech Support', 'Transportation'];
  const daysOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleCheckboxChange = (field, value) => {
    const current = field === 'skills' ? formData.skills : formData.availability.days;
    const updated = current.includes(value) 
      ? current.filter(item => item !== value)
      : [...current, value];
    
    if (field === 'skills') {
      setFormData({ ...formData, skills: updated });
    } else {
      setFormData({ ...formData, availability: { ...formData.availability, days: updated } });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        location: {
          coordinates: [formData.longitude, formData.latitude],
          address: formData.address
        }
      };
      await axios.post('http://localhost:5000/api/volunteers', payload);
      toast.success('Registration successful! Thank you for joining.');
      setFormData({
        name: '', phone: '', email: '', skills: [], address: '', 
        longitude: 77.1025, latitude: 28.7041, availability: { days: [], times: ['Morning'] }
      });
    } catch (error) {
      toast.error('Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Toaster position="top-right" />
      
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Volunteer Registration</h1>
        <p className="text-slate-500 mt-2">Join our network and help make a difference in your community.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-8">
        {/* Personal Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <User className="w-5 h-5 text-primary-600" /> Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input 
                  type="text" required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full pl-10 rounded-lg border-slate-200 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="John Doe"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input 
                  type="tel" required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full pl-10 rounded-lg border-slate-200 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input 
                  type="email" required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-10 rounded-lg border-slate-200 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="john@example.com"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Skills & Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Skills & Expertise</h3>
            <div className="grid grid-cols-1 gap-2">
              {skillsOptions.map(skill => (
                <label key={skill} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">
                  <input 
                    type="checkbox"
                    checked={formData.skills.includes(skill)}
                    onChange={() => handleCheckboxChange('skills', skill)}
                    className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
                  />
                  <span className="text-sm text-slate-700">{skill}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-6">
             <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Location</h3>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" required
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full pl-10 rounded-lg border-slate-200 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Street, City, Zip"
                    />
                  </div>
                </div>
             </div>

             <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Availability</h3>
                <div className="flex flex-wrap gap-2">
                  {daysOptions.map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleCheckboxChange('days', day)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${formData.availability.days.includes(day) ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-500 border-slate-200 hover:border-primary-300'}`}
                    >
                      {day.substring(0, 3)}
                    </button>
                  ))}
                </div>
             </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-4 bg-primary-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-700 disabled:opacity-50 transition-all shadow-lg shadow-primary-100"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
          Register as Volunteer
        </button>
      </form>
    </div>
  );
};

export default VolunteerRegistration;
