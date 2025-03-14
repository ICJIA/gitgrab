# 🔄 GitGrab

A Node 18+ CLI tool to list, select, and bulk clone GitHub repositories.

## ✨ Features

- 📋 Browse repositories from any GitHub user or organization
- ✅ Select multiple repositories to clone simultaneously
- 🖥️ Interactive selection interface
- 🗂️ Configurable repository storage location
- 📊 Elegant dashboard display of repository information

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

## 📚 Usage

```bash
# Clone repositories from the default organization (ICJIA)
gitgrab

# Clone repositories from a specific user or organization
gitgrab octocat

# Specify a custom directory for cloning
gitgrab --directory ~/projects

# Limit the number of repositories displayed (max 25)
gitgrab --limit 10

# Use a specific GitHub token
gitgrab --token your_github_token
```

You can also store your GitHub token in a `.env` file:
