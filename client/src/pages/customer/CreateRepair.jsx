import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Smartphone, Laptop, Tablet, Monitor, Watch, Wrench,
  Camera, Upload, X, ChevronRight, ChevronLeft, CheckCircle, AlertCircle
} from 'lucide-react';
import { repairAPI } from '../../services/api';
import { useToast } from '../../components/ui/Toast';
import { Spinner } from '../../components/ui/Loading';

const DEVICE_CATEGORIES = ['Smartphone', 'Laptop', 'Tablet', 'Desktop', 'Smartwatch', 'Other'];
const ISSUE_CATEGORIES = [
  'Screen damage', 'Battery', 'Charging', 'Camera', 'Buttons',
  'Software', 'Performance', 'Water damage', 'Speaker', 'Microphone', 'Other',
];
const DEVICE_CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor'];

const categoryIcons = {
  Smartphone, Laptop, Tablet, Desktop: Monitor, Smartwatch: Watch, Other: Wrench,
};

const CreateRepair = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    deviceCategory: '',
    deviceBrand: '',
    deviceModel: '',
    operatingSystem: '',
    issueCategory: '',
    issueDescription: '',
    problemStarted: '',
    deviceCondition: '',
    city: '',
    area: '',
    pinCode: '',
  });

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});

  const validateStep = () => {
    const errs = {};
    if (step === 1) {
      if (!form.deviceCategory) errs.deviceCategory = 'Please select a device category';
      if (!form.deviceBrand) errs.deviceBrand = 'Please enter the brand';
      if (!form.deviceModel) errs.deviceModel = 'Please enter the model';
    }
    if (step === 2) {
      if (!form.issueCategory) errs.issueCategory = 'Please select an issue category';
      if (!form.issueDescription || form.issueDescription.length < 20)
        errs.issueDescription = 'Please describe the issue in at least 20 characters';
    }
    if (step === 4) {
      if (!form.city) errs.city = 'City is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => {
    if (validateStep()) setStep((s) => s + 1);
  };

  const back = () => setStep((s) => s - 1);

  const handleChange = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
  };

  const handleImageAdd = (e) => {
    const files = Array.from(e.target.files);
    const allowed = files.filter((f) => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024);

    if (allowed.length !== files.length) {
      toast.warning('Some files were skipped (must be images under 5MB)');
    }

    const newImages = [...images, ...allowed].slice(0, 5);
    setImages(newImages);

    const newPreviews = newImages.map((f) => URL.createObjectURL(f));
    setImagePreviews(newPreviews);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newImages.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => v && formData.append(k, v));
      images.forEach((img) => formData.append('images', img));

      const { data } = await repairAPI.create(formData);
      toast.success('Repair request submitted! Analyzing your issue...');
      navigate(`/repairs/${data.repairRequest._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, label: 'Device' },
    { number: 2, label: 'Issue' },
    { number: 3, label: 'Photos' },
    { number: 4, label: 'Location' },
    { number: 5, label: 'Review' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#111111]">Create Repair Request</h1>
        <p className="text-[#737373] text-sm mt-1">Fill in the details and our AI will analyze your issue</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 right-0 top-5 h-px bg-[#E5E5E5] z-0" />
        {steps.map((s) => (
          <div key={s.number} className="relative z-10 flex flex-col items-center gap-1.5">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all ${
                step > s.number
                  ? 'bg-[#111111] border-[#111111] text-white'
                  : step === s.number
                  ? 'bg-white border-[#111111] text-[#111111]'
                  : 'bg-white border-[#E5E5E5] text-[#A3A3A3]'
              }`}
            >
              {step > s.number ? <CheckCircle className="w-5 h-5" /> : s.number}
            </div>
            <span className={`text-xs font-medium ${step >= s.number ? 'text-[#111111]' : 'text-[#A3A3A3]'}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      <div className="card p-6">
        {/* Step 1: Device Info */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-[#111111] mb-1">Device Information</h2>
              <p className="text-sm text-[#737373]">Tell us about the device that needs repair</p>
            </div>

            <div>
              <label className="form-label">Device Category</label>
              <div className="grid grid-cols-3 gap-2">
                {DEVICE_CATEGORIES.map((cat) => {
                  const Icon = categoryIcons[cat] || Wrench;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleChange('deviceCategory', cat)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 text-xs font-medium transition-all ${
                        form.deviceCategory === cat
                          ? 'border-[#111111] bg-[#111111] text-white'
                          : 'border-[#E5E5E5] hover:border-[#A3A3A3] text-[#525252]'
                      }`}
                    >
                      <Icon className="w-5 h-5" strokeWidth={1.5} />
                      {cat}
                    </button>
                  );
                })}
              </div>
              {errors.deviceCategory && <p className="form-error">{errors.deviceCategory}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Brand</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Apple, Samsung"
                  value={form.deviceBrand}
                  onChange={(e) => handleChange('deviceBrand', e.target.value)}
                />
                {errors.deviceBrand && <p className="form-error">{errors.deviceBrand}</p>}
              </div>
              <div>
                <label className="form-label">Model</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. iPhone 14, XPS 15"
                  value={form.deviceModel}
                  onChange={(e) => handleChange('deviceModel', e.target.value)}
                />
                {errors.deviceModel && <p className="form-error">{errors.deviceModel}</p>}
              </div>
            </div>

            <div>
              <label className="form-label">Operating System (optional)</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. iOS 17, Windows 11, Android 14"
                value={form.operatingSystem}
                onChange={(e) => handleChange('operatingSystem', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Step 2: Issue Info */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-[#111111] mb-1">Describe the Issue</h2>
              <p className="text-sm text-[#737373]">Help us understand what's wrong with your device</p>
            </div>

            <div>
              <label className="form-label">Issue Category</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ISSUE_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleChange('issueCategory', cat)}
                    className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all text-left ${
                      form.issueCategory === cat
                        ? 'border-[#111111] bg-[#111111] text-white'
                        : 'border-[#E5E5E5] hover:border-[#A3A3A3] text-[#525252]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              {errors.issueCategory && <p className="form-error">{errors.issueCategory}</p>}
            </div>

            <div>
              <label className="form-label">Problem Description</label>
              <textarea
                rows={5}
                className="input-field resize-none"
                placeholder="Describe the issue in detail. When did it start? What happens when you use the device? Any recent damage or incidents?"
                value={form.issueDescription}
                onChange={(e) => handleChange('issueDescription', e.target.value)}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.issueDescription
                  ? <p className="form-error">{errors.issueDescription}</p>
                  : <span />}
                <span className="text-xs text-[#A3A3A3]">{form.issueDescription.length}/2000</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">When did it start?</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. 2 days ago, after a fall"
                  value={form.problemStarted}
                  onChange={(e) => handleChange('problemStarted', e.target.value)}
                />
              </div>
              <div>
                <label className="form-label">Device Condition</label>
                <select
                  className="input-field"
                  value={form.deviceCondition}
                  onChange={(e) => handleChange('deviceCondition', e.target.value)}
                >
                  <option value="">Select condition</option>
                  {DEVICE_CONDITIONS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Photos */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-[#111111] mb-1">Upload Photos</h2>
              <p className="text-sm text-[#737373]">Photos help vendors understand the damage better (optional, max 5 images)</p>
            </div>

            {/* Upload area */}
            <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-[#E5E5E5] rounded-xl hover:border-[#A3A3A3] cursor-pointer transition-colors bg-[#F5F5F5] hover:bg-white">
              <Upload className="w-8 h-8 text-[#A3A3A3] mb-2" strokeWidth={1.5} />
              <span className="text-sm text-[#737373]">Click to upload photos</span>
              <span className="text-xs text-[#A3A3A3] mt-1">JPEG, PNG, WebP up to 5MB each</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={handleImageAdd}
                disabled={images.length >= 5}
              />
            </label>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {imagePreviews.map((preview, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-[#E5E5E5]">
                    <img src={preview} alt={`Device ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-[#111111] flex items-center justify-center"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-start gap-3 p-4 bg-[#F5F5F5] rounded-xl">
              <AlertCircle className="w-4 h-4 text-[#737373] shrink-0 mt-0.5" />
              <p className="text-xs text-[#737373]">
                You can skip this step. If photos cannot be uploaded now, you can describe the damage in text. Vendors can also request photos later.
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Location */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-[#111111] mb-1">Your Location</h2>
              <p className="text-sm text-[#737373]">We use this to match you with nearby repair vendors</p>
            </div>

            <div>
              <label className="form-label">City</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Mumbai, Bengaluru, Delhi"
                value={form.city}
                onChange={(e) => handleChange('city', e.target.value)}
              />
              {errors.city && <p className="form-error">{errors.city}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Area / Locality (optional)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Koramangala"
                  value={form.area}
                  onChange={(e) => handleChange('area', e.target.value)}
                />
              </div>
              <div>
                <label className="form-label">PIN Code (optional)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. 560034"
                  value={form.pinCode}
                  onChange={(e) => handleChange('pinCode', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Review */}
        {step === 5 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-[#111111] mb-1">Review Your Request</h2>
              <p className="text-sm text-[#737373]">Please confirm the details before submitting</p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-[#F5F5F5] rounded-xl">
                <p className="text-xs font-semibold text-[#737373] uppercase tracking-wider mb-3">Device</p>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#737373]">Category</span>
                    <span className="font-medium text-[#111111]">{form.deviceCategory}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#737373]">Brand & Model</span>
                    <span className="font-medium text-[#111111]">{form.deviceBrand} {form.deviceModel}</span>
                  </div>
                  {form.operatingSystem && (
                    <div className="flex justify-between text-sm">
                      <span className="text-[#737373]">OS</span>
                      <span className="font-medium text-[#111111]">{form.operatingSystem}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-[#F5F5F5] rounded-xl">
                <p className="text-xs font-semibold text-[#737373] uppercase tracking-wider mb-3">Issue</p>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#737373]">Category</span>
                    <span className="font-medium text-[#111111]">{form.issueCategory}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-[#737373]">Description</span>
                    <p className="font-medium text-[#111111] mt-1">{form.issueDescription}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#F5F5F5] rounded-xl">
                <p className="text-xs font-semibold text-[#737373] uppercase tracking-wider mb-3">Location</p>
                <div className="flex justify-between text-sm">
                  <span className="text-[#737373]">City</span>
                  <span className="font-medium text-[#111111]">{form.city}{form.area ? `, ${form.area}` : ''}</span>
                </div>
              </div>

              {images.length > 0 && (
                <div className="p-4 bg-[#F5F5F5] rounded-xl">
                  <p className="text-xs font-semibold text-[#737373] uppercase tracking-wider mb-3">Photos</p>
                  <p className="text-sm text-[#111111]">{images.length} photo{images.length !== 1 ? 's' : ''} attached</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className={`flex mt-6 pt-5 border-t border-[#E5E5E5] ${step > 1 ? 'justify-between' : 'justify-end'}`}>
          {step > 1 && (
            <button onClick={back} className="btn-secondary flex items-center gap-2">
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          )}
          {step < 5 ? (
            <button onClick={next} className="btn-primary flex items-center gap-2">
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="border-white/30 border-t-white" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Request
                  <CheckCircle className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateRepair;
