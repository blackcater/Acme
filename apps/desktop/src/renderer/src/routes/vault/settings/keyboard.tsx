import { createFileRoute } from '@tanstack/react-router'

import { KeyboardPage } from '@renderer/features/settings/pages/KeyboardPage'

export const Route = createFileRoute('/vault/settings/keyboard')({
	component: KeyboardPage,
})
