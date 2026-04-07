import type { RpcClient } from '../types'

/**
 * Extracts method signatures from Handler for specified method names.
 */
type HandlerMethods<
	Handler extends object,
	Methods extends ReadonlyArray<keyof Handler>,
> = {
	[K in Methods[number]]: Handler[K]
}

/**
 * Builds a typed API facade for call-only methods (rpc.call).
 *
 * @example
 * ```typescript
 * const files = buildCallApi<FilesHandler>('files', ['list', 'search'], rpc)
 * await files.list(dirPath)  // uses rpc.call
 * await files.search(query, rootPath)  // uses rpc.call
 * ```
 */
export function buildCallApi<Handler extends object>(
	namespace: string,
	methods: ReadonlyArray<keyof Handler>,
	rpc: RpcClient
): HandlerMethods<Handler, typeof methods> {
	const api = {} as Record<string, (...args: unknown[]) => unknown>
	for (const method of methods) {
		const methodPath = `/${namespace}/${String(method)}`
		api[String(method)] = (...args: unknown[]) =>
			rpc.call(methodPath, ...args)
	}
	return api as HandlerMethods<Handler, typeof methods>
}

/**
 * Builds a typed API facade for stream-only methods (rpc.stream).
 *
 * @example
 * ```typescript
 * const chat = buildStreamApi<ChatHandler>('chat', ['query'], rpc)
 * for await (const chunk of chat.query(msg)) {  // uses rpc.stream
 *   // ...
 * }
 * ```
 */
export function buildStreamApi<Handler extends object>(
	namespace: string,
	methods: ReadonlyArray<keyof Handler>,
	rpc: RpcClient
): HandlerMethods<Handler, typeof methods> {
	const api = {} as Record<string, (...args: unknown[]) => unknown>
	for (const method of methods) {
		const methodPath = `/${namespace}/${String(method)}`
		api[String(method)] = (...args: unknown[]) =>
			rpc.stream(methodPath, ...args)
	}
	return api as HandlerMethods<Handler, typeof methods>
}
