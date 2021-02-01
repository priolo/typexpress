import React from 'react';

import { Lock, LockOpen } from '@material-ui/icons';


export default function TextBool({
	value,
}) {
	return value ? <Lock /> : <LockOpen />
}
