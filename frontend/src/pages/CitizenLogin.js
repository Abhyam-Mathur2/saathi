import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AtSign, Lock, Loader2, LogIn, Copy, Check } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { loginCitizen } from '../utils/roleAuth';

const CitizenLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [copiedField, setCopiedField] = useState(null);

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedField(null), 2000);
  };

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
    <div className="min-h-[calc(100vh-8rem)] px-4 py-10 flex items-center justify-center">
      <Toaster position="top-right" />
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
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
              className="h-12 w-full pl-10 rounded-xl border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
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
              className="h-12 w-full pl-10 rounded-xl border-slate-200 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-emerald-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
            Continue as Citizen
          </button>

          <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-900">
            <p className="font-semibold text-sm mb-3">✅ Demo Citizen Credentials (Auto-seeded):</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-emerald-200">
                <div>
                  <p className="text-xs text-emerald-700 font-semibold">Username:</p>
                  <p className="text-sm font-mono text-slate-900">citizen_demo</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy('citizen_demo', 'username')}
                  className="ml-2 p-2 hover:bg-emerald-100 rounded-lg transition"
                >
                  {copiedField === 'username' ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-emerald-600" />
                  )}
                </button>
              </div>
              <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-emerald-200">
                <div>
                  <p className="text-xs text-emerald-700 font-semibold">Password:</p>
                  <p className="text-sm font-mono text-slate-900">Citizen@2026</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy('Citizen@2026', 'cit_password')}
                  className="ml-2 p-2 hover:bg-emerald-100 rounded-lg transition"
                >
                  {copiedField === 'cit_password' ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-emerald-600" />
                  )}
                </button>
              </div>
            </div>
          </div>
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

        <p className="mt-4 text-center text-sm text-slate-500">
          Want to help too? Open your citizen workspace and register as a volunteer.
        </p>
      </div>
    </div>
  );
};

export default CitizenLogin;
