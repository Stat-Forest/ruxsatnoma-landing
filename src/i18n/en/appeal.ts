/** The anonymous appeal-status check page (`/appeal-check`) — English copy. */
export const appeal = {
  'appeal.file.title': 'Submit an Appeal',
  'appeal.file.subtitle': 'Your appeal will be registered and assigned a tracking number to monitor its status.',
  'appeal.file.nameLabel': 'Full Name',
  'appeal.file.phoneLabel': 'Phone',
  'appeal.file.emailLabel': 'Email',
  'appeal.file.subjectLabel': 'Subject',
  'appeal.file.bodyLabel': 'Appeal Text',
  'appeal.file.submit': 'Submit',
  'appeal.file.contactRequired': 'Please provide at least a phone number or email — you will need it to check the status later.',
  'appeal.file.sentTitle': 'Appeal Accepted',
  'appeal.file.sentBefore': 'Registration number —',
  'appeal.file.sentAfter': 'Save this number: you will need it along with your contact detail to check status.',
  'appeal.file.errorTitle': 'Appeal Not Submitted',
  'appeal.check.title': 'Check Appeal Status',
  'appeal.check.subtitle': 'Using your registration number and contact detail submitted with the appeal.',
  'appeal.header.badge': 'Citizen Appeals',
  'appeal.header.title': 'Submit an appeal or check its status',
  'appeal.header.subtitle':
    'Submit an appeal here to receive a registration number, then track progress using your number and contact details.',

  'appeal.form.numberLabel': 'Appeal Number',
  'appeal.form.numberPlaceholder': 'Example: MR-2026-000123',
  'appeal.form.phoneLabel': 'Phone',
  'appeal.form.emailLabel': 'Email',
  'appeal.form.contactRequired':
    'Enter registration number and provide at least a phone or email.',
  'appeal.form.submit': 'Check',

  'appeal.privacy.bold': 'Privacy Notice:',
  'appeal.privacy.after':
    'Phone or email is used solely to verify that the appeal belongs to you and is not stored elsewhere.',

  'appeal.status.loading': 'Checking…',
  'appeal.status.errorTitle': 'Service is temporarily unavailable',
  'appeal.status.networkError':
    'Could not connect to the verification service. Please check your internet connection and try again.',
  'appeal.status.missTitle': 'Appeal Not Found',
  'appeal.status.missMessage':
    'No appeal was found matching the provided details. Please verify your number and contact information.',
  'appeal.status.new': 'Registered',
  'appeal.status.inProgress': 'In Progress',
  'appeal.status.answered': 'Answered',
  'appeal.status.closed': 'Closed',

  'appeal.error.rateLimited.before': 'Request limit reached. Please try again in',
  'appeal.error.rateLimited.after': 'seconds.',

  'appeal.result.numberLabel': 'Appeal Number',
  'appeal.result.subjectLabel': 'Subject',
  'appeal.result.answerHeading': 'Response',
  'appeal.result.answeredAtLabel': 'Response Date:',
  'appeal.result.noAnswerYet': 'Your appeal is currently under review; no response has been issued yet.',
} as const;
