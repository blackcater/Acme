import { useEffect, useState } from 'react'

import type { Vault } from '@/shared/ipc/types'

interface VaultSelectorProps {
	selectedVaultId: string | undefined
	onVaultSelect: (vaultId: string) => void
}

export function VaultSelector({
	selectedVaultId,
	onVaultSelect,
}: Readonly<VaultSelectorProps>): React.JSX.Element {
	const [vaults, setVaults] = useState<Vault[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [isOpen, setIsOpen] = useState(false)

	useEffect(() => {
		loadVaults()
	}, [])

	async function loadVaults(): Promise<void> {
		setIsLoading(true)
		try {
			const result = await window.api.invoke<Vault[]>('vault:list')
			setVaults(result)
		} catch (error) {
			console.error('Failed to load vaults:', error)
		} finally {
			setIsLoading(false)
		}
	}

	const selectedVault = vaults.find((v) => v.id === selectedVaultId)

	return (
		<div className="relative">
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="flex h-10 w-full items-center justify-between rounded-lg border border-border bg-card px-3 text-sm hover:bg-accent"
			>
				<span className="truncate">
					{isLoading ? (
						<span className="text-muted-foreground">Loading...</span>
					) : selectedVault ? (
						selectedVault.name
					) : (
						<span className="text-muted-foreground">Select vault</span>
					)}
				</span>
				<svg
					className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
				</svg>
			</button>

			{isOpen && (
				<>
					<div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
					<div className="absolute left-0 top-full z-20 mt-1 w-full rounded-lg border border-border bg-popover py-1 shadow-lg">
						{vaults.length === 0 && !isLoading ? (
							<div className="px-3 py-2 text-sm text-muted-foreground">No vaults found</div>
						) : (
							vaults.map((vault) => (
								<button
									key={vault.id}
									type="button"
									onClick={() => {
										onVaultSelect(vault.id)
										setIsOpen(false)
									}}
									className={`flex w-full items-center px-3 py-2 text-sm hover:bg-accent ${
										vault.id === selectedVaultId ? 'bg-accent' : ''
									}`}
								>
									<span className="truncate">{vault.name}</span>
								</button>
							))
						)}
					</div>
				</>
			)}
		</div>
	)
}
