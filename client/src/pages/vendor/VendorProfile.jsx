import { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Star, Shield, Wrench, Package } from 'lucide-react';
import { vendorAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { CardSkeleton, Spinner } from '../../components/ui/Loading';

const DEVICE_CATEGORIES = ['Smartphone', 'Laptop', 'Tablet', 'Desktop', 'Smartwatch', 'Other'];

const VendorProfile = () => {
  const { updateVendorProfile } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({});
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    vendorAPI.getProfile()
      .then(({ data }) => {
        setProfile(data.profile);
        setForm({
          businessName: data.profile.businessName || '',
          description: data.profile.description || '',
          contactEmail: data.profile.contactEmail || '',
          contactPhone: data.profile.contactPhone || '',
          city: data.profile.address?.city || '',
          area: data.profile.address?.area || '',
          pinCode: data.profile.address?.pinCode || '',
          state: data.profile.address?.state || '',
          serviceAreas: data.profile.serviceAreas?.join(', ') || '',
          supportedBrands: data.profile.supportedBrands?.join(', ') || '',
          specializations: data.profile.specializations?.join(', ') || '',
          deviceCategories: data.profile.deviceCategories || [],
        });
        setLogoPreview(data.profile.logo);
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const toggleCategory = (cat) => {
    setForm(f => ({
      ...f,
      deviceCategories: f.deviceCategories.includes(cat)
        ? f.deviceCategories.filter(c => c !== cat)
        : [...f.deviceCategories, cat],
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      if (logo) formData.append('logo', logo);
      Object.entries(form).forEach(([k, v]) => {
        if (Array.isArray(v)) v.forEach(i => formData.append(k, i));
        else if (v) formData.append(k, v);
      });
      const { data } = await vendorAPI.updateProfile(formData);
      setProfile(data.profile);
      updateVendorProfile(data.profile);
      toast.success('Profile updated.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-8"><CardSkeleton /></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#111111]">Vendor Profile</h1>
        <div className="flex items-center gap-2 mt-1">
          {profile?.isVerified ? (
            <span className="badge-success flex items-center gap-1 text-xs"><Shield className="w-3 h-3" />Verified</span>
          ) : (
            <span className="badge-warning text-xs">{profile?.verificationStatus?.replace('_', ' ')}</span>
          )}
          {profile?.rating?.count > 0 && (
            <span className="flex items-center gap-1 text-xs text-[#737373]">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              {profile.rating.average?.toFixed(1)} ({profile.rating.count} reviews)
            </span>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Business Info */}
        <div className="card p-6 space-y-4">
          <h2 className="text-base font-semibold text-[#111111]">Business Information</h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-[#111111] flex items-center justify-center overflow-hidden shrink-0">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white text-xl font-bold">{profile?.businessName?.charAt(0)}</span>
              )}
            </div>
            <label className="btn-secondary cursor-pointer text-sm">
              Change Logo
              <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files[0]; if (f) { setLogo(f); setLogoPreview(URL.createObjectURL(f)); }}} />
            </label>
          </div>
          <div>
            <label className="form-label">Business Name</label>
            <input className="input-field" value={form.businessName || ''} onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))} />
          </div>
          <div>
            <label className="form-label">Description</label>
            <textarea rows={3} className="input-field resize-none" value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
        </div>

        {/* Device Categories */}
        <div className="card p-6 space-y-4">
          <h2 className="text-base font-semibold text-[#111111]">Services</h2>
          <div>
            <label className="form-label">Device Categories</label>
            <div className="flex flex-wrap gap-2">
              {DEVICE_CATEGORIES.map(cat => (
                <button key={cat} type="button" onClick={() => toggleCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                    form.deviceCategories?.includes(cat)
                      ? 'bg-[#111111] border-[#111111] text-white'
                      : 'border-[#E5E5E5] text-[#525252] hover:border-[#A3A3A3]'
                  }`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="form-label">Supported Brands</label>
            <input className="input-field" placeholder="Apple, Samsung, Dell (comma-separated)" value={form.supportedBrands || ''} onChange={e => setForm(f => ({ ...f, supportedBrands: e.target.value }))} />
          </div>
          <div>
            <label className="form-label">Specializations</label>
            <input className="input-field" placeholder="Screen replacement, Water damage (comma-separated)" value={form.specializations || ''} onChange={e => setForm(f => ({ ...f, specializations: e.target.value }))} />
          </div>
        </div>

        {/* Location */}
        <div className="card p-6 space-y-4">
          <h2 className="text-base font-semibold text-[#111111]">Location</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="form-label">City</label><input className="input-field" value={form.city || ''} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} /></div>
            <div><label className="form-label">Area</label><input className="input-field" value={form.area || ''} onChange={e => setForm(f => ({ ...f, area: e.target.value }))} /></div>
            <div><label className="form-label">PIN Code</label><input className="input-field" value={form.pinCode || ''} onChange={e => setForm(f => ({ ...f, pinCode: e.target.value }))} /></div>
            <div><label className="form-label">State</label><input className="input-field" value={form.state || ''} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} /></div>
          </div>
          <div>
            <label className="form-label">Service Areas</label>
            <input className="input-field" placeholder="Andheri, Bandra (comma-separated)" value={form.serviceAreas || ''} onChange={e => setForm(f => ({ ...f, serviceAreas: e.target.value }))} />
          </div>
        </div>

        {/* Contact */}
        <div className="card p-6 space-y-4">
          <h2 className="text-base font-semibold text-[#111111]">Contact</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="form-label">Email</label><input type="email" className="input-field" value={form.contactEmail || ''} onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))} /></div>
            <div><label className="form-label">Phone</label><input type="tel" className="input-field" value={form.contactPhone || ''} onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))} /></div>
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
          {saving ? <><Spinner size="sm" className="border-white/30 border-t-white" />Saving...</> : 'Save Profile'}
        </button>
      </form>
    </div>
  );
};

export default VendorProfile;
