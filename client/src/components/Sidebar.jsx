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
  PlusCircleIcon,
  CreditCardIcon,
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
  CreditCardIcon as CreditIconSolid,
} from '@heroicons/react/24/solid';

const menuGroups = [
  {
    label: 'Main',
    items: [
      { to: '/dashboard',    label: 'Dashboard',        Icon: HomeIcon,                   IconSolid: HomeIconSolid },
      { to: '/create-trip',  label: 'Plan a Trip',      Icon: PlusCircleIcon,             IconSolid: PlusIconSolid },
      { to: '/trips',        label: 'My Trips',         Icon: MapIcon,                    IconSolid: MapIconSolid },
    ],
  },
  {
    label: 'Discover',
    items: [
      { to: '/explore',      label: 'Explore Videos',   Icon: FilmIcon,                   IconSolid: FilmIconSolid },
      { to: '/guides',       label: 'Local Guides',     Icon: UserGroupIcon,              IconSolid: UsersIconSolid },
      { to: '/chatbot',      label: 'AI Travel Chat',   Icon: ChatBubbleLeftRightIcon,    IconSolid: ChatIconSolid },
      { to: '/pricing',      label: 'Subscription Plans', Icon: CreditCardIcon,           IconSolid: CreditIconSolid },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/profile',      label: 'My Profile',       Icon: UserCircleIcon,             IconSolid: UserIconSolid },
    ],
  },
];

const NavItem = ({ to, label, Icon, IconSolid, isActive }) => {
  const ActiveIcon = isActive ? IconSolid : Icon;
  return (
    <Link
      to={to}
      className="relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group"
      style={{
        background: isActive ? `rgba(var(--accent), 0.1)` : 'transparent',
        color: isActive ? `rgb(var(--accent))` : 'var(--text-muted)',
        borderLeft: isActive ? `2px solid rgb(var(--accent))` : '2px solid transparent',
      }}
      onMouseEnter={e => {
        if (!isActive) {
          e.currentTarget.style.background = 'var(--bg-hover)';
          e.currentTarget.style.color = 'var(--text-primary)';
        }
      }}
      onMouseLeave={e => {
        if (!isActive) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'var(--text-muted)';
        }
      }}
    >
      <ActiveIcon className="w-4 h-4 shrink-0" />
      <span className="text-sm font-medium truncate">{label}</span>
      {isActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="ml-auto w-1.5 h-1.5 rounded-full"
          style={{ background: `rgb(var(--accent))` }}
        />
      )}
    </Link>
  );
};

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const isActive = (path) => location.pathname === path;

  const plan = user?.subscription || 'FREE';
  const planStyle = {
    FREE: { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
    PRO: { color: 'rgb(var(--accent))', bg: 'rgba(var(--accent),0.1)' },
    PREMIUM: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  };

  return (
    <aside
      className="hidden md:flex flex-col fixed left-0 top-16 bottom-0 w-72 z-40 overflow-y-auto no-scrollbar"
      style={{
        background: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* Create Trip CTA */}
      <div className="p-5">
        <Link to="/create-trip" className="btn-primary w-full h-11 gap-2">
          <PlusCircleIcon className="w-4 h-4" />
          Plan a New Trip
        </Link>
      </div>

      {/* Navigation groups */}
      <nav className="flex-1 px-3 space-y-6">
        {menuGroups.map((group) => (
          <div key={group.label}>
            <p
              className="text-xs font-semibold uppercase tracking-wider px-4 mb-2"
              style={{ color: 'var(--text-muted)' }}
            >
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavItem key={item.to} {...item} isActive={isActive(item.to)} />
              ))}
            </div>
          </div>
        ))}

        {/* Admin link */}
        {user?.isAdmin && (
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-wider px-4 mb-2"
              style={{ color: 'var(--text-muted)' }}
            >
              Admin
            </p>
            <NavItem
              to="/admin"
              label="Admin Panel"
              Icon={Cog6ToothIcon}
              IconSolid={CogIconSolid}
              isActive={isActive('/admin')}
            />
          </div>
        )}
      </nav>

      {/* User card at bottom */}
      <div className="p-4 mt-auto">
        <Link
          to="/profile"
          className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group"
          style={{ border: '1px solid var(--border)' }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'var(--bg-hover)';
            e.currentTarget.style.borderColor = 'var(--border-strong)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = 'var(--border)';
          }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
            style={{ background: `rgb(var(--accent))` }}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
              {user?.name}
            </p>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ background: planStyle[plan].bg, color: planStyle[plan].color }}
            >
              {plan}
            </span>
          </div>
          <svg className="w-4 h-4 opacity-40" style={{ color: 'var(--text-secondary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
