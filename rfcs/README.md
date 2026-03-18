# Acme RFC Index

This directory contains Request for Comments (RFC) documents for the Acme project.

## Overview

Acme is a desktop application for Code Agents, similar to Codex App and OpenCode. It provides:
- Multi-Vault project management
- Support for multiple Code Agents (Acme Agent, Claude Code, CodeX, ACP-compatible)
- Local-first data storage
- MCP protocol support

## RFC Documents

| RFC | Title | Status | Description |
|-----|-------|--------|-------------|
| [0001](./0001-acme-desktop-architecture.md) | Acme Desktop Application Architecture | Draft | Overall architecture, core concepts (Vault, Thread, Project), UI layout, IPC communication |
| [0002](./0002-agent-core-system.md) | Agent Core System Design | Draft | Agent interfaces, permission system, built-in tools, skills, commands |
| [0003](./0003-vault-project-management.md) | Vault and Project Management System | Draft | Data models, storage architecture, project operations |
| [0004](./0004-multi-window-thread-management.md) | Multi-Window and Thread Management | Draft | Window types, IPC communication, window state persistence |
| [0005](./0005-ui-ux-design-system.md) | UI/UX Design System | Draft | Color system, typography, component library, interaction patterns |
| [0006](./0006-configuration-system.md) | Configuration System Design | Draft | Multi-layer config, provider/agent/skill/MCP configuration |
| [0007](./0007-toolchain-integration.md) | Toolchain Integration | Draft | Git, terminal, LSP, security validation, MCP integration |
| [0008](./0008-data-layer-design.md) | Data Layer Design | Draft | SQLite schema, KV store, cache strategy, backup/sync |
| [0009](./0009-acp-protocol-design.md) | ACP Protocol Design | Draft | Agent Client Protocol, message types, transport, bridge |

## RFC Process

1. **Draft** - Initial proposal, open for discussion
2. **Review** - Being actively reviewed
3. **Accepted** - Approved for implementation
4. **Implemented** - Code has been written
5. **Deferred** - Postponed for later consideration
6. **Rejected** - Not accepted

## Quick Links

### Core Architecture
- [Architecture Overview](./0001-acme-desktop-architecture.md#architecture-overview)
- [Core Concepts](./0001-acme-desktop-architecture.md#core-concepts)
- [UI Layout](./0001-acme-desktop-architecture.md#ui-layout)

### Agent System
- [Agent Interfaces](./0002-agent-core-system.md#core-interfaces)
- [Permission System](./0002-agent-core-system.md#permission-system)
- [Built-in Tools](./0002-agent-core-system.md#built-in-tools)

### Data Management
- [Vault Model](./0003-vault-project-management.md#core-entities)
- [Database Schema](./0008-data-layer-design.md#database-schema)
- [Storage Architecture](./0008-data-layer-design.md#storage-architecture)

### UI/UX
- [Color System](./0005-ui-ux-design-system.md#color-system)
- [Typography](./0005-ui-ux-design-system.md#typography)
- [Component Library](./0005-ui-ux-design-system.md#component-library)

### Protocol
- [Message Types](./0009-acp-protocol-design.md#message-types)
- [Transport: STDIO](./0009-acp-protocol-design.md#transport-stdio)
- [ACP Bridge](./0009-acp-protocol-design.md#acp-bridge)

## Contributing

When creating a new RFC:
1. Copy the template below
2. Use the next available number (e.g., 0010)
3. Fill in all sections
4. Submit as a PR

## RFC Template

```markdown
# RFC XXXX: Title

## Summary
One paragraph description of the feature.

## Motivation
Why is this needed? What problem does it solve?

## Detailed Design
Technical specification and approach.

## Alternatives Considered
Other approaches that were considered.

## Implementation Plan
Phases and timeline for implementation.

## Open Questions
Unresolved issues and questions.
```

---

Last updated: 2026-03-18
