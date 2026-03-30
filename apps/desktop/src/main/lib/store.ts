import os from 'node:os'
import path from 'node:path'

import Store from 'electron-store'

interface StoreSchema {
	firstLaunchDone: boolean
	locale: string
}

export const store = new Store<StoreSchema>({
	name: 'config',
	schema: {
		firstLaunchDone: {
			type: 'boolean',
			default: false,
		},
		locale: {
			type: 'string',
			default: 'en',
		},
	},
	cwd: path.join(os.homedir(), '.acme'),
})

export class AppStore {
	get firstLaunchDone(): boolean {
		return store.get('firstLaunchDone')
	}

	set firstLaunchDone(value: boolean) {
		store.set('firstLaunchDone', value)
	}

	get locale(): string {
		return store.get('locale')
	}

	set locale(value: string) {
		store.set('locale', value)
	}
}
