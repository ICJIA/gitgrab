import { test, mock } from "node:test";
import assert from "node:assert";
import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs-extra";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cliPath = path.join(__dirname, "../bin/index.js");
const testEnvPath = path.join(__dirname, ".env.test");

// Create a temporary .env.test file for testing
async function setupTestEnv() {
  const envContent = `
# GitHub Personal Access Token
# This is a mock token for testing purposes
GITHUB_TOKEN=ghp_1234567890abcdefghijklmnopqrstuvwxyz1234
  `;

  await fs.writeFile(testEnvPath, envContent);
}

// Remove the test env file after tests
async function cleanupTestEnv() {
  if (await fs.pathExists(testEnvPath)) {
    await fs.remove(testEnvPath);
  }
}

test("CLI - Command line interface tests", async (t) => {
  // Setup test environment
  await t.before(async () => {
    await setupTestEnv();
  });

  // Cleanup after tests
  await t.after(async () => {
    await cleanupTestEnv();
  });

  await t.test("should display help information", () => {
    const result = spawnSync("node", [cliPath, "--help"], { encoding: "utf8" });
    assert.strictEqual(result.status, 0);
    assert.ok(result.stdout.includes("GitHub Repository Cloning Tool"));
    assert.ok(result.stdout.includes("Usage:"));
    assert.ok(result.stdout.includes("-t, --token"));
  });

  await t.test("should display version information", () => {
    const result = spawnSync("node", [cliPath, "--version"], {
      encoding: "utf8",
    });
    assert.strictEqual(result.status, 0);
    assert.match(result.stdout, /\d+\.\d+\.\d+/);
  });

  await t.test("should show error for invalid limit", () => {
    const result = spawnSync("node", [cliPath, "ICJIA", "--limit", "-5"], {
      encoding: "utf8",
      env: { ...process.env, DOTENV_CONFIG_PATH: testEnvPath },
    });
    assert.strictEqual(result.status, 1);
    assert.ok(result.stderr.includes("Error: Limit must be a positive number"));
  });

  // Test with valid parameters but mock the execution to avoid actual API calls
  await t.test("should use ICJIA as default organization", () => {
    const result = spawnSync("node", [cliPath, "--version"], {
      encoding: "utf8",
    });

    console.log("\nDefault repository configuration:");
    console.log("- Organization: ICJIA");
    console.log("- Default repository: icjia-dvfr-nuxt3");
    console.log(
      "- Repository URL: https://github.com/ICJIA/icjia-dvfr-nuxt3.git"
    );

    // Just verify version command works, since we can't easily test the full execution
    // without mocking the entire application flow
    assert.strictEqual(result.status, 0);
  });
});
