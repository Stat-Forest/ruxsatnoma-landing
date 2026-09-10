/** Shared low-level UI components (`src/components/ui/*`) — English copy. */
export const ui = {
  'ui.table.emptyTitle': 'No data found',
  'ui.table.emptyDescription': 'There are no records to display in the table at this time',
  'ui.table.actions': 'Actions',
  'ui.table.loading': 'Loading...',

  'ui.alert.close': 'Close',

  'ui.pagination.totalBefore': 'Total of',
  'ui.pagination.totalAfter': 'records',
  'ui.pagination.pageSizeLabel': 'Rows:',
  'ui.pagination.prev': 'Previous',
  'ui.pagination.next': 'Next',

  'ui.breadcrumbs.ariaLabel': 'Breadcrumbs',
  'ui.tabs.ariaLabel': 'Sections',

  'ui.modal.close': 'Close',

  'ui.statusBadge.draft': 'Draft',
  'ui.statusBadge.pending': 'Pending',
  'ui.statusBadge.approved': 'Approved',
  'ui.statusBadge.rejected': 'Rejected',
  'ui.statusBadge.warning': 'Expiring soon',
  'ui.statusBadge.info': 'Information',

  /* `ERR-SYS-006`. Shared by every `/public/*` page through
     `formatApiError` (`src/api/errors.ts`) — each page used to carry its
     own copy of that helper, and they had already drifted apart. */
  'ui.error.rateLimited.before': 'The request limit has been reached. Please try again in',
  'ui.error.rateLimited.after': 'seconds.',
} as const;
