import { SettingsContent, SettingsSection } from '@renderer/components/settings/SettingsContent'

export function KeyboardPage(): React.JSX.Element {
	return (
		<SettingsContent>
			<SettingsSection
				title="Keyboard Shortcuts"
				description="View and customize keyboard shortcuts"
			>
				<div className="text-sm text-muted-foreground">
					Keyboard shortcuts configuration coming soon.
				</div>
			</SettingsSection>
		</SettingsContent>
	)
}
