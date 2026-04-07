import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Mail, MapPin, CheckCircle2, Loader2, Camera, X, LocateFixed, Lock } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import ChatbotWidget from '../components/ChatbotWidget';
import { signupVolunteer } from '../utils/volunteerAuth';

const VolunteerRegistration = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    skills: [],
    address: '',
    longitude: 77.1025,
    latitude: 28.7041,
    profileImage: '',
    availability: {
      days: [],
      times: ['Morning', 'Afternoon']
    }
  });

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit for Base64 in demo
        toast.error('Image too large. Please use a file under 1MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setFormData({ ...formData, profileImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    setFormData({ ...formData, profileImage: '' });
  };

  const fetchBrowserLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported in this browser.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        let resolvedAddress = '';

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
            {
              headers: {
                Accept: 'application/json',
              },
            }
          );

          if (res.ok) {
            const data = await res.json();
            const a = data.address || {};
            const city = a.city || a.town || a.village || a.hamlet || a.county || '';
            const state = a.state || '';
            const country = a.country || '';
            resolvedAddress = [city, state, country].filter(Boolean).join(', ');
          }
        } catch (error) {
          // Fall back to coordinates when reverse lookup is unavailable.
        }

        setFormData((prev) => ({
          ...prev,
          latitude,
          longitude,
          address: resolvedAddress || `Lat ${latitude.toFixed(6)}, Lng ${longitude.toFixed(6)}`,
        }));
        setLocationAccuracy(Math.round(accuracy));
        setLocating(false);
        toast.success('Current location fetched from browser.');
      },
      () => {
        setLocating(false);
        toast.error('Unable to fetch location. Please allow location permission.');
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

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

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await signupVolunteer({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        skills: formData.skills,
        city: formData.address,          // use address field as city identifier
        location: {
          type: 'Point',
          coordinates: [formData.longitude, formData.latitude],
          address: formData.address
        },
        availability: formData.availability,
        profileImage: formData.profileImage || '',
        orgId: null                       // independent volunteer
      });

      toast.success('Registration successful! You can now log in.');
      setFormData({
        name: '', phone: '', email: '', password: '', confirmPassword: '',
        skills: [], address: '', longitude: 77.1025, latitude: 28.7041,
        profileImage: '',
        availability: { days: [], times: ['Morning'] }
      });
      setPhotoPreview(null);
      navigate('/volunteer/login');
    } catch (error) {
      toast.error(error?.message || 'Registration failed. Please try again.');
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
          
          {/* Photo Upload Section */}
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative group">
              <div className="w-32 h-32 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden bg-slate-50">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-10 h-10 text-slate-300" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-full cursor-pointer shadow-lg hover:bg-primary-700 transition-all">
                <Camera className="w-4 h-4" />
                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
              </label>
              {photoPreview && (
                <button 
                  onClick={removePhoto}
                  className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition-all"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-2 font-medium">Upload Profile Photo (Optional)</p>
          </div>

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

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 rounded-lg border-slate-200 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="At least 6 characters"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pl-10 rounded-lg border-slate-200 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Re-enter password"
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
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-2">
                    <button
                      type="button"
                      onClick={fetchBrowserLocation}
                      disabled={locating}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60 w-fit"
                    >
                      <LocateFixed className="w-4 h-4" />
                      {locating ? 'Fetching location...' : 'Use My Current Location'}
                    </button>
                    <p className="text-xs text-slate-500">
                      Coordinates: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                      {locationAccuracy ? ` (${locationAccuracy}m accuracy)` : ''}
                    </p>
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
      <ChatbotWidget defaultRole="volunteer" />
    </div>
  );
};

export default VolunteerRegistration;
