/**
 * Message role for conversation flow
 */
export enum MessageRole {
	System = 'system',
	User = 'user',
	Assistant = 'assistant',
	Tool = 'tool',
}

/**
 * Message represents a single message in a conversation
 */
export interface Message {
	id: string
	threadId: string
	role: MessageRole
	content: MessageContent[]
	usage?: TokenUsage
}

export type MessageContent =
	| TextContent
	| ImageContent
	| ToolUseContent
	| ToolResultContent

export interface TextContent {
	type: 'text'
	text: string
}

export interface ImageContent {
	type: 'image'
	source: {
		type: 'base64' | 'url'
		value: string
		mimeType: string
	}
}

export interface ToolUseContent {
	type: 'tool_use'
	toolUseId: string
	toolName: string
	input: Record<string, unknown>
}

export interface ToolResultContent {
	type: 'tool_result'
	toolUseId: string
	content: string
	isError?: boolean
}

/**
 * Token usage tracking
 */
export interface TokenUsage {
	inputTokens: number
	outputTokens: number
	totalTokens: number
	contextTokens: number
	costUsd?: number
	costCny?: number
	cacheReadTokens?: number
	cacheCreationTokens?: number
}
