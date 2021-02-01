/* eslint eqeqeq: "off", react-hooks/exhaustive-deps: "off"*/
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useLayout } from '../../store/layout';
import { useNode } from '../../store/node';
import { useParams } from 'react-router-dom';

import Form from '../../components/common/form/Form';
import NodeBase from './NodeBase';
import Document from '../../components/app/Node/Document';


function NodePage() {

	const { id } = useParams();
	const { state:node, fetchById } = useNode()
	const { state:layout, setTitle } = useLayout()
	const { t } = useTranslation()

	useEffect(() => {
		setTitle(t("pag.node.title"))
		fetchById(id)
	}, [id])

	return (
		<Form
			rigthRender={layout.formDocs.map(d=>(
				<Document source={d} />
			))}
		>
			<NodeBase />
		</Form>
	)
}

export default NodePage