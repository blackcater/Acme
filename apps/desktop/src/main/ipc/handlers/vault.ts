import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { createId } from '@paralleldrive/cuid2'

import { getRouter } from '@main/ipc/router'
import { vaultContracts, projectContracts } from '@/shared/ipc/contracts'
import { VaultSchema, ProjectSchema } from '@/shared/ipc/types'
import { handlerLog } from '@main/lib/logger'

const VAULT_BASE = join(process.env['HOME'] || '', '.acme', 'vaults')

function getVaultDir(vaultId: string): string {
	return join(VAULT_BASE, vaultId)
}

function getVaultConfigPath(vaultId: string): string {
	return join(getVaultDir(vaultId), 'config.json')
}

function getProjectDir(vaultId: string, projectId: string): string {
	return join(getVaultDir(vaultId), 'projects', projectId)
}

function getProjectConfigPath(vaultId: string, projectId: string): string {
	return join(getProjectDir(vaultId, projectId), 'config.json')
}

export function initVaultHandlers(): void {
	const router = getRouter()

	// vault:list
	router.register('vault:list', async (input) => {
		vaultContracts.list.input.parse(input)
		handlerLog.debug('vault:list called')

		if (!existsSync(VAULT_BASE)) {
			return vaultContracts.list.output.parse([])
		}

		try {
			const entries = await readdir(VAULT_BASE, { withFileTypes: true })
			const vaultIds = entries
				.filter((entry) => entry.isDirectory())
				.map((entry) => entry.name)

			const vaults = []
			for (const vaultId of vaultIds) {
				const configPath = getVaultConfigPath(vaultId)
				if (existsSync(configPath)) {
					try {
						const content = await readFile(configPath, 'utf-8')
						const vault = VaultSchema.parse(JSON.parse(content))
						vaults.push(vault)
					} catch {
						handlerLog.warn('Failed to read vault config', { vaultId })
					}
				}
			}

			return vaultContracts.list.output.parse(vaults)
		} catch (error) {
			handlerLog.error('Failed to list vaults', { error })
			throw error
		}
	})

	// vault:create
	router.register('vault:create', async (input) => {
		const params = vaultContracts.create.input.parse(input)
		handlerLog.debug('vault:create called', { params })

		const vaultId = createId()
		const now = new Date().toISOString()
		const vault = {
			id: vaultId,
			name: params.name,
			path: params.path,
			createdAt: now,
		}

		const vaultDir = getVaultDir(vaultId)
		await mkdir(vaultDir, { recursive: true })

		const configPath = getVaultConfigPath(vaultId)
		await writeFile(configPath, JSON.stringify(vault, null, 2), 'utf-8')

		handlerLog.info('Vault created', { vaultId })
		return vaultContracts.create.output.parse(vault)
	})

	// project:list
	router.register('project:list', async (input) => {
		const params = projectContracts.list.input.parse(input)
		handlerLog.debug('project:list called', { params })

		const vaultDir = getVaultDir(params.vaultId)
		const projectsDir = join(vaultDir, 'projects')

		if (!existsSync(projectsDir)) {
			return projectContracts.list.output.parse([])
		}

		try {
			const entries = await readdir(projectsDir, { withFileTypes: true })
			const projectIds = entries
				.filter((entry) => entry.isDirectory())
				.map((entry) => entry.name)

			const projects = []
			for (const projectId of projectIds) {
				const configPath = getProjectConfigPath(params.vaultId, projectId)
				if (existsSync(configPath)) {
					try {
						const content = await readFile(configPath, 'utf-8')
						const project = ProjectSchema.parse(JSON.parse(content))
						projects.push(project)
					} catch {
						handlerLog.warn('Failed to read project config', { projectId })
					}
				}
			}

			return projectContracts.list.output.parse(projects)
		} catch (error) {
			handlerLog.error('Failed to list projects', { error })
			throw error
		}
	})

	// project:create
	router.register('project:create', async (input) => {
		const params = projectContracts.create.input.parse(input)
		handlerLog.debug('project:create called', { params })

		const projectId = createId()
		const now = new Date().toISOString()
		const project = {
			id: projectId,
			vaultId: params.vaultId,
			name: params.name,
			path: params.path,
			createdAt: now,
		}

		const projectDir = getProjectDir(params.vaultId, projectId)
		await mkdir(projectDir, { recursive: true })

		const configPath = getProjectConfigPath(params.vaultId, projectId)
		await writeFile(configPath, JSON.stringify(project, null, 2), 'utf-8')

		handlerLog.info('Project created', { projectId })
		return projectContracts.create.output.parse(project)
	})

	handlerLog.info('Vault handlers initialized')
}
