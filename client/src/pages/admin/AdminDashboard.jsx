import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Wrench, CheckCircle, AlertCircle, Clock, ShieldAlert,
  TrendingUp, ChevronRight, ShieldCheck
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import { StatCardSkeleton, CardSkeleton } from '../../components/ui/Loading';
import StatusBadge from '../../components/ui/StatusBadge';
import PageHeader from '../../components/ui/PageHeader';
import { Avatar } from '../../components/Navbar';

const AdminDashboard = () => {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboard()
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = data?.stats;

  const statCards = [
    { label: 'Total Customers',      value: stats?.totalCustomers    || 0, icon: Users,       link: '/admin/users',                      highlight: false },
    { label: 'Total Vendors',        value: stats?.totalVendors      || 0, icon: ShieldCheck, link: '/admin/vendors',                    highlight: false },
    { label: 'Pending Verification', value: stats?.pendingVerification||0, icon: Clock,       link: '/admin/vendors?status=pending',     highlight: (stats?.pendingVerification || 0) > 0 },
    { label: 'Total Repairs',        value: stats?.totalRequests     || 0, icon: TrendingUp,  link: '/admin/repairs',                    highlight: false },
    { label: 'Active Repairs',       value: stats?.activeRepairs     || 0, icon: Wrench,      link: '/admin/repairs?status=repair_in_progress', highlight: false },
    { label: 'Completed',            value: stats?.completedRepairs  || 0, icon: CheckCircle, link: '/admin/repairs?status=repair_completed',   highlight: false },
    { label: 'Cancelled',            value: stats?.cancelledRequests || 0, icon: AlertCircle, link: '/admin/repairs?status=cancelled',   highlight: false },
    { label: 'Open Complaints',      value: stats?.openComplaints    || 0, icon: ShieldAlert, link: '/admin/complaints',                 highlight: (stats?.openComplaints || 0) > 0 },
  ];

  return (
    <div className="min-h-screen bg-surface-secondary flex flex-col">
      <PageHeader
        gradient
        title="Admin Dashboard"
        subtitle={`Platform overview · ${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-7">
          {loading
            ? [1,2,3,4,5,6,7,8].map(i => <StatCardSkeleton key={i} />)
            : statCards.map((s) => {
                const Icon = s.icon;
                return (
                  <Link key={s.label} to={s.link}
                    className={`card-hover p-5 flex flex-col gap-3 ${s.highlight ? 'border-amber-200 bg-amber-50/50' : ''}`}>
                    <div className="flex items-start justify-between">
                      <div className={`icon-box ${s.highlight ? 'bg-amber-100' : 'bg-surface-tertiary'}`}>
                        <Icon className={`w-5 h-5 ${s.highlight ? 'text-amber-600' : 'text-ink-secondary'}`} strokeWidth={1.5} />
                      </div>
                      <ChevronRight className="w-4 h-4 text-ink-placeholder" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-ink">{s.value}</p>
                      <p className="text-xs text-ink-tertiary mt-0.5">{s.label}</p>
                    </div>
                  </Link>
                );
              })
          }
        </div>

        {/* Recent tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Users */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-ink">Recent Users</h2>
              <Link to="/admin/users" className="text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors">
                View all →
              </Link>
            </div>
            <div className="card overflow-hidden">
              {loading
                ? <div className="divide-y divide-surface-border">{[1,2,3,4].map(i=><div key={i} className="flex items-center gap-3 p-3.5"><div className="skeleton w-8 h-8 rounded-full"/><div className="flex-1 space-y-1.5"><div className="skeleton h-3.5 w-2/3 rounded-lg"/><div className="skeleton h-3 w-1/2 rounded-lg"/></div></div>)}</div>
                : data?.recentUsers?.length === 0
                  ? <p className="text-sm text-ink-tertiary p-5 text-center">No users yet</p>
                  : <div className="divide-y divide-surface-border">
                      {data?.recentUsers?.map(u => (
                        <div key={u._id} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-secondary transition-colors">
                          <Avatar user={u} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-ink truncate">{u.fullName}</p>
                            <p className="text-xs text-ink-tertiary truncate">{u.email}</p>
                          </div>
                          <span className="badge-neutral capitalize text-[10px]">{u.role}</span>
                        </div>
                      ))}
                    </div>
              }
            </div>
          </div>

          {/* Recent Repair Requests */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-ink">Recent Requests</h2>
              <Link to="/admin/repairs" className="text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors">
                View all →
              </Link>
            </div>
            <div className="card overflow-hidden">
              {loading
                ? <div className="divide-y divide-surface-border">{[1,2,3,4].map(i=><div key={i} className="flex items-center gap-3 p-3.5"><div className="flex-1 space-y-1.5"><div className="skeleton h-3.5 w-2/3 rounded-lg"/><div className="skeleton h-3 w-1/2 rounded-lg"/></div><div className="skeleton h-5 w-20 rounded-full"/></div>)}</div>
                : data?.recentRequests?.length === 0
                  ? <p className="text-sm text-ink-tertiary p-5 text-center">No requests yet</p>
                  : <div className="divide-y divide-surface-border">
                      {data?.recentRequests?.map(r => (
                        <div key={r._id} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-secondary transition-colors">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-ink truncate">
                              {r.deviceBrand} {r.deviceModel}
                            </p>
                            <p className="text-xs text-ink-tertiary truncate">
                              {r.customer?.fullName} · {r.issueCategory}
                            </p>
                          </div>
                          <StatusBadge status={r.status} />
                        </div>
                      ))}
                    </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
