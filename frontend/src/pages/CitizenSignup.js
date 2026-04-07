import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UserPlus, User, AtSign, Lock, Phone, MapPin, Loader2 } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import ChatbotWidget from '../components/ChatbotWidget';
import { signupCitizenUser } from '../utils/roleAuth';

const CitizenSignup = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    confirmPassword: '',
    phone: '',
    city: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      signupCitizenUser(formData);
      toast.success('Citizen account created. Please log in.');
      navigate('/citizen/login');
    } catch (error) {
      toast.error(error.message || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <Toaster position="top-right" />
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 mb-4">
            <UserPlus className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{t('auth.citizenSignup') || 'Citizen Sign Up'}</h1>
          <p className="text-slate-500 mt-2 text-sm">{t('auth.signupDesc') || 'Create your account with username and password.'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
            <input
              required
              type="text"
              placeholder={t('auth.name') || 'Full name'}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full pl-10 rounded-lg border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div className="relative">
            <AtSign className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
            <input
              required
              type="text"
              placeholder={t('auth.username') || 'Username'}
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full pl-10 rounded-lg border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
            <input
              required
              type="password"
              placeholder={t('auth.password')}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full pl-10 rounded-lg border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
            <input
              required
              type="password"
              placeholder={t('auth.confirmPassword')}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full pl-10 rounded-lg border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div className="relative">
            <Phone className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="tel"
              placeholder={t('auth.phone') || 'Phone (optional)'}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full pl-10 rounded-lg border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div className="relative">
            <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={t('auth.city') || 'City (optional)'}
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full pl-10 rounded-lg border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
            {t('messages.submit')}
          </button>
        </form>

        <p className="text-sm text-slate-500 text-center mt-6">
          {t('auth.haveAccount') || 'Already have an account?'}{' '}
          <Link to="/citizen/login" className="font-semibold text-emerald-600 hover:text-emerald-700">
            {t('auth.citizenLogin')}
          </Link>
        </p>
      </div>
      <ChatbotWidget defaultRole="citizen" />
    </div>
  );
};

export default CitizenSignup;
