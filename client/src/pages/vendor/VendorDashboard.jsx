import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Wrench, Clock, CheckCircle, Star, ArrowRight, Shield
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { bookingAPI } from '../../services/api';
import { StatCardSkeleton, CardSkeleton } from '../../components/ui/Loading';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';

const VendorDashboard = () => {
  const { user, vendorProfile } = useAuth();
  const [stats,          setStats]          = useState({ pending: 0, active: 0, completed: 0, total: 0 });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading,        setLoading]        = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const { data } = await bookingAPI.getMyBookings({ limit: 5 });
      const bookings = data.bookings;
      setRecentBookings(bookings);
      setStats({
        pending:   bookings.filter(b => b.status === 'vendor_selected').length,
        active:    bookings.filter(b => ['repair_accepted','device_received','repair_in_progress'].includes(b.status)).length,
        completed: bookings.filter(b => ['repair_completed','delivered'].includes(b.status)).length,
        total:     data.pagination.total,
      });
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  /* ── Not set up ─────────────────────────────────────────────────── */
  if (!vendorProfile) {
    return (
      <div className="min-h-screen bg-surface-secondary flex flex-col">
        <PageHeader title="Vendor Dashboard" subtitle="Set up your profile to get started" />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="card p-10 max-w-md w-full text-center">
            <div className="icon-box-xl bg-brand-50 mx-auto mb-5">
              <Wrench className="w-7 h-7 text-brand-500" strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-bold text-ink mb-2">Complete Your Profile</h2>
            <p className="text-ink-tertiary text-sm mb-6">Set up your vendor profile to start receiving repair requests from customers.</p>
            <Link to="/vendor/setup" className="btn-primary">Set Up Profile</Link>
          </div>
        </div>
      </div>
    );
  }

  /* ── Pending verification ───────────────────────────────────────── */
  if (!vendorProfile.isVerified) {
    return (
      <div className="min-h-screen bg-surface-secondary flex flex-col">
        <PageHeader title="Vendor Dashboard" subtitle="Verification in progress" />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="card p-10 max-w-md w-full text-center">
            <div className="icon-box-xl bg-amber-50 mx-auto mb-5">
              <Clock className="w-7 h-7 text-amber-600" strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-bold text-ink mb-2">Verification Pending</h2>
            <p className="text-ink-tertiary text-sm mb-4">Your vendor account is under review. This typically takes 2–3 business days.</p>
            <StatusBadge status={vendorProfile.verificationStatus} />
          </div>
        </div>
      </div>
    );
  }

  /* ── Verified dashboard ─────────────────────────────────────────── */
  const statCards = [
    { label: 'Pending Acceptance', value: stats.pending,   icon: Clock,        bg: 'bg-amber-50',   ic: 'text-amber-600' },
    { label: 'Active Repairs',     value: stats.active,    icon: Wrench,       bg: 'bg-blue-50',    ic: 'text-blue-600' },
    { label: 'Completed',          value: stats.completed, icon: CheckCircle,  bg: 'bg-emerald-50', ic: 'text-emerald-600' },
    {
      label: 'Rating',
      value: vendorProfile.rating?.average ? vendorProfile.rating.average.toFixed(1) : '—',
      icon:  Star,
      bg:    'bg-brand-50',
      ic:    'text-brand-600',
    },
  ];

  return (
    <div className="min-h-screen bg-surface-secondary flex flex-col">
      <PageHeader
        gradient
        title={vendorProfile.businessName}
        subtitle={`${user?.email}`}
        badge={
          <span className="badge-success flex items-center gap-1">
            <Shield className="w-3 h-3" /> Verified
          </span>
        }
        actions={
          <Link to="/vendor/requests" className="flex items-center gap-2 bg-white text-ink font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-gray-50 shadow-lg transition-colors">
            Browse Requests <ArrowRight className="w-4 h-4" />
          </Link>
        }
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
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

        {/* Recent Bookings */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-ink">Recent Bookings</h2>
            <Link to="/vendor/bookings" className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">{[1,2,3].map(i => <CardSkeleton key={i} />)}</div>
          ) : recentBookings.length === 0 ? (
            <div className="card">
              <EmptyState
                icon={Wrench}
                title="No bookings yet"
                description="Submit quotations on available repair requests to receive bookings."
                action={<Link to="/vendor/requests" className="btn-primary">Browse Requests</Link>}
              />
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentBookings.map(b => (
                <Link key={b._id} to={`/vendor/bookings/${b._id}`}
                  className="card-hover p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-ink truncate">
                        {b.repairRequest?.deviceBrand} {b.repairRequest?.deviceModel}
                      </p>
                      <StatusBadge status={b.status} />
                    </div>
                    <p className="text-xs text-ink-tertiary">
                      {b.customer?.fullName} · ₹{b.agreedPrice?.toLocaleString()}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-ink-placeholder shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
