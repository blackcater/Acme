# RFC 索引

本文档是 Acme 项目 RFC 文档的索引。

## 概述

本目录包含 Acme 项目的完整 RFC（Request for Comments）文档，涵盖系统架构、功能设计和技术规范。

## 文档列表

| 编号 | 文档 | 描述 |
|------|------|------|
| 001 | [Acme 架构概述](./001-acme-architecture.md) | 系统整体架构和核心组件 |
| 002 | [Vault 和项目系统](./002-vault-and-project.md) | Vault 和 Project 数据结构与层级关系 |
| 003 | [Thread 会话系统](./003-thread-system.md) | 会话管理、模式（Local/Worktree/Cloud） |
| 004 | [Agent 系统设计](./004-agent-system.md) | Agent 抽象层、多类型支持、权限配置 |
| 005 | [Provider 管理系统](./005-provider-system.md) | LLM Provider 抽象、API Key 管理 |
| 006 | [MCP 集成](./006-mcp-integration.md) | MCP 服务器支持（本地/远程） |
| 007 | [Skill 系统](./007-skill-system.md) | Agent 技能系统、触发规则 |
| 008 | [Command 系统](./008-command-system.md) | 自定义命令、快捷键绑定 |
| 009 | [权限和安全系统](./009-permission-security.md) | 权限模型、审批流程、沙箱隔离 |
| 010 | [UI/UX 设计规范](./010-ui-ux-design.md) | 界面布局、组件规范、主题系统 |
| 011 | [配置系统](./011-config-system.md) | 多层级配置、Schema 验证 |
| 012 | [ACP 协议支持](./012-acp-protocol.md) | ACP 协议客户端、第三方 Agent 接入 |
| 013 | [自动化任务](./013-automation.md) | 定时/事件/手动触发任务 |
| 014 | [Git 集成](./014-git-integration.md) | Git 操作、Diff 视图、PR 集成 |

## 快速开始

### 理解架构

1. 首先阅读 [001-acme-architecture.md](./001-acme-architecture.md) 了解整体架构
2. 阅读 [002-vault-and-project.md](./002-vault-and-project.md) 理解数据组织
3. 阅读 [003-thread-system.md](./003-thread-system.md) 理解会话模型

### 核心功能

4. 阅读 [004-agent-system.md](./004-agent-system.md) 了解 Agent 设计
5. 阅读 [005-provider-system.md](./005-provider-system.md) 了解 Provider 管理
6. 阅读 [006-mcp-integration.md](./006-mcp-integration.md) 了解 MCP 集成

### 扩展功能

7. 阅读 [007-skill-system.md](./007-skill-system.md) 了解 Skill 系统
8. 阅读 [008-command-system.md](./008-command-system.md) 了解 Command 系统
9. 阅读 [013-automation.md](./013-automation.md) 了解自动化

### 基础设施

10. 阅读 [009-permission-security.md](./009-permission-security.md) 了解权限系统
11. 阅读 [010-ui-ux-design.md](./010-ui-ux-design.md) 了解 UI 设计
12. 阅读 [011-config-system.md](./011-config-system.md) 了解配置系统
13. 阅读 [012-acp-protocol.md](./012-acp-protocol.md) 了解 ACP 支持
14. 阅读 [014-git-integration.md](./014-git-integration.md) 了解 Git 集成

## 技术栈参考

- **桌面应用**: Electron + React
- **CLI**: Node.js / Bun
- **AI 抽象**: AI SDK (Vercel)
- **协议**: ACP / MCP
- **样式**: Tailwind CSS + ShadCN
- **存储**: 本地文件系统

## 贡献

欢迎提交 RFC 提案：

1. 创建新 RFC 文档
2. 使用 [001-acme-architecture.md](./001-acme-architecture.md) 作为模板
3. 提交 Pull Request
