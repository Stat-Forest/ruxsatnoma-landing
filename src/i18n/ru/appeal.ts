/** The anonymous appeal-status check page (`/appeal-check`) — reuses
 * `/check`'s layout and error handling, served by the anonymous,
 * rate-limited `GET /api/v1/public/appeals/check`. */
export const appeal = {
  'appeal.file.title': 'Подать обращение',
  'appeal.file.subtitle': 'Обращение будет зарегистрировано, и вы получите номер — по нему потом смотрите статус.',
  'appeal.file.nameLabel': 'Ф.И.О.',
  'appeal.file.phoneLabel': 'Телефон',
  'appeal.file.emailLabel': 'Электронная почта',
  'appeal.file.subjectLabel': 'Тема',
  'appeal.file.bodyLabel': 'Текст обращения',
  'appeal.file.submit': 'Отправить',
  'appeal.file.contactRequired': 'Укажите телефон или электронную почту — по ним вы потом проверите статус.',
  'appeal.file.sentTitle': 'Обращение принято',
  'appeal.file.sentBefore': 'Регистрационный номер —',
  'appeal.file.sentAfter': 'Сохраните его: для проверки статуса понадобятся этот номер и указанные вами контактные данные.',
  'appeal.file.errorTitle': 'Обращение не отправлено',
  'appeal.check.title': 'Проверить статус обращения',
  'appeal.check.subtitle': 'По регистрационному номеру и контактным данным, указанным при подаче.',
  'appeal.header.badge': 'Обращения граждан',
  'appeal.header.title': 'Подайте обращение или проверьте его статус',
  'appeal.header.subtitle':
    'Обращение подаётся здесь же, вы получаете регистрационный номер, а затем по нему и своим контактным данным проверяете статус.',

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

  'appeal.result.numberLabel': 'Номер обращения',
  'appeal.result.subjectLabel': 'Тема',
  'appeal.result.answerHeading': 'Ответ',
  'appeal.result.answeredAtLabel': 'Дата ответа:',
  'appeal.result.noAnswerYet': 'Ваше обращение пока рассматривается, ответ ещё не дан.',
} as const;
