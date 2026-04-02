import { useAtom } from 'jotai'

import { sidebarAtom } from '@renderer/atoms'

import { ThreadTitleCell } from './cell/ThreadTitleCell'
import { FlatView } from './section/FlatView'
import { FolderView } from './section/FolderView'

export function ProjectSection() {
	const [sidebar, setSidebar] = useAtom(sidebarAtom)
	const viewMode = sidebar.viewMode

	const handleSort = () => {
		if (viewMode === 'folder') {
			setSidebar({ ...sidebar, viewMode: 'flat' })
		} else if (viewMode === 'flat') {
			setSidebar({ ...sidebar, viewMode: 'folder' })
		}
	}

	const handleAddFolder = () => {
		// TODO: Add Project
	}

	return (
		<div className="flex h-full max-w-full flex-col px-2 pb-4">
			<ThreadTitleCell
				title="Threads"
				onSort={handleSort}
				onAdd={handleAddFolder}
			/>
			{viewMode === 'folder' ? <FolderView /> : <FlatView />}
		</div>
	)
}
