/**
 * Thread status for workflow tracking
 *
 * Agents can update this to reflect the current state of the conversation
 */
export enum ThreadStatus {
	Todo = 'todo',
	InProgress = 'in_progress',
	NeedsReview = 'needs_review',
	Done = 'done',
	Cancelled = 'cancelled',
}

/**
 * Thread represents a conversation scope
 */
export interface Thread {
	id: string
	vaultId: string
	name?: string // Optional user-defined name
	status?: ThreadStatus
	lastReadMessageId?: string // ID of the last message the user has read
	createdAt: Date
	lastUsedAt: Date
}
