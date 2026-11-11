import { useState, useEffect } from 'react';
import { useLocation, NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard, Wrench, User, Users, ShieldCheck,
  AlertCircle, Plus, BookOpen, FileSearch, Bell
} from 'lucide-react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import AppFooter from './AppFooter';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

/* ── Sidebar link definitions (desktop) ─────────────────────────────────── */
const customerLinks = () => [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard',  end: true },
  { to: '/repairs/new', icon: Plus,            label: 'New Request' },
  { to: '/repairs',     icon: Wrench,          label: 'My Repairs'  },
  { type: 'section',   label: 'Account' },
  { to: '/profile',     icon: User,            label: 'Profile'     },
];

const vendorLinks = () => [
  { to: '/vendor',          icon: LayoutDashboard, label: 'Dashboard',         end: true },
  { to: '/vendor/requests', icon: FileSearch,      label: 'Available Requests' },
  { to: '/vendor/bookings', icon: BookOpen,        label: 'My Bookings'        },
  { type: 'section',       label: 'Account' },
  { to: '/vendor/profile',  icon: User,            label: 'Business Profile'   },
];

const adminLinks = () => [
  { to: '/admin',            icon: LayoutDashboard, label: 'Dashboard',  end: true },
  { type: 'section',        label: 'Management' },
  { to: '/admin/users',      icon: Users,           label: 'Customers'   },
  { to: '/admin/vendors',    icon: ShieldCheck,     label: 'Vendors'     },
  { to: '/admin/repairs',    icon: Wrench,          label: 'Repairs'     },
  { to: '/admin/complaints', icon: AlertCircle,     label: 'Complaints'  },
];

/* ── Bottom nav tab definitions (mobile) ────────────────────────────────── */
const customerTabs = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Home',    end: true },
  { to: '/repairs',     icon: Wrench,          label: 'Repairs'  },
  { to: '/profile',     icon: User,            label: 'Profile'  },
];

const vendorTabs = [
  { to: '/vendor',          icon: LayoutDashboard, label: 'Home',     end: true },
  { to: '/vendor/requests', icon: FileSearch,      label: 'Requests'  },
  { to: '/vendor/bookings', icon: BookOpen,        label: 'Bookings'  },
  { to: '/vendor/profile',  icon: User,            label: 'Profile'   },
];

const adminTabs = [
  { to: '/admin',            icon: LayoutDashboard, label: 'Home',       end: true },
  { to: '/admin/users',      icon: Users,           label: 'Customers'   },
  { to: '/admin/vendors',    icon: ShieldCheck,     label: 'Vendors'     },
  { to: '/admin/complaints', icon: AlertCircle,     label: 'Complaints'  },
];

/* ── AppLayout ──────────────────────────────────────────────────────────── */
const AppLayout = ({ children }) => {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  if (!user) return null;

  const sidebarLinks = {
    admin:    adminLinks(),
    vendor:   vendorLinks(),
    customer: customerLinks(),
  }[user.role] ?? [];

  const bottomTabs = {
    admin:    adminTabs,
    vendor:   vendorTabs,
    customer: customerTabs,
  }[user.role] ?? [];

  const sidebarTitle = {
    admin:    'Admin Panel',
    vendor:   'Vendor Portal',
    customer: 'My Account',
  }[user.role] ?? '';

  const showFAB = user.role === 'customer';

  return (
    /*
     * Full-screen native-app shell:
     * - height: 100dvh  →  respects dynamic viewport (mobile browser chrome)
     * - overscroll-behavior: none  →  set in index.css on body
     * - Only <main> scrolls; top bar + bottom nav stay fixed
     */
    <div
      className="flex flex-col bg-surface-secondary"
      style={{ height: '100dvh' }}
    >
      {/* ── Top Navbar (sticky) ────────────────────────────────────── */}
      <Navbar onMenuClick={() => setSidebarOpen(true)} />

      {/* ── Body: sidebar + scrollable content ────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Desktop sidebar — hidden on mobile */}
        <div className="hidden lg:block">
          <Sidebar
            links={sidebarLinks}
            title={sidebarTitle}
            mobileOpen={false}
            onClose={() => {}}
          />
        </div>

        {/* Mobile sidebar drawer (overlay) */}
        <div className="lg:hidden">
          <Sidebar
            links={sidebarLinks}
            title={sidebarTitle}
            mobileOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        </div>

        {/* ── Scrollable main + footer ──────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <main
            className="flex-1 overflow-y-auto screen-enter"
            /*
             * -webkit-overflow-scrolling: touch  →  momentum scrolling on iOS
             * The key: ONLY this element scrolls. Everything else is fixed.
             */
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {/*
              * On mobile, add bottom padding equal to bottom-nav height + safe area
              * so content is never hidden behind the bottom nav bar.
              * On desktop (lg:) this padding is zeroed out — AppFooter handles spacing.
              */}
            <div className="mobile-content-pad">
              {children}
            </div>
          </main>

          {/* Desktop footer — hidden on mobile (bottom nav replaces it) */}
          <div className="hidden lg:block">
            <AppFooter />
          </div>
        </div>
      </div>

      {/* ── FAB — "New Repair Request" (customer only, mobile only) ─ */}
      {showFAB && (
        <Link
          to="/repairs/new"
          className="fab lg:hidden"
          aria-label="New repair request"
        >
          <Plus className="w-6 h-6" strokeWidth={2.5} />
        </Link>
      )}

      {/* ── Bottom Navigation Bar (mobile only) ───────────────────── */}
      <nav
        className="lg:hidden flex bg-white border-t border-surface-border z-30"
        style={{
          height: `calc(var(--bottom-nav-h) + var(--safe-bottom))`,
          paddingBottom: 'var(--safe-bottom)',
        }}
      >
        {bottomTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                isActive ? 'bottom-nav-item-active' : 'bottom-nav-item-inactive'
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative">
                    <Icon
                      className={`w-5 h-5 transition-transform duration-150 ${isActive ? 'scale-110' : ''}`}
                      strokeWidth={isActive ? 2.5 : 1.75}
                    />
                    {/* Notification dot on bell / alerts */}
                    {tab.label === 'Home' && unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-brand-500 rounded-full text-white text-[8px] flex items-center justify-center font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] font-medium leading-none ${isActive ? 'text-brand-600' : ''}`}>
                    {tab.label}
                  </span>
                  {/* Active indicator dot */}
                  {isActive && (
                    <span className="w-1 h-1 rounded-full bg-brand-500 mt-0.5" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default AppLayout;
