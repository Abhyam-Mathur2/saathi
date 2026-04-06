import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, User, Mail, Lock, Loader2, CheckCircle2 } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { signupAdmin, saveSession } from '../utils/roleAuth';

const NgoRegister = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    ngoName: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const adminProfile = signupAdmin({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        ngoName: formData.ngoName,
      });

      // Automatically log in as admin
      saveSession('admin', {
        id: adminProfile.id,
        name: adminProfile.name,
        email: adminProfile.email,
        ngoName: adminProfile.ngoName,
      });

      toast.success('NGO registered successfully! You are now the head admin.');
      navigate('/admin');
    } catch (error) {
      toast.error(error.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <Toaster position="top-right" />
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-accent-400 to-accent-600 text-white mb-4 shadow-lg">
            <Building2 className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Register Your NGO</h1>
          <p className="text-slate-500 mt-2 text-sm">
            Partner with Saathi and become the head admin of your organization.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">NGO / Organization Name</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <input
                required
                type="text"
                placeholder="e.g. Hope Foundation"
                value={formData.ngoName}
                onChange={(e) => setFormData({ ...formData, ngoName: e.target.value })}
                className="w-full pl-10 rounded-lg border-slate-200 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Your Full Name (Head Admin)</label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <input
                required
                type="text"
                placeholder="Full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-10 rounded-lg border-slate-200 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Admin Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <input
                required
                type="email"
                placeholder="admin@yourorg.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 rounded-lg border-slate-200 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <input
                required
                type="password"
                placeholder="Min. 6 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 rounded-lg border-slate-200 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <input
                required
                type="password"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full pl-10 rounded-lg border-slate-200 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <div className="rounded-lg border border-primary-200 bg-primary-50 p-3 text-xs text-primary-800">
            As head admin, you'll be able to manage volunteers, assign tasks, and view reports for your NGO.
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
            Register NGO & Create Admin
          </button>
        </form>

        <div className="mt-6 space-y-3 text-center">
          <p className="text-sm text-slate-500">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">
              Admin Login
            </Link>
          </p>
          <p className="text-sm text-slate-500">
            Want to volunteer instead?{' '}
            <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700">
              Join as Volunteer
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NgoRegister;
