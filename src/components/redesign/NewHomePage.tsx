import React from 'react';
import {
  HeroPlaceholder,
  ServicesPlaceholder,
  StatsPlaceholder,
  FooterPlaceholder,
} from './placeholders';
import { WaveDivider } from './WaveDividers';
import { MapPin, ArrowRight, Layers } from 'lucide-react';

export interface NewHomePageProps {
  /**
   * Optional navigation handler matching the legacy portal callback signature
   */
  onNavigate?: (page: string, params?: any) => void;
  /**
   * Slot for optional announcement bar at the top
   */
  announcementSlot?: React.ReactNode;
  /**
   * Slot for optional glassmorphism navigation header
   */
  headerSlot?: React.ReactNode;
  /**
   * Slot for custom hero centerpiece animation (e.g. ParallaxForestAnim, GrowingTreeAnim, or DocumentMorphAnim)
   */
  heroVisualSlot?: React.ReactNode;
}

/**
 * NewHomePage: Skeletal React component outlining the complete structure of
 * the redesigned State Forestry Agency (O'rmon Xo'jaligi) Landing Page.
 *
 * Implements a unified nature-inspired visual system with a global soft
 * green-tinted background (#F4F9F6), organic wave dividers, modular section
 * containers, and designated slots for animations and interactive widgets.
 */
export const NewHomePage: React.FC<NewHomePageProps> = ({
  onNavigate,
  announcementSlot,
  headerSlot,
  heroVisualSlot,
}) => {
  return (
    <div
      className="min-h-screen flex flex-col font-sans text-[#1C2B24] bg-[#F4F9F6] selection:bg-[#2ECC71] selection:text-[#0F3D2E]"
      style={{ backgroundColor: '#F4F9F6' }}
    >
      {/* ── 0. Optional Announcement Strip Slot ───────────────────────── */}
      {announcementSlot && (
        <header role="banner" className="relative z-40">
          {announcementSlot}
        </header>
      )}

      {/* ── 0b. Optional Glassmorphism Navigation Header Slot ─────────── */}
      {headerSlot && (
        <div className="sticky top-0 z-30">
          {headerSlot}
        </div>
      )}

      {/* ── Main Content Landmark ─────────────────────────────────────── */}
      <main className="flex-1 flex flex-col">
        {/* ── 1. Hero Section ─────────────────────────────────────────── */}
        <section id="hero-section" aria-label="Bosh sahifa - Asosiy tanishtiruv">
          <HeroPlaceholder onNavigate={onNavigate} heroVisualSlot={heroVisualSlot} />
        </section>

        {/* ── Organic Wave Transition ─────────────────────────────────── */}
        <div className="-mt-1 relative z-10 overflow-hidden leading-none pointer-events-none">
          <WaveDivider
            variant="fluid"
            fromColor="#1C5341"
            toColor="#2ECC71"
            height={60}
            className="w-full"
          />
        </div>

        {/* ── 2. Services Section ─────────────────────────────────────── */}
        <section
          id="services-section"
          aria-label="Xizmatlar katalogi"
          className="relative py-8 md:py-12"
        >
          <ServicesPlaceholder onNavigate={onNavigate} />
        </section>

        {/* ── 3. Trust & Statistics Section ───────────────────────────── */}
        <section
          id="stats-section"
          aria-label="Ochiq maʼlumotlar va reyestr statistikasi"
          className="relative py-6 md:py-10"
        >
          <StatsPlaceholder />
        </section>

        {/* ── 4. Interactive GIS Map Section Preview ──────────────────── */}
        <section
          id="map-preview-section"
          aria-label="Oʻrmon fondi yerlari interaktiv xaritasi"
          className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full"
        >
          <div className="rounded-3xl overflow-hidden border border-[#D9EBDC] bg-gradient-to-br from-[#0F3D2E] to-[#174635] text-white shadow-xl grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-wider text-[#A7F3D0]">
                  <Layers className="w-3.5 h-3.5 text-[#2ECC71]" />
                  GIS Xarita qatlamlari
                </span>
                <h2 className="mt-4 text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
                  Oʻrmon fondi yerlari interaktiv xaritada
                </h2>
                <p className="mt-4 text-sm sm:text-base text-[#C8E6D2] leading-relaxed">
                  Oʻrmon xoʻjaliklari ochiq deb belgilagan GIS qatlamlari: kontur chegaralari,
                  yer maydonlari, muhofaza zonalari va oʻrmon xoʻjaliklari joylashuvini real vaqtda
                  kuzating.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => onNavigate?.('map')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#2ECC71] hover:bg-[#27ae60] text-[#0F3D2E] font-bold text-sm shadow-md transition-all hover:scale-[1.02]"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Xaritani toʻliq ekranda ochish</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-6 bg-[#0B2E22] relative min-h-[300px] flex items-center justify-center p-8 border-t lg:border-t-0 lg:border-l border-white/10">
              <div className="w-full h-full rounded-2xl border border-dashed border-[#2ECC71]/40 flex flex-col items-center justify-center text-center p-6 bg-white/5">
                <div className="w-12 h-12 rounded-full bg-[#2ECC71]/20 flex items-center justify-center mb-3">
                  <MapPin className="w-6 h-6 text-[#2ECC71] animate-bounce" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">GIS Kontur Xaritasi Maydoni</h3>
                <p className="text-xs text-[#A7F3D0] max-w-xs">
                  MapLibre GL asosidagi vektorli oʻrmon konturlari va hududlar vizualizatsiyasi
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Wave Separator before Footer ──────────────────────────────── */}
      <div className="overflow-hidden leading-none pointer-events-none">
        <WaveDivider
          variant="gentle"
          fromColor="#F4F9F6"
          toColor="#0F3D2E"
          position="top"
          height={48}
          className="w-full"
        />
      </div>

      {/* ── 5. Footer Section ─────────────────────────────────────────── */}
      <section id="footer-section" aria-label="Portal maʼlumotlari va aloqa">
        <FooterPlaceholder onNavigate={onNavigate} />
      </section>
    </div>
  );
};

export default NewHomePage;

// Re-export placeholders for easy modular consumption
export {
  HeroPlaceholder,
  ServicesPlaceholder,
  StatsPlaceholder,
  FooterPlaceholder,
};
