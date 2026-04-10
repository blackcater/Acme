import { useChatSession } from '@renderer/hooks'

import { NewSessionButton } from './NewSessionButton'
import { SessionItem } from './SessionItem'

/**
 * Session list container for the chat sidebar
 */
export function SessionList() {
	const { sessionIds, activeId, switchSession, deleteSession } =
		useChatSession()

	return (
		<div className="flex flex-col gap-2 p-2">
			<NewSessionButton />

			{sessionIds.length === 0 ? (
				<p className="text-muted-foreground px-3 py-4 text-center text-sm">
					No sessions yet
				</p>
			) : (
				<div className="flex flex-col gap-1">
					{sessionIds.map((sessionId) => (
						<SessionItem
							key={sessionId}
							sessionId={sessionId}
							isActive={sessionId === activeId}
							onClick={() => switchSession(sessionId)}
							onDelete={() => deleteSession(sessionId)}
						/>
					))}
				</div>
			)}
		</div>
	)
}
