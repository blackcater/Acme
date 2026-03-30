import { useCallback } from 'react'

import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/welcome/')({
	component: WelcomePage,
})

function WelcomePage() {
	const rpc = window.api.getRpcClient()

	const handleStart = useCallback(() => {
		try {
			rpc.call('/system/window/create-vault', 'vault-1')
		} catch (error) {
			console.error('Failed to create vault:', error)
		}
	}, [rpc])

	return (
		<div className="flex h-full items-center justify-center">
			<button onClick={handleStart}>开始</button>
		</div>
	)
}
