import type { FilesHandler } from '@/main/handlers/files'
import type { RpcClient } from '@/shared/rpc'
import type { AppInfo } from '@/types'

interface StoreAPI {
	get: (key: 'firstLaunchDone') => Promise<boolean>
	set: (key: 'firstLaunchDone', value: boolean) => Promise<void>
	getLocale: () => Promise<string>
	setLocale: (locale: string) => Promise<void>
}

export interface API {
	files: Pick<FilesHandler, 'list' | 'search'>
	store: StoreAPI
	rpc: RpcClient
}

declare global {
	interface Window {
		api: API
		__appInfo: AppInfo
	}
}
