import { createFileRoute } from '@tanstack/react-router'

import { AgentsPage } from './-AgentsPage'

export const Route = createFileRoute('/vault/$vaultId/settings/agents')({
	component: AgentsPage,
})
