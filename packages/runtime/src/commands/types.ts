export interface Command {
	id: string
	name: string
	description: string
	handler: (args: string[]) => Promise<string>
}
