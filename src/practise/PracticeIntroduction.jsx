import React from 'react';
import './introduction.css';

function IntroductionDiagram({diagram}){
 if(diagram.kind==='image')return <picture><source media="(max-width:600px)" srcSet={`${import.meta.env.BASE_URL}mcc-bishop/${diagram.name}-mobile.svg`}/><img src={`${import.meta.env.BASE_URL}mcc-bishop/${diagram.name}.svg`} alt={diagram.alt}/></picture>;
 if(diagram.kind==='table')return <div className="intro-table-scroll"><table><thead><tr>{diagram.headers.map(label=><th scope="col" key={label}>{label}</th>)}</tr></thead><tbody>{diagram.rows.map((row,index)=><tr key={index}>{row.map((cell,column)=><td key={column}>{cell}</td>)}</tr>)}</tbody></table></div>;
 if(diagram.kind==='index')return <div className="intro-indices" aria-label="List positions and their stored values">{diagram.values.map((value,index)=><div key={index} className={index===diagram.selected?'intro-index-selected':''}><span>Index {index}</span><b>"{value}"</b>{diagram.names&&<small>int(...) → {diagram.names[index]}</small>}{index===diagram.selected&&<em>Selected item</em>}</div>)}</div>;
 if(diagram.kind==='range')return <div className="intro-range"><code>range({diagram.start}, {diagram.stop})</code><div>{Array.from({length:diagram.stop-diagram.start+1},(_,index)=>{const value=diagram.start+index,stop=value===diagram.stop;return <div key={value} className={stop?'intro-range-stop':''}><b>{value}</b><span>{stop?'STOP: excluded':'included'}</span></div>;})}</div></div>;
 return <ol className="intro-flow">{diagram.panels.map((panel,index)=><li key={index}><span className="intro-flow-label">{panel.label}</span><pre>{panel.lines.join('\n')}</pre>{index<diagram.panels.length-1&&<span className="intro-flow-arrow" aria-hidden="true">→</span>}</li>)}</ol>;
}

export function PracticeIntroduction({item}){
 const intro=item.introduction;
 if(!intro)return null;
 return <section id="prep-intro" className="prep-section practice-introduction" aria-labelledby="practice-intro-title"><p className="prep-eyebrow">FIRST · READ AND LOOK</p><h2 id="practice-intro-title">{intro.title}</h2>{intro.reading.map(text=><p key={text}>{text}</p>)}<figure className={`intro-diagram intro-diagram-${intro.diagram.kind}`}><IntroductionDiagram diagram={intro.diagram}/><figcaption>{intro.diagram.caption}</figcaption></figure><a className="prep-outline" href="#prep-typing">Try the little example →</a></section>;
}
