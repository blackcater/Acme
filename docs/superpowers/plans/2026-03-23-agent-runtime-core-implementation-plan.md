# AgentRuntime Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现 AgentRuntime 核心模块，包括统一 Agent 接口、三种 Agent 实现（ClaudeCodeAgent、CodexAgent、AcmexAgent）、AgentRuntime 服务、以及 Skill/MCP/Plugin/Command 运行时基础。

**Architecture:**
- `packages/core` - 核心类型定义和接口（已有部分）
- `packages/agent` - Agent 实现（claude-code、codex、acmex）
- `packages/runtime` - AgentRuntime 核心服务、配置管理、扩展运行时
- MVP 仅支持本地模式（AgentRuntime 运行在 Main 进程）

**Tech Stack:** TypeScript, @agentclientprotocol/sdk, vercel/ai, events

---

## File Structure

```
packages/
  core/
    src/
      index.ts                    # 导出所有核心类型
      agent/
        types.ts                   # Agent 接口定义 (扩展现有)
        events.ts                  # AgentEvent 类型定义
      thread/
        types.ts                   # Thread 相关类型 (已存在)
      vault/
        types.ts                   # Vault 类型定义
      skill/
        types.ts                   # Skill 类型定义
      tool/
        types.ts                   # Tool 类型定义

  agent/
    src/
      index.ts                     # 导出所有 Agent
      base/
        agent-base.ts              # Agent 基类，实现通用逻辑
      claude-code/
        index.ts
        claude-code-agent.ts       # Claude Code Agent 实现
      codex/
        index.ts
        codex-agent.ts             # Codex Agent 实现
      acmex/
        index.ts
        acmex-agent.ts             # Acmex Agent 实现 (基于 vercel/ai + pi-mono)

  runtime/
    src/
      index.ts                     # 导出 AgentRuntime
      runtime/
        agent-runtime.ts           # AgentRuntime 主类
        types.ts                   # Runtime 类型
      config/
        config-manager.ts          # 配置管理
        types.ts                   # 配置类型
      skills/
        skill-runner.ts           # Skill 运行时
        loader.ts                  # Skill 加载器
      commands/
        command-runner.ts          # Command 运行时
        loader.ts                  # Command 加载器
      plugins/
        plugin-runner.ts           # Plugin 运行时
        loader.ts                  # Plugin 加载器
      mcp/
        mcp-runner.ts             # MCP Server 运行时
        loader.ts                  # MCP Server 加载器
```

---

## Task 1: 扩展 Core Agent 类型

**Files:**
- Modify: `packages/core/src/agent/types.ts:1-20`
- Modify: `packages/core/src/agent/index.ts`
- Create: `packages/core/src/agent/events.ts`
- Create: `packages/core/src/vault/types.ts`
- Create: `packages/core/src/skill/types.ts`
- Create: `packages/core/src/tool/types.ts`

- [ ] **Step 1: Read existing agent types**

```bash
cat packages/core/src/agent/types.ts
```

- [ ] **Step 2: 扩展 Agent 接口，添加统一 Agent 接口**

```typescript
// packages/core/src/agent/types.ts

/**
 * Agent 类型枚举
 */
export enum AgentType {
  ClaudeCode = 'claude-code',
  Codex = 'codex',
  Acmex = 'acmex',
}

/**
 * Agent 模式
 */
export interface AgentMode {
  value: string
  label: string
  description?: string
}

/**
 * 统一的 Agent 接口
 * 所有 Agent 实现必须实现此接口
 */
export interface IAgent {
  readonly id: string
  readonly name: string
  readonly type: AgentType

  /** 启动 Agent */
  start(): Promise<void>

  /** 停止 Agent */
  stop(): Promise<void>

  /** 发送消息 */
  sendMessage(content: string): Promise<void>

  /** 订阅事件 */
  onEvent(handler: (event: AgentEvent) => void): () => void
}

/**
 * Agent 配置
 */
export interface AgentConfig {
  id?: string
  name: string
  type: AgentType
  mode: AgentMode
  providerId?: string
}

/**
 * 扩展现有 Agent 接口
 */
export interface Agent {
  id: string
  name: string
  type: AgentType
  mode: AgentMode
  providerId?: string
  createdAt: Date
  updatedAt: Date
}
```

- [ ] **Step 3: 创建 AgentEvent 类型定义**

```typescript
// packages/core/src/agent/events.ts

export type AgentEvent =
  // Agent 生命周期
  | { type: 'agent_start' }
  | { type: 'agent_end' }
  | { type: 'agent_error'; error: string }
  // Turn 生命周期
  | { type: 'turn_start' }
  | { type: 'turn_end' }
  // 消息生命周期
  | { type: 'message_start'; message: Message }
  | { type: 'message_update'; message: Message; delta: string }
  | { type: 'message_end'; message: Message }
  // Tool 执行生命周期
  | { type: 'tool_execution_start'; toolCallId: string; toolName: string; args: unknown }
  | { type: 'tool_execution_update'; toolCallId: string; partialResult: unknown }
  | { type: 'tool_execution_end'; toolCallId: string; result: unknown; isError: boolean }

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt: Date
}
```

- [ ] **Step 4: 创建 Vault 类型**

```typescript
// packages/core/src/vault/types.ts

export interface Vault {
  id: string
  name: string
  path: string
  createdAt: Date
  updatedAt: Date
}

export interface VaultSettings {
  skills?: string[]
  agents?: string[]
  plugins?: string[]
  commands?: string[]
  // 覆盖全局配置
  [key: string]: unknown
}
```

- [ ] **Step 5: 创建 Skill 类型**

```typescript
// packages/core/src/skill/types.ts

export interface Skill {
  id: string
  name: string
  description: string
  path: string
  enabled: boolean
}

export interface SkillManifest {
  name: string
  description: string
  version: string
  main: string
  tools?: string[]
  commands?: string[]
}
```

- [ ] **Step 6: 创建 Tool 类型**

```typescript
// packages/core/src/tool/types.ts

export interface Tool {
  name: string
  description: string
  inputSchema: Record<string, unknown>
}

export interface ToolCall {
  id: string
  toolName: string
  input: Record<string, unknown>
  output?: string
  createdAt: Date
}
```

- [ ] **Step 7: 更新 agent/index.ts 导出**

```typescript
// packages/core/src/agent/index.ts
export * from './types'
export * from './events'
```

- [ ] **Step 8: 更新 core index.ts 导出**

```typescript
// packages/core/src/index.ts
export * from './agent'
export * from './channel'
export * from './error'
export * from './llm'
export * from './mcp'
export * from './provider'
export * from './skill'
export * from './source'
export * from './thread'
export * from './tool'
export * from './vault'
```

- [ ] **Step 9: Commit**

```bash
git add packages/core/src/agent/types.ts packages/core/src/agent/events.ts packages/core/src/vault/types.ts packages/core/src/skill/types.ts packages/core/src/tool/types.ts
git commit -m "feat(core): add Agent interface and event types"
```

---

## Task 2: 实现 Agent 基类

**Files:**
- Create: `packages/agent/src/base/agent-base.ts`
- Create: `packages/agent/src/base/index.ts`

- [ ] **Step 1: 实现 Agent 基类**

```typescript
// packages/agent/src/base/agent-base.ts

import type { IAgent, AgentEvent, AgentType } from '@acme-ai/core'

/**
 * Agent 事件处理器类型
 */
type AgentEventHandler = (event: AgentEvent) => void

/**
 * Agent 基类，实现通用逻辑
 */
export abstract class AgentBase implements IAgent {
  readonly id: string
  readonly name: string
  readonly type: AgentType

  protected _started = false
  protected _handlers: Set<AgentEventHandler> = new Set()

  constructor(id: string, name: string, type: AgentType) {
    this.id = id
    this.name = name
    this.type = type
  }

  get started(): boolean {
    return this._started
  }

  /**
   * 启动 Agent
   */
  async start(): Promise<void> {
    if (this._started) return
    this._started = true
    this._emit({ type: 'agent_start' })
  }

  /**
   * 停止 Agent
   */
  async stop(): Promise<void> {
    if (!this._started) return
    this._started = false
    this._emit({ type: 'agent_end' })
  }

  /**
   * 发送消息 - 子类实现
   */
  abstract sendMessage(content: string): Promise<void>

  /**
   * 订阅事件
   * @returns 取消订阅函数
   */
  onEvent(handler: AgentEventHandler): () => void {
    this._handlers.add(handler)
    return () => {
      this._handlers.delete(handler)
    }
  }

  /**
   * 发送事件给所有订阅者
   */
  protected _emit(event: AgentEvent): void {
    for (const handler of this._handlers) {
      try {
        handler(event)
      } catch (error) {
        console.error('Error in agent event handler:', error)
      }
    }
  }
}
```

- [ ] **Step 2: 创建 index.ts**

```typescript
// packages/agent/src/base/index.ts
export * from './agent-base'
```

- [ ] **Step 3: Commit**

```bash
git add packages/agent/src/base/
git commit -m "feat(agent): add AgentBase abstract class"
```

---

## Task 3: 实现 ClaudeCodeAgent

**Files:**
- Create: `packages/agent/src/claude-code/claude-code-agent.ts`
- Create: `packages/agent/src/claude-code/index.ts`

- [ ] **Step 1: 实现 ClaudeCodeAgent**

```typescript
// packages/agent/src/claude-code/claude-code-agent.ts

import { AgentBase } from '../base/agent-base'
import { AgentType } from '@acme-ai/core'
import type { AgentEvent, Message } from '@acme-ai/core'

/**
 * Claude Code Agent 配置
 */
export interface ClaudeCodeAgentConfig {
  id?: string
  name?: string
  workingDirectory?: string
}

/**
 * Claude Code Agent
 * 基于 Claude Code Agent SDK 实现
 */
export class ClaudeCodeAgent extends AgentBase {
  private _config: ClaudeCodeAgentConfig

  constructor(config: ClaudeCodeAgentConfig = {}) {
    const id = config.id || `claude-code-${Date.now()}`
    const name = config.name || 'Claude Code'
    super(id, name, AgentType.ClaudeCode)
    this._config = config
  }

  async sendMessage(content: string): Promise<void> {
    if (!this._started) {
      throw new Error('Agent not started')
    }

    this._emit({
      type: 'message_start',
      message: {
        id: `msg-${Date.now()}`,
        role: 'user',
        content,
        createdAt: new Date(),
      },
    })

    // TODO: 集成 Claude Code Agent SDK
    // 这里需要根据 SDK 的实际 API 实现
    // 示例伪代码：
    // const session = await claudeCode.createSession({
    //   workingDirectory: this._config.workingDirectory,
    // })
    // const response = await session.sendMessage(content)
  }
}
```

- [ ] **Step 2: 创建 index.ts**

```typescript
// packages/agent/src/claude-code/index.ts
export * from './claude-code-agent'
```

- [ ] **Step 3: Commit**

```bash
git add packages/agent/src/claude-code/
git commit -m "feat(agent): add ClaudeCodeAgent implementation"
```

---

## Task 4: 实现 CodexAgent

**Files:**
- Create: `packages/agent/src/codex/codex-agent.ts`
- Create: `packages/agent/src/codex/index.ts`

- [ ] **Step 1: 实现 CodexAgent**

```typescript
// packages/agent/src/codex/codex-agent.ts

import { AgentBase } from '../base/agent-base'
import { AgentType } from '@acme-ai/core'
import type { AgentEvent, Message } from '@acme-ai/core'

/**
 * Codex Agent 配置
 */
export interface CodexAgentConfig {
  id?: string
  name?: string
  model?: string
  workingDirectory?: string
}

/**
 * Codex Agent
 * 基于 OpenAI Agent SDK 实现
 */
export class CodexAgent extends AgentBase {
  private _config: CodexAgentConfig

  constructor(config: CodexAgentConfig = {}) {
    const id = config.id || `codex-${Date.now()}`
    const name = config.name || 'Codex'
    super(id, name, AgentType.Codex)
    this._config = config
  }

  async sendMessage(content: string): Promise<void> {
    if (!this._started) {
      throw new Error('Agent not started')
    }

    this._emit({
      type: 'message_start',
      message: {
        id: `msg-${Date.now()}`,
        role: 'user',
        content,
        createdAt: new Date(),
      },
    })

    // TODO: 集成 OpenAI Agent SDK
    // 这里需要根据 SDK 的实际 API 实现
  }
}
```

- [ ] **Step 2: 创建 index.ts**

```typescript
// packages/agent/src/codex/index.ts
export * from './codex-agent'
```

- [ ] **Step 3: Commit**

```bash
git add packages/agent/src/codex/
git commit -m "feat(agent): add CodexAgent implementation"
```

---

## Task 5: 实现 AcmexAgent

**Files:**
- Create: `packages/agent/src/acmex/acmex-agent.ts`
- Create: `packages/agent/src/acmex/index.ts`

- [ ] **Step 1: 实现 AcmexAgent**

```typescript
// packages/agent/src/acmex/acmex-agent.ts

import { AgentBase } from '../base/agent-base'
import { AgentType } from '@acme-ai/core'
import type { AgentEvent, Message } from '@acme-ai/core'

/**
 * Acmex Agent 配置
 * 基于 vercel/ai + 仿 pi-mono 实现
 */
export interface AcmexAgentConfig {
  id?: string
  name?: string
  model?: string
  apiKey?: string
  baseURL?: string
  workingDirectory?: string
}

/**
 * Acmex Agent
 * 自研 Agent，模型访问使用 vercel/ai
 */
export class AcmexAgent extends AgentBase {
  private _config: AcmexAgentConfig

  constructor(config: AcmexAgentConfig = {}) {
    const id = config.id || `acmex-${Date.now()}`
    const name = config.name || 'Acmex'
    super(id, name, AgentType.Acmex)
    this._config = config
  }

  async sendMessage(content: string): Promise<void> {
    if (!this._started) {
      throw new Error('Agent not started')
    }

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      createdAt: new Date(),
    }

    this._emit({
      type: 'message_start',
      message: userMessage,
    })

    // TODO: 集成 vercel/ai 实现
    // 参考 pi-mono 的 agent-loop.ts 实现
    // 使用 streamSimple 或类似 API
  }
}
```

- [ ] **Step 2: 创建 index.ts**

```typescript
// packages/agent/src/acmex/index.ts
export * from './acmex-agent'
```

- [ ] **Step 3: 更新 agent/index.ts 导出所有 Agent**

```typescript
// packages/agent/src/index.ts
export * from './base'
export * from './claude-code'
export * from './codex'
export * from './acmex'
```

- [ ] **Step 4: Commit**

```bash
git add packages/agent/src/acmex/ packages/agent/src/index.ts
git commit -m "feat(agent): add AcmexAgent implementation"
```

---

## Task 6: 实现 ConfigManager

**Files:**
- Create: `packages/runtime/src/config/config-manager.ts`
- Create: `packages/runtime/src/config/types.ts`
- Create: `packages/runtime/src/config/index.ts`

- [ ] **Step 1: 创建配置类型**

```typescript
// packages/runtime/src/config/types.ts

export interface GlobalSettings {
  provider?: ProviderSettings
  mcpServers?: McpServerConfig[]
  ui?: UiSettings
  skills?: string[]
  agents?: string[]
  plugins?: string[]
  commands?: string[]
  [key: string]: unknown
}

export interface ProviderSettings {
  apiKey?: string
  baseURL?: string
  model?: string
  timeout?: number
  maxRetries?: number
}

export interface McpServerConfig {
  name: string
  command: string
  args?: string[]
  env?: Record<string, string>
}

export interface UiSettings {
  theme?: 'light' | 'dark' | 'system'
  fontSize?: number
}
```

- [ ] **Step 2: 实现 ConfigManager**

```typescript
// packages/runtime/src/config/config-manager.ts

import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import type { GlobalSettings, VaultSettings } from './types'

const DEFAULT_SETTINGS: GlobalSettings = {
  ui: { theme: 'system' },
}

export class ConfigManager {
  private _homeDir: string
  private _globalSettings: GlobalSettings | null = null
  private _vaultSettings: Map<string, VaultSettings> = new Map()

  constructor(homeDir: string) {
    this._homeDir = homeDir
  }

  /**
   * 获取全局配置
   */
  async getGlobalSettings(): Promise<GlobalSettings> {
    if (this._globalSettings) {
      return this._globalSettings
    }

    const settingsPath = join(this._homeDir, 'settings.json')

    try {
      const content = await readFile(settingsPath, 'utf-8')
      this._globalSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(content) }
    } catch {
      this._globalSettings = { ...DEFAULT_SETTINGS }
    }

    return this._globalSettings
  }

  /**
   * 保存全局配置
   */
  async saveGlobalSettings(settings: GlobalSettings): Promise<void> {
    const settingsPath = join(this._homeDir, 'settings.json')
    await this._ensureDir(this._homeDir)
    await writeFile(settingsPath, JSON.stringify(settings, null, 2), 'utf-8')
    this._globalSettings = settings
  }

  /**
   * 获取 Vault 配置
   */
  async getVaultSettings(vaultId: string): Promise<VaultSettings> {
    if (this._vaultSettings.has(vaultId)) {
      return this._vaultSettings.get(vaultId)!
    }

    const vaultPath = join(this._homeDir, 'vaults', vaultId)
    const settingsPath = join(vaultPath, 'settings.json')

    try {
      const content = await readFile(settingsPath, 'utf-8')
      const settings = JSON.parse(content) as VaultSettings
      this._vaultSettings.set(vaultId, settings)
      return settings
    } catch {
      return {}
    }
  }

  /**
   * 保存 Vault 配置
   */
  async saveVaultSettings(vaultId: string, settings: VaultSettings): Promise<void> {
    const vaultPath = join(this._homeDir, 'vaults', vaultId)
    const settingsPath = join(vaultPath, 'settings.json')
    await this._ensureDir(vaultPath)
    await writeFile(settingsPath, JSON.stringify(settings, null, 2), 'utf-8')
    this._vaultSettings.set(vaultId, settings)
  }

  /**
   * 获取合并后的配置（Vault 配置覆盖全局配置）
   */
  async getMergedSettings(vaultId: string): Promise<GlobalSettings & VaultSettings> {
    const globalSettings = await this.getGlobalSettings()
    const vaultSettings = await this.getVaultSettings(vaultId)
    return { ...globalSettings, ...vaultSettings }
  }

  private async _ensureDir(dir: string): Promise<void> {
    try {
      await mkdir(dir, { recursive: true })
    } catch {
      // Ignore
    }
  }
}
```

- [ ] **Step 3: 创建 index.ts**

```typescript
// packages/runtime/src/config/index.ts
export * from './config-manager'
export * from './types'
```

- [ ] **Step 4: Commit**

```bash
git add packages/runtime/src/config/
git commit -m "feat(runtime): add ConfigManager for settings management"
```

---

## Task 7: 实现 AgentRuntime 主类

**Files:**
- Create: `packages/runtime/src/runtime/agent-runtime.ts`
- Create: `packages/runtime/src/runtime/types.ts`
- Create: `packages/runtime/src/runtime/index.ts`

- [ ] **Step 1: 创建 Runtime 类型**

```typescript
// packages/runtime/src/runtime/types.ts

import type { IAgent, AgentEvent } from '@acme-ai/core'

export interface RuntimeConfig {
  homeDir: string
}

export interface ThreadRuntime {
  id: string
  agent: IAgent
  vaultId: string
  messages: AgentEvent[]
}
```

- [ ] **Step 2: 实现 AgentRuntime**

```typescript
// packages/runtime/src/runtime/agent-runtime.ts

import type { IAgent, AgentEvent, AgentType, AgentConfig } from '@acme-ai/core'
import { ConfigManager } from '../config/config-manager'
import type { RuntimeConfig, ThreadRuntime } from './types'

export class AgentRuntime {
  private _config: RuntimeConfig
  private _configManager: ConfigManager
  private _agents: Map<string, IAgent> = new Map()
  private _threads: Map<string, ThreadRuntime> = new Map()
  private _started = false

  constructor(config: RuntimeConfig) {
    this._config = config
    this._configManager = new ConfigManager(config.homeDir)
  }

  get configManager(): ConfigManager {
    return this._configManager
  }

  get started(): boolean {
    return this._started
  }

  /**
   * 启动 Runtime
   */
  async start(): Promise<void> {
    if (this._started) return
    this._started = true
  }

  /**
   * 停止 Runtime
   */
  async stop(): Promise<void> {
    if (!this._started) return

    // 停止所有线程
    for (const thread of this._threads.values()) {
      await thread.agent.stop()
    }
    this._threads.clear()

    // 停止所有 Agent
    for (const agent of this._agents.values()) {
      await agent.stop()
    }
    this._agents.clear()

    this._started = false
  }

  /**
   * 注册 Agent
   */
  registerAgent(agent: IAgent): void {
    this._agents.set(agent.id, agent)
  }

  /**
   * 注销 Agent
   */
  unregisterAgent(agentId: string): void {
    this._agents.delete(agentId)
  }

  /**
   * 获取 Agent
   */
  getAgent(agentId: string): IAgent | undefined {
    return this._agents.get(agentId)
  }

  /**
   * 列出所有 Agent
   */
  listAgents(): IAgent[] {
    return Array.from(this._agents.values())
  }

  /**
   * 创建 Thread
   */
  createThread(vaultId: string, agentId: string): string {
    const agent = this._agents.get(agentId)
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`)
    }

    const threadId = `thread-${Date.now()}`
    this._threads.set(threadId, {
      id: threadId,
      agent,
      vaultId,
      messages: [],
    })

    return threadId
  }

  /**
   * 获取 Thread
   */
  getThread(threadId: string): ThreadRuntime | undefined {
    return this._threads.get(threadId)
  }

  /**
   * 发送消息到 Thread
   */
  async sendMessage(threadId: string, content: string): Promise<void> {
    const thread = this._threads.get(threadId)
    if (!thread) {
      throw new Error(`Thread not found: ${threadId}`)
    }

    await thread.agent.sendMessage(content)
  }

  /**
   * 销毁 Thread
   */
  async destroyThread(threadId: string): Promise<void> {
    const thread = this._threads.get(threadId)
    if (thread) {
      await thread.agent.stop()
      this._threads.delete(threadId)
    }
  }
}
```

- [ ] **Step 3: 创建 index.ts**

```typescript
// packages/runtime/src/runtime/index.ts
export * from './agent-runtime'
export * from './types'
```

- [ ] **Step 4: 更新 runtime index.ts**

```typescript
// packages/runtime/src/index.ts
export * from './runtime'
export * from './config'
```

- [ ] **Step 5: Commit**

```bash
git add packages/runtime/src/runtime/ packages/runtime/src/index.ts
git commit -m "feat(runtime): add AgentRuntime core class"
```

---

## Task 8: 实现 Skill Loader（基础）

**Files:**
- Create: `packages/runtime/src/skills/skill-loader.ts`
- Create: `packages/runtime/src/skills/skill-runner.ts`
- Create: `packages/runtime/src/skills/index.ts`

- [ ] **Step 1: 实现 SkillLoader**

```typescript
// packages/runtime/src/skills/skill-loader.ts

import { readdir, readFile } from 'fs/promises'
import { join } from 'path'
import type { Skill, SkillManifest } from '@acme-ai/core'

export class SkillLoader {
  constructor() {}

  /**
   * 加载目录下的所有 Skills
   */
  async loadSkills(skillsPath: string): Promise<Skill[]> {
    const skills: Skill[] = []

    try {
      const entries = await readdir(skillsPath, { withFileTypes: true })

      for (const entry of entries) {
        if (!entry.isDirectory()) continue

        const skillPath = join(skillsPath, entry.name)
        const manifestPath = join(skillPath, 'SKILL.md')

        try {
          // 验证 SKILL.md 是否存在
          await readFile(manifestPath, 'utf-8')

          const skill: Skill = {
            id: entry.name,
            name: entry.name,
            description: '',
            path: skillPath,
            enabled: true,
          }

          skills.push(skill)
        } catch {
          // 跳过无效的 Skill
        }
      }
    } catch {
      // 目录不存在，返回空数组
    }

    return skills
  }

  /**
   * 加载单个 Skill 的 Manifest
   */
  async loadManifest(skillPath: string): Promise<SkillManifest | null> {
    const manifestPath = join(skillPath, 'SKILL.md')

    try {
      const content = await readFile(manifestPath, 'utf-8')
      // SKILL.md 是 Markdown，解析其中的元数据
      // TODO: 实现真正的解析逻辑
      return null
    } catch {
      return null
    }
  }
}
```

- [ ] **Step 2: 实现 SkillRunner（基础）**

```typescript
// packages/runtime/src/skills/skill-runner.ts

import type { Skill } from '@acme-ai/core'
import { SkillLoader } from './skill-loader'

export class SkillRunner {
  private _loader: SkillLoader
  private _skills: Map<string, Skill> = new Map()

  constructor() {
    this._loader = new SkillLoader()
  }

  /**
   * 加载 Skills
   */
  async loadSkills(skillsPath: string): Promise<Skill[]> {
    const skills = await this._loader.loadSkills(skillsPath)
    for (const skill of skills) {
      this._skills.set(skill.id, skill)
    }
    return skills
  }

  /**
   * 获取 Skill
   */
  getSkill(id: string): Skill | undefined {
    return this._skills.get(id)
  }

  /**
   * 列出所有 Skills
   */
  listSkills(): Skill[] {
    return Array.from(this._skills.values())
  }
}
```

- [ ] **Step 3: 创建 index.ts**

```typescript
// packages/runtime/src/skills/index.ts
export * from './skill-loader'
export * from './skill-runner'
```

- [ ] **Step 4: Commit**

```bash
git add packages/runtime/src/skills/
git commit -m "feat(runtime): add Skill loader and runner"
```

---

## Task 9: 实现 Command Runner（基础）

**Files:**
- Create: `packages/runtime/src/commands/command-runner.ts`
- Create: `packages/runtime/src/commands/loader.ts`
- Create: `packages/runtime/src/commands/index.ts`

- [ ] **Step 1: 实现 Command 类型**

```typescript
// packages/runtime/src/commands/types.ts

export interface Command {
  id: string
  name: string
  description: string
  handler: (args: string[]) => Promise<string>
}
```

- [ ] **Step 2: 实现 CommandLoader**

```typescript
// packages/runtime/src/commands/loader.ts

import { readdir } from 'fs/promises'
import { join } from 'path'
import type { Command } from './types'

export class CommandLoader {
  constructor() {}

  /**
   * 加载目录下的所有 Commands
   */
  async loadCommands(commandsPath: string): Promise<Command[]> {
    const commands: Command[] = []

    try {
      const entries = await readdir(commandsPath, { withFileTypes: true })

      for (const entry of entries) {
        if (!entry.isDirectory()) continue

        const commandPath = join(commandsPath, entry.name)

        const command: Command = {
          id: entry.name,
          name: entry.name,
          description: '',
          handler: async () => 'Not implemented',
        }

        commands.push(command)
      }
    } catch {
      // 目录不存在
    }

    return commands
  }
}
```

- [ ] **Step 3: 实现 CommandRunner**

```typescript
// packages/runtime/src/commands/command-runner.ts

import type { Command } from './types'
import { CommandLoader } from './loader'

export class CommandRunner {
  private _loader: CommandLoader
  private _commands: Map<string, Command> = new Map()

  constructor() {
    this._loader = new CommandLoader()
  }

  /**
   * 加载 Commands
   */
  async loadCommands(commandsPath: string): Promise<Command[]> {
    const commands = await this._loader.loadCommands(commandsPath)
    for (const command of commands) {
      this._commands.set(command.name, command)
    }
    return commands
  }

  /**
   * 执行 Command
   */
  async execute(name: string, args: string[] = []): Promise<string> {
    const command = this._commands.get(name)
    if (!command) {
      throw new Error(`Command not found: ${name}`)
    }
    return command.handler(args)
  }

  /**
   * 获取 Command
   */
  getCommand(name: string): Command | undefined {
    return this._commands.get(name)
  }

  /**
   * 列出所有 Commands
   */
  listCommands(): Command[] {
    return Array.from(this._commands.values())
  }
}
```

- [ ] **Step 4: 创建 index.ts**

```typescript
// packages/runtime/src/commands/index.ts
export * from './command-runner'
export * from './loader'
export * from './types'
```

- [ ] **Step 5: Commit**

```bash
git add packages/runtime/src/commands/
git commit -m "feat(runtime): add Command loader and runner"
```

---

## Task 10: 实现 Plugin Runner（基础）

**Files:**
- Create: `packages/runtime/src/plugins/plugin-runner.ts`
- Create: `packages/runtime/src/plugins/loader.ts`
- Create: `packages/runtime/src/plugins/index.ts`

- [ ] **Step 1: 实现 Plugin 类型**

```typescript
// packages/runtime/src/plugins/types.ts

export interface Plugin {
  id: string
  name: string
  version: string
  enabled: boolean
  onLoad?: () => Promise<void>
  onUnload?: () => Promise<void>
}
```

- [ ] **Step 2: 实现 PluginLoader**

```typescript
// packages/runtime/src/plugins/loader.ts

import { readdir } from 'fs/promises'
import { join } from 'path'
import type { Plugin } from './types'

export class PluginLoader {
  constructor() {}

  /**
   * 加载目录下的所有 Plugins
   */
  async loadPlugins(pluginsPath: string): Promise<Plugin[]> {
    const plugins: Plugin[] = []

    try {
      const entries = await readdir(pluginsPath, { withFileTypes: true })

      for (const entry of entries) {
        if (!entry.isDirectory()) continue

        const pluginPath = join(pluginsPath, entry.name)

        const plugin: Plugin = {
          id: entry.name,
          name: entry.name,
          version: '0.0.1',
          enabled: true,
        }

        plugins.push(plugin)
      }
    } catch {
      // 目录不存在
    }

    return plugins
  }
}
```

- [ ] **Step 3: 实现 PluginRunner**

```typescript
// packages/runtime/src/plugins/plugin-runner.ts

import type { Plugin } from './types'
import { PluginLoader } from './loader'

export class PluginRunner {
  private _loader: PluginLoader
  private _plugins: Map<string, Plugin> = new Map()

  constructor() {
    this._loader = new PluginLoader()
  }

  /**
   * 加载 Plugins
   */
  async loadPlugins(pluginsPath: string): Promise<Plugin[]> {
    const plugins = await this._loader.loadPlugins(pluginsPath)
    for (const plugin of plugins) {
      this._plugins.set(plugin.id, plugin)
    }
    return plugins
  }

  /**
   * 启用 Plugin
   */
  async enablePlugin(id: string): Promise<void> {
    const plugin = this._plugins.get(id)
    if (plugin) {
      plugin.enabled = true
      await plugin.onLoad?.()
    }
  }

  /**
   * 禁用 Plugin
   */
  async disablePlugin(id: string): Promise<void> {
    const plugin = this._plugins.get(id)
    if (plugin) {
      plugin.enabled = false
      await plugin.onUnload?.()
    }
  }

  /**
   * 获取 Plugin
   */
  getPlugin(id: string): Plugin | undefined {
    return this._plugins.get(id)
  }

  /**
   * 列出所有 Plugins
   */
  listPlugins(): Plugin[] {
    return Array.from(this._plugins.values())
  }
}
```

- [ ] **Step 4: 创建 index.ts**

```typescript
// packages/runtime/src/plugins/index.ts
export * from './plugin-runner'
export * from './loader'
export * from './types'
```

- [ ] **Step 5: Commit**

```bash
git add packages/runtime/src/plugins/
git commit -m "feat(runtime): add Plugin loader and runner"
```

---

## Task 11: 实现 MCP Runner（基础）

**Files:**
- Create: `packages/runtime/src/mcp/mcp-runner.ts`
- Create: `packages/runtime/src/mcp/loader.ts`
- Create: `packages/runtime/src/mcp/index.ts`

- [ ] **Step 1: 实现 McpServer 类型**

```typescript
// packages/runtime/src/mcp/types.ts

export interface McpServer {
  id: string
  name: string
  command: string
  args?: string[]
  env?: Record<string, string>
  running: boolean
}

export interface McpTool {
  name: string
  description: string
  inputSchema: Record<string, unknown>
}
```

- [ ] **Step 2: 实现 McpRunner**

```typescript
// packages/runtime/src/mcp/mcp-runner.ts

import { spawn, ChildProcess } from 'child_process'
import type { McpServer, McpTool } from './types'

export class McpRunner {
  private _servers: Map<string, McpServer> = new Map()
  private _processes: Map<string, ChildProcess> = new Map()

  constructor() {}

  /**
   * 添加 MCP Server
   */
  addServer(server: McpServer): void {
    this._servers.set(server.id, server)
  }

  /**
   * 启动 MCP Server
   */
  async startServer(id: string): Promise<void> {
    const server = this._servers.get(id)
    if (!server) {
      throw new Error(`MCP Server not found: ${id}`)
    }

    if (server.running) return

    const proc = spawn(server.command, server.args || [], {
      env: { ...process.env, ...server.env },
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    this._processes.set(id, proc)
    server.running = true
  }

  /**
   * 停止 MCP Server
   */
  async stopServer(id: string): Promise<void> {
    const server = this._servers.get(id)
    const proc = this._processes.get(id)

    if (proc) {
      proc.kill()
      this._processes.delete(id)
    }

    if (server) {
      server.running = false
    }
  }

  /**
   * 获取 Server
   */
  getServer(id: string): McpServer | undefined {
    return this._servers.get(id)
  }

  /**
   * 列出所有 Servers
   */
  listServers(): McpServer[] {
    return Array.from(this._servers.values())
  }

  /**
   * 列出所有运行中的 Servers
   */
  listRunningServers(): McpServer[] {
    return this.listServers().filter((s) => s.running)
  }
}
```

- [ ] **Step 3: 创建 index.ts**

```typescript
// packages/runtime/src/mcp/index.ts
export * from './mcp-runner'
export * from './types'
```

- [ ] **Step 4: Commit**

```bash
git add packages/runtime/src/mcp/
git commit -m "feat(runtime): add MCP server runner"
```

---

## Task 12: 更新 Runtime 主类集成所有运行时

**Files:**
- Modify: `packages/runtime/src/runtime/agent-runtime.ts`

- [ ] **Step 1: 更新 AgentRuntime 集成所有扩展运行时**

```typescript
// packages/runtime/src/runtime/agent-runtime.ts

import type { IAgent, AgentEvent, AgentType, AgentConfig } from '@acme-ai/core'
import { ConfigManager } from '../config/config-manager'
import { SkillRunner } from '../skills/skill-runner'
import { CommandRunner } from '../commands/command-runner'
import { PluginRunner } from '../plugins/plugin-runner'
import { McpRunner } from '../mcp/mcp-runner'
import type { RuntimeConfig, ThreadRuntime } from './types'

export class AgentRuntime {
  private _config: RuntimeConfig
  private _configManager: ConfigManager
  private _agents: Map<string, IAgent> = new Map()
  private _threads: Map<string, ThreadRuntime> = new Map()
  private _started = false

  // 扩展运行时
  readonly skills: SkillRunner
  readonly commands: CommandRunner
  readonly plugins: PluginRunner
  readonly mcp: McpRunner

  constructor(config: RuntimeConfig) {
    this._config = config
    this._configManager = new ConfigManager(config.homeDir)
    this.skills = new SkillRunner()
    this.commands = new CommandRunner()
    this.plugins = new PluginRunner()
    this.mcp = new McpRunner()
  }

  get configManager(): ConfigManager {
    return this._configManager
  }

  get started(): boolean {
    return this._started
  }

  /**
   * 启动 Runtime
   */
  async start(): Promise<void> {
    if (this._started) return
    this._started = true

    // 加载全局扩展
    const settings = await this._configManager.getGlobalSettings()

    // 加载 Skills
    const globalSkillsPath = `${this._config.homeDir}/skills`
    await this.skills.loadSkills(globalSkillsPath)

    // 加载 Commands
    const globalCommandsPath = `${this._config.homeDir}/commands`
    await this.commands.loadCommands(globalCommandsPath)

    // 加载 Plugins
    const globalPluginsPath = `${this._config.homeDir}/plugins`
    await this.plugins.loadPlugins(globalPluginsPath)

    // 加载 MCP Servers
    if (settings.mcpServers) {
      for (const server of settings.mcpServers) {
        this.mcp.addServer({
          id: server.name,
          name: server.name,
          command: server.command,
          args: server.args,
          env: server.env,
          running: false,
        })
      }
    }
  }

  /**
   * 停止 Runtime
   */
  async stop(): Promise<void> {
    if (!this._started) return

    // 停止所有 MCP Servers
    for (const server of this.mcp.listRunningServers()) {
      await this.mcp.stopServer(server.id)
    }

    // 停止所有线程
    for (const thread of this._threads.values()) {
      await thread.agent.stop()
    }
    this._threads.clear()

    // 停止所有 Agent
    for (const agent of this._agents.values()) {
      await agent.stop()
    }
    this._agents.clear()

    this._started = false
  }

  /**
   * 注册 Agent
   */
  registerAgent(agent: IAgent): void {
    this._agents.set(agent.id, agent)
  }

  /**
   * 注销 Agent
   */
  unregisterAgent(agentId: string): void {
    this._agents.delete(agentId)
  }

  /**
   * 获取 Agent
   */
  getAgent(agentId: string): IAgent | undefined {
    return this._agents.get(agentId)
  }

  /**
   * 列出所有 Agent
   */
  listAgents(): IAgent[] {
    return Array.from(this._agents.values())
  }

  /**
   * 创建 Thread
   */
  createThread(vaultId: string, agentId: string): string {
    const agent = this._agents.get(agentId)
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`)
    }

    const threadId = `thread-${Date.now()}`
    this._threads.set(threadId, {
      id: threadId,
      agent,
      vaultId,
      messages: [],
    })

    return threadId
  }

  /**
   * 获取 Thread
   */
  getThread(threadId: string): ThreadRuntime | undefined {
    return this._threads.get(threadId)
  }

  /**
   * 发送消息到 Thread
   */
  async sendMessage(threadId: string, content: string): Promise<void> {
    const thread = this._threads.get(threadId)
    if (!thread) {
      throw new Error(`Thread not found: ${threadId}`)
    }

    await thread.agent.sendMessage(content)
  }

  /**
   * 销毁 Thread
   */
  async destroyThread(threadId: string): Promise<void> {
    const thread = this._threads.get(threadId)
    if (thread) {
      await thread.agent.stop()
      this._threads.delete(threadId)
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add packages/runtime/src/runtime/agent-runtime.ts
git commit -m "feat(runtime): integrate all runtimes into AgentRuntime"
```

---

## Task 13: 更新 runtime package exports

**Files:**
- Modify: `packages/runtime/src/index.ts`

- [ ] **Step 1: 更新 runtime index.ts 导出所有模块**

```typescript
// packages/runtime/src/index.ts
export * from './runtime'
export * from './config'
export * from './skills'
export * from './commands'
export * from './plugins'
export * from './mcp'
```

- [ ] **Step 2: Commit**

```bash
git add packages/runtime/src/index.ts
git commit -m "feat(runtime): export all runtime modules"
```

---

## Summary

完成后，你将拥有：

1. **Core 类型系统** - 扩展了 Agent 接口，添加了事件类型、Vault/Skill/Tool 类型
2. **Agent 基类** - 实现了通用的 Agent 基类，提供事件机制
3. **三种 Agent 实现** - ClaudeCodeAgent、CodexAgent、AcmexAgent（框架代码，待集成 SDK）
4. **AgentRuntime 核心** - 管理所有 Agent 和 Thread
5. **ConfigManager** - 管理全局和 Vault 配置
6. **扩展运行时** - Skill、Command、Plugin、MCP Runner（基础实现）

下一步可以考虑：
- Task 2: Vault & Thread 模型详细设计
- Task 3: 集成 Claude Code Agent SDK
- Task 4: 集成 OpenAI Agent SDK
- Task 5: 实现 AcmexAgent 的 vercel/ai 集成
