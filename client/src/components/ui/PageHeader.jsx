import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/**
 * Consistent page header used across all authenticated pages.
 *
 * Props:
 *   title       — main heading (string | node)
 *   subtitle    — secondary line below title
 *   backTo      — path for a back-arrow link
 *   backLabel   — label for the back link (default "Back")
 *   actions     — node rendered on the right side (buttons etc.)
 *   badge       — node rendered next to title
 *   gradient    — show brand gradient background (boolean)
 */
const PageHeader = ({
  title,
  subtitle,
  backTo,
  backLabel = 'Back',
  actions,
  badge,
  gradient = false,
  className = '',
}) => {
  if (gradient) {
    return (
      <div className={`bg-brand-gradient px-4 sm:px-6 lg:px-8 py-7 ${className}`}>
        {backTo && (
          <Link
            to={backTo}
            className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {backLabel}
          </Link>
        )}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{title}</h1>
              {badge}
            </div>
            {subtitle && (
              <p className="text-white/65 text-sm mt-1">{subtitle}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">{actions}</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`px-4 sm:px-6 lg:px-8 py-6 bg-white border-b border-surface-border ${className}`}>
      {backTo && (
        <Link
          to={backTo}
          className="inline-flex items-center gap-1.5 text-ink-tertiary hover:text-ink text-sm mb-3 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {backLabel}
        </Link>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">{title}</h1>
            {badge}
          </div>
          {subtitle && (
            <p className="text-ink-tertiary text-sm mt-0.5">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">{actions}</div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
