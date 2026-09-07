/** TariffsPage — English copy. */
export const tariffs = {
  'tariffs.error.connectionFailed': 'Could not connect to the data service.',
  'tariffs.error.title': 'Calculator is temporarily unavailable',
  'tariffs.error.loadFailedPrefix': 'Failed to load activity types list:',

  'tariffs.header.badge': 'Official Rates & Tariffs',
  'tariffs.header.title': 'Payment Rates & Calculator',
  'tariffs.header.subtitle':
    'Forest fund land use coefficients established pursuant to Cabinet of Ministers resolutions.',

  'tariffs.calculator.heading': 'Online Price Calculator',
  'tariffs.calculator.description':
    'Enter activity type, quantity, and duration — the estimated total is calculated directly in the system',
  'tariffs.calculator.activityLabel': 'Activity type',
  'tariffs.calculator.quantityLabel': 'Quantity',
  'tariffs.calculator.durationLabel': 'Usage duration (Months)',
  'tariffs.calculator.duration.months3': '3 months (Seasonal)',
  'tariffs.calculator.duration.months6': '6 months (Semi-annual)',
  'tariffs.calculator.duration.months12': '12 months (Annual)',
  'tariffs.calculator.privilegeNote':
    'Discount / Concession (not factored into anonymous estimate — applied during application filling)',
  'tariffs.calculator.idle.grazing': 'Please enter the number of livestock for at least one category to calculate.',
  'tariffs.calculator.idle.default': 'Please enter quantity to calculate.',
  'tariffs.calculator.loading': 'Calculating…',
  'tariffs.calculator.resultLabel': 'Estimated total:',
  'tariffs.calculator.submitCta': 'Apply based on this estimate',
  'tariffs.calculator.estimateFailed': 'Could not connect to the calculation service.',
  'tariffs.calculator.disclaimer':
    'Approximate estimate only — not a binding bill. Because no specific parcel was selected, seasonal norms, fire bans, and benefits were not applied. The final amount is determined when submitting an application.',
} as const;
