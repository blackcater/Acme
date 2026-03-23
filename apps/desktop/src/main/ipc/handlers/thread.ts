import type { AgentRuntime, Thread, Message } from '@acme-ai/runtime'
import { getRouter } from '@main/ipc/router'
import { threadContracts, messageContracts } from '@/shared/ipc/contracts'
import { handlerLog } from '@main/lib/logger'

export function initThreadHandlers(runtime: AgentRuntime): void {
	const router = getRouter()

	// thread:list
	router.register('thread:list', async (input) => {
		const params = threadContracts.list.input.parse(input)
		handlerLog.debug('thread:list called', { params })

		const threads = await runtime.threadStore.listByProject(params.projectId)

		// Convert Date fields to ISO strings for schema
		const serialized = threads.map((thread: Thread) => ({
			...thread,
			createdAt: thread.createdAt instanceof Date ? thread.createdAt.toISOString() : thread.createdAt,
			updatedAt: thread.updatedAt instanceof Date ? thread.updatedAt.toISOString() : thread.updatedAt,
		}))

		return threadContracts.list.output.parse(serialized)
	})

	// thread:create
	router.register('thread:create', async (input) => {
		const params = threadContracts.create.input.parse(input)
		handlerLog.debug('thread:create called', { params })

		const threadData: Omit<Thread, 'id' | 'createdAt' | 'updatedAt'> = {
			projectId: params.projectId,
			agentId: params.agentId,
			title: params.title,
		}
		if (params.folderId !== undefined) {
			threadData.folderId = params.folderId
		}

		const thread = await runtime.threadStore.create(threadData)

		// Convert Date fields to ISO strings for schema
		const serialized = {
			...thread,
			createdAt: thread.createdAt instanceof Date ? thread.createdAt.toISOString() : thread.createdAt,
			updatedAt: thread.updatedAt instanceof Date ? thread.updatedAt.toISOString() : thread.updatedAt,
		}

		return threadContracts.create.output.parse(serialized)
	})

	// thread:get
	router.register('thread:get', async (input) => {
		const params = threadContracts.get.input.parse(input)
		handlerLog.debug('thread:get called', { params })

		const thread = await runtime.threadStore.get(params.threadId)

		if (!thread) {
			throw new Error(`Thread not found: ${params.threadId}`)
		}

		// Convert Date fields to ISO strings for schema
		const serialized = {
			...thread,
			createdAt: thread.createdAt instanceof Date ? thread.createdAt.toISOString() : thread.createdAt,
			updatedAt: thread.updatedAt instanceof Date ? thread.updatedAt.toISOString() : thread.updatedAt,
		}

		return threadContracts.get.output.parse(serialized)
	})

	// thread:delete
	router.register('thread:delete', async (input) => {
		const params = threadContracts.delete.input.parse(input)
		handlerLog.debug('thread:delete called', { params })

		const success = await runtime.threadStore.delete(params.threadId)

		return threadContracts.delete.output.parse(success)
	})

	// message:list
	router.register('message:list', async (input) => {
		const params = messageContracts.list.input.parse(input)
		handlerLog.debug('message:list called', { params })

		const messages = await runtime.messageStore.list(params.threadId, params.limit)

		// Convert Date fields to ISO strings for schema
		const serialized = messages.map((message: Message) => ({
			...message,
			timestamp: message.timestamp instanceof Date ? message.timestamp.toISOString() : message.timestamp,
		}))

		return messageContracts.list.output.parse(serialized)
	})

	// message:send
	router.register('message:send', async (input) => {
		const params = messageContracts.send.input.parse(input)
		handlerLog.debug('message:send called', { params })

		// Verify thread exists before appending message
		const thread = await runtime.threadStore.get(params.threadId)
		if (!thread) {
			throw new Error(`Thread not found: ${params.threadId}`)
		}

		// Append user message to store
		const message = await runtime.messageStore.append({
			threadId: params.threadId,
			role: 'user',
			content: params.content,
		})

		// Convert Date fields to ISO strings for schema
		const serialized = {
			...message,
			timestamp: message.timestamp instanceof Date ? message.timestamp.toISOString() : message.timestamp,
		}

		return messageContracts.send.output.parse(serialized)
	})

	handlerLog.info('Thread handlers initialized')
}
