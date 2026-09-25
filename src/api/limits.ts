/**
 * The public status-check endpoints (`GET /public/appeals/check`,
 * `GET /public/applications/check`) answer `found: false` for anything they
 * cannot parse — the shape of `number`/`phone`/`email` is never validated
 * server-side, only the length (stage 19 plan, ruling R4). These constants
 * mirror the server's own caps so an input box stops a citizen at the same
 * length the API would 422 at, rather than accepting more and failing only
 * on submit.
 */
export const CHECK_NUMBER_MAX_LENGTH = 64;
export const CHECK_PHONE_MAX_LENGTH = 64;
export const CHECK_EMAIL_MAX_LENGTH = 255;

/**
 * `VerifyPage`'s one permit-number box (`AB 000123`) and the home page's
 * quick-check copy of it (`GisMonitoringSection`) both feed
 * `/public/permits/check` — 32 characters comfortably fits a series letter
 * plus a six-digit number, with room to spare.
 */
export const PERMIT_NUMBER_INPUT_MAX_LENGTH = 32;
