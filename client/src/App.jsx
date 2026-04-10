import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';
import { SidebarProvider, useSidebar } from './context/SidebarContext';
import LandingNavbar from './components/LandingNavbar';
import DashboardNavbar from './components/DashboardNavbar';
import Sidebar from './components/Sidebar';
import ScrollToTop from './components/ScrollToTop';

// Pages — auth
import HomePage from './pages/auth_pages/HomePage';
import LoginPage from './pages/auth_pages/LoginPage';
import SignupPage from './pages/auth_pages/SignupPage';
import ForgotPasswordPage from './pages/auth_pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth_pages/ResetPasswordPage';

// Pages — user
import DashboardPage from './pages/user_visual_pages/DashboardPage';
import ChatPage from './pages/user_visual_pages/ChatPage';
import ChatbotPage from './pages/user_visual_pages/ChatbotPage';
import CreateTripPage from './pages/trip_pages/CreateTripPage';
import MyTripsPage from './pages/user_visual_pages/MyTripsPage';
import ProfilePage from './pages/user_visual_pages/ProfilePage';
import TripDetailPage from './pages/user_visual_pages/TripDetailPage';
import ExplorePage from './pages/user_visual_pages/ExplorePage';
import GuideMarketplacePage from './pages/user_visual_pages/GuideMarketplacePage';
import SharedTripPage from './pages/user_visual_pages/SharedTripPage';
import PricingPage from './pages/user_visual_pages/PricingPage';
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
  <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
    <LandingNavbar />
    {children}
  </div>
);

const AuthLayout = ({ children }) => (
  <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
    {children}
  </div>
);

const DashboardLayout = ({ children }) => {
  const { collapsed } = useSidebar();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <DashboardNavbar />
      <Sidebar />
      {/* Mobile: sidebar is overlay, so no left offset needed */}
      <main
        className="pt-16"
        style={{
          paddingLeft: isDesktop ? (collapsed ? '72px' : '288px') : 0,
          transition: 'padding-left 0.25s ease',
        }}
      >
        {children}
      </main>
    </div>
  );
};

function App() {
  const { user } = useAuth();

  return (
    <SidebarProvider>
      <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-strong)',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: 'rgb(var(--accent))', secondary: '#fff' } },
        }}
      />
      <ScrollToTop />
      <Routes>
        {/* Landing */}
        <Route path="/" element={
          user ? <Navigate to="/dashboard" replace /> :
          <LandingLayout><HomePage /></LandingLayout>
        } />

        {/* Auth pages */}
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

        {/* Protected dashboard routes */}
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
        <Route path="/pricing" element={
          <ProtectedRoute>
            <DashboardLayout><PricingPage /></DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute adminOnly>
            <DashboardLayout><AdminDashboardPage /></DashboardLayout>
          </ProtectedRoute>
        } />

        {/* Public shared trip */}
        <Route path="/trip/share/:token" element={<SharedTripPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </>
    </SidebarProvider>
  );
}

export default App;
