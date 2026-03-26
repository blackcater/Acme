import { contextBridge } from 'electron'

import { electronAPI } from '@electron-toolkit/preload'

import { ElectronRpcClient } from '../shared/rpc/electron'

// Lazy-initialized RPC client
let rpcClient: ElectronRpcClient | null = null

const api = {
	// Factory function to create/retrieve RPC client
	// Called by renderer with window's webContents
	getRpcClient: (webContents: Electron.WebContents) => {
		if (!rpcClient) {
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
