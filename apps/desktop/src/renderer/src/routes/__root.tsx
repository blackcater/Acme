import { Outlet } from '@tanstack/react-router'

export function RootComponent(): React.JSX.Element {
	return (
		<div className="flex h-screen">
			{/* Main Content Area */}
			<main className="flex flex-1 flex-col">
				<Outlet />
			</main>
		</div>
	)
}
