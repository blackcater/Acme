import { describe, expect, it, vi, beforeEach } from 'bun:test'

import { ElectronRpcServer } from './ElectronRpcServer'

describe('ElectronRpcServer', () => {
	let mockOn: ReturnType<typeof vi.fn>
	let mockOff: ReturnType<typeof vi.fn>
	let mockIpcMain: { on: typeof mockOn; off: typeof mockOff }
	let registeredHandler: ((...args: unknown[]) => void) | undefined

	beforeEach(() => {
		mockOn = vi.fn(
			(channel: string, handler: (...args: unknown[]) => void) => {
				if (channel === 'rpc:call') {
					registeredHandler = handler
				}
			}
		)
		mockOff = vi.fn()
		mockIpcMain = { on: mockOn, off: mockOff }
	})

	it('should register handlers and respond to calls', async () => {
		const server = new ElectronRpcServer(mockIpcMain)

		server.handle('testMethod', async (args) => {
			return { result: args }
		})

		expect(registeredHandler).toBeDefined()

		// Simulate renderer calling rpc:call
		const mockReply = vi.fn()
		const mockEvent = { reply: mockReply }

		// Directly call the handler
		await registeredHandler!(mockEvent, 'req-1', 'testMethod', {
			foo: 'bar',
		})

		// Check reply was called with result
		expect(mockReply).toHaveBeenCalledWith(
			'rpc:response',
			expect.objectContaining({
				id: 'req-1',
				result: { result: { foo: 'bar' } },
			})
		)
	})

	it('should handle errors and return RpcError', async () => {
		const server = new ElectronRpcServer(mockIpcMain)

		server.handle('errorMethod', async () => {
			throw new Error('Test error')
		})

		expect(registeredHandler).toBeDefined()

		const mockReply = vi.fn()
		const mockEvent = { reply: mockReply }
		await registeredHandler!(mockEvent, 'req-2', 'errorMethod', {})

		expect(mockReply).toHaveBeenCalledWith(
			'rpc:response',
			expect.objectContaining({
				id: 'req-2',
				error: expect.objectContaining({
					code: 'INTERNAL_ERROR',
				}),
			})
		)
	})

	it('should return NOT_FOUND error for unknown methods', async () => {
		new ElectronRpcServer(mockIpcMain)

		expect(registeredHandler).toBeDefined()

		const mockReply = vi.fn()
		const mockEvent = { reply: mockReply }
		await registeredHandler!(mockEvent, 'req-3', 'unknownMethod', {})

		expect(mockReply).toHaveBeenCalledWith(
			'rpc:response',
			expect.objectContaining({
				id: 'req-3',
				error: expect.objectContaining({
					code: 'NOT_FOUND',
					message: expect.stringContaining('unknownMethod'),
				}),
			})
		)
	})
})
