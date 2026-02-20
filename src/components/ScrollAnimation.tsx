import { useEffect, useRef, ReactNode } from 'react';

interface ScrollAnimationProps {
  children: ReactNode;
  animation?: 'fade-up' | 'slide-left' | 'slide-right' | 'scale-in';
  delay?: number;
  className?: string;
}

export function ScrollAnimation({
  children,
  animation = 'fade-up',
  delay = 0,
  className = '',
}: ScrollAnimationProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('animate-visible');
            }, delay);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  const getAnimationClasses = () => {
    switch (animation) {
      case 'fade-up':
        return 'opacity-0 translate-y-10 transition-all duration-700 ease-out [&.animate-visible]:opacity-100 [&.animate-visible]:translate-y-0';
      case 'slide-left':
        return 'opacity-0 -translate-x-16 transition-all duration-700 ease-out [&.animate-visible]:opacity-100 [&.animate-visible]:translate-x-0';
      case 'slide-right':
        return 'opacity-0 translate-x-16 transition-all duration-700 ease-out [&.animate-visible]:opacity-100 [&.animate-visible]:translate-x-0';
      case 'scale-in':
        return 'opacity-0 scale-95 transition-all duration-500 ease-out [&.animate-visible]:opacity-100 [&.animate-visible]:scale-100';
      default:
        return '';
    }
  };

  return (
    <div ref={ref} className={`${getAnimationClasses()} ${className}`}>
      {children}
    </div>
  );
}
