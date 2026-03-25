import type { Context } from 'hono'
import type { RpcServer, RpcRouter, Rpc, HandleOptions } from '../types'
import { RpcError } from '../RpcError'

interface RegisteredHandler {
    handler: Rpc.HandlerFn
    options?: HandleOptions
}

export class HttpRpcServer implements RpcServer {
    private handlers = new Map<string, RegisteredHandler>()
    private app: any

    constructor(app: any) {
        this.app = app
        this.setupRoutes()
    }

    private setupRoutes() {
        // POST /rpc/** - RPC invocation (wildcard catches all paths under /rpc/)
        this.app.post('/rpc/**', async (c: Context) => {
            // Extract path after /rpc/ using the full path
            const fullPath = c.req.path
            const rpcIndex = fullPath.indexOf('/rpc/')
            const path = rpcIndex >= 0 ? fullPath.slice(rpcIndex + 5) : fullPath
            const args = await c.req.json().catch(() => [])

            const handler = this.handlers.get(path)
            if (!handler) {
                return c.json(
                    { error: { code: 'NOT_FOUND', message: `Handler not found: ${path}` } },
                    404
                )
            }

            const ctx: Rpc.RequestContext = {
                clientId: this.getClientId(c),
            }

            try {
                const result = await handler.handler(ctx, ...args)

                // Handle async iterator (streaming) - collect all chunks
                if (result && typeof result === 'object' && Symbol.asyncIterator in result) {
                    const chunks: unknown[] = []
                    for await (const chunk of result as unknown as AsyncIterable<unknown>) {
                        chunks.push(chunk)
                    }
                    return c.json({ result: chunks })
                }

                return c.json({ result })
            } catch (err) {
                const rpcError = RpcError.from(err)
                return c.json({ error: rpcError.toJSON() }, 500)
            }
        })
    }

    handle(event: string, handler: Rpc.HandlerFn): void
    handle(event: string, options: HandleOptions, handler: Rpc.HandlerFn): void
    handle(
        event: string,
        optionsOrHandler: HandleOptions | Rpc.HandlerFn,
        maybeHandler?: Rpc.HandlerFn
    ): void {
        const eventPath = this.normalizeEvent(event)
        if (typeof optionsOrHandler === 'function') {
            this.handlers.set(eventPath, { handler: optionsOrHandler })
        } else {
            this.handlers.set(eventPath, { handler: maybeHandler!, options: optionsOrHandler })
        }
    }

    router(namespace: string): RpcRouter {
        const prefix = this.normalizeEvent(namespace)
        // eslint-disable-next-line no-this-alias -- RouterImpl class methods need access to outer this
        const self = this

        // Use a class to properly implement overloaded method
        class RouterImpl implements RpcRouter {
            handle(event: string, handler: Rpc.HandlerFn): void
            handle(event: string, options: HandleOptions, handler: Rpc.HandlerFn): void
            handle(
                event: string,
                optionsOrHandler: HandleOptions | Rpc.HandlerFn,
                maybeHandler?: Rpc.HandlerFn
            ): void {
                if (typeof optionsOrHandler === 'function') {
                    self.handle(`${prefix}/${event}`, optionsOrHandler)
                } else {
                    self.handle(`${prefix}/${event}`, optionsOrHandler, maybeHandler!)
                }
            }

            router(ns: string): RpcRouter {
                return self.router(`${prefix}/${ns}`)
            }
        }

        return new RouterImpl()
    }

    push(_event: string, _target: Rpc.Target, ..._args: unknown[]): void {
        // HTTP push is deferred - would require SSE or WebSocket
        console.warn('HttpRpcServer: push() is not implemented (deferred)')
    }

    private normalizeEvent(event: string): string {
        return event.replace(/\/+/g, '/').replace(/^\/|\/$/g, '')
    }

    private getClientId(c: Context): string {
        return c.req.header('x-rpc-client-id') || 'anonymous'
    }
}