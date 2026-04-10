import { SettingsContent } from '@renderer/components/settings/SettingsContent'
import { SettingsSection } from '@renderer/components/settings/SettingsSection'

export function KeyboardPage() {
	return (
		<SettingsContent>
			<SettingsSection
				title="Keyboard Shortcuts"
				description="View and customize keyboard shortcuts"
			>
				<div className="text-muted-foreground text-sm">
					Keyboard shortcuts configuration coming soon.
				</div>
			</SettingsSection>
		</SettingsContent>
	)
}
