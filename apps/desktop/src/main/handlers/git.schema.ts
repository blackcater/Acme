export interface GitStatus {
	current: string | null
	tracking: string | null
	staged: string[]
	unstaged: string[]
	untracked: string[]
	conflicted: string[]
}

export interface GitBranch {
	name: string
	current: boolean
}

export interface GitLogEntry {
	hash: string
	date: string
	message: string
	author_name: string
	author_email: string
}
