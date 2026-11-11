import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastProvider } from './components/ui/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';

// Pages — Public
import Landing        from './pages/Landing';
import Login          from './pages/auth/Login';
import Register       from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Pages — Customer
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CreateRepair      from './pages/customer/CreateRepair';
import RepairDetails     from './pages/customer/RepairDetails';
import Troubleshoot      from './pages/customer/Troubleshoot';
import Quotations        from './pages/customer/Quotations';
import BookingDetails    from './pages/customer/BookingDetails';
import RepairHistory     from './pages/customer/RepairHistory';
import CustomerProfile   from './pages/customer/CustomerProfile';

// Pages — Vendor
import VendorDashboard    from './pages/vendor/VendorDashboard';
import VendorRegistration from './pages/vendor/VendorRegistration';
import AvailableRequests  from './pages/vendor/AvailableRequests';
import SubmitQuotation    from './pages/vendor/SubmitQuotation';
import VendorBookings     from './pages/vendor/VendorBookings';
import VendorProfile      from './pages/vendor/VendorProfile';

// Pages — Admin
import AdminDashboard   from './pages/admin/AdminDashboard';
import ManageCustomers  from './pages/admin/ManageCustomers';
import ManageVendors    from './pages/admin/ManageVendors';
import ManageRepairs    from './pages/admin/ManageRepairs';
import ManageComplaints from './pages/admin/ManageComplaints';

/**
 * Wraps a page in ProtectedRoute + AppLayout (navbar + sidebar + footer).
 */
const Protected = ({ roles, children }) => (
  <ProtectedRoute allowedRoles={roles}>
    <AppLayout>{children}</AppLayout>
  </ProtectedRoute>
);

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <NotificationProvider>
            <Routes>
              {/* ── Public ────────────────────────────────────────────── */}
              <Route path="/"               element={<Landing />} />
              <Route path="/login"          element={<Login />} />
              <Route path="/register"       element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* ── Customer ──────────────────────────────────────────── */}
              <Route path="/dashboard"
                element={<Protected roles={['customer']}><CustomerDashboard /></Protected>} />
              <Route path="/repairs/new"
                element={<Protected roles={['customer']}><CreateRepair /></Protected>} />
              <Route path="/repairs"
                element={<Protected roles={['customer']}><RepairHistory /></Protected>} />
              <Route path="/repairs/:id"
                element={<Protected><RepairDetails /></Protected>} />
              <Route path="/repairs/:id/troubleshoot"
                element={<Protected roles={['customer']}><Troubleshoot /></Protected>} />
              <Route path="/repairs/:id/quotations"
                element={<Protected roles={['customer']}><Quotations /></Protected>} />
              <Route path="/bookings/:id"
                element={<Protected><BookingDetails /></Protected>} />
              <Route path="/profile"
                element={<Protected roles={['customer']}><CustomerProfile /></Protected>} />

              {/* ── Vendor ────────────────────────────────────────────── */}
              <Route path="/vendor"
                element={<Protected roles={['vendor']}><VendorDashboard /></Protected>} />
              <Route path="/vendor/setup"
                element={<Protected roles={['vendor']}><VendorRegistration /></Protected>} />
              <Route path="/vendor/requests"
                element={<Protected roles={['vendor']}><AvailableRequests /></Protected>} />
              <Route path="/vendor/submit-quote/:requestId"
                element={<Protected roles={['vendor']}><SubmitQuotation /></Protected>} />
              <Route path="/vendor/bookings"
                element={<Protected roles={['vendor']}><VendorBookings /></Protected>} />
              <Route path="/vendor/bookings/:id"
                element={<Protected roles={['vendor']}><VendorBookings /></Protected>} />
              <Route path="/vendor/profile"
                element={<Protected roles={['vendor']}><VendorProfile /></Protected>} />

              {/* ── Admin ─────────────────────────────────────────────── */}
              <Route path="/admin"
                element={<Protected roles={['admin']}><AdminDashboard /></Protected>} />
              <Route path="/admin/users"
                element={<Protected roles={['admin']}><ManageCustomers /></Protected>} />
              <Route path="/admin/vendors"
                element={<Protected roles={['admin']}><ManageVendors /></Protected>} />
              <Route path="/admin/repairs"
                element={<Protected roles={['admin']}><ManageRepairs /></Protected>} />
              <Route path="/admin/complaints"
                element={<Protected roles={['admin']}><ManageComplaints /></Protected>} />

              {/* ── Fallback ──────────────────────────────────────────── */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </NotificationProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
