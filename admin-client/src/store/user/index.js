import { getStore, useStore } from '@priolo/iistore'

export function getStoreUser() {
	return getStore("user")
}

export function useUser() {
	return useStore("user")
}
