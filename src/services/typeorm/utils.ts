
export enum Actions {
	/**
	 * Ricerca con una query typeorm  
	 * https://typeorm.io/#/find-options
	 */
	FIND = "find",

	/**
	 * https://orkhan.gitbook.io/typeorm/docs/transactions#using-queryrunner-to-create-and-control-state-of-single-database-connection
	 */
	TRANSACTION_START = "transaction-start",
	TRANSACTION_END = "transaction-end",
	TRANSACTION_ROLLBACK = "transaction-rollback",
}

