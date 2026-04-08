import { SettingsContent } from '../components/SettingsContent'
import { SettingsSection } from '../components/SettingsSection'

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
