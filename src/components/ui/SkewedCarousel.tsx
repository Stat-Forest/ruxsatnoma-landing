import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

  const prevSlide = useCallback(() => {
    if (count > 0) {
      setActiveIndex((prev) => (prev - 1 + count) % count);
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
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
    
    setTouchStart(0);
    setTouchEnd(0);
  };

  return (
    <div 
      className="relative w-full mx-auto pt-2 pb-4 touch-pan-y flex flex-col items-center" 
      style={{ perspective: '1000px' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div 
        className="relative flex items-center justify-center min-h-[400px] sm:min-h-[440px] w-full"
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
                    className="absolute -bottom-10 left-0 right-0 h-14 bg-gradient-to-t from-transparent to-black/10 blur-xl rounded-[100%] scale-x-75 pointer-events-none -z-10"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-center gap-4 mt-2 sm:mt-3 relative z-20">
        <button
          onClick={prevSlide}
          aria-label="Previous slide"
          className="w-11 h-11 flex items-center justify-center rounded-full bg-white border border-[#D6E6DB] text-[#2E7D4F] shadow-sm hover:shadow-md hover:bg-[#F0F7F1] hover:text-[#1B5E20] hover:scale-105 active:scale-95 transition-all duration-300"
        >
          <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
        </button>
        
        {/* Pagination Dots */}
        <div className="flex items-center gap-2 px-3">
          {items.map((_, idx) => (
            <button
              key={`dot-${idx}`}
              onClick={() => setActiveIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`transition-all duration-300 rounded-full ${
                idx === activeIndex 
                  ? 'w-6 h-2 bg-[#2E7D4F]' 
                  : 'w-2 h-2 bg-[#D6E6DB] hover:bg-[#A6BEAF]'
              }`}
            />
          ))}
        </div>

        <button
          onClick={nextSlide}
          aria-label="Next slide"
          className="w-11 h-11 flex items-center justify-center rounded-full bg-white border border-[#D6E6DB] text-[#2E7D4F] shadow-sm hover:shadow-md hover:bg-[#F0F7F1] hover:text-[#1B5E20] hover:scale-105 active:scale-95 transition-all duration-300"
        >
          <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};
