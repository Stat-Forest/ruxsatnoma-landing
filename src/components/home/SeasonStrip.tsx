import { AlertCircle } from 'lucide-react';
import { useLanguage } from '../../i18n/useT';
import type { UiLanguage } from '../../i18n/context';
import { pickName } from '../../lib/localized';

export interface SeasonStripProps {
  /** Activity code → the month numbers (1-12) its season is open in. Comes
   *  straight from `GET /public/site-settings`'s `season_windows` field
   *  (Task 2, ruling R3) — the page owns the fetch, this component stays
   *  testable with fixed months. */
  windows: Record<string, number[]>;
}

const ROWS: { code: string; color: string }[] = [
  { code: 'grazing', color: '#2E7D4F' },
  { code: 'haymaking', color: '#B99F63' },
  { code: 'apiary', color: '#C99A3E' },
  { code: 'recreation', color: '#6F9FAE' },
  { code: 'deadwood', color: '#9C907A' },
  { code: 'science', color: '#8494BA' },
];

/** No existing i18n key covers a season calendar — this track cannot touch
 *  `src/i18n/*`, so the strip's own copy (including the R3-mandated
 *  provisional banner) is translated locally into all five portal
 *  languages. */
const TEXT: Record<
  UiLanguage,
  {
    badge: string;
    title: string;
    subtitle: string;
    currentMonthLabel: string;
    noteBold: string;
    noteRest: string;
    open: string;
    closed: string;
    unknown: string;
  }
> = {
  uz_latn: {
    badge: 'Mavsumlar jadvali',
    title: 'Hozir qaysi yoʻnalish ochiq?',
    subtitle:
      'Har bir foydalanish turi oʻz mavsumiga ega. Jadvalda joriy oy ajratib koʻrsatilgan — ariza topshirish vaqtini shu boʻyicha rejalashtiring.',
    currentMonthLabel: 'Joriy oy',
    noteBold: 'Namunaviy jadval.',
    noteRest:
      'Mavsum oylari Agentlik tomonidan tasdiqlanadi va hududga qarab farq qilishi mumkin — yakuniy sanalar tasdiqlangach shu yerda koʻrsatiladi.',
    open: 'Ochiq',
    closed: 'Yopiq',
    unknown: 'Nomaʼlum',
  },
  ru: {
    badge: 'Календарь сезонов',
    title: 'Какое направление открыто сейчас?',
    subtitle:
      'У каждого вида пользования свой сезон. Текущий месяц выделен в таблице — планируйте подачу заявки с учётом этого.',
    currentMonthLabel: 'Текущий месяц',
    noteBold: 'Примерный график.',
    noteRest:
      'Месяцы сезонов утверждаются Агентством и могут отличаться по регионам — окончательные даты появятся здесь после утверждения.',
    open: 'Открыто',
    closed: 'Закрыто',
    unknown: 'Неизвестно',
  },
  en: {
    badge: 'Season calendar',
    title: 'Which direction is open right now?',
    subtitle:
      'Each type of use has its own season. The current month is highlighted in the table — plan your application around it.',
    currentMonthLabel: 'Current month',
    noteBold: 'Sample schedule.',
    noteRest:
      'Season months are confirmed by the Agency and may differ by region — the final dates will appear here once approved.',
    open: 'Open',
    closed: 'Closed',
    unknown: 'Unknown',
  },
  uz_cyrl: {
    badge: 'Мавсумлар жадвали',
    title: 'Ҳозир қайси йўналиш очиқ?',
    subtitle:
      'Ҳар бир фойдаланиш тури ўз мавсумига эга. Жадвалда жорий ой ажратиб кўрсатилган — ариза топшириш вақтини шу бўйича режалаштиринг.',
    currentMonthLabel: 'Жорий ой',
    noteBold: 'Намунавий жадвал.',
    noteRest:
      'Мавсум ойлари Агентлик томонидан тасдиқланади ва ҳудудга қараб фарқ қилиши мумкин — якуний саналар тасдиқлангач шу ерда кўрсатилади.',
    open: 'Очиқ',
    closed: 'Ёпиқ',
    unknown: 'Номаълум',
  },
  kaa: {
    badge: 'Máwsim kestesi',
    title: 'Házir qaysı baǵdar ashıq?',
    subtitle:
      'Hár bir paydalanıw túrniń óz máwsimi bar. Kestede ámeldegi ay ajıratıp kórsetilgen — árizanı sol boyınsha jobalań.',
    currentMonthLabel: 'Ámeldegi ay',
    noteBold: 'Úlgi keste.',
    noteRest:
      'Máwsim aylar Agentlik tárepinen tastıyıqlanadı hám aymaqqa qaray parıq etiwi múmkin — juwmaqlawshı sánreler tastıyıqlanǵannan keyin usı jerde kórsetiledi.',
    open: 'Ashıq',
    closed: 'Jabıq',
    unknown: 'Belgisiz',
  },
};

const MONTHS: Record<UiLanguage, { short: string[]; full: string[] }> = {
  uz_latn: {
    short: ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avg', 'sen', 'okt', 'noy', 'dek'],
    full: [
      'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
      'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr',
    ],
  },
  ru: {
    short: ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
    full: [
      'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
    ],
  },
  en: {
    short: ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'],
    full: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ],
  },
  uz_cyrl: {
    short: ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
    full: [
      'Январ', 'Феврал', 'Март', 'Апрел', 'Май', 'Июн',
      'Июл', 'Август', 'Сентабр', 'Октабр', 'Ноябр', 'Декабр',
    ],
  },
  kaa: {
    short: ['qań', 'few', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avg', 'sen', 'okt', 'noy', 'dek'],
    full: [
      'Qańtar', 'Fewral', 'Mart', 'Aprel', 'May', 'Iyun',
      'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr',
    ],
  },
};

/**
 * The season calendar from the redesigned home page (Task 10, ruling R3):
 * six rows × twelve months, current month ringed, fed entirely by the
 * `windows` prop the page reads off `GET /public/site-settings`. Always
 * carries the provisional banner (`role="note"`) — the months are not
 * confirmed by the Agency and this strip may never present them as fact.
 *
 * Each of the six rows is in one of THREE states, and the third is the one
 * that matters: an activity `season_windows` does not mention at all is
 * UNKNOWN, not closed. It used to be closed — `windows[code] ?? []` turned a
 * missing key into twelve grey cells and a "Yopiq" badge, which tells a
 * citizen an activity is shut when nobody has said so. An empty array is
 * still closed; only an absent key is unknown.
 */
export function SeasonStrip({ windows }: SeasonStripProps) {
  const { uiLanguage } = useLanguage();
  const text = TEXT[uiLanguage];
  const months = MONTHS[uiLanguage];
  const currentMonth = new Date().getMonth() + 1;

  return (
    <div className="border border-[#E4E7EA] rounded-[20px] p-6 sm:p-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F0F7F1] border border-[#D9EBDC] text-xs font-bold uppercase tracking-wider text-[#23653F]">
            {text.badge}
          </span>
          <h2 className="mt-4 text-2xl sm:text-[34px] leading-tight font-black text-[#123522] tracking-tight">
            {text.title}
          </h2>
          <p className="mt-3 text-sm sm:text-[15.5px] leading-relaxed text-[#5A646D]">{text.subtitle}</p>
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs font-extrabold uppercase tracking-wider text-[#767F87]">
            {text.currentMonthLabel}
          </div>
          <div data-testid="season-current-month" className="mt-1.5 text-2xl sm:text-[28px] font-black text-[#123522]">
            {months.full[currentMonth - 1]}
          </div>
        </div>
      </div>

      <div className="mt-8 overflow-x-auto">
        <div className="min-w-[720px]">
          <div className="grid gap-3" style={{ gridTemplateColumns: '200px 1fr 92px' }}>
            <div />
            <div className="grid grid-cols-12 gap-1.5">
              {months.short.map((label, idx) => (
                <div
                  key={label}
                  className={`text-center text-[11px] uppercase tracking-wide ${
                    idx + 1 === currentMonth ? 'font-extrabold text-[#123522]' : 'font-semibold text-[#767F87]'
                  }`}
                >
                  {label}
                </div>
              ))}
            </div>
            <div />
          </div>

          <div className="mt-3 flex flex-col gap-2.5">
            {ROWS.map(({ code, color }) => {
              // THREE states, not two. `windows[code] ?? []` used to collapse
              // "the backend never described this activity" into "closed all
              // twelve months" — twelve grey cells and a "Yopiq" badge
              // telling a citizen an activity is shut when the truth is that
              // nobody knows. An absent key and an empty array are different
              // answers, and only the second one means closed.
              // `windows` itself is defended too: the day the backend moved
              // the seasons to their own route, this read got `undefined`
              // for the whole map and took the home page down with it.
              const openMonths = windows?.[code];
              const known = Array.isArray(openMonths);
              const isOpenNow = known && openMonths.includes(currentMonth);
              return (
                <div
                  key={code}
                  data-testid={`season-row-${code}`}
                  className="grid gap-3 items-center"
                  style={{ gridTemplateColumns: '200px 1fr 92px' }}
                >
                  <div className="text-sm font-bold text-[#1A1F24]">{pickName(undefined, uiLanguage, code)}</div>
                  <div className="grid grid-cols-12 gap-1.5">
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
                      const open = known && openMonths.includes(month);
                      const isCurrent = month === currentMonth;
                      return (
                        <div
                          key={month}
                          className="h-[26px] rounded-md"
                          style={{
                            // An unknown row is hatched, so it cannot be read
                            // at a glance as the flat grey of a closed one.
                            background: open
                              ? color
                              : known
                                ? '#F1F3F4'
                                : 'repeating-linear-gradient(45deg, #E9ECEE 0 3px, #F8F9FA 3px 6px)',
                            boxShadow: isCurrent ? '0 0 0 2px #123522' : undefined,
                          }}
                        />
                      );
                    })}
                  </div>
                  <div className="text-right">
                    {!known ? (
                      <span className="inline-flex px-2.5 py-1 rounded-full bg-white border border-dashed border-[#C9D0D6] text-xs font-bold text-[#767F87]">
                        {text.unknown}
                      </span>
                    ) : isOpenNow ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F0F7F1] border border-[#D9EBDC] text-xs font-bold text-[#23653F]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D4F]" />
                        {text.open}
                      </span>
                    ) : (
                      <span className="inline-flex px-2.5 py-1 rounded-full bg-[#F8F9FA] border border-[#E4E7EA] text-xs font-bold text-[#9AA3AB]">
                        {text.closed}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div role="note" className="mt-6 flex items-start gap-2.5 px-4 py-3.5 rounded-xl bg-[#FEF7ED] border border-[#F5DEB8]">
        <AlertCircle className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" />
        <span className="text-[13px] leading-relaxed text-[#3F4A52]">
          <span className="font-bold text-[#1A1F24]">{text.noteBold}</span> {text.noteRest}
        </span>
      </div>
    </div>
  );
}
