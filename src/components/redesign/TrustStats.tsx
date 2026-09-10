import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FileCheck2, Trees, Award, MapPin } from 'lucide-react';

export interface StatItem {
  id: string | number;
  value: number;
  label: string;
  description?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  icon: React.ReactNode;
  badgeLabel?: string;
}

export interface TrustStatsProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  stats?: StatItem[];
  duration?: number;
  className?: string;
  triggerOnce?: boolean;
  columns?: 2 | 3 | 4;
}

const DEFAULT_STATS: StatItem[] = [
  {
    id: 'active-permits',
    value: 12500,
    suffix: '+',
    label: 'Faol elektron ruxsatnomalar',
    description: 'Davlat oʻrmon fondi uchastkalaridan foydalanish boʻyicha tasdiqlangan rasmiy ruxsatnomalar.',
    icon: <FileCheck2 className="w-6 h-6 sm:w-7 sm:h-7" />,
    badgeLabel: 'Davlat reyestri',
  },
  {
    id: 'forest-area',
    value: 480000,
    suffix: ' ga',
    label: 'Muhofaza qilinayotgan maydon',
    description: 'Doimiy ekologik monitoring va qonuniy nazorat ostidagi umumiy oʻrmon fondi yerlari.',
    icon: <Trees className="w-6 h-6 sm:w-7 sm:h-7" />,
    badgeLabel: 'GIS integratsiya',
  },
  {
    id: 'satisfaction-rate',
    value: 99.4,
    decimals: 1,
    suffix: '%',
    label: 'Ijobiy xulosa va ishonch',
    description: 'Arizalarni avtomatlashtirilgan koʻrib chiqish va xizmat koʻrsatish sifatining ijobiy koʻrsatkichi.',
    icon: <Award className="w-6 h-6 sm:w-7 sm:h-7" />,
    badgeLabel: 'Shaffof tizim',
  },
  {
    id: 'forestry-enterprises',
    value: 86,
    suffix: '+',
    label: 'Hududiy oʻrmon xoʻjaliklari',
    description: 'Respublika boʻylab portal orqali yagona raqamlashtirilgan tizimga toʻliq ulangan tashkilotlar.',
    icon: <MapPin className="w-6 h-6 sm:w-7 sm:h-7" />,
    badgeLabel: 'Butun Oʻzbekiston',
  },
];

interface StatCardProps {
  item: StatItem;
  isInView: boolean;
  duration: number;
}

function StatCard({ item, isInView, duration }: StatCardProps) {
  const [currentValue, setCurrentValue] = useState<number>(0);
  const frameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isInView) return;

    // Honor reduced-motion preference: immediately show target value without animating
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

    if (prefersReducedMotion) {
      setCurrentValue(item.value);
      return;
    }

    const startVal = 0;
    const endVal = item.value;
    const animDuration = Math.max(duration, 300);

    const step = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / animDuration, 1);

      // Ease-out cubic formula for smooth deceleration
      const ease = 1 - Math.pow(1 - progress, 3);
      const nextVal = startVal + (endVal - startVal) * ease;

      setCurrentValue(nextVal);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        setCurrentValue(endVal);
      }
    };

    frameRef.current = requestAnimationFrame(step);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [isInView, item.value, duration]);

  const formattedValue = useMemo(() => {
    const decimals = item.decimals ?? 0;
    return currentValue.toLocaleString('uz-UZ', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }, [currentValue, item.decimals]);

  return (
    <div
      data-testid={`trust-stat-${item.id}`}
      className="group relative flex flex-col justify-between bg-white dark:bg-[#16251E] border border-[#E4E7EA] dark:border-emerald-900/40 rounded-2xl p-6 sm:p-7 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      <div>
        {/* Circular green badge for icon */}
        <div
          aria-hidden="true"
          className="mb-5 inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#F0F7F1] dark:bg-emerald-950/60 border border-[#D9EBDC] dark:border-emerald-800/60 text-[#2E7D4F] dark:text-emerald-400 ring-8 ring-[#F0F7F1]/50 dark:ring-emerald-950/30 shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:bg-[#E2F2E5] group-hover:border-[#7FB98A]"
        >
          {item.icon}
        </div>

        {/* Counter display */}
        <div className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#123522] dark:text-emerald-50 tracking-tight tabular-nums flex items-baseline">
          {item.prefix && <span className="text-2xl sm:text-3xl mr-0.5">{item.prefix}</span>}
          <span>{formattedValue}</span>
          {item.suffix && (
            <span className="text-xl sm:text-2xl ml-1 text-[#2E7D4F] dark:text-emerald-400 font-sans font-bold">
              {item.suffix}
            </span>
          )}
        </div>

        {/* Stat label */}
        <h3 className="mt-3 text-base sm:text-lg font-bold text-[#1C2B24] dark:text-emerald-100">
          {item.label}
        </h3>

        {/* Optional detailed description */}
        {item.description && (
          <p className="mt-1.5 text-xs sm:text-sm text-[#4B5A52] dark:text-emerald-300/70 leading-relaxed">
            {item.description}
          </p>
        )}
      </div>

      {/* Footer badge/tag */}
      {item.badgeLabel && (
        <div className="mt-5 pt-3 border-t border-[#F0F7F1] dark:border-emerald-900/40 flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-[#2E7D4F] dark:text-emerald-400">
            {item.badgeLabel}
          </span>
        </div>
      )}
    </div>
  );
}

export function TrustStats({
  title = 'Ochiqlik va ishonch koʻrsatkichlari',
  subtitle = 'Davlat oʻrmon fondi yerlaridan foydalanish boʻyicha real vaqt rejimida qayta ishlanayotgan rasmiy koʻrsatkichlar.',
  badge = 'Portal statistikasi',
  stats = DEFAULT_STATS,
  duration = 2000,
  className = '',
  triggerOnce = true,
  columns = 4,
}: TrustStatsProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isInView, setIsInView] = useState<boolean>(false);

  useEffect(() => {
    // If running in SSR or environments without IntersectionObserver (e.g. basic jsdom)
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            if (triggerOnce) {
              observer.disconnect();
            }
          } else if (!triggerOnce) {
            setIsInView(false);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    const currentElem = containerRef.current;
    if (currentElem) {
      observer.observe(currentElem);
    }

    return () => {
      observer.disconnect();
    };
  }, [triggerOnce]);

  const gridColsClass = useMemo(() => {
    switch (columns) {
      case 2:
        return 'grid-cols-1 sm:grid-cols-2';
      case 3:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      case 4:
      default:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
    }
  }, [columns]);

  return (
    <section
      ref={containerRef}
      aria-label={title}
      className={`relative w-full py-8 sm:py-12 ${className}`}
    >
      {/* Section Header */}
      {(badge || title || subtitle) && (
        <div className="max-w-2xl mb-8 sm:mb-10">
          {badge && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0F7F1] dark:bg-emerald-950/60 border border-[#D9EBDC] dark:border-emerald-800/60 text-xs font-bold uppercase tracking-wider text-[#2E7D4F] dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D4F] dark:bg-emerald-400" />
              {badge}
            </span>
          )}
          {title && (
            <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-black text-[#123522] dark:text-emerald-50 tracking-tight">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="mt-2.5 text-sm sm:text-base text-[#5A646D] dark:text-emerald-300/70 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div className={`grid ${gridColsClass} gap-5 sm:gap-6`}>
        {stats.map((item) => (
          <StatCard
            key={item.id}
            item={item}
            isInView={isInView}
            duration={duration}
          />
        ))}
      </div>
    </section>
  );
}

export default TrustStats;
