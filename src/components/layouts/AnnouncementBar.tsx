import { ArrowRight, Phone } from 'lucide-react';
import { useT } from '../../i18n/useT';

export interface AnnouncementBarProps {
  /** From `fetchSiteSettings()`'s `contacts.phone` — `null`/`undefined` while
   *  it has not loaded or the request failed. Rendered nowhere when absent
   *  (decision: never invent a number). */
  phone?: string | null;
  onNavigate?: (page: string) => void;
}

/**
 * The 38px strip above the main header row (`design-canvas/Main.dc.html`).
 * Its own copy is editorial, not fetched — no endpoint serves it yet — so it
 * comes from i18n; only the phone number is live data.
 *
 * The prototype's copy named a seasonal deadline ("1-oktabrgacha") and set a
 * pulsing `.live` dot beside it. The Agency has confirmed there is NO
 * seasonal date, so the line is now static and dateless, and the dot no
 * longer pulses: `.live` is the vocabulary for something actually updating,
 * and editorial copy is not. Never state a date this site cannot source.
 */
export function AnnouncementBar({ phone, onNavigate }: AnnouncementBarProps) {
  const t = useT();

  return (
    <div className="h-[38px] bg-[#0E2A16] border-b border-white/10 flex items-center text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full flex items-center justify-between gap-6">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-[7px] h-[7px] rounded-full bg-[#4ADE80] shrink-0" aria-hidden="true" />
          <span className="text-[12.5px] text-[#C4D8C9] truncate">{t('announcement.text')}</span>
          <button
            type="button"
            onClick={() => onNavigate?.('news')}
            className="hidden sm:inline-flex items-center gap-1.5 text-[12.5px] font-bold text-[#9CE3AE] hover:text-white transition-colors shrink-0"
          >
            {t('announcement.cta')}
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="hidden md:flex items-center gap-5 shrink-0">
          {phone && (
            <a
              href={`tel:${phone.replace(/[^\d+]/g, '')}`}
              className="inline-flex items-center gap-1.5 text-[12.5px] text-[#C4D8C9] hover:text-white transition-colors"
            >
              <Phone className="w-3 h-3 text-[#7FB98A]" />
              {phone}
            </a>
          )}
          <button
            type="button"
            onClick={() => onNavigate?.('appeal_check')}
            className="text-[12.5px] text-[#C4D8C9] hover:text-white transition-colors"
          >
            {t('announcement.appealStatus')}
          </button>
        </div>
      </div>
    </div>
  );
}
