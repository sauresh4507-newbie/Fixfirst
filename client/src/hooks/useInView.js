import { useEffect, useRef, useState } from 'react';

/**
 * useInView — fires once when the element enters the viewport.
 * @param {object} options  IntersectionObserver options
 * @returns [ref, isVisible]
 */
const useInView = (options = {}) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // fire only once
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -48px 0px', ...options }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, isVisible];
};

export default useInView;
