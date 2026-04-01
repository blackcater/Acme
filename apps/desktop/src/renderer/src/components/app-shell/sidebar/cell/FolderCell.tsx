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
	const [isMenuOpen, setIsMenuOpen] = useState(false)

	const showActions = isMenuOpen

	return (
		<Cell
			className={cn(
				'group-hover:bg-black/10 dark:group-hover:bg-white/10',
				'hover:bg-black/10 dark:hover:bg-white/10',
				!isDragging && 'cursor-grab active:cursor-grabbing',
				className
			)}
			data-cell="folder"
			onClick={() => onToggle(id)}
		>
			{/* 左侧图标 */}
			<CellIcon>
				{/* 文件夹图标 - 始终显示 */}
				<HugeiconsIcon
					icon={isExpanded ? Folder02Icon : Folder01Icon}
					className="text-foreground size-3.5"
				/>
				{/* 展开箭头 - 仅在 hover 时显示 */}
				<HugeiconsIcon
					icon={ArrowRight01Icon}
					className={cn(
						'text-foreground absolute size-3.5 transition-all duration-200',
						'opacity-0 group-hover:opacity-100',
						isExpanded ? 'rotate-90' : 'rotate-0'
					)}
				/>
			</CellIcon>

			{/* 名称 */}
			<CellName>{title}</CellName>

			{/* 操作区 */}
			<CellActions
				className={cn(
					'transition-opacity duration-150',
					showActions
						? 'opacity-100'
						: 'opacity-0 group-hover:opacity-100'
				)}
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
