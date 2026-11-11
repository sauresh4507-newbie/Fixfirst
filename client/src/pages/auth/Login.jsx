import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Wrench, AlertCircle, ArrowRight, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { Spinner } from '../../components/ui/Loading';

const Login = () => {
  const [form, setForm]               = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');

  const { login } = useAuth();
  const toast     = useToast();
  const navigate  = useNavigate();
  const location  = useLocation();
  const from      = location.state?.from?.pathname || null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const getRedirectPath = (role) => {
    if (from) return from;
    if (role === 'admin') return '/admin';
    if (role === 'vendor') return '/vendor';
    return '/dashboard';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await login(form.email, form.password);
      toast.success(`Welcome back, ${data.user.fullName.split(' ')[0]}!`);
      navigate(getRedirectPath(data.user.role), { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { role: 'Customer', email: 'arjun@example.com',   pass: 'Customer@123' },
    { role: 'Vendor',   email: 'techfix@example.com',  pass: 'Vendor@123456' },
    { role: 'Admin',    email: 'admin@fixfirst.com',   pass: 'Admin@123456' },
  ];

  const fillDemo = (acc) => {
    setForm({ email: acc.email, password: acc.pass });
    setError('');
  };

  return (
    <div className="min-h-dvh bg-surface-secondary flex">
      {/* Left panel — decorative */}
      <div
        className="hidden lg:flex lg:w-1/2 bg-brand-gradient relative overflow-hidden items-end p-14"
        style={{ paddingTop: 'calc(3.5rem + var(--safe-top))' }}
      >
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.2) 0%, transparent 40%)' }} />
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2.5 mb-12">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
              <Wrench className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">FixFirst</span>
          </Link>
          <h2 className="text-4xl font-bold text-white leading-tight tracking-tight mb-4">
            Welcome back to<br />the repair network.
          </h2>
          <p className="text-white/70 text-lg leading-relaxed max-w-sm">
            Sign in to manage your repair requests, track progress, and connect with top-rated vendors.
          </p>
          <div className="mt-10 space-y-3">
            {['AI-powered diagnosis', 'Real-time repair tracking', 'Verified vendors only'].map((feat) => (
              <div key={feat} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
                <span className="text-white/80 text-sm">{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm animate-fade-up">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center shadow-brand">
                <Wrench className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-bold text-ink">FixFirst</span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-ink tracking-tight">Sign in</h1>
            <p className="text-ink-tertiary text-sm mt-1">Enter your credentials to continue</p>
          </div>

          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl mb-5">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="form-label" htmlFor="email">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-placeholder" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  className="input-icon-left"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="form-label mb-0" htmlFor="password">Password</label>
                <Link to="/forgot-password" className="text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-placeholder" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password"
                  className="input-field pl-10 pr-11"
                  value={form.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-ink-placeholder hover:text-ink-secondary transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !form.email || !form.password}
              className="btn-primary w-full mt-2"
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="border-white/30 border-t-white" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-ink-tertiary mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-600 font-medium hover:text-brand-700 transition-colors">
              Create one
            </Link>
          </p>

          {/* Demo accounts */}
          <div className="mt-6 p-4 bg-brand-50 rounded-2xl border border-brand-100">
            <p className="text-xs font-semibold text-brand-700 mb-3">Demo Accounts — click to fill</p>
            <div className="space-y-1.5">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => fillDemo(acc)}
                  className="w-full flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-white border border-brand-100 hover:border-brand-300 hover:shadow-sm transition-all text-left"
                >
                  <span className="font-medium text-ink">{acc.role}</span>
                  <span className="text-ink-tertiary font-mono">{acc.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
