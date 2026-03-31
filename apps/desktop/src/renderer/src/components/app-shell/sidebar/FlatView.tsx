// apps/desktop/src/renderer/src/components/app-shell/sidebar/FlatView.tsx
import { useAtom, useAtomValue } from 'jotai'

import { threadsAtom, viewModeAtom } from '../atoms/thread-atoms'
import { ThreadCell } from '../cell/ThreadCell'
import { TitleCell } from '../cell/TitleCell'

export function FlatView() {
	const [, setViewMode] = useAtom(viewModeAtom)
	const threads = useAtomValue(threadsAtom)

	const handleSort = () => {
		setViewMode('folder')
	}

	const handleAddThread = () => {
		// TODO: implement add thread
	}

	// Sort threads by updatedAt descending
	const sortedThreads = [...threads]
		.filter((t) => !t.isPinned)
		.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())

	return (
		<section className="flex flex-col gap-1 px-2">
			<TitleCell
				title="All Threads"
				onSort={handleSort}
				onAdd={handleAddThread}
			/>
			<div className="flex flex-col gap-0.5">
				{sortedThreads.map((thread) => (
					<ThreadCell key={thread.id} thread={thread} />
				))}
			</div>
		</section>
	)
}
