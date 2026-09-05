import React, { useState } from 'react';
import {
  Search,
  QrCode,
  ArrowRight,
  ShieldCheck,
  FileCheck2,
  CheckCircle2,
  Users,
  TrendingUp,
  Trees,
  ChevronRight,
  PhoneCall,
  ExternalLink,
  MapPin,
  Star,
  Send,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/FormControls';
import { useT } from '../../i18n/useT';

export interface HomePageProps {
  onNavigate?: (page: string, params?: any) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const t = useT();
  const [quickSearchInput, setQuickSearchInput] = useState('');
  const [selectedRating, setSelectedRating] = useState<string>('');
  const [ratingSubmitted, setRatingSubmitted] = useState<boolean>(false);

  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRating) {
      setRatingSubmitted(true);
    }
  };

  const stats = [
    { label: t('home.stats.totalPermits.label'), value: '42,850+', icon: <FileCheck2 className="w-6 h-6 text-[#2E7D4F]" />, change: t('home.stats.totalPermits.change') },
    { label: t('home.stats.activeForestries.label'), value: t('home.stats.activeForestries.value'), icon: <Trees className="w-6 h-6 text-[#2E7D4F]" />, change: t('home.stats.activeForestries.change') },
    { label: t('home.stats.livestock.label'), value: '185,400', icon: <Users className="w-6 h-6 text-[#2E7D4F]" />, change: t('home.stats.livestock.change') },
    { label: t('home.stats.autoApproved.label'), value: '94.8%', icon: <TrendingUp className="w-6 h-6 text-[#2E7D4F]" />, change: t('home.stats.autoApproved.change') },
  ];

  const activities = [
    {
      id: 'grazing',
      title: t('home.activities.grazing.title'),
      desc: t('home.activities.grazing.desc'),
      badge: t('home.activities.grazing.badge'),
      icon: <Trees className="w-6 h-6 text-[#2E7D4F]" />,
      limit: t('home.activities.grazing.limit'),
    },
    {
      id: 'haymaking',
      title: t('home.activities.haymaking.title'),
      desc: t('home.activities.haymaking.desc'),
      badge: t('home.activities.haymaking.badge'),
      icon: <FileCheck2 className="w-6 h-6 text-[#2E7D4F]" />,
      limit: t('home.activities.haymaking.limit'),
    },
    {
      id: 'beekeeping',
      title: t('home.activities.beekeeping.title'),
      desc: t('home.activities.beekeeping.desc'),
      badge: t('home.activities.beekeeping.badge'),
      icon: <ShieldCheck className="w-6 h-6 text-[#2E7D4F]" />,
      limit: t('home.activities.beekeeping.limit'),
    },
    {
      id: 'wild_plants',
      title: t('home.activities.wild_plants.title'),
      desc: t('home.activities.wild_plants.desc'),
      badge: t('home.activities.wild_plants.badge'),
      icon: <Trees className="w-6 h-6 text-[#2E7D4F]" />,
      limit: t('home.activities.wild_plants.limit'),
    },
    {
      id: 'medicinal_herbs',
      title: t('home.activities.medicinal_herbs.title'),
      desc: t('home.activities.medicinal_herbs.desc'),
      badge: t('home.activities.medicinal_herbs.badge'),
      icon: <Trees className="w-6 h-6 text-[#2E7D4F]" />,
      limit: t('home.activities.medicinal_herbs.limit'),
    },
    {
      id: 'recreation',
      title: t('home.activities.recreation.title'),
      desc: t('home.activities.recreation.desc'),
      badge: t('home.activities.recreation.badge'),
      icon: <MapPin className="w-6 h-6 text-[#2E7D4F]" />,
      limit: t('home.activities.recreation.limit'),
    },
  ];

  const newsList = [
    {
      date: t('home.news.seasonalApplications.date'),
      title: t('home.news.seasonalApplications.title'),
      desc: t('home.news.seasonalApplications.desc'),
    },
    {
      date: t('home.news.prosecutorIntegration.date'),
      title: t('home.news.prosecutorIntegration.title'),
      desc: t('home.news.prosecutorIntegration.desc'),
    },
    {
      date: t('home.news.grazingRates.date'),
      title: t('home.news.grazingRates.title'),
      desc: t('home.news.grazingRates.desc'),
    },
  ];

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickSearchInput.trim()) {
      onNavigate?.('verify', { query: quickSearchInput.trim() });
    }
  };

  return (
    <div className="space-y-16 font-sans">
      {/* ── 1. DASHBOARD & VERIFICATION SECTION ────────────────────── */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#2E7D4F] bg-[#F0F7F1] px-3 py-1 rounded-full border border-[#D9EBDC]">
              {t('home.dashboard.badge')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1F24] mt-2">
              {t('home.dashboard.title')}
            </h2>
            <p className="text-sm text-[#5A646D]">
              {t('home.dashboard.subtitle')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT SIDE: DIAGRAMS & STATISTICS DASHBOARD (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Top 4 Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {stats.map((st, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-[#E4E7EA] p-5 rounded-2xl shadow-xs hover:shadow-md transition-shadow flex items-start justify-between"
                >
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-[#5A646D] uppercase tracking-wider block">
                      {st.label}
                    </span>
                    <div className="text-2xl font-bold text-[#1A1F24]">{st.value}</div>
                    <span className="text-xs text-[#15803D] font-medium flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" /> {st.change}
                    </span>
                  </div>
                  <div className="p-3 bg-[#F0F7F1] rounded-xl shrink-0">{st.icon}</div>
                </div>
              ))}
            </div>

            {/* Visual Diagram Chart Card */}
            <div className="bg-white border border-[#E4E7EA] rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#1A1F24]">{t('home.chart.title')}</h3>
                  <p className="text-xs text-[#5A646D]">{t('home.chart.subtitle')}</p>
                </div>
                <span className="text-xs font-semibold text-[#2E7D4F] bg-[#F0F7F1] px-2.5 py-1 rounded-lg border border-[#D9EBDC]">
                  {t('home.chart.season')}
                </span>
              </div>

              {/* Progress Diagram Bars */}
              <div className="space-y-4 pt-1">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-[#1A1F24] mb-1">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D4F]" />
                      {t('home.chart.grazingLabel')}
                    </span>
                    <span>{t('home.chart.grazingValue')}</span>
                  </div>
                  <div className="w-full bg-[#E4E7EA] h-3 rounded-full overflow-hidden">
                    <div className="bg-[#2E7D4F] h-full rounded-full transition-all duration-500" style={{ width: '68%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-[#1A1F24] mb-1">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#15803D]" />
                      {t('home.chart.haymakingLabel')}
                    </span>
                    <span>{t('home.chart.haymakingValue')}</span>
                  </div>
                  <div className="w-full bg-[#E4E7EA] h-3 rounded-full overflow-hidden">
                    <div className="bg-[#15803D] h-full rounded-full transition-all duration-500" style={{ width: '18%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-[#1A1F24] mb-1">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#7FB98A]" />
                      {t('home.chart.beekeepingLabel')}
                    </span>
                    <span>{t('home.chart.beekeepingValue')}</span>
                  </div>
                  <div className="w-full bg-[#E4E7EA] h-3 rounded-full overflow-hidden">
                    <div className="bg-[#7FB98A] h-full rounded-full transition-all duration-500" style={{ width: '10%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-[#1A1F24] mb-1">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#A8D5B1]" />
                      {t('home.chart.otherLabel')}
                    </span>
                    <span>{t('home.chart.otherValue')}</span>
                  </div>
                  <div className="w-full bg-[#E4E7EA] h-3 rounded-full overflow-hidden">
                    <div className="bg-[#A8D5B1] h-full rounded-full transition-all duration-500" style={{ width: '4%' }} />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E4E7EA] flex flex-wrap items-center justify-between text-xs text-[#5A646D] gap-2">
                <span>{t('home.chart.footnoteAuth')}</span>
                <span className="font-semibold text-[#2E7D4F] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D]" /> {t('home.chart.footnoteLive')}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: RUXSATNOMANI TEKSHIRISH CARD (lg:col-span-5) */}
          <div className="lg:col-span-5">
            <form
              onSubmit={handleQuickSearch}
              className="bg-white text-[#1A1F24] p-7 rounded-2xl shadow-lg border border-[#E4E7EA] space-y-5 sticky top-24"
            >
              <div className="flex items-center gap-3.5 pb-2 border-b border-[#E4E7EA]">
                <div className="w-12 h-12 rounded-xl bg-[#F0F7F1] text-[#2E7D4F] flex items-center justify-center font-bold shadow-inner shrink-0">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#1A1F24]">{t('home.verify.title')}</h3>
                  <p className="text-xs text-[#5A646D]">{t('home.verify.subtitle')}</p>
                </div>
              </div>

              <p className="text-xs text-[#5A646D] leading-relaxed">
                {t('home.verify.description')}
              </p>

              <div className="space-y-3">
                <Input
                  placeholder={t('home.verify.placeholder')}
                  value={quickSearchInput}
                  onChange={(e) => setQuickSearchInput(e.target.value)}
                  leftIcon={<Search className="w-4 h-4" />}
                  touchSize
                />
                <Button type="submit" variant="success" fullWidth size="lg" className="font-bold shadow-md bg-[#2E7D4F] hover:bg-[#23653F]">
                  {t('home.verify.submitButton')}
                </Button>
              </div>

              <div className="bg-[#F8F9FA] p-4 rounded-xl border border-[#E4E7EA] space-y-2 text-xs text-[#5A646D]">
                <div className="flex items-center gap-2 font-semibold text-[#1A1F24]">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                  {t('home.verify.instructionsTitle')}
                </div>
                <ul className="list-disc list-inside space-y-1 pl-1 text-[11px]">
                  <li>{t('home.verify.step1')}</li>
                  <li>{t('home.verify.step2')}</li>
                  <li>{t('home.verify.step3')}</li>
                </ul>
              </div>

              <p className="text-[11px] text-[#767F87] text-center pt-1">
                {t('home.verify.footnote')}
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* ── 3. ACTIVITIES GRID ─────────────────────────────────────── */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#2E7D4F]">{t('home.activities.sectionBadge')}</span>
            <h2 className="text-2xl font-bold text-[#1A1F24] mt-1">{t('home.activities.sectionTitle')}</h2>
            <p className="text-sm text-[#5A646D]">{t('home.activities.sectionSubtitle')}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            rightIcon={<ChevronRight className="w-4 h-4" />}
            onClick={() => onNavigate?.('activities')}
          >
            {t('home.activities.viewAllButton')}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((act) => (
            <div
              key={act.id}
              className="bg-white border border-[#E4E7EA] rounded-2xl p-6 shadow-xs hover:border-[#7FB98A] hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 bg-[#F0F7F1] rounded-xl">{act.icon}</div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#F0F7F1] text-[#2E7D4F] border border-[#D9EBDC]">
                    {act.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#1A1F24] group-hover:text-[#2E7D4F] transition-colors">
                  {act.title}
                </h3>
                <p className="text-xs text-[#5A646D] leading-relaxed">
                  {act.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-[#E4E7EA] flex items-center justify-between text-xs">
                <span className="text-[#767F87]">{t('home.activities.quotaLabel')} <b className="text-[#1A1F24]">{act.limit}</b></span>
                <button
                  onClick={() => onNavigate?.('auth_login', { activity: act.id })}
                  className="font-bold text-[#2E7D4F] group-hover:underline inline-flex items-center gap-1"
                >
                  {t('home.activities.applyLink')} <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. HOW IT WORKS TIMELINE ───────────────────────────────── */}
      <section className="bg-white border border-[#E4E7EA] rounded-2xl p-8 shadow-xs space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#2E7D4F]">{t('home.steps.sectionBadge')}</span>
          <h2 className="text-2xl font-bold text-[#1A1F24]">{t('home.steps.sectionTitle')}</h2>
          <p className="text-sm text-[#5A646D]">{t('home.steps.sectionSubtitle')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {[
            { step: '01', title: t('home.steps.01.title'), desc: t('home.steps.01.desc') },
            { step: '02', title: t('home.steps.02.title'), desc: t('home.steps.02.desc') },
            { step: '03', title: t('home.steps.03.title'), desc: t('home.steps.03.desc') },
            { step: '04', title: t('home.steps.04.title'), desc: t('home.steps.04.desc') },
          ].map((st, idx) => (
            <div key={idx} className="relative space-y-3 p-4 bg-[#F8F9FA] border border-[#E4E7EA] rounded-xl">
              <span className="text-2xl font-black font-mono text-[#2E7D4F]">{st.step}</span>
              <h3 className="text-base font-bold text-[#1A1F24]">{st.title}</h3>
              <p className="text-xs text-[#5A646D] leading-relaxed">{st.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. NEWS & ANNOUNCEMENTS ───────────────────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white border border-[#E4E7EA] rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-[#E4E7EA] pb-4">
            <h3 className="text-lg font-bold text-[#1A1F24]">{t('home.news.sectionTitle')}</h3>
            <a href="#" className="text-xs font-bold text-[#2E7D4F] hover:underline flex items-center gap-1">
              {t('home.news.viewAllLink')} <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="space-y-4 divide-y divide-[#E4E7EA]">
            {newsList.map((item, idx) => (
              <div key={idx} className="pt-4 first:pt-0 space-y-1">
                <span className="text-[11px] font-mono text-[#767F87]">{item.date}</span>
                <h4 className="text-base font-bold text-[#1A1F24] hover:text-[#2E7D4F] cursor-pointer transition-colors">
                  {item.title}
                </h4>
                <p className="text-xs text-[#5A646D] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Support & Contact Widget */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#123522] text-white rounded-2xl p-6 shadow-md space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-[#2E7D4F] rounded-xl">
                <PhoneCall className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-base">{t('home.contact.title')}</h4>
                <p className="text-xs text-gray-300">{t('home.contact.subtitle')}</p>
              </div>
            </div>

            <div className="text-2xl font-bold font-mono text-[#7FB98A]">+998 (71) 207-88-77</div>

            <p className="text-xs text-gray-300 leading-relaxed">
              {t('home.contact.description')}
            </p>

            <Button
              variant="outline"
              fullWidth
              className="border-white/30 text-white hover:bg-white/10"
              onClick={() => onNavigate?.('feedback')}
            >
              {t('home.contact.button')}
            </Button>
          </div>
        </div>
      </section>

      {/* ── 6. PORTALNI BAHOLASH (PREMIUM RATING SECTION) ────────── */}
      <section className="bg-gradient-to-br from-white via-[#FBFDFB] to-[#F0F7F1] border border-[#E4E7EA] rounded-3xl p-8 sm:p-10 shadow-lg space-y-6">
        {ratingSubmitted ? (
          <div className="py-8 px-6 bg-white border border-[#D9EBDC] rounded-2xl text-center space-y-3 shadow-md max-w-2xl mx-auto">
            <div className="w-14 h-14 bg-[#F0F7F1] text-[#2E7D4F] rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8 text-[#15803D]" />
            </div>
            <h3 className="text-xl font-bold text-[#1A1F24]">{t('home.rating.thankYouTitle')}</h3>
            <p className="text-sm text-[#5A646D] max-w-md mx-auto">
              {t('home.rating.thankYouDesc')}
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F0F7F1] text-[#2E7D4F] text-xs font-bold rounded-full border border-[#D9EBDC]">
                <Star className="w-3.5 h-3.5 fill-[#2E7D4F]" /> {t('home.rating.resultLabel')} {selectedRating} {t('home.rating.resultUnit')}
              </span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleRatingSubmit} className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E4E7EA] pb-5">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F0F7F1] text-[#2E7D4F] text-xs font-bold uppercase tracking-wider rounded-full border border-[#D9EBDC] mb-2">
                  <Star className="w-3.5 h-3.5 fill-[#2E7D4F]" /> {t('home.rating.badge')}
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#1A1F24]">
                  {t('home.rating.formTitle')}
                </h3>
                <p className="text-xs sm:text-sm text-[#5A646D] mt-0.5">
                  {t('home.rating.formSubtitle')}
                </p>
              </div>
            </div>

            {/* Interactive Rating Options Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { value: '5', title: t('home.rating.options.5.title'), desc: t('home.rating.options.5.desc'), stars: 5 },
                { value: '4', title: t('home.rating.options.4.title'), desc: t('home.rating.options.4.desc'), stars: 4 },
                { value: '3', title: t('home.rating.options.3.title'), desc: t('home.rating.options.3.desc'), stars: 3 },
                { value: '2', title: t('home.rating.options.2.title'), desc: t('home.rating.options.2.desc'), stars: 2 },
              ].map((item) => {
                const isSelected = selectedRating === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setSelectedRating(item.value)}
                    className={`text-left p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-3 cursor-pointer group ${
                      isSelected
                        ? 'bg-white border-[#2E7D4F] ring-2 ring-[#2E7D4F]/20 shadow-md transform -translate-y-1'
                        : 'bg-white/80 border-[#E4E7EA] hover:border-[#7FB98A] hover:bg-white shadow-xs'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-[#EAB308]">
                          {Array.from({ length: item.stars }).map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-[#EAB308]" />
                          ))}
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                          isSelected ? 'border-[#2E7D4F] bg-[#2E7D4F] text-white' : 'border-gray-300 group-hover:border-[#7FB98A]'
                        }`}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </div>
                      <h4 className={`text-base font-bold transition-colors ${isSelected ? 'text-[#2E7D4F]' : 'text-[#1A1F24]'}`}>
                        {item.title}
                      </h4>
                      <p className="text-xs text-[#5A646D] leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                type="submit"
                variant="success"
                size="lg"
                disabled={!selectedRating}
                rightIcon={<Send className="w-4 h-4" />}
                className="bg-[#2E7D4F] hover:bg-[#23653F] text-white font-bold px-8 py-3.5 rounded-xl shadow-md transition-transform active:scale-95 disabled:opacity-50"
              >
                {t('home.rating.submitButton')}
              </Button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
};
