import { describe, expect, it } from 'bun:test'
import { RpcClient } from './RpcClient'

// Mock implementation for testing
class MockRpcClient extends RpcClient {
  readonly groupId: string = 'test'
  call(method: string, args: unknown): Promise<unknown> {
    throw new Error('Not implemented')
  }
  stream(method: string, args: unknown): AsyncIterator {
    throw new Error('Not implemented')
  }
  onEvent(listener: (event: string, ...args: unknown[]) => void): void {
    throw new Error('Not implemented')
  }
}

describe('RpcClient', () => {
  it('should be abstract and not be instantiable directly', () => {
    expect(() => new RpcClient()).toThrow()
  })

  it('should allow instantiation of concrete subclass', () => {
    const client = new MockRpcClient()
    expect(client).toBeInstanceOf(RpcClient)
    expect(client.groupId).toBe('test')
  })
})