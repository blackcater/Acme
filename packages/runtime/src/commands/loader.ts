import { readdir } from 'fs/promises'
import { join } from 'path'

import type { Command } from './types'

export class CommandLoader {
	constructor() {}

	/**
	 * 加载目录下的所有 Commands
	 */
	async loadCommands(commandsPath: string): Promise<Command[]> {
		const commands: Command[] = []

		try {
			const entries = await readdir(commandsPath, { withFileTypes: true })

			for (const entry of entries) {
				if (!entry.isDirectory()) continue

				const _commandPath = join(commandsPath, entry.name)

				const command: Command = {
					id: entry.name,
					name: entry.name,
					description: '',
					handler: async () => 'Not implemented',
				}

				commands.push(command)
			}
		} catch {
			// 目录不存在
		}

		return commands
	}
}
