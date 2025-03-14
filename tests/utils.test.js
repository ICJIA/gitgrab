import { test } from "node:test";
import assert from "node:assert";
import {
  validateLimit,
  isValidGitHubToken,
  getMaxReposLimit,
} from "../src/utils.js";

test("Utilities - validateLimit function", async (t) => {
  await t.test("should reject non-numeric values", () => {
    assert.throws(() => validateLimit("abc"), {
      message: "Limit must be a positive number",
    });
    assert.throws(() => validateLimit(""), {
      message: "Limit must be a positive number",
    });
    assert.throws(() => validateLimit(null), {
      message: "Limit must be a positive number",
    });
    assert.throws(() => validateLimit(undefined), {
      message: "Limit must be a positive number",
    });
  });

  await t.test("should reject zero and negative values", () => {
    assert.throws(() => validateLimit(0), {
      message: "Limit must be a positive number",
    });
    assert.throws(() => validateLimit(-1), {
      message: "Limit must be a positive number",
    });
    assert.throws(() => validateLimit("-10"), {
      message: "Limit must be a positive number",
    });
  });

  await t.test("should accept valid positive numbers", () => {
    assert.strictEqual(validateLimit(5), 5);
    assert.strictEqual(validateLimit("10"), 10);
    assert.strictEqual(validateLimit(15), 15);
  });

  await t.test("should cap at maximum limit", () => {
    // Save original environment
    const originalEnv = process.env.MAX_REPOS;

    try {
      // Test with environment variable
      process.env.MAX_REPOS = "20";
      assert.strictEqual(validateLimit(30), 20);

      // Test with default if environment variable is not set
      process.env.MAX_REPOS = undefined;
      assert.strictEqual(validateLimit(50), 25);
    } finally {
      // Restore original environment
      process.env.MAX_REPOS = originalEnv;
    }
  });
});

test("Utilities - isValidGitHubToken function", async (t) => {
  await t.test("should reject invalid token formats", () => {
    assert.strictEqual(isValidGitHubToken(""), false);
    assert.strictEqual(isValidGitHubToken(null), false);
    assert.strictEqual(isValidGitHubToken(undefined), false);
    assert.strictEqual(isValidGitHubToken("abc123"), false);
    assert.strictEqual(isValidGitHubToken("gp_invalidformat"), false);
  });

  await t.test("should accept valid token formats", () => {
    // Classic token format
    assert.strictEqual(
      isValidGitHubToken("ghp_1234567890abcdefghijklmnopqrstuvwxyz1234"),
      true
    );

    // Fine-grained token format
    assert.strictEqual(
      isValidGitHubToken(
        "github_pat_12345678901234567890AB_123456789012345678901234567890123456789012345678901234567890"
      ),
      true
    );
  });
});

test("Utilities - getMaxReposLimit function", async (t) => {
  await t.test("should use environment variable if available", () => {
    // Save original environment
    const originalEnv = process.env.MAX_REPOS;

    try {
      process.env.MAX_REPOS = "42";
      assert.strictEqual(getMaxReposLimit(), 42);

      process.env.MAX_REPOS = "100";
      assert.strictEqual(getMaxReposLimit(), 100);
    } finally {
      // Restore original environment
      process.env.MAX_REPOS = originalEnv;
    }
  });

  await t.test("should use default if environment variable is invalid", () => {
    // Save original environment
    const originalEnv = process.env.MAX_REPOS;

    try {
      process.env.MAX_REPOS = "invalid";
      assert.strictEqual(getMaxReposLimit(), 25);

      process.env.MAX_REPOS = "-10";
      assert.strictEqual(getMaxReposLimit(), 25);

      process.env.MAX_REPOS = undefined;
      assert.strictEqual(getMaxReposLimit(), 25);
    } finally {
      // Restore original environment
      process.env.MAX_REPOS = originalEnv;
    }
  });
});

// Add a comprehensive test for environment variable interactions
test("Environment variable integration tests", async (t) => {
  // Save all original environment values
  const originalEnv = {
    MAX_REPOS: process.env.MAX_REPOS,
  };

  await t.test("should apply changes to MAX_REPOS immediately", async () => {
    try {
      // Initial value
      process.env.MAX_REPOS = "25";
      assert.strictEqual(getMaxReposLimit(), 25);

      // Change the value
      process.env.MAX_REPOS = "42";
      assert.strictEqual(getMaxReposLimit(), 42);

      // Verify the validation function uses updated value
      assert.strictEqual(validateLimit(35), 35);
      assert.strictEqual(validateLimit(50), 42);
    } finally {
      // Restore original environment
      process.env.MAX_REPOS = originalEnv.MAX_REPOS;
    }
  });

  await t.test("should handle MAX_REPOS=0 as invalid", async () => {
    try {
      process.env.MAX_REPOS = "0";
      assert.strictEqual(
        getMaxReposLimit(),
        25,
        "Should use default for zero value"
      );
    } finally {
      process.env.MAX_REPOS = originalEnv.MAX_REPOS;
    }
  });
});
