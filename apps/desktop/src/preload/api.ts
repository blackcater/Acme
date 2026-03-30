import { contextBridge, ipcRenderer } from 'electron'

import type { API } from './preload'
import { createRpc } from './utils'

// Create singleton RPC client instance
const rpc = createRpc()

const store = {
	get: (key: 'firstLaunchDone') =>
		ipcRenderer.invoke('store:get', key) as Promise<boolean>,
	set: (key: 'firstLaunchDone', value: boolean) =>
		ipcRenderer.invoke('store:set', key, value) as Promise<void>,
}

const api: API = {
	rpc,
	store,
}

if (process.contextIsolated) {
	try {
		contextBridge.exposeInMainWorld('api', api)
	} catch (error) {
		console.error(error)
	}
}
