# Sidebar 拖拽效果改进实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现 thread 置顶区功能，优化 Folder 拖拽分界逻辑，消除抖动

**Architecture:**
- 置顶区：单一区域，支持置顶 thread 拖拽排序
- Folder 区：FolderCell 中点作为分界，Folder + ThreadCell 整体移动动画
- 数据：`pinnedThreadIdsAtom` 从 Set 改为有序数组

**Tech Stack:** React, Jotai, TailwindCSS, HTML5 Drag and Drop API

---

## 文件结构

```
apps/desktop/src/renderer/src/components/app-shell/
├── atoms/thread-atoms.ts     # 修改: pinnedThreadIdsAtom, Thread.folderId
├── types/thread.ts           # 修改: Thread.folderId
├── sidebar/
│   ├── PinnedSection.tsx     # 修改: 支持拖拽排序
│   ├── cell/
│   │   └── ThreadCell.tsx   # 修改: 置顶图标点击，拖拽事件
│   └── thread/
│       └── FolderView.tsx    # 修改: 简化分界，添加移动动画
```

---

## Task 1: 修改数据类型

**Files:**
- Modify: `apps/desktop/src/renderer/src/components/app-shell/types/thread.ts:1-7`
- Modify: `apps/desktop/src/renderer/src/components/app-shell/atoms/thread-atoms.ts:1-49`

- [ ] **Step 1: 修改 Thread 接口**

```typescript
// apps/desktop/src/renderer/src/components/app-shell/types/thread.ts
export interface Thread {
	id: string
	title: string
	updatedAt: Date
	isPinned: boolean
	folderId: string  // 必填，不再是 nullable
}
```

- [ ] **Step 2: 修改 thread-atoms.ts - 替换 pinnedThreadsAtom 为有序数组**

```typescript
// apps/desktop/src/renderer/src/components/app-shell/atoms/thread-atoms.ts
// 删除: export const pinnedThreadsAtom = atom<Set<string>>(new Set<string>())
// 新增:
export const pinnedThreadIdsAtom = atom<string[]>([])

// 同时更新 Mock 数据，让 t1 属于 f1
export const threadsAtom = atom<Thread[]>([
	{
		id: 't1',
		title: 'Thread 1',
		updatedAt: new Date('2026-03-30'),
		isPinned: true,
		folderId: 'f1',  // 置顶 thread 也属于某个 folder
	},
	{
		id: 't2',
		title: 'Thread 2 in Folder A',
		updatedAt: new Date('2026-03-29'),
		isPinned: false,
		folderId: 'f1',
	},
	{
		id: 't3',
		title: 'Thread 3 in Folder A',
		updatedAt: new Date('2026-03-28'),
		isPinned: false,
		folderId: 'f1',
	},
	{
		id: 't4',
		title: 'Thread 4 in Folder B',
		updatedAt: new Date('2026-03-27'),
		isPinned: false,
		folderId: 'f2',
	},
	{
		id: 't5',
		title: 'Thread 5 Pinned',
		updatedAt: new Date('2026-03-26'),
		isPinned: true,
		folderId: 'f2',
	},
	{
		id: 't6',
		title: 'Thread 6 Pinned',
		updatedAt: new Date('2026-03-25'),
		isPinned: true,
		folderId: 'f1',
	},
])

export const foldersAtom = atom<Folder[]>([
	{ id: 'f1', title: 'Folder A', order: 0 },
	{ id: 'f2', title: 'Folder B', order: 1 },
])

// 初始化 pinnedThreadIdsAtom
export const pinnedThreadIdsAtom = atom<string[]>(['t1', 't5', 't6'])
```

- [ ] **Step 3: 提交**

```bash
git add apps/desktop/src/renderer/src/components/app-shell/types/thread.ts apps/desktop/src/renderer/src/components/app-shell/atoms/thread-atoms.ts
git commit -m "refactor(desktop): change pinnedThreadsAtom to ordered array and update Thread type"
```

---

## Task 2: 修改 ThreadCell 支持置顶交互

**Files:**
- Modify: `apps/desktop/src/renderer/src/components/app-shell/sidebar/cell/ThreadCell.tsx:1-104`

- [ ] **Step 1: 添加拖拽所需的状态和回调 props**

```typescript
// 新增 props
export interface ThreadCellProps {
	thread: Thread
	isPinned?: boolean
	onTogglePin?: (id: string) => void
	onDelete?: (id: string) => void
	draggable?: boolean           // 新增
	onDragStart?: (e: DragEvent) => void  // 新增
	onDragEnd?: (e: DragEvent) => void    // 新增
	className?: string
}
```

- [ ] **Step 2: 修改组件实现 - 添加拖拽事件，修改置顶图标点击行为**

```typescript
import { useState, useEffect, type DragEvent } from 'react'
// ...

export function ThreadCell({
	thread,
	isPinned = false,
	onTogglePin,
	onDelete,
	draggable = false,
	onDragStart,
	onDragEnd,
	className,
}: Readonly<ThreadCellProps>) {
	const [isConfirming, setIsConfirming] = useState(false)

	// 置顶图标点击处理
	const handlePinClick = (e: React.MouseEvent) => {
		e.stopPropagation()
		onTogglePin?.(thread.id)
	}

	return (
		<Cell
			className={cn(/* ... */)}
			draggable={draggable}
			onDragStart={onDragStart}
			onDragEnd={onDragEnd}
		>
			{/* Left icon area: show pin icon */}
			<CellIcon className="cursor-pointer" onClick={handlePinClick}>
				<HugeiconsIcon
					icon={PinIcon}
					className={cn(
						'text-muted-foreground h-3.5 w-3.5 transition-opacity',
						isPinned
							? 'opacity-100'
							: 'opacity-0 group-hover:opacity-100'
					)}
				/>
			</CellIcon>
			{/* ... rest unchanged */}
		</Cell>
	)
}
```

- [ ] **Step 3: 提交**

```bash
git add apps/desktop/src/renderer/src/components/app-shell/sidebar/cell/ThreadCell.tsx
git commit -m "feat(desktop): add drag support to ThreadCell and pin toggle"
```

---

## Task 3: 修改 PinnedSection 支持置顶区拖拽排序

**Files:**
- Modify: `apps/desktop/src/renderer/src/components/app-shell/sidebar/PinnedSection.tsx:1-29`

- [ ] **Step 1: 实现完整的拖拽排序逻辑**

```typescript
import { useState, useCallback, useRef, type DragEvent } from 'react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { threadsAtom, pinnedThreadIdsAtom } from '../atoms/thread-atoms'
import { ThreadCell } from './cell/ThreadCell'
import { TitleCell } from './cell/TitleCell'

export function PinnedSection() {
	const threads = useAtomValue(threadsAtom)
	const [pinnedThreadIds, setPinnedThreadIds] = useAtom(pinnedThreadIdsAtom)
	const [draggedId, setDraggedId] = useState<string | null>(null)
	const threadRefs = useRef<Map<string, HTMLDivElement>>(new Map())

	const pinnedThreads = pinnedThreadIds
		.map((id) => threads.find((t) => t.id === id))
		.filter((t): t is NonNullable<typeof t> => t != null)

	const handleDragStart = useCallback((e: DragEvent, threadId: string) => {
		setDraggedId(threadId)
		e.dataTransfer.effectAllowed = 'move'
		e.dataTransfer.setData('text/plain', threadId)
	}, [])

	const handleDragEnd = useCallback(() => {
		setDraggedId(null)
	}, [])

	const handleDragOver = useCallback(
		(e: DragEvent, targetId: string) => {
			e.preventDefault()
			if (draggedId === targetId) return
			e.dataTransfer.dropEffect = 'move'

			// 使用 ThreadCell 中点判断
			const targetEl = threadRefs.current.get(targetId)
			if (!targetEl) return

			const rect = targetEl.getBoundingClientRect()
			const midY = rect.top + rect.height / 2
			const position: 'before' | 'after' = e.clientY < midY ? 'before' : 'after'

			// 立即更新顺序
			setPinnedThreadIds((prev) => {
				const list = [...prev]
				const draggedIdx = list.indexOf(draggedId)
				const targetIdx = list.indexOf(targetId)
				if (draggedIdx === -1 || targetIdx === -1) return prev
				if (draggedIdx === targetIdx) return prev

				const [dragged] = list.splice(draggedIdx, 1)
				const newIdx = position === 'before' ? targetIdx : targetIdx + 1
				list.splice(newIdx, 0, dragged)
				return list
			})
		},
		[draggedId, setPinnedThreadIds]
	)

	if (pinnedThreads.length === 0) {
		return null
	}

	return (
		<section className="flex flex-col gap-1 px-2 py-2">
			<div className="flex flex-col gap-0.5">
				{pinnedThreads.map((thread) => (
					<div
						key={thread.id}
						ref={(el) => {
							if (el) threadRefs.current.set(thread.id, el)
							else threadRefs.current.delete(thread.id)
						}}
						onDragOver={(e) => handleDragOver(e, thread.id)}
					>
						<ThreadCell
							thread={thread}
							isPinned={true}
							draggable={true}
							onDragStart={(e) => handleDragStart(e, thread.id)}
							onDragEnd={handleDragEnd}
						/>
					</div>
				))}
			</div>
		</section>
	)
}
```

- [ ] **Step 2: 提交**

```bash
git add apps/desktop/src/renderer/src/components/app-shell/sidebar/PinnedSection.tsx
git commit -m "feat(desktop): implement drag-to-reorder in PinnedSection"
```

---

## Task 4: 修改 FolderView 简化分界逻辑并添加移动动画

**Files:**
- Modify: `apps/desktop/src/renderer/src/components/app-shell/sidebar/thread/FolderView.tsx:1-209`

- [ ] **Step 1: 修改 FolderView - 简化拖拽分界为中点判断，添加整体移动动画**

```typescript
import { useState, useCallback, useRef, type DragEvent } from 'react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
	foldersAtom,
	threadsAtom,
	openFoldersAtom,
} from '../../atoms/thread-atoms'
import { FolderCell } from '../cell/FolderCell'
import { ThreadCell } from '../cell/ThreadCell'

export function FolderView() {
	const [openFolders, setOpenFolders] = useAtom(openFoldersAtom)
	const folders = useAtomValue(foldersAtom)
	const threads = useAtomValue(threadsAtom)
	const setFolders = useSetAtom(foldersAtom)

	// Drop indicator state
	const [dropTargetId, setDropTargetId] = useState<string | null>(null)
	const [dropPosition, setDropPosition] = useState<'before' | 'after' | null>(null)
	const [draggedFolderId, setDraggedFolderId] = useState<string | null>(null)

	// Refs for each folder cell to calculate drop position
	const folderCellRefs = useRef<Map<string, HTMLDivElement>>(new Map())

	const handleDragStart = useCallback((e: DragEvent, folderId: string) => {
		setDraggedFolderId(folderId)
		e.dataTransfer.effectAllowed = 'move'
		e.dataTransfer.setData('text/plain', folderId)
	}, [])

	const handleDragEnd = useCallback(() => {
		setDropTargetId(null)
		setDropPosition(null)
		setDraggedFolderId(null)
	}, [])

	const handleDragOver = useCallback(
		(e: DragEvent, folderId: string) => {
			e.preventDefault()
			if (draggedFolderId === folderId) return
			e.dataTransfer.dropEffect = 'move'

			const cellEl = folderCellRefs.current.get(folderId)
			if (!cellEl) return

			const rect = cellEl.getBoundingClientRect()
			const midY = rect.top + rect.height / 2
			const position: 'before' | 'after' = e.clientY < midY ? 'before' : 'after'

			setDropTargetId(folderId)
			setDropPosition(position)

			// 立即更新顺序
			setFolders((prev) => {
				const folderList = [...prev]
				const draggedIndex = folderList.findIndex((f) => f.id === draggedFolderId)
				const targetIndex = folderList.findIndex((f) => f.id === folderId)
				if (draggedIndex === -1 || targetIndex === -1) return prev
				if (draggedIndex === targetIndex) return prev

				const [draggedFolder] = folderList.splice(draggedIndex, 1)
				let newTargetIndex = folderList.findIndex((f) => f.id === folderId)

				if (position === 'before') {
					folderList.splice(newTargetIndex, 0, draggedFolder)
				} else {
					folderList.splice(newTargetIndex + 1, 0, draggedFolder)
				}

				return folderList.map((f, i) => ({ ...f, order: i }))
			})
		},
		[draggedFolderId, setFolders]
	)

	const handleDrop = useCallback((e: DragEvent, _targetFolderId: string) => {
		e.preventDefault()
		setDropTargetId(null)
		setDropPosition(null)
		setDraggedFolderId(null)
	}, [])

	const handleToggleFolder = (folderId: string) => {
		setOpenFolders((prev) => {
			const next = new Set(prev)
			if (next.has(folderId)) {
				next.delete(folderId)
			} else {
				next.add(folderId)
			}
			return next
		})
	}

	// 过滤掉已置顶的 thread（Folder 内不显示置顶 thread）
	const folderContents = folders.map((folder) => ({
		folder,
		threads: threads.filter(
			(t) => t.folderId === folder.id && !pinnedThreadIdsAtom.some((id) => id === t.id)
		),
	}))

	return (
		<div className="flex flex-col gap-0.5">
			{folderContents.map(({ folder, threads: folderThreads }) => {
				const isOpen = openFolders.has(folder.id)
				const isDropTarget = dropTargetId === folder.id
				const isDragging = draggedFolderId === folder.id
				return (
					<div
						key={folder.id}
						className="transition-transform duration-200 ease-out"
						onDragOver={(e) => handleDragOver(e, folder.id)}
						onDrop={(e) => handleDrop(e, folder.id)}
						onDragLeave={handleDragEnd}
					>
						{/* FolderCell 自身作为 drag target */}
						<div
							ref={(el) => {
								if (el) folderCellRefs.current.set(folder.id, el)
								else folderCellRefs.current.delete(folder.id)
							}}
						>
							<FolderCell
								id={folder.id}
								title={folder.title}
								isExpanded={isOpen}
								onToggle={handleToggleFolder}
								onAddThread={(_folderId) => {
									// TODO: implement add thread to folder
								}}
								dropPosition={isDropTarget ? dropPosition : null}
								isDragging={isDragging}
								draggable={true}
								onDragStart={(e) => handleDragStart(e, folder.id)}
								onDragEnd={handleDragEnd}
							/>
						</div>
						{/* Thread list with overall animation */}
						<div
							className="transition-[grid-template-rows] duration-200 ease-in-out"
							style={{
								display: 'grid',
								gridTemplateRows: isOpen ? '1fr' : '0fr',
							}}
						>
							<div style={{ overflow: 'hidden' }}>
								{folderThreads.map((thread) => (
									<ThreadCell
										key={thread.id}
										thread={thread}
										draggable={false}
									/>
								))}
							</div>
						</div>
					</div>
				)
			})}
		</div>
	)
}
```

**注意**: 上述代码有一个 bug - `pinnedThreadIdsAtom` 是 atom 不是 atomValue，需要修复:

```typescript
// 在组件顶部添加
const pinnedThreadIds = useAtomValue(pinnedThreadIdsAtom)

// 然后使用
threads.filter(
	(t) => t.folderId === folder.id && !pinnedThreadIds.includes(t.id)
)
```

- [ ] **Step 2: 提交**

```bash
git add apps/desktop/src/renderer/src/components/app-shell/sidebar/thread/FolderView.tsx
git commit -m "feat(desktop): simplify folder drag boundary to mid-point, add smooth animation"
```

---

## Task 5: 修改 AppSidebar 确保 PinnedSection 在 ProjectSection 之前

**Files:**
- Modify: `apps/desktop/src/renderer/src/components/app-shell/AppSidebar.tsx:1-20`

- [ ] **Step 1: 确保 PinnedSection 导入并放置在正确位置**

```typescript
import { ScrollArea } from '@acme-ai/ui/foundation'
import { PinnedSection } from './sidebar/PinnedSection'
import { ProjectSection } from './sidebar/ProjectSection'
import { SidebarFooter } from './sidebar/SidebarFooter'
import { SidebarHeader } from './sidebar/SidebarHeader'

export function AppSidebar(): React.JSX.Element {
	return (
		<aside className="text-secondary-foreground relative flex w-[256px] shrink-0 flex-col">
			<SidebarHeader />
			<ScrollArea className="flex-1">
				{/* Pinned Section - 置顶区 */}
				<PinnedSection />
				{/* Project Section - 文件夹区 */}
				<ProjectSection />
			</ScrollArea>
			<SidebarFooter />
		</aside>
	)
}
```

- [ ] **Step 2: 提交**

```bash
git add apps/desktop/src/renderer/src/components/app-shell/AppSidebar.tsx
git commit -m "feat(desktop): render PinnedSection before ProjectSection in sidebar"
```

---

## Task 6: 验证与测试

- [ ] **Step 1: 运行 TypeScript 检查**

```bash
cd apps/desktop && bunx tsc --noEmit
```

- [ ] **Step 2: 运行 linter**

```bash
cd apps/desktop && bunx oxlint
```

- [ ] **Step 3: 运行 formatter**

```bash
cd apps/desktop && bunx oxfmt
```

- [ ] **Step 4: 提交**

```bash
git add -A
git commit -m "chore(desktop): run linter and formatter"
```

---

## 实施检查清单

| 任务 | 状态 |
|------|------|
| Task 1: 修改数据类型 | ☐ |
| Task 2: 修改 ThreadCell | ☐ |
| Task 3: 修改 PinnedSection | ☐ |
| Task 4: 修改 FolderView | ☐ |
| Task 5: 修改 AppSidebar | ☐ |
| Task 6: 验证测试 | ☐ |

---

## 潜在问题

1. **循环依赖**: `pinnedThreadIdsAtom` 在 `thread-atoms.ts` 中定义，但在 `FolderView.tsx` 中使用时需要确保 import 正确
2. **性能**: 拖拽时频繁更新状态，需要确保 transition 动画不影响性能
3. **Folder 展开时的拖拽**: 当 Folder 展开时，拖拽 FolderCell 会导致整个列表重新渲染，需验证动画流畅度
