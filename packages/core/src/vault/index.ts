/**
 * Vault represents a project
 */
export interface Vault {
	id: string
	name: string
	rootPath: string
	icon?: string
	createdAt: Date
	lastVisitedAt?: Date
}
