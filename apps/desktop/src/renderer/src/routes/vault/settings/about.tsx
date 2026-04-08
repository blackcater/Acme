import { createFileRoute } from '@tanstack/react-router'

import { AboutPage } from '@renderer/features/settings/pages/AboutPage'

export const Route = createFileRoute('/vault/settings/about')({
	component: AboutPage,
})
