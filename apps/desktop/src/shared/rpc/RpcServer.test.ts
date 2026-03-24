import { describe, expect, it } from 'bun:test'

import { RpcServer } from './RpcServer'

// Mock implementation for testing the abstract class interface
class MockRpcServer extends RpcServer {
	handle(
		_event: string,
		_handler: (args: unknown) => unknown | AsyncIterator
	): void {
		throw new Error('Not implemented')
	}

	push(
		_event: string,
		_target: import('./types').Target,
		..._args: unknown[]
	): void {
		throw new Error('Not implemented')
	}

	onEvent(
		_listener: (
			client: import('./RpcClient').RpcClient,
			event: string,
			...args: unknown[]
		) => void
	): void {
		throw new Error('Not implemented')
	}
}

describe('RpcServer', () => {
	it('should be abstract and not be instantiable directly', () => {
		expect(() => new RpcServer()).toThrow()
	})

	it('should allow instantiation of concrete subclass', () => {
		const server = new MockRpcServer()
		expect(server).toBeInstanceOf(RpcServer)
	})
})
