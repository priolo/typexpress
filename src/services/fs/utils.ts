
export enum FsActions {
	LIST = "list",
	NEW_DIR = "newDir",
	MOVE = "move",
	RENAME = "rename",
	DELETE = "delete",
	NEW_TEXT = "newText",
	GET_TEXT = "getText",
}

export interface FsItem {
	name: string,
	type: FsType,
	parent: string,
}

export enum FsType {
	FILE = 0, DIR
}