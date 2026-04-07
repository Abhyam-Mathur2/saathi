import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, User, Mail, Lock, Loader2, CheckCircle2, MapPin } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { signupAdmin } from '../utils/roleAuth';

const NgoRegister = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const [orgs, setOrgs] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    orgId: '',
    newNgoName: '',
    newNgoCity: ''
  });

  const API = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetch(`${API}/orgs`)
      .then(r => r.json())
      .then(d => { if (d.success) setOrgs(d.data); })
      .catch(console.error)
      .finally(() => setLoadingOrgs(false));
  }, [API]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (!formData.orgId) {
      toast.error('Please select your organization.');
      return;
    }

    try {
      setLoading(true);
      
      let finalOrgId = formData.orgId;

      // Create new NGO dynamically if requested
      if (finalOrgId === 'NEW_NGO') {
        if (!formData.newNgoName || !formData.newNgoCity) {
           toast.error('Please enter the name and city for your new NGO.');
           setLoading(false);
           return;
        }
        const orgRes = await fetch(`${API}/orgs`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ name: formData.newNgoName, city: formData.newNgoCity })
        });
        const orgData = await orgRes.json();
        if (!orgData.success) {
           toast.error('Failed to register new NGO: ' + orgData.message);
           setLoading(false);
           return;
        }
        finalOrgId = orgData.data._id;
      }

      await signupAdmin({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        orgId: finalOrgId
      });
      toast.success('Admin account created! Please login.');
      navigate('/login');
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
          <h1 className="text-2xl font-bold text-slate-900">Join as Admin</h1>
          <p className="text-slate-500 mt-2 text-sm">
            Register as admin for your NGO organization.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Select Your NGO</label>
            {loadingOrgs ? (
              <div className="flex items-center gap-2 text-slate-400 text-sm py-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading organizations...
              </div>
            ) : (
              <select
                required
                value={formData.orgId}
                onChange={(e) => setFormData({ ...formData, orgId: e.target.value })}
                className="w-full rounded-lg border-slate-200 focus:ring-primary-500 focus:border-primary-500 text-sm"
              >
                <option value="">-- Choose your organization --</option>
                <option value="NEW_NGO" className="font-bold text-primary-600">➕ Add New NGO</option>
                {orgs.map(org => (
                  <option key={org._id} value={org._id}>
                    {org.name} ({org.city})
                  </option>
                ))}
              </select>
            )}
          </div>

          {formData.orgId === 'NEW_NGO' && (
             <div className="bg-warm-50 p-4 rounded-xl border border-warm-200 mt-2 space-y-3">
               <h3 className="text-sm font-bold text-slate-800">Register New NGO</h3>
               <div>
                  <input required type="text" placeholder="NGO Name (e.g. Hope Foundation)"
                    value={formData.newNgoName}
                    onChange={(e) => setFormData({ ...formData, newNgoName: e.target.value })}
                    className="w-full rounded-lg border-slate-200 text-sm focus:ring-primary-500 focus:border-primary-500"
                  />
               </div>
               <div>
                  <input required type="text" placeholder="Operating City (e.g. Delhi)"
                    value={formData.newNgoCity}
                    onChange={(e) => setFormData({ ...formData, newNgoCity: e.target.value })}
                    className="w-full rounded-lg border-slate-200 text-sm focus:ring-primary-500 focus:border-primary-500"
                  />
               </div>
             </div>
          )}

          {formData.orgId && formData.orgId !== 'NEW_NGO' && (() => {
            const org = orgs.find(o => o._id === formData.orgId);
            return org ? (
              <div className="rounded-lg border border-primary-200 bg-primary-50 p-3 text-xs text-primary-800 flex items-start gap-2">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                <span><strong>{org.name}</strong> — {org.city}, {org.state}. Serving {org.serviceRadiusKm}km radius.</span>
              </div>
            ) : null;
          })()}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Your Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <input required type="text" placeholder="Full name"
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
              <input required type="email" placeholder="admin@yourorg.com"
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
              <input required type="password" placeholder="Min. 6 characters"
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
              <input required type="password" placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full pl-10 rounded-lg border-slate-200 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-primary-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary-700 disabled:opacity-50">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
            Create Admin Account
          </button>
        </form>

        <div className="mt-6 space-y-3 text-center">
          <p className="text-sm text-slate-500">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">Admin Login</Link>
          </p>
          <p className="text-sm text-slate-500">
            Want to volunteer?{' '}
            <Link to="/volunteer/signup" className="font-semibold text-primary-600 hover:text-primary-700">Join as Volunteer</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NgoRegister;
