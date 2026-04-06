import { Group, Panel, Separator } from 'react-resizable-panels'

export interface ChatProps {
	threadId?: string
}

export function Chat({ threadId }: Readonly<ChatProps>) {
	return (
		<Group orientation="horizontal">
			<Panel id="thread" className="bg-background rounded-lg">
				New Thread ({threadId || 'no threadId'})
			</Panel>

			<Separator className="hover:bg-primary/20 mx-px my-3 w-0.5 transition-colors" />

			<Panel
				id="panel"
				className="bg-background rounded-lg"
				minSize={300}
				maxSize={500}
			>
				Panel
			</Panel>
		</Group>
	)
}
