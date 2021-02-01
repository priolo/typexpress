import { getStore, useStore } from '@priolo/iistore'
import { useLayout } from '../layout'

export function getStoreNode() {
	return getStore("node")
}

export function useNode() {
	//const layout = useLayout()
	return useStore("node" /*,layout*/)
}

export const STATUS = { 
	STOP:0, 
	START:1, 
	UNKNOW:2 
}