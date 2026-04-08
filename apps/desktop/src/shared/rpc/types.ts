import type { BrowserWindow, WebContents } from 'electron'

import type { StandardSchemaV1 } from '@standard-schema/spec'

export namespace Rpc {
	export type HandlerFn<T = any> = (
		...args: any[]
	) => T | Promise<T> | AsyncIterator<T>

	export interface HandleOptions {
		schema?: StandardSchemaV1
	}

	export type CancelFn = () => void

	export type Target =
		| { type: 'broadcast' }
		| { type: 'group'; groupId: string }
		| { type: 'client'; clientId: string }

	export type StreamResult<T> = {
		[Symbol.asyncIterator](): AsyncIterator<T>
		cancel(): void
	}
}

export interface RpcServer {
	router(namespace: string): RpcRouter

	handle(event: string, handler: Rpc.HandlerFn): void
	handle(
		event: string,
		options: Rpc.HandleOptions,
		handler: Rpc.HandlerFn
	): void

	push(event: string, target: Rpc.Target, ...args: any[]): void
}

export interface RpcRouter {
	group(namespace: string): RpcRouter

	handle(event: string, handler: Rpc.HandlerFn): void
	handle(
		event: string,
		options: Rpc.HandleOptions,
		handler: Rpc.HandlerFn
	): void
}

export interface RpcClient {
	readonly clientId: string
	readonly groupId?: string

	call<T>(event: string, ...args: any[]): Promise<T>
	stream<T>(event: string, ...args: any[]): Rpc.StreamResult<T>
	onEvent(event: string, listener: (...args: any[]) => void): Rpc.CancelFn
}

export interface IWindowRegistry {
	registerWindow(window: BrowserWindow, group?: string): string
	unregisterWindow(window: BrowserWindow): void

	joinGroup(clientId: string, groupId: string): void
	leaveGroup(clientId: string, groupId: string): void

	sendToClient(clientId: string, channel: string, ...args: any[]): void
	sendToGroup(groupId: string, channel: string, ...args: any[]): void
	sendToAll(channel: string, ...args: any[]): void

	getWebContentsByClientId(clientId: string): WebContents | null
	getClientIdByWebContents(webContents: WebContents): string | null
	getGroupsByClientId(clientId: string): string[]
}

// ---------------------------------------------------------------------------
// RPC Schema utilities
// ---------------------------------------------------------------------------

/**
 * Derives an RPC schema type from a handler class's method signatures.
 * - If method returns AsyncIterator → stream method only (via rpc.stream)
 * - Otherwise → call method only (via rpc.call)
 */
export type RpcSchema<Handler extends object> = {
	[K in keyof Handler]: Handler[K] extends (...args: infer A) => infer R
		? R extends AsyncIterator<infer T>
			? RpcStreamMethod<T, A>
			: (...args: A) => R
		: never
}

/**
 * Stream-only RPC method. Must call via .stream, not directly.
 * Direct call is forbidden (returns never).
 */
export interface RpcStreamMethod<T, A extends unknown[]> {
	// Forbid direct call - must use .stream
	(): never
	stream(...args: A): Rpc.StreamResult<T>
}

/**
 * Converts a handler class method signature to a schema-validated handler
 * with typed inputs and outputs.
 */
export type SchemaHandler<
	Args extends unknown[],
	Result,
	Schema extends StandardSchemaV1 | undefined = undefined,
> = {
	schema?: Schema
	handle: (...args: Args) => Result | Promise<Result>
}

// ---------------------------------------------------------------------------
// RPC Client facade types
// ---------------------------------------------------------------------------

/**
 * Maps a namespace and RPC client to a typed API facade.
 * Produces an object where keys are "${namespace}/${methodName}".
 */
export type RpcApi<
	Namespace extends string,
	Schema extends RpcSchema<object>,
> = {
	[K in keyof Schema as `${Namespace}/${string & K}`]: Schema[K]
}

/**
 * Extracts the return type of a handler method for use in client typing.
 */
export type HandlerReturn<T> = T extends (...args: any[]) => infer R
	? R extends Promise<infer P>
		? P
		: never
	: never

/**
 * Extracts method signatures from Handler for specified method names.
 */
export type HandlerMethods<
	Handler extends object,
	Methods extends ReadonlyArray<keyof Handler>,
> = {
	[K in Methods[number]]: Handler[K]
}

/**
 * Extracts method names from Handler where return type is T | Promise<T> (not AsyncIterator).
 */
export type CallMethodNames<Handler extends object> = {
	[K in keyof Handler]: Handler[K] extends (...args: any) => infer R
		? R extends AsyncIterator<unknown, unknown, unknown>
			? never
			: K
		: never
}[keyof Handler]

/**
 * Extracts method names from Handler where return type is AsyncIterator<T>.
 */
export type StreamMethodNames<Handler extends object> = {
	[K in keyof Handler]: Handler[K] extends (
		...args: any
	) => AsyncIterator<unknown, unknown, unknown>
		? K
		: never
}[keyof Handler]
