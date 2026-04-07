import type { RpcClient } from '@/shared/rpc'
import type { IpcRendererRpcClient } from '@/shared/rpc/electron'
import type { AppInfo } from '@/types'

interface StoreAPI {
	get: (key: 'firstLaunchDone') => Promise<boolean>
	set: (key: 'firstLaunchDone', value: boolean) => Promise<void>
	getLocale: () => Promise<string>
	setLocale: (locale: string) => Promise<void>
}

interface FilesRpc {
	list: (dirPath: string) => Promise<{
		files: Array<{
			name: string
			path: string
			type: 'file' | 'directory'
			extension?: string
		}>
		error?: string
	}>
	search: (
		query: string,
		rootPath: string
	) => Promise<{
		results: Array<{
			name: string
			path: string
			type: 'file' | 'directory'
		}>
		skippedCount: number
	}>
}

interface API {
	rpc: RpcClient
	files: FilesRpc
	store: StoreAPI
}

declare global {
	interface Window {
		rpc: RpcClient
		api: API
		__appInfo: AppInfo
	}
}
