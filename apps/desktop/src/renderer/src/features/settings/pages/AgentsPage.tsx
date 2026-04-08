import { Button } from '@acme-ai/ui/foundation'

import { SettingsContent } from '../components/SettingsContent'
import { SettingsSection } from '../components/SettingsSection'

export function AgentsPage() {
	return (
		<SettingsContent>
			<SettingsSection
				title="Agents"
				description="Configure ACP-compatible agents"
			>
				<div className="text-muted-foreground mb-4 text-sm">
					No agents configured yet.
				</div>
				<Button>Add Agent</Button>
			</SettingsSection>
		</SettingsContent>
	)
}
