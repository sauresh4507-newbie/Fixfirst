import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, NavLink } from 'react-router-dom';
import {
  Bell, ChevronDown, LogOut, Settings,
  LayoutDashboard, Wrench, User, Zap, Menu, Plus,
  FileSearch, BookOpen, Users, ShieldCheck, AlertCircle, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

/* ── Role-specific quick-nav links shown in the top bar ─────────────────── */
const roleNavLinks = {
  customer: [
    { to: '/dashboard',   label: 'Dashboard',  icon: LayoutDashboard, end: true },
    { to: '/repairs',     label: 'My Repairs', icon: Wrench },
  ],
  vendor: [
    { to: '/vendor',          label: 'Dashboard',  icon: LayoutDashboard, end: true },
    { to: '/vendor/requests', label: 'Requests',   icon: FileSearch },
    { to: '/vendor/bookings', label: 'Bookings',   icon: BookOpen },
  ],
  admin: [
    { to: '/admin',            label: 'Dashboard',  icon: LayoutDashboard, end: true },
    { to: '/admin/users',      label: 'Customers',  icon: Users },
    { to: '/admin/vendors',    label: 'Vendors',    icon: ShieldCheck },
    { to: '/admin/repairs',    label: 'Repairs',    icon: Wrench },
    { to: '/admin/complaints', label: 'Complaints', icon: AlertCircle },
  ],
};

const Navbar = ({ onMenuClick }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [userMenuOpen,  setUserMenuOpen]  = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isLanding = location.pathname === '/';

  useEffect(() => {
    if (!isLanding) return;
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isLanding]);

  useEffect(() => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin')  return '/admin';
    if (user.role === 'vendor') return '/vendor';
    return '/dashboard';
  };

  const publicLinks = [
    { label: 'How it Works', href: '/#how-it-works' },
    { label: 'Services',     href: '/#services' },
    { label: 'FAQ',          href: '/#faq' },
  ];

  const navBg = isLanding && !scrolled
    ? 'bg-transparent border-transparent'
    : 'bg-white/95 backdrop-blur-xl border-surface-border shadow-sm';

  const quickLinks = isAuthenticated && user ? (roleNavLinks[user.role] || []) : [];

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${navBg}`}
      style={{ paddingTop: 'var(--safe-top)' }}
    >
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 gap-4">

          {/* Sidebar toggle — only on authenticated pages with sidebar */}
          {isAuthenticated && onMenuClick && (
            <button
              onClick={onMenuClick}
              className="hidden lg:hidden p-2 rounded-xl hover:bg-surface-tertiary transition-colors text-ink-secondary"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group mr-2">
            <div className="w-8 h-8 rounded-xl bg-brand-gradient flex items-center justify-center shadow-brand group-hover:shadow-brand-lg transition-shadow">
              <Wrench className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[15px] font-bold text-ink tracking-tight">FixFirst</span>
          </Link>

          {/* Desktop: public nav links */}
          {!isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1 flex-1">
              {publicLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm text-ink-secondary hover:text-ink px-3 py-2 rounded-xl hover:bg-surface-tertiary transition-all"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          )}

          {/* Desktop: authenticated role quick-nav */}
          {isAuthenticated && quickLinks.length > 0 && (
            <nav className="hidden lg:flex items-center gap-0.5 flex-1">
              {quickLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `flex items-center gap-2 text-sm px-3.5 py-2 rounded-xl font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 border border-brand-100'
                        : 'text-ink-secondary hover:text-ink hover:bg-surface-tertiary'
                    }`
                  }
                >
                  {({ isActive }) => {
                    const Icon = link.icon;
                    return (
                      <>
                        <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-brand-600' : 'text-ink-tertiary'}`} strokeWidth={2} />
                        {link.label}
                      </>
                    );
                  }}
                </NavLink>
              ))}
            </nav>
          )}

          {/* Spacer when no nav links */}
          {isAuthenticated && quickLinks.length === 0 && <div className="flex-1" />}

          {/* Right side actions */}
          <div className="hidden md:flex items-center gap-2 ml-auto">
            {!isAuthenticated ? (
              <>
                <Link to="/login"    className="btn-ghost  text-sm">Log in</Link>
                <Link to="/register" className="btn-primary text-sm">
                  Get Started <Zap className="w-3.5 h-3.5" />
                </Link>
              </>
            ) : (
              <>
                {/* CTA for customers */}
                {user?.role === 'customer' && (
                  <Link to="/repairs/new" className="btn-primary text-xs py-2 px-3.5 rounded-lg">
                    <Plus className="w-3.5 h-3.5" /> New Request
                  </Link>
                )}

                {/* Notifications */}
                <Link
                  to={getDashboardLink()}
                  className="relative p-2.5 rounded-xl hover:bg-surface-tertiary transition-colors"
                  aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                >
                  <Bell className="w-[18px] h-[18px] text-ink-secondary" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-brand-gradient rounded-full text-white text-[9px] flex items-center justify-center font-bold shadow-brand">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* User avatar dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-xl hover:bg-surface-tertiary transition-colors border border-transparent hover:border-surface-border"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="true"
                  >
                    <Avatar user={user} size="sm" />
                    <span className="text-sm font-medium text-ink max-w-[90px] truncate hidden xl:block">
                      {user?.fullName?.split(' ')[0]}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-ink-tertiary transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-60 bg-white rounded-2xl border border-surface-border shadow-xl z-20 overflow-hidden animate-scale-in">
                        {/* User info header */}
                        <div className="px-4 py-3.5 bg-brand-gradient-soft border-b border-brand-100 flex items-center gap-3">
                          <Avatar user={user} size="md" />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-ink truncate">{user?.fullName}</p>
                            <p className="text-xs text-ink-tertiary truncate">{user?.email}</p>
                            <span className="badge-brand mt-1 capitalize text-[10px]">{user?.role}</span>
                          </div>
                        </div>

                        {/* Menu items */}
                        <div className="p-1.5">
                          <Link to={getDashboardLink()} onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 text-sm text-ink rounded-xl hover:bg-surface-secondary transition-colors">
                            <LayoutDashboard className="w-4 h-4 text-ink-tertiary" /> Dashboard
                          </Link>
                          {user?.role === 'customer' && (
                            <Link to="/profile" onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 text-sm text-ink rounded-xl hover:bg-surface-secondary transition-colors">
                              <Settings className="w-4 h-4 text-ink-tertiary" /> Profile Settings
                            </Link>
                          )}
                          {user?.role === 'vendor' && (
                            <Link to="/vendor/profile" onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 text-sm text-ink rounded-xl hover:bg-surface-secondary transition-colors">
                              <User className="w-4 h-4 text-ink-tertiary" /> Business Profile
                            </Link>
                          )}
                          <div className="border-t border-surface-border my-1" />
                          <button onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-red-600 rounded-xl hover:bg-red-50 transition-colors">
                            <LogOut className="w-4 h-4" /> Sign out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden ml-auto p-2.5 rounded-xl hover:bg-surface-tertiary transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-ink" /> : <Menu className="w-5 h-5 text-ink" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-surface-border bg-white/98 backdrop-blur-xl animate-fade-down">
          <div className="px-4 py-4 space-y-1">
            {!isAuthenticated ? (
              <>
                {publicLinks.map((link) => (
                  <a key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2.5 text-sm text-ink-secondary hover:text-ink rounded-xl hover:bg-surface-tertiary transition-colors">
                    {link.label}
                  </a>
                ))}
                <div className="flex gap-2 pt-3">
                  <Link to="/login"    onClick={() => setMobileMenuOpen(false)} className="btn-secondary flex-1 justify-center">Log in</Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="btn-primary  flex-1 justify-center">Get Started</Link>
                </div>
              </>
            ) : (
              <>
                {/* User card */}
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-brand-gradient-soft border border-brand-100 mb-3">
                  <Avatar user={user} size="md" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink truncate">{user?.fullName}</p>
                    <p className="text-xs text-ink-tertiary truncate">{user?.email}</p>
                  </div>
                </div>

                {/* Quick nav */}
                {quickLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <NavLink key={link.to} to={link.to} end={link.end} onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl font-medium transition-colors ${
                          isActive ? 'bg-brand-gradient text-white' : 'text-ink-secondary hover:bg-surface-tertiary hover:text-ink'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-ink-tertiary'}`} strokeWidth={1.75} />
                          {link.label}
                        </>
                      )}
                    </NavLink>
                  );
                })}

                <div className="border-t border-surface-border my-2" />
                <button onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-red-600 rounded-xl hover:bg-red-50 transition-colors">
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

/* ── Avatar helper ─────────────────────────────────────────────────────── */
export const Avatar = ({ user, size = 'md', className = '' }) => {
  const sizes = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
    xl: 'w-14 h-14 text-lg',
  };
  return (
    <div className={`${sizes[size]} rounded-full bg-brand-gradient flex items-center justify-center overflow-hidden shrink-0 shadow-brand ${className}`}>
      {user?.avatar
        ? <img src={user.avatar} alt={user?.fullName} className="w-full h-full object-cover" />
        : <span className="text-white font-semibold">{user?.fullName?.charAt(0) || 'U'}</span>
      }
    </div>
  );
};

export default Navbar;
