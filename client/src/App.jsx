import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import LandingNavbar from './components/LandingNavbar';
import DashboardNavbar from './components/DashboardNavbar';
import Sidebar from './components/Sidebar';

// Pages
// auth_pages
import HomePage from './pages/auth_pages/HomePage';
import LoginPage from './pages/auth_pages/LoginPage';
import SignupPage from './pages/auth_pages/SignupPage';
import ForgotPasswordPage from './pages/auth_pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth_pages/ResetPasswordPage';

// user_pages

import DashboardPage from './pages/user_visual_pages/DashboardPage';
import ChatPage from './pages/user_visual_pages/ChatPage';
import ChatbotPage from './pages/user_visual_pages/ChatbotPage';

// trip_pages
import CreateTripPage from './pages/trip_pages/CreateTripPage';
import MyTripsPage from './pages/user_visual_pages/MyTripsPage';
import ProfilePage from './pages/user_visual_pages/ProfilePage';
import TripDetailPage from './pages/user_visual_pages/TripDetailPage';

// user_visual_pages
import ExplorePage from './pages/user_visual_pages/ExplorePage';
import GuideMarketplacePage from './pages/user_visual_pages/GuideMarketplacePage';
import SharedTripPage from './pages/user_visual_pages/SharedTripPage';
import PricingPage from './pages/user_visual_pages/PricingPage';

// admin_pages
import AdminDashboardPage from './pages/admin_pages/AdminDashboardPage';

// Route guards
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !user.isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

// Layouts
const LandingLayout = ({ children }) => (
  <div className="min-h-screen bg-slate-950">
    <LandingNavbar />
    {children}
  </div>
);

const AuthLayout = ({ children }) => (
  <div className="min-h-screen bg-slate-950">
    {children}
  </div>
);

const DashboardLayout = ({ children }) => (
  <div className="min-h-screen bg-slate-950">
    <DashboardNavbar />
    <Sidebar />
    <main className="md:pl-72 pt-4">{children}</main>
  </div>
);

function App() {
  const { user } = useAuth();

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: '#1e293b', color: '#fff', border: '1px solid #334155', borderRadius: '12px' },
          success: { iconTheme: { primary: '#667eea', secondary: '#fff' } },
        }}
      />
      <Routes>
        {/* Landing — public only (redirect auth users to dashboard) */}
        <Route path="/" element={
          user ? <Navigate to="/dashboard" replace /> :
          <LandingLayout><HomePage /></LandingLayout>
        } />

        {/* Auth pages — redirect if already logged in */}
        <Route path="/login" element={
          <PublicOnlyRoute>
            <AuthLayout><LoginPage /></AuthLayout>
          </PublicOnlyRoute>
        } />
        <Route path="/signup" element={
          <PublicOnlyRoute>
            <AuthLayout><SignupPage /></AuthLayout>
          </PublicOnlyRoute>
        } />
        <Route path="/forgot-password" element={
          <AuthLayout><ForgotPasswordPage /></AuthLayout>
        } />
        <Route path="/reset-password/:token" element={
          <AuthLayout><ResetPasswordPage /></AuthLayout>
        } />

        {/* Dashboard & protected routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout><DashboardPage /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/create-trip" element={
          <ProtectedRoute>
            <DashboardLayout><CreateTripPage /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/trips" element={
          <ProtectedRoute>
            <DashboardLayout><MyTripsPage /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/trips/:id" element={
          <ProtectedRoute>
            <DashboardLayout><TripDetailPage /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/explore" element={
          <ProtectedRoute>
            <DashboardLayout><ExplorePage /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/guides" element={
          <ProtectedRoute>
            <DashboardLayout><GuideMarketplacePage /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/chat/:userId" element={
          <ProtectedRoute>
            <DashboardLayout><ChatPage /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/chatbot" element={
          <ProtectedRoute>
            <DashboardLayout><ChatbotPage /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <DashboardLayout><ProfilePage /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute adminOnly>
            <DashboardLayout><AdminDashboardPage /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Shared trip – public, no auth required */}
        <Route path="/trip/share/:token" element={<SharedTripPage />} />

        {/* Pricing – protected */}
        <Route path="/pricing" element={
          <ProtectedRoute>
            <DashboardLayout><PricingPage /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
