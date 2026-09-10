/** FAQ fallback copy — rendered by `AboutPage`'s accordion only when
 *  `GET /help/faq` returns nothing.
 *
 *  Carries NO review period and NO renewal window: "3 working days" and
 *  "10 days before expiry" were invented figures (the same class of defect
 *  `api/services.ts` records for the service cards' own "up to 3 working
 *  days"). The real review term is per-activity `processing_days`, and no
 *  renewal window has been fixed at all.
 */
export const faq = {
  'faq.badge': 'Вопросы и ответы',
  'faq.title': 'Часто задаваемые вопросы (FAQ)',
  'faq.subtitle':
    'Ответы на самые частые вопросы о получении разрешения, оплате и проверке QR-кода.',
  'faq.search.placeholder': 'Поиск вопроса...',

  'faq.item1.question': 'Как получить разрешение на выпас скота на землях лесного хозяйства?',
  'faq.item1.answer':
    'Для подачи заявки вы входите на портал через OneID или E-IMZO, выбираете контур лесного хозяйства и количество скота, после чего отправляете заявку.',

  'faq.item2.question': 'Как рассчитывается сумма платежа?',
  'faq.item2.answer':
    'Сумма платежа рассчитывается автоматически по формулам, исходя из коэффициента вида скота, поголовья, количества месяцев пользования, а также действующего размера БРВ (Базовой расчётной величины).',

  'faq.item3.question': 'Как проверить подлинность разрешения?',
  'faq.item3.answer':
    'В разделе "Проверка разрешения" на главной странице портала вы можете быстро проверить подлинность, введя серию и номер разрешения либо отсканировав QR-код на PDF-документе.',

  'faq.item4.question': 'Можно ли продлить разрешение по истечении срока действия?',
  'faq.item4.answer':
    'Да, до истечения срока действия разрешения вы можете подать заявку на его онлайн-продление через личный кабинет.',
} as const;
