export interface GlobalSettings {
  provider?: ProviderSettings
  mcpServers?: McpServerConfig[]
  ui?: UiSettings
  skills?: string[]
  agents?: string[]
  plugins?: string[]
  commands?: string[]
  [key: string]: unknown
}

export interface ProviderSettings {
  apiKey?: string
  baseURL?: string
  model?: string
  timeout?: number
  maxRetries?: number
}

export interface McpServerConfig {
  name: string
  command: string
  args?: string[]
  env?: Record<string, string>
}

export interface UiSettings {
  theme?: 'light' | 'dark' | 'system'
  fontSize?: number
}

export interface VaultSettings {
  provider?: ProviderSettings
  mcpServers?: McpServerConfig[]
  ui?: UiSettings
  skills?: string[]
  agents?: string[]
  plugins?: string[]
  commands?: string[]
  [key: string]: unknown
}