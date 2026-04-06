import { createFileRoute } from '@tanstack/react-router'

import { KeyboardPage } from './-KeyboardPage'

export const Route = createFileRoute('/vault/$vaultId/settings/keyboard')({
	component: KeyboardPage,
})
