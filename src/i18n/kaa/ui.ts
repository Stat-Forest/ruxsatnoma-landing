/** Shared low-level UI components (`src/components/ui/*`) — Karakalpak copy. */
export const ui = {
  'ui.table.emptyTitle': 'Maǵlıwmat tabılmadı',
  'ui.table.emptyDescription': 'Házirshe kestede kórsetiw ushın hesh qanday jazıw joq',
  'ui.table.actions': 'Háreketler',
  'ui.table.loading': 'Júklenbekte...',

  'ui.alert.close': 'Jabıw',

  'ui.pagination.totalBefore': 'Jámi',
  'ui.pagination.totalAfter': 'jazıw',
  'ui.pagination.pageSizeLabel': 'Qatarlar:',
  'ui.pagination.prev': 'Aldınǵı',
  'ui.pagination.next': 'Keyingi',

  'ui.breadcrumbs.ariaLabel': 'Betler jolı',
  'ui.tabs.ariaLabel': 'Bólimler',

  'ui.modal.close': 'Jabıw',

  'ui.statusBadge.draft': 'Dóretpe',
  'ui.statusBadge.pending': 'Kútilmekte',
  'ui.statusBadge.approved': 'Tastıyıqlandı',
  'ui.statusBadge.rejected': 'Biykar etildi',
  'ui.statusBadge.warning': 'Múddeti pitpekte',
  'ui.statusBadge.info': 'Maǵlıwmat',

  /* `ERR-SYS-006`. Shared by every `/public/*` page through
     `formatApiError` (`src/api/errors.ts`) — each page used to carry its
     own copy of that helper, and they had already drifted apart. */
  'ui.error.rateLimited.before': 'Sorawlar sanı shegarasına jetildi. Iltimas,',
  'ui.error.rateLimited.after': 'sekundtan keyin qayta urınıp kóriń.',
} as const;
