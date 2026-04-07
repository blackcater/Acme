import { z } from 'zod'

// ---------------------------------------------------------------------------
// File node types
// ---------------------------------------------------------------------------

export const FileNodeSchema = z.object({
	name: z.string(),
	path: z.string(),
	type: z.enum(['file', 'directory']),
	extension: z.string().optional(),
})

// Use explicit interface to ensure compatibility with exactOptionalPropertyTypes
export interface FileNode {
	name: string
	path: string
	type: 'file' | 'directory'
	extension?: string
}

export const SearchResultSchema = z.object({
	name: z.string(),
	path: z.string(),
	type: z.enum(['file', 'directory']),
})

export interface SearchResult {
	name: string
	path: string
	type: 'file' | 'directory'
}

// ---------------------------------------------------------------------------
// Handler result types
// ---------------------------------------------------------------------------

export const FilesListResultSchema = z.object({
	files: z.array(FileNodeSchema),
	error: z.string().optional(),
})

export interface FilesListResult {
	files: FileNode[]
	error?: string
}

export const FilesSearchResultSchema = z.object({
	results: z.array(SearchResultSchema),
	skippedCount: z.number(),
})

export interface FilesSearchResult {
	results: SearchResult[]
	skippedCount: number
}
