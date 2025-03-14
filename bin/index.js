#!/usr/bin/env node

import { program } from "commander";
import { getRepos } from "../src/github.js";
import { promptForRepoSelection, promptForDirectory } from "../src/prompt.js";
import { cloneRepositories } from "../src/git.js";
import { displayDashboard } from "../src/dashboard.js";
import ora from "ora";
import chalk from "chalk";
import * as dotenv from "dotenv";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import inquirer from "inquirer";
import { validateLimit } from "../src/utils.js";

// Get the project root directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const defaultReposDir = path.join(projectRoot, "repos");

// Load environment variables
dotenv.config();

// Function to validate GitHub token format
function isValidGitHubToken(token) {
  // GitHub tokens are typically 40 characters long and alphanumeric
  return (
    token &&
    /^ghp_[A-Za-z0-9_]{36}$|^github_pat_[A-Za-z0-9_]{22}_[A-Za-z0-9]{59}$/.test(
      token
    )
  );
}

// Function to check and prepare the repository directory
async function prepareReposDirectory(initialDir) {
  try {
    // Check if directory exists
    const exists = await fs.pathExists(initialDir);

    // If it doesn't exist, create it
    if (!exists) {
      console.log(chalk.blue(`Creating repository directory: ${initialDir}`));
      await fs.ensureDir(initialDir);
      return initialDir; // Return the default directory
    }

    // Directory exists, check if it's empty
    const contents = await fs.readdir(initialDir);

    if (contents.length === 0) {
      console.log(
        chalk.blue(`Using empty repository directory: ${initialDir}`)
      );
      return initialDir; // Directory is empty, use it
    }

    // Directory is not empty, ask if user wants to delete contents
    const { shouldDelete } = await inquirer.prompt([
      {
        type: "confirm",
        name: "shouldDelete",
        message: `The directory ${initialDir} is not empty. Do you want to delete its contents?`,
        default: true,
      },
    ]);

    if (shouldDelete) {
      // Delete contents but not the directory itself
      const spinner = ora(
        `Cleaning repository directory: ${initialDir}`
      ).start();

      // Empty the directory by removing and recreating it
      await fs.emptyDir(initialDir);

      spinner.succeed(`Repository directory cleaned: ${initialDir}`);
      return initialDir;
    } else {
      // User chose not to delete, ask for a new directory name
      const { newDirName } = await inquirer.prompt([
        {
          type: "input",
          name: "newDirName",
          message: "Enter a new folder name to create at the project root:",
          validate: (input) => {
            if (!input.trim()) return "Folder name cannot be empty";
            if (input.includes("/") || input.includes("\\"))
              return "Folder name should not contain path separators";
            return true;
          },
        },
      ]);

      // Create the new path
      const newDir = path.join(projectRoot, newDirName.trim());

      // Check if this new directory already exists
      const newDirExists = await fs.pathExists(newDir);
      if (newDirExists) {
        console.error(
          chalk.red(`Error: A directory named '${newDirName}' already exists.`)
        );
        console.log(
          chalk.yellow(
            "Please run the application again with a different directory name."
          )
        );
        process.exit(1);
      }

      // Create the new directory
      console.log(chalk.blue(`Creating new repository directory: ${newDir}`));
      await fs.ensureDir(newDir);
      return newDir;
    }
  } catch (error) {
    console.error(
      chalk.red(`Error preparing repository directory: ${error.message}`)
    );
    process.exit(1);
  }
}

// Display app header
console.log(
  chalk.bold.green("\n=== GitGrab - GitHub Repository Cloning Tool ===")
);
console.log(
  chalk.cyan("A CLI utility to easily browse and clone GitHub repositories")
);
console.log(
  chalk.cyan("Run with `gitgrab [username/organization]` to get started\n")
);

program
  .name("gitgrab")
  .description("CLI tool to list, select, and clone GitHub repositories")
  .version("1.0.0")
  .argument("[target]", "GitHub username or organization name", "ICJIA")
  .option("-t, --token <token>", "GitHub personal access token")
  .option(
    "-d, --directory <path>",
    "Directory to clone repositories to",
    defaultReposDir
  )
  .option(
    "-l, --limit <number>",
    "Limit the number of repositories to display (max 15)",
    "15"
  )
  .action(async (target, options) => {
    try {
      // Check and prepare the repository directory
      const reposDir = await prepareReposDirectory(options.directory);

      // Update the directory option with the potentially new path
      options.directory = reposDir;

      console.log(
        chalk.blue(
          `Target: ${
            target === "ICJIA" ? chalk.yellow("ICJIA (default)") : target
          }`
        )
      );
      console.log(
        chalk.blue("To specify a different user or organization, run:")
      );
      console.log(chalk.cyan("  gitgrab <username/organization>"));
      console.log(
        chalk.blue(
          `Repositories will be saved to: ${chalk.cyan(options.directory)}`
        )
      );
      console.log();

      // Determine token from options or environment variable
      const token = options.token || process.env.GITHUB_TOKEN;

      // Check if token is available and valid
      if (!token) {
        console.error(chalk.red("Error: GitHub token not found"));
        console.log(
          chalk.yellow(
            "\nTo use GitGrab, you need a GitHub Personal Access Token. This is required for:"
          )
        );
        console.log("  - Accessing private repositories");
        console.log("  - Avoiding rate limits with the GitHub API");
        console.log("  - Ensuring proper authentication");
        console.log("\nYou can create a token by following these steps:");
        console.log("  1. Visit: https://github.com/settings/tokens");
        console.log(
          '  2. Click "Generate new token" and confirm your password'
        );
        console.log('  3. Give your token a name (e.g., "GitGrab CLI")');
        console.log('  4. Select at least the "repo" scope');
        console.log('  5. Click "Generate token" and copy your new token');
        console.log("\nThen, you can use your token in one of two ways:");
        console.log(
          "  - Pass it as a command-line option: gitgrab <username> --token YOUR_TOKEN"
        );
        console.log("  - Store it in a .env file in your project directory:");
        console.log("    GITHUB_TOKEN=your_token_here");
        process.exit(1);
      }

      // Validate token format
      if (!isValidGitHubToken(token)) {
        console.error(chalk.red("Error: Invalid GitHub token format"));
        console.log(
          chalk.yellow(
            "\nYour GitHub token appears to be incorrectly formatted."
          )
        );
        console.log("GitHub tokens should follow one of these formats:");
        console.log("  - Fine-grained personal access tokens: github_pat_*");
        console.log("  - Classic personal access tokens: ghp_*");
        console.log("\nPlease double-check your token and try again.");
        process.exit(1);
      }

      // Parse and validate limit
      let limit;
      try {
        limit = validateLimit(options.limit);
        if (parseInt(options.limit, 10) > 15) {
          console.log(
            chalk.yellow(
              `Limiting to maximum of 15 repositories (you requested ${options.limit})`
            )
          );
        }
      } catch (error) {
        console.error(chalk.red(`Error: ${error.message}`));
        console.log(
          chalk.yellow("Please provide a valid number for the --limit option")
        );
        process.exit(1);
      }

      // Fetch repositories
      const spinner = ora(`Fetching up to 15 recent repositories...`).start();
      const repos = await getRepos(target, token, limit);
      spinner.succeed(
        `Found ${repos.length} recent repositories for ${target}`
      );

      // User selects repositories
      const selectedRepos = await promptForRepoSelection(repos);

      if (selectedRepos.length === 0) {
        console.log(chalk.yellow("No repositories selected. Exiting."));
        process.exit(0);
      }

      // User confirms or changes target directory
      const directory = await promptForDirectory(options.directory);

      // Clone repositories
      const clonedRepos = await cloneRepositories(selectedRepos, directory);

      // Display dashboard
      displayDashboard(clonedRepos);
    } catch (error) {
      console.error(chalk.red("Error:"), error.message);
      process.exit(1);
    }
  });

// Custom error handling for missing arguments (no longer needed as argument is optional)
program.showHelpAfterError(
  chalk.red(
    "\nERROR: Invalid arguments provided. Please check your command syntax.\n" +
      "Example: gitgrab ICJIA\n"
  )
);

program.parse();
