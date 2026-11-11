import { Link } from 'react-router-dom';
import { Wrench, Twitter, Linkedin, Github, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-ink text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center shadow-brand">
                <Wrench className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-lg font-bold text-white">FixFirst</span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              AI-powered troubleshooting meets a competitive repair marketplace. Find trusted local vendors, compare quotes, and get your device fixed.
            </p>
            <div className="flex items-center gap-2.5 mt-6">
              {[
                { Icon: Twitter,  label: 'Twitter' },
                { Icon: Linkedin, label: 'LinkedIn' },
                { Icon: Github,   label: 'GitHub' },
              ].map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  className="w-9 h-9 rounded-xl bg-white/8 hover:bg-white/15 border border-white/10 flex items-center justify-center transition-all hover:scale-110"
                  aria-label={label}
                >
                  <Icon className="w-4 h-4 text-white/70" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-4">Platform</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'How it Works',      href: '/#how-it-works' },
                { label: 'Services',           href: '/#services' },
                { label: 'Get a Repair',       href: '/register' },
                { label: 'Become a Partner',   href: '/register?role=vendor' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link to={href} className="text-sm text-white/50 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-4">Support</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'FAQ',              href: '/#faq' },
                { label: 'Contact Support',  href: 'mailto:support@fixfirst.com', external: true },
                { label: 'Privacy Policy',   href: '/privacy' },
                { label: 'Terms of Service', href: '/terms' },
              ].map(({ label, href, external }) => (
                <li key={label}>
                  {external
                    ? <a href={href} className="text-sm text-white/50 hover:text-white transition-colors">{label}</a>
                    : <Link to={href} className="text-sm text-white/50 hover:text-white transition-colors">{label}</Link>
                  }
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/30">
            &copy; {new Date().getFullYear()} FixFirst. All rights reserved.
          </p>
          <p className="text-xs text-white/25 flex items-center gap-1.5">
            Built with <Heart className="w-3 h-3 text-red-400 fill-red-400" /> for devices everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
