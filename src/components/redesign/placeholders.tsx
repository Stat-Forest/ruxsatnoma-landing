import React from 'react';
import {
  FileText,
  Trees,
  Compass,
  ArrowRight,
  ShieldCheck,
  BarChart3,
  Search,
  Sparkles,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';

/**
 * Skeletal placeholder for the Hero section.
 * Outlines the two-tone headline, animated centerpiece slot,
 * dual CTA buttons, and the overlapping quick-verification bar.
 */
export const HeroPlaceholder: React.FC<{
  onNavigate?: (page: string, params?: any) => void;
  heroVisualSlot?: React.ReactNode;
}> = ({ onNavigate, heroVisualSlot }) => {
  return (
    <section
      aria-label="Hero section placeholder"
      className="relative overflow-hidden pt-12 pb-20 md:pt-16 md:pb-28 bg-gradient-to-b from-[#0F3D2E] via-[#144737] to-[#1C5341] text-white"
    >
      {/* Background ambient glow */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-radial from-[#2ECC71]/25 via-transparent to-transparent blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headline, Copy & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Pulsing Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold uppercase tracking-wider text-[#A7F3D0]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2ECC71] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2ECC71]" />
              </span>
              Oʻrmon fondi davlat portali
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
              Oʻrmon resurslaridan foydalanishga{' '}
              <span className="bg-gradient-to-r from-[#3CCB7F] to-[#A7F3D0] bg-clip-text text-transparent">
                onlayn ruxsatnoma
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#C8E6D2] max-w-2xl leading-relaxed">
              Chorva mollarini oʻtlatish, pichan oʻrish, asalarichilik, rekreatsiya va boshqa oʻrmon
              xizmatlari uchun davlat ruxsatnomalarini navbatsiz, shaffof va elektron tarzda oling.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => onNavigate?.('services')}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#2ECC71] hover:bg-[#27ae60] text-[#0A261D] font-bold text-sm sm:text-base shadow-lg shadow-[#2ECC71]/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Ariza topshirish</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onNavigate?.('verify')}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/25 font-semibold text-sm sm:text-base backdrop-blur-md transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <ShieldCheck className="w-4 h-4 text-[#A7F3D0]" />
                <span>Ruxsatnomani tekshirish</span>
              </button>
            </div>
          </div>

          {/* Right Column: Hero Visual / Animation Placeholder */}
          <div className="lg:col-span-5">
            {heroVisualSlot ?? (
              <div className="relative rounded-2xl border border-white/20 bg-white/5 backdrop-blur-xl p-6 sm:p-8 text-center shadow-2xl flex flex-col items-center justify-center min-h-[340px] border-dashed border-2 border-emerald-400/40">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2ECC71] to-[#0F3D2E] flex items-center justify-center shadow-inner mb-4">
                  <Sparkles className="w-8 h-8 text-white animate-pulse" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Hero Animatsiya Maydoni</h3>
                <p className="text-xs sm:text-sm text-[#A7F3D0] max-w-xs leading-relaxed">
                  Parallaks oʻrmon foni, oʻsuvchi daraxt yoki aylanuvchi 3D hujjat / QR kod morfing
                  markazi uchun moʻljallangan modul.
                </p>
                <div className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-500/30 text-[11px] font-mono text-emerald-300">
                  <span>[ParallaxForestAnim | GrowingTreeAnim | DocumentMorphAnim]</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Overlapping Quick Check Form Strip Placeholder */}
        <div className="mt-12 sm:mt-16 relative z-10">
          <div className="bg-white/95 backdrop-blur-md border border-[#D9EBDC] rounded-2xl shadow-xl p-5 sm:p-6 text-[#1C2B24]">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 shrink-0">
                <div className="w-11 h-11 rounded-xl bg-[#EFF7F2] text-[#0F3D2E] flex items-center justify-center">
                  <Search className="w-5 h-5 text-[#2ECC71]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#0F3D2E]">Tezkor tekshirish</h4>
                  <p className="text-xs text-[#5A646D]">Ruxsatnoma seriyasi va raqamini kiriting</p>
                </div>
              </div>

              <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Seriya (masalan: RUX)"
                  readOnly
                  className="px-3.5 py-2.5 rounded-lg border border-[#D9EBDC] bg-[#F4F9F6] text-xs sm:text-sm focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Raqam (masalan: 001234)"
                  readOnly
                  className="px-3.5 py-2.5 rounded-lg border border-[#D9EBDC] bg-[#F4F9F6] text-xs sm:text-sm focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => onNavigate?.('verify')}
                  className="px-5 py-2.5 rounded-lg bg-[#0F3D2E] hover:bg-[#144737] text-white text-xs sm:text-sm font-bold transition-colors"
                >
                  Tekshirish
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/**
 * Skeletal placeholder for the Services / Directions section.
 * Outlines the 6 core forestry permit categories in card format.
 */
export const ServicesPlaceholder: React.FC<{
  onNavigate?: (page: string, params?: any) => void;
}> = ({ onNavigate }) => {
  const serviceItems = [
    { title: 'Chorva mollarini oʻtlatish', code: 'grazing', desc: 'Oʻrmon yerlarida chorva boqish uchun ruxsatnomalar' },
    { title: 'Pichan oʻrish', code: 'haymaking', desc: 'Belgilangan hududlarda oʻt va pichan yigʻishtirish' },
    { title: 'Asalarichilik qutilari', code: 'beekeeping', desc: 'Asalari oilalarini oʻrmon massivlariga joylashtirish' },
    { title: 'Madaniy-maʼrifiy turizm', code: 'tourism', desc: 'Ekoturizm, rekreatsiya va dam olish maskanlari' },
    { title: 'Yiqilgan yogʻoch yigʻish', code: 'deadwood', desc: 'Sanitariya tozalash va toʻkilgan yogʻochlarni toʻplash' },
    { title: 'Ilmiy-tadqiqot ishlari', code: 'research', desc: 'Oʻrmon hududida monitoring va tajribalar oʻtkazish' },
  ];

  return (
    <section aria-label="Services section placeholder" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFF7F2] border border-[#D9EBDC] text-xs font-bold uppercase tracking-wider text-[#0F3D2E]">
          <Trees className="w-3.5 h-3.5 text-[#2ECC71]" />
          Xizmatlar katalogi
        </span>
        <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0F3D2E]">
          Olti yoʻnalish, bitta raqamli platforma
        </h2>
        <p className="mt-3 text-sm sm:text-base text-[#5A646D]">
          Davlat oʻrmon xoʻjaligi hududlaridan qonuniy va xavfsiz foydalanish uchun barcha ruxsatnomalar
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {serviceItems.map((svc, idx) => (
          <div
            key={svc.code}
            className="group relative rounded-2xl bg-[#EFF7F2] border border-[#D9EBDC] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-white border border-[#D9EBDC] text-[#0F3D2E] flex items-center justify-center shadow-xs mb-4 group-hover:bg-[#2ECC71] group-hover:text-white transition-colors">
                <Compass className="w-6 h-6" />
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#2ECC71]">
                0{idx + 1} • Yoʻnalish
              </div>
              <h3 className="mt-2 text-lg font-bold text-[#0F3D2E] group-hover:text-[#1C5341] transition-colors">
                {svc.title}
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-[#5A646D] leading-relaxed">
                {svc.desc}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#D9EBDC]/60 flex items-center justify-between">
              <button
                type="button"
                onClick={() => onNavigate?.('services')}
                className="text-xs font-bold text-[#0F3D2E] group-hover:text-[#2ECC71] flex items-center gap-1 transition-colors"
              >
                Batafsil maʼlumot <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

/**
 * Skeletal placeholder for the Trust & Statistics section.
 * Outlines live metrics from the open data registry and trust indicators.
 */
export const StatsPlaceholder: React.FC = () => {
  const statCards = [
    { label: 'Faol ruxsatnomalar', value: '42,850+', note: 'Davlat reyestrida tasdiqlangan', icon: FileText },
    { label: 'Oʻrmon maydoni (ga)', value: '185,400 ga', note: 'Biriktirilgan hududlar umumiy hajmi', icon: Trees },
    { label: 'Oʻrmon xoʻjaliklari', value: '98 ta', note: 'Respublika boʻylab barcha hududlarda', icon: MapPin },
    { label: 'Avtomatlashtirilgan jarayon', value: '94.8%', note: 'Inson omilisiz tezkor koʻrib chiqish', icon: BarChart3 },
  ];

  return (
    <section aria-label="Stats section placeholder" className="py-16 bg-[#EFF7F2]/70 border-y border-[#D9EBDC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#D9EBDC] text-xs font-bold uppercase tracking-wider text-[#0F3D2E]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2ECC71]" />
            Ochiq maʼlumotlar
          </span>
          <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-[#0F3D2E]">
            Portal raqamlarda
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#5A646D]">
            Koʻrsatkichlar rasmiy ochiq maʼlumotlar xizmatidan real vaqt rejimida yangilanadi
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                className="bg-white rounded-2xl border border-[#D9EBDC] p-6 shadow-xs hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-xl bg-[#EFF7F2] text-[#0F3D2E] flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-[#2ECC71]" />
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[#0F3D2E] tracking-tight">
                  {stat.value}
                </div>
                <div className="mt-2 text-xs sm:text-sm font-bold text-[#1C2B24]">
                  {stat.label}
                </div>
                <div className="mt-1 text-[11px] text-[#767F87]">{stat.note}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

/**
 * Skeletal placeholder for the Footer section.
 * Outlines the deep green footer (#0F3D2E) with organic wave separation,
 * agency contacts, social links, and legal info.
 */
export const FooterPlaceholder: React.FC<{
  onNavigate?: (page: string, params?: any) => void;
}> = ({ onNavigate }) => {
  return (
    <footer aria-label="Footer section placeholder" className="bg-[#0F3D2E] text-white pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          {/* Brand Col */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2ECC71] flex items-center justify-center font-bold text-[#0F3D2E]">
                <Trees className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-bold uppercase tracking-wider">Oʻrmon Xoʻjaligi</div>
                <div className="text-xs text-[#A7F3D0]">Davlat Agentligi Portali</div>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-[#C8E6D2] leading-relaxed max-w-sm">
              Oʻzbekiston Respublikasi Ekologiya, atrof-muhitni muhofaza qilish va iqlim oʻzgarishi
              vazirligi huzuridagi Oʻrmon xoʻjaligi agentligi.
            </p>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#A7F3D0]">Xizmatlar</h4>
            <ul className="space-y-2 text-xs text-[#C8E6D2]">
              <li><button onClick={() => onNavigate?.('services')} className="hover:text-white transition-colors">Chorva oʻtlatish</button></li>
              <li><button onClick={() => onNavigate?.('services')} className="hover:text-white transition-colors">Pichan oʻrish</button></li>
              <li><button onClick={() => onNavigate?.('services')} className="hover:text-white transition-colors">Asalarichilik</button></li>
              <li><button onClick={() => onNavigate?.('services')} className="hover:text-white transition-colors">Ekoturizm</button></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#A7F3D0]">Portal</h4>
            <ul className="space-y-2 text-xs text-[#C8E6D2]">
              <li><button onClick={() => onNavigate?.('about')} className="hover:text-white transition-colors">Agentlik haqida</button></li>
              <li><button onClick={() => onNavigate?.('news')} className="hover:text-white transition-colors">Yangiliklar</button></li>
              <li><button onClick={() => onNavigate?.('documents')} className="hover:text-white transition-colors">Qonunchilik</button></li>
              <li><button onClick={() => onNavigate?.('verify')} className="hover:text-white transition-colors">Ruxsatnoma tekshirish</button></li>
            </ul>
          </div>

          {/* Contact Col */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#A7F3D0]">Bogʻlanish</h4>
            <div className="space-y-2 text-xs text-[#C8E6D2]">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#2ECC71] shrink-0" />
                <span>Ishonch telefoni: +998 (71) 200-00-00</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#2ECC71] shrink-0" />
                <span>info@urmon.gov.uz</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#2ECC71] shrink-0 mt-0.5" />
                <span>Toshkent shahri, Yunusobod tumani</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#A7F3D0]/75 gap-4">
          <div>© {new Date().getFullYear()} Oʻrmon xoʻjaligi agentligi. Barcha huquqlar himoyalangan.</div>
          <div className="flex items-center gap-4">
            <span>Foydalanish shartlari</span>
            <span>Maxfiylik siyosati</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
