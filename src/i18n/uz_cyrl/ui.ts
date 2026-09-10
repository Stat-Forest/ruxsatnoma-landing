/** Shared low-level UI components (`src/components/ui/*`) — Cyrillic Uzbek. */
export const ui = {
  'ui.table.emptyTitle': 'Маълумот топилмади',
  'ui.table.emptyDescription': 'Ҳозирча жадвалда кўрсатиш учун ҳеч қандай ёзув йўқ',
  'ui.table.actions': 'Ҳаракатлар',
  'ui.table.loading': 'Юкланмоқда...',

  'ui.alert.close': 'Ёпиш',

  'ui.pagination.totalBefore': 'Жами',
  'ui.pagination.totalAfter': 'та ёзув',
  'ui.pagination.pageSizeLabel': 'Қаторлар:',
  'ui.pagination.prev': 'Олдинги',
  'ui.pagination.next': 'Кейинги',

  'ui.breadcrumbs.ariaLabel': 'Саҳифалар йўли',
  'ui.tabs.ariaLabel': 'Бўлимлар',

  'ui.modal.close': 'Ёпиш',

  'ui.statusBadge.draft': 'Қоралама',
  'ui.statusBadge.pending': 'Кутилмоқда',
  'ui.statusBadge.approved': 'Тасдиқланди',
  'ui.statusBadge.rejected': 'Рад этилди',
  'ui.statusBadge.warning': 'Муддати тугамоқда',
  'ui.statusBadge.info': 'Маълумот',

  /* `ERR-SYS-006`. Shared by every `/public/*` page through
     `formatApiError` (`src/api/errors.ts`) — each page used to carry its
     own copy of that helper, and they had already drifted apart. */
  'ui.error.rateLimited.before': 'Сўровлар сони чегарасига етилди. Илтимос,',
  'ui.error.rateLimited.after': 'сониядан кейин қайта уриниб кўринг.',
} as const;
