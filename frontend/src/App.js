import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import RoleLanding from './pages/RoleLanding';
import StaffLogin from './pages/StaffLogin';
import CitizenLogin from './pages/CitizenLogin';
import CitizenSignup from './pages/CitizenSignup';
import AdminPortal from './pages/AdminPortal';
import VolunteerPortal from './pages/VolunteerPortal';
import CitizenPortal from './pages/CitizenPortal';
import Dashboard from './pages/Dashboard';
import ReportSubmission from './pages/ReportSubmission';
import VolunteerRegistration from './pages/VolunteerRegistration';
import VolunteerManagement from './pages/VolunteerManagement';
import MatchingPanel from './pages/MatchingPanel';
import ImpactMap from './pages/ImpactMap';
import RoutePlanner from './pages/RoutePlanner';
import AutoPlanner from './pages/AutoPlanner';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<RoleLanding />} />
            <Route path="/login" element={<StaffLogin />} />
            <Route path="/citizen/login" element={<CitizenLogin />} />
            <Route path="/citizen/signup" element={<CitizenSignup />} />
            <Route path="/admin" element={<AdminPortal />} />
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/volunteer" element={<VolunteerPortal />} />
            <Route path="/citizen" element={<CitizenPortal />} />
            <Route path="/report" element={<ReportSubmission />} />
            <Route path="/register" element={<VolunteerRegistration />} />
            <Route path="/volunteers" element={<VolunteerManagement />} />
            <Route path="/match/:reportId" element={<MatchingPanel />} />
            <Route path="/impact-map" element={<ImpactMap />} />
            <Route path="/route-planner" element={<RoutePlanner />} />
            <Route path="/auto-planner" element={<AutoPlanner />} />
          </Routes>
        </main>
        <footer className="bg-white border-t border-slate-200 py-6 mt-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-slate-500 text-sm">© 2026 Saathi – Smart Resource Allocation System</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
