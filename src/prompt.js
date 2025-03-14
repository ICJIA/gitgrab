import inquirer from "inquirer";
import fs from "fs-extra";
import path from "path";
import chalk from "chalk";

export async function promptForRepoSelection(repos) {
  if (repos.length === 0) {
    console.log(chalk.yellow("No repositories found."));
    process.exit(0);
  }

  const { selectedRepos } = await inquirer.prompt([
    {
      type: "checkbox",
      name: "selectedRepos",
      message: "Select repositories to clone:",
      choices: repos.map((repo) => ({
        name: `${repo.name} ${repo.description ? `- ${repo.description}` : ""}`,
        value: repo,
        short: repo.name,
      })),
      pageSize: 20,
    },
  ]);

  return selectedRepos;
}

export async function promptForDirectory(defaultDir) {
  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: `Clone to default directory? (${defaultDir})`,
      default: true,
    },
  ]);

  let finalDir = defaultDir;

  if (!confirm) {
    const { customDir } = await inquirer.prompt([
      {
        type: "input",
        name: "customDir",
        message: "Enter custom directory path:",
        validate: (input) => {
          if (!input.trim()) return "Directory path cannot be empty";
          return true;
        },
      },
    ]);

    finalDir = path.resolve(customDir.trim());
  }

  // Ensure directory exists
  try {
    await fs.ensureDir(finalDir);
    console.log(chalk.green(`Directory is ready: ${finalDir}`));
    return finalDir;
  } catch (error) {
    throw new Error(`Failed to create directory: ${error.message}`);
  }
}
