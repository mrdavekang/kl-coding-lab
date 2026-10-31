import React from 'react';
import {downloadFile} from '../storage.js';
export function AnswerFilePractice({item,answer,onChange,onCheck,feedback,passed,disabled,data,loadState,onPrepare,canUseRun,onUseRun}){
 const file=item.answerFile;
 return <section id="prep-answer-file" className="prep-section answer-file-practice" aria-labelledby="answer-file-title">
  <p className="prep-eyebrow">MAKE AN ANSWER FILE</p><h2 id="answer-file-title">Your answer text</h2>
  <p>Work by hand, use the optional Python desk below, or combine both. The answer file contains only the result.</p>
  <dl className="answer-file-pair"><div><dt>Given input</dt><dd><code>{file.inputName}</code></dd></div><div><dt>Your output</dt><dd><code>{file.outputName}</code></dd></div></dl>
  {file.summary&&<p>{file.summary}</p>}
  <div className="practice-learning-actions"><button className="prep-outline" disabled={disabled||loadState!=='ready'} onClick={()=>downloadFile(file.inputName,data)}>Download this input</button><button className="prep-outline" disabled={disabled||loadState!=='ready'} onClick={onPrepare}>Use this file as Python input</button></div>
  <p className="prep-muted" role="status">{loadState==='loading'?'Loading the supplied input file…':loadState==='error'?'The input file did not load. Reload this page to try again.':'The check uses this fixed input. A different case needs its own answer.'}</p>
  <label className="prep-field" htmlFor="answer-file-entry"><b>Answer for {file.outputName}</b><span>{file.type==='binary'?'First line: minimum swap count. Next lines: one pair of positions per swap.':file.type==='bishop'?'One integer per line: the minimum reachable count for each case, in input order.':'One line: starting round, then ending round.'}</span><textarea id="answer-file-entry" rows={6} spellCheck={false} maxLength={12000} disabled={disabled} value={answer} onChange={e=>onChange(e.target.value)}/></label>
  <div className="practice-learning-actions"><button className="prep-primary" disabled={disabled||loadState!=='ready'} onClick={onCheck}>Check my answer file</button><button className="prep-outline" disabled={disabled||!canUseRun} onClick={onUseRun}>Use latest Python output as my answer</button><button className="prep-outline" disabled={disabled||!passed} onClick={()=>downloadFile(file.outputName,answer.trimEnd()+'\n')}>Download {file.outputName}</button></div>
  {passed&&<p className="prep-check-state">✓ Current answer passed for this fixed input.</p>}
  {feedback&&<div className={`prep-feedback ${feedback.passed?'prep-success':'prep-retry'}`} role="status"><b>{feedback.passed?'Current answer checked':'Check one small thing'}</b><p>{feedback.message}</p></div>}
  <p className="practice-evidence-note">Typing matches and MCQs are separate practice steps. This check validates the current answer for this input. Editing the answer clears its current pass.</p>
  {item.original&&<details className="answer-file-packaging"><summary>Keep the competition files in order</summary><ol><li>Keep the input and its matching answer together: <code>{file.inputName}</code> → <code>{file.outputName}</code>.</li><li>Use plain text. Exclude the question, prompts and Python source.</li><li>{file.type==='bishop'?'The supplied PDF names the required answer files. Follow the competition’s actual upload instructions when they are provided.':'The supplied output-task kit describes placing only the required out_...txt answer files at the top level of output.zip. Do not place them inside a folder.'}</li><li>Keep your own copy. These classroom downloads do not submit to the competition.</li></ol></details>}
 </section>;
}
