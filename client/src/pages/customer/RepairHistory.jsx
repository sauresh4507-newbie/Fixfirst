import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Smartphone, Laptop, Tablet, Monitor, Watch, Search, Filter } from 'lucide-react';
import { repairAPI } from '../../services/api';
import { CardSkeleton } from '../../components/ui/Loading';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';

const deviceIcons = { Smartphone, Laptop, Tablet, Desktop: Monitor, Smartwatch: Watch, Other: Wrench };

const RepairHistory = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, page]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data } = await repairAPI.getMyRequests({ status: statusFilter || undefined, page, limit: 10 });
      setRequests(data.requests);
      setPagination(data.pagination);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const statuses = ['', 'submitted', 'awaiting_quotations', 'quotations_received', 'repair_in_progress', 'repair_completed', 'delivered', 'cancelled'];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#111111]">Repair History</h1>
          <p className="text-sm text-[#737373] mt-1">{pagination.total || 0} total requests</p>
        </div>
        <Link to="/repairs/new" className="btn-primary">New Request</Link>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {statuses.map((s) => (
          <button
            key={s || 'all'}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              statusFilter === s ? 'bg-[#111111] text-white' : 'bg-[#F5F5F5] text-[#525252] hover:bg-[#E5E5E5]'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <CardSkeleton key={i} />)}</div>
      ) : requests.length === 0 ? (
        <EmptyState icon={Wrench} title="No repair requests" description="Create your first repair request to get started." />
      ) : (
        <div className="space-y-3">
          {requests.map((req) => {
            const Icon = deviceIcons[req.deviceCategory] || Wrench;
            return (
              <Link key={req._id} to={`/repairs/${req._id}`} className="card-hover p-4 flex items-center gap-4 block">
                <div className="w-10 h-10 rounded-xl bg-[#F5F5F5] flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-[#525252]" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-[#111111]">{req.deviceBrand} {req.deviceModel}</p>
                    <StatusBadge status={req.status} />
                  </div>
                  <p className="text-xs text-[#737373]">{req.issueCategory} · {req.location?.city}</p>
                  <p className="text-xs text-[#A3A3A3] mt-0.5">{new Date(req.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
                {req.quotationCount > 0 && (
                  <div className="text-right shrink-0">
                    <p className="text-base font-bold text-[#111111]">{req.quotationCount}</p>
                    <p className="text-xs text-[#737373]">quotes</p>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-3 py-2 text-sm">Prev</button>
          <span className="px-4 py-2 text-sm text-[#737373]">Page {page} of {pagination.pages}</span>
          <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="btn-secondary px-3 py-2 text-sm">Next</button>
        </div>
      )}
    </div>
  );
};

export default RepairHistory;
