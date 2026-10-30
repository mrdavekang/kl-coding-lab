import React,{useRef,useState} from 'react';
import {ipoDefinitions,typingStatus,supportStatus} from './learningSupport.js';

const characterName=character=>character===undefined?'the end of the example':character===' '?'a space':character==='\n'?'Enter':`“${character}”`;

export function PracticeLearning({item,record={},onChange,disabled=false}){
  const input=useRef(),leaveWithTab=useRef(false);
  const [keyboardHelp,setKeyboardHelp]=useState('');
  const support=item.support,state=typingStatus(record.text||'',support.code),status=supportStatus(item,record);
  const updateText=value=>onChange({text:value});
  function insertText(value,start,end){
    updateText((record.text||'').slice(0,start)+value+(record.text||'').slice(end));
    requestAnimationFrame(()=>{input.current?.focus();input.current?.setSelectionRange(start+value.length,start+value.length);});
  }
  function keyDown(event){
    const field=event.currentTarget,start=field.selectionStart,end=field.selectionEnd,text=field.value;
    if(event.key==='Escape'){leaveWithTab.current=true;setKeyboardHelp('Press Tab to move out of the typing box.');return;}
    if(event.key==='Tab'){
      if(leaveWithTab.current){leaveWithTab.current=false;setKeyboardHelp('');return;}
      event.preventDefault();
      if(event.shiftKey){
        const lineStart=text.lastIndexOf('\n',start-1)+1,spaces=/^ {1,4}/.exec(text.slice(lineStart))?.[0].length||0;
        if(spaces){updateText(text.slice(0,lineStart)+text.slice(lineStart+spaces));requestAnimationFrame(()=>input.current?.setSelectionRange(Math.max(lineStart,start-spaces),Math.max(lineStart,end-spaces)));}
      }else insertText('    ',start,end);
    }
    if(event.key==='Enter'){
      event.preventDefault();
      const current=text.slice(text.lastIndexOf('\n',start-1)+1,start),indent=/^ */.exec(current)[0];
      insertText('\n'+indent+(current.trimEnd().endsWith(':')?'    ':''),start,end);
    }
    if(event.key==='F5'){event.preventDefault();setKeyboardHelp('Use the Python desk below to run your own program. This box is for practising the example.');}
  }
  const changeChoice=(question,choice)=>onChange(previous=>({...previous,answers:{...previous.answers,[question.id]:{choice,checked:false}}}));
  const checkChoice=question=>onChange(previous=>{const answer=previous.answers?.[question.id];return answer?{...previous,answers:{...previous.answers,[question.id]:{...answer,checked:true}}}:previous;});
  return <>
    <section id="prep-typing" className="prep-section practice-typing" aria-labelledby="typing-title">
      <p className="prep-eyebrow">1 · TYPE A SMALL EXAMPLE</p>
      <h2 id="typing-title">Get comfortable writing the code</h2>
      <p>{support.intro}</p>
      <div className="practice-stage"><b>{item.number<=9?'Follow a short example':item.number<=22?'Use a familiar pattern':'Build with less help'}</b><span>Work at your own pace.</span></div>
      <p className="typing-instruction">Type the example into the empty box. <b>·</b> marks a space and <b>↵</b> marks Enter.</p>
      <pre className="typing-model" aria-label="Example code to type"><code aria-hidden="true">{[...state.expected].map((character,index)=><React.Fragment key={index}><span className={index<state.prefix?'typing-match':index===state.error?'typing-error':index===state.prefix?'typing-next':''}>{character===' '?'·':character==='\n'?'↵':character}</span>{character==='\n'?'\n':''}</React.Fragment>)}</code><span className="typing-accessible">{state.expected}</span></pre>
      <label className="typing-label" htmlFor="typing-entry">Type the practice code</label>
      <textarea ref={input} id="typing-entry" className="typing-entry" rows={Math.min(8,Math.max(3,state.expected.split('\n').length+1))} spellCheck={false} autoCapitalize="off" autoCorrect="off" autoComplete="off" maxLength={2500} disabled={disabled} value={record.text||''} onChange={event=>updateText(event.target.value)} onKeyDown={keyDown} aria-describedby="typing-keys typing-feedback"/>
      <p id="typing-keys" className="typing-keys">Tab inserts 4 spaces. Enter keeps indentation. Shift+Tab removes one indent. Escape then Tab moves out.</p>
      <div className="typing-progress"><progress max={state.expected.length} value={state.prefix} aria-label="Matching characters"/><span>{state.prefix} / {state.expected.length} characters in order</span></div>
      <p id="typing-feedback" className={`typing-feedback ${state.complete?'is-complete':state.error!==null?'needs-fix':''}`} role="status">{state.complete?'Code matched. Now check what the syntax means.':state.error!==null?`At line ${state.line}, column ${state.column}, the example needs ${characterName(state.expected[state.error])}. Change this character, then continue.`:'Follow the highlighted character. Include brackets, quotes, colons and spaces.'}</p>
      {keyboardHelp&&<p role="status" className="typing-keys">{keyboardHelp}</p>}
      <div className="practice-learning-actions"><button className="prep-outline" disabled={disabled||!record.text} onClick={()=>updateText('')}>Practise typing again</button><a className="prep-outline" href="#prep-understand">Try the questions →</a></div>
      <details className="typing-example-result"><summary>What would this example do?</summary><p>This is the small example. Your program task below may use different data.</p><div className="prep-samples"><div><b>Example input</b><pre className="prep-code">{support.input.trimEnd()||'(no input)'}</pre></div><div><b>Example output</b><pre className="prep-code">{support.output||'(nothing printed)'}</pre></div></div></details>
    </section>
    <section id="prep-understand" className="prep-section practice-understanding" aria-labelledby="understanding-title">
      <p className="prep-eyebrow">2 · UNDERSTAND WHAT YOU TYPED</p><h2 id="understanding-title">What does the code mean?</h2>
      <details className="practice-ipo-help" open={item.number<=5}><summary>Input, process or output?</summary><dl>{ipoDefinitions.map(([label,meaning])=><div key={label}><dt>{label}</dt><dd>{meaning}</dd></div>)}</dl><p>One instruction can combine jobs. Questions may ask for its main job, or show just one part of it.</p></details>
      <p className="practice-question-count">{status.correct} / {status.total} answers checked and correct. You can try again.</p>
      {support.questions.map((question,index)=>{const answer=record.answers?.[question.id],correct=answer?.checked&&answer.choice===question.answer,wrong=answer?.checked&&!correct;return <fieldset className="practice-question" key={question.id} disabled={disabled}><legend>{index+1}. {question.prompt}</legend><span className="question-kind">{question.kind==='ipo'?'Input · Process · Output':'Python meaning'}</span>{question.code&&<pre className="prep-code"><code>{question.code}</code></pre>}<div className="practice-choices">{question.choices.map(choice=><label key={choice.id} className={answer?.choice===choice.id?'is-selected':''}><input type="radio" name={`${item.id}-${question.id}`} value={choice.id} checked={answer?.choice===choice.id} onChange={()=>changeChoice(question,choice.id)}/><span>{choice.label}</span></label>)}</div><button className="prep-outline" disabled={!answer?.choice||correct} onClick={()=>checkChoice(question)}>{correct?'Answer checked':'Check answer'}</button>{correct&&<p className="question-feedback is-correct" role="status"><b>Correct.</b> {question.explanation}</p>}{wrong&&<p className="question-feedback try-again" role="status"><b>Try again.</b> {question.hint}</p>}</fieldset>;})}
      <a className="prep-primary" href="#prep-read">Use it in your own program →</a>
      <p className="practice-evidence-note">Matching an example and answering questions are practice steps. Run and check your own program below.</p>
    </section>
  </>;
}
