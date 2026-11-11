import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, Laptop, Tablet, Monitor, Watch, Wrench, MapPin, Calendar } from 'lucide-react';
import { vendorAPI } from '../../services/api';
import { CardSkeleton } from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';

const deviceIcons = { Smartphone, Laptop, Tablet, Desktop: Monitor, Smartwatch: Watch, Other: Wrench };

const AvailableRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);

  useEffect(() => { fetchRequests(); }, [page]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data } = await vendorAPI.getRepairRequests({ page, limit: 10 });
      setRequests(data.requests);
      setPagination(data.pagination);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111111]">Available Repair Requests</h1>
        <p className="text-sm text-[#737373] mt-1">Requests matching your service area and device categories</p>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}</div>
      ) : requests.length === 0 ? (
        <EmptyState icon={Wrench} title="No requests available" description="There are no matching repair requests right now. Check back soon or update your service areas." />
      ) : (
        <div className="space-y-4">
          {requests.map(req => {
            const Icon = deviceIcons[req.deviceCategory] || Wrench;
            return (
              <div key={req._id} className="card-hover p-5">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#F5F5F5] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-[#525252]" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-[#111111]">
                          {req.deviceBrand} {req.deviceModel}
                        </h3>
                        <p className="text-xs text-[#737373]">{req.deviceCategory} · {req.issueCategory}</p>
                      </div>
                      {req.aiAnalysis?.classification && (
                        <span className="badge-neutral text-xs capitalize">
                          {req.aiAnalysis.classification.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#525252] mt-2 line-clamp-2">{req.issueDescription}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-[#737373]">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />{req.location?.city}{req.location?.area ? `, ${req.location.area}` : ''}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />{new Date(req.createdAt).toLocaleDateString('en-IN')}
                      </span>
                      {req.images?.length > 0 && (
                        <span>{req.images.length} photo{req.images.length !== 1 ? 's' : ''}</span>
                      )}
                    </div>
                    {req.images?.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {req.images.slice(0, 3).map((img, i) => (
                          <img key={i} src={img.url} alt="" className="w-14 h-14 rounded-lg object-cover border border-[#E5E5E5]" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-[#E5E5E5] flex gap-3">
                  <Link to={`/vendor/submit-quote/${req._id}`} className="btn-primary flex items-center gap-2">
                    Submit Quotation
                  </Link>
                  <Link to={`/repairs/${req._id}`} className="btn-ghost text-sm">View Details</Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

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

export default AvailableRequests;
