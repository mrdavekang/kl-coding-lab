import React from 'react';
import {BishopBoard} from './BishopBoard.jsx';
const Code=({children})=><pre className="prep-code"><code>{children}</code></pre>;
export function PracticeCard({item,extraSamples=[]}){
  const constructive=!!item.validator;
  return <section id="prep-read" className="prep-section practice-card">
    <p className="prep-eyebrow">{item.support?'3 · USE THE IDEA':'YOUR EXERCISE'}</p><h2>{item.title}</h2><p className="practice-goal">{item.goal}</p>
    {item.reading.map(text=><p key={text}>{text}</p>)}
    {item.board&&<BishopBoard key={item.id} initial={item.board}/>}
    {item.ipo&&<div className="practice-ipo" aria-label="Input, process and output">{item.ipo.map(([label,meaning])=><div key={label}><b>{label}</b><p>{meaning}</p></div>)}</div>}
    {item.buildSteps&&<div className="practice-build"><h3>Build your program</h3><ol>{item.buildSteps.map(step=><li key={step}>{step}</li>)}</ol></div>}
    {item.syntax.length>0&&<dl className="practice-syntax">{item.syntax.map(([code,meaning])=><div key={code}><dt><code>{code}</code></dt><dd>{meaning}</dd></div>)}</dl>}
    {item.example&&<div className="practice-example"><b>Small example</b><Code>{item.example}</Code></div>}
    <p>{item.inputHelp}</p><div className="prep-samples"><div><h3>{item.answerFile?.inputUrl?'Supplied input file':'Sample input'}</h3><Code>{item.answerFile?.inputUrl?`${item.answerFile.inputName} — download or prepare it below.`:item.sampleInput.trimEnd()||'(no input needed)'}</Code></div><div><h3>{item.answerFile?.inputUrl?'Output to produce':constructive||item.answerFile?.type==='binary'?'One valid output':'Expected output'}</h3><Code>{item.sampleOutput||'(nothing printed)'}</Code></div></div>
    {item.original&&extraSamples.map(sample=><div key={sample.title}><div className="prep-samples"><div><h3>{sample.title}</h3><Code>{sample.input.trimEnd()}</Code></div><div><h3>One valid output</h3><Code>{sample.output}</Code></div></div><p>{sample.explanation}</p></div>)}
  </section>;
}
