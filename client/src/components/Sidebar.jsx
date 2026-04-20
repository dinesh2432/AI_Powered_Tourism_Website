import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
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
  ChevronLeftIcon,
  ChevronRightIcon,
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
      { to: '/dashboard',   label: 'Dashboard',          Icon: HomeIcon,                IconSolid: HomeIconSolid },
      { to: '/create-trip', label: 'Plan a Trip',         Icon: PlusCircleIcon,          IconSolid: PlusIconSolid },
      { to: '/trips',       label: 'My Trips',            Icon: MapIcon,                 IconSolid: MapIconSolid },
    ],
  },
  {
    label: 'Discover',
    items: [
      { to: '/explore',     label: 'Explore Videos',      Icon: FilmIcon,                IconSolid: FilmIconSolid },
      { to: '/guides',      label: 'Local Guides',         Icon: UserGroupIcon,           IconSolid: UsersIconSolid },
      { to: '/chatbot',     label: 'AI Travel Chat',       Icon: ChatBubbleLeftRightIcon, IconSolid: ChatIconSolid },
      { to: '/pricing',     label: 'Subscription Plans',   Icon: CreditCardIcon,          IconSolid: CreditIconSolid },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/profile',     label: 'My Profile',           Icon: UserCircleIcon,          IconSolid: UserIconSolid },
    ],
  },
];

/* ── Single nav item ── */
const NavItem = ({ to, label, Icon, IconSolid, isActive, collapsed, onClick }) => {
  const ActiveIcon = isActive ? IconSolid : Icon;
  return (
    <Link
      to={to}
      onClick={onClick}
      title={collapsed ? label : undefined}
      className="relative flex items-center rounded-xl transition-all duration-200 group overflow-hidden"
      style={{
        gap: collapsed ? 0 : '0.75rem',
        padding: collapsed ? '0.75rem' : '0.75rem 1rem',
        justifyContent: collapsed ? 'center' : 'flex-start',
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

      {/* Label — hidden when collapsed */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.span
            key="label"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="text-sm font-medium truncate overflow-hidden whitespace-nowrap"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Active dot */}
      {isActive && !collapsed && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="ml-auto w-1.5 h-1.5 rounded-full shrink-0"
          style={{ background: `rgb(var(--accent))` }}
        />
      )}

      {/* Collapsed tooltip */}
      {collapsed && (
        <span
          className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50"
          style={{
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-strong)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          }}
        >
          {label}
        </span>
      )}
    </Link>
  );
};

/* ── Sidebar inner content (shared between desktop and mobile) ── */
const SidebarContent = ({ collapsed, closeMobile }) => {
  const location = useLocation();
  const { user } = useAuth();
  const { setCollapsed } = useSidebar();

  const isActive = path => location.pathname === path;

  const plan = user?.subscription || 'FREE';
  const planStyle = {
    FREE:    { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
    PRO:     { color: 'rgb(var(--accent))', bg: 'rgba(var(--accent),0.1)' },
    PREMIUM: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  };

  // closeMobile is defined only in mobile drawer; on desktop it's undefined
  const handleNavClick = () => closeMobile?.();

  return (
    <div className="flex flex-col h-full">

      {/* ── Collapse toggle (desktop only) ── */}
      {closeMobile === undefined && (
        <div
          className="flex items-center px-3 pt-3 pb-1"
          style={{ justifyContent: collapsed ? 'center' : 'flex-end' }}
        >
          <button
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 hover:scale-110"
            style={{
              background: 'var(--bg-hover)',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
            }}
          >
            {collapsed
              ? <ChevronRightIcon className="w-4 h-4" />
              : <ChevronLeftIcon  className="w-4 h-4" />
            }
          </button>
        </div>
      )}

      {/* Plan a Trip CTA */}
      <div className="p-3">
        {collapsed ? (
          <Link
            to="/create-trip"
            onClick={handleNavClick}
            title="Plan a New Trip"
            className="w-10 h-10 mx-auto flex items-center justify-center rounded-xl transition-all duration-200 hover:scale-110"
            style={{ background: `rgb(var(--accent))`, color: '#fff' }}
          >
            <PlusIconSolid className="w-5 h-5" />
          </Link>
        ) : (
          <Link
            to="/create-trip"
            onClick={handleNavClick}
            className="btn-primary w-full h-11 gap-2"
          >
            <PlusCircleIcon className="w-4 h-4" />
            Plan a New Trip
          </Link>
        )}
      </div>

      {/* Navigation groups */}
      <nav className="flex-1 px-2 space-y-5 overflow-y-auto no-scrollbar py-2">
        {menuGroups.map(group => (
          <div key={group.label}>
            {/* Group label — hidden when collapsed */}
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.p
                  key="group-label"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="text-xs font-semibold uppercase tracking-wider px-3 mb-1.5"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {group.label}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Divider when collapsed */}
            {collapsed && (
              <div className="mx-auto mb-2 h-px w-6" style={{ background: 'var(--border-strong)' }} />
            )}

            <div className="space-y-0.5">
              {group.items.map(item => (
                <NavItem
                  key={item.to}
                  {...item}
                  isActive={isActive(item.to)}
                  collapsed={collapsed}
                  onClick={handleNavClick}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Admin */}
        {user?.isAdmin && (
          <div>
            {!collapsed && (
              <p
                className="text-xs font-semibold uppercase tracking-wider px-3 mb-1.5"
                style={{ color: 'var(--text-muted)' }}
              >
                Admin
              </p>
            )}
            {collapsed && (
              <div className="mx-auto mb-2 h-px w-6" style={{ background: 'var(--border-strong)' }} />
            )}
            <NavItem
              to="/admin"
              label="Admin Panel"
              Icon={Cog6ToothIcon}
              IconSolid={CogIconSolid}
              isActive={isActive('/admin')}
              collapsed={collapsed}
              onClick={handleNavClick}
            />
          </div>
        )}
      </nav>

      {/* User card at bottom */}
      <div className="p-3 mt-auto">
        {collapsed ? (
          <Link
            to="/profile"
            onClick={handleNavClick}
            title={user?.name}
            className="w-10 h-10 mx-auto flex items-center justify-center rounded-xl text-white font-bold text-sm transition-all duration-200 hover:scale-110 overflow-hidden"
            style={{ background: `rgb(var(--accent))` }}
          >
            {user?.profileImage ? (
              <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user?.name?.charAt(0).toUpperCase()
            )}
          </Link>
        ) : (
          <Link
            to="/profile"
            onClick={handleNavClick}
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
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0 overflow-hidden"
              style={{ background: `rgb(var(--accent))` }}
            >
              {user?.profileImage ? (
                <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0).toUpperCase()
              )}
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
            <svg
              className="w-4 h-4 opacity-40"
              style={{ color: 'var(--text-secondary)' }}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>
    </div>
  );
};

/* ── Main Sidebar component ── */
const Sidebar = () => {
  const { mobileOpen, setMobileOpen, collapsed } = useSidebar();

  const sidebarWidth = collapsed ? 72 : 288; // 18rem → 72px when collapsed

  return (
    <>
      {/* ── DESKTOP sidebar ── */}
      <motion.aside
        animate={{ width: sidebarWidth }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="hidden md:flex flex-col fixed left-0 top-16 bottom-0 z-40 overflow-visible"
        style={{
          background: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--border)',
          width: sidebarWidth,
        }}
      >
        <SidebarContent collapsed={collapsed} />
      </motion.aside>

      {/* ── MOBILE overlay ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }}
              onClick={() => setMobileOpen(false)}
            />

            {/* Drawer */}
            <motion.aside
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className="md:hidden fixed left-0 top-0 bottom-0 z-50 w-72 flex flex-col"
              style={{
                background: 'var(--sidebar-bg)',
                borderRight: '1px solid var(--border)',
              }}
            >
              {/* Mobile header */}
              <div
                className="flex items-center justify-between px-4 py-4"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg"
                    style={{ background: `rgb(var(--accent))` }}
                  >
                    ✈
                  </div>
                  <span
                    className="font-black text-xl tracking-tight"
                    style={{ color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif" }}
                  >
                    <span>Travel</span><span style={{ color: 'rgb(var(--accent))' }}>X</span>
                  </span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
                  style={{
                    background: 'var(--bg-hover)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-muted)',
                  }}
                  aria-label="Close sidebar"
                >
                  ✕
                </button>
              </div>

              {/* Mobile uses non-collapsed layout and has closeMobile callback */}
              <div className="flex-1 overflow-y-auto no-scrollbar">
                <SidebarContent collapsed={false} closeMobile={() => setMobileOpen(false)} />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
