import { Card, CardHeader, CardContent, Divider, CardActions, Button } from "@material-ui/core"
import { useRef, useState } from "react";

import Editor from "@monaco-editor/react";


function Document({ 
	source,
	onClose,
}) {

	const [isEditorReady, setIsEditorReady] = useState(false);
	const valueGetter = useRef();

	function handleEditorDidMount(_valueGetter) {
		setIsEditorReady(true);
		valueGetter.current = _valueGetter;
	}

	function handleShowValue() {
		alert(valueGetter.current());
	}

	return (
		<Card>
			<CardHeader title={source.title}/>
			<CardContent>
				<Editor
					height="200px"
					language={source.type}
					value={source.content}
					editorDidMount={handleEditorDidMount}
					options= {{
						minimap: { enabled: false },
						readOnly: source.readonly,

						lineNumbers: 'off',
						//glyphMargin: false,
						//folding: false,
						//// Undocumented see https://github.com/Microsoft/vscode/issues/30795#issuecomment-410998882
						//lineDecorationsWidth: 0,
						//lineNumbersMinChars: 0						
					}}
				/>
			</CardContent>
			{/* <Divider  /> */}
			<CardActions>
				<Button onClick={onClose}>Close</Button>
			</CardActions>
		</Card>
	)
}

export default Document