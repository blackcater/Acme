# AFFiNE 风格 Electron 应用外壳设计

## 概述

实现类似 AFFiNE 的 Electron 应用整体界面布局，包括顶部导航栏、可折叠侧边栏和主内容区。样式以 Tailwind CSS 为主，利用 `packages/ui` 中已有的设计系统和 CSS 变量。

## 目录结构

```
apps/desktop/src/renderer/src/
├── components/
│   └── app-shell/
│       ├── AppShell.tsx          # 主应用外壳
│       ├── AppHeader.tsx         # 顶部导航栏
│       ├── AppSidebar.tsx        # 可折叠侧边栏
│       ├── NavigationButtons.tsx  # 导航按钮（返回/前进）
│       └── index.ts
├── hooks/
│   └── use-sidebar.ts            # 侧边栏状态管理
└── lib/
    └── electron.ts               # Electron 环境检测
```

## 组件设计

### 1. AppShell

主应用外壳组件，组合 Header、Sidebar 和 MainContent。

```tsx
interface AppShellProps {
  children: React.ReactNode
  enableBlur?: boolean   // 毛玻璃效果（Electron 环境）
  enableNoise?: boolean  // 噪声纹理（Electron 环境）
}

const AppShell = ({ children, enableBlur, enableNoise }: AppShellProps) => {
  return (
    <div className={cn(
      "flex h-screen flex-col bg-background",
      enableBlur && "backdrop-blur-xl",
      enableNoise && "bg-noise"
    )}>
      <AppHeader />
      <div className="flex flex-1 overflow-hidden">
        <AppSidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
```

**样式要点：**
- 外层：`flex h-screen flex-col bg-background`
- 内容区：`flex flex-1 overflow-hidden`

### 2. AppHeader

顶部导航栏，高度 40px，包含导航按钮。

```tsx
<div className="flex h-10 w-full shrink-0 items-center border-b border-border bg-sidebar px-4 gap-2">
  <NavigationButtons />
</div>
```

**样式要点：**
- 高度：`h-10`（40px）
- 背景：`bg-sidebar`
- 边框：`border-b border-border`

### 3. NavigationButtons

返回/前进导航按钮，使用 `packages/ui` 的 Button 组件。

```tsx
// 使用 Button 组件的 icon-sm variant
<div className="flex items-center gap-1">
  <Button variant="ghost" size="icon-sm" aria-label="返回">
    <ChevronLeftIcon />
  </Button>
  <Button variant="ghost" size="icon-sm" aria-label="前进">
    <ChevronRightIcon />
  </Button>
</div>
```

### 4. AppSidebar

可折叠侧边栏，支持 hover 展开和宽度调整。

```tsx
interface AppSidebarProps {
  defaultWidth?: number   // 默认宽度
  minWidth?: number       // 最小宽度 248
  maxWidth?: number       // 最大宽度 480
}
```

**状态管理 (useSidebar hook)：**
```tsx
interface SidebarState {
  isOpen: boolean           // 是否完全展开
  isHovering: boolean       // 是否悬停展开
  width: number             // 当前宽度
  setOpen: (open: boolean) => void
  setHovering: (hovering: boolean) => void
  setWidth: (width: number) => void
}
```

**样式要点：**
```tsx
<div className={cn(
  "relative flex shrink-0 flex-col bg-sidebar transition-all duration-200",
  "border-r border-sidebar-border",
  isOpen ? "w-64" : "w-12",
  isHovering && !isOpen && "absolute left-0 top-0 z-10 w-64 shadow-lg"
)}>
```

**拖拽调整实现：**
使用原生 `mousedown/mousemove/mouseup` 事件实现侧边栏边缘拖拽调整宽度。

### 5. 侧边栏内部结构（基础占位）

```
AppSidebarContent
├── SidebarHeader        # 头部区（工作区选择器占位）
│   └── WorkspaceSelectorPlaceholder
├── SidebarSearch        # 搜索入口
│   └── SearchInputPlaceholder
├── SidebarNav           # 导航菜单
│   ├── NavItem (All Docs)
│   └── NavItem (Settings)
└── SidebarFooter        # 底部操作区
```

所有子组件最初为**占位空壳**，仅包含基础布局结构，后续填充具体功能。

## Electron 环境检测

```tsx
// lib/electron.ts
export const isElectron = typeof window !== 'undefined' &&
  // @ts-expect-error - Electron 特有
  window.electron !== undefined
```

## 毛玻璃与噪声纹理

**毛玻璃效果：** 通过 Tailwind 的 `backdrop-blur-xl` 类实现

**噪声纹理：** 在 `globals.css` 中已有 `.bg-noise` 工具类：
```css
.bg-noise {
  position: relative;
}
.bg-noise::before {
  position: absolute;
  inset: 0;
  content: "";
  background-image: url('./noise.avif');
  background-repeat: repeat;
  background-size: 50px;
  pointer-events: none;
}
```

## CSS 变量系统

利用 `packages/ui/src/styles/globals.css` 中已有的变量：

| 变量                   | 用途             |
| ---------------------- | ---------------- |
| `--sidebar`            | 侧边栏背景色     |
| `--sidebar-foreground` | 侧边栏文字颜色   |
| `--sidebar-border`     | 侧边栏边框色     |
| `--sidebar-accent`     | 侧边栏强调色     |
| `--background`         | 主内容区背景     |
| `--foreground`         | 主内容区文字颜色 |
| `--border`             | 边框色           |

## 主题支持

利用已有的 dark mode 变量支持亮色/暗色主题：

- 亮色主题：使用 `--sidebar: oklch(0.985 0 0)` 等
- 暗色主题：自动通过 `.dark` 选择器切换

`ThemeProvider` 已存在于 `apps/desktop/src/renderer/src/components/providers/`

## 实现依赖

- 使用 `packages/ui` 中的基础组件（Button、ScrollArea 等）
- 使用 `cn()` 工具函数合并类名
- 侧边栏宽度状态使用 React useState 管理

## 验收标准

1. ✅ 应用外壳包含 Header + Sidebar + Content 三部分
2. ✅ 侧边栏支持展开/收起切换
3. ✅ 侧边栏支持宽度调整（拖拽，248px - 480px）
4. ✅ 顶部导航栏显示导航按钮
5. ✅ 侧边栏显示基础导航结构（占位组件）
6. ✅ 支持亮色/暗色主题切换
7. ✅ 支持 Electron 环境下的毛玻璃/噪声效果
8. ✅ 样式以 Tailwind 类 + CSS 变量为主
