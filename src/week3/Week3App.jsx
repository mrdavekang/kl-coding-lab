import React,{useEffect,useRef,useState} from 'react';
import {Editor} from '../Editor.jsx';
import {PythonRuntime,friendlyError} from '../runtime.js';
import {downloadFile} from '../storage.js';
import {recordAttempt,taskStatus} from '../evidence.js';
import {FlatReview} from './FlatReview.jsx';
import {ReportPanel} from '../ReportPanel.jsx';
import {Walkthrough,stepDescription} from '../week2/Walkthrough.jsx';
import {stages,main1,main2,challenges,levels,tasks,taskById,plenary,warmups,checkSpec} from './content.js';
import {topics,reviewAt,updateReview,reportConfig,validateWeek3,progress} from './state.js';
import './week3.css';

function CodeText({children}){return <pre className="mcc-code-text"><code>{children}</code></pre>;}
export function Week3App({profile,initialWork,onSave,onLeave}){
 const [work,setWork]=useState(()=>validateWeek3(initialWork));
 const [page,setPage]=useState('lesson');
 const [stageId,setStageId]=useState(work.stage||'ready');
 const [taskId,setTaskId]=useState(taskById(work.task)?work.task:main1[0].id);
 const [example,setExample]=useState(false),[status,setStatus]=useState('loading'),[output,setOutput]=useState(''),[feedback,setFeedback]=useState(null),[error,setError]=useState('');
 const [saved,setSaved]=useState(true),[notice,setNotice]=useState(''),[fontSize,setFontSize]=useState(18),[textSize,setTextSize]=useState(19);
 const [trace,setTrace]=useState(null),[position,setPosition]=useState(0),[paused,setPaused]=useState(false);
 const runtime=useRef(),editor=useRef(),active=useRef(),latest=useRef(),importRef=useRef(),inputRef=useRef();
 const busy=['running','checking','tracing'].includes(status);
 const stageIndex=stages.findIndex(s=>s.id===stageId),stage=stages[stageIndex];
 const task=stageId==='donow'?warmups[0]:stageId==='plenary'?plenary:taskById(taskId)||main1[0];
 const isPractice=['main1','main2','donow','plenary'].includes(stageId);
 const draft=example?(work.exampleDrafts?.[task.id]??task.example):(work.drafts?.[task.id]??task.starter);
 const stdin=example?(work.exampleInputs?.[task.id]??task.exampleInput??''):(work.inputs?.[task.id]??task.sampleInput??'');
 const current=useRef();current.current={task,draft,stdin,example};
 latest.current={...work,stage:stageId,task:taskId};
 useEffect(()=>{const timer=setTimeout(()=>setSaved(onSave(latest.current)),250);return()=>clearTimeout(timer);},[work,stageId,taskId]);
 useEffect(()=>{const save=()=>onSave(latest.current);window.addEventListener('pagehide',save);return()=>{save();window.removeEventListener('pagehide',save);};},[]);
 useEffect(()=>{
  runtime.current=new PythonRuntime({
   status:(s,message)=>{setStatus(s);if(message)setError(message);},
   output:text=>{setOutput(old=>old+text);if(active.current)active.current.output+=text;},
   input:()=>setError('This exercise uses the input box above. Stop, add all input lines and run again.'),
   stopping:message=>setNotice(message),
   trace:(step,isPaused)=>{setTrace(old=>{const next={...old,steps:[...(old?.steps||[]),step]};setPosition(next.steps.length-1);return next;});setPaused(isPaused);},
   finish:result=>{
    const attempt=active.current;
    if(attempt&&!attempt.example&&attempt.kind!=='trace')setWork(old=>recordAttempt(old,attempt,result));
    if(result.type==='checked'){
     setFeedback(result.result);
     if(result.result.passed&&attempt)setWork(old=>({...old,passed:{...old.passed,[attempt.taskId]:attempt.code}}));
    }
    if(result.type==='error'){setError(result.stopped?'Program stopped. Your work is kept.':result.message);if(attempt?.kind==='trace')setTrace(old=>({...old,error:result.message}));}
    setPaused(false);active.current=null;
   },
  });runtime.current.start();return()=>runtime.current.destroy();
 },[]);
 function clear(){setExample(false);setOutput('');setFeedback(null);setError('');setTrace(null);}
 function guard(){if(runtime.current?.active){setNotice('Stop the program before changing pages.');return false;}return true;}
 function openStage(id){if(!guard())return;setStageId(id);if(id==='main1')setTaskId(main1[0].id);if(id==='main2')setTaskId(main2[0].id);setPage('lesson');clear();setNotice('');window.scrollTo({top:0});}
 function openTask(id){const t=taskById(id);if(!t){if(stages.some(s=>s.id===id))openStage(id);return;}if(!guard())return;setTaskId(id);setStageId(t.group);setPage('lesson');clear();setWork(old=>({...old,visited:{...old.visited,[id]:true}}));window.scrollTo({top:0});}
 function openPage(value){if(!guard())return;setPage(value);setNotice('');}
 function updateField(field,value){setWork(old=>({...old,[field]:{...old[field],[task.id]:value}}));}
 function changeCode(value){if(busy)return;updateField(example?'exampleDrafts':'drafts',value);setFeedback(null);setTrace(null);}
 function run(kind='run'){
  if(runtime.current?.active||!runtime.current?.ready)return;
  const c=current.current;
  setOutput('');setFeedback(null);setError('');setTrace(null);setPosition(0);
  active.current={taskId:c.task.id,code:c.draft,inputs:c.stdin?[c.stdin]:[],output:'',kind,example:c.example,startedAt:new Date().toISOString()};
  if(!c.example)setWork(old=>({...old,attempted:{...old.attempted,[c.task.id]:true}}));
  if(kind==='trace'){setTrace({code:c.draft,example:c.example,steps:[]});runtime.current.walk(c.draft,{stdin:c.stdin});}
  else runtime.current.execute(c.draft,kind==='check'?c.task.check:undefined,{stdin:c.stdin,spec:checkSpec(c.task)});
 }
 function next(){const group=stageId==='main1'?main1:stageId==='main2'?main2:null;const index=group?.findIndex(t=>t.id===task.id);if(group&&index>=0&&index<group.length-1)openTask(group[index+1].id);else if(stageIndex<9)openStage(stages[stageIndex+1].id);else openPage('report');}
 function back(){const group=stageId==='main1'?main1:stageId==='main2'?main2:null;const index=group?.findIndex(t=>t.id===task.id);if(group&&index>0)openTask(group[index-1].id);else if(stageIndex>0)openStage(stages[stageIndex-1].id);}
 function backup(){downloadFile('kl-coding-week-3-backup.json',JSON.stringify({format:'kl-coding-lab-backup',version:3,lesson:3,student:{name:profile.name,className:profile.className},work:latest.current},null,2),'application/json');}
 async function restore(e){const file=e.target.files?.[0];if(!file)return;try{if(file.size>5000000)throw Error('Choose a backup smaller than 5 MB.');const data=JSON.parse(await file.text());if(data.format!=='kl-coding-lab-backup'||data.lesson!==3)throw Error('Choose a Week 3 backup. Other weeks have their own backups.');const cleaned=validateWeek3(data.work);backup();setWork(cleaned);setStageId(cleaned.stage);setTaskId(cleaned.task);clear();setNotice(cleaned.previousLesson?'Backup restored. Earlier Week 3 work is kept under My files.':'Backup restored. Your previous work was downloaded first.');}catch(err){setNotice(err.message);}e.target.value='';}
 async function loadInput(e){const file=e.target.files?.[0];if(!file)return;try{if(file.size>100000)throw Error('Choose an input file smaller than 100 KB for this lesson.');updateField(example?'exampleInputs':'inputs',await file.text());}catch(err){setNotice(err.message);}e.target.value='';}
 function nextTrace(iteration){if(position<trace.steps.length-1){const nextIndex=iteration?trace.steps.findIndex((s,i)=>i>position&&(s.iterationChanged||s.loopFinished||s.event==='end')):position+1;setPosition(nextIndex<0?trace.steps.length-1:nextIndex);}else if(runtime.current.nextTrace(iteration))setPaused(false);}
 const group=stageId==='main1'?main1:stageId==='main2'?main2:null;
 const nextTask=group?.[group.findIndex(t=>t.id===task.id)+1];
 const nextLabel=nextTask?'Next: '+nextTask.title:stageIndex===9?'Save my learning report':'Next: '+stages[stageIndex+1].label;
 const navButtons=<div className="mcc-bottom"><button disabled={busy||stageIndex===0} onClick={back}>← Back</button><button className="mcc-primary" disabled={busy} onClick={next}>{nextLabel}</button></div>;
 function feedbackPanel(){return feedback&&<section className="mcc-feedback" aria-live="polite"><h3>{feedback.passed?'✓ This check passed':'Let’s fix one thing'}</h3><p>{feedback.message}</p>{feedback.error&&<CodeText>{feedback.error}</CodeText>}{feedback.cases?.length>0&&<div className="mcc-table-scroll"><table><caption>Check results</caption><thead><tr><th>Test input</th><th>Expected</th><th>Your output</th><th>Result</th></tr></thead><tbody>{feedback.cases.map((c,i)=><tr key={i}><th scope="row">{i+1}<pre className="mcc-check-input">{c.input||'Data from the starter'}</pre></th><td>{c.expected}</td><td>{c.actual||'(nothing printed)'}</td><td>{c.passed?'Passed':'Try again'}{c.error&&<CodeText>{c.error}</CodeText>}</td></tr>)}</tbody></table></div>}</section>;}
 const pythonWorkspace=<section className="mcc-python" aria-label="Built-in Python workspace">
  {example&&<div className="mcc-example-banner"><b>Exploring the example</b><p>Your own program stays separate.</p><button disabled={busy} onClick={()=>{setExample(false);setTrace(null);setOutput('');setError('');}}>Back to my code</button></div>}
  <div className="mcc-editor-label"><b>{example?'Example sandbox':'Your Python code'}</b><span role="status">{({loading:'Loading Python…',ready:'Python ready',running:'Running…',checking:'Checking fresh inputs…',tracing:'Walking through',unavailable:'Python needs attention'})[status]}</span></div>
  <div className="mcc-editor"><Editor ref={editor} key={task.id+(example?'-example':'')} value={draft||''} onChange={changeCode} onRun={()=>run()} fontSize={fontSize} readOnly={busy} executedLine={trace?.steps[position]?.executedLine} nextLine={trace?.steps[position]?.nextLine}/></div>
  <div className="mcc-runbar"><button className="mcc-primary" disabled={status!=='ready'} onClick={()=>run()}>Run</button>{!example&&task.kind!=='output'&&task.tests?.length>0&&<button disabled={status!=='ready'} onClick={()=>run('check')}>Check my code</button>}{busy&&<button className="mcc-stop" onClick={()=>runtime.current.stop()}>Stop</button>}<span className="mcc-small">Ctrl / ⌘ + Enter to run</span></div>
  {task.needsInput&&<><label className="mcc-input-label" htmlFor="mcc-input">Program input <span>One line per input() call</span></label><textarea id="mcc-input" rows={3} value={stdin} maxLength={100000} disabled={busy} onChange={e=>updateField(example?'exampleInputs':'inputs',e.target.value)} spellCheck={false} placeholder="No input needed when the data is already in your code."/>
  <div className="mcc-input-actions"><button disabled={busy} onClick={()=>inputRef.current.click()}>Load input file</button><button disabled={busy} onClick={()=>updateField(example?'exampleInputs':'inputs',example?task.exampleInput||'':task.sampleInput||'')}>Restore sample input</button></div></>}
  <div className="mcc-output"><b>Program output</b><pre aria-label="Program output">{output||'Your output will appear here.'}</pre></div>
  {error&&<div className="mcc-feedback" role="alert"><b>{friendlyError(error).tip}</b><section><h3>Python message</h3><CodeText>{error}</CodeText></section></div>}
  {status==='unavailable'&&<button onClick={()=>globalThis.crossOriginIsolated?runtime.current.start():location.reload()}>Reload Python</button>}
  {trace&&<Walkthrough flat trace={trace} position={position} paused={paused} busy={status==='tracing'} waiting={false} onPosition={setPosition} onNext={nextTrace} onRestart={()=>run('trace')} onStop={()=>runtime.current.stop()} onClose={()=>setTrace(null)} onSave={step=>{updateField('traceEvidence',{code:trace.code,description:stepDescription(step,trace.example)});setNotice('Step saved. Add your own explanation below.');}}/>}
  {task.kind!=='output'&&feedbackPanel()}
  <div className="mcc-tool-buttons" aria-label="Code tools"><button disabled={busy} onClick={()=>editor.current?.undo()}>Undo</button><button onClick={()=>downloadFile(`week3-${task.id}${example?'-example':''}.py`,draft||'')}>Download code</button><button disabled={busy} onClick={()=>{if(!example)updateField('recoverable',draft||'');changeCode(example?task.example:task.starter);setNotice('Starter restored. Your previous draft can be recovered.');}}>Reset code</button>{!example&&work.recoverable?.[task.id]!==undefined&&<button disabled={busy} onClick={()=>changeCode(work.recoverable[task.id])}>Recover previous code</button>}{<><button disabled={busy} onClick={()=>editor.current?.indent()}>Indent</button><button disabled={busy} onClick={()=>editor.current?.outdent()}>Outdent</button><button disabled={status!=='ready'} onClick={()=>run('trace')}>Walk through code</button></>}</div>
  <p className="mcc-small">Run tries your code once. Check my code tries other data too. Your work saves automatically.</p>
 </section>;
 return <div className="mcc-app" style={{'--mcc-reading-size':textSize+'px'}}>
  <header className="mcc-header"><button className="mcc-brand" disabled={busy} onClick={()=>openStage('ready')}>KL <b>Coding Lab</b></button><nav aria-label="Week 3 navigation"><button disabled={busy} onClick={()=>openStage('ready')}>Start here</button><button disabled={busy} onClick={()=>openPage('challenges')}>All 10 challenges</button><button disabled={busy} onClick={()=>openPage('teacher')}>Teaching notes</button></nav><button onClick={()=>{setTextSize(v=>v===21?18:v+1);setFontSize(v=>v===22?16:v+2);}} aria-label="Change reading text size">Aa</button></header>
  <div className="mcc-student"><span><b>{profile.name}</b> · {profile.className} · Week 3</span><div><button disabled={busy} onClick={()=>openPage('files')}>My files</button><button disabled={busy} onClick={()=>openPage('report')}>My learning report</button><button disabled={busy} onClick={()=>{if(onSave(latest.current))onLeave();else setNotice('Download a backup before switching: saving is unavailable.');}}>Change week / student</button></div></div>
  {notice&&<div className="mcc-notice" role="status">{notice}<button onClick={()=>setNotice('')}>Dismiss</button></div>}
  <div className="mcc-title"><p className="mcc-eyebrow">WEEK 03 · PRACTISE WEEKS 1 + 2 · 60 MINUTES</p><h1>Familiar skills, new challenges</h1><p>Read the scenario. Study the sample. Write your own Python.</p></div>
  <div className="mcc-shell"><aside className="mcc-sidebar"><section><h3>Lesson map · {progress(work)}/10 challenges checked</h3><nav aria-label="Ten lesson stages">{stages.map((s,i)=><button key={s.id} disabled={busy} aria-current={page==='lesson'&&stageId===s.id?'step':undefined} onClick={()=>openStage(s.id)}><span>{i+1}</span><div><b>{s.label}</b><small>{s.time} min</small></div></button>)}</nav></section><p className="mcc-small">{saved?'Saved in this browser':'Saving unavailable — download a backup'}. Keep a backup before changing devices.</p></aside>
  <main className="mcc-main">
  {page==='challenges'&&<><h2>Choose a programming challenge</h2><p>Start with a familiar skill and move up when ready. The first three questions in each main task are the starting route. Silver and Gold add more steps using the same skills. You do not need to finish all ten today.</p><p className="mcc-small">These levels describe our classroom practice. They are not official MCC medal standards.</p>{levels.map(level=><section className="mcc-extension-group" key={level}><h3>{level} · {challenges.filter(t=>t.level===level).length} questions</h3><div className="mcc-extension-list">{challenges.filter(t=>t.level===level).map(t=><button key={t.id} onClick={()=>openTask(t.id)}><span><b>{t.title}</b><small>{t.skills}</small></span><span>{taskStatus(t,work)} →</span></button>)}</div></section>)}</>}
  {page==='files'&&<><h2>Keep your Week 3 work</h2><p>Download your programs, report and backup before changing devices.</p><div className="mcc-file-actions"><button className="mcc-primary" onClick={backup}>Download Week 3 backup</button><button onClick={()=>importRef.current.click()}>Restore Week 3 backup</button><button onClick={()=>openPage('report')}>Download learning report (PDF)</button></div><p>Restoring a backup downloads your current work first, then replaces this Week 3 record. Weeks 1 and 2 stay separate.</p>{work.previousLesson&&<section><h3>Your earlier Week 3 work</h3><p>Your saved fence-lesson work is kept here.</p><button onClick={()=>downloadFile('week3-earlier-lesson-backup.json',JSON.stringify({format:'kl-coding-lab-backup',version:3,lesson:3,student:{name:profile.name,className:profile.className},work:work.previousLesson},null,2),'application/json')}>Download earlier Week 3 work</button></section>}{tasks.filter(t=>work.drafts?.[t.id]!==undefined).map(t=><div className="mcc-file-row" key={t.id}><span>{t.title}</span><button onClick={()=>downloadFile(`week3-${t.id}.py`,work.drafts[t.id])}>Download Python</button></div>)}</>}
  {page==='report'&&<ReportPanel flat profile={profile} work={work} setWork={setWork} busy={busy} onBackup={backup} lessonConfig={reportConfig}/>}
  {page==='teacher'&&<><h2>A practice lesson you can lead</h2><p><b>Goal:</b> Reuse input, variables and arithmetic from Week 1, then lists, loops and totals from Week 2. No new syntax is required.</p><p>In each main task, start with the first three scenarios. Offer the last two as stretch. Keep the pit stops at 27 and 50 minutes, even if programs are unfinished. The levels are classroom labels.</p><h3>A simple coaching routine</h3><ol className="mcc-route"><li>Ask: “What information do you have, and what should the program print?”</li><li>Ask the pupil to explain the sample using words or a calculation.</li><li>Let them write and run their program. If stuck, point to one input or one loop instruction.</li><li>Try different data together and ask what changed.</li></ol><p>Sample results and short clues are visible beside each challenge. Complete programs are not shown. You can support pupils by checking their reasoning rather than typing a solution for them.</p><div className="mcc-table-scroll"><table><thead><tr><th>Minutes</th><th>Stage</th></tr></thead><tbody>{stages.map(s=><tr key={s.id}><td>{s.time}</td><td>{s.title}</td></tr>)}</tbody></table></div>{challenges.map(t=><section className="mcc-teacher-answer" key={t.id}><h3>{t.level} · {t.title}</h3><p>{t.sampleExplanation}</p><p>{t.teacher}</p><p>Prompt: {t.hints.at(-1)}</p></section>)}</>}
  {page==='lesson'&&<><p className="mcc-eyebrow">STAGE {stageIndex+1} OF 10 · {stage.time} MIN · {stage.label}</p>
   {['focus','pitstop1','pitstop2'].includes(stageId)?<><div className="mcc-start-here"><b>{stageId==='focus'?'Choose a familiar skill to practise':'Pause and explain one piece of work'}</b><p>{stageId==='focus'?'Choose what you want to get better at. It is fine to need a reminder.':'Use one input, calculation or loop from your own program. Explain a test and choose your next step.'}</p></div><FlatReview key={stageId} topics={topics} after={stageId!=='focus'} checkpointLabel={stageId==='pitstop1'?'Learning Pit Stop 1':'Learning Pit Stop 2'} work={{learningReview:reviewAt(work,stageId)}} setWork={updater=>setWork(old=>updateReview(old,stageId,updater({learningReview:reviewAt(old,stageId)}).learningReview))} saved={saved} onOpen={openTask} onBack={back} onContinue={next}/></>:stageId==='ready'?<>
    <h2>Today is a practice lesson</h2><p>You already met these ideas in Weeks 1 and 2. Today you will use them to help a festival stall, a library and other people with small jobs.</p><section className="mcc-learning-goal"><b>Your route</b><ol className="mcc-route"><li>Main Task 1: input, variables and calculations.</li><li>Main Task 2: lists, loops and totals.</li><li>Try a harder level when you can explain your program.</li></ol></section><p>Each task shows the data and an example result. Your job is to write the program. Start with the first three questions in each main task. You can ask for help and return to unfinished work.</p>{navButtons}
   </>:stageId==='formats'?<>
    <h2>Week 1 reminder: input, calculate, output</h2><p><b>Input</b> is the information your program reads. A <b>variable</b> keeps a value. A calculation uses those values. <b>Output</b> is what your program prints.</p><h3>Useful building blocks</h3><table><thead><tr><th>Job</th><th>Python reminder</th></tr></thead><tbody><tr><td>Read text</td><td><code>name = input()</code></td></tr><tr><td>Read a whole number</td><td><code>amount = int(input())</code></td></tr><tr><td>Calculate</td><td><code>+</code> add, <code>-</code> subtract, <code>*</code> multiply</td></tr><tr><td>Display a value</td><td><code>print(amount)</code></td></tr></tbody></table><section className="mcc-worked"><h3>A sample tells you what should happen</h3><p>Two notebooks cost RM5 each. The total cost is RM10.</p><p>If the required output is one number, print <code>10</code>. Leave out extra words and input prompts. In the app, place each input on its own line in Program input.</p></section><p>These are separate reminders. Choose the parts your challenge needs and write your own program.</p>{navButtons}
   </>:stageId==='condition'?<>
    <h2>Week 2 reminder: one item at a time</h2><p>A list stores several values in order. A <code>for</code> loop visits every item. Indent the instructions that should repeat by four spaces.</p><section className="mcc-worked"><h3>Three boxes: [2, 0, 5]</h3><table><thead><tr><th>What are you finding?</th><th>What happens?</th><th>Result</th></tr></thead><tbody><tr><td>Items one at a time</td><td>Use each value, in order.</td><td>2, then 0, then 5</td></tr><tr><td>Number of boxes</td><td>Add 1 for every box, including the empty box.</td><td>3 boxes</td></tr><tr><td>Items inside all boxes</td><td>Add the values: 2 + 0 + 5.</td><td>7 items</td></tr></tbody></table></section><p>For a total, start at zero before the loop, add each item inside the loop and print the final result after the loop.</p><p>Keep the supplied list name. Check my code uses other lists to see whether your program works beyond the sample.</p>{navButtons}
   </>:isPractice&&<>
    {group&&<section className="mcc-practice-bank" aria-label={`${stage.label} programming challenges`}><h2>{stage.title}</h2><p>Start with questions 1–3. Questions 4–5 are stretch when you are ready. Pause for the pit stop when your teacher asks.</p><nav aria-label="Choose a challenge">{group.map((t,i)=><button key={t.id} disabled={busy} aria-current={t.id===task.id?'step':undefined} onClick={()=>openTask(t.id)}><span>{i+1}</span><b>{t.title}<small className="mcc-card-level">{t.level}</small></b></button>)}</nav><button className="mcc-link-button" disabled={busy} onClick={()=>openStage(stageId==='main1'?'pitstop1':'pitstop2')}>Go to learning pit stop →</button></section>}
    <article className="mcc-reading" key={task.id}><p className="mcc-eyebrow">{task.level?task.level+' · ':''}{task.skills}</p><h2>{task.title}</h2><p className="mcc-lead">{task.scenario}</p><section className="mcc-learning-goal"><h3>Your job</h3><p>{task.goal}</p></section><h3>Your data</h3><p>{task.inputHelp}</p>
    <section className="mcc-worked"><h3>Sample · what should happen</h3>{task.dataDisplay&&<><b>Data already in your code</b><CodeText>{task.dataDisplay}</CodeText></>}<div className="mcc-samples">{task.needsInput&&<div><b>Sample input</b><CodeText>{task.sampleInput}</CodeText></div>}<div><b>Expected output</b><CodeText>{task.sampleOutput}</CodeText></div></div><p>{task.sampleExplanation}</p></section>
    <section className="mcc-hints"><h3>Small clues</h3>{task.hints.map((hint,i)=><p key={i}>{hint}</p>)}</section>
    <section className="mcc-your-turn"><h3>Write your program</h3><p>Use the starter space below. Run with the sample, compare the output, then choose Check my code for different data.</p>{!task.needsInput&&<p className="mcc-small">This challenge uses the data in your code. You do not need input().</p>}{pythonWorkspace}</section>
    <section className="mcc-explanation"><h3>Explain one test</h3><label htmlFor="mcc-explanation">What did you try, and why did the result make sense? Say if you used help.</label><textarea id="mcc-explanation" rows={3} maxLength={3000} value={work.explanations?.[task.id]||''} onChange={e=>updateField('explanations',e.target.value)} placeholder="I tried… The result was… because…"/></section>{stageId==='plenary'&&<p>Save your reflection, then download your learning report and backup.</p>}{navButtons}</article>
   </>}
  </>}
  </main></div><input hidden ref={importRef} type="file" accept=".json" onChange={restore}/><input hidden ref={inputRef} type="file" accept=".txt,.in" onChange={loadInput}/>
 </div>;
}
