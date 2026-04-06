import { Separator } from '@acme-ai/ui/foundation'

interface SettingsContentProps {
	children: React.ReactNode
}

export function SettingsContent({ children }: SettingsContentProps): React.JSX.Element {
	return (
		<div className="flex flex-col h-full overflow-hidden p-6">
			<div className="max-w-4xl w-full mx-auto overflow-y-auto flex-1">
				{children}
			</div>
		</div>
	)
}

interface SettingsSectionProps {
	title: string
	description?: string
	children: React.ReactNode
}

export function SettingsSection({ title, description, children }: SettingsSectionProps): React.JSX.Element {
	return (
		<div className="mb-8">
			<h2 className="text-xl font-semibold">{title}</h2>
			{description && (
				<p className="text-sm text-muted-foreground mt-1">{description}</p>
			)}
			<Separator className="mt-4 mb-6" />
			<div className="space-y-6">{children}</div>
		</div>
	)
}
