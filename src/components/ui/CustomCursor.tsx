import React, { useEffect, useRef } from 'react';

export const CustomCursor: React.FC = () => {
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorOutlineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only run on non-touch devices
    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
      return;
    }

    let rafId: number;

    const onMouseMove = (e: MouseEvent) => {
      // Use requestAnimationFrame to throttle DOM updates
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        if (cursorDotRef.current) {
          cursorDotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
        }
        if (cursorOutlineRef.current) {
          cursorOutlineRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
        }
      });
    };

    window.addEventListener('mousemove', onMouseMove);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <style>{`
        .custom-cursor-dot {
          transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1);
        }
        .custom-cursor-outline {
          transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
        }
      `}</style>
      
      {/* The trailing outline (made smaller per user request) */}
      <div
        ref={cursorOutlineRef}
        className="custom-cursor-outline fixed top-0 left-0 w-6 h-6 -ml-3 -mt-3 bg-[#A6BEAF]/50 rounded-full pointer-events-none z-[9998] hidden sm:block will-change-transform"
      />
      {/* The small fast dot */}
      <div
        ref={cursorDotRef}
        className="custom-cursor-dot fixed top-0 left-0 w-2 h-2 -ml-1 -mt-1 bg-[#123522] rounded-full pointer-events-none z-[9999] hidden sm:block will-change-transform"
      />
    </>
  );
};
