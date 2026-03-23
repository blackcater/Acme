# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package Manager

**Always use `bun` and `bunx`** instead of npm, npx, pnpm, or yarn.

- `bun install` - Install dependencies
- `bun run <script>` - Run a script
- `bunx <package>` - Execute a package (like npx)
- `bun test` - Run tests

## Project Overview

Acme is a local-first multi-agent collaboration desktop application built with Electron. It supports multiple code agents (Claude Code, Codex, Acmex) running in parallel with local-first data storage.

### Architecture

```
apps/
  desktop/      # Electron desktop app (main focus)
  api-server/   # API server
  cli/          # CLI tool
  console/      # Console UI
  viewer/       # Viewer app
  web/          # Web app

packages/
  agent/        # Agent implementations (Claude Code, Codex, Acmex)
  core/         # Core types and utilities
  runtime/      # AgentRuntime - manages multiple agents
  acp/          # Agent Client Protocol implementation
  schemas/      # TypeScript schemas
  shared/       # Shared utilities
  ui/           # UI components
```

### Key Concepts

- **Vault**: A workspace directory with isolated configuration (stored in `~/.acme/vaults/<vaultId>`)
- **Thread**: A conversation session with an agent (Local/Worktree/Remote modes)
- **AgentRuntime**: Core logic managing multiple simultaneous agents

## Common Commands

```bash
# Install dependencies
bun install

# Run desktop app in dev mode
bun run dev:desktop

# Run tests for a specific package
bun test --filter @acme-ai/agent

# Run tests in watch mode
bun test --watch

# Lint code
bunx oxlint

# Format code
bunx oxfmt

# Typecheck
bunx tsc --noEmit

# Build desktop app
bun run --filter @acme-ai-app/desktop build

# Typecheck desktop app
bunx tsc --noEmit -p apps/desktop/tsconfig.json
```

## Code Conventions

- Private methods/fields use `_` prefix
- Use namespace to organize related types for a class
- Filenames use kebab-case
- One file should not contain multiple domains
- One method should not have multiple responsibilities

## Build Outputs

- Desktop app: `apps/desktop/out/`
- Build results are cached by Turborepo in `dist/**` and `out/**`
