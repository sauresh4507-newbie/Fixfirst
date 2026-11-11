import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Mail, ArrowLeft, CheckCircle, ArrowRight } from 'lucide-react';
import { authAPI } from '../../services/api';
import { Spinner } from '../../components/ui/Loading';

const ForgotPassword = () => {
  const [email, setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]     = useState(false);
  const [error, setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-surface-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-fade-up">
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
          {sent ? (
            <div className="text-center py-4 animate-fade-up">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-ink mb-2">Check your inbox</h3>
              <p className="text-sm text-ink-tertiary mb-6 leading-relaxed">
                If an account with <span className="font-medium text-ink">{email}</span> exists,
                we've sent a password reset link. It expires in 10 minutes.
              </p>
              <Link to="/login" className="btn-primary w-full">
                Back to Login
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-brand-600" />
                </div>
                <h1 className="text-2xl font-bold text-ink tracking-tight">Reset password</h1>
                <p className="text-ink-tertiary text-sm mt-1">Enter your email and we'll send a reset link</p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl mb-5">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="form-label" htmlFor="reset-email">Email address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-placeholder" />
                    <input
                      id="reset-email"
                      type="email"
                      required
                      placeholder="you@example.com"
                      className="input-icon-left"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="btn-primary w-full"
                >
                  {loading
                    ? <><Spinner size="sm" className="border-white/30 border-t-white" /> Sending…</>
                    : <>Send Reset Link <ArrowRight className="w-4 h-4" /></>
                  }
                </button>
              </form>
            </>
          )}
        </div>

        <div className="flex justify-center mt-5">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm text-ink-tertiary hover:text-ink transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
