import { contextBridge } from 'electron'

import type { API } from './preload'
import { createRpc } from './utils'

// Create singleton RPC client instance
const rpc = createRpc()

interface FilesListResult {
	files: Array<{
		name: string
		path: string
		type: 'file' | 'directory'
		extension?: string
	}>
	error?: string
}

interface FilesSearchResult {
	results: Array<{
		name: string
		path: string
		type: 'file' | 'directory'
	}>
	skippedCount: number
}

interface FilesRpc {
	list: (dirPath: string) => Promise<FilesListResult>
	search: (query: string, rootPath: string) => Promise<FilesSearchResult>
}

const files: FilesRpc = {
	list: (dirPath: string) =>
		rpc.call<FilesListResult>('/files/list', dirPath),
	search: (query: string, rootPath: string) =>
		rpc.call<FilesSearchResult>('/files/search', query, rootPath),
}

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
	rpc,
	files,
	store,
}

if (process.contextIsolated) {
	try {
		contextBridge.exposeInMainWorld('rpc', rpc)
		contextBridge.exposeInMainWorld('api', api)
	} catch (error) {
		console.error(error)
	}
}
