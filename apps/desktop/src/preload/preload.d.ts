import { ElectronAPI } from '@electron-toolkit/preload'

interface PreloadApi {
	invoke<T>(channel: string, data?: unknown): Promise<T>
	send(channel: string, data?: unknown): void
	on(channel: string, handler: (data: unknown) => void): () => void
}

declare global {
	interface Window {
		electron: ElectronAPI
		api: PreloadApi
	}
}
