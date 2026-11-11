import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, Upload, X, CheckCircle } from 'lucide-react';
import { vendorAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { Spinner } from '../../components/ui/Loading';

const DEVICE_CATEGORIES = ['Smartphone', 'Laptop', 'Tablet', 'Desktop', 'Smartwatch', 'Other'];

const VendorRegistration = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { updateVendorProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const [form, setForm] = useState({
    businessName: '',
    description: '',
    contactEmail: '',
    contactPhone: '',
    city: '',
    area: '',
    pinCode: '',
    state: '',
    serviceAreas: '',
    deviceCategories: [],
    supportedBrands: '',
    specializations: '',
    gstNumber: '',
    establishedYear: '',
  });

  const handleChange = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const toggleCategory = (cat) => {
    setForm(f => ({
      ...f,
      deviceCategories: f.deviceCategories.includes(cat)
        ? f.deviceCategories.filter(c => c !== cat)
        : [...f.deviceCategories, cat],
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setLogo(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.businessName || !form.city || form.deviceCategories.length === 0) {
      toast.error('Please fill in all required fields and select at least one device category.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      if (logo) formData.append('logo', logo);
      Object.entries(form).forEach(([k, v]) => {
        if (Array.isArray(v)) {
          v.forEach(item => formData.append(k, item));
        } else if (v) {
          formData.append(k, v);
        }
      });

      const { data } = await vendorAPI.register(formData);
      updateVendorProfile(data.profile);
      toast.success('Vendor profile created! Awaiting verification.');
      navigate('/vendor');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#111111]">Set Up Vendor Profile</h1>
        <p className="text-[#737373] text-sm mt-1">
          Complete your profile to start receiving repair requests. Your account will be reviewed within 2-3 business days.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Info */}
        <div className="card p-6 space-y-4">
          <h2 className="text-base font-semibold text-[#111111]">Business Information</h2>

          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-[#F5F5F5] border border-[#E5E5E5] overflow-hidden flex items-center justify-center">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Wrench className="w-7 h-7 text-[#A3A3A3]" strokeWidth={1.5} />
              )}
            </div>
            <label className="btn-secondary cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />Upload Logo
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
            </label>
          </div>

          <div>
            <label className="form-label">Business Name <span className="text-red-500">*</span></label>
            <input className="input-field" placeholder="e.g. TechFix Solutions" value={form.businessName} onChange={e => handleChange('businessName', e.target.value)} required />
          </div>
          <div>
            <label className="form-label">Description</label>
            <textarea rows={3} className="input-field resize-none" placeholder="Describe your services, expertise and experience..." value={form.description} onChange={e => handleChange('description', e.target.value)} />
          </div>
        </div>

        {/* Service Details */}
        <div className="card p-6 space-y-4">
          <h2 className="text-base font-semibold text-[#111111]">Service Details</h2>

          <div>
            <label className="form-label">Device Categories <span className="text-red-500">*</span></label>
            <div className="flex flex-wrap gap-2">
              {DEVICE_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    form.deviceCategories.includes(cat)
                      ? 'bg-[#111111] border-[#111111] text-white'
                      : 'border-[#E5E5E5] text-[#525252] hover:border-[#A3A3A3]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="form-label">Supported Brands</label>
            <input className="input-field" placeholder="Apple, Samsung, Dell, HP (comma-separated)" value={form.supportedBrands} onChange={e => handleChange('supportedBrands', e.target.value)} />
          </div>

          <div>
            <label className="form-label">Specializations</label>
            <input className="input-field" placeholder="Screen replacement, Water damage, Data recovery (comma-separated)" value={form.specializations} onChange={e => handleChange('specializations', e.target.value)} />
          </div>
        </div>

        {/* Location */}
        <div className="card p-6 space-y-4">
          <h2 className="text-base font-semibold text-[#111111]">Location</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">City <span className="text-red-500">*</span></label>
              <input className="input-field" placeholder="Mumbai" value={form.city} onChange={e => handleChange('city', e.target.value)} required />
            </div>
            <div>
              <label className="form-label">Area</label>
              <input className="input-field" placeholder="Andheri West" value={form.area} onChange={e => handleChange('area', e.target.value)} />
            </div>
            <div>
              <label className="form-label">PIN Code</label>
              <input className="input-field" placeholder="400053" value={form.pinCode} onChange={e => handleChange('pinCode', e.target.value)} />
            </div>
            <div>
              <label className="form-label">State</label>
              <input className="input-field" placeholder="Maharashtra" value={form.state} onChange={e => handleChange('state', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="form-label">Service Areas</label>
            <input className="input-field" placeholder="Andheri, Bandra, Juhu (comma-separated)" value={form.serviceAreas} onChange={e => handleChange('serviceAreas', e.target.value)} />
          </div>
        </div>

        {/* Contact */}
        <div className="card p-6 space-y-4">
          <h2 className="text-base font-semibold text-[#111111]">Contact Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Business Email</label>
              <input type="email" className="input-field" placeholder="repairs@yourbusiness.com" value={form.contactEmail} onChange={e => handleChange('contactEmail', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Business Phone</label>
              <input type="tel" className="input-field" placeholder="+91 98765 43210" value={form.contactPhone} onChange={e => handleChange('contactPhone', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">GST Number (optional)</label>
              <input className="input-field" placeholder="22AAAAA0000A1Z5" value={form.gstNumber} onChange={e => handleChange('gstNumber', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Established Year</label>
              <input type="number" className="input-field" placeholder="2018" value={form.establishedYear} onChange={e => handleChange('establishedYear', e.target.value)} />
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
          {loading ? (
            <><Spinner size="sm" className="border-white/30 border-t-white" />Creating profile...</>
          ) : (
            <><CheckCircle className="w-4 h-4" />Submit for Verification</>
          )}
        </button>
      </form>
    </div>
  );
};

export default VendorRegistration;
