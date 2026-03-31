import { ScrollArea } from '@acme-ai/ui/foundation'

import { SidebarFooter } from './sidebar/SidebarFooter'
import { SidebarHeader } from './sidebar/SidebarHeader'

export function AppSidebar(): React.JSX.Element {
	return (
		<aside className="text-secondary-foreground relative flex w-[256px] shrink-0 flex-col">
			<SidebarHeader />
			{/* Sidebar Content */}
			<ScrollArea className="flex-1">
				{/* TODO: 一个 TitleCell */}
				{/* TODO: 一个 FolderCell + 多个 ThreadCell */}
			</ScrollArea>
			{/* Sidebar Footer */}
			<SidebarFooter />
		</aside>
	)
}
