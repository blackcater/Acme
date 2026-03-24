import { ElectronAPI } from '@electron-toolkit/preload'

interface API {}

declare global {
	interface Window {
		electron: ElectronAPI
		api: API
	}
}
