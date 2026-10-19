import React from 'react';
import {CheckCircle2} from 'lucide-react';
export function ReasoningPractice({item,answer,onChange,onCheck,feedback}) {
  const values=answer.split('\n');
  const edit=(index,value)=>{const next=item.reasoning.map((_,i)=>values[i]||'');next[index]=value;onChange(next.join('\n'));};
  return <section className="prep-section mco-reasoning" aria-label="Reasoning workspace">
    <p className="prep-eyebrow">PAPER FIRST · NO PYTHON NEEDED</p><h2>Work it out, then check</h2><p>Use counters, a number line or a sketch. Enter your answers below and explain one calculation in your own words.</p>
    {item.reasoning.map((field,index)=><div className="mco-answer" key={field.label}>
      {field.choices?<><b id={`mco-answer-label-${index}`}>{field.label}</b><div className="mco-answer-choices" role="group" aria-labelledby={`mco-answer-label-${index}`}>{field.choices.map(choice=><button key={choice} className="prep-outline" aria-pressed={values[index]===choice} onClick={()=>edit(index,choice)}>{choice}</button>)}</div></>:
        <label htmlFor={`mco-answer-${index}`}><b>{field.label}</b><input id={`mco-answer-${index}`} inputMode="numeric" autoComplete="off" maxLength={40} value={values[index]||''} onChange={event=>edit(index,event.target.value)}/></label>}
    </div>)}
    <button className="prep-primary" onClick={onCheck}><CheckCircle2 size={18}/>Check my reasoning</button>
    {feedback&&<section className={`prep-feedback ${feedback.passed?'prep-success':'prep-retry'}`} aria-live="polite"><h3>{feedback.passed?'Your answers match':'Check one small thing'}</h3><p>{feedback.message}</p>{feedback.cases.map((row,index)=><div className="mco-reasoning-feedback" key={row.input}><b>{row.input}: {row.passed?'✓ Correct':'Try again'}</b><p>Your answer: {row.actual||'(not entered)'} · Expected: {row.expected}</p><p>{item.reasoning[index].explanation}</p></div>)}</section>}
  </section>;
}
