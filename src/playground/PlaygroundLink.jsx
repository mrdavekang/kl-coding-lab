import React from 'react';
import {pageUrl} from '../navigation.js';
export function PlaygroundLink({className=''}){
 const href=pageUrl(typeof location==='undefined'?'https://example.test/':location.href);
 return <a className={`playground-link ${className}`} href={href.toString()} target="_blank" rel="noopener noreferrer">Python playground ↗</a>;
}
