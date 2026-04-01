export interface Thread {
	id: string
	title: string
	projectId: string
	updatedAt: Date
	isPinned: boolean
}

export interface Folder {
	id: string
	title: string
	order: number
}

export type TreeNode =
	| { type: 'folder'; id: string; name: string; order: number }
	| {
			type: 'thread'
			id: string
			name: string
			projectId: string
			updatedAt: Date
			isPinned: boolean
	  }

export type ViewMode = 'folder' | 'flat'
