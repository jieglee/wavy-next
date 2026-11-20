/**
 * Feature flags for sections that are out of the current UKK scope.
 * The code stays in the repo; flip a flag to bring a section back.
 */

/** Hotel recommendations ("traveler mode") on the landing and logged-in home. */
export const SHOW_TRAVELER_MODE = false;

/**
 * Waiting room / waiting list at /concerts/[id]/queue.
 * While false, nothing links to it and direct visits redirect to the concert detail page.
 */
export const SHOW_QUEUE = false;
