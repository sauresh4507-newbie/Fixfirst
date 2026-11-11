import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Eye, EyeOff, Wrench, AlertCircle, CheckCircle, User, Briefcase,
  Mail, Phone, Lock, ArrowRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { Spinner } from '../../components/ui/Loading';

const Register = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'vendor' ? 'vendor' : 'customer';

  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', password: '', confirmPassword: '', role: initialRole,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState('');

  const { register } = useAuth();
  const toast        = useToast();
  const navigate     = useNavigate();

  const passwordStrength = (pwd) => {
    if (!pwd) return null;
    let score = 0;
    if (pwd.length >= 8)         score++;
    if (/[A-Z]/.test(pwd))       score++;
    if (/[0-9]/.test(pwd))       score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { level: 'Weak',   color: 'bg-red-500',     width: 'w-1/4' };
    if (score === 2) return { level: 'Fair',   color: 'bg-amber-500',   width: 'w-2/4' };
    if (score === 3) return { level: 'Good',   color: 'bg-blue-500',    width: 'w-3/4' };
    return              { level: 'Strong', color: 'bg-emerald-500', width: 'w-full' };
  };
  const strength = passwordStrength(form.password);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');
    if (form.password.length < 8) return setError('Password must be at least 8 characters.');
    setLoading(true);
    setError('');
    try {
      await register({ fullName: form.fullName, email: form.email, phone: form.phone, password: form.password, role: form.role });
      toast.success('Account created successfully!');
      navigate(form.role === 'vendor' ? '/vendor/setup' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-surface-secondary flex items-start justify-center p-4 py-10">
      <div className="w-full max-w-md animate-fade-up">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center shadow-brand">
              <Wrench className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold text-ink">FixFirst</span>
          </Link>
        </div>

        <div className="card p-7">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-ink tracking-tight">Create account</h1>
            <p className="text-ink-tertiary text-sm mt-1">Join thousands using FixFirst</p>
          </div>

          {/* Role toggle */}
          <div className="flex gap-1.5 p-1.5 bg-surface-tertiary rounded-xl mb-6 border border-surface-border">
            {[
              { value: 'customer', icon: User,      label: 'Customer' },
              { value: 'vendor',   icon: Briefcase, label: 'Repair Partner' },
            ].map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setForm({ ...form, role: value })}
                className={`flex items-center justify-center gap-2 flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  form.role === value
                    ? 'bg-white text-ink shadow-sm border border-surface-border'
                    : 'text-ink-tertiary hover:text-ink-secondary'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl mb-5">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="form-label" htmlFor="fullName">Full name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-placeholder" />
                <input id="fullName" name="fullName" type="text" autoComplete="name" required placeholder="John Smith" className="input-icon-left" value={form.fullName} onChange={handleChange} />
              </div>
            </div>

            <div>
              <label className="form-label" htmlFor="reg-email">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-placeholder" />
                <input id="reg-email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" className="input-icon-left" value={form.email} onChange={handleChange} />
              </div>
            </div>

            <div>
              <label className="form-label" htmlFor="phone">Phone number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-placeholder" />
                <input id="phone" name="phone" type="tel" autoComplete="tel" required placeholder="+91 98765 43210" className="input-icon-left" value={form.phone} onChange={handleChange} />
              </div>
            </div>

            <div>
              <label className="form-label" htmlFor="reg-password">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-placeholder" />
                <input id="reg-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required placeholder="Min. 8 characters" className="input-field pl-10 pr-11" value={form.password} onChange={handleChange} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-ink-placeholder hover:text-ink-secondary transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {strength && (
                <div className="mt-2 space-y-1">
                  <div className="h-1 bg-surface-border rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${strength.color} ${strength.width}`} />
                  </div>
                  <p className="text-xs text-ink-tertiary">Strength: <span className="font-medium text-ink">{strength.level}</span></p>
                </div>
              )}
            </div>

            <div>
              <label className="form-label" htmlFor="confirmPassword">Confirm password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-placeholder" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="Re-enter your password"
                  className={`input-field pl-10 pr-11 ${
                    form.confirmPassword && form.password !== form.confirmPassword ? 'border-red-400 focus:border-red-400' :
                    form.confirmPassword && form.password === form.confirmPassword ? 'border-emerald-400 focus:border-emerald-400' : ''
                  }`}
                  value={form.confirmPassword}
                  onChange={handleChange}
                />
                {form.confirmPassword && form.password === form.confirmPassword && (
                  <CheckCircle className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !form.fullName || !form.email || !form.phone || !form.password}
              className="btn-primary w-full mt-2"
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="border-white/30 border-t-white" />
                  Creating account…
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-ink-tertiary mt-4">
            By creating an account, you agree to our{' '}
            <Link to="/terms" className="text-brand-600 hover:underline">Terms</Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-brand-600 hover:underline">Privacy Policy</Link>.
          </p>
        </div>

        <p className="text-center text-sm text-ink-tertiary mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 font-medium hover:text-brand-700 transition-colors">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
