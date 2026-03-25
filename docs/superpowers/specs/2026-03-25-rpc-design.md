# RPC Framework Design

## Overview

A unified RPC framework for desktop applications with support for:
- **Electron IPC** - Communication between main and renderer processes
- **HTTP + SSE** - Communication between processes on different machines

## Directory Structure

```
apps/desktop/src/shared/rpc/
├── types.ts              # Core type definitions
├── errors.ts             # Unified error structure + built-in error codes
├── RpcError.ts          # RpcError class
├── context.ts            # RequestContext + CancelToken + schema validation
├── electron/             # Electron IPC implementation
│   ├── ElectronRpcServer.ts
│   └── ElectronRpcClient.ts
├── http/                 # HTTP + SSE implementation
│   ├── HttpRpcServer.ts
│   └── HttpRpcClient.ts
├── utils.ts              # Utility functions
└── index.ts              # Unified exports
```

## Core Types (types.ts)

```typescript
import type { StandardSchemaV1 } from '@standard-schema/spec'

export interface IRpcErrorDefinition<Data = unknown> {
  readonly code: string
  readonly message: string
  readonly data?: Data
}

export namespace Rpc {
  export type HandlerFn<T = unknown> = (
    ctx: RequestContext,
    ...args: unknown[]
  ) => T | Promise<T> | AsyncIterator<T>

  export type CancelFn = () => void

  export type Target =
    | { type: 'broadcast' }
    | { type: 'group'; groupId: string }
    | { type: 'client'; clientId: string }

  export interface RequestContext {
    readonly clientId: string
    readonly vaultId?: string
    readonly cancelToken: CancelToken
    readonly [key: string]: unknown
  }

  export interface CancelToken {
    readonly aborted: boolean
    readonly signal: AbortSignal
    abort(): void
  }
}

export interface HandleOptions {
  schema?: StandardSchemaV1
}

export interface RpcServer {
  handle(event: string, handler: Rpc.HandlerFn): void
  handle(event: string, options: HandleOptions, handler: Rpc.HandlerFn): void

  router(namespace: string): RpcRouter
  push(event: string, target: Rpc.Target, ...args: unknown[]): void
}

export interface RpcRouter {
  handle(event: string, handler: Rpc.HandlerFn): void
  handle(event: string, options: HandleOptions, handler: Rpc.HandlerFn): void

  router(namespace: string): RpcRouter
}

export interface RpcClient {
  readonly clientId: string
  readonly groupId?: string

  call<T>(event: string, ...args: unknown[]): Promise<T>
  stream<T>(event: string, ...args: unknown[]): Rpc.StreamResult<T>
  onEvent(event: string, listener: (...args: unknown[]) => void): Rpc.CancelFn
  abort(): void
}

export namespace Rpc {
  export type StreamResult<T> = {
    [Symbol.asyncIterator](): AsyncIterator<T>
    cancel(): void
  }
}
```

## Error Handling (errors.ts)

```typescript
export class RpcError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly data?: unknown
  ) {
    super(message)
    this.name = 'RpcError'
  }

  toJSON(): IRpcErrorDefinition {
    return {
      code: this.code,
      message: this.message,
      data: this.data,
    }
  }

  static from(error: unknown): RpcError {
    if (error instanceof RpcError) return error
    if (error instanceof Error) {
      return new RpcError(RpcError.INTERNAL_ERROR, error.message)
    }
    return new RpcError(RpcError.UNKNOWN_ERROR, String(error))
  }
}

export namespace RpcError {
  export const INTERNAL_ERROR = 'INTERNAL_ERROR'
  export const UNKNOWN_ERROR = 'UNKNOWN_ERROR'
  export const NOT_FOUND = 'NOT_FOUND'
  export const INVALID_PARAMS = 'INVALID_PARAMS'
  export const ABORTED = 'ABORTED'
  export const TIMEOUT = 'TIMEOUT'
  export const UNAUTHORIZED = 'UNAUTHORIZED'
  export const FORBIDDEN = 'FORBIDDEN'
}
```

## Context & Validation (context.ts)

```typescript
import type { StandardSchemaV1 } from '@standard-schema/spec'
import { RpcError } from './RpcError'

export function createCancelToken(): CancelToken {
  let aborted = false
  let abortFn: (() => void) | null = null

  const signal = new AbortSignalPrototype((onAbort) => {
    abortFn = onAbort
  })

  return {
    get aborted() { return aborted },
    get signal() { return signal },
    abort() {
      if (aborted) return
      aborted = true
      abortFn?.()
    },
  }
}

export function validateArgs(
  schema: StandardSchemaV1 | undefined,
  args: unknown[]
): { validatedArgs: unknown[] } {
  if (!schema) {
    return { validatedArgs: args }
  }

  const input = args.length === 1 ? args[0] : args
  const result = schema['~standard'].validate(input)

  if ('issues' in result) {
    throw new RpcError(
      RpcError.INVALID_PARAMS,
      'Invalid parameters',
      result.issues.map((i) => i.message)
    )
  }

  return {
    validatedArgs: Array.isArray(result.value) ? result.value : [result.value],
  }
}
```

## Design Decisions

### 1. Schema Validation with Standard Schema

Uses [Standard Schema](https://standardschema.dev/schema) for validation, allowing users to pass any schema library that implements the interface (Zod, Valibot, etc.).

### 2. Flat Registration + Nested Routes

Handlers can be registered with namespace prefixes:
```typescript
server.handle('conversation:create', handler)
```

Or using nested routers:
```typescript
const convRouter = server.router('conversation')
convRouter.handle('create', handler)
convRouter.handle('send', handler)
```

### 3. Complete Cancel System

Both `call()` and `stream()` support cancellation:
- Handler receives `CancelToken` in `RequestContext`
- Handler can check `ctx.cancelToken.aborted` for graceful exit
- `stream()` returns `StreamResult` with `cancel()` method

### 4. Separate Streaming and Push

- `stream()` - For client-initiated streaming requests
- `push()` - For server-initiated notifications to clients

### 5. Target Types

- `broadcast` - Push to all connected clients
- `group` - Push to clients in the same group
- `client` - Push to a specific client

## Usage Examples

### Electron Main Process

```typescript
import { z } from 'zod'

const server = new ElectronRpcServer()

// No validation
server.handle('getStatus', async (ctx) => {
  return { status: 'ok' }
})

// With schema validation
server.handle('create', { schema: z.object({
  type: z.enum(['gemini', 'codex']),
  model: z.string(),
})}, async (ctx, ...args) => {
  if (ctx.cancelToken.aborted) return
  // args[0] is validated
})

// Nested router
const convRouter = server.router('conversation')
convRouter.handle('send', async (ctx, ...args) => {
  // ...
})

// Push to clients
server.push('notification', { type: 'broadcast' }, { msg: 'hello' })
server.push('update', { type: 'group', groupId: 'agents' }, { data: 123 })
```

### Electron Renderer Process

```typescript
const client = new ElectronRpcClient({ groupId: 'renderer' })

// Request-response
const result = await client.call('getStatus')

// Streaming with cancel
const stream = client.stream('conversation:send', { message: 'hello' })
for await (const chunk of stream) {
  console.log(chunk)
  if (someCondition) {
    stream.cancel()
    break
  }
}

// Subscribe to server push
const cancelFn = client.onEvent('notification', (...args) => {
  console.log('Received:', ...args)
})
cancelFn()

// Abort all operations
client.abort()
```

### HTTP + SSE Server

```typescript
const server = new HttpRpcServer({ port: 4096 })

server.handle('getInfo', async (ctx) => {
  return { version: '1.0.0' }
})

server.handle('streamLogs', { schema: z.object({ taskId: z.string() }) }, async function* (ctx, ...args) {
  for await (const log of logStream) {
    if (ctx.cancelToken.aborted) return
    yield { log }
  }
})
```

### HTTP + SSE Client

```typescript
const client = new HttpRpcClient({
  url: 'http://192.168.1.100:4096',
  groupId: 'remote-agent'
})

const result = await client.call('getInfo', {})
```

## Implementation Details

### Electron Transport

- Uses Electron's built-in `ipcMain`/`ipcRenderer` for communication
- Main process acts as the message broker
- Windows communicate via the main process

### HTTP + SSE Transport

- HTTP POST endpoint `/rpc` for incoming calls
- SSE endpoint `/rpc/events` for server pushes and streaming responses
- HTTP for request-response; SSE for server-to-client streaming

## Extensibility

### RequestContext Extensions

The `RequestContext` interface supports extension via the index signature:

```typescript
// Future examples:
ctx.userId    // For authentication
ctx.workspace  // For multi-workspace support
ctx.sessionId  // For session tracking
```

### Custom Target Types

New target types can be added by extending the `Target` union type.
