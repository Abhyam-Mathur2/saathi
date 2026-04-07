import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { loginVolunteer } from '../utils/volunteerAuth';
import { useLanguage } from '../contexts/LanguageContext';
import { translateLabel } from '../i18n/translations';

const DEMO_VOLUNTEER_PASSWORD = 'SaathiVol!2026#';

const VolunteerLogin = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const session = await loginVolunteer({ email: formData.email, password: formData.password });
      toast.success(`Welcome back, ${session.name}!${session.orgName ? ` (${session.orgName})` : ''}`);
      navigate('/volunteer');
    } catch (error) {
      toast.error(error.message || translateLabel(language, 'Login failed.'));
    } finally {
      setLoading(false);
    }
  };

  const demoVolunteers = [
    { city: 'Delhi', email: 'rahul@saathi.com' },
    { city: 'Mumbai', email: 'priya@saathi.com' },
    { city: 'Patna', email: 'amit@saathi.com' },
    { city: 'Bangalore', email: 'vikram@saathi.com' },
    { city: 'Chennai', email: 'sita@saathi.com' },
  ];

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <Toaster position="top-right" />
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary-50 text-primary-600 mb-4">
            <LogIn className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{translateLabel(language, 'Volunteer Login')}</h1>
          <p className="text-slate-500 mt-2 text-sm">{translateLabel(language, 'Login via your organization credentials.')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
            <input
              required type="email" placeholder={translateLabel(language, 'Email')}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full pl-10 rounded-lg border-slate-200 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
            <input
              required type="password" placeholder={translateLabel(language, 'Password')}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full pl-10 rounded-lg border-slate-200 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
            {translateLabel(language, 'Login as Volunteer')}
          </button>

          <div className="rounded-xl border border-blue-300 bg-blue-50 p-4 text-blue-900">
            <p className="font-semibold text-sm mb-2">{translateLabel(language, 'Demo Volunteer Accounts:')}</p>
            <div className="space-y-1">
              {demoVolunteers.map(({ city, email }) => (
                <button
                  key={city} type="button"
                  onClick={() => setFormData({ email, password: DEMO_VOLUNTEER_PASSWORD })}
                  className="w-full text-left bg-white px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-50 transition font-mono text-xs"
                >
                  📍 {city}: <span className="text-slate-700">{email}</span>
                </button>
              ))}
              <p className="text-xs text-blue-700 mt-1">{translateLabel(language, 'Password for all:')} <strong>{DEMO_VOLUNTEER_PASSWORD}</strong></p>
            </div>
          </div>
        </form>

        <div className="mt-6 space-y-3 text-center">
          <p className="text-sm text-slate-500">
            {translateLabel(language, 'New volunteer?')}{' '}
            <Link to="/volunteer/signup" className="font-semibold text-primary-600 hover:text-primary-700">
              {translateLabel(language, 'Create an account')}
            </Link>
          </p>
          <p className="text-sm text-slate-500">
            {translateLabel(language, 'Are you an admin?')}{' '}
            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">
              {translateLabel(language, 'Admin Login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VolunteerLogin;
