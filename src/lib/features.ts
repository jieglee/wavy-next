/**
 * Feature flags for sections that are out of the current UKK scope.
 * The code stays in the repo; flip a flag to bring a section back.
 */

/**
 * Hotel recommendations ("traveler mode") on the landing and logged-in home.
 * While false, /hotels/[id] redirects to the landing page.
 */
export const SHOW_TRAVELER_MODE = false;

/**
 * Waiting room / waiting list at /concerts/[id]/queue.
 * While false, nothing links to it and direct visits redirect to the concert detail page.
 */
export const SHOW_QUEUE = false;

/**
 * "Pilihan Pembayaran" logo grid in the site footer.
 * Shows only the methods tested in Midtrans Snap sandbox (docs/MIDTRANS.md §4);
 * the list lives in footer.tsx (paymentMethods).
 */
export const SHOW_PAYMENT_LOGOS = true;

/**
 * Social media icons in the site footer.
 * Hidden until Wavy has real accounts; every icon currently points nowhere.
 */
export const SHOW_SOCIAL_LINKS = false;
