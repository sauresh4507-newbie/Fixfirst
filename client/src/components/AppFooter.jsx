import { Link } from 'react-router-dom';
import { Wrench } from 'lucide-react';

const AppFooter = () => (
  <footer className="border-t border-surface-border bg-white mt-auto">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-brand-gradient flex items-center justify-center">
            <Wrench className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-xs font-semibold text-ink">FixFirst</span>
          <span className="text-xs text-ink-placeholder">© {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-5">
          {[
            { label: 'Privacy',  href: '/privacy' },
            { label: 'Terms',    href: '/terms' },
            { label: 'Support',  href: 'mailto:support@fixfirst.com', external: true },
          ].map(({ label, href, external }) => (
            external
              ? <a key={label} href={href} className="text-xs text-ink-tertiary hover:text-ink transition-colors">{label}</a>
              : <Link key={label} to={href} className="text-xs text-ink-tertiary hover:text-ink transition-colors">{label}</Link>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

export default AppFooter;
