import type { SerializableError } from './utils'

export enum ErrorScope {
	Unknown = 'unknown',
	User = 'user',
	System = 'system',
	ThirdParty = 'third_party',
}

export enum ErrorDomain {
	Acme = 'acme',
	Agent = 'agent',
	LLM = 'llm',
	MCP = 'mcp',
	Tool = 'tool',
}

export interface IErrorDefinition<Scope, Domain> {
	id: Uppercase<string>
	text?: string
	scope: Scope
	domain: Domain
	details?: Record<string, unknown>
}

export interface AcmeErrorJSON<Scope = string, Domain = string> {
	code: Uppercase<string>
	message: string
	scope: Scope
	domain: Domain
	details?: Record<string, unknown>
	cause?: ReturnType<SerializableError['toJSON']>
}

export class AcmeBaseError<Scope, Domain> extends Error {
	public readonly id: Uppercase<string>
	public readonly scope: Scope
	public readonly domain: Domain
	public readonly details?: Record<string, unknown> = {}
	public override readonly message: string
	public override cause?: SerializableError

	constructor(
		def: IErrorDefinition<Scope, Domain>,
		originalError?: string | Error | AcmeBaseError<Scope, Domain> | unknown
	) {
		const error = originalError
			? getErrorFromUnknown(originalError, {
					serializeStack: false,
					fallbackMessage: 'Unknown error',
				})
			: undefined

		const message = def.text ?? error?.message ?? 'Unknown error'

		super(message, { cause: error })

		this.id = def.id
		this.domain = def.domain
		this.scope = def.scope
		this.details = def.details ?? {}
		this.message = message
		this.cause = error

		Object.setPrototypeOf(this, new.target.prototype)
	}

	public toJSON(): AcmeErrorJSON<Scope, Domain> {
		return {
			message: this.message,
			scope: this.scope,
			domain: this.domain,
			code: this.id,
			details: this.details,
			cause: this.cause?.toJSON?.(),
		}
	}

	public override toString() {
		return JSON.stringify(this.toJSON())
	}
}
