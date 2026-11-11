import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Mail, Shield, Star, Clock, CheckCircle } from 'lucide-react';
import { bookingAPI } from '../../services/api';
import { CardSkeleton } from '../../components/ui/Loading';
import StatusBadge from '../../components/ui/StatusBadge';
import { useToast } from '../../components/ui/Toast';

const statusSteps = [
  { key: 'vendor_selected', label: 'Vendor Selected' },
  { key: 'repair_accepted', label: 'Repair Accepted' },
  { key: 'device_received', label: 'Device Received' },
  { key: 'repair_in_progress', label: 'Repair In Progress' },
  { key: 'repair_completed', label: 'Repair Completed' },
  { key: 'delivered', label: 'Delivered' },
];

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    try {
      const { data } = await bookingAPI.getById(id);
      setBooking(data.booking);
    } catch {
      toast.error('Booking not found');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="max-w-3xl mx-auto px-4 py-8"><CardSkeleton /></div>;
  }

  const currentStepIdx = statusSteps.findIndex(s => s.key === booking?.status);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-[#737373] hover:text-[#111111] mb-6">
        <ArrowLeft className="w-4 h-4" />
        Dashboard
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#111111]">Booking Details</h1>
          <p className="text-sm text-[#737373] mt-1">
            {booking?.repairRequest?.deviceBrand} {booking?.repairRequest?.deviceModel}
          </p>
        </div>
        <StatusBadge status={booking?.status} />
      </div>

      {/* Progress tracker */}
      <div className="card p-6 mb-5">
        <h2 className="text-sm font-semibold text-[#111111] mb-5">Repair Progress</h2>
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-[#E5E5E5]" />
          <div className="space-y-4">
            {statusSteps.map((step, i) => {
              const isDone = i <= currentStepIdx;
              const isCurrent = i === currentStepIdx;
              return (
                <div key={step.key} className="flex items-center gap-4 relative">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${
                    isDone ? 'bg-[#111111]' : 'bg-white border-2 border-[#E5E5E5]'
                  }`}>
                    {isDone ? (
                      <CheckCircle className="w-4 h-4 text-white" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-[#E5E5E5]" />
                    )}
                  </div>
                  <span className={`text-sm ${isCurrent ? 'font-semibold text-[#111111]' : isDone ? 'text-[#525252]' : 'text-[#A3A3A3]'}`}>
                    {step.label}
                    {isCurrent && <span className="ml-2 text-xs badge-black">Current</span>}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Vendor Info */}
      {booking?.vendorProfile && (
        <div className="card p-6 mb-5">
          <h2 className="text-sm font-semibold text-[#111111] mb-4">Vendor Details</h2>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#111111] flex items-center justify-center text-white font-bold shrink-0">
              {booking.vendorProfile.businessName?.charAt(0)}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-[#111111]">{booking.vendorProfile.businessName}</p>
                {booking.vendorProfile.isVerified && (
                  <span className="badge-success flex items-center gap-1 text-xs"><Shield className="w-3 h-3" />Verified</span>
                )}
              </div>
              {booking.vendorProfile.rating?.count > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-xs">{booking.vendorProfile.rating.average?.toFixed(1)} ({booking.vendorProfile.rating.count})</span>
                </div>
              )}
              <div className="mt-3 space-y-1.5">
                {booking.vendorProfile.contactPhone && (
                  <div className="flex items-center gap-2 text-xs text-[#737373]">
                    <Phone className="w-3 h-3" /> {booking.vendorProfile.contactPhone}
                  </div>
                )}
                {booking.vendorProfile.contactEmail && (
                  <div className="flex items-center gap-2 text-xs text-[#737373]">
                    <Mail className="w-3 h-3" /> {booking.vendorProfile.contactEmail}
                  </div>
                )}
                {booking.vendorProfile.address?.city && (
                  <div className="flex items-center gap-2 text-xs text-[#737373]">
                    <MapPin className="w-3 h-3" /> {booking.vendorProfile.address.city}
                    {booking.vendorProfile.address.area ? `, ${booking.vendorProfile.address.area}` : ''}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quotation details */}
      {booking?.quotation && (
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-[#111111] mb-4">Agreed Quote</h2>
          <div className="flex items-baseline gap-1 mb-3">
            <span className="text-2xl font-bold text-[#111111]">₹{booking.agreedPrice?.toLocaleString()}</span>
            <span className="text-sm text-[#737373]">total</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-[#737373]">Estimated Duration</p>
              <p className="font-medium text-[#111111]">
                {booking.quotation.estimatedDuration?.value} {booking.quotation.estimatedDuration?.unit}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#737373]">Warranty</p>
              <p className="font-medium text-[#111111]">
                {booking.quotation.warrantyPeriod?.value > 0
                  ? `${booking.quotation.warrantyPeriod.value} ${booking.quotation.warrantyPeriod.unit}`
                  : 'No warranty'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingDetails;
