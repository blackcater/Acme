import { Button } from '@acme-ai/ui/foundation'
import {
	ChatAddIcon,
	Clock01Icon,
	DashboardSquare01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

export function SidebarHeader() {
	return (
		<div className="flex w-full flex-col items-start">
			<section className="w-full">
				<div className="w-full px-2">
					<Button
						className="w-full justify-start"
						variant="pure"
						size="lg"
					>
						<HugeiconsIcon icon={ChatAddIcon} className="mr-1" />
						New Thread
					</Button>
				</div>
				<div className="w-full px-2">
					<Button
						className="w-full justify-start bg-white/10"
						variant="pure"
						size="lg"
					>
						<HugeiconsIcon
							icon={DashboardSquare01Icon}
							className="mr-1"
						/>
						Extensions
					</Button>
				</div>
				<div className="w-full px-2">
					<Button
						className="w-full justify-start"
						variant="pure"
						size="lg"
					>
						<HugeiconsIcon icon={Clock01Icon} className="mr-1" />
						Automation
					</Button>
				</div>
			</section>
			<section>{/*TODO: 多个 ThreadCell 组成 */}</section>
		</div>
	)
}
