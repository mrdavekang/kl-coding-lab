import React from 'react';
import {referenceUrl} from './state.js';
export function ReferenceLink({topic='start',children='Python reference ↗',className=''}){
 const href=referenceUrl(typeof location==='undefined'?'https://example.test/?week=mcc-practise':location.href,topic);
 return <a className={`practice-reference-link ${className}`} href={href.toString()} target="_blank" rel="noopener noreferrer">{children}</a>;
}
