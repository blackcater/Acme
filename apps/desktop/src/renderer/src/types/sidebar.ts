export type SidebarViewMode = 'folder' | 'flat'

export interface SidebarState {
  collapsed: boolean
  width: number
  viewMode: SidebarViewMode
  sortOrder: 'asc' | 'desc'
  sortField: 'updatedAt' | 'createdAt'
}
