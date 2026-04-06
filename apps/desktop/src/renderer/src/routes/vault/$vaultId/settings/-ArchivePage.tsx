import { Button } from '@acme-ai/ui/foundation'
import { SettingsContent, SettingsSection } from '@renderer/components/settings/SettingsContent'

export function ArchivePage(): React.JSX.Element {
	return (
		<SettingsContent>
			<SettingsSection
				title="Archive"
				description="View and restore archived projects and threads"
			>
				<div className="text-sm text-muted-foreground">
					No archived items.
				</div>
			</SettingsSection>
		</SettingsContent>
	)
}
