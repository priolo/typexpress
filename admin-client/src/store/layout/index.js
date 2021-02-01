import { getStore, useStore } from '@priolo/iistore'


export function getStoreLayout() {
	return getStore("layout")
}

export function useLayout() {
	return useStore("layout")
}