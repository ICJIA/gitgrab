import Table from "cli-table3";
import chalk from "chalk";
import path from "path";
import fs from "fs-extra";
import * as dotenv from "dotenv";
import { simpleGit } from "simple-git";
dotenv.config();

function formatSize(sizeInKB) {
  if (sizeInKB < 1024) {
    return `${sizeInKB} KB`;
  } else if (sizeInKB < 1024 * 1024) {
    return `${(sizeInKB / 1024).toFixed(2)} MB`;
  } else {
    return `${(sizeInKB / (1024 * 1024)).toFixed(2)} GB`;
  }
}

function truncate(str, length) {
  return str.length > length ? str.substring(0, length - 3) + "..." : str;
}

export async function displayDashboard(repos) {
  console.log("\n");
  console.log(chalk.bold.green("📊 GitHub Repositories Dashboard 📊"));
  console.log("\n");

  // Summary
  const cloned = repos.filter((r) => r.status === "cloned").length;
  const existing = repos.filter((r) => r.status === "existing").length;
  const failed = repos.filter((r) => r.status === "failed").length;

  console.log(chalk.bold("Summary:"));
  console.log(`Total repositories: ${chalk.cyan(repos.length)}`);
  console.log(`Successfully cloned: ${chalk.green(cloned)}`);
  console.log(`Already existing: ${chalk.yellow(existing)}`);
  console.log(`Failed: ${chalk.red(failed)}`);
  console.log("\n");

  // Create table for detailed info
  const table = new Table({
    head: [
      chalk.bold.cyan("Repository"),
      chalk.bold.cyan("Language"),
      chalk.bold.cyan("Size"),
      chalk.bold.cyan("Stars"),
      chalk.bold.cyan("Commits"),
      chalk.bold.cyan("Status"),
      chalk.bold.cyan("Location"),
    ],
    colWidths: [30, 15, 12, 10, 10, 12, 50],
    wordWrap: true,
  });

  // Add rows
  repos.forEach((repo) => {
    let statusColor;
    switch (repo.status) {
      case "cloned":
        statusColor = chalk.green;
        break;
      case "existing":
        statusColor = chalk.yellow;
        break;
      case "failed":
        statusColor = chalk.red;
        break;
      default:
        statusColor = chalk.white;
    }

    const targetDir = path.join(directory, repo.name);

    table.push([
      truncate(chalk.cyan(repo.name), 28),
      truncate(repo.language || "N/A", 13),
      repo.size_on_disk
        ? formatSize(repo.size_on_disk)
        : formatSize(repo.size || 0),
      repo.stars.toString(),
      repo.commit_count ? repo.commit_count.toString() : "N/A",
      statusColor(repo.status),
      truncate(repo.path, 48),
    ]);
  });

  console.log(table.toString());
  console.log("\n");

  // Display errors if any
  const failedRepos = repos.filter((r) => r.status === "failed");
  if (failedRepos.length > 0) {
    console.log(chalk.bold.red("Failed Repositories:"));
    failedRepos.forEach((repo) => {
      console.log(`${chalk.cyan(repo.name)}: ${chalk.red(repo.error)}`);
    });
    console.log("\n");
  }

  // List all successfully cloned repositories
  if (cloned > 0) {
    console.log(chalk.bold.green("✓ Successfully Cloned Repositories:"));
    const clonedRepos = repos.filter((r) => r.status === "cloned");
    clonedRepos.forEach((repo) => {
      console.log(`  ${chalk.cyan(repo.name)} → ${chalk.green(repo.path)}`);
    });
    console.log("\n");
  }

  // List existing repositories
  if (existing > 0) {
    console.log(chalk.bold.yellow("⚠ Already Existing Repositories:"));
    const existingRepos = repos.filter((r) => r.status === "existing");
    existingRepos.forEach((repo) => {
      console.log(`  ${chalk.cyan(repo.name)} → ${chalk.yellow(repo.path)}`);
    });
    console.log("\n");
  }

  await fs.ensureDir(directory); // Creates directories with correct permissions
}
