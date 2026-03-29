import { cn } from '@acme-ai/ui/lib/utils'

import { isElectron } from '../../lib/electron'
import { AppHeader } from './AppHeader'
import { AppSidebar } from './AppSidebar'

interface AppShellProps {
	children: React.ReactNode
	enableBlur?: boolean
	enableNoise?: boolean
}

export function AppShell({
	children,
	enableBlur = true,
	enableNoise = true,
}: Readonly<AppShellProps>): React.JSX.Element {
	return (
		<div className={cn('bg-background flex h-screen flex-col')}>
			<div
				className={cn(
					isElectron && enableBlur && 'backdrop-blur-xl',
					isElectron && enableNoise && 'bg-noise'
				)}
			></div>
			<AppHeader />
			<div className="flex flex-1 overflow-hidden">
				<AppSidebar />
				<main className="bg-background flex-1 overflow-auto">
					{children}
				</main>
			</div>
		</div>
	)
}
