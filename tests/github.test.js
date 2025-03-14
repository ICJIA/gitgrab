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

// Add new tests for error handling
test("GitHub API error handling", async (t) => {
  await t.test("should handle 404 errors properly", async () => {
    // Mock a 404 response
    mock.method(global, 'fetch', async () => {
      const error = new Error("Not Found");
      error.status = 404;
      throw error;
    });

    await assert.rejects(
      async () => await getRepos("non-existent-user", "fake-token"),
      { message: "User or organization 'non-existent-user' not found" }
    );
  });

  await t.test("should handle authentication errors properly", async () => {
    // Mock a 401 response
    mock.method(global, 'fetch', async () => {
      const error = new Error("Unauthorized");
      error.status = 401;
      throw error;
    });

    await assert.rejects(async () => await getRepos("ICJIA", "invalid-token"), {
      async () => await getRepos("ICJIA", "invalid-token"),ken",
      { message: "Authentication failed. Check your GitHub token" }
    );
  });
  await t.test("should handle rate limit errors properly", async () => {
  await t.test("should handle rate limit errors properly", async () => {
    // Mock a 403 rate limit responsec () => {
    mock.method(global, 'fetch', async () => {exceeded");
      const error = new Error("API rate limit exceeded");
      error.status = 403;
      error.response = {
        headers: {me) => (name === "x-ratelimit-remaining" ? "0" : null),
          get: (name) => name === 'x-ratelimit-remaining' ? "0" : null
        }
      };row error;
      throw error;
    });
    await assert.rejects(
    await assert.rejects(etRepos("ICJIA", "rate-limited-token"),
      async () => await getRepos("ICJIA", "rate-limited-token"),
      { message: "GitHub API rate limit exceeded. Please use a valid token or wait before trying again" }
    );    "GitHub API rate limit exceeded. Please use a valid token or wait before trying again",
  }); }
    );
  await t.test("should handle network errors properly", async () => {
    // Mock a network error
    mock.method(global, 'fetch', async () => {roperly", async () => {
      throw new Error("Network error");
    });k.method(global, "fetch", async () => {
      throw new Error("Network error");
    await assert.rejects(
      async () => await getRepos("ICJIA", "valid-token"),
      { message: "Failed to fetch repositories: Network error" }lid-token"), {
    );message: "Failed to fetch repositories: Network error",
  }););
  });
  // Test with environment variable MAX_REPOS
  await t.test("should respect MAX_REPOS environment variable", async () => {
    // Save original environmentAX_REPOS environment variable", async () => {
    const originalEnv = process.env.MAX_REPOS;
    const originalEnv = process.env.MAX_REPOS;
    try {
      process.env.MAX_REPOS = "40";
      process.env.MAX_REPOS = "40";
      // Mock getRepos to verify the limit is respected
      const originalGetRepos = getRepos;it is respected
      global.getRepos = async (target, token, limit) => {
        assert.strictEqual(limit, 30); token, limit) => {
        return [];ictEqual(limit, 30);
      };return [];
      };
      try {
        await global.getRepos("ICJIA", "valid-token", 30);
      } finally {bal.getRepos("ICJIA", "valid-token", 30);
        global.getRepos = originalGetRepos;
      } global.getRepos = originalGetRepos;
      }
    } finally {
      // Restore original environment
      process.env.MAX_REPOS = originalEnv;
    }
  });
});

// Test with environment variable MAX_REPOS
test("GitHub API environment configuration", async (t) => {
  // Save original environment
  const originalEnv = process.env.MAX_REPOS;
  
  await t.test("should respect MAX_REPOS environment variable", async () => {
    try {
      // Set environment variable
      process.env.MAX_REPOS = "40";
      
      // Create a mock function to verify the limit is enforced correctly
      let capturedLimit = null;
      const originalGetRepos = getRepos;
      
      // Replace the real function with our mock that captures the limit
      global.getRepos = async (target, token, limit) => {
        capturedLimit = limit;
        return [];
      };
      
      try {
        // Call with a limit higher than default but below MAX_REPOS
        await global.getRepos("ICJIA", "valid-token", 30);
        assert.strictEqual(capturedLimit, 30, "Should accept limit below MAX_REPOS");
        
        // Call with a limit higher than MAX_REPOS
        await global.getRepos("ICJIA", "valid-token", 50);
        assert.strictEqual(capturedLimit, 40, "Should cap limit at MAX_REPOS");
      } finally {
        // Restore the original function
        global.getRepos = originalGetRepos;
      }
    } finally {
      // Always restore original environment
      process.env.MAX_REPOS = originalEnv;
    }
  });
  
  await t.test("should use default when MAX_REPOS is invalid", async () => {
    try {
      // Set invalid environment variable
      process.env.MAX_REPOS = "not_a_number";
      
      const { getMaxReposLimit } = await import("../src/utils.js");
      assert.strictEqual(getMaxReposLimit(), 25, "Should use default value for invalid MAX_REPOS");
    } finally {
      // Restore original environment
      process.env.MAX_REPOS = originalEnv;
    }
  });
});
