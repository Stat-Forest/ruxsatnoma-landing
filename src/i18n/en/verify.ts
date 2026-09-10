/** The public permit-verification page (`/verify`) — English copy. */
export const verify = {
  'verify.header.badge': 'Official Verification Service',
  'verify.header.title': 'Verify Permit Authenticity',
  'verify.header.subtitle':
    'Enter permit series and number or scan with a QR code reader.',

  'verify.form.seriesLabel': 'Series',
  'verify.form.seriesPlaceholder': 'Example: A',
  'verify.form.numberLabel': 'Number',
  'verify.form.numberPlaceholder': 'Example: 000123',
  'verify.form.submit': 'Verify',

  'verify.qrInfo.before': 'When scanning the',
  'verify.qrInfo.bold': 'QR code',
  'verify.qrInfo.after':
    'on the paper permit using your phone camera, this page opens automatically and displays the result instantly.',

  'verify.pii.bold': 'Personal Data Protection (PII Masking):',
  'verify.pii.after':
    'In accordance with legislation, the applicant full name and personal data are shown in abbreviated form in public search.',

  'verify.status.loading': 'Verifying…',
  'verify.status.errorTitle': 'Service is temporarily unavailable',
  'verify.status.networkError':
    'Could not connect to the verification service. Please check your internet connection and try again.',
  'verify.status.missTitle': 'Permit Not Found',
  'verify.status.missMessage':
    'No active permit matching the provided details was found in the system. Please verify series and number.',

  'verify.result.registryNote': 'This permit was successfully verified against the state registry.',
  'verify.result.holderLabel': 'Applicant (Masked)',
  'verify.result.activityLabel': 'Activity Type',
  'verify.result.organizationLabel': 'Forestry Enterprise',
  'verify.result.validityLabel': 'Validity Period',
  'verify.result.signaturesValid': 'Digital signatures are valid (E-IMZO)',
  'verify.result.signaturesPending': 'Digital signatures are pending final confirmation',

  /* The map panel is mounted ONLY when `GET /public/permits/check` actually
     sent a `contour` — a legend may only name what is drawn. */
  'verify.map.title': 'Contour map',
  'verify.map.heading': 'On the map',
  'verify.map.legend': 'Permitted contour',
} as const;
