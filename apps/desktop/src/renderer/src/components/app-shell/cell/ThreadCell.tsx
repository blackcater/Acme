import { Button } from '@acme-ai/ui/foundation'
import { cn } from '@acme-ai/ui/lib/utils'
import { PinIcon } from '@hugeicons/core-free-icons'
import { DeleteIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { formatDistanceToNow } from 'date-fns'

import type { Thread } from '../types/thread'
import { Cell, CellIcon, CellName, CellActions } from './Cell'

export interface ThreadCellProps {
	thread: Thread
	isPinned?: boolean
	onTogglePin?: (id: string) => void
	onDelete?: (id: string) => void
	className?: string
}

export function ThreadCell({
	thread,
	isPinned = false,
	onTogglePin: _onTogglePin,
	onDelete,
	className,
}: ThreadCellProps) {
	return (
		<Cell className={cn('text-left', className)}>
			{/* Left icon area: show pin icon on hover */}
			<CellIcon className="justify-center">
				<HugeiconsIcon
					icon={PinIcon}
					className={cn(
						'text-muted-foreground h-4 w-4 transition-opacity',
						isPinned
							? 'opacity-100'
							: 'opacity-0 group-hover:opacity-100'
					)}
				/>
			</CellIcon>

			{/* Name */}
			<CellName className="text-foreground">{thread.title}</CellName>

			{/* Tail: time + hover actions */}
			<div className="flex items-center gap-2">
				<span className="text-muted-foreground/60 text-xs">
					{formatDistanceToNow(thread.updatedAt, { addSuffix: true })}
				</span>
				<CellActions>
					<Button
						variant="ghost"
						size="icon-sm"
						onClick={(e) => {
							e.stopPropagation()
							onDelete?.(thread.id)
						}}
						className="h-6 w-6"
					>
						<HugeiconsIcon icon={DeleteIcon} className="h-3 w-3" />
					</Button>
				</CellActions>
			</div>
		</Cell>
	)
}
