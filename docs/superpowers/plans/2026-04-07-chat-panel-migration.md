# Chat Panel Migration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or subagent-driven-execution to implement this plan task-by-task.

**Goal:** 将 Chat Panels 从 `components/chat/panel/` 迁移到 `features/chat/components/panel/`

**Architecture:**
- UI Layer: `components/base/` (纯展示组件)
- Feature Layer: `features/chat/components/` (组合组件 + hooks)
- PanelRouter 根据 panelState.type 渲染对应的 Panel

---

## 概述

当前 Panels 位于 `components/chat/panel/`，迁移目标：

1. 将所有 Panel 组件迁移到 `features/chat/components/panel/`
2. 更新 PanelRouter 使用新导入路径
3. 更新 Chat 组件使用新 PanelRouter

---

## Task 1: 迁移 PanelRouter 和 Panel 组件

**Files to create/modify:**
- Create: `apps/desktop/src/renderer/src/features/chat/components/panel/` (directory structure)
- Create: `apps/desktop/src/renderer/src/features/chat/components/panel/PanelRouter.tsx`
- Create: `apps/desktop/src/renderer/src/features/chat/components/panel/BrowserPanel.tsx`
- Create: `apps/desktop/src/renderer/src/features/chat/components/panel/GitPanel.tsx`
- Create: `apps/desktop/src/renderer/src/features/chat/components/panel/PreviewPanel.tsx`
- Create: `apps/desktop/src/renderer/src/features/chat/components/panel/index.ts`

- [ ] **Step 1: 创建目录结构**

```bash
mkdir -p apps/desktop/src/renderer/src/features/chat/components/panel
```

- [ ] **Step 2: 创建 PanelRouter.tsx**

Create: `apps/desktop/src/renderer/src/features/chat/components/panel/PanelRouter.tsx`

```typescript
import type { PanelType } from '@renderer/types/panel'

import { BrowserPanel } from './BrowserPanel'
import { GitPanel } from './GitPanel'
import { PreviewPanel } from './PreviewPanel'
import { FilesPanel } from './git/FilesPanel'

interface PanelRouterProps {
	type?: PanelType
}

export function PanelRouter({ type }: Readonly<PanelRouterProps>) {
	switch (type) {
		case 'git':
			return <GitPanel />
		case 'files':
			return <FilesPanel />
		case 'browser':
			return <BrowserPanel />
		case 'preview':
			return <PreviewPanel />
		default:
			return null
	}
}
```

- [ ] **Step 3: 创建 BrowserPanel.tsx**

Create: `apps/desktop/src/renderer/src/features/chat/components/panel/BrowserPanel.tsx`

```typescript
export function BrowserPanel() {
	return (
		<div className="text-muted-foreground flex h-full items-center justify-center">
			Browser Panel - TODO
		</div>
	)
}
```

- [ ] **Step 4: 创建 GitPanel.tsx**

Create: `apps/desktop/src/renderer/src/features/chat/components/panel/GitPanel.tsx`

(Read from current file and copy content)

- [ ] **Step 5: 创建 PreviewPanel.tsx**

Create: `apps/desktop/src/renderer/src/features/chat/components/panel/PreviewPanel.tsx`

(Read from current file and copy content)

- [ ] **Step 6: 创建 git 子目录结构**

The git panel has a complex structure:
```
components/chat/panel/git/
├── FilesPanel.tsx
├── hooks/
│   ├── index.ts
│   └── useFileOperations.ts
├── types/
│   └── index.ts
└── file-tree/
    ├── FileIcon.tsx
    ├── FileTreeView.tsx
    ├── TreeNode.tsx
    ├── TreeNodeIndent.tsx
    ├── useFileTree.ts
    └── index.ts
```

For now, migrate the git panel as a sub-directory: `features/chat/components/panel/git/`

- [ ] **Step 7: 创建 panel/index.ts**

Create: `apps/desktop/src/renderer/src/features/chat/components/panel/index.ts`

```typescript
export { PanelRouter } from './PanelRouter'
export { BrowserPanel } from './BrowserPanel'
export { GitPanel } from './GitPanel'
export { PreviewPanel } from './PreviewPanel'
export { FilesPanel } from './git'
```

- [ ] **Step 8: 提交**

```bash
git add apps/desktop/src/renderer/src/features/chat/components/panel/
git commit -m "feat(chat): migrate panels to features/chat/components/panel"
```

---

## Task 2: 更新 Chat 组件使用新的 PanelRouter

**Files to modify:**
- Modify: `apps/desktop/src/renderer/src/features/chat/components/Chat/Chat.tsx`

- [ ] **Step 1: 更新 Chat.tsx 导入路径**

Change:
```typescript
import { PanelRouter } from '@renderer/components/chat/panel'
```
To:
```typescript
import { PanelRouter } from '../panel'
```

- [ ] **Step 2: 提交**

```bash
git add apps/desktop/src/renderer/src/features/chat/components/Chat/Chat.tsx
git commit -m "refactor(chat): use panel from features/chat"
```

---

## Task 3: 验证

- [ ] **Step 1: 运行 TypeScript 检查**

Run: `bunx tsc --noEmit`
Expected: 无错误（除了预先存在的错误）

- [ ] **Step 2: 运行 Linter**

Run: `bunx oxlint apps/desktop/src/renderer/src/features/chat/`
Expected: 无警告

---

## 实施检查清单

- [ ] PanelRouter 位于 `features/chat/components/panel/PanelRouter.tsx`
- [ ] 所有 Panel 组件迁移到新位置
- [ ] Chat 组件使用新的 PanelRouter
- [ ] TypeScript 检查通过
- [ ] Linter 检查通过
