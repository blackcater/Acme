import type { ElectronAPI } from '@electron-toolkit/preload'

import type { Rpc, RpcClient } from '../shared/rpc'

interface API {
	getCurrentWebContents(): Electron.WebContents
	getRpcClient(): RpcClient
}

declare global {
	interface Window {
		electron: ElectronAPI
		api: API
	}
}
