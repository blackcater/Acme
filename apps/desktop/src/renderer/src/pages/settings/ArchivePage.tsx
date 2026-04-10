import { SettingsContent } from '@renderer/components/settings/SettingsContent'
import { SettingsSection } from '@renderer/components/settings/SettingsSection'

export function ArchivePage() {
	return (
		<SettingsContent>
			<SettingsSection
				title="Archive"
				description="View and restore archived projects and threads"
			>
				<div className="text-muted-foreground text-sm">
					No archived items.
				</div>
			</SettingsSection>
		</SettingsContent>
	)
}
