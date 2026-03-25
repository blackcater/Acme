import { describe, it, expect, vi } from 'bun:test'
import type { IpcMain } from 'electron'
import { ElectronRpcServer } from './ElectronRpcServer'

describe('ElectronRpcServer', () => {
    it('should register handler with ipcMain.on', async () => {
        const mockIpcMain = {
            on: vi.fn(),
            handle: vi.fn(),
        } as unknown as IpcMain

        const server = new ElectronRpcServer(mockIpcMain)

        server.handle('test/echo', async (_ctx, msg: string) => {
            return { echoed: msg }
        })

        // Should listen on rpc:invoke:test/echo
        expect(mockIpcMain.on).toHaveBeenCalledWith(
            'rpc:invoke:test/echo',
            expect.any(Function)
        )
    })

    it('should support router for namespace organization', async () => {
        const mockIpcMain = {
            on: vi.fn(),
            handle: vi.fn(),
        } as unknown as IpcMain

        const server = new ElectronRpcServer(mockIpcMain)

        server.router('conversation').handle('create', async (_ctx, params) => {
            return { id: 'conv-1', ...params }
        })

        expect(mockIpcMain.on).toHaveBeenCalledWith(
            'rpc:invoke:conversation/create',
            expect.any(Function)
        )
    })

    it('should normalize event paths', async () => {
        const mockIpcMain = {
            on: vi.fn(),
            handle: vi.fn(),
        } as unknown as IpcMain

        const server = new ElectronRpcServer(mockIpcMain)

        // Test with leading/trailing slashes
        server.handle('/test/path/', async (_ctx) => 'ok')

        expect(mockIpcMain.on).toHaveBeenCalledWith(
            'rpc:invoke:test/path',
            expect.any(Function)
        )
    })
})