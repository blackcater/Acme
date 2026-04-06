import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/vault/settings/')({
	component: SettingsIndex,
})

function SettingsIndex() {
	return <Navigate to="/vault/settings/general" replace />
}
