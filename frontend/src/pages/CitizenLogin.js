import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AtSign, Lock, Loader2, LogIn } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { loginCitizen } from '../utils/roleAuth';

const CitizenLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      loginCitizen(formData);
      toast.success('Welcome back!');
      navigate('/citizen');
    } catch (error) {
      toast.error(error.message || 'Citizen login failed.');
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
            <LogIn className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Citizen Login</h1>
          <p className="text-slate-500 mt-2 text-sm">Login with your citizen username and password.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <AtSign className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
            <input
              required
              type="text"
              placeholder="Username"
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
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full pl-10 rounded-lg border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
            Continue as Citizen
          </button>
        </form>

        <p className="text-sm text-slate-500 text-center mt-6">
          New user?{' '}
          <Link to="/citizen/signup" className="font-semibold text-emerald-600 hover:text-emerald-700">
            Create citizen account
          </Link>
        </p>

        <p className="text-sm text-slate-500 text-center mt-3">
          Need staff access?{' '}
          <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">
            Admin / Volunteer login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default CitizenLogin;
