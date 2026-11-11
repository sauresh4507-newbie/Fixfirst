import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Smartphone, Laptop, Tablet, Monitor, Watch, Wrench,
  MapPin, Calendar, BrainCircuit, ChevronRight, AlertCircle, CheckCircle,
  ArrowLeft, MessageSquare, Users, X
} from 'lucide-react';
import { repairAPI } from '../../services/api';
import { Spinner, CardSkeleton } from '../../components/ui/Loading';
import StatusBadge from '../../components/ui/StatusBadge';
import { useToast } from '../../components/ui/Toast';

const deviceIcons = {
  Smartphone, Laptop, Tablet, Desktop: Monitor, Smartwatch: Watch, Other: Wrench,
};

const RepairDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [escalating, setEscalating] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const fetchRequest = async () => {
    try {
      const { data } = await repairAPI.getById(id);
      setRequest(data.request);
    } catch (err) {
      toast.error('Repair request not found');
      navigate('/repairs');
    } finally {
      setLoading(false);
    }
  };

  const handleEscalate = async () => {
    setEscalating(true);
    try {
      await repairAPI.escalate(id);
      toast.success('Request published to vendors!');
      fetchRequest();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to escalate');
    } finally {
      setEscalating(false);
    }
  };

  const handleClose = async () => {
    if (!confirm('Are you sure you want to close this request? This marks the issue as resolved.')) return;
    setClosing(true);
    try {
      await repairAPI.close(id);
      toast.success('Request closed successfully');
      fetchRequest();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to close');
    } finally {
      setClosing(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <CardSkeleton />
      </div>
    );
  }

  if (!request) return null;

  const Icon = deviceIcons[request.deviceCategory] || Wrench;
  const ai = request.aiAnalysis;
  const isHardware = ai?.classification === 'hardware';
  const canEscalate = ['submitted', 'troubleshooting'].includes(request.status) && !request.isPublic;
  const hasQuotations = request.quotationCount > 0;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Back */}
      <Link to="/repairs" className="inline-flex items-center gap-2 text-sm text-[#737373] hover:text-[#111111] mb-6">
        <ArrowLeft className="w-4 h-4" />
        All Requests
      </Link>

      {/* Header */}
      <div className="card p-6 mb-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#F5F5F5] flex items-center justify-center shrink-0">
            <Icon className="w-6 h-6 text-[#525252]" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-[#111111]">
                  {request.deviceBrand} {request.deviceModel}
                </h1>
                <p className="text-sm text-[#737373]">{request.deviceCategory} · {request.issueCategory}</p>
              </div>
              <StatusBadge status={request.status} />
            </div>

            <div className="flex flex-wrap gap-4 mt-4 text-xs text-[#737373]">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {request.location?.city}{request.location?.area ? `, ${request.location.area}` : ''}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(request.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
              {request.quotationCount > 0 && (
                <span className="flex items-center gap-1 font-medium text-[#111111]">
                  <Users className="w-3 h-3" />
                  {request.quotationCount} vendor quote{request.quotationCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 mt-5 pt-5 border-t border-[#E5E5E5]">
          {hasQuotations && !request.selectedQuotation && (
            <Link to={`/repairs/${id}/quotations`} className="btn-primary flex items-center gap-2">
              <Users className="w-4 h-4" />
              Compare {request.quotationCount} Quote{request.quotationCount !== 1 ? 's' : ''}
            </Link>
          )}
          {canEscalate && (
            <button
              onClick={handleEscalate}
              disabled={escalating}
              className="btn-secondary flex items-center gap-2"
            >
              {escalating ? <Spinner size="sm" /> : null}
              Find Repair Vendors
            </button>
          )}
          {request.status === 'troubleshooting' && (
            <Link to={`/repairs/${id}/troubleshoot`} className="btn-secondary flex items-center gap-2">
              <BrainCircuit className="w-4 h-4" />
              AI Troubleshoot
            </Link>
          )}
          {['repair_completed', 'delivered'].includes(request.status) && !request.selectedQuotation && (
            <button
              onClick={handleClose}
              disabled={closing}
              className="btn-secondary flex items-center gap-2"
            >
              {closing ? <Spinner size="sm" /> : <CheckCircle className="w-4 h-4" />}
              Mark as Resolved
            </button>
          )}
        </div>
      </div>

      {/* Issue Description */}
      <div className="card p-6 mb-5">
        <h2 className="text-sm font-semibold text-[#111111] mb-3">Issue Description</h2>
        <p className="text-sm text-[#525252] leading-relaxed">{request.issueDescription}</p>
        {request.problemStarted && (
          <p className="text-xs text-[#737373] mt-3">Started: {request.problemStarted}</p>
        )}
      </div>

      {/* Device Images */}
      {request.images && request.images.length > 0 && (
        <div className="card p-6 mb-5">
          <h2 className="text-sm font-semibold text-[#111111] mb-3">Device Photos</h2>
          <div className="grid grid-cols-3 gap-3">
            {request.images.map((img, i) => (
              <a key={i} href={img.url} target="_blank" rel="noopener noreferrer">
                <img
                  src={img.url}
                  alt={`Device ${i + 1}`}
                  className="w-full aspect-square object-cover rounded-xl border border-[#E5E5E5] hover:opacity-90 transition-opacity"
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* AI Analysis */}
      {ai && ai.classification !== 'pending' && (
        <div className="card p-6 mb-5">
          <div className="flex items-center gap-2 mb-4">
            <BrainCircuit className="w-5 h-5 text-[#111111]" strokeWidth={1.5} />
            <h2 className="text-sm font-semibold text-[#111111]">AI Analysis</h2>
            {ai.mockMode && (
              <span className="badge-neutral text-xs">Demo Mode</span>
            )}
          </div>

          {ai.summary && (
            <p className="text-sm text-[#525252] mb-4">{ai.summary}</p>
          )}

          <div className="flex flex-wrap gap-3 mb-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F5F5F5] rounded-lg">
              <span className="text-xs text-[#737373]">Classification</span>
              <span className="text-xs font-semibold text-[#111111] capitalize">{ai.classification?.replace('_', ' ')}</span>
            </div>
            {ai.confidence && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#F5F5F5] rounded-lg">
                <span className="text-xs text-[#737373]">Confidence</span>
                <span className="text-xs font-semibold text-[#111111]">{ai.confidence}%</span>
              </div>
            )}
          </div>

          {ai.possibleCauses?.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-[#737373] uppercase tracking-wider mb-2">Possible Causes</p>
              <ul className="space-y-1.5">
                {ai.possibleCauses.map((cause, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#525252]">
                    <span className="text-[#A3A3A3] mt-0.5">•</span>
                    {cause}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {ai.safetyWarnings?.length > 0 && (
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-amber-800 mb-1">Safety Warning</p>
                {ai.safetyWarnings.map((w, i) => (
                  <p key={i} className="text-xs text-amber-700">{w}</p>
                ))}
              </div>
            </div>
          )}

          {ai.professionalRepairRecommended && (
            <div className="mt-4 p-4 bg-[#F5F5F5] rounded-xl flex items-start gap-3">
              <Wrench className="w-4 h-4 text-[#525252] mt-0.5 shrink-0" />
              <p className="text-sm text-[#525252]">
                Professional repair is recommended for this issue. Our AI may not be able to resolve hardware problems remotely.
                We are finding available repair vendors near you.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RepairDetails;
