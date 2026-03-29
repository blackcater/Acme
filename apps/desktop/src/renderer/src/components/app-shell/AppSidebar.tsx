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
