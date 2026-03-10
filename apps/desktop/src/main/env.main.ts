import { createEnv } from '@t3-oss/env-core'
import z from 'zod'

const PORT = Number(process.env['PORT'] || '5173')

export const env = createEnv({
	server: {
		NODE_ENV: z
			.enum(['development', 'production', 'test'])
			.default('development'),
		PORT: z.number().default(PORT),
		ELECTRON_RENDERER_URL: z.string().default(`http://localhost:${PORT}`),
	},
	clientPrefix: 'NEXT_PUBLIC_',
	client: {},
	runtimeEnv: {
		...process.env,
		PORT,
	},
})
