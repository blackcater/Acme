import { describe, expect, it, vi, beforeEach } from 'bun:test'

import { HttpRpcClient } from './HttpRpcClient'

// Mock fetch
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('HttpRpcClient', () => {
	beforeEach(() => {
		mockFetch.mockClear()
	})

	it('should create client with url and groupId', () => {
		const client = new HttpRpcClient({
			url: 'http://localhost:4096',
			groupId: 'test',
		})
		expect(client.groupId).toBe('test')
	})

	it('should make HTTP call and return result', async () => {
		mockFetch.mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({ id: '1', result: { ok: true } }),
		})

		const client = new HttpRpcClient({
			url: 'http://localhost:4096',
			groupId: 'test',
		})
		const result = await client.call('testMethod', { foo: 'bar' })

		expect(result).toEqual({ ok: true })
		expect(mockFetch).toHaveBeenCalledWith(
			'http://localhost:4096/rpc',
			expect.objectContaining({ method: 'POST' })
		)

		// Verify the request body
		const [, options] = mockFetch.mock.calls[0]
		const body = JSON.parse(options.body)
		expect(body.method).toBe('testMethod')
		expect(body.args).toEqual({ foo: 'bar' })
		expect(body.id).toBeDefined()
	})

	it('should handle error responses', async () => {
		mockFetch.mockResolvedValue({
			ok: true,
			json: () =>
				Promise.resolve({
					id: '1',
					error: { code: 'TEST', message: 'Error' },
				}),
		})

		const client = new HttpRpcClient({
			url: 'http://localhost:4096',
			groupId: 'test',
		})

		await expect(client.call('errorMethod', {})).rejects.toThrow('Error')
	})
})
