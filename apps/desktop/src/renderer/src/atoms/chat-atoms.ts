import { atom } from 'jotai'

import type { Session, Turn, Part, PermissionRequest } from '@/shared/types'

// Store for session atoms - using Map instead of atomFamily for jotai 2.x compatibility
const sessionStore = new Map<string, ReturnType<typeof atom<Session | null>>>()

// Session atoms - created on-demand
export const chatSessionAtomFamily = (sessionId: string) => {
	if (!sessionStore.has(sessionId)) {
		sessionStore.set(sessionId, atom<Session | null>(null))
	}
	return sessionStore.get(sessionId)!
}

export const chatSessionIdsAtom = atom<string[]>([])

export const chatActiveSessionIdAtom = atom<string | null>(null)

export const chatActiveSessionAtom = atom((get) => {
	const id = get(chatActiveSessionIdAtom)
	if (!id) return null
	return get(chatSessionAtomFamily(id))
})

// Permission state
export const pendingPermissionAtom = atom<PermissionRequest | null>(null)

export const permissionDialogOpenAtom = atom(false)

// UI State
export const isProcessingAtom = atom(false)

export const streamingContentAtom = atom<Map<string, string>>(new Map())

// Actions
export const appendTurnAtom = atom(
	null,
	(get, set, sessionId: string, turn: Turn) => {
		const sessionAtom = chatSessionAtomFamily(sessionId)
		const session = get(sessionAtom)
		if (session) {
			set(sessionAtom, {
				...session,
				turns: [...session.turns, turn],
			})
		}
	}
)

export const setSessionAtom = atom(
	null,
	(_get, set, sessionId: string, session: Session) => {
		const sessionAtom = chatSessionAtomFamily(sessionId)
		set(sessionAtom, session)
	}
)

export const updateTurnAtom = atom(
	null,
	(get, set, sessionId: string, turnId: string, patch: Partial<Turn>) => {
		const sessionAtom = chatSessionAtomFamily(sessionId)
		const session = get(sessionAtom)
		if (session) {
			const newTurns = session.turns.map((t: Turn) =>
				t.id === turnId ? { ...t, ...patch } : t
			)
			set(sessionAtom, { ...session, turns: newTurns })
		}
	}
)

export const appendPartAtom = atom(
	null,
	(get, set, sessionId: string, turnId: string, part: Part) => {
		const sessionAtom = chatSessionAtomFamily(sessionId)
		const session = get(sessionAtom)
		if (session) {
			const newTurns = session.turns.map((t: Turn) => {
				if (t.id === turnId) {
					return { ...t, assistantParts: [...t.assistantParts, part] }
				}
				return t
			})
			set(sessionAtom, { ...session, turns: newTurns })
		}
	}
)
