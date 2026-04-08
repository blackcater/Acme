import { createFileRoute } from '@tanstack/react-router'

import { ArchivePage } from '@renderer/features/settings/pages/ArchivePage'

export const Route = createFileRoute('/vault/settings/archive')({
	component: ArchivePage,
})
