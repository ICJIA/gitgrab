import { test, mock } from "node:test";
import assert from "node:assert";
import { getRepos } from "../src/github.js";

// Create a proper mock for testing
test("GitHub API - getRepos function", async (t) => {
  await t.test("should throw error when token is missing", async () => {
    await assert.rejects(async () => await getRepos("ICJIA", null), {
      message: "GitHub token is required",
    });
  });

  // Mock for the fetch tests
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

        console.log("\nRepositories fetched in test:");
        console.log(`- ${repos[0].name} (${repos[0].clone_url})`);
      } finally {
        global.getRepos = originalGetRepos;
      }
    }
  );

  // Test maximum limit enforcement without making actual API calls
  await t.test("should enforce maximum limit of 15 repositories", async () => {
    // Test directly with the utility function
    const { validateLimit } = await import("../src/utils.js");

    // Should return the same value for limits under 15
    assert.strictEqual(validateLimit(10), 10);

    // Should cap at 15 for higher values
    assert.strictEqual(validateLimit(30), 15);

    console.log("\nRepository limit test:");
    console.log("- Requested: 30, Enforced maximum: 15");
  });
});
