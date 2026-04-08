import { createFileRoute } from '@tanstack/react-router'

import { ProvidersPage } from '@renderer/features/settings/pages/ProvidersPage'

export const Route = createFileRoute('/vault/settings/providers')({
	component: ProvidersPage,
})
