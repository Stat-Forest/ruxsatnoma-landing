/** Shared low-level UI components (`src/components/ui/*`) — table, alerts,
 *  navigation, overlays, status badges. */
export const ui = {
  'ui.table.emptyTitle': 'Maʼlumot topilmadi',
  'ui.table.emptyDescription': 'Hozircha jadvalda koʻrsatish uchun hech qanday yozuv yoʻq',
  'ui.table.actions': 'Harakatlar',
  'ui.table.loading': 'Yuklanmoqda...',

  'ui.alert.close': 'Yopish',

  'ui.pagination.totalBefore': 'Jami',
  'ui.pagination.totalAfter': 'ta yozuv',
  'ui.pagination.pageSizeLabel': 'Qatolar:',
  'ui.pagination.prev': 'Oldingi',
  'ui.pagination.next': 'Keyingi',

  'ui.breadcrumbs.ariaLabel': 'Sahifalar yoʻli',
  'ui.tabs.ariaLabel': 'Boʻlimlar',

  'ui.modal.close': 'Yopish',

  'ui.statusBadge.draft': 'Qoralama',
  'ui.statusBadge.pending': 'Kutilmoqda',
  'ui.statusBadge.approved': 'Tasdiqlandi',
  'ui.statusBadge.rejected': 'Rad etildi',
  'ui.statusBadge.warning': 'Muddati tugamoqda',
  'ui.statusBadge.info': 'Maʼlumot',

  /* `ERR-SYS-006`. Shared by every `/public/*` page through
     `formatApiError` (`src/api/errors.ts`) — each page used to carry its
     own copy of that helper, and they had already drifted apart. */
  'ui.error.rateLimited.before': 'Soʻrovlar soni chegarasiga yetildi. Iltimos,',
  'ui.error.rateLimited.after': 'soniyadan keyin qayta urinib koʻring.',
} as const;
