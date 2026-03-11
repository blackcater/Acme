export interface Skill {
	id: string
	scope: 'global' | 'vault'
	vaultId?: string
	name: string
	description?: string
	icon?: string
	prompt: string
	isEnabled: boolean
	createdAt: Date
	updatedAt: Date
}
