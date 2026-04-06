import { createFileRoute, Outlet } from '@tanstack/react-router'

import { SettingsNav } from '@renderer/components/settings/SettingsNav'

export const Route = createFileRoute('/vault/settings')({
	component: SettingsLayout,
})

function SettingsLayout() {
	return (
		<div className="flex h-full w-full">
			<SettingsNav />
			<div className="bg-background flex-1 overflow-hidden">
				<Outlet />
			</div>
		</div>
	)
}
