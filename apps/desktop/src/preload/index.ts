import { contextBridge } from 'electron'

import { electronAPI } from '@electron-toolkit/preload'

import { ElectronRpcClient } from '../shared/rpc'

// Lazy-initialized RPC client
let rpcClient: ElectronRpcClient | null = null

// Get current webContents in renderer process
const getCurrentWebContents = () => {
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	const { webContents } = require('electron')
	return webContents.getFocusedWebContents()
}

const api = {
	// Get the current webContents
	getCurrentWebContents,

	// Factory function to create/retrieve RPC client
	getRpcClient: () => {
		if (!rpcClient) {
			const webContents = getCurrentWebContents()
			if (!webContents) {
				throw new Error('Cannot get webContents')
			}
			rpcClient = new ElectronRpcClient(webContents)
		}
		return rpcClient
	},
}

if (process.contextIsolated) {
	try {
		contextBridge.exposeInMainWorld('electron', electronAPI)
		contextBridge.exposeInMainWorld('api', api)
	} catch (error) {
		console.error(error)
	}
}
