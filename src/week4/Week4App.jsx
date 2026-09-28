import React,{useEffect,useRef,useState} from 'react';
import {Editor} from '../Editor.jsx';
import {PythonRuntime,friendlyError} from '../runtime.js';
import {downloadFile} from '../storage.js';
import {recordAttempt,taskStatus} from '../evidence.js';
import {FlatReview} from '../week3/FlatReview.jsx';
import {ReportPanel} from '../ReportPanel.jsx';
import {Walkthrough,stepDescription} from '../week2/Walkthrough.jsx';
import {stages,main1,main2,challenges,levels,tasks,taskById,plenary,warmups,checkSpec} from './content.js';
import {topics,reviewAt,updateReview,reportConfig,validateWeek4,progress} from './state.js';
import '../week3/week3.css';
import './week4.css';

function CodeText({children}){return <pre className="mcc-code-text"><code>{children}</code></pre>;}

export function Week4App({profile,initialWork,onSave,onLeave}){
  const [work,setWork]=useState(()=>validateWeek4(initialWork));
  const [page,setPage]=useState('lesson');
  const [stageId,setStageId]=useState(work.stage||'ready');
  const [taskId,setTaskId]=useState(taskById(work.task)?work.task:main1[0].id);
  const [example,setExample]=useState(false),[status,setStatus]=useState('loading'),[output,setOutput]=useState(''),[feedback,setFeedback]=useState(null),[error,setError]=useState('');
  const [saved,setSaved]=useState(true),[notice,setNotice]=useState(''),[fontSize,setFontSize]=useState(18),[textSize,setTextSize]=useState(19);
  const [trace,setTrace]=useState(null),[position,setPosition]=useState(0),[paused,setPaused]=useState(false);
  const runtime=useRef(),editor=useRef(),active=useRef(),latest=useRef(),importRef=useRef(),inputRef=useRef();
  const busy=['running','checking','tracing'].includes(status);
  const stageIndex=stages.findIndex(stage=>stage.id===stageId),stage=stages[stageIndex];
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
      status:(next,message)=>{setStatus(next);if(message)setError(message);},
      output:text=>{setOutput(old=>old+text);if(active.current)active.current.output+=text;},
      input:()=>setError('This lesson uses the Program input box. Stop, add every input line, then run again.'),
      stopping:message=>setNotice(message),
      trace:(step,isPaused)=>{setTrace(old=>{const next={...old,steps:[...(old?.steps||[]),step]};setPosition(next.steps.length-1);return next;});setPaused(isPaused);},
      finish:result=>{
        const attempt=active.current;
        if(attempt&&!attempt.example&&attempt.kind!=='trace')setWork(old=>recordAttempt(old,attempt,result));
        if(result.type==='checked'){
          setFeedback(result.result);
          if(result.result.passed&&attempt)setWork(old=>({...old,passed:{...old.passed,[attempt.taskId]:attempt.code}}));
        }
        if(result.type==='error'){
          setError(result.stopped?'Program stopped. Your work is kept.':result.message);
          if(attempt?.kind==='trace')setTrace(old=>({...old,error:result.message}));
        }
        setPaused(false);active.current=null;
      }
    });
    runtime.current.start();
    return()=>runtime.current.destroy();
  },[]);

  function clear(){setExample(false);setOutput('');setFeedback(null);setError('');setTrace(null);}
  function guard(){if(runtime.current?.active){setNotice('Stop the program before changing pages.');return false;}return true;}
  function openStage(id){if(!guard())return;setStageId(id);if(id==='main1')setTaskId(main1[0].id);if(id==='main2')setTaskId(main2[0].id);setPage('lesson');clear();setNotice('');window.scrollTo({top:0});}
  function openTask(id){const selected=taskById(id);if(!selected){if(stages.some(item=>item.id===id))openStage(id);return;}if(!guard())return;setTaskId(id);setStageId(selected.group);setPage('lesson');clear();setWork(old=>({...old,visited:{...old.visited,[id]:true}}));window.scrollTo({top:0});}
  function openPage(value){if(!guard())return;setPage(value);setNotice('');window.scrollTo({top:0});}
  function updateField(field,value){setWork(old=>({...old,[field]:{...old[field],[task.id]:value}}));}
  function changeCode(value){if(busy||example)return;updateField('drafts',value);setFeedback(null);setTrace(null);}
  function begin(code,input,kind,isExample){
    if(runtime.current?.active||!runtime.current?.ready)return false;
    setOutput('');setFeedback(null);setError('');setTrace(null);setPosition(0);
    active.current={taskId:task.id,code,inputs:input?[input]:[],output:'',kind,example:isExample,startedAt:new Date().toISOString()};
    if(!isExample)setWork(old=>({...old,attempted:{...old.attempted,[task.id]:true}}));
    if(kind==='trace'){
      setTrace({code,example:isExample,steps:[]});
      runtime.current.walk(code,{stdin:input});
    }else runtime.current.execute(code,kind==='check'?task.check:undefined,{stdin:input,spec:checkSpec(task)});
    return true;
  }
  function run(kind='run'){const live=current.current;begin(live.draft,live.stdin,kind,live.example);}
  function exploreExample(kind='trace'){
    if(!guard())return;
    if(!runtime.current?.ready){setNotice('Python is still loading. Read the written tutor steps, then try again.');return;}
    const code=work.exampleDrafts?.[task.id]??task.example;
    const input=work.exampleInputs?.[task.id]??task.exampleInput??'';
    setExample(true);
    begin(code,input,kind,true);
  }
  function next(){const group=stageId==='main1'?main1:stageId==='main2'?main2:null;const index=group?.findIndex(item=>item.id===task.id);if(group&&index>=0&&index<group.length-1)openTask(group[index+1].id);else if(stageIndex<stages.length-1)openStage(stages[stageIndex+1].id);else openPage('report');}
  function back(){const group=stageId==='main1'?main1:stageId==='main2'?main2:null;const index=group?.findIndex(item=>item.id===task.id);if(group&&index>0)openTask(group[index-1].id);else if(stageIndex>0)openStage(stages[stageIndex-1].id);}
  function backup(){downloadFile('kl-coding-week-4-backup.json',JSON.stringify({format:'kl-coding-lab-backup',version:4,lesson:4,student:{name:profile.name,className:profile.className},work:latest.current},null,2),'application/json');}
  async function restore(event){const file=event.target.files?.[0];if(!file)return;try{if(file.size>5000000)throw Error('Choose a backup smaller than 5 MB.');const data=JSON.parse(await file.text());if(data.format!=='kl-coding-lab-backup'||data.lesson!==4)throw Error('Choose a Week 4 backup. Other weeks have their own backups.');const cleaned=validateWeek4(data.work);backup();setWork(cleaned);setStageId(cleaned.stage);setTaskId(cleaned.task);clear();setNotice('Backup restored. Your previous Week 4 work was downloaded first.');}catch(err){setNotice(err.message);}event.target.value='';}
  async function loadInput(event){const file=event.target.files?.[0];if(!file)return;try{if(file.size>100000)throw Error('Choose an input file smaller than 100 KB.');updateField(example?'exampleInputs':'inputs',await file.text());}catch(err){setNotice(err.message);}event.target.value='';}
  function nextTrace(iteration){if(position<trace.steps.length-1){const nextIndex=iteration?trace.steps.findIndex((step,index)=>index>position&&(step.iterationChanged||step.loopFinished||step.event==='end')):position+1;setPosition(nextIndex<0?trace.steps.length-1:nextIndex);}else if(runtime.current.nextTrace(iteration))setPaused(false);}

  const group=stageId==='main1'?main1:stageId==='main2'?main2:null;
  const nextTask=group?.[group.findIndex(item=>item.id===task.id)+1];
  const nextLabel=nextTask?'Next: '+nextTask.title:stageIndex===stages.length-1?'Save my learning report':'Next: '+stages[stageIndex+1].label;
  const navButtons=<div className="mcc-bottom"><button disabled={busy||stageIndex===0} onClick={back}>← Back</button><button className="mcc-primary" disabled={busy} onClick={next}>{nextLabel}</button></div>;
  const feedbackPanel=feedback&&<section className="mcc-feedback" aria-live="polite"><h3>{feedback.passed?'✓ This check passed':'Let’s fix one thing'}</h3><p>{feedback.message}</p>{feedback.error&&<CodeText>{feedback.error}</CodeText>}{feedback.cases?.length>0&&<div className="mcc-table-scroll"><table><caption>Fresh practice cases</caption><thead><tr><th>Test data</th><th>Expected</th><th>Your output</th><th>Result</th></tr></thead><tbody>{feedback.cases.map((item,index)=><tr key={index}><th scope="row">{index+1}<pre className="mcc-check-input">{item.input||'(no typed input)'}</pre></th><td>{item.expected}</td><td>{item.actual||'(nothing printed)'}</td><td>{item.passed?'Passed':'Try again'}{item.error&&<CodeText>{item.error}</CodeText>}</td></tr>)}</tbody></table></div>}</section>;

  const pythonWorkspace=<section className="mcc-python" aria-label="Built-in Python workspace">
    {example&&<div className="mcc-example-banner"><b>Example tutor space</b><p>This is the worked example, not your answer. Your own program is safe.</p><button disabled={busy} onClick={()=>{setExample(false);setTrace(null);setOutput('');setError('');}}>Return to my task</button></div>}
    <div className="mcc-editor-label"><b>{example?'Worked example.py':'Your answer.py'}</b><span role="status">{({loading:'Loading Python…',ready:'Python ready',running:'Running…',checking:'Checking fresh data…',tracing:'Line-by-line tutor',unavailable:'Python needs attention'})[status]}</span></div>
    <div className="mcc-editor"><Editor ref={editor} key={task.id+(example?'-example':'')} value={draft||''} onChange={changeCode} onRun={()=>run()} fontSize={fontSize} readOnly={busy||example} executedLine={trace?.steps[position]?.executedLine} nextLine={trace?.steps[position]?.nextLine}/></div>
    <div className="mcc-runbar"><button className="mcc-primary" disabled={status!=='ready'} onClick={()=>run()}>Run {example?'example':'my code'}</button>{!example&&<button disabled={status!=='ready'} onClick={()=>run('check')}>Check my code</button>}{busy&&<button className="mcc-stop" onClick={()=>runtime.current.stop()}>Stop</button>}<span className="mcc-small">Ctrl / ⌘ + Enter to run</span></div>
    {(task.needsInput||example&&task.exampleInput)&&<><label className="mcc-input-label" htmlFor="mcc-input">Program input <span>One line per input() call</span></label><textarea id="mcc-input" rows={5} value={stdin} maxLength={100000} disabled={busy||example} onChange={event=>updateField(example?'exampleInputs':'inputs',event.target.value)} spellCheck={false}/><div className="mcc-input-actions">{!example&&<button disabled={busy} onClick={()=>inputRef.current.click()}>Load input file</button>}<button disabled={busy||example} onClick={()=>updateField('inputs',task.sampleInput||'')}>Restore sample input</button></div></>}
    <div className="mcc-output"><b>Program output</b><pre aria-label="Program output">{output||'Your output will appear here.'}</pre></div>
    {error&&<div className="mcc-feedback" role="alert"><b>{friendlyError(error).tip}</b><section><h3>Python message</h3><CodeText>{error}</CodeText></section></div>}
    {status==='unavailable'&&<button onClick={()=>globalThis.crossOriginIsolated?runtime.current.start():location.reload()}>Reload Python</button>}
    {trace&&<Walkthrough flat trace={trace} position={position} paused={paused} busy={status==='tracing'} waiting={false} onPosition={setPosition} onNext={nextTrace} onRestart={()=>run('trace')} onStop={()=>runtime.current.stop()} onClose={()=>setTrace(null)} onSave={step=>{updateField('traceEvidence',{code:trace.code,description:stepDescription(step,trace.example)});setNotice('Tutor step saved in your learning report.');}}/>}
    {!example&&feedbackPanel}
    <div className="mcc-tool-buttons" aria-label="Code tools">{!example&&<button disabled={busy} onClick={()=>editor.current?.undo()}>Undo</button>}<button onClick={()=>downloadFile(`week4-${task.id}${example?'-example':''}.py`,draft||'')}>Download code</button>{!example&&<button disabled={busy} onClick={()=>{updateField('recoverable',draft||'');changeCode(task.starter);setNotice('Starter restored. Your previous draft can be recovered.');}}>Reset code</button>}{!example&&work.recoverable?.[task.id]!==undefined&&<button disabled={busy} onClick={()=>changeCode(work.recoverable[task.id])}>Recover previous code</button>}{!example&&<><button disabled={busy} onClick={()=>editor.current?.indent()}>Indent</button><button disabled={busy} onClick={()=>editor.current?.outdent()}>Outdent</button></>}<button disabled={status!=='ready'} onClick={()=>run('trace')}>Walk through line by line</button></div>
    <p className="mcc-small">Next line shows every executed line. Next iteration skips to the next loop visit or loop end.</p>
  </section>;

  return <div className="mcc-app w4-app" style={{'--mcc-reading-size':textSize+'px'}}>
    <header className="mcc-header"><button className="mcc-brand" disabled={busy} onClick={()=>openStage('ready')}>KL <b>Coding Lab</b><small>Year 11 format</small></button><nav aria-label="Week 4 navigation"><button disabled={busy} onClick={()=>openStage('ready')}>Start here</button><button disabled={busy} onClick={()=>openPage('challenges')}>All 8 tasks</button><button disabled={busy} onClick={()=>openPage('teacher')}>Teaching notes</button></nav><button onClick={()=>{setTextSize(value=>value===21?18:value+1);setFontSize(value=>value===22?16:value+2);}} aria-label="Change reading text size">Aa</button></header>
    <div className="mcc-student"><span><b>{profile.name}</b> · {profile.className} · Week 4</span><div><button disabled={busy} onClick={()=>openPage('files')}>My files</button><button disabled={busy} onClick={()=>openPage('report')}>My learning report</button><button disabled={busy} onClick={()=>{if(onSave(latest.current))onLeave();else setNotice('Download a backup before switching: saving is unavailable.');}}>Change week / student</button></div></div>
    {notice&&<div className="mcc-notice" role="status">{notice}<button onClick={()=>setNotice('')}>Dismiss</button></div>}
    <div className="mcc-title"><p className="mcc-eyebrow">WEEK 04 · AQA-STYLE PYTHON · MCC PREPARATION · 60 MINUTES</p><h1>Decide, count and compare</h1><p>Read it. Study it. Trace every line. Then write your own.</p></div>
    <div className="mcc-shell"><aside className="mcc-sidebar"><section className="w4-wagba"><p className="mcc-eyebrow">WAGBA</p><h3>What are we going to be able to do?</h3><ul><li>Use <code>if</code> to select.</li><li>Count matching values.</li><li>Trace every loop iteration.</li><li>Find the best grid column.</li></ul></section><section><h3>Lesson map · {progress(work)}/8 tasks checked</h3><nav aria-label="Ten lesson stages">{stages.map((item,index)=><button key={item.id} disabled={busy} aria-current={page==='lesson'&&stageId===item.id?'step':undefined} onClick={()=>openStage(item.id)}><span>{index+1}</span><div><b>{item.label}</b><small>{item.time} min</small></div></button>)}</nav></section><p className="mcc-small">{saved?'Saved in this browser':'Saving unavailable — download a backup'}. Keep a backup before changing devices.</p></aside>
    <main className="mcc-main">
      {page==='challenges'&&<><h2>Choose a Week 4 task</h2><p>Every level is open. Build confidence in conditions first, then move into the fence progression. Classroom levels are not official MCC award levels.</p>{levels.map(level=><section className="mcc-extension-group" key={level}><h3>{level} · {challenges.filter(item=>item.level===level).length} tasks</h3><div className="mcc-extension-list">{challenges.filter(item=>item.level===level).map(item=><button key={item.id} onClick={()=>openTask(item.id)}><span><b>{item.title}</b><small>{item.skills}</small></span><span>{taskStatus(item,work)} →</span></button>)}</div></section>)}</>}
      {page==='files'&&<><h2>Keep your Week 4 work</h2><p>Download your programs, learning report and backup before changing devices.</p><div className="mcc-file-actions"><button className="mcc-primary" onClick={backup}>Download Week 4 backup</button><button onClick={()=>importRef.current.click()}>Restore Week 4 backup</button><button onClick={()=>openPage('report')}>Download learning report (PDF)</button></div>{tasks.filter(item=>work.drafts?.[item.id]!==undefined).map(item=><div className="mcc-file-row" key={item.id}><span>{item.title}</span><button onClick={()=>downloadFile(`week4-${item.id}.py`,work.drafts[item.id])}>Download Python</button></div>)}</>}
      {page==='report'&&<ReportPanel flat profile={profile} work={work} setWork={setWork} busy={busy} onBackup={backup} lessonConfig={reportConfig}/>} 
      {page==='teacher'&&<><h2>Week 4 teacher guide</h2><section className="mcc-learning-goal"><h3>Learning intention</h3><p>Use selection inside iteration, then apply counting and minimum tracking to an MCC-style grid.</p></section><p>This lesson follows the Year 11 visual rhythm: WAGBA, timed stages, compact green teaching cards, clear model/practise separation and two learning pit stops. Use AQA-style readable camelCase variable names, explicit input-conversion steps and exact output.</p><h3>Suggested route by readiness</h3><div className="w4-route-cards"><section><b>More support</b><p>Do the Do Now, first two conditions tasks and One fence column. Trace examples before coding.</p></section><section><b>Core route</b><p>Complete the first three tasks in each bank. Explain one True and one False condition.</p></section><section><b>Stretch</b><p>Add the range task and full past-question adaptation. Test a complete wall that needs zero fences.</p></section></div><h3>60-minute plan</h3><div className="mcc-table-scroll"><table><thead><tr><th>Minutes</th><th>Stage</th><th>Teacher move</th></tr></thead><tbody>{stages.map(item=><tr key={item.id}><td>{item.time}</td><td>{item.title}</td><td>{item.id==='main1'||item.id==='main2'?'Coach with the example tutor; ask pupils to predict before clicking Next line.':item.id.startsWith('pitstop')?'Stop everyone, even with unfinished code, and collect one explanation.':'Model vocabulary and one concrete trace.'}</td></tr>)}</tbody></table></div><h3>Past-question basis</h3><p>The Gold task is adapted from <a href="https://ioimalaysia.org/competition/mcc/2025/archive/p1/" target="_blank" rel="noreferrer">MCC 2025 Problem 1: Building Fences</a>. The official method is to count grass cells in each column and output the minimum. The staged tasks teach each component before the full input format.</p><h3>What to listen for</h3><ul className="mcc-route"><li>“The counter starts before the loop.”</li><li>“This condition was False, so the indented update did not run.”</li><li>“The outer loop chooses a column; the inner loop moves down its cells.”</li><li>“I compare only after counting the complete column.”</li></ul></>}
      {page==='lesson'&&<><p className="mcc-eyebrow">STAGE {stageIndex+1} OF 10 · {stage.time} MIN · {stage.label}</p>
        {['focus','pitstop1','pitstop2'].includes(stageId)?<><div className="mcc-start-here"><b>{stageId==='focus'?'Choose the idea you most need to practise':'Pause the code and explain your thinking'}</b><p>{stageId==='focus'?'Needing help is a useful starting point. Pick one statement and one next action.':'Use a condition, counter, iteration or test from your own work as evidence.'}</p></div><FlatReview key={stageId} topics={topics} after={stageId!=='focus'} checkpointLabel={stageId==='pitstop1'?'Learning Pit Stop 1':'Learning Pit Stop 2'} work={{learningReview:reviewAt(work,stageId)}} setWork={updater=>setWork(old=>updateReview(old,stageId,updater({learningReview:reviewAt(old,stageId)}).learningReview))} saved={saved} onOpen={openTask} onBack={back} onContinue={next}/></>:stageId==='ready'?<><h2>Today’s route</h2><p>You will add one new idea—selection—to the loops you already know. Then you will combine both ideas in a real MCC-style grid problem.</p><section className="mcc-learning-goal"><h3>By the end, you can</h3><ol className="mcc-route"><li>read a condition as a True-or-False question;</li><li>count only the values that match;</li><li>trace each iteration using current variable values;</li><li>explain how two loops inspect a grid.</li></ol></section><p>Every task teaches first. Read the explanation, study the complete example and use its line-by-line tutor before writing your own program.</p>{navButtons}</>:stageId==='condition'?<><h2>Teacher model · how <code>if</code> works</h2><p>A loop answers “which item now?” A condition answers “should this indented code run for that item?”</p><section className="mcc-worked"><h3>Model</h3><CodeText>{"numbers = [3, -1, 5]\n\nfor number in numbers:\n    if number > 0:\n        print(number)"}</CodeText><div className="mcc-table-scroll"><table><thead><tr><th>Iteration</th><th>number</th><th>number &gt; 0</th><th>Action</th></tr></thead><tbody><tr><td>1</td><td>3</td><td>True</td><td>Print 3</td></tr><tr><td>2</td><td>-1</td><td>False</td><td>Skip print</td></tr><tr><td>3</td><td>5</td><td>True</td><td>Print 5</td></tr></tbody></table></div></section><p><b>AQA-style habit:</b> use meaningful names, align indentation, trace boundary values and print exactly what the task requests.</p>{navButtons}</>:stageId==='grid'?<><h2>MCC model · turn a picture into data</h2><p>A grid is stored as rows, but a vertical wall is a column. Label both directions before coding.</p><section className="w4-grid-model" aria-label="Fence grid example"><div><span>.</span><span>#</span><span>.</span></div><div><span>#</span><span>#</span><span>.</span></div><div><span>.</span><span>#</span><span>.</span></div></section><table><thead><tr><th>Column</th><th>Cells from top to bottom</th><th>Missing fences</th></tr></thead><tbody><tr><td>0</td><td><code>. # .</code></td><td>2</td></tr><tr><td>1</td><td><code># # #</code></td><td>0</td></tr><tr><td>2</td><td><code>. . .</code></td><td>3</td></tr></tbody></table><p>The answer is 0 because column 1 is already complete. That zero case is an important competition test.</p>{navButtons}</>:isPractice&&<>
          {group&&<section className="mcc-practice-bank" aria-label={`${stage.label} programming tasks`}><h2>{stage.title}</h2><p>Follow Read → Example → Tutor → Your task. Move level when you can explain the current values.</p><nav aria-label="Choose a task">{group.map((item,index)=><button key={item.id} disabled={busy} aria-current={item.id===task.id?'step':undefined} onClick={()=>openTask(item.id)}><span>{index+1}</span><b>{item.title}<small className="mcc-card-level">{item.level}</small></b></button>)}</nav><button className="mcc-link-button" disabled={busy} onClick={()=>openStage(stageId==='main1'?'pitstop1':'pitstop2')}>Go to learning pit stop →</button></section>}
          <article className="mcc-reading w4-task" key={task.id}><p className="mcc-eyebrow">{task.level?task.level+' · ':''}{task.skills}</p><h2>{task.title}</h2><p className="mcc-lead">{task.scenario}</p>
            <section className="w4-teach-block"><span className="w4-step-label">1 · READ FIRST</span><h3>Understand the pattern</h3>{task.reading.map((paragraph,index)=><p key={index}>{paragraph}</p>)}<div className="w4-vocab">{task.vocabulary.map(([term,meaning])=><div key={term}><b>{term}</b><span>{meaning}</span></div>)}</div></section>
            <section className="mcc-worked w4-example"><span className="w4-step-label">2 · STUDY AN EXAMPLE</span><h3>{task.exampleTitle}</h3><p>{task.exampleScenario}</p><CodeText>{task.example}</CodeText>{task.exampleInput&&<div className="mcc-samples"><div><b>Example input</b><CodeText>{task.exampleInput}</CodeText></div><div><b>Example output</b><CodeText>{task.exampleOutput}</CodeText></div></div>}{!task.exampleInput&&<><b>Example output</b><CodeText>{task.exampleOutput}</CodeText></>}<h4>Written tutor · every iteration</h4><ol>{task.exampleSteps.map((step,index)=><li key={index}>{step}</li>)}</ol><div className="w4-example-actions"><button className="mcc-primary" disabled={status!=='ready'} onClick={()=>exploreExample('trace')}>Open line-by-line tutor</button><button disabled={status!=='ready'} onClick={()=>exploreExample('run')}>Run this example</button></div><p className="mcc-small">The tutor uses the real program. Choose Next line for every statement or Next iteration to move between loop visits.</p></section>
            {!example&&<><section className="w4-teach-block w4-your-task"><span className="w4-step-label">3 · YOUR TASK</span><h3>Your job</h3><p>{task.goal}</p><h4>Your data</h4><p>{task.inputHelp}</p><div className="mcc-samples">{task.dataDisplay&&<div><b>Data already in your code</b><CodeText>{task.dataDisplay}</CodeText></div>}{task.needsInput&&<div><b>Sample input</b><CodeText>{task.sampleInput}</CodeText></div>}<div><b>Expected output</b><CodeText>{task.sampleOutput}</CodeText></div></div><p>{task.sampleExplanation}</p>{task.source&&<p className="mcc-source">{task.source}</p>}</section><section className="mcc-hints"><h3>Small clues</h3>{task.hints.map((hint,index)=><p key={index}>{hint}</p>)}</section></>}
            <section className="mcc-your-turn"><span className="w4-step-label">4 · CODE AND CHECK</span><h3>{example?'Explore the example':'Write your program'}</h3><p>{example?'Use the tutor controls below. Return to your task when you can explain the changing values.':'Run with the sample, walk through your code, then use Check my code for fresh data.'}</p>{pythonWorkspace}</section>
            {!example&&<section className="mcc-explanation"><h3>Explain one test</h3><label htmlFor="mcc-explanation">Which value or cell did you test? What happened in that iteration, and why?</label><textarea id="mcc-explanation" rows={3} maxLength={3000} value={work.explanations?.[task.id]||''} onChange={event=>updateField('explanations',event.target.value)} placeholder="On iteration… the current value was… The condition was True/False, so…"/></section>}{navButtons}
          </article>
        </>}
      </>}
    </main></div><input hidden ref={importRef} type="file" accept=".json" onChange={restore}/><input hidden ref={inputRef} type="file" accept=".txt,.in" onChange={loadInput}/>
  </div>;
}
