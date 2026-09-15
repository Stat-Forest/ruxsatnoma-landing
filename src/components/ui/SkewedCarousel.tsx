import React, { useState, useEffect, useCallback } from 'react';

export interface SkewedCarouselProps {
  items: React.ReactNode[];
  autoPlay?: boolean;
  interval?: number;
}

export const SkewedCarousel: React.FC<SkewedCarouselProps> = ({ 
  items,
  autoPlay = true,
  interval = 3000
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const count = items?.length || 0;

  const nextSlide = useCallback(() => {
    if (count > 0) {
      setActiveIndex((prev) => (prev + 1) % count);
    }
  }, [count]);

  useEffect(() => {
    if (!autoPlay || isPaused || count === 0) return;
    const timer = setInterval(nextSlide, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, isPaused, nextSlide, count]);

  if (!items || count === 0) return null;

  const getTransform = (index: number) => {
    // Shortest distance in a circular array
    let offset = index - activeIndex;
    if (offset > count / 2) offset -= count;
    if (offset < -count / 2) offset += count;

    const isCenter = offset === 0;
    const absOffset = Math.abs(offset);
    
    // Exact React Bits style Cover Flow math
    // 1. translateZ pushes items back slightly.
    const translateZ = isCenter ? 0 : -absOffset * 50; 
    // 2. rotateY is constant for all left/right items.
    const rotateY = isCenter ? 0 : offset < 0 ? 35 : -35; 
    // 3. translateX pushes the first side item out just enough to barely overlap, then tucks others closely.
    const translateX = isCenter ? 0 : offset < 0 ? -(75 + absOffset * 15) : (75 + absOffset * 15); 
    
    // 4. Scale shrinks the side items so they look smaller and cleaner.
    const scale = isCenter ? 1 : Math.max(0.7, 1 - absOffset * 0.15);
    
    const opacity = 1; // Don't use opacity to fade, use brightness instead
    const zIndex = count - absOffset;
    const brightness = isCenter ? 1 : 0.45; // Side cards are darkened

    return {
      transform: `translateX(${translateX}%) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
      opacity,
      zIndex,
      filter: `brightness(${brightness})`,
      transition: 'all 0.6s cubic-bezier(0.25, 1, 0.5, 1)',
      cursor: isCenter ? 'default' : 'pointer',
    };
  };



  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setTouchEnd(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 40;
    const isRightSwipe = distance < -40;

    if (isLeftSwipe) {
      setActiveIndex((prev) => (prev + 1) % count);
    } else if (isRightSwipe) {
      setActiveIndex((prev) => (prev - 1 + count) % count);
    }
    
    setTouchStart(0);
    setTouchEnd(0);
  };

  return (
    <div 
      className="relative w-full mx-auto py-10 touch-pan-y" 
      style={{ perspective: '1000px' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div 
        className="relative flex items-center justify-center min-h-[480px] sm:min-h-[520px] w-full"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {items.map((item, idx) => {
          const { transform, opacity, zIndex, filter, transition, cursor } = getTransform(idx);
          const isCenter = idx === activeIndex;

          return (
            <div
              key={idx}
              className="absolute top-0 w-[90%] sm:w-[60%] md:w-[45%] lg:w-[40%] xl:w-[35%] left-1/2 -translate-x-1/2"
              style={{
                transform,
                opacity,
                zIndex,
                filter,
                transition,
                cursor,
              }}
              onClick={() => {
                if (!isCenter) setActiveIndex(idx);
              }}
            >
              <div 
                className={`relative w-full h-full transition-all duration-300 ${isCenter ? '' : 'pointer-events-none'}`}
              >
                <div className={`relative z-10 w-full bg-transparent ${isCenter ? 'shadow-[0_20px_40px_rgba(18,53,34,0.15)] rounded-2xl' : ''}`}>
                  {item}
                </div>
                {/* Floor Reflection Gradient */}
                {isCenter && (
                  <div 
                    className="absolute -bottom-12 left-0 right-0 h-16 bg-gradient-to-t from-transparent to-black/10 blur-xl rounded-[100%] scale-x-75 pointer-events-none -z-10"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
