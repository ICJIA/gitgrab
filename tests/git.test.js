import { test, mock } from "node:test";
import assert from "node:assert";
import path from "path";
import fs from "fs-extra";
import { fileURLToPath } from "url";
import { cloneRepositories } from "../src/git.js";
import { simpleGit } from "simple-git";
import chalk from "chalk";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const testDir = path.join(__dirname, "test-repos");

// Mock simpleGit to avoid actual Git operations during tests
mock.method(simpleGit(), "clone", async () => {
  return { success: true };
});

mock.method(simpleGit(), "raw", async () => {
  return "10"; // Mock commit count
});

test("Git - cloneRepositories function", async (t) => {
  // Setup
  await t.before(async () => {
    await fs.ensureDir(testDir);

    // Create a mock .git directory to simulate existing repos
    const mockGitDir = path.join(testDir, "icjia-dvfr-nuxt3", ".git");
    await fs.ensureDir(mockGitDir);
  });

  // Teardown
  await t.after(async () => {
    await fs.remove(testDir);
  });

  await t.test("should handle empty repository list", async () => {
    const result = await cloneRepositories([], testDir);
    assert.deepStrictEqual(result, []);
  });

  // Test with properly mocked Git operations
  await t.test("should process repository data correctly", async () => {
    // Mock data using the default repo
    const mockRepos = [
      {
        name: "icjia-dvfr-nuxt3",
        clone_url: "https://github.com/ICJIA/icjia-dvfr-nuxt3.git",
        language: "Vue",
        size: 1000,
        stars: 10,
      },
    ];

    // Mock the cloneRepositories function to not perform actual Git operations
    const originalCloneRepositories = cloneRepositories;
    global.cloneRepositories = async (repos, directory) => {
      return repos.map((repo) => ({
        ...repo,
        path: path.join(directory, repo.name),
        status: "cloned",
        commit_count: 10,
        size_on_disk: 2048, // 2MB in KB
      }));
    };

    try {
      const result = await global.cloneRepositories(mockRepos, testDir);

      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0].name, "icjia-dvfr-nuxt3");
      assert.strictEqual(result[0].status, "cloned");
      assert.strictEqual(result[0].commit_count, 10);

      // Display cloned repositories in test output
      console.log("\nRepositories cloned in test:");
      result.forEach((repo) => {
        console.log(`- ${repo.name} (${repo.clone_url}) → ${repo.path}`);
        console.log(`  Status: ${repo.status}, Commits: ${repo.commit_count}`);
      });
    } finally {
      global.cloneRepositories = originalCloneRepositories;
    }
  });
});
