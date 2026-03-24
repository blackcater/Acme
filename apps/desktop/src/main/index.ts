import { app } from 'electron'

import { electronApp, is, platform } from '@electron-toolkit/utils'

import icon from '~/resources/icon.png?asset'

import { log, mainLog } from './lib/logger'
import { WindowManager } from './services/WindowManager'

log.initialize()

let windowManager: WindowManager | null = null

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

		// Initialize WindowManager with the router
		windowManager = new WindowManager()
		mainLog.info('WindowManager initialized')

		// Create the main window
		windowManager.createWindow()
		mainLog.info('Main window created')
	})
	.catch((error) => {
		mainLog.error('Failed to initialize app:', error)
		app.quit()
	})

app.on('window-all-closed', () => {
	app.quit()
})
