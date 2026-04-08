import { createFileRoute } from '@tanstack/react-router'

import { ProjectPage } from '@renderer/features/settings/pages/ProjectPage'

export const Route = createFileRoute('/vault/settings/projects/$projectId')({
	component: ProjectSettingsPage,
})

function ProjectSettingsPage() {
	const { projectId } = Route.useParams()

	return <ProjectPage projectId={projectId} />
}
