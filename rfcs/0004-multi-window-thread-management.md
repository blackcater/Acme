# RFC 0004: Multi-Window and Thread Management

## Summary

本 RFC 定义 Acme 的多窗口系统、Thread 管理以及窗口间通信机制。

## Motivation

Acme 需要支持：
- 主窗口中的多个 Thread 并行管理
- Thread 弹出为独立窗口
- 窗口置顶功能
- 窗口状态持久化

## Window Architecture

```mermaid
graph TB
    subgraph Window Manager
        MainWindow[Main Window]
        ThreadWindows[Thread Windows]
        SettingsWindow[Settings Window]
    end

    subgraph Window Types
        TWindow1[Thread Window 1<br/>Floating, OnTop]
        TWindow2[Thread Window 2<br/>Floating]
        TWindow3[Thread Window 3<br/>Embedded]
    end

    subgraph IPC
        Bus[IPC Bus]
    end

    MainWindow --> Bus
    ThreadWindows --> Bus
    SettingsWindow --> Bus
    ThreadWindows --> TWindow1
    ThreadWindows --> TWindow2
    ThreadWindows --> TWindow3
```

## Window Types

### Main Window

```typescript
interface MainWindow {
  id: 'main';
  type: 'main';
  state: {
    width: number;
    height: number;
    x: number;
    y: number;
    isMaximized: boolean;
    isFullScreen: boolean;
  };
  panels: {
    sidebar: { width: number; visible: boolean };
    toolPanel: { width: number; visible: boolean; activeTab: string };
  };
}
```

### Thread Window

```typescript
interface ThreadWindow {
  id: string;  // thread-id
  type: 'thread';
  parent: 'main';
  state: {
    width: number;
    height: number;
    x: number;
    y: number;
    isFloating: boolean;
    isOnTop: boolean;
    monitor?: string;
  };
  thread: {
    id: string;
    mode: ThreadMode;
  };
}
```

### Settings Window

```typescript
interface SettingsWindow {
  id: 'settings';
  type: 'settings';
  state: {
    width: number;
    height: number;
    x: number;
    y: number;
  };
  section?: string;  // 'general' | 'agents' | 'providers' | etc.
}
```

## Window Manager

```mermaid
classDiagram
    class WindowManager {
        -windows: Map~string, Window~
        -mainWindow: BrowserWindow
        -ipcBus: IPCBus

        +createMainWindow(): MainWindow
        +createThreadWindow(threadId: string): ThreadWindow
        +createSettingsWindow(section?: string): SettingsWindow
        +closeWindow(id: string): void
        +focusWindow(id: string): void
        +setWindowAlwaysOnTop(id: string, onTop: boolean): void
        +getWindowState(id: string): WindowState
        +saveWindowState(): void
        +restoreWindowState(): void
    }

    class Window {
        +id: string
        +type: WindowType
        +state: WindowState
        +browserWindow: Electron.BrowserWindow
        +send(channel: string, data: any): void
        +close(): void
    }

    WindowManager "1" *-- "n" Window
```

## Thread Window Operations

### Pop-out Thread

```mermaid
sequenceDiagram
    participant User
    participant UI
    participant WindowManager
    participant MainWindow
    participant NewWindow

    User->>UI: Click "Pop out" button
    UI->>WindowManager: createThreadWindow(threadId)
    WindowManager->>NewWindow: Create BrowserWindow
    NewWindow-->>WindowManager: Window created
    WindowManager->>MainWindow: Detach thread
    MainWindow-->>User: Thread removed from sidebar
    NewWindow-->>User: Show in new window
```

### Float and Pin

```mermaid
graph LR
    subgraph Thread States
        Embedded[Embedded<br/>in Main]
        Floating[Floating<br/>in Main]
        Popped[Popped<br/>in New Window]
        Pinned[Pinned<br/>Always On Top]
    end

    Embedded -->|Pop out| Floating
    Embedded -->|Pop out + Pin| Pinned
    Floating -->|Pin| Pinned
    Floating -->|Embed| Embedded
    Pinned -->|Unpin| Floating
```

## IPC Communication

```mermaid
graph TB
    subgraph IPC Channels
        thread_create["thread:create"]
        thread_update["thread:update"]
        thread_delete["thread:delete"]
        thread_message["thread:message"]
        thread_stream["thread:stream"]
        window_state["window:state"]
        vault_sync["vault:sync"]
    end

    subgraph IPC Bus
        Router[Message Router]
        Filter[Filter/Middleware]
    end

    thread_create --> Router
    thread_update --> Router
    thread_delete --> Router
    thread_message --> Filter
    Filter --> Router
    Router --> window_state
```

### IPC Message Types

```typescript
// Shared IPC types

export interface IPCMessage<T = unknown> {
  id: string;
  channel: string;
  source: string;
  target?: string;
  timestamp: number;
  payload: T;
}

export interface ThreadMessagePayload {
  threadId: string;
  message: Message;
}

export interface ThreadStreamPayload {
  threadId: string;
  delta: string;
  done: boolean;
}

export interface WindowStatePayload {
  windowId: string;
  state: WindowState;
}
```

## Window State Persistence

```mermaid
graph TB
    subgraph Startup
        Load[Load State]
        Validate[Validate Windows]
        Create[Create Windows]
    end

    subgraph Shutdown
        Collect[Collect Window States]
        Persist[Persist to Disk]
    end

    Load --> Validate
    Validate -->|Valid| Create
    Validate -->|Invalid| Create
    Collect --> Persist
```

```typescript
// packages/desktop/src/main/window/state.ts

export interface WindowStateStore {
  version: number;
  windows: Record<string, WindowState>;
  mainWindow: {
    bounds: Rectangle;
    maximized: boolean;
  };
}

export class WindowStateManager {
  private storePath: string;

  async load(): Promise<WindowStateStore> {
    const data = await readFile(this.storePath);
    return JSON.parse(data);
  }

  async save(state: WindowStateStore): Promise<void> {
    await writeFile(this.storePath, JSON.stringify(state, null, 2));
  }
}
```

## UI Layout

### Main Window Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  Title Bar                                                     │
├────────────┬───────────────────────────────────────┬────────────┤
│            │                                       │            │
│  Sidebar   │         Thread Content                │   Tool     │
│            │                                       │   Panel    │
│  Projects  │  ┌─────────────────────────────────┐  │            │
│  Threads   │  │     Thread Header                │  │  Preview   │
│  Tags      │  ├─────────────────────────────────┤  │  ────────  │
│            │  │                                 │  │  Source    │
│            │  │     Chat Messages               │  │  Tree      │
│            │  │                                 │  │  ────────  │
│            │  │                                 │  │  File      │
│            │  ├─────────────────────────────────┤  │  Explorer  │
│            │  │     Composer                    │  │  ────────  │
│            │  └─────────────────────────────────┘  │  Browser   │
│            │                                       │            │
├────────────┴───────────────────────────────────────┴────────────┤
│  Status Bar                                                     │
└─────────────────────────────────────────────────────────────────┘
```

### Floating Thread Window

```
┌───────────────────────────────────────┐
│  Thread Title              [─][□][×] │
├───────────────────────────────────────┤
│                                       │
│     Chat Messages                     │
│                                       │
│                                       │
├───────────────────────────────────────┤
│     Composer                         │
└───────────────────────────────────────┘
```

## Multi-Monitor Support

```mermaid
graph TB
    subgraph Monitor 1
        Main1[Main Window]
    end

    subgraph Monitor 2
        Thread1[Thread Window 1<br/>1920x1080]
        Thread2[Thread Window 2<br/>On Top]
    end

    subgraph Monitor 3
        Preview[Preview Window]
    end

    Main1 -.->|Pop out| Thread1
    Main1 -.->|Pop out + Pin| Thread2
    Thread1 -.->|Detach| Preview
```

## Keyboard Shortcuts

```typescript
const windowShortcuts = {
  // Window management
  'CmdOrCtrl+N': 'New Thread',
  'CmdOrCtrl+W': 'Close Window',
  'CmdOrCtrl+Shift+W': 'Close All Thread Windows',
  'CmdOrCtrl+T': 'New Thread in Tab',
  'CmdOrCtrl+\\': 'Toggle Sidebar',

  // Thread windows
  'CmdOrCtrl+Alt+P': 'Pop out Thread',
  'CmdOrCtrl+Alt+T': 'Toggle Always On Top',
  'CmdOrCtrl+Alt+M': 'Maximize Window',

  // Focus
  'CmdOrCtrl+1-9': 'Focus Thread 1-9',
  'CmdOrCtrl+Tab': 'Cycle Windows',
};
```

## Alternatives Considered

1. **仅支持 Tab 而非独立窗口**
   - 缺点: 无法同时查看多个 Thread

2. **使用 Web 原生窗口管理**
   - 缺点: 无法实现窗口置顶等高级功能

3. **每个窗口独立进程**
   - 缺点: 资源消耗大，IPC 复杂

## Implementation Plan

1. Phase 1: Basic Window Management
   - WindowManager 实现
   - 主窗口创建和关闭
   - 窗口状态持久化

2. Phase 2: Thread Windows
   - Thread 弹出功能
   - 窗口置顶
   - 窗口间通信

3. Phase 3: Advanced Features
   - 多显示器支持
   - 窗口布局保存/恢复
   - 全屏模式

## Open Questions

- [ ] 最大支持多少个并发窗口？
- [ ] 窗口崩溃恢复策略？
- [ ] 是否需要窗口分组功能？
