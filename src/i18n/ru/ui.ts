/** Shared low-level UI components (`src/components/ui/*`) — table, alerts,
 *  navigation, overlays, status badges. */
export const ui = {
  'ui.table.emptyTitle': 'Данные не найдены',
  'ui.table.emptyDescription': 'Пока нет записей для отображения в таблице',
  'ui.table.actions': 'Действия',
  'ui.table.loading': 'Загрузка...',

  'ui.alert.close': 'Закрыть',

  'ui.pagination.totalBefore': 'Всего',
  'ui.pagination.totalAfter': 'записей',
  'ui.pagination.pageSizeLabel': 'Строк:',
  'ui.pagination.prev': 'Предыдущая',
  'ui.pagination.next': 'Следующая',

  'ui.breadcrumbs.ariaLabel': 'Путь по разделам',
  'ui.tabs.ariaLabel': 'Вкладки',

  'ui.modal.close': 'Закрыть',

  'ui.statusBadge.draft': 'Черновик',
  'ui.statusBadge.pending': 'В обработке',
  'ui.statusBadge.approved': 'Одобрено',
  'ui.statusBadge.rejected': 'Отклонено',
  'ui.statusBadge.warning': 'Срок истекает',
  'ui.statusBadge.info': 'Информация',
} as const;
