export type PartType =
	| 'text'
	| 'tool'
	| 'reasoning'
	| 'compaction'
	| 'file'
	| 'agent'

export interface TextPart {
	type: 'text'
	text: string
}

export interface ToolPart {
	type: 'tool'
	tool: string
	toolCallId: string
	input: Record<string, unknown>
	output?: string
	status: 'pending' | 'running' | 'completed' | 'error'
	error?: string
}

export interface ReasoningPart {
	type: 'reasoning'
	text: string
	summary?: string
}

export interface CompactionPart {
	type: 'compaction'
	message: string
}

export interface FilePart {
	type: 'file'
	path: string
	mimeType?: string
	data?: string
}

export interface AgentPart {
	type: 'agent'
	name: string
}

export type Part =
	| TextPart
	| ToolPart
	| ReasoningPart
	| CompactionPart
	| FilePart
	| AgentPart

export interface Message {
	id: string
	role: 'user' | 'assistant'
	parts: Part[]
	timestamp: number
}

export interface Turn {
	id: string
	userMessage: Message
	assistantParts: Part[]
	status: 'in_progress' | 'completed' | 'interrupted' | 'error'
	diffs?: FileDiff[]
	tokenUsage?: TokenUsage
}

export interface FileDiff {
	path: string
	before: string
	after: string
	status: 'created' | 'modified' | 'deleted'
}

export interface TokenUsage {
	inputTokens: number
	outputTokens: number
	totalTokens: number
}

export type EngineType = 'claude' | 'codex' | 'acp' | 'mock'

export interface Session {
	id: string
	name?: string
	engineType: EngineType
	engineConfig: EngineConfig
	status: 'active' | 'archived'
	createdAt: number
	updatedAt: number
	turns: Turn[]
}

export interface SessionSummary {
	id: string
	name?: string
	engineType: EngineType
	status: 'active' | 'archived'
	createdAt: number
	updatedAt: number
	turnCount: number
	preview?: string
}

export interface EngineConfig {
	model?: string
	apiKey?: string
	baseUrl?: string
	[key: string]: unknown
}

export interface PermissionRequest {
	requestId: string
	tool: string
	params: Record<string, unknown>
	patterns: string[]
	alwaysPatterns: string[]
	metadata?: Record<string, unknown>
}

export interface StreamDelta {
	type:
		| 'text'
		| 'tool_start'
		| 'tool_end'
		| 'reasoning'
		| 'compaction'
		| 'turn_complete'
		| 'error'
	data: unknown
	turnId?: string
	partId?: string
}
