import { createFileRoute } from '@tanstack/react-router'

import { AgentsPage } from '@renderer/features/settings/pages/AgentsPage'

export const Route = createFileRoute('/vault/settings/agents')({
	component: AgentsPage,
})
