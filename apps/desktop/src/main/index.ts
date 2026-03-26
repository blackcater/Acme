import { app, ipcMain } from 'electron'

import { electronApp, is, platform } from '@electron-toolkit/utils'

import icon from '~/resources/icon.png?asset'

import { log, mainLog } from './lib/logger'
import { RpcDebugService, WindowManager } from './services'
import { AppWindowRegistry, ElectronRpcServer } from '../shared/rpc/electron'

log.initialize()

let windowManager: WindowManager | null = null
let windowRegistry: AppWindowRegistry | null = null
let rpcServer: ElectronRpcServer | null = null

app.on('open-url', (event, url) => {
	event.preventDefault()
	mainLog.info('Received deeplink:', url)
})

app.whenReady()
	.then(() => {
		electronApp.setAppUserModelId('dev.blackcater.acme')

		if (platform.isMacOS && app.dock && is.dev) {
			app.dock.setIcon(icon)
		}

		// Initialize WindowManager
		windowManager = new WindowManager()
		mainLog.info('WindowManager initialized')

		// Initialize WindowRegistry and ElectronRpcServer
		windowRegistry = new AppWindowRegistry()
		rpcServer = new ElectronRpcServer(windowRegistry, ipcMain)
		mainLog.info('RPC server initialized')

		// Register debug handlers
		new RpcDebugService(rpcServer)
		mainLog.info('RPC debug handlers registered')

		// Create the main window
		const mainWindow = windowManager.createWindow()
		windowRegistry.registerWindow(mainWindow)
		mainLog.info('Main window created and registered')
	})
	.catch((error) => {
		mainLog.error('Failed to initialize app:', error)
		app.quit()
	})

app.on('window-all-closed', () => {
	app.quit()
})
