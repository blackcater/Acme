import { cn } from '@acme-ai/ui/lib/utils'
import { Badge } from '@acme-ai/ui/foundation'
import { Plus } from 'lucide-react'

interface TopBarProps {
	className?: string
}

export function TopBar({ className }: TopBarProps) {
	return (
		<header
			className={cn(
				'flex h-12 items-center justify-between border-b border-border px-4',
				className
			)}
		>
			{/* Left side: status text */}
			<span className="text-sm text-foreground">新线程</span>

			{/* Right side: Plus badge */}
			<Badge variant="default" className="gap-1">
				<Plus className="h-3 w-3" />
				获取 Plus
			</Badge>
		</header>
	)
}
