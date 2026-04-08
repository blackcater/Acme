import { createFileRoute } from '@tanstack/react-router'

import { GeneralPage } from '@renderer/features/settings/pages/GeneralPage'

export const Route = createFileRoute('/vault/settings/general')({
	component: GeneralPage,
})
