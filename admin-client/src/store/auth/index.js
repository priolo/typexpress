import { useLayout, getStoreLayout } from "../layout";
import { getStore, useStore } from '@priolo/iistore'


export function getStoreAuth() {
	const bundle = getStoreLayout()
	return getStore("auth", bundle)
}

export function useAuth() {
	const bundle = useLayout()
	return useStore("auth", bundle)
}
