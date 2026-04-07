import { FilesHandler } from './files'
import { registerSystemHandlers } from './system'

export function registerHandlers() {
	registerSystemHandlers()
	FilesHandler.registerHandlers()
}
