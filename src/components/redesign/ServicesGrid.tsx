import React, { useState } from 'react';
import {
  Trees,
  Wheat,
  Flower2,
  Compass,
  Axe,
  FlaskConical,
  Clock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export interface PermitCategory {
  id: string;
  code: string;
  number: string;
  title: string;
  subtitle?: string;
  description: string;
  processingDays: number;
  daysLabel: string;
  legalBasis?: string;
  badge?: string;
  quotaNote?: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface ServicesGridProps {
  /**
   * Custom permit categories. If omitted, defaults to the 6 standard
   * forestry permit categories.
   */
  categories?: PermitCategory[];
  /**
   * Currently active or selected category ID or code.
   */
  selectedId?: string;
  /**
   * Callback invoked when a permit category card or its action button is selected.
   */
  onSelectCategory?: (category: PermitCategory) => void;
  /**
   * Navigation handler matching the portal-wide convention.
   */
  onNavigate?: (page: string, params?: Record<string, unknown>) => void;
  /**
   * Custom section title (default: "Olti yoʻnalish, bitta raqamli platforma").
   */
  title?: string;
  /**
   * Custom section subtitle.
   */
  subtitle?: string;
  /**
   * Custom badge text at the top of the grid section (default: "Xizmatlar katalogi").
   */
  badge?: string;
  /**
   * Whether to display the section header (badge, title, subtitle).
   * @default true
   */
  showHeader?: boolean;
  /**
   * Optional additional CSS classes for the container.
   */
  className?: string;
}

const DEFAULT_PERMIT_CATEGORIES: PermitCategory[] = [
  {
    id: 'grazing',
    code: 'grazing',
    number: '01',
    title: 'Chorva mollarini boqish',
    subtitle: 'Mavsumiy yaylov ruxsatnomasi',
    description:
      'Davlat oʻrmon fondi yerlarida qoramol, qoʻy, echki va boshqa chorva mollarini belgilangan meʼyorlar asosida xavfsiz va mavsumiy oʻtlatish.',
    processingDays: 5,
    daysLabel: '5 ish kuni',
    legalBasis: 'VMQ 689-son',
    badge: 'Eng koʻp talab qilinadigan',
    quotaNote: 'Bosh soni va muddat boʻyicha',
    icon: Trees,
  },
  {
    id: 'haymaking',
    code: 'haymaking',
    number: '02',
    title: 'Pichan tayyorlash',
    subtitle: 'Oʻtloq va pichanzorlardan foydalanish',
    description:
      'Oʻrmon xoʻjaligi ochiq yer maydonlari va tabiiy pichanzorlarida qish mavsumi uchun sifatli ozuqa pichani oʻrish va gʻamlash ruxsatnomasi.',
    processingDays: 5,
    daysLabel: '5 ish kuni',
    legalBasis: 'VMQ 689-son',
    badge: 'Mavsumiy pichan oʻrimi',
    quotaNote: 'Gektar (ga) hisobida',
    icon: Wheat,
  },
  {
    id: 'apiary',
    code: 'apiary',
    number: '03',
    title: 'Asalarichilik',
    subtitle: 'Asalari oilalarini joylashtirish',
    description:
      'Oʻrmon fondining boy nektarli gullaydigan daraxtzorlariga asalari qutilarini mavsumiy koʻchirish va joylashtirish uchun ruxsatnoma.',
    processingDays: 3,
    daysLabel: '3 ish kuni',
    legalBasis: 'VMQ 689-son',
    badge: 'Tezkor koʻrib chiqish',
    quotaNote: 'Quti / uya soni boʻyicha',
    icon: Flower2,
  },
  {
    id: 'recreation',
    code: 'recreation',
    number: '04',
    title: 'Dam olish va turizm',
    subtitle: 'Ekoturizm va rekreatsiya',
    description:
      'Oʻrmon massivlarida ekologik sayohatlar, saylgohlar, sogʻlomlashtirish oromgohlari va aholi dam olish maskanlarini tashkil etish.',
    processingDays: 10,
    daysLabel: '10 ish kuni',
    legalBasis: 'VMQ 689-son',
    badge: 'Ekoturizm loyihasi',
    quotaNote: 'Maydon va mavsum boʻyicha',
    icon: Compass,
  },
  {
    id: 'deadwood',
    code: 'deadwood',
    number: '05',
    title: 'Quruq shox-shabba yigʻish',
    subtitle: 'Oʻrmon sanitariya tozalovi',
    description:
      'Oʻrmon yongʻinlari xavfini kamaytirish va sanitariya holatini yaxshilash maqsadida tabiiy toʻkilgan va qurigan yogʻochlarni toʻplash.',
    processingDays: 3,
    daysLabel: '3 ish kuni',
    legalBasis: 'Sanitariya qoidalari',
    badge: 'Ekologik tozalash',
    quotaNote: 'Hajm (m³) hisobida',
    icon: Axe,
  },
  {
    id: 'science',
    code: 'science',
    number: '06',
    title: 'Ilmiy-tadqiqot ishlari',
    subtitle: 'Monitoring va tajriba maydonlari',
    description:
      'Oʻrmon biologik xilma-xilligi, tuproq-iqlim sharoitlari va flora-faunasini oʻrganish boʻyicha akademik va ilmiy kuzatuvlar olib borish.',
    processingDays: 15,
    daysLabel: '15 ish kuni',
    legalBasis: 'Fan va innovatsiyalar',
    badge: 'Imtiyozli asosda',
    quotaNote: 'Ilmiy dastur asosida',
    icon: FlaskConical,
  },
];

/**
 * ServicesGrid
 *
 * Renders 6 cards for the State Forestry Agency permit categories.
 * Each card has:
 * - Soft green background (#EFF7F2)
 * - Lift on hover (translateY -6px) with green-tinted shadow
 * - Staggered fade-in animations
 */
export const ServicesGrid: React.FC<ServicesGridProps> = ({
  categories = DEFAULT_PERMIT_CATEGORIES,
  selectedId,
  onSelectCategory,
  onNavigate,
  title = 'Olti yoʻnalish, bitta raqamli platforma',
  subtitle = 'Davlat oʻrmon xoʻjaligi hududlaridan qonuniy, shaffof va xavfsiz foydalanish uchun elektron ruxsatnomalar katalogi.',
  badge = 'Xizmatlar katalogi',
  showHeader = true,
  className = '',
}) => {
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  const handleCardClick = (category: PermitCategory) => {
    if (onSelectCategory) {
      onSelectCategory(category);
    }
    if (onNavigate) {
      onNavigate('applicant_wizard', { activity: category.id });
    }
  };

  return (
    <section
      aria-label="Xizmatlar katalogi"
      className={`relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 ${className}`}
    >
      <style>{`
        @keyframes serviceCardFadeIn {
          0% {
            opacity: 0;
            transform: translateY(22px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .services-grid-card {
          opacity: 0;
          animation: serviceCardFadeIn 0.65s cubic-bezier(0.16, 0.84, 0.44, 1) forwards;
          background-color: #EFF7F2;
          transition: transform 0.35s cubic-bezier(0.16, 0.84, 0.44, 1),
                      box-shadow 0.35s cubic-bezier(0.16, 0.84, 0.44, 1),
                      border-color 0.35s ease;
        }

        .services-grid-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 32px -6px rgba(46, 125, 79, 0.22),
                      0 8px 16px -4px rgba(46, 125, 79, 0.14);
          border-color: #7FB98A;
        }

        @media (prefers-reduced-motion: reduce) {
          .services-grid-card {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
          }
          .services-grid-card:hover {
            transform: none !important;
          }
        }
      `}</style>

      {/* ── Section Header ────────────────────────────────────────── */}
      {showHeader && (
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFF7F2] border border-[#D9EBDC] shadow-xs">
            <ShieldCheck className="w-4 h-4 text-[#2E7D4F]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#0F3D2E]">
              {badge}
            </span>
          </div>

          <h2 className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-black text-[#0F3D2E] tracking-tight leading-tight">
            {title}
          </h2>

          <p className="mt-3 text-sm sm:text-base text-[#4B5A52] max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>
      )}

      {/* ── 6 Permit Category Cards Grid ───────────────────────────── */}
      <div
        data-testid="services-grid"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7"
      >
        {categories.map((category, index) => {
          const Icon = category.icon;
          const isSelected = selectedId === category.id || selectedId === category.code;
          const isHovered = hoveredCardId === category.id;
          const staggerDelay = `${index * 80}ms`;

          return (
            <article
              key={category.id}
              data-testid={`service-card-${category.id}`}
              style={{
                animationDelay: staggerDelay,
                backgroundColor: '#EFF7F2',
              }}
              onMouseEnter={() => setHoveredCardId(category.id)}
              onMouseLeave={() => setHoveredCardId(null)}
              onClick={() => handleCardClick(category)}
              tabIndex={0}
              role="button"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleCardClick(category);
                }
              }}
              className={`services-grid-card group relative flex flex-col justify-between rounded-2xl border p-6 sm:p-7 cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2E7D4F] focus-visible:ring-offset-2 ${
                isSelected
                  ? 'border-[#2E7D4F] ring-2 ring-[#2E7D4F]/30 shadow-md'
                  : 'border-[#D9EBDC]'
              }`}
            >
              {/* Top Row: Index Badge & SLA Badge */}
              <div>
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-white/90 border border-[#D9EBDC] text-xs font-black text-[#2E7D4F] shadow-xs">
                      {category.number}
                    </span>
                    {category.legalBasis && (
                      <span className="text-[11px] font-semibold text-[#708076] tracking-wide">
                        {category.legalBasis}
                      </span>
                    )}
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-[#D9EBDC] shadow-xs">
                    <Clock className="w-3.5 h-3.5 text-[#2E7D4F]" />
                    <span className="text-xs font-bold text-[#0F3D2E]">
                      {category.daysLabel}
                    </span>
                  </div>
                </div>

                {/* Icon Container & Badge */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-[#D9EBDC] text-[#2E7D4F] flex items-center justify-center shadow-xs transition-all duration-300 group-hover:scale-105 group-hover:bg-[#2E7D4F] group-hover:text-white group-hover:border-[#2E7D4F]">
                    <Icon className="w-7 h-7 transition-transform duration-300 group-hover:scale-110" />
                  </div>

                  {category.badge && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100/70 border border-emerald-300/60 text-[11px] font-bold text-[#14532D]">
                      <Sparkles className="w-3 h-3 text-[#2E7D4F]" />
                      {category.badge}
                    </span>
                  )}
                </div>

                {/* Subtitle */}
                {category.subtitle && (
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#2E7D4F] mb-1">
                    {category.subtitle}
                  </div>
                )}

                {/* Title */}
                <h3 className="text-lg sm:text-xl font-extrabold text-[#0F3D2E] tracking-tight leading-snug group-hover:text-[#154c3a] transition-colors">
                  {category.title}
                </h3>

                {/* Description */}
                <p className="mt-2.5 text-xs sm:text-sm text-[#4B5A52] leading-relaxed line-clamp-3">
                  {category.description}
                </p>
              </div>

              {/* Bottom Row: Metadata Note & Action CTA Button */}
              <div className="mt-6 pt-4 border-t border-[#D9EBDC]/80 flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-[#708076] truncate">
                  {category.quotaNote ?? 'Onlayn ariza'}
                </span>

                <button
                  type="button"
                  tabIndex={-1}
                  aria-label={`${category.title} uchun ariza topshirish`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCardClick(category);
                  }}
                  className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                    isHovered || isSelected
                      ? 'text-[#2E7D4F] translate-x-0.5'
                      : 'text-[#0F3D2E]'
                  }`}
                >
                  <span>Ariza topshirish</span>
                  <ArrowRight
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isHovered || isSelected ? 'translate-x-1' : ''
                    }`}
                  />
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default ServicesGrid;
