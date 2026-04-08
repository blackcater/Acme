import { createFileRoute } from '@tanstack/react-router'

import { NotificationsPage } from '@renderer/features/settings/pages/NotificationsPage'

export const Route = createFileRoute('/vault/settings/notifications')({
	component: NotificationsPage,
})
