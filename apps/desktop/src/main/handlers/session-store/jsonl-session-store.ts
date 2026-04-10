import { randomUUID } from 'node:crypto'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import type { Session, SessionSummary, Turn, EngineType } from '@/shared/types'

import type { SessionStore } from './session-store'

const SESSIONS_DIR = path.join(os.homedir(), '.acme', 'sessions')

export class JsonlSessionStore implements SessionStore {
	async #ensureSessionDir(sessionId: string): Promise<string> {
		const sessionDir = path.join(SESSIONS_DIR, sessionId)
		await fs.mkdir(sessionDir, { recursive: true })
		return sessionDir
	}

	#getMetaPath(sessionId: string): string {
		return path.join(SESSIONS_DIR, sessionId, 'meta.json')
	}

	#getTurnsPath(sessionId: string): string {
		return path.join(SESSIONS_DIR, sessionId, 'turns.jsonl')
	}

	async #readMeta(sessionId: string): Promise<Session | null> {
		const metaPath = this.#getMetaPath(sessionId)
		try {
			const content = await fs.readFile(metaPath, 'utf-8')
			return JSON.parse(content) as Session
		} catch {
			return null
		}
	}

	async #writeMeta(sessionId: string, meta: Session): Promise<void> {
		const metaPath = this.#getMetaPath(sessionId)
		await this.#ensureSessionDir(sessionId)
		await fs.writeFile(metaPath, JSON.stringify(meta, null, 2), 'utf-8')
	}

	async #readTurns(sessionId: string): Promise<Turn[]> {
		const turnsPath = this.#getTurnsPath(sessionId)
		try {
			const content = await fs.readFile(turnsPath, 'utf-8')
			return content
				.split('\n')
				.filter((line) => line.trim())
				.map((line) => JSON.parse(line) as Turn)
		} catch {
			return []
		}
	}

	async #appendTurn(sessionId: string, turn: Turn): Promise<void> {
		const sessionDir = await this.#ensureSessionDir(sessionId)
		const fullPath = path.join(sessionDir, 'turns.jsonl')
		await fs.appendFile(fullPath, JSON.stringify(turn) + '\n', 'utf-8')
	}

	async #writeTurns(sessionId: string, turns: Turn[]): Promise<void> {
		const turnsPath = this.#getTurnsPath(sessionId)
		const content =
			turns.map((turn) => JSON.stringify(turn)).join('\n') + '\n'
		await fs.writeFile(turnsPath, content, 'utf-8')
	}

	async #listSessionIds(): Promise<string[]> {
		try {
			const entries = await fs.readdir(SESSIONS_DIR, {
				withFileTypes: true,
			})
			return entries
				.filter((entry) => entry.isDirectory())
				.map((entry) => entry.name)
		} catch {
			return []
		}
	}

	async create(
		session: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>
	): Promise<Session> {
		const id = randomUUID()
		const now = Date.now()
		const fullSession: Session = {
			...session,
			id,
			createdAt: now,
			updatedAt: now,
			turns: [],
		}
		await this.#writeMeta(id, fullSession)
		await this.#writeTurns(id, [])
		return fullSession
	}

	async get(id: string): Promise<Session | null> {
		const meta = await this.#readMeta(id)
		if (!meta) return null

		const turns = await this.#readTurns(id)
		return {
			...meta,
			turns,
		}
	}

	async list(filter?: {
		engineType?: EngineType
		status?: string
	}): Promise<SessionSummary[]> {
		const sessionIds = await this.#listSessionIds()
		const summaries: SessionSummary[] = []

		for (const id of sessionIds) {
			const meta = await this.#readMeta(id)
			if (!meta) continue

			// Apply filters
			if (filter?.engineType && meta.engineType !== filter.engineType)
				continue
			if (filter?.status && meta.status !== filter.status) continue

			const turns = await this.#readTurns(id)
			const previewText =
				turns[0]?.userMessage?.parts[0]?.type === 'text'
					? (
							turns[0].userMessage.parts[0] as { text: string }
						).text.slice(0, 50)
					: undefined
			const summary: SessionSummary = {
				id: meta.id,
				...(meta.name !== undefined && { name: meta.name }),
				engineType: meta.engineType,
				status: meta.status,
				turnCount: turns.length,
				createdAt: meta.createdAt,
				updatedAt: meta.updatedAt,
				...(previewText !== undefined && { preview: previewText }),
			}
			summaries.push(summary)
		}

		// Sort by updatedAt descending
		summaries.sort((a, b) => b.updatedAt - a.updatedAt)
		return summaries
	}

	async update(id: string, patch: Partial<Session>): Promise<void> {
		const meta = await this.#readMeta(id)
		if (!meta) return

		const updatedMeta: Session = {
			...meta,
			...patch,
			id: meta.id, // Prevent id override
			createdAt: meta.createdAt, // Prevent createdAt override
			updatedAt: Date.now(),
		}
		await this.#writeMeta(id, updatedMeta)
	}

	async delete(id: string): Promise<void> {
		const sessionDir = path.join(SESSIONS_DIR, id)
		await fs.rm(sessionDir, { recursive: true, force: true })
	}

	async fork(baseId: string, fromTurnId?: string): Promise<Session> {
		const base = await this.get(baseId)
		if (!base) {
			throw new Error(`Base session ${baseId} not found`)
		}

		// Find the turn index to fork from
		let forkIndex = 0
		if (fromTurnId) {
			const idx = base.turns.findIndex((t) => t.id === fromTurnId)
			if (idx !== -1) forkIndex = idx + 1
		}

		// Create new session with forked turns
		const newSession = await this.create({
			engineType: base.engineType,
			engineConfig: base.engineConfig,
			status: 'active',
			...(base.name !== undefined && { name: `${base.name} (fork)` }),
			turns: base.turns.slice(0, forkIndex),
		})

		return newSession
	}

	async archive(id: string): Promise<void> {
		await this.update(id, { status: 'archived' })
	}

	async unarchive(id: string): Promise<void> {
		await this.update(id, { status: 'active' })
	}

	async rollback(id: string, turnCount: number): Promise<void> {
		const turns = await this.#readTurns(id)
		if (turnCount >= turns.length) {
			throw new Error('Cannot rollback more turns than exist')
		}
		const newTurns = turns.slice(0, turns.length - turnCount)
		await this.#writeTurns(id, newTurns)
		await this.update(id, {})
	}

	async addTurn(sessionId: string, turn: Turn): Promise<void> {
		await this.#appendTurn(sessionId, turn)
		await this.update(sessionId, {})
	}

	async updateTurn(
		sessionId: string,
		turnId: string,
		patch: Partial<Turn>
	): Promise<void> {
		const turns = await this.#readTurns(sessionId)
		const index = turns.findIndex((t) => t.id === turnId)
		if (index === -1) return

		turns[index] = { ...turns[index], ...patch }
		await this.#writeTurns(sessionId, turns)
		await this.update(sessionId, {})
	}

	async getTurn(sessionId: string, turnId: string): Promise<Turn | null> {
		const turns = await this.#readTurns(sessionId)
		return turns.find((t) => t.id === turnId) ?? null
	}
}
