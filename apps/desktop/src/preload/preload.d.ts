import type { Rpc } from '../shared/rpc/types'

// Type for the RPC client exposed via contextBridge
// This must match the interface of ElectronRpcClient from shared/rpc/electron
interface IRpcClient {
	readonly clientId: string
	readonly groupId?: string
	call<T>(event: string, options?: Rpc.CallOptions, ...args: unknown[]): Promise<T>
	stream<T>(event: string, options?: Rpc.CallOptions, ...args: unknown[]): Rpc.StreamResult<T>
	onEvent(event: string, listener: (...args: unknown[]) => void): Rpc.CancelFn
}

interface API {
	getRpcClient(webContents: Electron.WebContents): IRpcClient
}

declare global {
	interface Window {
		electron: import('@electron-toolkit/preload').ElectronAPI
		api: API
	}
}
