export enum ProviderType {
	Anthropic = 'anthropic',
	OpenAI = 'openai',
	Google = 'google',
	DeepSeek = 'deepseek',
	MiniMax = 'minimax',
	Kimi = 'kimi',
	Zhipu = 'zhipu',
}

export interface Provider {
	id: string
	name: string
	type: ProviderType
	baseUrl: string
	apiKey: string
	models: Model[]
	isDefault: boolean
	createdAt: Date
	updatedAt: Date
}

export interface Model {
	id: string
	providerId: string
	name: string
	contextWindowSize: number
	priceUsd?: number
	priceCny?: number
	supportReasoning: boolean
	supportToolCalling: boolean
	supportMultiModal: boolean
}
