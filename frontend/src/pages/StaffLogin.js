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
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              Demo admin credentials: admin@saathi.com / admin123
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
