import { contextBridge } from 'electron'

import type { FilesHandler } from '@/main/handlers/files'
import { buildCallApi } from '@/shared/rpc'

import type { API } from './preload'
import { createRpc } from './utils'

// Create singleton RPC client instance
const rpc = createRpc()

// Build APIs from handler
const files = buildCallApi<FilesHandler>('files', ['list', 'search'], rpc)

const store = {
	get: (key: 'firstLaunchDone'): Promise<boolean> =>
		rpc.call('/system/store/get', key),
	set: (key: 'firstLaunchDone', value: boolean): Promise<void> =>
		rpc.call('/system/store/set', key, value),
	getLocale: (): Promise<string> => rpc.call('/system/locale/get'),
	setLocale: (locale: string): Promise<void> =>
		rpc.call('/system/locale/set', locale),
}

const api: API = {
	files,
	store,
	rpc,
}

if (process.contextIsolated) {
	try {
		contextBridge.exposeInMainWorld('api', api)
	} catch (error) {
		console.error(error)
	}
}
