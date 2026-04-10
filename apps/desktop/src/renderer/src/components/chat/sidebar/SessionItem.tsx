import { Delete01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useAtomValue } from 'jotai'

import type { Session, Part } from '@/shared/types'
import { chatSessionAtomFamily } from '@renderer/atoms'

interface SessionItemProps {
	sessionId: string
	isActive: boolean
	onClick: () => void
	onDelete: () => void
}

/**
 * Get preview text from the first user message in a session
 */
function getPreviewFromSession(session: Session | null): string | null {
	if (!session?.turns?.length) return null

	const firstTurn = session.turns[0]
	const textPart = firstTurn.userMessage.parts.find(
		(p: Part) => p.type === 'text'
	)
	if (textPart && 'text' in textPart) {
		return textPart.text.slice(0, 100)
	}
	return null
}

/**
 * Get session title or "Untitled" if no title exists
 */
function getSessionTitle(session: Session | null): string {
	if (session?.name) {
		return session.name
	}
	return 'Untitled'
}

export function SessionItem({
	sessionId,
	isActive,
	onClick,
	onDelete,
}: SessionItemProps) {
	const session = useAtomValue(chatSessionAtomFamily(sessionId))
	const title = getSessionTitle(session)
	const preview = getPreviewFromSession(session)

	return (
		<div
			className={`group relative flex cursor-pointer flex-col gap-1 rounded-md px-3 py-2 transition-colors ${
				isActive
					? 'bg-accent text-accent-foreground'
					: 'hover:bg-muted/50'
			}`}
			onClick={onClick}
			onKeyDown={(e) => e.key === 'Enter' && onClick()}
			role="button"
			tabIndex={0}
		>
			<div className="flex items-center justify-between">
				<span className="truncate text-sm font-medium">{title}</span>
				<button
					onClick={(e) => {
						e.stopPropagation()
						onDelete()
					}}
					className="hover:text-destructive p-1 opacity-0 transition-opacity group-hover:opacity-100"
					aria-label="Delete session"
				>
					<HugeiconsIcon icon={Delete01Icon} size={14} />
				</button>
			</div>
			{preview && (
				<p className="text-muted-foreground truncate text-xs">
					{preview}
				</p>
			)}
		</div>
	)
}
