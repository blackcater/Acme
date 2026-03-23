import { atom } from 'jotai'

// Vault and thread selection atoms
export const vaultIdAtom = atom<string | undefined>(undefined)
export const threadIdAtom = atom<string | undefined>(undefined)
export const activePanelAtom = atom<
	'files' | 'git' | 'browser' | 'preview' | 'settings' | undefined
>(undefined)
