/**
 * Validates and normalizes the limit for repository fetching
 * @param {number|string} limit - The limit to validate
 * @returns {number} - The validated limit
 * @throws {Error} - If limit is not a positive number
 */
export function validateLimit(limit) {
  const parsedLimit = parseInt(limit, 10);

  if (isNaN(parsedLimit) || parsedLimit <= 0) {
    throw new Error("Limit must be a positive number");
  }

  // Enforce maximum limit of 15
  return Math.min(parsedLimit, 15);
}
