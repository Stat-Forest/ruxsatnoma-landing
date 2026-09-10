import { useEffect, useState } from 'react';
import { ArrowRight, Check, Pause, Play } from 'lucide-react';
import { useLanguage, useT } from '../../i18n/useT';
import type { UiLanguage } from '../../i18n/context';

export interface HeroSliderProps {
  onNavigate?: (page: string, params?: Record<string, unknown>) => void;
}

interface SlideCopy {
  badge: string;
  title: string;
  titleAccent: string;
  subtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
}

/** Which page each slide's two buttons open. Slide 0 reuses the copy already
 *  seeded for the old single-slide hero (`hero.*`, in each language's
 *  `common.ts`, owned by the header/footer track) so its wording never drifts from the buttons
 *  that used to say the same thing; slides 1 and 2 are new copy this task
 *  needed and `src/i18n/*` is off-limits to this track (file-ownership
 *  boundary), so it lives here, translated into all five portal languages. */
const SLIDE_ACTIONS: { primary: string; secondary: string }[] = [
  { primary: 'auth_login', secondary: 'calculator' },
  { primary: 'verify', secondary: 'about' },
  { primary: 'services', secondary: 'calculator' },
];

/** Slides 2 and 3 (index 1 and 2) — `design-canvas/Main.dc.html`'s
 *  `renderVals()` `slides` array, translated. Best-effort for `kaa`, matching
 *  the approximate quality of the existing `REF_TRANSLATIONS` Karakalpak
 *  entries (`src/lib/localized.ts`) rather than a professional translation.
 *
 *  Slide 2 no longer says the permit's contour is shown on a map: the
 *  backend withholds `contour` behind a disclosure flag that defaults OFF
 *  until the Agency consents in writing, so `/check` draws no map at all for
 *  anyone today. Copy describes what the site does, not what it could. */
const EXTRA_SLIDES: Record<UiLanguage, [SlideCopy, SlideCopy]> = {
  uz_latn: [
    {
      badge: 'Rasmiy tekshiruv xizmati',
      title: 'Ruxsatnoma haqiqiyligini',
      titleAccent: 'bir daqiqada tekshiring',
      subtitle:
        'QR-kodni skanerlang yoki seriya va raqamni kiriting — hujjat davlat reyestri bilan solishtiriladi va natija darhol koʻrsatiladi.',
      ctaPrimary: 'Tekshirishni boshlash',
      ctaSecondary: 'QR-kod qanday ishlaydi',
    },
    {
      badge: 'Olti yoʻnalish, bitta portal',
      title: 'Chorvadan asalarichilikkacha —',
      titleAccent: 'barchasi onlayn',
      subtitle:
        'Chorva boqish, pichan tayyorlash, asalarichilik, dam olish va turizm, quruq shox-shabba yigʻish hamda ilmiy tadqiqot uchun rasmiy ruxsatnomalar.',
      ctaPrimary: 'Xizmatlarni koʻrish',
      ctaSecondary: 'Narxni hisoblash',
    },
  ],
  ru: [
    {
      badge: 'Официальная служба проверки',
      title: 'Проверьте подлинность разрешения',
      titleAccent: 'за одну минуту',
      subtitle:
        'Отсканируйте QR-код или введите серию и номер — документ сверяется с государственным реестром, а результат показывается сразу.',
      ctaPrimary: 'Начать проверку',
      ctaSecondary: 'Как работает QR-код',
    },
    {
      badge: 'Шесть направлений, один портал',
      title: 'От животноводства до пчеловодства —',
      titleAccent: 'всё онлайн',
      subtitle:
        'Официальные разрешения на выпас скота, заготовку сена, пчеловодство, отдых и туризм, сбор валежника и научные исследования.',
      ctaPrimary: 'Смотреть услуги',
      ctaSecondary: 'Рассчитать стоимость',
    },
  ],
  en: [
    {
      badge: 'Official verification service',
      title: 'Verify a permit’s authenticity',
      titleAccent: 'in under a minute',
      subtitle:
        'Scan the QR code or enter the series and number — the document is checked against the state register and the result is shown at once.',
      ctaPrimary: 'Start verification',
      ctaSecondary: 'How the QR code works',
    },
    {
      badge: 'Six directions, one portal',
      title: 'From grazing to beekeeping —',
      titleAccent: 'all of it online',
      subtitle:
        'Official permits for livestock grazing, haymaking, apiary, recreation and tourism, deadwood collection, and scientific research.',
      ctaPrimary: 'View services',
      ctaSecondary: 'Calculate the price',
    },
  ],
  uz_cyrl: [
    {
      badge: 'Расмий текширув хизмати',
      title: 'Рухсатнома ҳақиқийлигини',
      titleAccent: 'бир дақиқада текширинг',
      subtitle:
        'ҚР-кодни сканерланг ёки серия ва рақамни киритинг — ҳужжат давлат реестри билан солиштирилади ва натижа дарҳол кўрсатилади.',
      ctaPrimary: 'Текширишни бошлаш',
      ctaSecondary: 'ҚР-код қандай ишлайди',
    },
    {
      badge: 'Олти йўналиш, битта портал',
      title: 'Чорвадан асаларичиликкача —',
      titleAccent: 'барчаси онлайн',
      subtitle:
        'Чорва боқиш, пичан тайёрлаш, асаларичилик, дам олиш ва туризм, қуруқ шох-шабба йиғиш ҳамда илмий тадқиқот учун расмий рухсатномалар.',
      ctaPrimary: 'Хизматларни кўриш',
      ctaSecondary: 'Нархни ҳисоблаш',
    },
  ],
  kaa: [
    {
      badge: 'Rásmiy tekseriw xizmeti',
      title: 'Ruxsatnama xaqıyqıylıǵın',
      titleAccent: 'bir minuttıń ishinde tekseriń',
      subtitle:
        'QR-kodtı skanerleń yamasa seriya hám nomerdi kiritiń — quzhat mámleket reyestri menen salıstırıladı hám nátiyje derhal kórsetiledi.',
      ctaPrimary: 'Tekseriwdi baslaw',
      ctaSecondary: 'QR-kod qalay isleydi',
    },
    {
      badge: 'Altı baǵdar, bir portal',
      title: 'Sharwadan al hárreshilikke shekem —',
      titleAccent: 'hámmesi onlayn',
      subtitle:
        'Sharwa malların baǵıw, pıshen tayarlaw, pal hárreshilik, dem alıw hám turizm, qurı shaq-shabba jıynaw hám ilimiy izertlew ushın rásmiy ruxsatnamalar.',
      ctaPrimary: 'Xizmetlerdi kóriw',
      ctaSecondary: 'Bahasın esaplaw',
    },
  ],
};

const DOT_LABEL: Record<UiLanguage, (n: number) => string> = {
  uz_latn: (n) => `${n}-slayd`,
  uz_cyrl: (n) => `${n}-слайд`,
  ru: (n) => `Слайд ${n}`,
  kaa: (n) => `${n}-slayd`,
  en: (n) => `Slide ${n}`,
};

/** The pause control's accessible name, in both states. Local for the same
 *  reason `DOT_LABEL` and `EXTRA_SLIDES` are. */
const PLAYBACK_LABEL: Record<UiLanguage, { pause: string; play: string }> = {
  uz_latn: { pause: 'Slaydlarni toʻxtatish', play: 'Slaydlarni davom ettirish' },
  uz_cyrl: { pause: 'Слайдларни тўхтатиш', play: 'Слайдларни давом эттириш' },
  ru: { pause: 'Остановить слайды', play: 'Продолжить слайды' },
  kaa: { pause: 'Slaydlardı toqtatıw', play: 'Slaydlardı dawam etiw' },
  en: { pause: 'Pause the slides', play: 'Resume the slides' },
};

const SLIDE_DELAY_MS = 5200;

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/** `matchMedia` is missing in some test environments and in any non-browser
 *  render, and a hero that throws is worse than one that moves. */
function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

/** Light shafts, drifting mist and a three-bird flock — the shared motion
 *  classes `rays`/`drift-a`/`drift-b`/`flock`/`wing-a`/`wing-b` from
 *  `src/foundations/motion.css` (Task 6), ported 1:1 from the same section of
 *  `Main.dc.html` that class list documents itself as coming from. */
function Atmosphere() {
  return (
    <svg viewBox="0 0 1440 620" className="absolute inset-0 w-full h-full" aria-hidden="true">
      <defs>
        <linearGradient id="hero-shaft" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFF7DC" stopOpacity=".30" />
          <stop offset="1" stopColor="#FFF7DC" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="hero-mist" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#DFF0E4" stopOpacity="0" />
          <stop offset=".55" stopColor="#DFF0E4" stopOpacity=".26" />
          <stop offset="1" stopColor="#DFF0E4" stopOpacity="0" />
        </linearGradient>
      </defs>

      <g className="rays">
        <path d="M980 -40 L1120 -40 L900 620 L820 620 Z" fill="url(#hero-shaft)" />
        <path d="M1120 -40 L1210 -40 L1040 620 L980 620 Z" fill="url(#hero-shaft)" opacity=".7" />
        <path d="M1230 -40 L1290 -40 L1170 620 L1130 620 Z" fill="url(#hero-shaft)" opacity=".45" />
      </g>

      <g className="drift-a">
        <rect x="-200" y="300" width="1840" height="120" fill="url(#hero-mist)" />
      </g>
      {/* Kept above the meadow (y≈440–500): that band carries each slide's
          focal group, and mist across it washed the permit card and the
          flock out. */}
      <g className="drift-b">
        <rect x="-200" y="370" width="1840" height="90" fill="url(#hero-mist)" opacity=".55" />
      </g>

      <g className="flock" stroke="#EAF3EC" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity=".72">
        <path className="wing-a" d="M300 148 q9 -8 18 0 q9 -8 18 0" />
        <path className="wing-b" d="M356 176 q7 -6 14 0 q7 -6 14 0" />
        <path className="wing-a" d="M404 132 q6 -5 12 0 q6 -5 12 0" style={{ animationDelay: '.4s' }} />
      </g>
    </svg>
  );
}

/**
 * The redesigned home page's hero (task 8): three cross-fading slides with a
 * shared atmosphere layer, advancing every 5.2s (matching
 * `design-canvas/Main.dc.html`'s own `setInterval(..., 5200)`), driven by
 * real `<button>` dots.
 *
 * WCAG 2.2.2 (level A) requires a pause mechanism for anything that
 * auto-updates for more than five seconds, and the footer of this site
 * claims WCAG 2.2 AA. This one ran an unstoppable interval, and its slide
 * transition was an inline style, so `motion.css`'s reduced-motion block
 * could not reach it either. Three things now hold it to that claim:
 *
 * - the interval does not start at all under `prefers-reduced-motion`, and
 *   stops the moment the preference changes;
 * - it pauses on hover and on keyboard focus anywhere in the hero, so a
 *   reader is never moved out from under a link they are reaching for;
 * - a real pause/resume button, beside the dots, for everyone else.
 *
 * The transition itself is now the `.hero-slide` class, which lives in
 * `motion.css` where the media block governs it.
 */
export function HeroSlider({ onNavigate }: HeroSliderProps) {
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(prefersReducedMotion);
  const t = useT();
  const { uiLanguage } = useLanguage();

  // The preference can change while the page is open (a viewer flipping the
  // OS setting), and a carousel that only reads it once ignores that.
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia(REDUCED_MOTION_QUERY);
    const onChange = () => setReducedMotion(query.matches);
    query.addEventListener?.('change', onChange);
    return () => query.removeEventListener?.('change', onChange);
  }, []);

  const autoplay = !reducedMotion && !paused && !hovered;

  useEffect(() => {
    if (!autoplay) return;
    const id = setInterval(() => {
      setSlide((current) => (current + 1) % 3);
    }, SLIDE_DELAY_MS);
    return () => clearInterval(id);
  }, [autoplay]);

  const copy: SlideCopy =
    slide === 0
      ? {
          badge: t('hero.badge'),
          title: t('hero.title'),
          titleAccent: t('hero.titleAccent'),
          subtitle: t('hero.subtitle'),
          ctaPrimary: t('hero.cta.apply'),
          ctaSecondary: t('hero.cta.calculator'),
        }
      : EXTRA_SLIDES[uiLanguage][slide - 1];

  const actions = SLIDE_ACTIONS[slide];
  const dotLabel = DOT_LABEL[uiLanguage];
  const playbackLabel = PLAYBACK_LABEL[uiLanguage];

  return (
    <section
      className="relative overflow-hidden h-[460px] sm:h-[540px] lg:h-[580px]"


      // Hover and keyboard focus both pause: a reader must never be moved
      // out from under the link they are reaching for. `onFocus`/`onBlur`
      // bubble in React, so focus anywhere inside the hero counts.
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      {/* Background video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover object-center"
      >
        <source src="/video/Uzbekistan_forest_economy_docume…_1080p_20260910145426.mp4" type="video/mp4" />
      </video>



      {/* Qoramtir gradient faqat chap tomondagi matn orqasida bo'ladi, o'ng tomoni to'liq toza video */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(to right, rgba(5,18,10,0.88) 0%, rgba(5,18,10,0.68) 32%, rgba(5,18,10,0.2) 46%, rgba(5,18,10,0) 54%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto h-full flex items-center px-4 sm:px-6">
        <div className="max-w-xl lg:max-w-2xl">
          <div className="reveal-top inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 border border-white/25 backdrop-blur-md">
            <span className="live w-1.5 h-1.5 rounded-full bg-[#4ADE80] shadow-[0_0_0_4px_rgba(74,222,128,.22)]" />
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-white">{copy.badge}</span>
          </div>

          <h1
            className="reveal-left mt-5 text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-[1.1] tracking-tight"
            style={{ animationDelay: '.15s' }}
          >
            {copy.title}
            <span className="reveal-right block text-[#9CE3AE]" style={{ animationDelay: '.3s' }}>{copy.titleAccent}</span>
          </h1>

          <p
            className="reveal-zoom mt-4 text-xs sm:text-sm leading-relaxed text-[#DCE8DE] max-w-lg"
            style={{ animationDelay: '.45s' }}
          >
            {copy.subtitle}
          </p>

          <div className="reveal mt-7 flex flex-wrap items-center gap-3" style={{ animationDelay: '.6s' }}>
            <button
              type="button"
              onClick={() => onNavigate?.(actions.primary)}
              className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-[#2E7D4F] hover:bg-[#23653F] text-white text-sm font-bold shadow-[0_14px_34px_rgba(46,125,79,.5)] transition-colors"
            >
              <span>{copy.ctaPrimary}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigate?.(actions.secondary)}
              className="inline-flex items-center h-12 px-6 rounded-xl border border-white/40 text-white text-sm font-bold hover:bg-white/10 transition-colors"
            >
              {copy.ctaSecondary}
            </button>
          </div>

          <div className="reveal-right mt-8 flex flex-wrap items-center gap-5" style={{ animationDelay: '.75s' }}>
            {[t('hero.trust.fast'), t('hero.trust.qr'), t('hero.trust.online')].map((label) => (
              <div key={label} className="flex items-center gap-2 text-xs font-semibold text-[#C7DCCB]">
                <Check className="w-4 h-4 text-[#7FE0A0]" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 bottom-5 sm:bottom-8 flex items-center gap-2.5">
        {[0, 1, 2].map((i) => (
          <button
            key={i}
            type="button"
            aria-label={dotLabel(i + 1)}
            onClick={() => setSlide(i)}
            style={{ height: '44px' }}
            className="flex items-center px-1"
          >
            <span
              // `.hero-dot`, for the same reason as `.hero-slide` above.
              className="hero-dot block rounded-full"
              style={{
                height: '5px',
                width: slide === i ? '46px' : '18px',
                background: slide === i ? '#FFFFFF' : 'rgba(255,255,255,.34)',
              }}
            />
          </button>
        ))}

        {/* WCAG 2.2.2: a mechanism to pause anything auto-updating for more
            than five seconds. Hover and focus pause it too, but neither is a
            "mechanism" a touch or switch user can reach. */}
        <button
          type="button"
          aria-label={paused ? playbackLabel.play : playbackLabel.pause}
          aria-pressed={paused}
          onClick={() => setPaused((current) => !current)}
          className="ml-1 flex h-11 w-11 items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10"
        >
          {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
        </button>

        <span className="text-[11px] font-semibold text-white/55 tracking-wider">{`0${slide + 1} / 03`}</span>
      </div>
    </section>
  );
}
