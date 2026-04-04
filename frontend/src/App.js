import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ReportSubmission from './pages/ReportSubmission';
import VolunteerRegistration from './pages/VolunteerRegistration';
import MatchingPanel from './pages/MatchingPanel';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/report" element={<ReportSubmission />} />
            <Route path="/register" element={<VolunteerRegistration />} />
            <Route path="/match/:reportId" element={<MatchingPanel />} />
          </Routes>
        </main>
        <footer className="bg-white border-t border-slate-200 py-6 mt-12">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-slate-500 text-sm">© 2026 VolunteerIQ – Smart Resource Allocation System</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
