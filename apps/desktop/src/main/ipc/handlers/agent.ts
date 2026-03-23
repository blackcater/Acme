import type { AgentRuntime } from '@acme-ai/runtime'
import { getRouter } from '@main/ipc/router'
import { agentContracts } from '@/shared/ipc/contracts'
import { handlerLog } from '@main/lib/logger'

export function initAgentHandlers(runtime: AgentRuntime): void {
	const router = getRouter()

	// agent:start
	router.register('agent:start', async (input) => {
		const params = agentContracts.start.input.parse(input)
		handlerLog.debug('agent:start called', { params })

		const success = runtime.startAgent(params.agentId, params.threadId)

		return agentContracts.start.output.parse({ success })
	})

	// agent:stop
	router.register('agent:stop', async (input) => {
		const params = agentContracts.stop.input.parse(input)
		handlerLog.debug('agent:stop called', { params })

		const success = runtime.stopAgent(params.agentId)

		return agentContracts.stop.output.parse({ success })
	})

	// agent:status
	router.register('agent:status', async (input) => {
		agentContracts.getStatus.input.parse(input)
		handlerLog.debug('agent:status called')

		const status = runtime.getStatus()

		return agentContracts.getStatus.output.parse(status)
	})

	// agent:send
	router.register('agent:send', async (input) => {
		const params = agentContracts.sendMessage.input.parse(input)
		handlerLog.debug('agent:send called', { params })

		// Find threadId from agentId via threadAgentMap
		const threadAgentMap = runtime.getThreadAgentMap()
		let threadId: string | undefined

		for (const [tid, agId] of threadAgentMap.entries()) {
			if (agId === params.agentId) {
				threadId = tid
				break
			}
		}

		if (!threadId) {
			throw new Error(`No thread found for agentId: ${params.agentId}`)
		}

		const messageId = await runtime.sendMessage(threadId, params.content)

		if (!messageId) {
			throw new Error('Failed to send message')
		}

		return agentContracts.sendMessage.output.parse({ messageId })
	})

	handlerLog.info('Agent handlers initialized')
}
