import React,{useEffect,useRef,useState} from 'react';
import {Editor} from '../Editor.jsx';
import {PythonRuntime,friendlyError} from '../runtime.js';
import {downloadFile} from '../storage.js';
import {recordAttempt,taskStatus} from '../evidence.js';
import {FlatReview} from '../week3/FlatReview.jsx';
import {ReportPanel} from '../ReportPanel.jsx';
import {Walkthrough,stepDescription} from '../week2/Walkthrough.jsx';
import {stages,main1,main2,extensions,tasks,checkedTasks,taskById,donow,checkSpec,facts,arrangements,rehearsalSteps,readinessItems,preferenceOptions} from './content.js';
import {topics,reviewAt,updateReview,reportConfig,validateWeek5,progress,preferenceText,preferenceComplete,outputFileReady} from './state.js';
import '../week3/week3.css';
import '../week4/week4.css';
import './week5.css';

function CodeText({children}){return <pre className="mcc-code-text"><code>{children}</code></pre>;}
function ExternalLink({href,children}){return <a href={href} target="_blank" rel="noopener noreferrer">{children} ↗</a>;}

function FactCard({id,work,setWork}){
  const fact=facts[id],revealed=work.answerReveals[id];
  return <section className="w4-teach-block w5-fact" aria-labelledby={`fact-${id}`}>
    <p className="w4-step-label">READ · DISCUSS · CHECK</p><h2 id={`fact-${id}`}>{fact.title}</h2>
    {fact.reading.map(text=><p key={text}>{text}</p>)}
    {fact.syntax&&<div className="w4-vocab">{fact.syntax.map(([syntax,meaning])=><div key={syntax}><code>{syntax}</code><span>{meaning}</span></div>)}</div>}
    {fact.code&&<CodeText>{fact.code}</CodeText>}
    <div className="w5-discussion"><h3>Class discussion</h3><p>Think first, then explain to your partner. You can record your own answer.</p>
      {fact.questions.map(([question],index)=><div key={question}><label htmlFor={`${id}-${index}`}>{index+1}. {question}</label><textarea id={`${id}-${index}`} rows={2} maxLength={3000} value={work.factResponses[`${id}-${index}`]||''} onChange={event=>setWork(old=>({...old,factResponses:{...old.factResponses,[`${id}-${index}`]:event.target.value}}))}/></div>)}
      <button aria-expanded={!!revealed} aria-controls={`answers-${id}`} onClick={()=>setWork(old=>({...old,answerReveals:{...old.answerReveals,[id]:!revealed}}))}>{revealed?'Hide discussion answers':'Reveal discussion answers'}</button>
    </div>
    {revealed&&<section className="w5-answers" id={`answers-${id}`}><h3>Discussion answers</h3>{fact.questions.map(([question,answer],index)=><div key={question}><b>{index+1}. {question}</b><p>{answer}</p></div>)}<p className="mcc-small">Compare with your thinking. Explain a correction using the code or the example.</p></section>}
  </section>;
}

function CompetitionBrief(){return <section className="w5-competition" aria-labelledby="mcc-arrangements">
  <p className="w4-step-label">MCC 2026 · CHECKED {arrangements.checked.toUpperCase()}</p><h2 id="mcc-arrangements">Your competition arrangements</h2>
  <div className="w5-date-grid"><div><b>Competition window</b><p>{arrangements.dates}</p><small>Plan your working time and breaks within this window.</small></div><div><b>Registration and payment</b><p>Register by {arrangements.registration}. Payment by {arrangements.payment}.</p><strong>{arrangements.fee}</strong></div></div>
  <div className="w5-formats"><section><span>01 · OUTPUT FORMAT</span><h3>Submit the answer file</h3><p>Download input files and upload output files. Hand calculation is allowed. Keep any code you used for the exit survey.</p></section><section><span>02 · CODE FORMAT</span><h3>Submit the program</h3><p>Upload code that reads standard input and prints standard output. The judge tests hidden inputs.</p></section></div>
  <p>CMS is the competition platform. A practice contest will run beforehand. Students may compete at home. Printed/online resources are allowed; generative AI and discussing contest problems with others are prohibited.</p>
  <div className="w5-pending"><b>School option · awaiting confirmation</b><p>{arrangements.school}</p><p>{arrangements.registrationPlan}</p></div>
  <p className="mcc-small">This lesson is rehearsal. The app does not register you or submit competition answers.</p>
  <div className="w5-links">{arrangements.links.map(([label,href])=><ExternalLink key={href} href={href}>{label}</ExternalLink>)}</div>
</section>;}

function PreferenceForm({profile,work,setWork,onNotice}){
  function edit(field,value){setWork(old=>({...old,preference:{...old.preference,[field]:value,confirmedAt:''}}));}
  function confirm(event){event.preventDefault();if(!preferenceComplete(work.preference))return;setWork(old=>({...old,preference:{...old.preference,confirmedAt:new Date().toISOString()}}));onNotice('Response recorded in this browser. Download it and hand it to your teacher.');}
  return <section className="w5-preference" aria-labelledby="competition-choice"><h2 id="competition-choice">Where would you like to compete?</h2>
    <p>Choose after trying the IDE. School arrangements are still to be confirmed. Your response helps your teacher plan; it is not registration.</p>
    <form onSubmit={confirm}>
      {Object.entries(preferenceOptions).map(([field,options])=><fieldset key={field}><legend>{({intent:'Do you intend to take part?',location:'Your preferred location',parent:'Have you discussed this with a parent or carer?',availability:'Could you attend a school session?'})[field]}</legend><div className="w5-radio-options">{options.map(option=><label key={option}><input type="radio" name={`preference-${field}`} value={option} checked={work.preference[field]===option} onChange={()=>edit(field,option)} required/>{option}</label>)}</div></fieldset>)}
      <label htmlFor="competition-support">What support would help? Optional.</label><textarea id="competition-support" rows={3} maxLength={1500} value={work.preference.support} onChange={event=>edit('support',event.target.value)} placeholder="A computer, transport, registration help, more practice…"/>
      <h3>My readiness check</h3><p className="mcc-small">These are your own reports. Ask for help when you need it.</p>
      {readinessItems.map(([id,label])=><fieldset className="w5-ready-row" key={id}><legend>{label}</legend>{[[true,'Ready'],[false,'Need help']].map(([value,text])=><label key={text}><input type="radio" name={`readiness-${id}`} checked={work.readiness[id]===value} onChange={()=>setWork(old=>({...old,readiness:{...old.readiness,[id]:value},preference:{...old.preference,confirmedAt:''}}))}/>{text}</label>)}</fieldset>)}
      <button className="mcc-primary" type="submit" disabled={!preferenceComplete(work.preference)}>Record my response</button>
    </form>
    <p role="status">{work.preference.confirmedAt?'Response recorded locally. Download and hand it in.':'Draft response. Answer the four preference questions, then record it.'}</p>
    <button disabled={!work.preference.confirmedAt} onClick={()=>downloadFile(`week5-MCC-response-${profile.name.replace(/[^a-z0-9]/gi,'-')}.txt`,preferenceText(profile,work))}>Download my response for my teacher</button>
    <p className="mcc-small">Your name, class and choices are included in the text file, learning report and backup. Nothing is sent automatically.</p>
  </section>;
}

export function Week5App({profile,initialWork,onSave,onLeave}){
  const [work,setWork]=useState(()=>validateWeek5(initialWork));
  const [page,setPage]=useState('lesson'),[stageId,setStageId]=useState(work.stage),[taskId,setTaskId]=useState(work.task);
  const [example,setExample]=useState(false),[status,setStatus]=useState('loading'),[output,setOutput]=useState(''),[feedback,setFeedback]=useState(null),[error,setError]=useState('');
  const [saved,setSaved]=useState(true),[notice,setNotice]=useState(''),[textSize,setTextSize]=useState(19),[fontSize,setFontSize]=useState(18);
  const [trace,setTrace]=useState(null),[position,setPosition]=useState(0),[paused,setPaused]=useState(false),[runResult,setRunResult]=useState(null),[rehearsalTask,setRehearsalTask]=useState(main1[1].id);
  const runtime=useRef(),editor=useRef(),active=useRef(),latest=useRef(),backupInput=useRef(),dataInput=useRef(),codeInput=useRef();
  const busy=['running','checking','tracing'].includes(status);
  const stageIndex=stages.findIndex(item=>item.id===stageId),stage=stages[stageIndex];
  const group=stageId==='main1'?main1:stageId==='main2'?main2:stageId==='extension'?extensions:null;
  const task=stageId==='donow'?donow:group?.find(item=>item.id===taskId)||group?.[0]||taskById(taskId)||main1[1];
  const draft=example?task.example:(work.drafts[task.id]??task.starter);
  const stdin=example?(task.exampleInput||''):(work.inputs[task.id]??task.sampleInput??'');
  const current=useRef();current.current={task,draft,stdin,example};
  latest.current={...work,stage:stageId,task:taskId};

  useEffect(()=>{const timer=setTimeout(()=>setSaved(onSave(latest.current)),250);return()=>clearTimeout(timer);},[work,stageId,taskId]);
  useEffect(()=>{const persist=()=>onSave(latest.current);window.addEventListener('pagehide',persist);return()=>{persist();window.removeEventListener('pagehide',persist);};},[]);
  useEffect(()=>{
    runtime.current=new PythonRuntime({
      status:(next,message)=>{setStatus(next);if(message)setError(message);},
      output:text=>{setOutput(old=>old+text);if(active.current)active.current.output+=text;},
      input:()=>setError('Stop and put every input line in Program input before running again.'),
      stopping:message=>setNotice(message),
      trace:(step,isPaused)=>{setTrace(old=>{const next={...old,steps:[...(old?.steps||[]),step]};setPosition(next.steps.length-1);return next;});setPaused(isPaused);},
      finish:result=>{
        const attempt=active.current;
        if(attempt&&!attempt.example&&attempt.kind!=='trace')setWork(old=>recordAttempt(old,attempt,result));
        if(result.type==='checked'){
          setFeedback(result.result);
          if(result.result.passed&&attempt)setWork(old=>({...old,passed:{...old.passed,[attempt.taskId]:attempt.code}}));
        }
        if(result.type==='done'&&attempt&&!attempt.example&&attempt.kind==='run')setRunResult({taskId:attempt.taskId,code:attempt.code,input:attempt.stdin,output:attempt.output});
        if(result.type==='error'){setError(result.stopped?'Program stopped. Your code is kept.':result.message);if(attempt?.kind==='trace')setTrace(old=>({...old,error:result.message}));}
        setPaused(false);active.current=null;
      }
    });runtime.current.start();return()=>runtime.current.destroy();
  },[]);

  function guard(){if(runtime.current?.active){setNotice('Stop the program before changing pages.');return false;}return true;}
  function clear(){setExample(false);setOutput('');setFeedback(null);setError('');setTrace(null);setRunResult(null);setPaused(false);}
  function openStage(id){if(!guard())return;setStageId(id);if(id==='main1')setTaskId(main1[1].id);if(id==='main2')setTaskId(main2[0].id);if(id==='extension')setTaskId(extensions[0].id);setPage('lesson');clear();setNotice('');window.scrollTo({top:0});}
  function openTask(id){const selected=taskById(id);if(!selected){if(stages.some(s=>s.id===id))openStage(id);return;}if(!guard())return;setTaskId(id);setStageId(selected.group);setPage('lesson');clear();setWork(old=>({...old,visited:{...old.visited,[id]:true}}));window.scrollTo({top:0});}
  function openPage(id){if(!guard())return;setPage(id);clear();setNotice('');window.scrollTo({top:0});}
  function updateField(field,value){setWork(old=>({...old,[field]:{...old[field],[task.id]:value}}));}
  function changeCode(value){if(busy||example)return;updateField('drafts',value);setFeedback(null);setTrace(null);setRunResult(null);}
  function begin(code,input,kind,isExample){
    if(!runtime.current?.ready||runtime.current.active)return;
    setOutput('');setFeedback(null);setError('');setRunResult(null);setPosition(0);setPaused(false);
    active.current={taskId:task.id,code,stdin:input,inputs:input?[input]:[],output:'',kind,example:isExample,startedAt:new Date().toISOString()};
    if(!isExample)setWork(old=>({...old,attempted:{...old.attempted,[task.id]:true}}));
    if(kind==='trace'){setTrace({code,example:isExample,steps:[]});runtime.current.walk(code,{stdin:input});}
    else{setTrace(null);runtime.current.execute(code,kind==='check'?task.check:undefined,{stdin:input,spec:checkSpec(task)});}
  }
  function run(kind='run'){const live=current.current;begin(live.draft,live.stdin,kind,live.example);}
  function exploreExample(kind){if(!guard())return;setExample(true);begin(task.example,task.exampleInput||'',kind,true);requestAnimationFrame(()=>document.querySelector('.mcc-python')?.scrollIntoView({behavior:'smooth',block:'start'}));}
  function nextTrace(iteration){
    if(position<trace.steps.length-1){const nextIndex=iteration?trace.steps.findIndex((step,index)=>index>position&&(step.iterationChanged||step.loopFinished||step.event==='end')):position+1;setPosition(nextIndex<0?trace.steps.length-1:nextIndex);}
    else if(runtime.current.nextTrace(iteration))setPaused(false);
  }
  function backup(){downloadFile('kl-coding-week-5-backup.json',JSON.stringify({format:'kl-coding-lab-backup',version:5,lesson:5,student:{name:profile.name,className:profile.className},work:latest.current},null,2),'application/json');}
  async function restore(event){const file=event.target.files?.[0];if(!file)return;try{if(!guard())return;if(file.size>5000000)throw Error('Choose a backup smaller than 5 MB.');const data=JSON.parse(await file.text());if(data.format!=='kl-coding-lab-backup'||data.lesson!==5)throw Error('Choose a Week 5 backup. Other weeks keep their own work.');const clean=validateWeek5(data.work);backup();setWork(clean);setStageId(clean.stage);setTaskId(clean.task);clear();setNotice('Week 5 restored. Your previous Week 5 work was downloaded first.');}catch(err){setNotice(err.message);}finally{event.target.value='';}}
  async function importText(event,kind){const file=event.target.files?.[0];if(!file)return;try{if(!guard())return;if(file.size>100000)throw Error('Choose a practice file smaller than 100 KB.');const text=await file.text();if(kind==='code'){if(!file.name.toLowerCase().endsWith('.py'))throw Error('Choose a Python .py file.');updateField('recoverable',draft);changeCode(text);setNotice('Python file opened. Recover previous code keeps your earlier draft.');}else{updateField('inputs',text);setRunResult(null);setNotice('Input file loaded. Predict, then run.');}}catch(err){setNotice(err.message);}finally{event.target.value='';}}
  const nextLabel=stageIndex===stages.length-1?'Open my learning report':`Next: ${stages[stageIndex+1].label}`;
  const navButtons=<div className="mcc-bottom"><button disabled={busy||stageIndex===0} onClick={()=>openStage(stages[stageIndex-1].id)}>← Back</button><button disabled={busy} className="mcc-primary" onClick={()=>stageIndex===stages.length-1?openPage('report'):openStage(stages[stageIndex+1].id)}>{nextLabel} →</button></div>;
  const canDownloadOutput=!example&&outputFileReady(runResult,task.id,draft,stdin);
  const selectedRehearsal=main1.find(t=>t.id===rehearsalTask),rehearsalCode=work.drafts[rehearsalTask];

  const pythonWorkspace=<section className="mcc-python" aria-label="Built-in Python workspace">
    {example&&<div className="mcc-example-banner"><b>Worked example tutor</b><p>Your own draft is kept separately.</p><button disabled={busy} onClick={()=>{clear();}}>Return to my task</button></div>}
    <div className="mcc-editor-label"><b>{example?'Worked example.py':'Your answer.py'}</b><span role="status">{({loading:'Loading Python…',ready:'Python ready',running:'Running…',checking:'Checking fresh data…',tracing:'Line-by-line tutor',unavailable:'Python needs attention'})[status]}</span></div>
    <div className="mcc-editor"><Editor ref={editor} key={task.id+(example?'-example':'')} value={draft} onChange={changeCode} onRun={()=>run()} fontSize={fontSize} readOnly={busy||example} executedLine={trace?.steps[position]?.executedLine} nextLine={trace?.steps[position]?.nextLine}/></div>
    {(task.needsInput||example&&task.exampleInput)&&<><label className="mcc-input-label" htmlFor="w5-input">Program input <span>One line per input() call</span></label><textarea id="w5-input" rows={5} spellCheck={false} maxLength={100000} disabled={busy||example} value={stdin} onChange={event=>{updateField('inputs',event.target.value);setRunResult(null);}}/>{!example&&<div className="mcc-input-actions"><button disabled={busy} onClick={()=>dataInput.current.click()}>Load input file</button><button onClick={()=>downloadFile(`${task.id}-sample.in`,task.sampleInput)}>Download sample input</button></div>}</>}
    <div className="mcc-runbar"><button className="mcc-primary" disabled={status!=='ready'} onClick={()=>run()}>Run {example?'example':'my code'}</button>{!example&&<button disabled={status!=='ready'} onClick={()=>run('check')}>Check my code</button>}<button disabled={status!=='ready'} onClick={()=>run('trace')}>Walk through line by line</button>{busy&&<button className="mcc-stop" onClick={()=>runtime.current.stop()}>Stop</button>}</div>
    <div className="mcc-output"><b>Program output</b><pre aria-label="Program output">{output||'Your output will appear here.'}</pre></div>
    {error&&<section className="mcc-feedback" role="alert"><b>{friendlyError(error).tip}</b><CodeText>{error}</CodeText></section>}
    {status==='unavailable'&&<button onClick={()=>globalThis.crossOriginIsolated?runtime.current.start():location.reload()}>Reload Python</button>}
    {trace&&<Walkthrough flat trace={trace} position={position} paused={paused} busy={status==='tracing'} waiting={false} onPosition={setPosition} onNext={nextTrace} onRestart={()=>run('trace')} onStop={()=>runtime.current.stop()} onClose={()=>setTrace(null)} onSave={step=>{updateField('traceEvidence',{code:trace.code,description:stepDescription(step,trace.example)});setNotice('Tutor step kept in your learning report.');}}/>}
    {!example&&feedback&&<section className="mcc-feedback" aria-live="polite"><h3>{feedback.passed?'✓ Your current code passed these checks':'Let’s fix one thing'}</h3><p>{feedback.message}</p>{feedback.error&&<CodeText>{feedback.error}</CodeText>}{feedback.cases?.length>0&&<div className="mcc-table-scroll"><table><caption>Fresh practice tests</caption><thead><tr><th>Data</th><th>Expected</th><th>Your output</th><th>Result</th></tr></thead><tbody>{feedback.cases.map((row,i)=><tr key={i}><td><pre>{row.input||'(no typed input)'}</pre></td><td><pre>{row.expected}</pre></td><td><pre>{row.actual||'(nothing printed)'}</pre></td><td>{row.passed?'Passed':'Try again'}{row.error&&<CodeText>{row.error}</CodeText>}</td></tr>)}</tbody></table></div>}</section>}
    <div className="mcc-tool-buttons"><button onClick={()=>downloadFile(`${task.id}${example?'-example':''}.py`,draft)}>Download code</button>{!example&&<><button disabled={busy} onClick={()=>codeInput.current.click()}>Open Python file</button><button disabled={!canDownloadOutput} onClick={()=>downloadFile(`${task.id}-answer.out`,runResult.output)}>Download output file</button><button disabled={busy} onClick={()=>editor.current?.undo()}>Undo</button><button disabled={busy} onClick={()=>editor.current?.indent()}>Indent</button><button disabled={busy} onClick={()=>editor.current?.outdent()}>Outdent</button><button disabled={busy} onClick={()=>{updateField('recoverable',draft);changeCode(task.starter);}}>Restore starter</button>{work.recoverable[task.id]!==undefined&&<button disabled={busy} onClick={()=>changeCode(work.recoverable[task.id])}>Recover previous code</button>}</>}</div>
    {!example&&<p className="mcc-small">Run your current code successfully before downloading its output file. Checks and tutor output do not create your answer file.</p>}
  </section>;

  const taskPanel=<article className="w4-task" key={task.id}>
    <p className="mcc-eyebrow">{task.level?`${task.level} · `:''}{task.skills}</p><h2>{task.title}</h2><p className="mcc-lead">{task.scenario}</p>
    <section className="w4-teach-block"><span className="w4-step-label">1 · READ FIRST</span><h3>Structure and syntax</h3>{task.reading.map(text=><p key={text}>{text}</p>)}<div className="w4-vocab">{task.vocabulary.map(([word,meaning])=><div key={word}><b>{word}</b><span>{meaning}</span></div>)}</div></section>
    <section className="mcc-worked w4-example"><span className="w4-step-label">2 · STUDY AN EXAMPLE</span><h3>{task.exampleTitle}</h3><p>{task.exampleScenario}</p><CodeText>{task.example}</CodeText>
      <div className="mcc-samples">{task.exampleInput&&<div><b>Example input</b><CodeText>{task.exampleInput}</CodeText></div>}<div><b>Example output</b><CodeText>{task.exampleOutput}</CodeText></div></div>
      <h4>Written tutor · every code line</h4><ol className="w5-line-notes">{task.example.split('\n').map((line,index)=>line.trim()&&<li key={index}><b>Line {index+1}</b><code>{line.trim()}</code><p>{task.lineNotes[index+1]}</p></li>)}</ol>
      <h4>Written tutor · every iteration</h4><ol>{task.exampleSteps.map(step=><li key={step}>{step}</li>)}</ol>
      <div className="w4-example-actions"><button disabled={status!=='ready'} className="mcc-primary" onClick={()=>exploreExample('trace')}>Open line-by-line tutor</button><button disabled={status!=='ready'} onClick={()=>exploreExample('run')}>Run this example</button></div>
      <p className="mcc-small">Predict before Next line. See the actual values before and after each statement. Next iteration records the steps between loop visits.</p>
    </section>
    {!example&&<><section className="w4-teach-block w4-your-task"><span className="w4-step-label">3 · YOUR TASK</span><h3>Your job</h3><p>{task.goal}</p><p>{task.inputHelp}</p><div className="mcc-samples">{task.dataDisplay&&<div><b>Supplied data</b><CodeText>{task.dataDisplay}</CodeText></div>}{task.needsInput&&<div><b>Sample input</b><CodeText>{task.sampleInput}</CodeText></div>}<div><b>Expected output</b><CodeText>{task.sampleOutput}</CodeText></div></div><p>{task.sampleExplanation}</p></section><section className="mcc-hints"><h3>Small clues</h3>{task.hints.map(hint=><p key={hint}>{hint}</p>)}</section></>}
    <section className="mcc-your-turn"><span className="w4-step-label">4 · RUN, TRACE AND CHECK</span><h3>{example?'Explore the worked example':'Write your own program'}</h3>{pythonWorkspace}</section>
    {!example&&<section className="mcc-explanation"><label htmlFor="w5-explanation">Explain one iteration or fresh test</label><textarea id="w5-explanation" rows={3} maxLength={3000} value={work.explanations[task.id]||''} onChange={event=>updateField('explanations',event.target.value)} placeholder="The current value was… The condition was… The count changed from… to…"/></section>}
  </article>;

  const ideRehearsal=<section className="w5-ide"><p className="w4-step-label">MAIN TASK 2 · PRACTICAL REHEARSAL</p><h2>Move your program into an IDE</h2><p>Start with the program you wrote in Main Task 1. The aim is to run, save and reopen it independently. Then try the input practice below if you are ready.</p>
    <div className="w5-links"><ExternalLink href="https://thonny.org/">Thonny information and downloads</ExternalLink><ExternalLink href="https://ide.usaco.guide/">Browser IDE fallback</ExternalLink></div>
    <p className="mcc-small">Your teacher prepares Thonny before the lesson. Ask for help if installation is needed. Your browser fallback needs internet; test it before competition day.</p>
    <fieldset><legend>Which IDE are you practising with?</legend><div className="w5-radio-options">{['Thonny','Browser IDE','Other'].map(name=><label key={name}><input type="radio" name="ide-choice" checked={work.ide===name} onChange={()=>setWork(old=>({...old,ide:name}))}/>{name}</label>)}</div></fieldset>
    <div className="w5-transfer"><h3>Your Main Task 1 files</h3><div role="group" aria-label="Choose a program to rehearse">{main1.map(item=><button key={item.id} disabled={busy} aria-pressed={rehearsalTask===item.id} onClick={()=>setRehearsalTask(item.id)}>{item.title}</button>)}</div><p>Selected: {selectedRehearsal.title}</p><button className="mcc-primary" disabled={!rehearsalCode?.trim()} onClick={()=>downloadFile(`week5-${rehearsalTask}.py`,rehearsalCode)}>Download my program for the IDE</button>{!rehearsalCode?.trim()&&<p>Write your own program in Main Task 1 first. Its download becomes available here.</p>}</div>
    <ol className="w5-checklist">{rehearsalSteps.map(([id,label,instruction])=><li key={id}><div><h3>{label}</h3><p>{work.ide==='Browser IDE'&&id==='save'?'Choose Python in the browser IDE. Open your .py file if supported, or paste its code. Use its download/save control to keep a local Python file.':work.ide==='Browser IDE'&&id==='run'?'Put sample input in the IDE’s Input area if your program needs it. Predict, click its Run control, and find Output.':instruction}</p></div><label><input type="checkbox" checked={!!work.rehearsal[id]} onChange={event=>setWork(old=>({...old,rehearsal:{...old.rehearsal,[id]:event.target.checked}}))}/>I did this</label></li>)}</ol>
    <p className="mcc-small">The checklist is your self-report. Show your reopened file to your teacher at Learning Pit Stop 2.</p>
    <section className="w5-file-demo"><h3>Practise with a real input file</h3><p>Download this tiny rehearsal file. Open it in a text editor: it contains one number. In the app below, use Load input file, then Run. A successful run lets you download an answer.out file.</p><button onClick={()=>downloadFile('week5-score-sample.in',main2[0].sampleInput)}>Download rehearsal input file</button><CodeText>{main2[0].sampleInput}</CodeText><p>Keep the Python program, input and output as separate files.</p></section>
  </section>;

  return <div className="mcc-app w4-app w5-app" style={{'--mcc-reading-size':`${textSize}px`}}>
    <header className="mcc-header"><button className="mcc-brand" disabled={busy} onClick={()=>openStage('donow')}>KL <b>Coding Lab</b><small>Week 5</small></button><nav aria-label="Week 5 navigation"><button disabled={busy} onClick={()=>openStage('donow')}>Lesson</button><button disabled={busy} onClick={()=>openStage('read2')}>Competition</button><button disabled={busy} onClick={()=>openPage('teacher')}>Teaching notes</button></nav><button aria-label="Change text size" onClick={()=>{setTextSize(n=>n===21?18:n+1);setFontSize(n=>n===22?16:n+2);}}>Aa</button></header>
    <div className="mcc-student"><span><b>{profile.name}</b> · {profile.className} · Week 5</span><div><button disabled={busy} onClick={()=>openPage('files')}>My files</button><button disabled={busy} onClick={()=>openPage('report')}>My learning report</button><button disabled={busy} onClick={()=>{if(onSave(latest.current))onLeave();else setNotice('Saving is unavailable. Download a backup before switching.');}}>Change week / student</button></div></div>
    {notice&&<div className="mcc-notice" role="status">{notice}<button onClick={()=>setNotice('')}>Dismiss</button></div>}
    <div className="mcc-title"><p className="mcc-eyebrow">WEEK 05 · OXFORDAQA 9210 PRACTICE · 60 MINUTES</p><h1>Count it. Run it. Be ready.</h1><p>Can I write, run, check and save a program independently?</p></div>
    <div className="mcc-shell"><aside className="mcc-sidebar"><section className="w4-wagba"><p className="mcc-eyebrow">WAGBA</p><h3>What are we going to be able to do?</h3><ul><li>Choose a counter or total.</li><li>Explain every iteration.</li><li>Run, save and reopen code.</li><li>Choose the right contest file.</li><li>Plan for school or home.</li></ul></section><section><h3>Lesson map · {progress(work)}/{checkedTasks.length} tasks checked</h3><nav aria-label="Week 5 lesson stages">{stages.map((item,i)=><button key={item.id} disabled={busy} aria-current={page==='lesson'&&stageId===item.id?'step':undefined} onClick={()=>openStage(item.id)}><span>{i+1}</span><div><b>{item.label}</b><small>{item.time} min</small></div></button>)}</nav></section><p className="mcc-small" role="status">{saved?'Saved in this browser':'Saving unavailable — download a backup'}. Keep your files before changing devices.</p></aside>
      <main className="mcc-main">
        {page==='files'&&<><h2>Keep your Week 5 work</h2><div className="mcc-file-actions"><button className="mcc-primary" onClick={backup}>Download Week 5 backup</button><button disabled={busy} onClick={()=>backupInput.current.click()}>Restore Week 5 backup</button><button onClick={()=>openPage('report')}>Learning report (PDF)</button><button onClick={()=>downloadFile('week5-MCC-response.txt',preferenceText(profile,work))}>Download competition response</button></div><p>Backups keep your drafts, explanations, tutor evidence, checklist and participation response. Hand your response or report to your teacher.</p>{tasks.filter(t=>work.drafts[t.id]!==undefined).map(item=><div className="mcc-file-row" key={item.id}><b>{item.title}</b><button onClick={()=>downloadFile(`${item.id}.py`,work.drafts[item.id])}>Download Python</button></div>)}</>}
        {page==='report'&&<ReportPanel flat profile={profile} work={work} setWork={setWork} busy={busy} onBackup={backup} lessonConfig={reportConfig}/>}
        {page==='teacher'&&<><h2>Week 5 teaching notes</h2><p>Week 4 reached Fact 1 (running totals) and Fact 2 (conditions). Today practises those ideas, adds Fact 3, and rehearses competition tools. Keep nested loops for a later session.</p><div className="mcc-table-scroll"><table><caption>School lesson sequence</caption><thead><tr><th>Minutes</th><th>Stage</th><th>Teacher move</th></tr></thead><tbody>{stages.map(item=><tr key={item.id}><td>{item.time}</td><th scope="row">{item.label}</th><td>{item.teacher}</td></tr>)}</tbody></table></div><h3>Before the session</h3><ol><li>Prepare Thonny on school devices. Test the browser fallback and downloads on the school network.</li><li>Confirm who registers students and handles payment. Announce a school day/time only after it is agreed.</li><li>Provide a folder and demonstrate opening .py, .in and .out files. TextEdit on Mac must use plain-text mode for answer files.</li><li>Keep both pit stops. A learner who can run and reopen one correct counter has made useful progress.</li><li>Collect downloaded competition responses or PDF reports. There is no automatic collection.</li></ol><h3>Support and stretch</h3><p>Support: print matching values, then count them. Core: count qualifying scores and practise the IDE checklist. Stretch: conditional total, range conditions or repeated input. All routes are open.</p><p>Use meaningful names and explicit updates. Explain selection, iteration, boundaries and test choices. These support OxfordAQA 9210; camelCase is our classroom convention.</p><ExternalLink href="https://www.oxfordaqa.com/wp-content/uploads/2025/02/oxfordaqa-gcse-computer-science-specification.pdf">OxfordAQA 9210 specification</ExternalLink><CompetitionBrief/></>}
        {page==='lesson'&&<><p className="mcc-eyebrow">STAGE {stageIndex+1} OF {stages.length} · {stage.time} MIN · {stage.label}</p>
          {stageId==='donow'&&<><section className="mcc-start-here"><b>Continue from Week 4</b><p>We discussed running totals and conditions. Predict first; today you will use them in your own programs.</p></section><section className="w4-teach-block"><h2>Do Now · which scores print?</h2><CodeText>{donow.predictionCode}</CodeText><label htmlFor="donow-prediction">{donow.predictionQuestion}</label><textarea id="donow-prediction" rows={2} maxLength={3000} value={work.donowPrediction} onChange={event=>setWork(old=>({...old,donowPrediction:event.target.value}))}/><button aria-expanded={work.donowAnswer} onClick={()=>setWork(old=>({...old,donowAnswer:!old.donowAnswer}))}>Check my prediction</button>{work.donowAnswer&&<p className="w5-answers">{donow.predictionAnswer}</p>}</section><p className="mcc-small">If you have time, retrieve the running-total pattern below.</p>{taskPanel}{navButtons}</>}
          {['focus','pitstop1','pitstop2'].includes(stageId)&&<><section className="mcc-start-here"><b>{stageId==='focus'?'Choose the idea you most need to practise':stage.title}</b><p>{stageId==='focus'?'Knowledge: know the syntax and formats. Skills: write code and use an IDE. Understanding: explain decisions and tests.':stageId==='pitstop1'?'Point to one iteration: current value → condition → old count → new count.':'Reopen your saved .py file. Show where input and output go. Explain which file each contest format requires.'}</p></section><FlatReview key={stageId} topics={topics} after={stageId!=='focus'} checkpointLabel={stage.label} work={{learningReview:reviewAt(work,stageId)}} setWork={updater=>setWork(old=>updateReview(old,stageId,updater({learningReview:reviewAt(old,stageId)}).learningReview))} saved={saved} onOpen={openTask} onBack={()=>openStage(stages[stageIndex-1].id)} onContinue={()=>openStage(stages[stageIndex+1].id)}/></>}
          {stageId==='read1'&&<><FactCard id="counter" work={work} setWork={setWork}/><p>Before you continue, say whether your next program will print matching items, count matches or total their values.</p>{navButtons}</>}
          {stageId==='read2'&&<><CompetitionBrief/><FactCard id="formats" work={work} setWork={setWork}/><FactCard id="ide" work={work} setWork={setWork}/>{navButtons}</>}
          {group&&<>{stageId==='main2'&&ideRehearsal}{stageId==='extension'&&<section className="mcc-start-here"><b>Choose your next step</b><p>You can repeat the IDE essentials, prepare your output file or attempt a coding extension. Choose something you can explain.</p><button onClick={()=>openStage('main2')}>Return to IDE practice</button></section>}<section className="mcc-practice-bank"><h2>{stageId==='main2'?'Optional next step · input practice':stage.title}</h2><p>{stageId==='main1'?'Begin with the core counter, or choose more support. Read and trace the example before writing.':stageId==='main2'?'Use this when you can already save and reopen your program. Read the syntax before running.':'Every extension has reading, example code, every-line explanations and the live tutor.'}</p><nav aria-label="Choose a Week 5 task">{group.map((item,i)=><button key={item.id} disabled={busy} aria-current={task.id===item.id?'step':undefined} onClick={()=>openTask(item.id)}><span>{i+1}</span><b>{item.title}<small className="mcc-card-level">{item.level} · {taskStatus(item,work)}</small></b></button>)}</nav></section>{taskPanel}{navButtons}</>}
          {stageId==='plenary'&&<><section className="w4-teach-block"><h2>Plenary · what can you explain independently?</h2><p>A score of 10 qualifies. Explain why the counter changes, and name the test you would try next. Then explain how you know your Python file was saved.</p><label htmlFor="plenary-explanation">My explanation and next step</label><textarea id="plenary-explanation" rows={3} maxLength={3000} value={work.plenaryExplanation} onChange={event=>setWork(old=>({...old,plenaryExplanation:event.target.value}))}/></section><PreferenceForm profile={profile} work={work} setWork={setWork} onNotice={setNotice}/>{navButtons}</>}
        </>}
      </main>
    </div>
    <input hidden ref={backupInput} type="file" accept=".json" onChange={restore}/><input hidden ref={dataInput} type="file" accept=".txt,.in" onChange={event=>importText(event,'input')}/><input hidden ref={codeInput} type="file" accept=".py" onChange={event=>importText(event,'code')}/>
    <footer className="w5-footer"><span>KL Coding Cup · Week 5 practice</span><span>Read · Predict · Run · Explain · Save</span></footer>
  </div>;
}
