import type { IpcMain } from 'electron'

import { RpcError } from '../RpcError'
import type { RpcServer, RpcRouter, Rpc, WindowRegistry } from '../types'
import { ElectronRpcRouter } from './ElectronRpcRouter'

export class ElectronRpcServer implements RpcServer {
	constructor(
		private readonly _registry: WindowRegistry,
		private readonly _ipcMain: IpcMain
	) {}

	router(namespace: string): RpcRouter {
		const prefix = this._normalizeEvent(namespace)
		return new ElectronRpcRouter(this, prefix)
	}

	handle(event: string, handler: Rpc.HandlerFn): void
	handle(
		event: string,
		options: Rpc.HandleOptions,
		handler: Rpc.HandlerFn
	): void
	handle(
		event: string,
		optionsOrHandler: Rpc.HandleOptions | Rpc.HandlerFn,
		maybeHandler?: Rpc.HandlerFn
	): void {
		const eventPath = this._normalizeEvent(event)
		const handlerFn =
			typeof optionsOrHandler === 'function'
				? optionsOrHandler
				: maybeHandler!

		// Listen on invoke:xxx channel for client calls
		this._ipcMain.on(
			`rpc:invoke:${eventPath}`,
			async (e, payload: { invokeId: string; args: unknown[] }) => {
				const { invokeId, args } = payload
				// Get clientId by WebContents
				const clientId = this._registry.getClientIdByWebContents(
					e.sender
				)
				if (!clientId) {
					e.sender.send(`rpc:response:${invokeId}`, {
						error: new RpcError(
							RpcError.UNAUTHORIZED,
							'Unknown client'
						).toJSON(),
					})
					return
				}

				try {
					const result = await handlerFn({ clientId }, ...args)

					// Handle async iterator (streaming)
					if (result && typeof result === 'object') {
						const asyncIterator = (result as any)[
							Symbol.asyncIterator
						]
						if (typeof asyncIterator === 'function') {
							const iterator = asyncIterator.call(result)

							for await (const chunk of iterator) {
								// Send streaming chunk back
								e.sender.send(
									`rpc:stream:${eventPath}:${invokeId}`,
									{ chunk, done: false }
								)
							}

							// Streaming completion - no separate rpc:response needed
							e.sender.send(
								`rpc:stream:${eventPath}:${invokeId}`,
								{ chunk: null, done: true }
							)
							return
						}
					}

					e.sender.send(`rpc:response:${invokeId}`, { result })
				} catch (err) {
					const rpcError = RpcError.from(err)
					e.sender.send(`rpc:response:${invokeId}`, {
						error: rpcError.toJSON(),
					})
				}
			}
		)
	}

	push(event: string, target: Rpc.Target, ...args: unknown[]): void {
		const channel = `rpc:event:${this._normalizeEvent(event)}`

		if (target.type === 'broadcast') {
			this._registry.sendToAll(channel, ...args)
		} else if (target.type === 'client' && target.clientId) {
			this._registry.sendToClient(target.clientId, channel, ...args)
		} else if (target.type === 'group' && target.groupId) {
			this._registry.sendToGroup(target.groupId, channel, ...args)
		}
	}

	private _normalizeEvent(event: string): string {
		return event.replaceAll(/\/+/g, '/').replaceAll(/^\/|\/$/g, '')
	}
}
