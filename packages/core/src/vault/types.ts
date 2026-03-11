/**
 * Vault represents a project
 */
export interface Vault {
	id: string
	name: string
	rootPath: string
	description?: string
	icon?: string
	settings: VaultSettings
	createdAt: Date
	lastVisitedAt?: Date
}

export interface VaultSettings {
	defaultProviderId?: string
	defaultModelId?: string
}
