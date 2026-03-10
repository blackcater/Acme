/**
 * Message role for conversation flow
 */
export enum MessageRole {
	User = 'user',
	Assistant = 'assistant',
	Tool = 'tool',
}

/**
 * Message represents a single message in a conversation
 */
export interface Message {}

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
