import { createFileRoute, Outlet } from '@tanstack/react-router'

import { AppHeader, AppSidebar } from '@renderer/components/app-shell'

export const Route = createFileRoute('/vault/$vaultId')({
	component: VaultLayout,
})

function VaultLayout() {
	return (
		<div className="relative z-1 flex h-full w-full flex-1 flex-col">
			<AppHeader />
			<div className="flex h-full w-full flex-1 flex-row overflow-hidden">
				<AppSidebar />
				<div className="h-full flex-1 overflow-auto py-1.5 pr-1.5">
					<main className="bg-background h-full w-full rounded-md">
						<Outlet />
					</main>
				</div>
			</div>
		</div>
	)
}
