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

  // Get configurable maximum limit from environment or use default 25
  const maxLimit = parseInt(process.env.MAX_REPOS || 25, 10);

  // Enforce maximum limit
  return Math.min(parsedLimit, maxLimit);
}

/**
 * Parse and validate a GitHub token
 * @param {string} token - The GitHub token to validate
 * @returns {boolean} Whether the token is valid
 */
export function isValidGitHubToken(token) {
  // GitHub tokens are typically 40 characters long and alphanumeric
  return (
    token &&
    /^ghp_[A-Za-z0-9_]{36}$|^github_pat_[A-Za-z0-9_]{22}_[A-Za-z0-9]{59}$/.test(
      token
    )
  );
}

/**
 * Get maximum repository limit from environment or use default
 * @returns {number} The maximum repository limit
 */
export function getMaxReposLimit() {
  const envLimit = parseInt(process.env.MAX_REPOS, 10);
  return !isNaN(envLimit) && envLimit > 0 ? envLimit : 25;
}
