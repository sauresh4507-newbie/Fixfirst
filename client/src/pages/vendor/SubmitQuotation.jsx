import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { repairAPI, quotationAPI } from '../../services/api';
import { Spinner } from '../../components/ui/Loading';
import { useToast } from '../../components/ui/Toast';

const SubmitQuotation = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    totalCost: '',
    partsCoast: '',
    labourCost: '',
    additionalCharges: '',
    additionalChargesDescription: '',
    estimatedDurationValue: '',
    estimatedDurationUnit: 'days',
    repairExplanation: '',
    warrantyValue: '',
    warrantyUnit: 'months',
    conditions: '',
  });

  useEffect(() => {
    repairAPI.getById(requestId).then(({ data }) => setRequest(data.request)).catch(() => navigate('/vendor/requests'));
  }, [requestId]);

  const handleChange = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.totalCost || !form.estimatedDurationValue || !form.repairExplanation) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await quotationAPI.submit({ ...form, repairRequestId: requestId });
      toast.success('Quotation submitted successfully!');
      navigate('/vendor/requests');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit quotation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <Link to="/vendor/requests" className="inline-flex items-center gap-2 text-sm text-[#737373] hover:text-[#111111] mb-6">
        <ArrowLeft className="w-4 h-4" />Available Requests
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111111]">Submit Quotation</h1>
        {request && (
          <p className="text-sm text-[#737373] mt-1">
            For: {request.deviceBrand} {request.deviceModel} · {request.issueCategory}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Pricing */}
        <div className="card p-6 space-y-4">
          <h2 className="text-base font-semibold text-[#111111]">Pricing</h2>
          <div>
            <label className="form-label">Total Repair Cost (₹) <span className="text-red-500">*</span></label>
            <input type="number" min="0" className="input-field" placeholder="5500" value={form.totalCost} onChange={e => handleChange('totalCost', e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Parts Cost (₹)</label>
              <input type="number" min="0" className="input-field" placeholder="3000" value={form.partsCoast} onChange={e => handleChange('partsCoast', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Labour Cost (₹)</label>
              <input type="number" min="0" className="input-field" placeholder="2500" value={form.labourCost} onChange={e => handleChange('labourCost', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Additional Charges (₹)</label>
              <input type="number" min="0" className="input-field" placeholder="0" value={form.additionalCharges} onChange={e => handleChange('additionalCharges', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Description</label>
              <input className="input-field" placeholder="e.g. Shipping cost" value={form.additionalChargesDescription} onChange={e => handleChange('additionalChargesDescription', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Timeline & Warranty */}
        <div className="card p-6 space-y-4">
          <h2 className="text-base font-semibold text-[#111111]">Timeline & Warranty</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Estimated Duration <span className="text-red-500">*</span></label>
              <div className="flex gap-2">
                <input type="number" min="1" className="input-field flex-1" placeholder="2" value={form.estimatedDurationValue} onChange={e => handleChange('estimatedDurationValue', e.target.value)} required />
                <select className="input-field w-24" value={form.estimatedDurationUnit} onChange={e => handleChange('estimatedDurationUnit', e.target.value)}>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                </select>
              </div>
            </div>
            <div>
              <label className="form-label">Warranty Period</label>
              <div className="flex gap-2">
                <input type="number" min="0" className="input-field flex-1" placeholder="3" value={form.warrantyValue} onChange={e => handleChange('warrantyValue', e.target.value)} />
                <select className="input-field w-28" value={form.warrantyUnit} onChange={e => handleChange('warrantyUnit', e.target.value)}>
                  <option value="days">Days</option>
                  <option value="months">Months</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Explanation */}
        <div className="card p-6 space-y-4">
          <h2 className="text-base font-semibold text-[#111111]">Repair Details</h2>
          <div>
            <label className="form-label">Repair Explanation <span className="text-red-500">*</span></label>
            <textarea rows={4} className="input-field resize-none" placeholder="Explain what needs to be repaired, what parts are required, and your repair process..." value={form.repairExplanation} onChange={e => handleChange('repairExplanation', e.target.value)} required />
          </div>
          <div>
            <label className="form-label">Additional Conditions</label>
            <textarea rows={2} className="input-field resize-none" placeholder="Any special conditions, requirements, or notes..." value={form.conditions} onChange={e => handleChange('conditions', e.target.value)} />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
          {loading ? (
            <><Spinner size="sm" className="border-white/30 border-t-white" />Submitting...</>
          ) : (
            <><CheckCircle className="w-4 h-4" />Submit Quotation</>
          )}
        </button>
      </form>
    </div>
  );
};

export default SubmitQuotation;
