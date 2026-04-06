// Session types

export interface Message {
	id: string
	role: 'user' | 'assistant' | 'system'
	content: string
	timestamp: number
	isStreaming?: boolean
	attachments?: FileAttachment[]
}

export interface FileAttachment {
	name: string
	path: string
	size: number
	mimeType?: string
}

export interface Session {
	id: string
	name?: string
	vaultId: string
	messages: Message[]
	createdAt: number
	updatedAt: number
}

export type SessionEvent =
	| { type: 'text_delta'; content: string }
	| { type: 'text_complete'; content: string }
	| { type: 'complete' }
	| { type: 'error'; message: string }
