# Chat Feature Migration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 Chat 组件从 `components/chat/` 迁移到 `features/chat/`，建立 Feature Layer 架构

**Architecture:**
- UI Layer: `components/base/` (纯展示组件)
- Feature Layer: `features/chat/components/` (组合组件 + hooks)
- Service Layer: `services/` + `hooks/` (外部通信 + 业务逻辑)
- 迁移策略：增量迁移，保留旧导入路径作为过渡

**Tech Stack:**
- React + TypeScript
- Jotai (状态管理)
- react-resizable-panels

---

## 概述

当前 Chat 组件位于 `components/chat/Chat.tsx`，使用 `panelAtom` 管理面板状态。迁移目标：

1. 将 Chat 组件迁移到 `features/chat/components/Chat/`
2. 创建 `useChatPanel` hook 管理面板状态
3. 更新路由从 `features/chat` 导入
4. 保持向后兼容（可选过渡期）

---

## Task 1: 创建 Chat Feature 组件结构

**Files:**
- Create: `apps/desktop/src/renderer/src/features/chat/components/Chat/index.tsx`
- Create: `apps/desktop/src/renderer/src/features/chat/components/Chat/Chat.tsx`
- Modify: `apps/desktop/src/renderer/src/features/chat/index.ts`

- [ ] **Step 1: 创建 Chat 组件目录**

```bash
mkdir -p apps/desktop/src/renderer/src/features/chat/components/Chat
```

- [ ] **Step 2: 创建 Chat.tsx**

Create: `apps/desktop/src/renderer/src/features/chat/components/Chat/Chat.tsx`

```typescript
import {
	Group,
	Panel,
	Separator,
	useDefaultLayout,
	type PanelSize,
} from 'react-resizable-panels'

import { useAtom } from 'jotai'

import { panelAtom } from '@renderer/stores'

import { PanelRouter } from '@renderer/components/chat/panel'

export interface ChatProps {
	threadId?: string
}

export function Chat({ threadId }: Readonly<ChatProps>) {
	const { defaultLayout, onLayoutChanged } = useDefaultLayout({
		id: 'layout-thread',
		storage: localStorage,
	})
	const [panelState, setPanelState] = useAtom(panelAtom)

	function handlePanelResize(size: PanelSize) {
		setPanelState((prev) => ({ ...prev, width: size.inPixels }))
	}

	return (
		<Group
			orientation="horizontal"
			defaultLayout={defaultLayout}
			onLayoutChanged={onLayoutChanged}
		>
			<Panel id="thread" className="bg-background rounded-lg">
				New Thread ({threadId || 'no threadId'})
			</Panel>

			<Separator className="hover:bg-primary/20 mx-px my-3 w-0.5 transition-colors" />

			{!panelState.collapsed && (
				<Panel
					id="panel"
					className="bg-background rounded-lg"
					minSize={300}
					maxSize={500}
					onResize={handlePanelResize}
				>
					<PanelRouter type={panelState.type} />
				</Panel>
			)}
		</Group>
	)
}
```

- [ ] **Step 3: 创建 Chat/index.ts**

Create: `apps/desktop/src/renderer/src/features/chat/components/Chat/index.ts`

```typescript
export { Chat } from './Chat'
export type { ChatProps } from './Chat'
```

- [ ] **Step 4: 更新 features/chat/index.ts**

Modify: `apps/desktop/src/renderer/src/features/chat/index.ts`

```typescript
// Chat feature public exports
export * from './components/Chat'
export * from './hooks'
// Re-export types for convenience
export type { ChatProps } from './components/Chat'
```

- [ ] **Step 5: 提交**

```bash
git add apps/desktop/src/renderer/src/features/chat/
git commit -m "feat(chat): create Chat component in features/chat"
```

---

## Task 2: 创建 useChatPanel Hook

**Files:**
- Create: `apps/desktop/src/renderer/src/features/chat/hooks/useChatPanel.ts`

- [ ] **Step 1: 创建 useChatPanel Hook**

Create: `apps/desktop/src/renderer/src/features/chat/hooks/useChatPanel.ts`

```typescript
import { useAtom } from 'jotai'

import { panelAtom } from '@renderer/stores'
import type { PanelType } from '@renderer/types/panel'

/**
 * Hook to manage chat panel state
 */
export function useChatPanel() {
	const [panelState, setPanelState] = useAtom(panelAtom)

	function setPanelType(type: PanelType) {
		setPanelState((prev) => ({ ...prev, type }))
	}

	function toggleCollapsed() {
		setPanelState((prev) => ({ ...prev, collapsed: !prev.collapsed }))
	}

	function setWidth(width: number) {
		setPanelState((prev) => ({ ...prev, width }))
	}

	return {
		panelState,
		setPanelType,
		toggleCollapsed,
		setWidth,
	}
}
```

- [ ] **Step 2: 更新 hooks/index.ts**

Modify or Create: `apps/desktop/src/renderer/src/features/chat/hooks/index.ts`

```typescript
export * from './useChatPanel'
```

- [ ] **Step 3: 提交**

```bash
git add apps/desktop/src/renderer/src/features/chat/hooks/
git commit -m "feat(chat): add useChatPanel hook"
```

---

## Task 3: 更新路由使用新导入路径

**Files:**
- Modify: `apps/desktop/src/renderer/src/routes/vault/$vaultId/thread/$threadId.tsx`

- [ ] **Step 1: 更新路由导入**

Modify: `apps/desktop/src/renderer/src/routes/vault/$vaultId/thread/$threadId.tsx`

```typescript
import { createFileRoute } from '@tanstack/react-router'

// Import from features/chat instead of components/chat
import { Chat } from '@renderer/features/chat'

export const Route = createFileRoute('/vault/$vaultId/thread/$threadId')({
	component: ThreadPage,
})

function ThreadPage() {
	const { threadId } = Route.useParams()

	return <Chat threadId={threadId} />
}
```

- [ ] **Step 2: 提交**

```bash
git add apps/desktop/src/renderer/src/routes/vault/$vaultId/thread/$threadId.tsx
git commit -m "refactor(route): import Chat from features/chat"
```

---

## Task 4: 验证和测试

- [ ] **Step 1: 运行 TypeScript 检查**

Run: `bunx tsc --noEmit`
Expected: 无错误

- [ ] **Step 2: 运行 Linter**

Run: `bunx oxlint`
Expected: 无警告

- [ ] **Step 3: 验证功能**

验证聊天页面可以正常加载和交互

---

## 实施检查清单

- [ ] Chat 组件位于 `features/chat/components/Chat/`
- [ ] useChatPanel hook 管理面板状态
- [ ] 路由从 `features/chat` 导入
- [ ] TypeScript 检查通过
- [ ] Linter 检查通过
