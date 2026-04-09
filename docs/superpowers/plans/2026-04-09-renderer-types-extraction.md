# Renderer Types Extraction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extract type definitions from `hooks/chat/useOutline.ts` into `types/` directory so hooks contain only implementation logic.

**Architecture:** Create new `types/session.ts` and `types/outline.ts` files, remove types from `hooks/chat/useOutline.ts`, update all consumers to import from new type locations.

**Tech Stack:** TypeScript

---

## File Structure

```
types/
  session.ts       (create) - UIMessage interface
  outline.ts       (create) - OutlineNodeType, OutlineNode
  index.ts         (modify) - add exports

hooks/chat/
  useOutline.ts    (modify) - remove type definitions

components/chat/panel/
  outline/
    OutlineNode.tsx   (modify) - update import source
    OutlineTree.tsx   (modify) - update import source
    OutlinePanel.tsx  (modify) - update import source
  PanelRouter.tsx     (modify) - update import source
```

---

## Task 1: Create `types/session.ts`

**File:** `apps/desktop/src/renderer/src/types/session.ts`

- [ ] **Step 1: Create file**

```typescript
export interface UIMessage {
  id: string
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string | unknown[]
  timestamp?: number
  isStreaming?: boolean
  attachments?: unknown[]
  tool_calls?: Array<{ id?: string; name?: string; [key: string]: unknown }>
}
```

---

## Task 2: Create `types/outline.ts`

**File:** `apps/desktop/src/renderer/src/types/outline.ts`

- [ ] **Step 1: Create file**

```typescript
export type OutlineNodeType = 'user' | 'assistant' | 'tool_call' | 'tool_result'

export interface OutlineNode {
  id: string
  type: OutlineNodeType
  label: string
  icon?: string
  messageId: string
  children?: OutlineNode[]
}
```

---

## Task 3: Update `types/index.ts`

**File:** `apps/desktop/src/renderer/src/types/index.ts`

- [ ] **Step 1: Add exports**

```typescript
export * from './outline'
export * from './panel'
export * from './project'
export * from './session'
export * from './sidebar'
export * from './thread'
```

---

## Task 4: Update `hooks/chat/useOutline.ts`

**File:** `apps/desktop/src/renderer/src/hooks/chat/useOutline.ts`

- [ ] **Step 1: Remove type definitions at the top**

Remove these definitions from the file:
```typescript
export interface UIMessage { ... }
export type OutlineNodeType = ...
export interface OutlineNode { ... }
```

Keep only the `getToolName`, `buildOutlineTree` functions and `UseOutlineOptions`, `UseOutlineResult` interfaces (internal), and `useOutline` export.

The file should start directly with `import { useMemo } from 'react'` and have no exported types.

---

## Task 5: Update `components/chat/panel/outline/OutlineNode.tsx`

**File:** `apps/desktop/src/renderer/src/components/chat/panel/outline/OutlineNode.tsx`

- [ ] **Step 1: Update import**

Change:
```typescript
} from '../../../../hooks/chat/useOutline'
```
To:
```typescript
} from '@renderer/types/outline'
```

Note: Only import types (`OutlineNode`, `OutlineNodeType`) from `@renderer/types/outline`. The component may also need `UIMessage` - check line 15 to confirm.

---

## Task 6: Update `components/chat/panel/outline/OutlineTree.tsx`

**File:** `apps/desktop/src/renderer/src/components/chat/panel/outline/OutlineTree.tsx`

- [ ] **Step 1: Update import**

Change:
```typescript
import type { OutlineNode as OutlineNodeType } from '../../../../hooks/chat/useOutline'
```
To:
```typescript
import type { OutlineNode as OutlineNodeType } from '@renderer/types/outline'
```

---

## Task 7: Update `components/chat/panel/outline/OutlinePanel.tsx`

**File:** `apps/desktop/src/renderer/src/components/chat/panel/outline/OutlinePanel.tsx`

- [ ] **Step 1: Update imports**

Change:
```typescript
import type { UIMessage } from '../../../../hooks/chat/useOutline'
import { useOutline } from '../../../../hooks/chat/useOutline'
import type { OutlineNode } from '../../../../hooks/chat/useOutline'
```
To:
```typescript
import type { UIMessage } from '@renderer/types/session'
import { useOutline } from '../../../../hooks/chat/useOutline'
import type { OutlineNode } from '@renderer/types/outline'
```

---

## Task 8: Update `components/chat/panel/PanelRouter.tsx`

**File:** `apps/desktop/src/renderer/src/components/chat/panel/PanelRouter.tsx`

- [ ] **Step 1: Update import**

Change:
```typescript
import type { UIMessage } from '../../../hooks/chat/useOutline'
```
To:
```typescript
import type { UIMessage } from '@renderer/types/session'
```

---

## Task 9: Run type check

- [ ] **Step 1: Verify no TypeScript errors**

Run: `cd apps/desktop && bunx tsc --noEmit`

Expected: No errors related to UIMessage, OutlineNode, or OutlineNodeType imports.

---

## Task 10: Commit

- [ ] **Step 1: Commit changes**

```bash
git add apps/desktop/src/renderer/src/types/session.ts \
        apps/desktop/src/renderer/src/types/outline.ts \
        apps/desktop/src/renderer/src/types/index.ts \
        apps/desktop/src/renderer/src/hooks/chat/useOutline.ts \
        apps/desktop/src/renderer/src/components/chat/panel/outline/OutlineNode.tsx \
        apps/desktop/src/renderer/src/components/chat/panel/outline/OutlineTree.tsx \
        apps/desktop/src/renderer/src/components/chat/panel/outline/OutlinePanel.tsx \
        apps/desktop/src/renderer/src/components/chat/panel/PanelRouter.tsx
git commit -m "refactor: extract types from hooks/chat to types/ directory"
```
