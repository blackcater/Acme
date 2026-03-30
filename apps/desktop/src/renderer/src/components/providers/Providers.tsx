import { TooltipProvider } from '@acme-ai/ui/foundation'
import { Provider as JotaiProvider } from 'jotai/react'

import { I18nProvider } from './I18nProvider'
import { ThemeProvider } from './ThemeProvider'

export interface ProvidersProps {
	children: React.ReactNode
}

export function Providers({ children }: Readonly<ProvidersProps>) {
	return (
		<JotaiProvider>
			<ThemeProvider>
				<I18nProvider>
					<TooltipProvider>{children}</TooltipProvider>
				</I18nProvider>
			</ThemeProvider>
		</JotaiProvider>
	)
}
