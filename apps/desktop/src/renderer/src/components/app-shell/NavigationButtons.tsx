import { Button } from '@acme-ai/ui/foundation/button'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

export function NavigationButtons(): React.JSX.Element {
	return (
		<div className="flex items-center gap-1">
			<Button
				variant="ghost"
				size="icon-sm"
				aria-label="返回"
				className="text-sidebar-foreground"
			>
				<ChevronLeftIcon />
			</Button>
			<Button
				variant="ghost"
				size="icon-sm"
				aria-label="前进"
				className="text-sidebar-foreground"
			>
				<ChevronRightIcon />
			</Button>
		</div>
	)
}
