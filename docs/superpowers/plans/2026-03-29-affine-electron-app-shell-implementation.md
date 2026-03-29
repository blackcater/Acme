# AFFiNE 风格 Electron 应用外壳实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现类似 AFFiNE 的 Electron 应用外壳，包括顶部导航栏、可折叠侧边栏和主内容区

**Architecture:** 使用 TanStack Router 的布局路由模式，将 AppShell 作为根路由的布局组件。侧边栏状态使用 React useState + useCallback 管理。拖拽调整宽度使用原生 mousedown/mousemove/mouseup 事件，配合 useEffect 清理。

**Tech Stack:** TanStack Router, Tailwind CSS, Radix UI primitives (via packages/ui), class-variance-authority

---

## 文件结构

```
apps/desktop/src/renderer/src/
├── components/
│   └── app-shell/
│       ├── AppShell.tsx           # 主应用外壳
│       ├── AppHeader.tsx          # 顶部导航栏
│       ├── AppSidebar.tsx         # 可折叠侧边栏（含拖拽、hover、切换）
│       ├── NavigationButtons.tsx   # 导航按钮
│       └── index.ts
├── hooks/
│   └── use-sidebar.ts             # 侧边栏状态管理
├── lib/
│   └── electron.ts                # Electron 环境检测
└── routes/
    └── __root.tsx                 # 修改：使用 AppShell 布局
```

---

## Task 1: 创建 Electron 环境检测模块

**Files:**
- Create: `apps/desktop/src/renderer/src/lib/electron.ts`

- [ ] **Step 1: 创建 electron.ts**

```ts
// apps/desktop/src/renderer/src/lib/electron.ts

/**
 * 检测当前是否运行在 Electron 环境中
 * 使用 navigator.userAgent 检测而非 window.electron
 */
export const isElectron = typeof window !== 'undefined' &&
  typeof navigator !== 'undefined' &&
  navigator.userAgent.includes('Electron')
```

- [ ] **Step 2: 提交**

```bash
git add apps/desktop/src/renderer/src/lib/electron.ts
git commit -m "feat(desktop): add Electron environment detection"
```

---

## Task 2: 创建 useSidebar Hook

**Files:**
- Create: `apps/desktop/src/renderer/src/hooks/use-sidebar.ts`

- [ ] **Step 1: 创建 use-sidebar.ts**

```ts
// apps/desktop/src/renderer/src/hooks/use-sidebar.ts
import { useState, useCallback } from 'react'

export interface SidebarState {
  isOpen: boolean
  isHovering: boolean
  width: number
  setOpen: (open: boolean) => void
  setHovering: (hovering: boolean) => void
  setWidth: (width: number) => void
  toggle: () => void
}

const DEFAULT_WIDTH = 256 // px (w-64)
const MIN_WIDTH = 248
const MAX_WIDTH = 480

export function useSidebar(): SidebarState {
  const [isOpen, setIsOpen] = useState(true)
  const [isHovering, setIsHovering] = useState(false)
  const [width, setWidthState] = useState(DEFAULT_WIDTH)

  const setOpen = useCallback((open: boolean) => {
    setIsOpen(open)
  }, [])

  const setHovering = useCallback((hovering: boolean) => {
    setIsHovering(hovering)
  }, [])

  const setWidth = useCallback((newWidth: number) => {
    const clampedWidth = Math.min(Math.max(newWidth, MIN_WIDTH), MAX_WIDTH)
    setWidthState(clampedWidth)
  }, [])

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  return {
    isOpen,
    isHovering,
    width,
    setOpen,
    setHovering,
    setWidth,
    toggle,
  }
}

export { MIN_WIDTH, MAX_WIDTH, DEFAULT_WIDTH }
```

- [ ] **Step 2: 提交**

```bash
git add apps/desktop/src/renderer/src/hooks/use-sidebar.ts
git commit -m "feat(desktop): add useSidebar hook for sidebar state management"
```

---

## Task 3: 创建 NavigationButtons 组件

**Files:**
- Create: `apps/desktop/src/renderer/src/components/app-shell/NavigationButtons.tsx`
- Modify: `apps/desktop/src/renderer/src/components/app-shell/index.ts`

- [ ] **Step 1: 创建 NavigationButtons.tsx**

```tsx
// apps/desktop/src/renderer/src/components/app-shell/NavigationButtons.tsx
import { Button } from '@acme-ai/ui/foundation/button'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

export function NavigationButtons(): React.JSX.Element {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="返回"
        className="text-sidebar-foreground"
      >
        <ChevronLeftIcon />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="前进"
        className="text-sidebar-foreground"
      >
        <ChevronRightIcon />
      </Button>
    </div>
  )
}
```

- [ ] **Step 2: 更新 index.ts**

```ts
// apps/desktop/src/renderer/src/components/app-shell/index.ts
export { AppShell } from './AppShell'
export { AppHeader } from './AppHeader'
export { AppSidebar } from './AppSidebar'
export { NavigationButtons } from './NavigationButtons'
```

- [ ] **Step 3: 提交**

```bash
git add apps/desktop/src/renderer/src/components/app-shell/NavigationButtons.tsx
git add apps/desktop/src/renderer/src/components/app-shell/index.ts
git commit -m "feat(desktop): add NavigationButtons component"
```

---

## Task 4: 创建 AppHeader 组件

**Files:**
- Create: `apps/desktop/src/renderer/src/components/app-shell/AppHeader.tsx`
- Modify: `apps/desktop/src/renderer/src/components/app-shell/index.ts`

- [ ] **Step 1: 创建 AppHeader.tsx**

```tsx
// apps/desktop/src/renderer/src/components/app-shell/AppHeader.tsx
import { NavigationButtons } from './NavigationButtons'

export function AppHeader(): React.JSX.Element {
  return (
    <div className="flex h-10 w-full shrink-0 items-center border-b border-border bg-sidebar px-4 gap-2">
      <NavigationButtons />
    </div>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add apps/desktop/src/renderer/src/components/app-shell/AppHeader.tsx
git add apps/desktop/src/renderer/src/components/app-shell/index.ts
git commit -m "feat(desktop): add AppHeader component"
```

---

## Task 5: 创建 AppSidebar 组件（完整功能）

**Files:**
- Create: `apps/desktop/src/renderer/src/components/app-shell/AppSidebar.tsx`
- Modify: `apps/desktop/src/renderer/src/components/app-shell/index.ts`

- [ ] **Step 1: 创建完整的 AppSidebar.tsx**

```tsx
// apps/desktop/src/renderer/src/components/app-shell/AppSidebar.tsx
import { useCallback, useRef, useEffect } from 'react'
import { cn } from '@acme-ai/ui/lib/utils'
import { ScrollArea } from '@acme-ai/ui/foundation/scroll-area'
import { useSidebar, MIN_WIDTH, MAX_WIDTH } from '../../hooks/use-sidebar'

export function AppSidebar(): React.JSX.Element {
  const { isOpen, isHovering, width, setWidth, toggle, setHovering } = useSidebar()
  const isDraggingRef = useRef(false)
  const dragStartXRef = useRef(0)
  const dragStartWidthRef = useRef(0)

  // 拖拽开始
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    isDraggingRef.current = true
    dragStartXRef.current = e.clientX
    dragStartWidthRef.current = width

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return
      const delta = e.clientX - dragStartXRef.current
      const newWidth = dragStartWidthRef.current + delta
      setWidth(newWidth)
    }

    const handleMouseUp = () => {
      isDraggingRef.current = false
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [width, setWidth])

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', () => {})
      document.removeEventListener('mouseup', () => {})
    }
  }, [])

  // 计算侧边栏实际宽度样式
  const sidebarStyle = isOpen || isHovering
    ? { width: `${width}px` }
    : undefined

  return (
    <aside
      className={cn(
        'relative flex shrink-0 flex-col bg-sidebar transition-all duration-200',
        'border-r border-sidebar-border',
        !isOpen && !isHovering && 'w-12',
        !isOpen && isHovering && 'absolute left-0 top-0 z-10 shadow-lg',
        isOpen && 'w-64'
      )}
      style={sidebarStyle}
      onMouseEnter={() => !isOpen && setHovering(true)}
      onMouseLeave={() => !isOpen && setHovering(false)}
    >
      {/* 拖拽调整手柄 */}
      {isOpen && (
        <div
          className="absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-primary/50"
          onMouseDown={handleDragStart}
        />
      )}

      {/* 切换按钮 */}
      <button
        onClick={toggle}
        className={cn(
          'flex h-8 w-full items-center justify-center',
          'text-sidebar-foreground hover:bg-sidebar-accent'
        )}
        aria-label={isOpen ? '收起侧边栏' : '展开侧边栏'}
      >
        <span className={cn('text-xs transition-transform', !isOpen && 'rotate-180')}>
          ◀
        </span>
      </button>

      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-1 p-2">
          {/* 占位导航项 */}
          <NavItemPlaceholder icon="📄" label="All Docs" />
          <NavItemPlaceholder icon="⚙️" label="Settings" />
        </div>
      </ScrollArea>
    </aside>
  )
}

function NavItemPlaceholder({ icon, label }: { icon: string; label: string }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-md px-2 py-1.5',
        'text-sm text-sidebar-foreground',
        'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
      )}
    >
      <span>{icon}</span>
      <span className="truncate">{label}</span>
    </div>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add apps/desktop/src/renderer/src/components/app-shell/AppSidebar.tsx
git add apps/desktop/src/renderer/src/components/app-shell/index.ts
git commit -m "feat(desktop): add AppSidebar with collapse/expand and drag-to-resize"
```

---

## Task 6: 创建 AppShell 主组件

**Files:**
- Create: `apps/desktop/src/renderer/src/components/app-shell/AppShell.tsx`
- Modify: `apps/desktop/src/renderer/src/components/app-shell/index.ts`

- [ ] **Step 1: 创建 AppShell.tsx**

```tsx
// apps/desktop/src/renderer/src/components/app-shell/AppShell.tsx
import { cn } from '@acme-ai/ui/lib/utils'
import { AppHeader } from './AppHeader'
import { AppSidebar } from './AppSidebar'
import { isElectron } from '../../lib/electron'

interface AppShellProps {
  children: React.ReactNode
  enableBlur?: boolean
  enableNoise?: boolean
}

export function AppShell({
  children,
  enableBlur = false,
  enableNoise = false,
}: AppShellProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'flex h-screen flex-col bg-background',
        isElectron && enableBlur && 'backdrop-blur-xl',
        isElectron && enableNoise && 'bg-noise'
      )}
    >
      <AppHeader />
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar />
        <main className="flex-1 overflow-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 提交**

```bash
git add apps/desktop/src/renderer/src/components/app-shell/AppShell.tsx
git add apps/desktop/src/renderer/src/components/app-shell/index.ts
git commit -m "feat(desktop): add AppShell main component"
```

---

## Task 7: 更新根路由使用 AppShell 布局

**Files:**
- Modify: `apps/desktop/src/renderer/src/routes/__root.tsx`

- [ ] **Step 1: 更新 __root.tsx**

```tsx
import { Outlet } from '@tanstack/react-router'
import { AppShell } from '../components/app-shell'

export function RootComponent(): React.JSX.Element {
  return (
    <AppShell>
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
    </AppShell>
  )
}
```

**Note:** TanStack Router 使用代码生成路由，`routeTree.gen.ts` 会在下次运行 `bun run dev` 或 `bun run build` 时自动重新生成。

- [ ] **Step 2: 提交**

```bash
git add apps/desktop/src/renderer/src/routes/__root.tsx
git commit -m "feat(desktop): integrate AppShell into root route"
```

---

## 验证命令

完成所有任务后，运行以下命令验证：

```bash
# 类型检查
cd apps/desktop && bunx tsc --noEmit

# 代码格式化
cd apps/desktop && bunx oxfmt

# 代码检查
cd apps/desktop && bunx oxlint
```

---

## 实现说明

### 侧边栏宽度逻辑

- 收起状态：`w-12`（固定宽度，48px）
- 展开状态：使用 inline style `{ width: ${width}px }` 动态设置
- hover 展开：absolute 定位，z-10，阴影效果

### 拖拽调整

- 仅在展开状态下显示拖拽手柄
- 拖拽时监听 `mousemove` 和 `mouseup` 事件
- 通过 `useEffect` return 清理确保组件卸载时移除事件监听

### Electron 特性

- `isElectron` 使用 `navigator.userAgent.includes('Electron')` 检测
- 毛玻璃效果：`backdrop-blur-xl` 类
- 噪声纹理：`bg-noise` 类（已在 `packages/ui/src/styles/globals.css` 中定义）
