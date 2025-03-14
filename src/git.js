import { simpleGit } from "simple-git";
import path from "path";
import fs from "fs-extra";
import ora from "ora";
import chalk from "chalk";

export async function cloneRepositories(repos, directory) {
  const clonedRepos = [];
  const git = simpleGit();

  console.log(
    chalk.bold.blue(
      `\nCloning ${repos.length} repositories to ${directory}...\n`
    )
  );

  for (const repo of repos) {
    const targetDir = path.join(directory, repo.name);
    const spinner = ora(`Cloning ${repo.name}...`).start();

    try {
      // Check if directory already exists
      const exists = await fs.pathExists(targetDir);

      if (exists) {
        // Check if it's a git repository
        const isGitRepo = await fs.pathExists(path.join(targetDir, ".git"));

        if (isGitRepo) {
          spinner.warn(
            `Repository ${repo.name} already exists at ${targetDir}`
          );

          // Get additional info about the existing repo
          const localGit = simpleGit(targetDir);
          const commitCount = parseInt(
            (await localGit.raw(["rev-list", "--count", "HEAD"])).trim()
          );

          // Get size on disk
          const dirSize = await getDirSize(targetDir);

          clonedRepos.push({
            ...repo,
            path: targetDir,
            status: "existing",
            commit_count: commitCount,
            size_on_disk: Math.round(dirSize / 1024), // Convert to KB
          });

          continue;
        } else {
          // Directory exists but is not a git repo
          spinner.warn(
            `Directory ${targetDir} exists but is not a git repository. Removing...`
          );
          await fs.remove(targetDir);
        }
      }

      // Clone the repository
      await git.clone(repo.clone_url, targetDir);

      // Get additional info about the cloned repo
      const localGit = simpleGit(targetDir);
      const commitCount = parseInt(
        (await localGit.raw(["rev-list", "--count", "HEAD"])).trim()
      );

      // Calculate repository size on disk
      const dirSize = await getDirSize(targetDir);

      spinner.succeed(`Cloned ${repo.name} successfully`);

      clonedRepos.push({
        ...repo,
        path: targetDir,
        status: "cloned",
        commit_count: commitCount,
        size_on_disk: Math.round(dirSize / 1024), // Convert to KB
      });
    } catch (error) {
      spinner.fail(`Failed to clone ${repo.name}: ${error.message}`);
      clonedRepos.push({
        ...repo,
        path: targetDir,
        status: "failed",
        error: error.message,
      });
    }
  }

  return clonedRepos;
}

// Helper function to calculate directory size
async function getDirSize(dirPath) {
  const files = await fs.readdir(dirPath);
  const stats = await Promise.all(
    files.map(async (file) => {
      const filePath = path.join(dirPath, file);
      try {
        const stat = await fs.stat(filePath);

        if (stat.isDirectory() && file !== ".git") {
          return getDirSize(filePath);
        } else if (stat.isFile()) {
          return stat.size;
        }
        return 0;
      } catch (err) {
        return 0;
      }
    })
  );

  return stats.reduce((total, size) => total + size, 0);
}
