
/**
 * ./NodeConf ACTIONS
 */
export enum ConfActions {
	/** genera tutta la struttura dei NODES da una `payload` di configurazione */
	INIT = "init",
	/** Distrugge il NODE chiamando anche gli opportuni metodi */
	DESTROY = "destroy",
}