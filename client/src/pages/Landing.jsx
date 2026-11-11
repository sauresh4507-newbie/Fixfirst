import { Link } from 'react-router-dom';
import {
  Wrench, ArrowRight, Star, CheckCircle, Smartphone, Laptop, Tablet,
  Monitor, Watch, Zap, Shield, Clock, ChevronDown, ChevronUp,
  FileText, GitMerge, Package, BrainCircuit, MapPin, Sparkles,
  TrendingUp, Award, HeartHandshake, Play
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import useInView from '../hooks/useInView';
import AnimatedCounter from '../components/ui/AnimatedCounter';

/* ── Scroll-reveal wrapper ──────────────────────────────────────────── */
const Reveal = ({ children, className = '', delay = 0, type = 'reveal' }) => {
  const [ref, visible] = useInView();
  return (
    <div
      ref={ref}
      className={`${type} ${visible ? 'is-visible' : ''} ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
};

/* ── Typewriter headline ─────────────────────────────────────────────  */
const words = ["Repair It.", "Save Money.", "Go Green.", "Fix It Fast."];
const Typewriter = () => {
  const [wordIdx, setWordIdx]   = useState(0);
  const [text, setText]         = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIdx];
    let timeout;
    if (!deleting && text.length < current.length) {
      timeout = setTimeout(() => setText(current.slice(0, text.length + 1)), 80);
    } else if (!deleting && text.length === current.length) {
      timeout = setTimeout(() => setDeleting(true), 1800);
    } else if (deleting && text.length > 0) {
      timeout = setTimeout(() => setText(current.slice(0, text.length - 1)), 45);
    } else if (deleting && text.length === 0) {
      setDeleting(false);
      setWordIdx((i) => (i + 1) % words.length);
    }
    return () => clearTimeout(timeout);
  }, [text, deleting, wordIdx]);

  return (
    <span className="gradient-text">
      {text}
      <span className="cursor-blink" />
    </span>
  );
};

/* ════════════════════════════════════════════════════════════════════
   LANDING PAGE
════════════════════════════════════════════════════════════════════ */
const LandingPage = () => {
  const [openFaq, setOpenFaq] = useState(null);
  const [statsRef, statsVisible] = useInView();

  const devices = [
    { icon: Smartphone, label: 'Smartphones', iconColor: 'text-blue-600',    activeBg: 'bg-blue-600',    passiveBg: 'bg-blue-50'    },
    { icon: Laptop,     label: 'Laptops',      iconColor: 'text-violet-600',  activeBg: 'bg-violet-600',  passiveBg: 'bg-violet-50'  },
    { icon: Tablet,     label: 'Tablets',      iconColor: 'text-indigo-600',  activeBg: 'bg-indigo-600',  passiveBg: 'bg-indigo-50'  },
    { icon: Monitor,    label: 'Desktops',     iconColor: 'text-cyan-600',    activeBg: 'bg-cyan-600',    passiveBg: 'bg-cyan-50'    },
    { icon: Watch,      label: 'Smartwatches', iconColor: 'text-emerald-600', activeBg: 'bg-emerald-600', passiveBg: 'bg-emerald-50' },
  ];

  const steps = [
    { icon: FileText,     title: 'Describe Your Issue',  description: 'Tell us about your device and the problem. Upload photos for better diagnosis.' },
    { icon: BrainCircuit, title: 'AI Troubleshooting',   description: 'Our AI analyzes your issue and provides instant troubleshooting guidance.' },
    { icon: GitMerge,     title: 'Compare Quotes',       description: 'Receive competitive quotes from verified local repair vendors.' },
    { icon: Package,      title: 'Get It Fixed',         description: 'Choose your preferred vendor and track your repair in real time.' },
  ];

  const features = [
    { icon: BrainCircuit, iconBg: 'bg-violet-100', iconColor: 'text-violet-600', title: 'AI-Powered Diagnostics',   description: 'Intelligent issue analysis classifies your problem and provides step-by-step troubleshooting before escalating.' },
    { icon: GitMerge,     iconBg: 'bg-blue-100',   iconColor: 'text-blue-600',   title: 'Competitive Marketplace',  description: 'Multiple verified vendors compete for your business — compare prices, ratings, and turnaround times.' },
    { icon: Shield,       iconBg: 'bg-emerald-100',iconColor: 'text-emerald-600',title: 'Verified Vendors Only',    description: 'Every repair partner is manually verified. Ratings and reviews are from real customers only.' },
    { icon: Clock,        iconBg: 'bg-amber-100',  iconColor: 'text-amber-600',  title: 'Real-Time Tracking',       description: 'Follow your repair journey from submission to delivery with live status updates.' },
    { icon: MapPin,       iconBg: 'bg-rose-100',   iconColor: 'text-rose-600',   title: 'Hyper-Local Service',      description: 'Connect with skilled repair professionals in your area for fast, convenient turnaround.' },
    { icon: Zap,          iconBg: 'bg-cyan-100',   iconColor: 'text-cyan-600',   title: 'Fast & Transparent',       description: 'No hidden fees. Clear pricing, estimated timelines, and warranty details upfront. Always.' },
  ];

  const testimonials = [
    { name: 'Arjun Sharma',  location: 'Mumbai',    rating: 5, device: 'iPhone 13 Pro',    initials: 'AS', avatarBg: 'bg-violet-500', text: 'My phone screen was cracked and I was quoted ₹12,000 at the Apple store. Through FixFirst I found a verified vendor who fixed it for ₹5,500 in just 2 hours. Incredible.' },
    { name: 'Priya Nair',    location: 'Bengaluru', rating: 5, device: 'Dell XPS 15',       initials: 'PN', avatarBg: 'bg-blue-500',   text: 'The AI first helped me troubleshoot a software issue. When that didn\'t work, it connected me with a vendor who diagnosed a faulty RAM. Excellent platform.' },
    { name: 'Rohan Mehta',   location: 'Delhi',     rating: 4, device: 'Samsung Galaxy S23',initials: 'RM', avatarBg: 'bg-emerald-500',text: 'Got 4 different quotes within an hour. Chose the highest-rated vendor and my phone battery was replaced the next day. Transparent throughout.' },
  ];

  const faqs = [
    { q: 'How does FixFirst work?',           a: 'You describe your device issue and upload photos. Our AI analyzes it and either helps you resolve it yourself or connects you with verified local repair vendors who submit competitive quotes. You pick the best one.' },
    { q: 'Are the repair vendors verified?',  a: 'Yes. Every vendor on FixFirst goes through a manual verification process before being allowed to accept repair requests. We check business credentials, identity, and service quality.' },
    { q: 'Is AI troubleshooting free?',       a: 'Yes. AI-powered troubleshooting is completely free. You only pay the vendor when you select them for a repair.' },
    { q: 'What devices are supported?',       a: 'We support smartphones, laptops, tablets, desktops, and smartwatches across all major brands including Apple, Samsung, OnePlus, Dell, HP, Lenovo, and more.' },
    { q: 'Can I cancel a repair request?',    a: 'Yes. You can cancel a request at any time before the repair has physically started. Once a vendor has accepted and received your device, cancellation terms depend on the vendor.' },
    { q: 'How do I become a repair partner?', a: 'Register as a vendor on FixFirst, complete your business profile, and submit for verification. Our team reviews your application within 2–3 business days.' },
  ];

  const stats = [
    { value: '10,000+', label: 'Devices Repaired', icon: TrendingUp },
    { value: '500+',    label: 'Verified Vendors',  icon: Award       },
    { value: '4.8/5',   label: 'Average Rating',    icon: Star        },
  ];

  return (
    <div className="min-h-dvh bg-white overflow-x-hidden">
      <Navbar />

      {/* ══════════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-white">
        {/* Floating orb blobs */}
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />

        {/* Dot grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, #6272f1 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28">

          {/* Tag pill */}
          <div className="flex justify-center mb-8 animate-fade-up" style={{ animationDelay: '0.05s' }}>
            <span className="tag-pill inline-flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-brand-700">
              <div className="live-dot" />
              AI-powered device repair marketplace
              <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            </span>
          </div>

          {/* Heading */}
          <div className="text-center max-w-4xl mx-auto">
            <h1
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-ink tracking-tight mb-6 text-balance leading-[1.08] animate-fade-up"
              style={{ animationDelay: '0.12s' }}
            >
              Don't Replace It.{' '}
              <br className="hidden sm:block" />
              <Typewriter />
            </h1>

            <p
              className="text-lg sm:text-xl text-ink-tertiary max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up"
              style={{ animationDelay: '0.22s' }}
            >
              AI-driven troubleshooting meets a competitive repair marketplace.
              Describe your issue, get instant guidance, and find the best local repair vendor.
            </p>

            {/* CTAs */}
            <div
              className="flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-up"
              style={{ animationDelay: '0.3s' }}
            >
              <Link to="/register" className="btn-primary btn-lg w-full sm:w-auto group">
                Get Your Device Fixed
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
              <Link to="/register?role=vendor" className="btn-secondary btn-lg w-full sm:w-auto">
                Become a Repair Partner
              </Link>
            </div>

            {/* Trust signals */}
            <div
              className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-6 text-xs text-ink-tertiary animate-fade-up"
              style={{ animationDelay: '0.38s' }}
            >
              {['Free AI Diagnosis', 'Verified Vendors', 'No Hidden Fees'].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div
            ref={statsRef}
            className="grid grid-cols-3 gap-4 max-w-xl mx-auto mt-20"
          >
            {stats.map(({ value, label }, i) => (
              <div key={label} className="text-center reveal" style={{ transitionDelay: `${i * 80}ms` }}>
                <p className="text-2xl sm:text-3xl font-bold stat-number">
                  <AnimatedCounter value={value} active={statsVisible} duration={1600} />
                </p>
                <p className="text-xs sm:text-sm text-ink-tertiary mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-200 to-transparent" />
      </section>

      {/* ══════════════════════════════════════════════════════════════
          DEVICES
      ══════════════════════════════════════════════════════════════ */}
      <section id="services" className="py-20 bg-surface-secondary overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal><p className="text-xs font-semibold uppercase tracking-widest text-brand-500 mb-3">What We Fix</p></Reveal>
          <Reveal delay={60}><h2 className="section-heading mb-3">Supported Devices</h2></Reveal>
          <Reveal delay={120}><p className="section-subheading max-w-lg mx-auto mb-12">We handle repairs for all major device categories across top brands</p></Reveal>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {devices.map(({ icon: Icon, label, iconColor, activeBg, passiveBg }, i) => (
              <Reveal key={label} delay={i * 60} type="reveal-scale">
                <div className="device-card group cursor-pointer">
                  {/* Shimmer sweep */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,.5) 50%, transparent 60%)', backgroundSize: '200% 100%', animation: 'shimmer 1s ease forwards' }} />
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 transition-all duration-300 ${passiveBg} group-hover:${activeBg} group-hover:scale-110 group-hover:shadow-lg`}>
                    <Icon className={`w-7 h-7 ${iconColor} group-hover:text-white transition-colors duration-300`} strokeWidth={1.5} />
                  </div>
                  <p className="text-sm font-semibold text-ink group-hover:text-brand-600 transition-colors duration-200">{label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════════════════════ */}
      <section id="how-it-works" className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Reveal><p className="text-xs font-semibold uppercase tracking-widest text-brand-500 mb-3">The Process</p></Reveal>
            <Reveal delay={60}><h2 className="section-heading mb-3">How It Works</h2></Reveal>
            <Reveal delay={120}><p className="section-subheading">From issue to fixed in four simple steps</p></Reveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Animated connector line */}
            <Reveal type="reveal-fade" className="hidden md:block absolute top-9 left-[12.5%] right-[12.5%]">
              <div className="h-px bg-gradient-to-r from-brand-200 via-brand-400 to-brand-200 animate-gradient" />
            </Reveal>

            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <Reveal key={i} delay={i * 100} type="reveal">
                  <div className="step-card group text-center">
                    <div className="step-icon-wrap">
                      <Icon className="w-7 h-7 text-ink-tertiary group-hover:text-brand-600 transition-colors duration-300" strokeWidth={1.5} />
                      <span className="absolute -top-3 -right-3 w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center shadow-brand"
                        style={{ background: 'linear-gradient(135deg,#6272f1,#8b5cf6)' }}>
                        {i + 1}
                      </span>
                    </div>
                    <h3 className="text-[15px] font-semibold text-ink mb-2 group-hover:text-brand-700 transition-colors">{step.title}</h3>
                    <p className="text-sm text-ink-tertiary leading-relaxed">{step.description}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          FEATURES
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-surface-secondary overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Reveal><p className="text-xs font-semibold uppercase tracking-widest text-brand-500 mb-3">Why Us</p></Reveal>
            <Reveal delay={60}><h2 className="section-heading mb-3">Why Choose FixFirst</h2></Reveal>
            <Reveal delay={120}><p className="section-subheading">The smarter way to get your devices repaired</p></Reveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <Reveal key={i} delay={i * 70} type="reveal">
                  <div className="feature-card group">
                    <div className={`icon-box-lg ${feat.iconBg} mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-[-6deg]`}>
                      <Icon className={`w-6 h-6 ${feat.iconColor}`} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-[15px] font-semibold text-ink mb-2 group-hover:text-brand-700 transition-colors">{feat.title}</h3>
                    <p className="text-sm text-ink-tertiary leading-relaxed">{feat.description}</p>
                    {/* Bottom accent line */}
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: 'linear-gradient(90deg,#6272f1,#8b5cf6)' }} />
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Reveal><p className="text-xs font-semibold uppercase tracking-widest text-brand-500 mb-3">Social Proof</p></Reveal>
            <Reveal delay={60}><h2 className="section-heading mb-3">What Customers Say</h2></Reveal>
            <Reveal delay={120}><p className="section-subheading">Real repairs, real results</p></Reveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <Reveal key={i} delay={i * 80} type="reveal">
                <div className="testimonial-card group">
                  {/* Quote mark */}
                  <div className="text-5xl font-serif text-brand-100 leading-none select-none group-hover:text-brand-200 transition-colors">"</div>
                  <div className="flex items-center gap-1 -mt-3">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} className={`w-4 h-4 transition-all duration-200 group-hover:scale-110 ${j < t.rating ? 'text-amber-400 fill-amber-400' : 'text-surface-border fill-surface-border'}`}
                        style={{ transitionDelay: `${j * 30}ms` }} />
                    ))}
                  </div>
                  <p className="text-sm text-ink-secondary leading-relaxed flex-1">{t.text}</p>
                  <div className="flex items-center gap-3 pt-3 border-t border-surface-border mt-auto">
                    <div className={`w-10 h-10 rounded-full ${t.avatarBg} flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-110`}>
                      <span className="text-white text-sm font-bold">{t.initials}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink">{t.name}</p>
                      <p className="text-xs text-ink-tertiary">{t.device} · {t.location}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          CTA
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-24 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #6272f1 0%, #8b5cf6 60%, #06b6d4 100%)' }} />
        <div className="absolute inset-0 dot-grid opacity-15" />

        {/* Floating rings */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full border border-white/10 spin-ring" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full border border-white/10 spin-ring" style={{ animationDirection: 'reverse', animationDuration: '18s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-white/5" />

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <Reveal type="reveal-scale">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-white/20 backdrop-blur-sm border border-white/30 mb-6 animate-float">
              <HeartHandshake className="w-8 h-8 text-white" strokeWidth={1.5} />
            </div>
          </Reveal>

          <Reveal delay={80}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight text-balance">
              Your device is waiting to be fixed.
            </h2>
          </Reveal>

          <Reveal delay={140}>
            <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto">
              Join thousands of customers who trusted FixFirst to save their devices and their wallets.
            </p>
          </Reveal>

          <Reveal delay={200}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register"
                className="group flex items-center gap-2 bg-white text-ink font-semibold px-7 py-3.5 rounded-xl hover:bg-gray-50 transition-all shadow-xl text-base w-full sm:w-auto justify-center hover:-translate-y-1 hover:shadow-2xl active:scale-95">
                Start a Repair Request
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link to="/register?role=vendor"
                className="flex items-center gap-2 border border-white/30 text-white font-medium px-7 py-3.5 rounded-xl hover:bg-white/10 hover:border-white/50 transition-all text-base w-full sm:w-auto justify-center hover:-translate-y-0.5 active:scale-95 backdrop-blur-sm">
                Join as a Vendor
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          FAQ
      ══════════════════════════════════════════════════════════════ */}
      <section id="faq" className="py-24 bg-white overflow-hidden">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <Reveal><p className="text-xs font-semibold uppercase tracking-widest text-brand-500 mb-3">FAQ</p></Reveal>
            <Reveal delay={60}><h2 className="section-heading mb-3">Frequently Asked Questions</h2></Reveal>
            <Reveal delay={120}><p className="section-subheading">Everything you need to know</p></Reveal>
          </div>

          <div className="space-y-2.5">
            {faqs.map((faq, i) => (
              <Reveal key={i} delay={i * 50}>
                <div className={`card overflow-hidden transition-all duration-300 ${openFaq === i ? 'shadow-lg border-brand-200 scale-[1.01]' : 'hover:border-surface-border-strong'}`}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex items-center justify-between w-full px-5 py-4 text-left gap-4 group"
                    aria-expanded={openFaq === i}
                  >
                    <span className={`text-sm font-semibold transition-colors duration-200 ${openFaq === i ? 'text-brand-700' : 'text-ink group-hover:text-brand-600'}`}>
                      {faq.q}
                    </span>
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 ${openFaq === i ? 'bg-brand-100 rotate-0' : 'bg-surface-tertiary'}`}>
                      {openFaq === i
                        ? <ChevronUp className="w-3.5 h-3.5 text-brand-600" />
                        : <ChevronDown className="w-3.5 h-3.5 text-ink-tertiary" />}
                    </div>
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-5 animate-fade-down">
                      <div className="pt-3 border-t border-brand-100">
                        <p className="text-sm text-ink-tertiary leading-relaxed">{faq.a}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
