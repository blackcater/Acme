import type { AgentRuntime } from '@acme-ai/runtime'
import { initAgentHandlers } from './agent'
import { initVaultHandlers } from './vault'
import { initThreadHandlers } from './thread'
import { handlerLog } from '@main/lib/logger'

export { initAgentHandlers, initVaultHandlers, initThreadHandlers }

export function initAllHandlers(runtime: AgentRuntime): void {
	handlerLog.info('Initializing all IPC handlers')

	initVaultHandlers()
	initAgentHandlers(runtime)
	initThreadHandlers(runtime)

	handlerLog.info('All IPC handlers initialized')
}
