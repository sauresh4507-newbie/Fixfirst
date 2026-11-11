import { NavLink, Link } from 'react-router-dom';
import { Wrench, X } from 'lucide-react';

const Sidebar = ({ links, title, mobileOpen, onClose }) => {
  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen lg:h-[calc(100vh-0px)]
          w-64 shrink-0 bg-white border-r border-surface-border
          z-40 lg:z-auto flex flex-col
          transition-transform duration-300 ease-spring
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{ paddingTop: 'var(--safe-top)' }}
      >
        {/* Logo area */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-surface-border shrink-0">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-brand-gradient flex items-center justify-center shadow-brand group-hover:shadow-brand-lg transition-shadow">
              <Wrench className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[15px] font-bold text-ink tracking-tight">FixFirst</span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-surface-tertiary text-ink-tertiary"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {title && (
            <p className="text-[10px] font-semibold text-ink-placeholder uppercase tracking-widest px-3 mb-3 mt-1">
              {title}
            </p>
          )}
          {links.map((link) => {
            if (link.type === 'section') {
              return (
                <p key={link.label} className="text-[10px] font-semibold text-ink-placeholder uppercase tracking-widest px-3 pt-5 pb-2">
                  {link.label}
                </p>
              );
            }
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-brand-gradient text-white shadow-brand'
                      : 'text-ink-secondary hover:bg-surface-tertiary hover:text-ink'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-ink-tertiary'}`}
                      strokeWidth={isActive ? 2 : 1.75}
                    />
                    <span className="flex-1 truncate">{link.label}</span>
                    {link.badge != null && link.badge > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold min-w-[18px] text-center ${
                        isActive ? 'bg-white/25 text-white' : 'bg-brand-100 text-brand-700'
                      }`}>
                        {link.badge > 99 ? '99+' : link.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Bottom slot */}
        <div className="px-3 pb-4 shrink-0 border-t border-surface-border pt-3">
          <div className="px-3 py-2">
            <p className="text-[10px] text-ink-placeholder">
              FixFirst © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
