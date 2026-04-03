import { useRef } from 'react'
import {
	Panel,
	Group,
	Separator,
	type PanelSize,
	type PanelImperativeHandle,
} from 'react-resizable-panels'

import { createFileRoute, Outlet } from '@tanstack/react-router'
import { useAtom } from 'jotai'

import { sidebarAtom } from '@renderer/atoms/sidebar'
import { AppHeader, AppSidebar } from '@renderer/components/app-shell'
import { HeaderProvider } from '@renderer/contexts/HeaderContext'

export const Route = createFileRoute('/vault/$vaultId')({
	component: VaultLayout,
})

function VaultLayout() {
	const panelRef = useRef<PanelImperativeHandle | null>(null)
	const [sidebar, setSidebar] = useAtom(sidebarAtom)

	function handleSidebarToggle() {
		if (!panelRef.current) return

		if (panelRef.current.isCollapsed()) {
			panelRef.current.expand()
			setSidebar((prev) => ({ ...prev, collapsed: false }))
		} else {
			panelRef.current.collapse()
			setSidebar((prev) => ({ ...prev, collapsed: true }))
		}
	}

	function handleResize(
		panelSize: PanelSize,
		id: string | number | undefined
	) {
		if (id !== 'sidebar') return

		setSidebar((prev) => ({ ...prev, width: panelSize.inPixels }))
	}

	return (
		<HeaderProvider>
			<div className="relative z-1 flex h-full w-full flex-1 flex-col">
				<AppHeader onSidebarToggle={handleSidebarToggle} />
				<Group orientation="horizontal">
					<Panel
						panelRef={panelRef}
						id="sidebar"
						minSize={250}
						maxSize={350}
						defaultSize={sidebar.width}
						collapsible
						onResize={handleResize}
					>
						<AppSidebar />
					</Panel>

					<Separator className="hover:bg-primary/20 my-4 w-0.5 bg-transparent transition-colors" />

					<Panel id="main">
						<div className="flex h-full w-full flex-1 flex-col overflow-hidden py-1 pr-1">
							<main className="bg-background h-full w-full rounded-lg">
								<Outlet />
							</main>
						</div>
					</Panel>
				</Group>
			</div>
		</HeaderProvider>
	)
}
