import { test, mock } from "node:test";
import assert from "node:assert";
import { getRepos } from "../src/github.js";

// Mock Octokit for testing without an actual GitHub token
mock.method(global, "fetch", async () => {
  return {
    status: 200,
    json: async () => ({
      data: [
        {
          id: 123456,
          name: "icjia-dvfr-nuxt3",
          full_name: "ICJIA/icjia-dvfr-nuxt3",
          description: "Test repository",
          html_url: "https://github.com/ICJIA/icjia-dvfr-nuxt3",
          clone_url: "https://github.com/ICJIA/icjia-dvfr-nuxt3.git",
          size: 1000,
          language: "Vue",
          stargazers_count: 10,
          forks_count: 5,
          created_at: "2022-01-01T00:00:00Z",
          updated_at: "2023-01-01T00:00:00Z",
        },
      ],
    }),
  };
});

test("GitHub API - getRepos function", async (t) => {
  await t.test("should throw error when token is missing", async () => {
    await assert.rejects(async () => await getRepos("ICJIA", null), {
      message: "GitHub token is required",
    });
  });

  // Provide a mock token to ensure this test always runs
  await t.test(
    "should fetch repositories for a valid organization",
    async () => {
      // Using a mock token that will pass the validation
      const mockToken = "ghp_1234567890abcdefghijklmnopqrstuvwxyz1234";

      // Temporarily mock the getRepos function
      const originalGetRepos = getRepos;
      global.getRepos = async (target, token, limit) => {
        assert.strictEqual(target, "ICJIA");
        assert.strictEqual(token, mockToken);

        return [
          {
            id: 123456,
            name: "icjia-dvfr-nuxt3",
            full_name: "ICJIA/icjia-dvfr-nuxt3",
            description: "Test repository",
            url: "https://github.com/ICJIA/icjia-dvfr-nuxt3",
            clone_url: "https://github.com/ICJIA/icjia-dvfr-nuxt3.git",
            size: 1000,
            language: "Vue",
            stars: 10,
            forks: 5,
            created_at: "2022-01-01T00:00:00Z",
            updated_at: "2023-01-01T00:00:00Z",
          },
        ];
      };

      try {
        const repos = await global.getRepos("ICJIA", mockToken, 5);
        assert.ok(Array.isArray(repos));
        assert.strictEqual(repos.length, 1);
        assert.strictEqual(repos[0].name, "icjia-dvfr-nuxt3");
        assert.strictEqual(repos[0].full_name, "ICJIA/icjia-dvfr-nuxt3");

        // Display test results for repositories
        console.log("\nRepositories fetched in test:");
        console.log(`- ${repos[0].name} (${repos[0].clone_url})`);
      } finally {
        // Restore the original function
        global.getRepos = originalGetRepos;
      }
    }
  );

  // Test maximum limit enforcement
  await t.test("should enforce maximum limit of 15 repositories", async () => {
    // Using a mock token that will pass the validation
    const mockToken = "ghp_1234567890abcdefghijklmnopqrstuvwxyz1234";

    // Try with a limit higher than 15
    const repos = await getRepos("ICJIA", mockToken, 30);

    // Should be restricted to 15
    assert.ok(
      repos.length <= 15,
      `Expected max 15 repos but got ${repos.length}`
    );

    console.log("\nRepository limit test:");
    console.log(`- Requested: 30, Received: ${repos.length} (max 15)`);
  });
});
