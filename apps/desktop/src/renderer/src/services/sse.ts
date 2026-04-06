/**
 * Creates an SSE (Server-Sent Events) connection with topic-based message routing.
 * @param params - Connection parameters including URL and subscribed topics
 * @returns SSE connection object with connect, on, and off methods
 */
export function createSSEConnection(params: { url: string; topics: string[] }) {
	const listeners = new Map<string, Set<(data: unknown) => void>>()

	const connect = () => {
		const es = new EventSource(params.url)
		es.onmessage = (e) => {
			const event = JSON.parse(e.data)
			listeners.get(event.topic)?.forEach((fn) => fn(event.data))
		}
		return { disconnect: () => es.close() }
	}

	return {
		connect,
		on<T>(topic: string, handler: (data: T) => void) {
			if (!listeners.has(topic)) listeners.set(topic, new Set())
			listeners.get(topic)!.add(handler as (data: unknown) => void)
		},
		off: (topic: string) => listeners.delete(topic),
	}
}
