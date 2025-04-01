# 🔄 GitGrab

A Node 18+ CLI tool to list, select, and bulk clone GitHub repositories. Works across Linux, macOS, and Windows.

## ✨ Features

- 📋 Browse repositories from any GitHub user or organization
- ✅ Select multiple repositories to clone simultaneously
- 🖥️ Interactive selection interface with multi-select capability
- 🗂️ Configurable repository storage location
- 📊 Dashboard display of repository information
- 🔄 Automatic sorting by most recently updated repositories
- 💻 Cross-platform support (Linux, macOS, Windows)
- 🚦 Smart handling of existing repositories

## 🤔 Why Use GitGrab?

There are several scenarios where bulk-cloning repositories is valuable:

### 💾 Backup & Archival

- **Local Backups**: Create offline copies of all your organization's repositories
- **Disaster Recovery**: Maintain a complete backup of your codebase independent of GitHub
- **Historical Preservation**: Archive projects for future reference or compliance requirements

### 🚀 Development Efficiency

- **New Developer Onboarding**: Quickly set up a new team member with all relevant repositories
- **Workstation Setup**: Configure a new development machine with all your projects at once
- **Multi-Project Work**: Easily pull down related repositories when working across multiple codebases

### 🛠️ Administration & Management

- **Code Audits**: Clone multiple repositories for security review or code quality assessment
- **Migration**: Facilitate moving projects between GitHub organizations or to other Git providers
- **Inventory**: Create a local inventory of all organizational code assets

## 📥 Installation

Using npm:

```bash
npm install -g gitgrab
```

Using yarn:

```bash
yarn global add gitgrab
```

Using pnpm:

```bash
pnpm add -g gitgrab
```

## 📋 Prerequisites

- Node.js 18 or later
- A GitHub Personal Access Token with "repo" scope
  - Create one at: https://github.com/settings/tokens
- Git installed on your system

## 📚 Usage

Basic usage:

```bash
# Clone repositories from the default organization (ICJIA)
gitgrab

# Clone repositories from a specific user or organization
gitgrab octocat

# Specify a custom directory for cloning
gitgrab --directory ~/projects    # Unix-like systems
gitgrab --directory C:\Projects  # Windows

# Limit the number of repositories displayed (default: 15, max: 25)
gitgrab --limit 10

# Use a specific GitHub token
gitgrab --token your_github_token
```

### Environment Configuration

You can store your GitHub token in a `.env` file:

```env
# GitHub Personal Access Token
GITHUB_TOKEN=your_github_token_here

# Optional: Set maximum number of repositories to fetch (default: 25)
MAX_REPOS=25
```

### Cross-Platform Path Handling

GitGrab automatically handles paths correctly across different operating systems:

- **Unix-like systems** (Linux, macOS):
  ```bash
  gitgrab --directory ~/projects
  gitgrab --directory /home/user/repos
  ```

- **Windows**:
  ```bash
  gitgrab --directory C:\Projects
  gitgrab --directory C:/Projects  # Forward slashes also work
  ```

### Repository Selection

- Repositories are sorted by last update date (most recent first)
- Use space bar to select/deselect repositories
- Use arrow keys to navigate
- Press Enter to confirm selection

### Dashboard Features

The dashboard provides:
- Repository name and description
- Programming language
- Repository size
- Star count
- Commit count
- Clone status
- Local path

## 🔧 Troubleshooting

### Windows Users
- Ensure you have appropriate write permissions for the target directory
- If using PowerShell, you might need to adjust execution policies
- WSL users: Windows paths are mounted under `/mnt/c/` etc.

### Token Issues
- Ensure your token has the 'repo' scope
- Token should follow the format: `ghp_*` or `github_pat_*`
- Store token in `.env` file if you don't want to pass it via command line

### Directory Issues
- The app will create the target directory if it doesn't exist
- If the directory exists but isn't empty, you'll be prompted to:
  - Delete existing contents
  - Choose a different directory
  - Cancel the operation

## 📝 License

MIT
