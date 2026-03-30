import { createRootRoute, createRoute } from '@tanstack/react-router'

import { RootComponent } from './routes/__root'
import { ChatPage } from './routes/chat'
import { HomePage } from './routes/index'
import { RpcDebugPage } from './routes/rpc-debug'
import { SettingsPage } from './routes/settings'
import { WelcomePage } from './routes/welcome'

// Root route
export const rootRoute = createRootRoute({
	component: RootComponent,
})

// Home route
export const homeRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/',
	component: HomePage,
})

// Settings route
export const settingsRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/settings',
	component: SettingsPage,
})

// Chat route
export const chatRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/chat',
	component: ChatPage,
})

// RPC Debug route
export const rpcDebugRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/rpc-debug',
	component: RpcDebugPage,
})

// Welcome route
export const welcomeRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: '/welcome',
	component: WelcomePage,
})

// Create route tree
export const routeTree = rootRoute.addChildren([
	homeRoute,
	settingsRoute,
	chatRoute,
	rpcDebugRoute,
	welcomeRoute,
])
