import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import TopBar from './components/layout/TopBar';
import BottomNav from './components/layout/BottomNav';
import SideNav from './components/layout/SideNav';
import SkeletonCard from './components/ui/SkeletonCard';
import { getSession } from './utils/roleAuth';
import { getActiveRole } from './utils/roleSwitch';

// Lazy load pages
const Landing = React.lazy(() => import('./pages/Landing'));
const StaffLogin = React.lazy(() => import('./pages/StaffLogin'));
const VolunteerLogin = React.lazy(() => import('./pages/VolunteerLogin'));
const VolunteerSignup = React.lazy(() => import('./pages/VolunteerSignup'));
const NgoRegister = React.lazy(() => import('./pages/NgoRegister'));
const CitizenLogin = React.lazy(() => import('./pages/CitizenLogin'));
const CitizenSignup = React.lazy(() => import('./pages/CitizenSignup'));
const AdminPortal = React.lazy(() => import('./pages/AdminPortal'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const AdminEvents = React.lazy(() => import('./pages/AdminEvents'));
const VolunteerPortal = React.lazy(() => import('./pages/VolunteerPortal'));
const VolunteerTasks = React.lazy(() => import('./pages/VolunteerTasks'));
const CitizenPortal = React.lazy(() => import('./pages/CitizenPortal'));
const ReportSubmission = React.lazy(() => import('./pages/ReportSubmission'));
const VolunteerRegistration = React.lazy(() => import('./pages/VolunteerRegistration'));
const VolunteerManagement = React.lazy(() => import('./pages/VolunteerManagement'));
const MatchingPanel = React.lazy(() => import('./pages/MatchingPanel'));
const ImpactMap = React.lazy(() => import('./pages/ImpactMap'));
const RoutePlanner = React.lazy(() => import('./pages/RoutePlanner'));
const AutoPlanner = React.lazy(() => import('./pages/AutoPlanner'));
const ReportTracking = React.lazy(() => import('./pages/ReportTracking'));
const EmergencyAlert = React.lazy(() => import('./pages/EmergencyAlert'));

const ProtectedRoute = ({ children, allowedRoles }) => {
  const session = getSession();
  const activeRole = getActiveRole(session);
  if (!session) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(activeRole)) return <Navigate to="/" replace />;
  return children;
};

// List of paths that are considered "landing/auth" pages (no sidebar/topbar)
const AUTH_PATHS = ['/', '/login', '/volunteer/login', '/volunteer/signup', '/register', '/citizen/login', '/citizen/signup', '/ngo/register'];

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing />} />

        {/* Auth Routes */}
        <Route path="/login" element={<StaffLogin />} />
        <Route path="/volunteer/login" element={<VolunteerLogin />} />
        <Route path="/volunteer/signup" element={<VolunteerSignup />} />
        <Route path="/ngo/register" element={<NgoRegister />} />
        <Route path="/citizen/login" element={<CitizenLogin />} />
        <Route path="/citizen/signup" element={<CitizenSignup />} />
        <Route path="/register" element={<VolunteerRegistration />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminPortal /></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><Dashboard /></ProtectedRoute>} />
        <Route path="/admin/events" element={<ProtectedRoute allowedRoles={['admin']}><AdminEvents /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><AdminPortal /></ProtectedRoute>} />
        <Route path="/admin/volunteers" element={<ProtectedRoute allowedRoles={['admin']}><AdminPortal /></ProtectedRoute>} />
        <Route path="/admin/planner" element={<ProtectedRoute allowedRoles={['admin']}><AdminPortal /></ProtectedRoute>} />
        <Route path="/volunteers" element={<ProtectedRoute allowedRoles={['admin']}><VolunteerManagement /></ProtectedRoute>} />
        <Route path="/match/:reportId" element={<ProtectedRoute allowedRoles={['admin']}><MatchingPanel /></ProtectedRoute>} />
        <Route path="/auto-planner" element={<ProtectedRoute allowedRoles={['admin']}><AutoPlanner /></ProtectedRoute>} />
        
        {/* Volunteer Routes */}
        <Route path="/volunteer" element={<ProtectedRoute allowedRoles={['volunteer']}><VolunteerPortal /></ProtectedRoute>} />
        <Route path="/volunteer/tasks" element={<ProtectedRoute allowedRoles={['volunteer']}><VolunteerTasks /></ProtectedRoute>} />
        <Route path="/volunteer/reports" element={<ProtectedRoute allowedRoles={['volunteer']}><VolunteerPortal /></ProtectedRoute>} />
        <Route path="/route-planner" element={<ProtectedRoute allowedRoles={['admin', 'volunteer']}><RoutePlanner /></ProtectedRoute>} />
        
        {/* Citizen Routes */}
        <Route path="/citizen" element={<ProtectedRoute allowedRoles={['citizen']}><CitizenPortal /></ProtectedRoute>} />
        <Route path="/report" element={<ProtectedRoute allowedRoles={['citizen']}><ReportSubmission /></ProtectedRoute>} />
        <Route path="/track" element={<ProtectedRoute allowedRoles={['citizen']}><ReportTracking /></ProtectedRoute>} />
        <Route path="/track/:reportId" element={<ProtectedRoute allowedRoles={['citizen']}><ReportTracking /></ProtectedRoute>} />
        <Route path="/emergency" element={<ProtectedRoute allowedRoles={['citizen', 'volunteer']}><EmergencyAlert /></ProtectedRoute>} />
        
        {/* Shared/Other */}
        <Route path="/impact-map" element={<ProtectedRoute><ImpactMap /></ProtectedRoute>} />
      </Routes>
    </AnimatePresence>
  );
}

function Layout() {
  const session = getSession();
  const location = useLocation();
  const isLanding = AUTH_PATHS.includes(location.pathname);
  
  return (
    <div className={`min-h-screen bg-warm-50 text-slate-800 font-body ${!isLanding && session ? 'md:pl-60' : ''}`}>
      {!isLanding && <TopBar />}
      {!isLanding && session && <SideNav />}
      
      <main className={`relative ${!isLanding ? 'page-content safe-bottom pt-14' : ''}`}>
        <Suspense fallback={<div className="p-4"><SkeletonCard /></div>}>
          <AnimatedRoutes />
        </Suspense>
      </main>
      
      {!isLanding && <BottomNav />}
      <Toaster position="top-center" toastOptions={{ duration: 3000, style: { borderRadius: '9999px', background: '#333', color: '#fff' } }} />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;