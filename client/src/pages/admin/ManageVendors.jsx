import { useState, useEffect } from 'react';
import { Shield, X } from 'lucide-react';
import { adminAPI } from '../../services/api';
import { useToast } from '../../components/ui/Toast';
import { TableSkeleton } from '../../components/ui/Loading';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import PageHeader from '../../components/ui/PageHeader';

const ManageVendors = () => {
  const toast = useToast();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [verifyModal, setVerifyModal] = useState(null);
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => { fetchVendors(); }, [statusFilter, page]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const { data } = await adminAPI.getVendors({ verificationStatus: statusFilter || undefined, page, limit: 20 });
      setVendors(data.vendors);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (action) => {
    setProcessing(true);
    try {
      await adminAPI.verifyVendor(verifyModal._id, { action, notes });
      toast.success(`Vendor ${action === 'verify' ? 'verified' : 'rejected'} successfully`);
      setVerifyModal(null);
      setNotes('');
      fetchVendors();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update vendor');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-secondary flex flex-col">
      <PageHeader
        title="Vendor Management"
        subtitle={`${pagination.total || 0} vendors`}
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">

      <div className="flex gap-2 mb-5 flex-wrap">
        {['', 'pending', 'verified', 'rejected', 'under_review'].map(s => (
          <button key={s || 'all'} onClick={() => { setStatusFilter(s); setPage(1); }}
            className={s === statusFilter ? 'filter-pill-active' : 'filter-pill-inactive'}>
            {s ? s.replace('_', ' ') : 'All'}
          </button>
        ))}
      </div>

      {loading ? <TableSkeleton rows={6} cols={5} /> : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-tertiary border-b border-surface-border">
              <tr>
                {['Business', 'Owner', 'Location', 'Status', 'Action'].map(h => (
                  <th key={h} className="table-header-cell">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vendors.map(v => (
                <tr key={v._id} className="table-row">
                  <td className="table-cell">
                    <p className="font-medium text-ink">{v.businessName}</p>
                    <p className="text-xs text-ink-tertiary">{v.deviceCategories?.join(', ')}</p>
                  </td>
                  <td className="table-cell">
                    <p className="text-ink">{v.user?.fullName}</p>
                    <p className="text-xs text-ink-tertiary">{v.user?.email}</p>
                  </td>
                  <td className="table-cell text-ink-secondary">{v.address?.city}</td>
                  <td className="table-cell"><StatusBadge status={v.verificationStatus} /></td>
                  <td className="table-cell">
                    {v.verificationStatus === 'pending' && (
                      <button onClick={() => setVerifyModal(v)} className="btn-secondary btn-sm">Review</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={!!verifyModal} onClose={() => setVerifyModal(null)} title="Review Vendor Application" size="md">
        {verifyModal && (
          <div className="space-y-4">
            <div className="p-4 bg-brand-50 rounded-xl border border-brand-100">
              <p className="text-sm font-semibold text-ink">{verifyModal.businessName}</p>
              <p className="text-xs text-ink-tertiary">{verifyModal.user?.fullName} · {verifyModal.address?.city}</p>
              <p className="text-xs text-ink-secondary mt-2">{verifyModal.description}</p>
            </div>
            <div>
              <label className="form-label">Admin Notes</label>
              <textarea rows={3} className="input-field resize-none" placeholder="Add notes for the vendor..." value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => handleVerify('verify')} disabled={processing} className="btn-primary flex-1 justify-center">
                <Shield className="w-4 h-4" /> Verify
              </button>
              <button onClick={() => handleVerify('reject')} disabled={processing} className="btn-danger flex-1 justify-center">
                <X className="w-4 h-4" /> Reject
              </button>
            </div>
          </div>
        )}
      </Modal>

      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="btn-secondary">Prev</button>
          <span className="px-4 py-2 text-sm text-ink-tertiary">Page {page} of {pagination.pages}</span>
          <button onClick={() => setPage(p => Math.min(pagination.pages,p+1))} disabled={page===pagination.pages} className="btn-secondary">Next</button>
        </div>
      )}
      </div>
    </div>
  );
};

export default ManageVendors;
