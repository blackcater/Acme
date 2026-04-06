import { createFileRoute } from '@tanstack/react-router'

import { ArchivePage } from './-ArchivePage'

export const Route = createFileRoute('/vault/$vaultId/settings/archive')({
	component: ArchivePage,
})
