import { useChatSession } from '@renderer/hooks/useChatSession'

/**
 * Button to create a new chat session
 */
export function NewSessionButton() {
	const { createSession } = useChatSession()

	const handleClick = async () => {
		await createSession('mock')
	}

	return (
		<button
			onClick={handleClick}
			className="border-border text-muted-foreground hover:border-primary hover:text-primary flex w-full items-center justify-center gap-2 rounded-md border-2 border-dashed px-3 py-2 text-sm transition-colors"
		>
			+ New Session
		</button>
	)
}
