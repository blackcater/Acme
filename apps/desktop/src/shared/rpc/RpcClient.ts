export abstract class RpcClient {
  constructor() {
    if (new.target === RpcClient) {
      throw new Error('RpcClient is abstract and cannot be instantiated directly')
    }
  }

  abstract readonly groupId: string

  abstract call(method: string, args: unknown): Promise<unknown>

  abstract stream(method: string, args: unknown): AsyncIterator<unknown, unknown, unknown>

  abstract onEvent(listener: (event: string, ...args: unknown[]) => void): void

  /** @deprecated Only needed for Electron. HTTP uses SSE connections directly. */
  send?(event: string, ...args: unknown[]): void
}