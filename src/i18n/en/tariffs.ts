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

  /* `PriceCalculator`'s own copy, which lived in the component as local
     constants in Uzbek Latin only. The default quantity field keeps using
     `tariffs.calculator.quantityLabel` above. */
  'tariffs.calculator.badge': 'Online calculator',
  'tariffs.calculator.bullet.norms': 'Based on the norms of Cabinet Resolution 689',
  'tariffs.calculator.bullet.anonymous': 'Usable without signing in',
  'tariffs.calculator.bullet.finalSum':
    'The final sum is confirmed once the application is reviewed',
  'tariffs.calculator.field.haymaking': 'Mowing area (ha)',
  'tariffs.calculator.field.apiary': 'Number of hives',
  'tariffs.calculator.field.recreation': 'Area (ha)',
  'tariffs.calculator.field.deadwood': 'Volume (m³)',
  'tariffs.calculator.headCountSuffix': 'head count',
  'tariffs.calculator.science.sumLabel': 'Exempt',
  'tariffs.calculator.science.sumUnit': 'per application',
  'tariffs.calculator.science.note':
    'No fee is set for scientific research — each application is considered separately.',
  'tariffs.calculator.tariffNotPublished':
    'The rate for this type of activity has not been published yet (annex 5 to Cabinet Resolution No. 689 is awaited). The sum cannot be shown for now.',
} as const;
