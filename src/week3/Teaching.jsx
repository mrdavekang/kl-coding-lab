import React from 'react';

export function Reading({guide}){
 return <section className="mcc-reading-steps" aria-label="Read before coding">
  {guide.reading?.map((part,i)=><section key={part.title}><h3><span className="mcc-reading-number">{i+1}</span>{part.title}</h3>{part.paragraphs.map(text=><p key={text}>{text}</p>)}</section>)}
 </section>;
}
export function WorkedReasoning({guide}){
 return <div className="mcc-worked-reasoning">
  {guide.worked&&<div className="mcc-table-scroll"><table><caption>{guide.worked.caption}</caption><thead><tr>{guide.worked.headers.map(h=><th scope="col" key={h}>{h}</th>)}</tr></thead><tbody>{guide.worked.rows.map((row,i)=><tr key={i}>{row.map((cell,j)=><td key={j}>{cell}</td>)}</tr>)}</tbody></table></div>}
  {guide.walkthrough?.length>0&&<><h4>Why it works</h4><ol>{guide.walkthrough.map(text=><li key={text} style={{whiteSpace:'pre-wrap'}}>{text}</li>)}</ol></>}
  {guide.snippets?.map(snippet=><section key={snippet.title}><h4>{snippet.title}</h4><pre className="mcc-code-text"><code>{snippet.code}</code></pre><p>{snippet.note}</p></section>)}
  {guide.question&&<div className="mcc-understanding"><h4>Check your understanding</h4><p>{guide.question.question}</p><p className="mcc-small">Explain your thinking aloud or to a partner, then read the explanation below.</p><p className="mcc-answer-explanation"><b>Explanation:</b> {guide.question.answer}</p></div>}
 </div>;
}
export function TaskSteps({guide}){
 return <section className="mcc-task-steps" aria-label="Instructions for this task"><h4>What to do, step by step</h4><ol>{guide.steps.map(text=><li key={text}>{text}</li>)}</ol><p><b>You have finished when:</b> {guide.success}</p></section>;
}
