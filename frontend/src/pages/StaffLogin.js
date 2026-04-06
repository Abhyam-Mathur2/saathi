import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, Loader2, CheckCircle2, Copy, Check } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { loginAdmin } from '../utils/roleAuth';

const StaffLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
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
      const session = loginAdmin({ email: formData.email, password: formData.password });
      toast.success(`Welcome, ${session.name}!`);
      navigate('/admin');
    } catch (error) {
      toast.error(error.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <Toaster position="top-right" />
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary-50 text-primary-600 mb-4">
            <Shield className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Login</h1>
          <p className="text-slate-500 mt-2 text-sm">Sign in with your admin credentials.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
            <input
              required
              type="email"
              placeholder="Admin email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full pl-10 rounded-lg border-slate-200 focus:ring-primary-500 focus:border-primary-500"
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
              className="w-full pl-10 rounded-lg border-slate-200 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900">
            <p className="font-semibold text-sm mb-3">Demo Admin Credentials:</p>
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
                  <p className="text-sm font-mono text-slate-900">Admin@2026</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy('Admin@2026', 'password')}
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
            Login as Admin
          </button>
        </form>

        <div className="mt-6 space-y-3 text-center">
          <p className="text-sm text-slate-500">
            Register your NGO?{' '}
            <Link to="/ngo/register" className="font-semibold text-primary-600 hover:text-primary-700">
              Register NGO &rarr;
            </Link>
          </p>
          <p className="text-sm text-slate-500">
            Are you a volunteer?{' '}
            <Link to="/volunteer/login" className="font-semibold text-primary-600 hover:text-primary-700">
              Volunteer Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default StaffLogin;
