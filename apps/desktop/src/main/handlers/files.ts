import { Container } from '@/shared/di'
import { ElectronRpcServer } from '@/shared/rpc'
import * as fs from 'fs/promises'
import * as path from 'path'

export async function registerFilesHandlers() {
	const server = Container.inject(ElectronRpcServer)
	const router = server.router('files')

	router.handle('list', async (_, dirPath: string) => {
		try {
			const entries = await fs.readdir(dirPath, { withFileTypes: true })
			const files = entries.map((entry) => {
				const fullPath = path.join(dirPath, entry.name)
				const extension = entry.isFile()
					? path.extname(entry.name).toLowerCase().slice(1)
					: undefined
				return {
					name: entry.name,
					path: fullPath,
					type: entry.isDirectory() ? 'directory' : 'file',
					extension,
				}
			})
			// Sort: directories first, then files, both alphabetically
			files.sort((a, b) => {
				if (a.type !== b.type) return a.type === 'directory' ? -1 : 1
				return a.name.localeCompare(b.name)
			})
			return { files }
		} catch (error) {
			return { files: [], error: String(error) }
		}
	})

	router.handle('search', async (_, query: string, rootPath: string) => {
		// Simple implementation: walk directory recursively with limit
		const results: Array<{ name: string; path: string; type: 'file' | 'directory' }> = []
		const maxResults = 100

		async function walk(dir: string): Promise<void> {
			if (results.length >= maxResults) return
			try {
				const entries = await fs.readdir(dir, { withFileTypes: true })
				for (const entry of entries) {
					if (results.length >= maxResults) break
					const fullPath = path.join(dir, entry.name)
					if (entry.name.toLowerCase().includes(query.toLowerCase())) {
						results.push({
							name: entry.name,
							path: fullPath,
							type: entry.isDirectory() ? 'directory' : 'file',
						})
					}
					if (entry.isDirectory() && !entry.name.startsWith('.')) {
						await walk(fullPath)
					}
				}
			} catch {
				// Skip inaccessible directories
			}
		}

		await walk(rootPath)
		return { results }
	})
}