import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Star, Shield, CheckCircle, Clock, Award,
  ChevronDown, AlertCircle
} from 'lucide-react';
import { repairAPI, bookingAPI } from '../../services/api';
import { Spinner, CardSkeleton } from '../../components/ui/Loading';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../components/ui/Toast';

const Quotations = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [request, setRequest] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('createdAt');
  const [selectingId, setSelectingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id, sort]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reqRes, quotRes] = await Promise.all([
        repairAPI.getById(id),
        repairAPI.getQuotations(id, { sort }),
      ]);
      setRequest(reqRes.data.request);
      setQuotations(quotRes.data.quotations);
    } catch {
      toast.error('Failed to load quotations');
      navigate(`/repairs/${id}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (quotationId) => {
    if (!confirm('Select this vendor for your repair? This will accept their quotation.')) return;
    setSelectingId(quotationId);
    try {
      const { data } = await bookingAPI.create({ quotationId });
      toast.success('Vendor selected! Booking created.');
      navigate(`/bookings/${data.booking._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to select vendor');
    } finally {
      setSelectingId(null);
    }
  };

  const formatDuration = (d) => {
    if (!d?.value) return '-';
    return `${d.value} ${d.unit}`;
  };

  const formatWarranty = (w) => {
    if (!w?.value || w.value === 0) return 'No warranty';
    return `${w.value} ${w.unit}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Link to={`/repairs/${id}`} className="inline-flex items-center gap-2 text-sm text-[#737373] hover:text-[#111111] mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Repair
      </Link>

      {/* Request summary */}
      {request && (
        <div className="card p-5 mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#111111]">Compare Quotations</h1>
            <p className="text-sm text-[#737373] mt-1">
              {request.deviceBrand} {request.deviceModel} · {request.issueCategory}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              className="input-field py-2 pr-8 text-sm"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="createdAt">Most Recent</option>
              <option value="price_asc">Lowest Price</option>
              <option value="price_desc">Highest Price</option>
              <option value="duration">Fastest Repair</option>
            </select>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
        </div>
      ) : quotations.length === 0 ? (
        <EmptyState
          icon={Award}
          title="No quotations yet"
          description="Vendors are reviewing your request. Check back soon or wait for notifications."
        />
      ) : (
        <div className="space-y-4">
          {quotations.map((q, index) => {
            const vp = q.vendorProfile;
            const isAccepted = q.status === 'accepted';
            const isBestPrice = index === 0 && sort === 'price_asc';

            return (
              <div
                key={q._id}
                className={`card p-6 ${isAccepted ? 'border-green-400 bg-green-50/30' : ''}`}
              >
                {/* Vendor header */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#111111] flex items-center justify-center shrink-0 overflow-hidden">
                    {vp?.logo ? (
                      <img src={vp.logo} alt={vp.businessName} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-bold text-lg">
                        {vp?.businessName?.charAt(0) || 'V'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-semibold text-[#111111]">{vp?.businessName}</h3>
                      {vp?.isVerified && (
                        <span className="flex items-center gap-1 badge-success">
                          <Shield className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                      {isBestPrice && (
                        <span className="badge-black flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          Best Price
                        </span>
                      )}
                      {isAccepted && (
                        <span className="badge-success flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Selected
                        </span>
                      )}
                    </div>
                    {vp?.rating?.count > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-medium text-[#111111]">
                          {vp.rating.average?.toFixed(1)}
                        </span>
                        <span className="text-xs text-[#737373]">
                          ({vp.rating.count} reviews)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Price */}
                  <div className="text-right shrink-0">
                    <p className="text-2xl font-bold text-[#111111]">₹{q.totalCost?.toLocaleString()}</p>
                    <p className="text-xs text-[#737373]">Total Cost</p>
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-[#E5E5E5]">
                  <div>
                    <p className="text-xs text-[#737373] mb-1">Parts</p>
                    <p className="text-sm font-medium text-[#111111]">₹{(q.partsCoast || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#737373] mb-1">Labour</p>
                    <p className="text-sm font-medium text-[#111111]">₹{(q.labourCost || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#737373] mb-1">Warranty</p>
                    <p className="text-sm font-medium text-[#111111]">{formatWarranty(q.warrantyPeriod)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#737373] mb-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Est. Time
                    </p>
                    <p className="text-sm font-medium text-[#111111]">{formatDuration(q.estimatedDuration)}</p>
                  </div>
                  {q.additionalCharges > 0 && (
                    <div>
                      <p className="text-xs text-[#737373] mb-1">Additional</p>
                      <p className="text-sm font-medium text-[#111111]">₹{q.additionalCharges.toLocaleString()}</p>
                    </div>
                  )}
                </div>

                {/* Explanation */}
                <div className="mt-4">
                  <p className="text-xs text-[#737373] mb-1">Repair Details</p>
                  <p className="text-sm text-[#525252]">{q.repairExplanation}</p>
                </div>

                {q.conditions && (
                  <div className="mt-3 p-3 bg-[#F5F5F5] rounded-lg">
                    <p className="text-xs text-[#737373]">{q.conditions}</p>
                  </div>
                )}

                {/* Action */}
                {!request?.selectedQuotation && q.status === 'submitted' && (
                  <div className="mt-5 pt-4 border-t border-[#E5E5E5] flex items-center gap-3">
                    <button
                      onClick={() => handleSelect(q._id)}
                      disabled={!!selectingId}
                      className="btn-primary flex items-center gap-2"
                    >
                      {selectingId === q._id ? (
                        <Spinner size="sm" className="border-white/30 border-t-white" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Select Vendor
                    </button>
                    <Link
                      to={`/vendors/${q.vendorProfile?._id}`}
                      className="btn-ghost text-sm"
                    >
                      View Profile
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 flex items-start gap-2 text-xs text-[#737373]">
        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <p>Prices are estimates provided by vendors. Final costs may vary based on inspection. Selecting a vendor creates a booking.</p>
      </div>
    </div>
  );
};

export default Quotations;
