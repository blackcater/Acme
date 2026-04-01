import { useState } from 'react'

import { cn } from '@acme-ai/ui'
import {
	Button,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@acme-ai/ui/foundation'
import {
	Folder01Icon,
	ArrowRight01Icon,
	PlusSignIcon,
	MoreHorizontalIcon,
	Folder02Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { Cell, CellIcon, CellName, CellActions } from './Cell'

export interface FolderCellProps {
	className?: string
	id: string
	title: string
	isExpanded: boolean
	isDragging?: boolean
	onToggle: (id: string) => void
	onAddThread?: (folderId: string) => void
	onRename?: (folderId: string) => void
	onDelete?: (folderId: string) => void
}

export function FolderCell({
	className,
	id,
	title,
	isExpanded,
	isDragging,
	onToggle,
	onAddThread,
	onRename,
	onDelete,
}: Readonly<FolderCellProps>) {
	const [isHovered, setIsHovered] = useState(false)
	const [isMenuOpen, setIsMenuOpen] = useState(false)

	const showActions = isHovered || isMenuOpen

	return (
		<Cell
			className={cn(
				'hover:bg-black/10 dark:hover:bg-white/10',
				!isDragging && 'cursor-grab active:cursor-grabbing',
				className
			)}
			onClick={() => onToggle(id)}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			{/* 左侧图标 */}
			<CellIcon>
				{/* 展开/折叠图标 - 带旋转动画 */}
				<HugeiconsIcon
					icon={ArrowRight01Icon}
					className={cn(
						'absolute size-3.5 opacity-0 transition-all duration-200 group-hover:opacity-100',
						isExpanded ? 'rotate-90' : 'rotate-0'
					)}
				/>
				{/* 实际的 folder 图标 */}
				<HugeiconsIcon
					icon={isExpanded ? Folder02Icon : Folder01Icon}
					className="text-foreground size-3.5 opacity-100 group-hover:opacity-0"
				/>
			</CellIcon>

			{/* 名称 */}
			<CellName>{title}</CellName>

			{/* 操作区 */}
			<CellActions
				className={cn(showActions ? 'opacity-100' : 'opacity-0')}
			>
				<DropdownMenu modal={false} onOpenChange={setIsMenuOpen}>
					<DropdownMenuTrigger
						asChild
						onClick={(e) => e.stopPropagation()}
					>
						<Button
							variant="ghost"
							size="icon-sm"
							className="h-6 w-6"
						>
							<HugeiconsIcon
								icon={MoreHorizontalIcon}
								className="size-3.5"
							/>
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem
							onClick={(e) => {
								e.stopPropagation()
								onRename?.(id)
							}}
						>
							Rename
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={(e) => {
								e.stopPropagation()
								onDelete?.(id)
							}}
						>
							Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
				<Button
					variant="ghost"
					size="icon-sm"
					onClick={(e) => {
						e.stopPropagation()
						onAddThread?.(id)
					}}
					className="h-6 w-6"
				>
					<HugeiconsIcon icon={PlusSignIcon} className="size-3.5" />
				</Button>
			</CellActions>
		</Cell>
	)
}
