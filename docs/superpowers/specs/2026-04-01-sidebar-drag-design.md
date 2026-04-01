# Sidebar 拖拽效果改进设计

## 概述

改进 desktop 应用侧边栏的拖拽效果，新增置顶区功能，优化拖拽分界逻辑，消除抖动。

## 目标

1. 实现 thread 置顶区（单一区域，点击置顶，自动添加到结尾）
2. 置顶区内的 thread 可拖动排序
3. 置顶的 thread 在原 Folder 区不再显示
4. 消除 Folder 拖拽抖动，改进分界逻辑

## 数据结构

### Atom 变更 (`thread-atoms.ts`)

```typescript
// 新增：置顶 thread ID 有序数组
export const pinnedThreadIdsAtom = atom<string[]>([])

// threadsAtom 保持不变
interface Thread {
  id: string
  title: string
  updatedAt: Date
  isPinned: boolean  // 标记是否在置顶区
  folderId: string    // 所属 Folder（必填），取消置顶时回归此 Folder
}
```

### Mock 数据更新

在 `thread-atoms.ts` 中增加更多置顶 thread：

```typescript
export const threadsAtom = atom<Thread[]>([
  { id: 't1', title: 'Thread 1', updatedAt: new Date('2026-03-30'), isPinned: true, folderId: 'f1' },
  { id: 't2', title: 'Thread 2 in Folder A', updatedAt: new Date('2026-03-29'), isPinned: false, folderId: 'f1' },
  // ...
])

export const pinnedThreadIdsAtom = atom<string[]>(['t1'])
```

## 组件结构

```
AppSidebar
├── SidebarHeader
├── ScrollArea
│   ├── PinnedSection      # 支持置顶区拖拽排序
│   └── ProjectSection
│       ├── ThreadTitleCell
│       └── FolderView
│           └── FolderCell
│               └── ThreadCell  # 不可拖拽
└── SidebarFooter
```

## 功能设计

### 1. 置顶区（修改 PinnedSection）

**位置**：SidebarHeader 下方，ScrollArea 内部，ProjectSection 之前

**留空**：上下各 8px padding，与上下区域区分

**渲染逻辑**：
```typescript
const pinnedThreads = useAtomValue(pinnedThreadIdsAtom).map(
  id => threads.find(t => t.id === id)
)
```

**拖拽排序**：
- 置顶区内的 ThreadCell 可拖动
- 拖动时立即生效（dragover 时更新 pinnedThreadIdsAtom）
- 使用 ThreadCell 中点判断 before/after

### 2. 置顶交互

**点击置顶图标**：
```
1. thread.isPinned = true
2. pinnedThreadIdsAtom.push(thread.id)  // 添加到结尾
3. 该 thread 在 FolderView 中不再显示
```

**取消置顶**：
```
1. thread.isPinned = false
2. 从 pinnedThreadIdsAtom 中移除
3. thread 回到原 folder（folderId 不变）
```

**排序规则**：按加入置顶的先后顺序

### 3. FolderView 拖拽分界（简化）

**规则**：统一使用 FolderCell 中点作为分界

```
鼠标位置 < FolderCell 中点 → before（排之前）
鼠标位置 >= FolderCell 中点 → after（排之后）
```

**动画**：
- Folder 容器（FolderCell + 展开的 ThreadCell）整体使用 CSS transition
- `transition: transform 200ms ease-out`

### 4. ThreadCell 变更

**置顶图标**：
- 未置顶：hover 时显示图标，点击置顶
- 已置顶：显示图标（opacity-100），点击取消置顶

**拖拽属性**：
- 仅在置顶区时 `draggable={true}`
- Folder 内的 ThreadCell `draggable={false}`

## 文件变更

| 文件                | 操作                                   |
| ------------------- | -------------------------------------- |
| `thread-atoms.ts`   | 新增 `pinnedThreadIdsAtom`             |
| `PinnedSection.tsx` | 修改为支持置顶区拖拽排序               |
| `FolderView.tsx`    | 简化分界逻辑，统一用中点，添加移动动画 |
| `ThreadCell.tsx`    | 置顶图标点击处理，拖拽事件             |
| `types/thread.ts`   | 无需变更                               |

## 分界示意

### Folder 拖拽

```
         中点
          ↓
    ┌─────────────────┐
    │   FolderCell    │ ← 超过中点 = after
    └─────────────────┘
           ↓
    ┌─────────────────┐
    │   ThreadCell    │
    └─────────────────┘
    ┌─────────────────┐
    │   ThreadCell    │
    └─────────────────┘
```

### 置顶区拖拽

```
    ┌─────────────────┐
    │   ThreadCell    │ ← 超过中点 = after
    └─────────────────┘
    ┌─────────────────┐
    │   ThreadCell    │
    └─────────────────┘
```

## 移动动画

**实现方式**：TailwindCSS transition

```html
<div class="transition-transform duration-200 ease-out">
  <!-- Folder container -->
</div>
```

**展开/折叠动画**：
```html
<div class="transition-[grid-template-rows] duration-200 ease-in-out">
  <!-- Thread list -->
</div>
```

## 状态流转

```
                    点击置顶图标
    Folder ──────────────────────────→ 置顶区结尾
    Thread                              (pinnedThreadIdsAtom.push)

                    点击取消置顶
    置顶区 ───────────────────────────→ 原 Folder
    Thread                              (isPinned=false, 保留 folderId)

                    拖拽排序
    置顶区 ───────────────────────────→ 置顶区
    Thread                              (pinnedThreadIdsAtom reorder)
```
