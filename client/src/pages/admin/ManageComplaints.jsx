import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { useToast } from '../../components/ui/Toast';
import { TableSkeleton } from '../../components/ui/Loading';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';

const ManageComplaints = () => {
  const toast = useToast();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ status: '', adminNotes: '', resolution: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchComplaints(); }, [statusFilter, page]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const { data } = await adminAPI.getComplaints({ status: statusFilter || undefined, page, limit: 20 });
      setComplaints(data.complaints);
      setPagination(data.pagination);
    } catch { toast.error('Failed to load complaints'); } finally { setLoading(false); }
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await adminAPI.updateComplaint(selected._id, form);
      toast.success('Complaint updated.');
      setSelected(null);
      fetchComplaints();
    } catch { toast.error('Failed to update.'); } finally { setSaving(false); }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#111111]">Complaints</h1>
        <p className="text-sm text-[#737373]">{pagination.total || 0} total</p>
      </div>

      <div className="flex gap-2 mb-5">
        {['', 'open', 'under_review', 'resolved', 'dismissed'].map(s => (
          <button key={s || 'all'} onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${statusFilter === s ? 'bg-[#111111] text-white' : 'bg-[#F5F5F5] text-[#525252] hover:bg-[#E5E5E5]'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? <TableSkeleton rows={6} cols={5} /> : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#F5F5F5] border-b border-[#E5E5E5]">
              <tr>
                {['Subject', 'Submitted By', 'Category', 'Date', 'Status', 'Action'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-[#737373] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              {complaints.map(c => (
                <tr key={c._id} className="hover:bg-[#F5F5F5] transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#111111] max-w-[200px] truncate">{c.subject}</p>
                    <p className="text-xs text-[#737373]">{c.category}</p>
                  </td>
                  <td className="px-4 py-3 text-[#525252]">{c.submittedBy?.fullName}</td>
                  <td className="px-4 py-3 text-[#525252] capitalize">{c.category?.replace('_', ' ')}</td>
                  <td className="px-4 py-3 text-[#737373]">{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => { setSelected(c); setForm({ status: c.status, adminNotes: c.adminNotes || '', resolution: c.resolution || '' }); }}
                      className="text-xs btn-secondary py-1 px-3">
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Manage Complaint" size="md">
        {selected && (
          <div className="space-y-4">
            <div className="p-4 bg-[#F5F5F5] rounded-xl">
              <p className="text-sm font-semibold text-[#111111]">{selected.subject}</p>
              <p className="text-xs text-[#737373] mt-1">{selected.description}</p>
            </div>
            <div>
              <label className="form-label">Status</label>
              <select className="input-field" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="open">Open</option>
                <option value="under_review">Under Review</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>
            <div>
              <label className="form-label">Admin Notes</label>
              <textarea rows={2} className="input-field resize-none" value={form.adminNotes} onChange={e => setForm(f => ({ ...f, adminNotes: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Resolution</label>
              <textarea rows={2} className="input-field resize-none" placeholder="Describe the resolution..." value={form.resolution} onChange={e => setForm(f => ({ ...f, resolution: e.target.value }))} />
            </div>
            <button onClick={handleUpdate} disabled={saving} className="btn-primary w-full">
              {saving ? 'Saving...' : 'Update Complaint'}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageComplaints;
