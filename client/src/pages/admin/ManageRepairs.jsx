import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import { useToast } from '../../components/ui/Toast';
import { TableSkeleton } from '../../components/ui/Loading';
import StatusBadge from '../../components/ui/StatusBadge';
import PageHeader from '../../components/ui/PageHeader';

const ManageRepairs = () => {
  const toast = useToast();
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => { fetchRepairs(); }, [statusFilter, page]);

  const fetchRepairs = async () => {
    try {
      setLoading(true);
      const { data } = await adminAPI.getRepairs({ status: statusFilter || undefined, page, limit: 20 });
      setRepairs(data.requests);
      setPagination(data.pagination);
    } catch { toast.error('Failed to load repairs'); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-surface-secondary flex flex-col">
      <PageHeader
        title="Repair Requests"
        subtitle={`${pagination.total || 0} total requests`}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">

      <div className="flex gap-2 mb-5 flex-wrap">
        {['', 'submitted', 'awaiting_quotations', 'repair_in_progress', 'repair_completed', 'cancelled'].map(s => (
          <button key={s || 'all'} onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${statusFilter === s ? 'bg-[#111111] text-white' : 'bg-[#F5F5F5] text-[#525252] hover:bg-[#E5E5E5]'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? <TableSkeleton rows={8} cols={6} /> : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#F5F5F5] border-b border-[#E5E5E5]">
              <tr>
                {['Device', 'Customer', 'Issue', 'Location', 'Date', 'Status'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#737373] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              {repairs.map(r => (
                <tr key={r._id} className="hover:bg-[#F5F5F5] transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#111111]">{r.deviceBrand} {r.deviceModel}</p>
                    <p className="text-xs text-[#737373]">{r.deviceCategory}</p>
                  </td>
                  <td className="px-4 py-3 text-[#525252]">{r.customer?.fullName}</td>
                  <td className="px-4 py-3 text-[#525252]">{r.issueCategory}</td>
                  <td className="px-4 py-3 text-[#525252]">{r.location?.city}</td>
                  <td className="px-4 py-3 text-[#737373]">{new Date(r.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary px-3 py-2 text-sm">Prev</button>
          <span className="px-4 py-2 text-sm text-ink-tertiary">Page {page} of {pagination.pages}</span>
          <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="btn-secondary px-3 py-2 text-sm">Next</button>
        </div>
      )}
      </div>
    </div>
  );
};

export default ManageRepairs;
