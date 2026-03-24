import type { RpcClient } from './RpcClient'
import type { Target } from './types'

export abstract class RpcServer {
	constructor() {
		if (new.target === RpcServer) {
			throw new Error(
				'RpcServer is abstract and cannot be instantiated directly'
			)
		}
	}

	abstract handle(
		event: string,
		handler: (args: unknown) => unknown | AsyncIterator<unknown, unknown, unknown>
	): void

	abstract push(event: string, target: Target, ...args: unknown[]): void

	abstract onEvent(
		listener: (client: RpcClient, event: string, ...args: unknown[]) => void
	): void
}
