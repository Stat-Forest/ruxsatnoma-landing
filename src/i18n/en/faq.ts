/** FAQ fallback copy — rendered by `AboutPage`'s accordion only when
 *  `GET /help/faq` returns nothing.
 *
 *  Carries NO review period and NO renewal window: "3 working days" and
 *  "10 days before expiry" were invented figures (the same class of defect
 *  `api/services.ts` records for the service cards' own "up to 3 working
 *  days"). The real review term is per-activity `processing_days`, and no
 *  renewal window has been fixed at all.
 *  English copy.
 */
export const faq = {
  'faq.badge': 'Questions & Answers',
  'faq.title': 'Frequently Asked Questions (FAQ)',
  'faq.subtitle':
    'Answers to common questions about obtaining permits, making payments, and verifying QR codes.',
  'faq.search.placeholder': 'Search questions...',

  'faq.item1.question': 'How can I obtain a permit for livestock grazing on forestry land?',
  'faq.item1.answer':
    'Log in via OneID or E-IMZO, select the forestry enterprise contour and specify livestock count, then submit the application.',

  'faq.item2.question': 'How is the payment amount calculated?',
  'faq.item2.answer':
    'Payment is computed automatically based on the livestock type coefficient, head count, duration in months, and the current Base Calculation Amount (BCA).',

  'faq.item3.question': 'How can I verify the authenticity of a permit?',
  'faq.item3.answer':
    'Enter the permit series and number under "Verify Permit" on the homepage, or scan the QR code on the PDF document with your smartphone camera.',

  'faq.item4.question': 'Can a permit be extended when it expires?',
  'faq.item4.answer':
    'Yes, before your permit expires you can submit an online extension request through your personal cabinet.',
} as const;
