import React from 'react';
import { ArrowRight, Clock, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/ui/button';
import type { SiteSettingsState } from '../../api/site';
import { pickLocalized } from '../../lib/localized';
import { useLanguage } from '../../i18n/useT';
import { AppealForm } from './AppealCheckPage';

export interface ContactPageProps {
  onNavigate?: (page: string, params?: Record<string, unknown>) => void;
  /** Fetched ONCE by `routes.tsx`'s `Layout` and handed down. This page used
   *  to call `fetchSiteSettings()` itself while `PublicLayout` above it did
   *  the same, so every visit to `/contact` made the request twice. */
  siteSettings?: SiteSettingsState;
}

/** Tailwind v4 scans source for literal class names — a template-built
 *  `sm:grid-cols-${n}` is invisible to that scan and would silently emit no
 *  rule, so the handful of possible column counts are spelled out here. */
const CARD_GRID_CLASS: Record<number, string> = {
  1: 'sm:grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
};

/**
 * Task 14 (contact half) — `/contact`. The filing form is the exact one
 * `/appeal-check` already ships (`AppealForm`, re-exported from
 * `AppealCheckPage.tsx`) rather than a second copy: same
 * `POST /api/v1/public/appeals` call, same required-contact validation,
 * same success/error rendering — reusing it is what keeps this page and
 * `/appeal-check` from drifting apart on that one form.
 *
 * Every contact detail comes from `fetchSiteSettings()` and is rendered only
 * when present. The design canvas fills the address card with a literal
 * `[MANZIL]` placeholder and the CTA row with `[MUDDAT]` (the response
 * deadline) — both are genuinely unknown today (no address, no committed
 * SLA), so this page renders neither card nor line rather than a
 * placeholder standing in for a real value.
 */
export const ContactPage: React.FC<ContactPageProps> = ({
  onNavigate,
  siteSettings = { status: 'loading' },
}) => {
  const { uiLanguage } = useLanguage();

  const contacts = siteSettings.status === 'ready' ? siteSettings.data.contacts : null;
  const loaded = siteSettings.status !== 'loading';
  const address = contacts ? pickLocalized(contacts.address, uiLanguage) : '';
  const hours = contacts ? pickLocalized(contacts.hours, uiLanguage) : '';

  const cards: { icon: React.ReactNode; label: string; value: string; note: string }[] = [];
  if (contacts?.phone) {
    cards.push({
      icon: <Phone className="w-5 h-5 text-[#2E7D4F]" />,
      label: 'Ishonch telefoni',
      value: contacts.phone,
      note: hours || '',
    });
  }
  if (contacts?.email) {
    cards.push({
      icon: <Mail className="w-5 h-5 text-[#2E7D4F]" />,
      label: 'Elektron pochta',
      value: contacts.email,
      note: 'Rasmiy xatlar uchun',
    });
  }
  if (address) {
    cards.push({
      icon: <MapPin className="w-5 h-5 text-[#2E7D4F]" />,
      label: 'Manzil',
      value: address,
      note: '',
    });
  }

  return (
    <div data-testid="contact-page" className="space-y-10">
      <section className="reveal space-y-3 max-w-2xl">
        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#23653F] bg-[#F0F7F1] px-3 py-1 rounded-full border border-[#D9EBDC]">
          Aloqa
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[#123522] leading-tight">
          Biz bilan bogʻlanish
        </h1>
        <p className="text-base text-[#5A646D] leading-relaxed">
          Tizimdan foydalanish, ariza holati yoki toʻlovlar boʻyicha savolingiz boʻlsa — ishonch
          telefoniga qoʻngʻiroq qiling yoki quyidagi shakl orqali rasmiy murojaat yuboring.
        </p>
      </section>

      {loaded && cards.length > 0 && (
        <section className={`grid grid-cols-1 gap-5 ${CARD_GRID_CLASS[Math.min(cards.length, 3)]}`}>
          {cards.map((card) => (
            <div key={card.label} className="card-lift border border-[#E4E7EA] rounded-2xl p-6">
              <div className="w-12 h-12 rounded-xl bg-[#F0F7F1] flex items-center justify-center">
                {card.icon}
              </div>
              <div className="mt-4 text-xs font-extrabold uppercase tracking-wider text-[#767F87]">
                {card.label}
              </div>
              <div className="mt-2 text-lg font-extrabold text-[#123522] break-words">{card.value}</div>
              {card.note && <div className="mt-1.5 text-sm text-[#5A646D]">{card.note}</div>}
            </div>
          ))}
        </section>
      )}

      <section className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-6 items-start">
        <AppealForm />

        <div className="flex flex-col gap-6">
          <div className="border border-[#E4E7EA] rounded-2xl p-7">
            <h3 className="text-lg font-bold text-[#123522]">Murojaat holatini tekshirish</h3>
            <p className="mt-2 text-sm text-[#5A646D] leading-relaxed">
              Murojaat raqami va telefon raqamingiz orqali javob holatini bilib oling.
            </p>
            <Button
              variant="outline"
              size="md"
              fullWidth
              className="mt-4"
              onClick={() => onNavigate?.('appeal_check')}
            >
              Tekshirish <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="border border-[#D9EBDC] rounded-2xl p-7 bg-[#F0F7F1]">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#23653F]" />
              <span className="text-base font-extrabold text-[#123522]">
                Hududiy oʻrmon xoʻjaliklari
              </span>
            </div>
            <p className="mt-2.5 text-sm text-[#3F4A52] leading-relaxed">
              Kontur, maydon va joyida tekshiruv boʻyicha savollar bilan oʻz hududingizdagi oʻrmon
              xoʻjaligiga murojaat qiling — ularning roʻyxati va kontaktlari hujjatlar boʻlimida.
            </p>
            <button
              type="button"
              onClick={() => onNavigate?.('documents')}
              className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-[#23653F] hover:text-[#2E7D4F]"
            >
              Hujjatlar boʻlimi <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {(contacts?.social.telegram || contacts?.social.youtube) && (
            <div className="border border-[#E4E7EA] rounded-2xl p-7">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#767F87]">
                <Clock className="w-3.5 h-3.5" /> Ijtimoiy tarmoqlar
              </div>
              <div className="mt-3 flex flex-col gap-2 text-sm">
                {contacts.social.telegram && (
                  <a
                    href={contacts.social.telegram}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-[#23653F] hover:text-[#2E7D4F]"
                  >
                    Telegram
                  </a>
                )}
                {contacts.social.youtube && (
                  <a
                    href={contacts.social.youtube}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-[#23653F] hover:text-[#2E7D4F]"
                  >
                    YouTube
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
