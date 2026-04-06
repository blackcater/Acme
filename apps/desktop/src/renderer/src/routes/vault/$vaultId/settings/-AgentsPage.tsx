import { Button } from '@acme-ai/ui/foundation'
import { SettingsContent, SettingsSection } from '@renderer/components/settings/SettingsContent'

export function AgentsPage(): React.JSX.Element {
	return (
		<SettingsContent>
			<SettingsSection
				title="Agents"
				description="Configure ACP-compatible agents"
			>
				<div className="text-sm text-muted-foreground mb-4">
					No agents configured yet.
				</div>
				<Button>Add Agent</Button>
			</SettingsSection>
		</SettingsContent>
	)
}
