import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { useToast } from '../../components/ui/Toast';
import { TableSkeleton } from '../../components/ui/Loading';
import PageHeader from '../../components/ui/PageHeader';

const ManageCustomers = () => {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [toggling, setToggling] = useState(null);

  useEffect(() => { fetchUsers(); }, [page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await adminAPI.getUsers({ role: 'customer', search: search || undefined, page, limit: 20 });
      setUsers(data.users);
      setPagination(data.pagination);
    } catch { toast.error('Failed to load users'); } finally { setLoading(false); }
  };

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchUsers(); };

  const handleToggle = async (id) => {
    setToggling(id);
    try {
      const { data } = await adminAPI.toggleUserActive(id);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: data.user.isActive } : u));
      toast.success(`User ${data.user.isActive ? 'activated' : 'deactivated'}`);
    } catch { toast.error('Failed to update user'); } finally { setToggling(null); }
  };

  return (
    <div className="min-h-screen bg-surface-secondary flex flex-col">
      <PageHeader
        title="Customer Management"
        subtitle={`${pagination.total || 0} customers`}
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">

      <form onSubmit={handleSearch} className="flex gap-3 mb-5">
        <input className="input-field flex-1" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
        <button type="submit" className="btn-primary px-4">Search</button>
      </form>

      {loading ? <TableSkeleton rows={8} cols={5} /> : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-tertiary border-b border-surface-border">
              <tr>
                {['Name', 'Email', 'Phone', 'Joined', 'Status', 'Action'].map(h => (
                  <th key={h} className="table-header-cell">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} className="table-row">
                  <td className="table-cell font-medium">{u.fullName}</td>
                  <td className="table-cell text-ink-secondary">{u.email}</td>
                  <td className="table-cell text-ink-secondary">{u.phone}</td>
                  <td className="table-cell text-ink-tertiary">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                  <td className="table-cell">
                    <span className={u.isActive ? 'badge-success' : 'badge-error'}>{u.isActive ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td className="table-cell">
                    <button onClick={() => handleToggle(u._id)} disabled={toggling === u._id} className="btn-secondary btn-sm">
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary">Prev</button>
          <span className="px-4 py-2 text-sm text-ink-tertiary">Page {page} of {pagination.pages}</span>
          <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="btn-secondary">Next</button>
        </div>
      )}
      </div>
    </div>
  );
};

export default ManageCustomers;
