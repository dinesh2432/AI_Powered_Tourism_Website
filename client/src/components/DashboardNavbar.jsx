import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSidebar } from '../context/SidebarContext';
import NotificationBell from './NotificationBell';

const DashboardNavbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { mobileOpen, setMobileOpen } = useSidebar();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setProfileOpen(false);
    setMobileOpen(false);
  };

  const planBadgeColor = {
    FREE: 'bg-slate-500/20 text-slate-400',
    PRO: 'bg-sky-500/20 text-sky-400',
    PREMIUM: 'bg-amber-500/20 text-amber-400',
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center"
      style={{
        background: 'var(--navbar-bg)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="max-w-[1600px] mx-auto w-full px-4 sm:px-6">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg transition-transform duration-300 group-hover:scale-110"
              style={{ background: `rgb(var(--accent))` }}
            >
              ✈
            </div>
            <span
              className="font-display font-black text-xl tracking-tight hidden sm:block"
              style={{ color: 'var(--text-primary)' }}
            >
              <span className="uppercase">Travel</span><span style={{ color: 'rgb(var(--accent))' }}>X</span>
            </span>
          </Link>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">

            {/* Notification Bell */}
            <NotificationBell />

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{
                background: 'var(--bg-glass)',
                border: '1px solid var(--border-strong)',
                color: 'var(--text-secondary)',
              }}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>

            {/* Plan Badge */}
            <span
              className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${planBadgeColor[user?.subscription || 'FREE']}`}
            >
              {user?.subscription || 'FREE'}
            </span>

            {/* Divider */}
            <div
              className="h-7 w-px hidden sm:block"
              style={{ background: 'var(--border-strong)' }}
            />

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl transition-all duration-200"
                style={{
                  background: profileOpen ? 'var(--bg-hover)' : 'transparent',
                  border: '1px solid var(--border)',
                }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold overflow-hidden"
                  style={{ background: `rgb(var(--accent))` }}
                >
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user?.name?.charAt(0).toUpperCase()
                  )}
                </div>
                <span
                  className="text-sm font-semibold hidden md:block max-w-[100px] truncate"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {user?.name?.split(' ')[0]}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`}
                  style={{ color: 'var(--text-muted)' }}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className="absolute right-0 mt-2 w-56 rounded-2xl shadow-2xl overflow-hidden z-50 py-1"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-strong)',
                    }}
                  >
                    {/* User info */}
                    <div
                      className="px-4 py-3 border-b"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                        {user?.name}
                      </p>
                      <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {user?.email}
                      </p>
                    </div>

                    <div className="p-1.5 space-y-0.5">
                      {[
                        { to: '/profile', icon: '👤', label: 'My Profile' },
                        { to: '/trips', icon: '🗺️', label: 'My Trips' },
                        { to: '/pricing', icon: '💳', label: 'Subscription Plans' },
                        ...(user?.isAdmin ? [{ to: '/admin', icon: '⚙️', label: 'Admin Panel' }] : []),
                      ].map((item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
                          style={{ color: 'var(--text-secondary)' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                          onClick={() => setProfileOpen(false)}
                        >
                          <span className="text-base">{item.icon}</span>
                          {item.label}
                        </Link>
                      ))}
                    </div>

                    <div className="p-1.5 border-t" style={{ borderColor: 'var(--border)' }}>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-red-400 hover:bg-red-500/10"
                      >
                        <span className="text-base">🚪</span>
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl transition-all"
              style={{
                background: 'var(--bg-glass)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
              }}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <div className="w-5 flex flex-col gap-1.5">
                <span className={`block h-0.5 rounded-full bg-current transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-2' : 'w-full'}`} />
                <span className={`block h-0.5 rounded-full bg-current transition-all duration-200 ${mobileOpen ? 'opacity-0' : 'w-2/3'}`} />
                <span className={`block h-0.5 rounded-full bg-current transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-2' : 'w-full'}`} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer is handled by Sidebar component (left overlay) */}
    </nav>
  );
};

export default DashboardNavbar;
