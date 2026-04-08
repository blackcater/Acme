import { createFileRoute } from '@tanstack/react-router'

import { AppearancePage } from '@renderer/features/settings/pages/AppearancePage'

export const Route = createFileRoute('/vault/settings/appearance')({
	component: AppearancePage,
})
