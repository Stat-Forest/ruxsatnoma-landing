/** The anonymous appeal-status check page (`/appeal-check`) — reuses
 * `/check`'s layout and error handling, served by the anonymous,
 * rate-limited `GET /api/v1/public/appeals/check`. */
export const appeal = {
  'appeal.header.badge': 'Проверка статуса обращения',
  'appeal.header.title': 'Проверьте статус вашего обращения',
  'appeal.header.subtitle':
    'Введите номер обращения и телефон или электронную почту — статус будет показан здесь.',

  'appeal.form.numberLabel': 'Номер обращения',
  'appeal.form.numberPlaceholder': 'Например: MR-2026-000123',
  'appeal.form.phoneLabel': 'Телефон',
  'appeal.form.emailLabel': 'Электронная почта',
  'appeal.form.contactRequired':
    'Укажите номер и хотя бы одно из полей — телефон или электронную почту.',
  'appeal.form.submit': 'Проверить',

  'appeal.privacy.bold': 'Конфиденциальность:',
  'appeal.privacy.after':
    'Телефон или электронная почта используются только для подтверждения того, что обращение действительно ваше, и нигде не сохраняются.',

  'appeal.status.loading': 'Идёт проверка…',
  'appeal.status.errorTitle': 'Служба временно недоступна',
  'appeal.status.networkError':
    'Не удалось подключиться к службе проверки. Проверьте подключение к интернету и повторите попытку.',
  'appeal.status.missTitle': 'Обращение не найдено',
  'appeal.status.missMessage':
    'По указанным данным обращение не найдено. Проверьте номер и контактные данные.',
  'appeal.status.new': 'Принято',
  'appeal.status.inProgress': 'На рассмотрении',
  'appeal.status.answered': 'Дан ответ',
  'appeal.status.closed': 'Закрыто',

  'appeal.error.rateLimited.before': 'Превышен лимит запросов. Повторите попытку через',
  'appeal.error.rateLimited.after': 'сек.',

  'appeal.result.numberLabel': 'Номер обращения',
  'appeal.result.subjectLabel': 'Тема',
  'appeal.result.answerHeading': 'Ответ',
  'appeal.result.answeredAtLabel': 'Дата ответа:',
  'appeal.result.noAnswerYet': 'Ваше обращение пока рассматривается, ответ ещё не дан.',
} as const;
