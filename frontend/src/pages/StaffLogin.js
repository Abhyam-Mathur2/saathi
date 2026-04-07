import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, Loader2, CheckCircle2 } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { loginAdmin } from '../utils/roleAuth';

const StaffLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const session = await loginAdmin({ email: formData.email, password: formData.password });
      toast.success(`Welcome, ${session.name}! (${session.ngoName})`);
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
          <p className="text-slate-500 mt-2 text-sm">Sign in with your NGO admin credentials.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
            <input
              required type="email" placeholder="Admin email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full pl-10 rounded-lg border-slate-200 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
            <input
              required type="password" placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full pl-10 rounded-lg border-slate-200 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Demo credentials box */}
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900 text-sm space-y-1">
            <p className="font-semibold mb-2">Demo Admin Credentials (any city):</p>
            {[
              { city: 'Delhi', email: 'admin.delhi@saathi.com' },
              { city: 'Mumbai', email: 'admin.mumbai@saathi.com' },
              { city: 'Patna', email: 'admin.patna@saathi.com' },
              { city: 'Bangalore', email: 'admin.bangalore@saathi.com' },
              { city: 'Chennai', email: 'admin.chennai@saathi.com' },
            ].map(({ city, email }) => (
              <button
                key={city} type="button"
                onClick={() => setFormData({ email, password: 'Admin@2026' })}
                className="w-full text-left bg-white px-3 py-1.5 rounded-lg border border-amber-200 hover:bg-amber-50 transition font-mono text-xs"
              >
                📍 {city}: <span className="text-slate-700">{email}</span>
              </button>
            ))}
            <p className="text-xs text-amber-700 mt-1">Password for all: <strong>Admin@2026</strong></p>
          </div>

          <button
            type="submit" disabled={loading}
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
        </div>
      </div>
    </div>
  );
};

export default StaffLogin;
