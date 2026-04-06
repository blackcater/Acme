import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute('/vault/$vaultId/settings/')({
	component: SettingsIndex,
})

function SettingsIndex(): React.JSX.Element {
	return <Navigate to="/vault/$vaultId/settings/general" replace />
}
