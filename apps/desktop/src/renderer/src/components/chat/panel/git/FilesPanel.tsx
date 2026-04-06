import { useState, useCallback, useEffect, useRef } from 'react'
import { Input } from '@acme-ai/ui'
import { SearchIcon } from 'hugeicons/react'
import { FileTreeView } from './file-tree'
import type { FileNode } from './types'

interface FilesPanelProps {
	className?: string
}

export function FilesPanel({ className }: FilesPanelProps) {
	// TODO: Get rootPath from project context/settings
	const [rootPath] = useState(() => {
		// For now, use a placeholder - will be connected to actual project later
		return process.env.HOME ?? '/tmp'
	})

	const [searchQuery, setSearchQuery] = useState('')
	const [debouncedQuery, setDebouncedQuery] = useState('')
	const debounceRef = useRef<NodeJS.Timeout>()

	// Debounced search
	useEffect(() => {
		clearTimeout(debounceRef.current)
		debounceRef.current = setTimeout(() => {
			setDebouncedQuery(searchQuery)
		}, 200)
		return () => clearTimeout(debounceRef.current)
	}, [searchQuery])

	const handleFileClick = useCallback((node: FileNode, rect: DOMRect) => {
		console.log('File clicked:', node.path, rect)
		// TODO: Implement file preview or open
	}, [])

	return (
		<div className={`flex flex-col h-full ${className ?? ''}`}>
			{/* Header with Search */}
			<div className="p-3 border-b">
				<div className="relative">
					<SearchIcon
						className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
						size={16}
					/>
					<Input
						placeholder="Search files..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-9 h-8"
					/>
				</div>
			</div>

			{/* File Tree */}
			<div className="flex-1 overflow-auto">
				<FileTreeView rootPath={rootPath} onFileClick={handleFileClick} />
			</div>
		</div>
	)
}