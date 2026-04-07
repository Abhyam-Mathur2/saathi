import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AtSign, Lock, Loader2, LogIn } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { loginCitizen } from '../utils/roleAuth';
import { useLanguage } from '../contexts/LanguageContext';
import { translateLabel } from '../i18n/translations';

const CitizenLogin = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const session = await loginCitizen(formData);
      toast.success(`Welcome back, ${session.name}!`);
      navigate('/citizen');
    } catch (error) {
      toast.error(error.message || translateLabel(language, 'Citizen login failed.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] px-4 py-10 flex items-center justify-center">
      <Toaster position="top-right" />
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 mb-4">
            <LogIn className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{translateLabel(language, 'Citizen Login')}</h1>
          <p className="text-slate-500 mt-2 text-sm">{translateLabel(language, 'Login with your citizen username and password.')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <AtSign className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
            <input
              required
              type="text"
              placeholder={translateLabel(language, 'Username')}
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="h-12 w-full pl-10 rounded-xl border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
            <input
              required
              type="password"
              placeholder={translateLabel(language, 'Password')}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="h-12 w-full pl-10 rounded-xl border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-emerald-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
            {translateLabel(language, 'Continue as Citizen')}
          </button>

          <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-900">
            <p className="font-semibold text-sm mb-2">✅ {translateLabel(language, 'Demo Citizen Accounts:')}</p>
            <div className="space-y-1">
              {[
                { city: 'Delhi', username: 'deepak.delhi' },
                { city: 'Mumbai', username: 'meera.mumbai' },
                { city: 'Patna', username: 'suraj.patna' },
                { city: 'Bangalore', username: 'kavya.blr' },
                { city: 'Chennai', username: 'lakshmi.chn' },
              ].map(({ city, username }) => (
                <button
                  key={city} type="button"
                  onClick={() => setFormData({ username, password: 'Citizen@2026' })}
                  className="w-full text-left bg-white px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-50 transition font-mono text-xs"
                >
                  📍 {city}: <span className="text-slate-700">{username}</span>
                </button>
              ))}
              <p className="text-xs text-emerald-700 mt-1">{translateLabel(language, 'Password for all:')} <strong>Citizen@2026</strong></p>
            </div>
          </div>
        </form>

        <p className="text-sm text-slate-500 text-center mt-6">
          {translateLabel(language, 'New user?')}{' '}
          <Link to="/citizen/signup" className="font-semibold text-emerald-600 hover:text-emerald-700">
            {translateLabel(language, 'Create citizen account')}
          </Link>
        </p>

        <p className="text-sm text-slate-500 text-center mt-3">
          {translateLabel(language, 'Need staff access?')}{' '}
          <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">
            {translateLabel(language, 'Admin / Volunteer login')}
          </Link>
        </p>

        <p className="mt-4 text-center text-sm text-slate-500">
          {translateLabel(language, 'Want to help too? Open your citizen workspace and register as a volunteer.')}
        </p>
      </div>
    </div>
  );
};

export default CitizenLogin;
