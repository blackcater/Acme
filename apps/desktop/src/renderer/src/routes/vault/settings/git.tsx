import { createFileRoute } from '@tanstack/react-router'

import { GitPage } from '@renderer/features/settings/pages/GitPage'

export const Route = createFileRoute('/vault/settings/git')({
	component: GitPage,
})
