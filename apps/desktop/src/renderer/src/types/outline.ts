export type OutlineNodeType = 'user' | 'assistant' | 'tool_call' | 'tool_result'

export interface OutlineNode {
  id: string
  type: OutlineNodeType
  label: string
  icon?: string
  messageId: string
  children?: OutlineNode[]
}
