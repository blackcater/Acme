import { registerSystemHandlers } from './system'
import { registerFilesHandlers } from './files'

export async function registerHandlers() {
	await registerSystemHandlers()
	await registerFilesHandlers()
}
