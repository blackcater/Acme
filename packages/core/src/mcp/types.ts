export interface McpServer {
	id: string
	scope: 'global' | 'vault'
	vaultId?: string
	name: string
	command: string
	description?: string
	icon?: string
	args: string[]
	env?: Record<string, unknown>
	isEnabled: boolean
	createdAt: Date
	updatedAt: Date
}
