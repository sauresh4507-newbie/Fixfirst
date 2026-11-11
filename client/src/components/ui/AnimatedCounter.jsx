import { useEffect, useRef, useState } from 'react';

/**
 * Counts up from 0 to `end` over `duration` ms once `active` becomes true.
 * Supports numeric strings like "10,000+" or "4.8/5".
 */
const AnimatedCounter = ({ value, duration = 1800, active = true, className = '' }) => {
  const [display, setDisplay] = useState('0');
  const frameRef = useRef(null);

  // Parse the numeric part from strings like "10,000+" or "4.8/5"
  const parse = (v) => {
    const match = String(v).match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  };

  const suffix = String(value).replace(/[\d.,]/g, ''); // "+", "/5", etc.
  const target  = parse(value);
  const isFloat = target % 1 !== 0;

  useEffect(() => {
    if (!active) return;
    const start     = performance.now();
    const startVal  = 0;

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (target - startVal) * eased;

      const formatted = isFloat
        ? current.toFixed(1)
        : Math.floor(current).toLocaleString('en-IN');

      setDisplay(formatted + suffix);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [active, target, duration, suffix, isFloat]);

  return <span className={className}>{display}</span>;
};

export default AnimatedCounter;
