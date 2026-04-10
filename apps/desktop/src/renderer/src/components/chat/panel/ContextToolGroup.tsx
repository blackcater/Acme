import { TextIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import type { Part, ToolUsePart, ToolResultPart } from '@/shared/types'

import { ToolCard } from './ToolCard'

interface ContextToolGroupProps {
	tools: Part[]
}

// Context tool names that should be grouped together
const CONTEXT_TOOL_NAMES = ['read', 'glob', 'grep', 'websearch', 'webfetch']

interface GroupedTool {
	tool: ToolUsePart
	result: ToolResultPart | undefined
}

function groupContextTools(parts: Part[]): GroupedTool[] {
	const toolUseParts = parts.filter(
		(p): p is ToolUsePart => p.type === 'tool_use'
	)
	const toolResultParts = parts.filter(
		(p): p is ToolResultPart => p.type === 'tool_result'
	)

	const contextTools: GroupedTool[] = []

	for (const tool of toolUseParts) {
		if (CONTEXT_TOOL_NAMES.includes(tool.name.toLowerCase())) {
			const result = toolResultParts.find(
				(r) => r.tool_use_id === tool.id
			)
			contextTools.push({ tool, result })
		}
	}

	return contextTools
}

export function ContextToolGroup({ tools }: ContextToolGroupProps) {
	const contextTools = groupContextTools(tools)

	if (contextTools.length === 0) return null

	return (
		<div className="bg-muted/20 flex flex-col gap-2 rounded-lg p-3">
			<div className="text-muted-foreground flex items-center gap-2 text-xs font-medium tracking-wider uppercase">
				<HugeiconsIcon icon={TextIcon} className="h-3 w-3" />
				<span>Gathered context: {contextTools.length} tools</span>
			</div>
			<div className="flex flex-col gap-2">
				{contextTools.map(({ tool, result }) => (
					<ToolCard
						key={tool.id}
						tool={tool}
						result={result}
						status={result ? 'completed' : 'pending'}
					/>
				))}
			</div>
		</div>
	)
}
