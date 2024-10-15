import { createEditor, Transforms, withoutNormalizing } from "slate";
import { Action } from "../types";



export function ApplyAction(data: any[], action: Action): any[] {
	const editor = createEditor();
	editor.children = data;
	if ( data.length === 0) {
		Transforms.insertNodes(editor, { children: [{ text: '' }] });
	}
	withoutNormalizing(editor, () => {
		//actions.forEach(op => {
		if (action.command.type === 'set_selection' && !editor.selection) {
			// Imposta una selezione di default se non c'è una selezione corrente
			Transforms.select(editor, { anchor: { path: [0, 0], offset: 0 }, focus: { path: [0, 0], offset: 0 } });
		}
		editor.apply(action.command);
		//})
	})
	return editor.children;
}