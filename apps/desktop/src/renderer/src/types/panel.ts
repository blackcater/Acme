export type PanelType = 'git' | 'files' | 'browser' | 'preview'

export interface PanelState {
	collapsed: boolean
	width: number
	type: PanelType
}
