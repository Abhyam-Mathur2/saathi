import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, Loader2, CheckCircle2, Copy, Check } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { loginVolunteer } from '../utils/volunteerAuth';
import { loginAdmin, saveSession } from '../utils/roleAuth';

const StaffLogin = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('admin');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', name: '', phone: '' });
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
      if (role === 'admin') {
        loginAdmin({ email: formData.email, password: formData.password });
        toast.success('Admin login successful.');
        navigate('/admin');
      } else {
        const volunteerSession = loginVolunteer({ email: formData.email, password: formData.password });
        saveSession('volunteer', volunteerSession);
        toast.success(`Welcome, ${volunteerSession.name}!`);
        navigate('/volunteer');
      }
    } catch (error) {
      toast.error(error.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] px-4 py-10 flex items-center justify-center">
      <Toaster position="top-right" />
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary-50 text-primary-600 mb-4">
            <Shield className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Admin / Volunteer Login</h1>
          <p className="text-slate-500 mt-2 text-sm">Pick your staff role and continue.</p>
        </div>

        <div className="mb-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1 text-sm font-semibold">
          <button
            type="button"
            onClick={() => setRole('admin')}
            className={`rounded-lg py-2 ${role === 'admin' ? 'bg-white text-slate-900 shadow' : 'text-slate-500'}`}
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => setRole('volunteer')}
            className={`rounded-lg py-2 ${role === 'volunteer' ? 'bg-white text-slate-900 shadow' : 'text-slate-500'}`}
          >
            Volunteer
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
            <input
              required
              type="email"
              placeholder={role === 'admin' ? 'admin@saathi.com' : 'Volunteer email'}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="h-12 w-full pl-10 rounded-xl border-slate-200 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
            <input
              required
              type="password"
              placeholder={role === 'admin' ? 'Saathi@Admin2026!' : 'Volunteer password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="h-12 w-full pl-10 rounded-xl border-slate-200 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {role === 'admin' && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900">
              <p className="font-semibold text-sm mb-3">📋 Demo Admin Credentials:</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-amber-200">
                  <div>
                    <p className="text-xs text-amber-700 font-semibold">Email:</p>
                    <p className="text-sm font-mono text-slate-900">admin@saathi.com</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy('admin@saathi.com', 'email')}
                    className="ml-2 p-2 hover:bg-amber-100 rounded-lg transition"
                  >
                    {copiedField === 'email' ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-amber-600" />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-amber-200">
                  <div>
                    <p className="text-xs text-amber-700 font-semibold">Password:</p>
                    <p className="text-sm font-mono text-slate-900">Saathi@Admin2026!</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy('Saathi@Admin2026!', 'password')}
                    className="ml-2 p-2 hover:bg-amber-100 rounded-lg transition"
                  >
                    {copiedField === 'password' ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-amber-600" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {role === 'volunteer' && (
            <div className="rounded-xl border border-blue-300 bg-blue-50 p-4 text-blue-900">
              <p className="font-semibold text-sm mb-3">📋 Demo Volunteer Credentials:</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-blue-200">
                  <div>
                    <p className="text-xs text-blue-700 font-semibold">Email:</p>
                    <p className="text-sm font-mono text-slate-900">john@saathi.com</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy('john@saathi.com', 'vol_email')}
                    className="ml-2 p-2 hover:bg-blue-100 rounded-lg transition"
                  >
                    {copiedField === 'vol_email' ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-blue-600" />
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-blue-200">
                  <div>
                    <p className="text-xs text-blue-700 font-semibold">Password:</p>
                    <p className="text-sm font-mono text-slate-900">Volunteer@2026</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy('Volunteer@2026', 'vol_password')}
                    className="ml-2 p-2 hover:bg-blue-100 rounded-lg transition"
                  >
                    {copiedField === 'vol_password' ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-blue-600" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-primary-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
            Login as {role}
          </button>
        </form>

        <p className="text-sm text-slate-500 text-center mt-6">
          New volunteer?{' '}
          <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700">
            Register here
          </Link>
        </p>

        <p className="mt-4 text-center text-sm text-slate-500">
          Citizens can also become volunteers from the citizen workspace.
        </p>
      </div>
    </div>
  );
};

export default StaffLogin;
