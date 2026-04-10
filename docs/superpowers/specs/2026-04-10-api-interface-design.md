# IPC API Interface Design

## Overview

Restructure the IPC communication layer in the desktop app to use explicit API interfaces for each handler. This improves type safety, separation of concerns, and makes the API contract between main and renderer processes explicit.

## Goals

1. Define all API types in `types/api.ts` under `namespace API`
2. Each handler implements its corresponding API interface
3. Preload uses `buildCallApi<API.FilesAPI>` instead of `buildCallApi<FilesHandler>`
4. Split `system.ts` into `WindowHandler` and `AppHandler`
5. Remove schema files (`files.schema.ts`, `git.schema.ts`) - types live in `namespace API`

## Directory Structure

```
apps/desktop/src/
├── types/
│   └── api.ts              # All API interface definitions (namespace API)
├── main/
│   └── handlers/
│       ├── browser.ts      # Implements BrowserAPI
│       ├── files.ts        # Implements FilesAPI
│       ├── git.ts          # Implements GitAPI
│       ├── window.ts       # Implements WindowAPI (new)
│       ├── app.ts          # Implements AppAPI (new, replaces system.ts)
│       └── index.ts        # Registers all handlers
├── preload/
│   ├── expose.ts           # Uses buildCallApi<API.xxxAPI>
│   └── preload.d.ts        # Imports API type
```

## Type Definitions

### `types/api.ts`

All types are defined in the `API` namespace with English comments:

```typescript
/**
 * Central type definitions for all IPC APIs exposed to the renderer.
 * Each API interface represents the public contract of a handler.
 * Handlers must implement their corresponding API interface.
 */

export namespace API {
  // ---------------------------------------------------------------------------
  // Files API - Types
  // ---------------------------------------------------------------------------

  /** Represents a file or directory node. */
  export interface FileNode {
    name: string
    path: string
    type: 'file' | 'directory'
    extension?: string
  }

  /** Search result for file queries. */
  export interface SearchResult {
    name: string
    path: string
    type: 'file' | 'directory'
  }

  /**
   * File system operations for browsing and searching files.
   */
  export interface FilesAPI {
    list(dirPath: string): Promise<{ files: FileNode[]; error?: string }>
    search(query: string, rootPath: string): Promise<{
      results: SearchResult[]
      skippedCount: number
    }>
  }

  // ---------------------------------------------------------------------------
  // Git API - Types
  // ---------------------------------------------------------------------------

  /** Git repository status. */
  export interface GitStatus {
    current: string | null
    tracking: string | null
    staged: string[]
    unstaged: string[]
    untracked: string[]
    conflicted: string[]
  }

  /** Git branch information. */
  export interface GitBranch {
    name: string
    current: boolean
  }

  /** Git log entry. */
  export interface GitLogEntry {
    hash: string
    date: string
    message: string
    author_name: string
    author_email: string
  }

  /**
   * Git version control operations.
   */
  export interface GitAPI {
    status(repoPath: string): Promise<GitStatus>
    branches(repoPath: string): Promise<GitBranch[]>
    currentBranch(repoPath: string): Promise<string>
    log(repoPath: string, count?: number): Promise<GitLogEntry[]>
    diffStat(repoPath: string): Promise<{ additions: number; deletions: number }>
    stage(repoPath: string, files: string[]): Promise<void>
    unstage(repoPath: string, files: string[]): Promise<void>
    stageAll(repoPath: string): Promise<void>
    unstageAll(repoPath: string): Promise<void>
    discard(repoPath: string, files: string[]): Promise<void>
    commit(repoPath: string, message: string): Promise<{ hash: string }>
    checkout(repoPath: string, branch: string): Promise<{ success: boolean }>
    createBranch(repoPath: string, name: string): Promise<void>
    push(repoPath: string): Promise<{ success: boolean; message?: string }>
    pull(repoPath: string): Promise<{ success: boolean; message?: string }>
    fetch(repoPath: string): Promise<void>
    generateCommitMessage(repoPath: string): Promise<string>
  }

  // ---------------------------------------------------------------------------
  // Browser API - Types
  // ---------------------------------------------------------------------------

  /** Information about a browser instance. */
  export interface BrowserInfo {
    id: string
    title: string
    url: string
    canGoBack: boolean
    canGoForward: boolean
  }

  /**
   * Browser view management for embedded web content.
   */
  export interface BrowserAPI {
    create(url?: string, options?: { width?: number; height?: number }): Promise<{ id: string }>
    destroy(id: string): Promise<void>
    list(): Promise<BrowserInfo[]>
    navigate(id: string, url: string): Promise<void>
    goBack(id: string): Promise<void>
    goForward(id: string): Promise<void>
    reload(id: string): Promise<void>
    stop(id: string): Promise<void>
    focus(id: string): Promise<void>
    screenshot(id: string): Promise<string>
    getAccessibilitySnapshot(id: string): Promise<Record<string, unknown> | null>
    clickElement(id: string, selector: string): Promise<void>
    fillElement(id: string, selector: string, value: string): Promise<void>
    selectOption(id: string, selector: string, value: string): Promise<void>
  }

  // ---------------------------------------------------------------------------
  // Window API
  // ---------------------------------------------------------------------------

  /**
   * Window lifecycle management.
   */
  export interface WindowAPI {
    createVault(vaultId: string): Promise<{ ok: boolean }>
    createPopup(threadId: string): Promise<{ ok: boolean }>
    close(windowName: string): Promise<{ ok: boolean }>
  }

  // ---------------------------------------------------------------------------
  // App API
  // ---------------------------------------------------------------------------

  /**
   * Application-level settings and state management.
   */
  export interface AppAPI {
    getLocale(): Promise<string>
    setLocale(locale: string): Promise<{ ok: boolean }>
    getBoolValue(key: 'firstLaunchDone'): Promise<boolean>
    setBoolValue(key: 'firstLaunchDone', value: boolean): Promise<void>
  }
}
```

## Handler Implementations

### FilesHandler

- Implements `API.FilesAPI`
- Imports types from `types/api.ts` (no schema file)
- All methods unchanged, only types updated

### GitHandler

- Implements `API.GitAPI`
- Imports types from `types/api.ts` (no schema file)
- All methods unchanged, only types updated

### BrowserHandler

- Implements `API.BrowserAPI`
- Uses `API.BrowserInfo` for return type of `list()`
- All methods unchanged, only types updated

### WindowHandler (new)

```typescript
import { Container } from '@/shared/di'
import { ElectronRpcServer } from '@/shared/rpc/electron'

import type { API } from '@/types/api'
import { WindowManager } from '../services'

export class WindowHandler implements API.WindowAPI {
  readonly #windowManager: WindowManager

  constructor() {
    this.#windowManager = Container.inject(WindowManager)
  }

  async createVault(vaultId: string): Promise<{ ok: boolean }> {
    this.#windowManager.createVaultWindow(vaultId)
    this.#windowManager.closeWindow('welcome')
    return { ok: true }
  }

  async createPopup(threadId: string): Promise<{ ok: boolean }> {
    this.#windowManager.createChatPopupWindow(threadId)
    return { ok: true }
  }

  async close(windowName: string): Promise<{ ok: boolean }> {
    this.#windowManager.closeWindow(windowName)
    return { ok: true }
  }

  static registerHandlers(): void {
    const server = Container.inject(ElectronRpcServer)
    const router = server.router('window')
    const handler = new WindowHandler()

    router.handle('create-vault', (vaultId) => handler.createVault(vaultId))
    router.handle('create-popup', (threadId) => handler.createPopup(threadId))
    router.handle('close', (windowName) => handler.close(windowName))
  }
}
```

### AppHandler (new, replaces system.ts)

```typescript
import { Container } from '@/shared/di'
import { ElectronRpcServer } from '@/shared/rpc/electron'

import type { API } from '@/types/api'
import { store } from '../lib/store'

export class AppHandler implements API.AppAPI {
  async getLocale(): Promise<string> {
    return store.get('locale') as string
  }

  async setLocale(locale: string): Promise<{ ok: boolean }> {
    store.set('locale', locale)
    return { ok: true }
  }

  async getBoolValue(key: 'firstLaunchDone'): Promise<boolean> {
    return store.get(key)
  }

  async setBoolValue(key: 'firstLaunchDone', value: boolean): Promise<void> {
    store.set(key, value)
  }

  static registerHandlers(): void {
    const server = Container.inject(ElectronRpcServer)
    const router = server.router('app')
    const handler = new AppHandler()

    router.handle('getLocale', () => handler.getLocale())
    router.handle('setLocale', (locale) => handler.setLocale(locale))
    router.handle('getBoolValue', (key) => handler.getBoolValue(key as 'firstLaunchDone'))
    router.handle('setBoolValue', (key, value) => handler.setBoolValue(key as 'firstLaunchDone', value))
  }
}
```

### handlers/index.ts

```typescript
import { AppHandler } from './app'
import { BrowserHandler } from './browser'
import { FilesHandler } from './files'
import { GitHandler } from './git'
import { WindowHandler } from './window'

export function registerHandlers() {
  AppHandler.registerHandlers()
  FilesHandler.registerHandlers()
  GitHandler.registerHandlers()
  BrowserHandler.registerHandlers()
  WindowHandler.registerHandlers()
}
```

## Preload Changes

### expose.ts

```typescript
import { contextBridge, ipcRenderer } from 'electron'

import { IpcRendererRpcClient } from '@/shared/rpc/electron'

import type { API } from '@/types/api'
import { buildCallApi, createRpc } from './utils'

const client = new IpcRendererRpcClient(ipcRenderer)
const rpc = createRpc(client)

const api: API = {
  files: buildCallApi<API.FilesAPI>('files', ['list', 'search'], rpc),
  git: buildCallApi<API.GitAPI>('git', [
    'status', 'branches', 'currentBranch', 'log', 'diffStat',
    'stage', 'unstage', 'stageAll', 'unstageAll', 'discard',
    'commit', 'checkout', 'createBranch', 'push', 'pull', 'fetch',
    'generateCommitMessage',
  ], rpc),
  browser: buildCallApi<API.BrowserAPI>('browser', [
    'create', 'destroy', 'list', 'navigate', 'goBack', 'goForward',
    'reload', 'stop', 'focus', 'screenshot', 'getAccessibilitySnapshot',
    'clickElement', 'fillElement', 'selectOption',
  ], rpc),
  window: buildCallApi<API.WindowAPI>('window', [
    'createVault', 'createPopup', 'close',
  ], rpc),
  app: buildCallApi<API.AppAPI>('app', [
    'getLocale', 'setLocale', 'getBoolValue', 'setBoolValue',
  ], rpc),
  rpc,
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
}
```

### preload.d.ts

```typescript
import type { RpcClient } from '@/shared/rpc'
import type { AppInfo } from '@/types'
import type { API } from './types/api'

export type { API }

declare global {
  interface Window {
    api: API
    __appInfo: AppInfo
  }
}
```

## Files to Delete

1. `handlers/system.ts` - Replaced by WindowHandler and AppHandler
2. `handlers/files.schema.ts` - Types moved to namespace API
3. `handlers/git.schema.ts` - Types moved to namespace API

## Implementation Order

1. Create/update `types/api.ts` with all interface definitions
2. Update `FilesHandler` to implement `API.FilesAPI`
3. Update `GitHandler` to implement `API.GitAPI`
4. Update `BrowserHandler` to implement `API.BrowserAPI`
5. Create `WindowHandler` implementing `API.WindowAPI`
6. Create `AppHandler` implementing `API.AppAPI`
7. Update `handlers/index.ts` to register all handlers
8. Update `preload/expose.ts` to use API types
9. Update `preload/preload.d.ts`
10. Delete schema files and `system.ts`
11. Run type checking and fix any errors

## Benefits

1. **Explicit contracts**: API interfaces clearly define what's exposed to renderer
2. **Type safety**: Preload uses `buildCallApi<API.FilesAPI>` for better type inference
3. **Separation of concerns**: Each handler has single responsibility
4. **Discoverability**: All IPC API types in one place (`namespace API`)
5. **Maintainability**: Changes to API contract are explicit and localized
