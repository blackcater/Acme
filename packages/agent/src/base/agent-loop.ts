import { streamText, type CoreMessage } from 'ai'
import type {
	AgentContext,
	AgentEvent,
	AgentEventSink,
	AgentLoopConfig,
	AgentMessage,
	ToolResultMessage,
} from './types'

/**
 * Run agent loop with new messages
 */
export async function runAgentLoop(
	prompts: AgentMessage[],
	context: AgentContext,
	config: AgentLoopConfig,
	emit: AgentEventSink,
	signal?: AbortSignal,
): Promise<AgentMessage[]> {
	const newMessages: AgentMessage[] = [...prompts]
	const currentContext: AgentContext = {
		...context,
		messages: [...context.messages, ...prompts],
	}

	await emit({ type: 'agent_start' })
	await emit({ type: 'turn_start' })

	for (const prompt of prompts) {
		await emit({ type: 'message_start', message: prompt })
		await emit({ type: 'message_end', message: prompt })
	}

	await runLoop(currentContext, newMessages, config, signal, emit)
	return newMessages
}

/**
 * Main loop logic
 */
async function runLoop(
	currentContext: AgentContext,
	newMessages: AgentMessage[],
	config: AgentLoopConfig,
	signal: AbortSignal | undefined,
	emit: AgentEventSink,
): Promise<void> {
	let firstTurn = true
	let pendingMessages: AgentMessage[] = (await config.getSteeringMessages?.()) || []

	while (true) {
		let hasMoreToolCalls = true

		while (hasMoreToolCalls || pendingMessages.length > 0) {
			if (!firstTurn) {
				await emit({ type: 'turn_start' })
			} else {
				firstTurn = false
			}

			if (pendingMessages.length > 0) {
				for (const message of pendingMessages) {
					await emit({ type: 'message_start', message })
					await emit({ type: 'message_end', message })
					currentContext.messages.push(message)
					newMessages.push(message)
				}
				pendingMessages = []
			}

			const message = await streamAssistantResponse(currentContext, config, signal, emit)
			newMessages.push(message)

			if (message.stopReason === 'error' || message.stopReason === 'abort') {
				await emit({ type: 'turn_end', message, toolResults: [] })
				await emit({ type: 'agent_end', messages: newMessages })
				return
			}

			const toolCalls = message.content.filter((c) => c.type === 'toolCall')
			hasMoreToolCalls = toolCalls.length > 0

			const toolResults: ToolResultMessage[] = []
			if (hasMoreToolCalls) {
				toolResults.push(...(await executeToolCalls(currentContext, message, config, signal, emit)))

				for (const result of toolResults) {
					currentContext.messages.push(result)
					newMessages.push(result)
				}
			}

			await emit({ type: 'turn_end', message, toolResults })

			pendingMessages = (await config.getSteeringMessages?.()) || []
		}

		const followUpMessages = (await config.getFollowUpMessages?.()) || []
		if (followUpMessages.length > 0) {
			pendingMessages = followUpMessages
			continue
		}

		break
	}

	await emit({ type: 'agent_end', messages: newMessages })
}

/**
 * Stream assistant response from LLM
 */
async function streamAssistantResponse(
	context: AgentContext,
	config: AgentLoopConfig,
	signal: AbortSignal | undefined,
	emit: AgentEventSink,
): Promise<AgentMessage> {
	let messages = context.messages

	if (config.transformContext) {
		messages = await config.transformContext(messages, signal)
	}

	const llmMessages = config.convertToLlm
		? config.convertToLlm(messages)
		: messages as unknown as CoreMessage[]

	const model = 'gpt-4o' // TODO: make configurable

	const result = streamText({
		model,
		messages: llmMessages,
		tools: context.tools?.length
			? {
					read_file: {
						description: 'Read file contents',
						parameters: {
							type: 'object',
							properties: {
								path: { type: 'string' },
							},
							required: ['path'],
						},
					},
				}
			: undefined,
		abortSignal: signal,
	})

	let partialMessage: AgentMessage | null = null

	for await (const event of result.fullStream) {
		switch (event.type) {
			case 'text-delta':
				if (!partialMessage) {
					partialMessage = createAssistantMessage('')
					context.messages.push(partialMessage)
					emit({ type: 'message_start', message: { ...partialMessage } })
				}
				partialMessage.content = [{ type: 'text', text: event.textDelta }]
				emit({ type: 'message_update', message: { ...partialMessage }, delta: event.textDelta })
				break

			case 'tool-call':
				if (!partialMessage) {
					partialMessage = createAssistantMessage('')
					context.messages.push(partialMessage)
					emit({ type: 'message_start', message: { ...partialMessage } })
				}
				partialMessage.content.push({
					type: 'toolCall',
					id: event.toolCall.id,
					name: event.toolCall.toolName,
					args: event.toolCall.args,
				})
				break

			case 'finish':
				if (partialMessage) {
					partialMessage.stopReason = 'stop'
					emit({ type: 'message_end', message: { ...partialMessage } })
					return partialMessage
				}
				break
		}
	}

	const finalMessage = partialMessage || createAssistantMessage('')
	finalMessage.stopReason = 'stop'
	emit({ type: 'message_end', message: finalMessage })
	return finalMessage
}

function createAssistantMessage(text: string): AgentMessage {
	return {
		id: `msg-${Date.now()}`,
		role: 'assistant',
		content: text ? [{ type: 'text', text }] : [],
		timestamp: Date.now(),
	}
}

/**
 * Execute tool calls
 */
async function executeToolCalls(
	context: AgentContext,
	assistantMessage: AgentMessage,
	config: AgentLoopConfig,
	signal: AbortSignal | undefined,
	emit: AgentEventSink,
): Promise<ToolResultMessage[]> {
	const toolCalls = assistantMessage.content.filter((c) => c.type === 'toolCall')
	const results: ToolResultMessage[] = []

	for (const toolCall of toolCalls) {
		if (toolCall.type !== 'toolCall') continue

		await emit({
			type: 'tool_execution_start',
			toolCallId: toolCall.id,
			toolName: toolCall.name,
			args: toolCall.args,
		})

		const tool = context.tools?.find((t) => t.name === toolCall.name)
		let result: unknown
		let isError = false

		if (config.beforeToolCall) {
			const beforeResult = await config.beforeToolCall({
				assistantMessage,
				toolCall: { id: toolCall.id, name: toolCall.name, args: toolCall.args },
				args: toolCall.args,
				context,
			})
			if (beforeResult?.block) {
				result = beforeResult.reason || 'Tool execution was blocked'
				isError = true
			}
		}

		if (!result) {
			if (!tool) {
				result = `Tool ${toolCall.name} not found`
				isError = true
			} else {
				try {
					result = await tool.execute(toolCall.id, toolCall.args, signal)
				} catch (error) {
					result = error instanceof Error ? error.message : String(error)
					isError = true
				}
			}
		}

		if (config.afterToolCall) {
			const afterResult = await config.afterToolCall({
				assistantMessage,
				toolCall: { id: toolCall.id, name: toolCall.name, args: toolCall.args },
				args: toolCall.args,
				result,
				isError,
				context,
			})
			if (afterResult) {
				result = afterResult.content ?? result
				isError = afterResult.isError ?? isError
			}
		}

		const toolResult: ToolResultMessage = {
			id: `tool-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			role: 'toolResult',
			content:
				typeof result === 'string'
					? [{ type: 'toolResult', toolCallId: toolCall.id, result }]
					: [{ type: 'toolResult', toolCallId: toolCall.id, result }],
			timestamp: Date.now(),
			toolCallId: toolCall.id,
			toolName: toolCall.name,
			result,
			isError,
		}

		await emit({
			type: 'tool_execution_end',
			toolCallId: toolCall.id,
			result,
			isError,
		})

		await emit({ type: 'message_start', message: toolResult })
		await emit({ type: 'message_end', message: toolResult })
		results.push(toolResult)
	}

	return results
}