import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/explore', label: 'Explore' },
    { to: '/guides', label: 'Guides' },
    ...(user ? [
      { to: '/create-trip', label: 'Create Trip' },
      { to: '/trips', label: 'My Trips' },
      { to: '/chatbot', label: 'AI Chat' },
    ] : []),
    ...(user?.isAdmin ? [{ to: '/admin', label: 'Admin' }] : []),
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">✈</div>
            <span className="font-bold text-lg gradient-text hidden sm:block">AI Tourism</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(link.to)
                    ? 'bg-primary-500/20 text-primary-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 rounded-xl px-3 py-2 transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-xs font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm hidden sm:block text-slate-300">{user.name?.split(' ')[0]}</span>
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
                    <Link to="/profile" className="block px-4 py-3 text-sm text-slate-300 hover:bg-slate-700" onClick={() => setProfileOpen(false)}>👤 Profile</Link>
                    <Link to="/trips" className="block px-4 py-3 text-sm text-slate-300 hover:bg-slate-700" onClick={() => setProfileOpen(false)}>🗺️ My Trips</Link>
                    {user.isAdmin && <Link to="/admin" className="block px-4 py-3 text-sm text-slate-300 hover:bg-slate-700" onClick={() => setProfileOpen(false)}>⚙️ Admin</Link>}
                    <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-slate-700">🚪 Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-secondary py-2 px-4 text-sm">Login</Link>
                <Link to="/signup" className="btn-primary py-2 px-4 text-sm">Sign Up</Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button className="md:hidden p-2 text-slate-400 hover:text-white" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden py-3 border-t border-slate-800">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="block px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {!user && (
              <>
                <Link to="/login" className="block px-4 py-3 text-slate-400 hover:text-white" onClick={() => setMobileOpen(false)}>Login</Link>
                <Link to="/signup" className="block px-4 py-3 text-primary-400 font-semibold" onClick={() => setMobileOpen(false)}>Sign Up</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
