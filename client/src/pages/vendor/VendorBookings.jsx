import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock } from 'lucide-react';
import { bookingAPI } from '../../services/api';
import { CardSkeleton } from '../../components/ui/Loading';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import { useToast } from '../../components/ui/Toast';
import { Wrench } from 'lucide-react';

const statusTransitions = {
  vendor_selected: [{ key: 'repair_accepted', label: 'Accept Repair' }],
  repair_accepted: [{ key: 'device_received', label: 'Device Received' }],
  device_received: [{ key: 'repair_in_progress', label: 'Start Repair' }],
  repair_in_progress: [{ key: 'repair_completed', label: 'Mark Completed' }],
  repair_completed: [{ key: 'delivered', label: 'Mark Delivered' }],
};

// BookingDetail view (single booking)
const BookingDetailView = ({ id }) => {
  const navigate = useNavigate();
  const toast = useToast();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    bookingAPI.getById(id).then(({ data }) => setBooking(data.booking)).catch(() => navigate('/vendor/bookings')).finally(() => setLoading(false));
  }, [id]);

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true);
    try {
      const { data } = await bookingAPI.updateStatus(id, { status: newStatus, note });
      setBooking(data.booking);
      toast.success(`Status updated to: ${newStatus.replace(/_/g, ' ')}`);
      setNote('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-8"><CardSkeleton /></div>;
  if (!booking) return null;

  const nextActions = statusTransitions[booking.status] || [];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <Link to="/vendor/bookings" className="inline-flex items-center gap-2 text-sm text-[#737373] hover:text-[#111111] mb-6">
        <ArrowLeft className="w-4 h-4" />All Bookings
      </Link>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-[#111111]">Booking Details</h1>
        <StatusBadge status={booking.status} />
      </div>

      <div className="card p-5 mb-4">
        <h2 className="text-sm font-semibold text-[#111111] mb-3">Device & Customer</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[#737373]">Device</span>
            <span className="font-medium">{booking.repairRequest?.deviceBrand} {booking.repairRequest?.deviceModel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#737373]">Issue</span>
            <span className="font-medium">{booking.repairRequest?.issueCategory}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#737373]">Customer</span>
            <span className="font-medium">{booking.customer?.fullName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#737373]">Agreed Price</span>
            <span className="font-bold text-[#111111]">₹{booking.agreedPrice?.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {nextActions.length > 0 && (
        <div className="card p-5 mb-4">
          <h2 className="text-sm font-semibold text-[#111111] mb-3">Update Status</h2>
          <input className="input-field mb-3" placeholder="Add a note (optional)" value={note} onChange={e => setNote(e.target.value)} />
          <div className="flex gap-3">
            {nextActions.map(action => (
              <button key={action.key} onClick={() => handleStatusUpdate(action.key)} disabled={updating} className="btn-primary flex items-center gap-2">
                {updating ? null : <CheckCircle className="w-4 h-4" />}{action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {booking.statusHistory?.length > 0 && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-[#111111] mb-3">Status History</h2>
          <div className="space-y-3">
            {booking.statusHistory.slice().reverse().map((h, i) => (
              <div key={i} className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#737373] mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-[#111111]">{h.status?.replace(/_/g, ' ')}</p>
                  {h.note && <p className="text-xs text-[#737373]">{h.note}</p>}
                  <p className="text-xs text-[#A3A3A3]">{new Date(h.updatedAt).toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Booking list
const VendorBookings = () => {
  const { id } = useParams();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  if (id) return <BookingDetailView id={id} />;

  useEffect(() => {
    bookingAPI.getMyBookings({ page, limit: 10 }).then(({ data }) => {
      setBookings(data.bookings);
      setPagination(data.pagination);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-[#111111] mb-6">My Bookings</h1>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <CardSkeleton key={i} />)}</div>
      ) : bookings.length === 0 ? (
        <EmptyState icon={Wrench} title="No bookings yet" description="Submit quotations to receive bookings." />
      ) : (
        <div className="space-y-3">
          {bookings.map(b => (
            <Link key={b._id} to={`/vendor/bookings/${b._id}`} className="card-hover p-4 flex items-center gap-4 block">
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-[#111111]">
                    {b.repairRequest?.deviceBrand} {b.repairRequest?.deviceModel}
                  </p>
                  <StatusBadge status={b.status} />
                </div>
                <p className="text-xs text-[#737373] mt-0.5">
                  {b.customer?.fullName} · ₹{b.agreedPrice?.toLocaleString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorBookings;
