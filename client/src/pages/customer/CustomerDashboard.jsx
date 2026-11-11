import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Wrench, Clock, CheckCircle, AlertCircle, ChevronRight,
  Smartphone, Laptop, Tablet, Monitor, Watch, Bell, Zap, TrendingUp
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { repairAPI, bookingAPI } from '../../services/api';
import { StatCardSkeleton, CardSkeleton } from '../../components/ui/Loading';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import { useNotifications } from '../../context/NotificationContext';

const deviceIcons = {
  Smartphone, Laptop, Tablet, Desktop: Monitor, Smartwatch: Watch, Other: Wrench,
};

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const CustomerDashboard = () => {
  const { user } = useAuth();
  const { notifications, unreadCount, markRead } = useNotifications();
  const [requests,       setRequests]       = useState([]);
  const [activeBookings, setActiveBookings] = useState([]);
  const [stats,          setStats]          = useState({ total: 0, active: 0, pending: 0, completed: 0 });
  const [loading,        setLoading]        = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reqRes, bookRes] = await Promise.all([
        repairAPI.getMyRequests({ limit: 5 }),
        bookingAPI.getMyBookings({ limit: 3 }),
      ]);
      const all = reqRes.data.requests;
      setRequests(all);
      setActiveBookings(bookRes.data.bookings);
      setStats({
        total:     reqRes.data.pagination.total,
        active:    all.filter(r => ['repair_accepted','device_received','repair_in_progress'].includes(r.status)).length,
        pending:   all.filter(r => ['submitted','troubleshooting','awaiting_quotations','quotations_received'].includes(r.status)).length,
        completed: all.filter(r => ['repair_completed','delivered','closed'].includes(r.status)).length,
      });
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const statCards = [
    { label: 'Total Requests', value: stats.total,     icon: Wrench,      bg: 'bg-surface-tertiary', ic: 'text-ink-secondary' },
    { label: 'Active Repairs', value: stats.active,    icon: Clock,       bg: 'bg-blue-50',          ic: 'text-blue-600' },
    { label: 'Awaiting Quotes',value: stats.pending,   icon: AlertCircle, bg: 'bg-amber-50',         ic: 'text-amber-600' },
    { label: 'Completed',      value: stats.completed, icon: CheckCircle, bg: 'bg-emerald-50',       ic: 'text-emerald-600' },
  ];

  return (
    <div className="min-h-screen bg-surface-secondary flex flex-col">
      <PageHeader
        gradient
        title={`${greeting()}, ${user?.fullName?.split(' ')[0]} 👋`}
        subtitle={new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        actions={
          <Link to="/repairs/new"
            className="flex items-center gap-2 bg-white text-ink font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-gray-50 shadow-lg transition-colors">
            <Plus className="w-4 h-4" /> New Repair Request
          </Link>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {loading
            ? [0,1,2,3].map(i => <StatCardSkeleton key={i} />)
            : statCards.map(s => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="card p-5 flex flex-col gap-3">
                    <div className={`icon-box ${s.bg}`}>
                      <Icon className={`w-5 h-5 ${s.ic}`} strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-ink">{s.value}</p>
                      <p className="text-xs text-ink-tertiary mt-0.5">{s.label}</p>
                    </div>
                  </div>
                );
              })
          }
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Requests */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink">Recent Requests</h2>
              <Link to="/repairs" className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1 transition-colors">
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">{[1,2,3].map(i => <CardSkeleton key={i} />)}</div>
            ) : requests.length === 0 ? (
              <div className="card">
                <EmptyState
                  icon={Wrench}
                  title="No repair requests yet"
                  description="Create your first request and let AI help diagnose your device."
                  action={<Link to="/repairs/new" className="btn-primary"><Plus className="w-4 h-4" />Create Request</Link>}
                />
              </div>
            ) : (
              <div className="space-y-2.5">
                {requests.map(req => {
                  const Icon = deviceIcons[req.deviceCategory] || Wrench;
                  return (
                    <Link key={req._id} to={`/repairs/${req._id}`}
                      className="card-hover p-4 flex items-center gap-4">
                      <div className="icon-box bg-brand-50">
                        <Icon className="w-5 h-5 text-brand-500" strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-0.5">
                          <p className="text-sm font-semibold text-ink truncate">
                            {req.deviceBrand} {req.deviceModel}
                          </p>
                          <StatusBadge status={req.status} />
                        </div>
                        <p className="text-xs text-ink-tertiary">{req.issueCategory} · {formatDate(req.createdAt)}</p>
                      </div>
                      {req.quotationCount > 0 && (
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-bold text-brand-600">{req.quotationCount}</p>
                          <p className="text-[10px] text-ink-tertiary">quotes</p>
                        </div>
                      )}
                      <ChevronRight className="w-4 h-4 text-ink-placeholder shrink-0" />
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Quick actions */}
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-ink mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <Link to="/repairs/new"
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-brand-50 border border-brand-100 hover:border-brand-300 transition-all">
                  <div className="icon-box-sm bg-brand-100"><Plus className="w-4 h-4 text-brand-600" /></div>
                  <span className="text-sm font-medium text-ink">New Repair</span>
                </Link>
                <Link to="/repairs"
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-surface-tertiary border border-surface-border hover:border-surface-border-strong transition-all">
                  <div className="icon-box-sm bg-white border border-surface-border"><TrendingUp className="w-4 h-4 text-ink-secondary" /></div>
                  <span className="text-sm font-medium text-ink">History</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="space-y-5">
            {/* Active repairs */}
            <div>
              <h2 className="text-sm font-semibold text-ink mb-3">Active Repairs</h2>
              {activeBookings.length === 0 ? (
                <div className="card">
                  <EmptyState size="sm" icon={Zap} title="No active repairs" description="Accepted bookings will appear here." />
                </div>
              ) : (
                <div className="space-y-2.5">
                  {activeBookings.map(b => (
                    <Link key={b._id} to={`/bookings/${b._id}`} className="card-hover p-4 block">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <p className="text-sm font-semibold text-ink truncate">
                          {b.repairRequest?.deviceBrand} {b.repairRequest?.deviceModel}
                        </p>
                        <StatusBadge status={b.status} />
                      </div>
                      <p className="text-xs text-ink-tertiary">{b.vendorProfile?.businessName}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-ink">Notifications</h2>
                {unreadCount > 0 && <span className="badge-brand">{unreadCount} new</span>}
              </div>
              {notifications.length === 0 ? (
                <div className="card">
                  <EmptyState size="sm" icon={Bell} title="All caught up" description="No notifications." />
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.slice(0, 5).map(n => (
                    <div key={n._id} onClick={() => markRead(n._id)}
                      className={`card p-3.5 cursor-pointer transition-all hover:shadow-sm ${!n.isRead ? 'border-brand-200 bg-brand-50/50' : ''}`}>
                      {!n.isRead && <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-500 mb-1.5" />}
                      <p className={`text-xs font-medium ${!n.isRead ? 'text-ink' : 'text-ink-secondary'}`}>{n.title}</p>
                      <p className="text-xs text-ink-tertiary mt-0.5 line-clamp-2">{n.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
