export type SerializedError = {
	name: string
	message: string
	stack?: string
	cause?: unknown
} & Record<string, any>

export type SerializableError = Error & {
	toJSON: () => SerializedError
}
