import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  HomeIcon,
  MapIcon,
  FilmIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  SparklesIcon,
  PlusCircleIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  MapIcon as MapIconSolid,
  FilmIcon as FilmIconSolid,
  UserGroupIcon as UsersIconSolid,
  ChatBubbleLeftRightIcon as ChatIconSolid,
  UserCircleIcon as UserIconSolid,
  Cog6ToothIcon as CogIconSolid,
  PlusCircleIcon as PlusIconSolid,
} from '@heroicons/react/24/solid';

const menuGroups = [
  {
    label: 'Menu',
    items: [
      { to: '/dashboard', label: 'Dashboard', Icon: HomeIcon, IconSolid: HomeIconSolid },
      { to: '/create-trip', label: 'Create Trip', Icon: PlusCircleIcon, IconSolid: PlusIconSolid },
      { to: '/trips', label: 'My Trips', Icon: MapIcon, IconSolid: MapIconSolid },
    ],
  },
  {
    label: 'Discover',
    items: [
      { to: '/explore', label: 'Explore', Icon: FilmIcon, IconSolid: FilmIconSolid },
      { to: '/guides', label: 'Guides', Icon: UserGroupIcon, IconSolid: UsersIconSolid },
      { to: '/chatbot', label: 'AI Chat', Icon: ChatBubbleLeftRightIcon, IconSolid: ChatIconSolid },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/profile', label: 'Profile', Icon: UserCircleIcon, IconSolid: UserIconSolid },
    ],
  },
];

const NavItem = ({ to, label, Icon, IconSolid, isActive }) => {
  const ActiveIcon = isActive ? IconSolid : Icon;
  return (
    <Link
      to={to}
      className={`relative flex items-center gap-4 px-6 py-4 transition-all duration-300 group overflow-hidden ${
        isActive
          ? 'bg-white/5 text-white border-r-2 border-primary-500'
          : 'text-slate-500 hover:text-white hover:bg-white/5'
      }`}
    >
      <ActiveIcon
        className={`w-4 h-4 shrink-0 transition-transform duration-300 group-hover:rotate-6 ${
          isActive ? 'text-primary-400' : 'text-slate-600 group-hover:text-white'
        }`}
      />
      <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-white' : ''}`}>
        {label}
      </span>
      {isActive && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="ml-auto w-1 h-1 bg-primary-500 shadow-glow-primary" 
        />
      )}
    </Link>
  );
};

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-72 z-40 bg-slate-950 border-r border-white/5 shadow-2xl overflow-y-auto no-scrollbar">
      {/* Brand logo container */}
      <div className="p-10 pb-6">
        {/* <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-white text-slate-950 rounded-none flex items-center justify-center font-black text-lg transition-all duration-300">
            ✈
          </div>
          <span className="font-display font-black text-xl tracking-tighter text-white uppercase italic">WanderAI</span>
        </Link> */}
      </div>

      {/* Plan a Trip CTA */}
      <div className="px-6 py-8">
        <Link
          to="/create-trip"
          className="btn-primary w-full"
        >
          <PlusCircleIcon className="w-4 h-4" />
          <span>Launch Mission</span>
        </Link>
      </div>

      {/* Navigation groups */}
      <nav className="flex-1 px-4 py-6 space-y-10">
        {menuGroups.map((group) => (
          <div key={group.label}>
            <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em] px-4 mb-4">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavItem key={item.to} {...item} isActive={isActive(item.to)} />
              ))}
            </div>
          </div>
        ))}

        {/* Admin link */}
        {user?.isAdmin && (
          <div>
            <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em] px-4 mb-4">
              Control
            </p>
            <NavItem
              to="/admin"
              label="Admin Operations"
              Icon={Cog6ToothIcon}
              IconSolid={CogIconSolid}
              isActive={isActive('/admin')}
            />
          </div>
        )}
      </nav>

      {/* User info */}
      <div className="p-6 mt-auto">
        <div className="glass-dark border border-white/5 rounded-[24px] p-4 group cursor-pointer hover:bg-white/5 transition-all duration-300">
           <Link to="/profile" className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-[16px] bg-gradient-to-br from-primary-400 to-secondary-600 p-[2px] shadow-glow-primary group-hover:rotate-6 transition-all duration-500">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-white font-black text-lg">
                    {user?.name?.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-black truncate leading-tight tracking-tight uppercase">
                  {user?.name}
                </p>
                <p className="text-slate-500 text-[10px] font-bold truncate tracking-wider">MEMBER ID #0429</p>
              </div>
              <div className="text-slate-600 group-hover:text-primary-400 transition-colors">→</div>
           </Link>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
