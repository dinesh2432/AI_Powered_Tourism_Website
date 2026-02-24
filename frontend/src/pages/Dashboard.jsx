import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { MapPin, Home, Plane, User, Compass, LogOut, Menu, X } from 'lucide-react';

const Dashboard = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/', icon: <Home size={18} /> },
    { name: 'My Trip', path: '/trips', icon: <Plane size={18} /> },
    { name: 'Explore', path: '/explore', icon: <Compass size={18} /> },
    { name: 'Profile', path: '/profile', icon: <User size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-[#05070a] text-white font-sans">
      {/* --- TOP NAVBAR --- */}
      <nav className="fixed top-0 w-full z-[100] bg-[#0c0f14]/90 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="bg-cyan-500 p-1.5 rounded-lg text-black">
              <MapPin size={20} />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase">TRAVELX</span>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold transition-all ${
                  location.pathname === link.path ? 'text-cyan-400' : 'text-gray-400 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <button onClick={() => navigate('/login')} className="text-gray-400 hover:text-red-400 transition-colors">
               <LogOut size={18} />
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <button 
            className="md:hidden p-2 text-gray-400 hover:text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* --- MOBILE DROPDOWN MENU --- */}
        <div className={`md:hidden absolute top-full left-0 w-full bg-[#0c0f14] border-b border-white/5 transition-all duration-300 ease-in-out overflow-hidden ${
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="flex flex-col p-6 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-4 p-4 rounded-2xl text-sm font-bold uppercase tracking-widest ${
                  location.pathname === link.path ? 'bg-cyan-500 text-black' : 'bg-white/5 text-gray-400'
                }`}
              >
                {link.icon} {link.name}
              </Link>
            ))}
            <button className="flex items-center gap-4 p-4 rounded-2xl bg-red-500/10 text-red-500 text-sm font-bold uppercase tracking-widest">
               <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <div className="pt-28 pb-12 px-6 max-w-7xl mx-auto">
        <Outlet /> 
      </div>
    </div>
  );
};

export default Dashboard;