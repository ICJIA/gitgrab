import { Octokit } from "@octokit/rest";
import ora from "ora";
import { getMaxReposLimit } from "./utils.js";

export async function getRepos(target, token, limit = 15) {
  // Make sure limit is parsed as integer first
  let parsedLimit = parseInt(limit, 10);
  if (isNaN(parsedLimit) || parsedLimit <= 0) {
    parsedLimit = 15; // Default if parsing fails
  }

  // Enforce the maximum limit from environment or use default
  const maxLimit = getMaxReposLimit();
  parsedLimit = Math.min(parsedLimit, maxLimit);

  if (!token) {
    throw new Error("GitHub token is required");
  }

  const octokit = new Octokit({
    auth: token,
  });

  try {
    // Determine if target is a user or organization
    let repos = [];
    let isOrg = false;

    try {
      // Try as organization first
      const orgSpinner = ora(
        "Checking if target is an organization..."
      ).start();
      await octokit.orgs.get({ org: target });
      isOrg = true;
      orgSpinner.succeed(`${target} is an organization`);
    } catch (error) {
      // Not an organization, will try as user
      const userSpinner = ora("Checking if target is a user...").start();
      await octokit.users.getByUsername({ username: target });
      userSpinner.succeed(`${target} is a user`);
    }

    // Fetch repositories based on target type
    const fetchSpinner = ora(
      `Fetching the ${parsedLimit} most recent repositories for ${target}...`
    ).start();

    if (isOrg) {
      const { data } = await octokit.repos.listForOrg({
        org: target,
        per_page: parsedLimit,
        sort: "updated",
        direction: "desc",
      });
      repos = data;
    } else {
      const { data } = await octokit.repos.listForUser({
        username: target,
        per_page: parsedLimit,
        sort: "updated",
        direction: "desc",
      });
      repos = data;
    }

    fetchSpinner.succeed(
      `Found ${repos.length} recent repositories for ${
        isOrg ? "organization" : "user"
      }: ${target}`
    );

    // Extract relevant information
    return repos.map((repo) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description || "No description",
      url: repo.html_url,
      clone_url: repo.clone_url,
      size: repo.size,
      language: repo.language || "Not specified",
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      created_at: repo.created_at,
      updated_at: repo.updated_at,
    }));
  } catch (error) {
    if (error.status === 404) {
      throw new Error(`User or organization '${target}' not found`);
    } else if (error.status === 401) {
      throw new Error("Authentication failed. Check your GitHub token");
    } else if (
      error.status === 403 &&
      error.response?.headers &&
      typeof error.response.headers.get === "function" &&
      error.response.headers.get("x-ratelimit-remaining") === "0"
    ) {
      throw new Error(
        "GitHub API rate limit exceeded. Please use a valid token or wait before trying again"
      );
    }
    throw new Error(`Failed to fetch repositories: ${error.message}`);
  }
}
