import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const LandingNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`fixed top-4 left-4 right-4 z-50 transition-all duration-500 ${
      scrolled ? 'bg-slate-950/80 backdrop-blur-xl border border-white/10 shadow-glow-primary' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-white text-slate-950 rounded-none flex items-center justify-center font-black text-xl shadow-xl group-hover:bg-primary-500 group-hover:text-white transition-all duration-300">
              ✈
            </div>
            <span className="font-display font-black text-xl md:text-2xl tracking-tighter text-white uppercase italic hidden sm:block">TravelX <span className="text-primary-500">.</span></span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-2">
            {['Features', 'Destinations','Guides'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="nav-link"
              >
                {item}
              </a>
            ))}
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className="btn-ghost">Login</Link>
            <Link to="/signup" className="btn-primary py-2 px-6">Get Started</Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all outline-none"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <div className="w-6 h-5 flex flex-col justify-between">
              <span className={`block h-0.5 bg-current transition-all duration-300 origin-left ${mobileOpen ? 'rotate-45 translate-x-1' : ''}`} />
              <span className={`block h-0.5 bg-current transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 bg-current transition-all duration-300 origin-left ${mobileOpen ? '-rotate-45 translate-x-1' : ''}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-slate-950/95 backdrop-blur-2xl border-t border-slate-900 overflow-hidden"
          >
            <div className="px-6 py-8 space-y-4">
              {['Features', 'Destinations', 'Guides'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="block text-lg font-display font-semibold text-slate-400 hover:text-white transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  {item}
                </a>
              ))}
              <div className="pt-6 grid grid-cols-1 gap-4">
                <Link
                  to="/login"
                  className="flex items-center justify-center h-14 text-slate-300 border border-slate-800 rounded-2xl hover:bg-slate-900 transition-colors font-semibold"
                  onClick={() => setMobileOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="btn-primary h-14 rounded-2xl font-bold"
                  onClick={() => setMobileOpen(false)}
                >
                  Get Started Free
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default LandingNavbar;
