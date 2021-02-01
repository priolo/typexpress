import { useRef } from "react";
import FormParagraph from "../../components/common/form/FormParagraph";
import FormRow from "../../components/common/form/FormRow";
import { Button, Divider, FormControl, IconButton, InputLabel, makeStyles, MenuItem, Select, Typography } from "@material-ui/core";
import { KeyboardArrowLeft as ArrowLeftIcon, KeyboardArrowRight as ArrowRigthIcon } from "@material-ui/icons";
import { useNode } from "../../store/node";
import FormRowExpandible from "../../components/common/form/FormRowExpandible";
import Editor from "@monaco-editor/react";


function NodeBase() {

	const { state: node, toggleStateOpen, isStateOpen, setAction } = useNode()
	const classes = useStyles()
	const valueGetter = useRef();

	function handleEditorDidMount(_valueGetter) {
		valueGetter.current = _valueGetter;
	}

	return (
		<FormParagraph title="Base" id="state">

			<FormRow label="Name" sublabel="del nodo">
				<Typography>{node?.select.name}</Typography>
			</FormRow>

			<FormRow label="Id" sublabel="Random ID">
				<Typography>{node?.select.id}</Typography>
			</FormRow>

			<FormRow label="State" sublabel="JSON">
				<IconButton onClick={toggleStateOpen}>{isStateOpen()?<ArrowRigthIcon />:<ArrowLeftIcon />}</IconButton>
			</FormRow>

			<FormRowExpandible label="Dispatch" sublabel="Action">
				<FormRow label="Action" sublabel="What to do">
				<FormControl fullWidth>
					<InputLabel>Select action</InputLabel>
					<Select
						value={node.action}
						onChange={e=>setAction(e.target.value)}
					>
						{node.actions.map(action => (
							<MenuItem key={action} value={action}>{action}</MenuItem>
						))}
					</Select>
				</FormControl>
				</FormRow>
				<Typography>Payload</Typography>
				<Editor
					height="200px"
					language={"json"}
					value={"..."}
					editorDidMount={handleEditorDidMount}
					options= {{
						minimap: { enabled: false },
						//readOnly: source.readonly,

						//lineNumbers: 'off',
						//glyphMargin: false,
						//folding: false,
						//// Undocumented see https://github.com/Microsoft/vscode/issues/30795#issuecomment-410998882
						//lineDecorationsWidth: 0,
						//lineNumbersMinChars: 0						
					}}
				/>
				<Divider />
				<Button>SEND</Button>
			</FormRowExpandible>

		</FormParagraph>
	)
}

export default NodeBase

const useStyles = makeStyles(theme => ({
}));