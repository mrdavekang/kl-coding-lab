import React, {useEffect, useRef, useState} from 'react';
import {ArrowLeft, ArrowRight, BookOpen, CheckCircle2, CodeXml, Download, Expand, FileCode2, Play, Square, X} from 'lucide-react';
import {Editor} from '../Editor.jsx';
import {PythonRuntime, friendlyError} from '../runtime.js';
import {downloadFile} from '../storage.js';
import {recordAttempt} from '../evidence.js';
import {activities, tasks, taskById, activityFor, checkSpec, problemTitle, sourceUrl, scoringTasks} from './content.js';
import {validatePreparation, progress, activityPassed, taskPassed, planFields, locationFor, preparationUrl, outputFileReady, reportConfig} from './state.js';
import './preparation.css';

const Code = ({children}) => <pre className="prep-code"><code>{children}</code></pre>;
const visualPath = activity => `${import.meta.env.BASE_URL}mcc-building-fences/${activity.image}`;

export function PreparationApp({profile, initialWork, onSave, onLeave}) {
  const [work,setWork] = useState(()=>{
    const clean=validatePreparation(initialWork);
    return {...clean,...locationFor(typeof location==='undefined'?'':location.search,clean)};
  });
  const [status,setStatus]=useState('loading'), [output,setOutput]=useState(''), [error,setError]=useState('');
  const [feedback,setFeedback]=useState(null), [example,setExample]=useState(false), [result,setResult]=useState(null);
  const [saved,setSaved]=useState(true), [notice,setNotice]=useState(''), [zoom,setZoom]=useState(false), [exporting,setExporting]=useState(false);
  const runtime=useRef(), editor=useRef(), active=useRef(), latest=useRef(work), restoreInput=useRef(), importInput=useRef(), dialog=useRef(), path=useRef();
  const item=taskById(work.current)||tasks[0], activity=activityFor(item.id), index=tasks.indexOf(item);
  const activityIndex=activities.indexOf(activity), exerciseIndex=activity.exercises.findIndex(t=>t.id===item.id);
  const draft=work.drafts[item.id]??item.starter, stdin=work.inputs[item.id]??item.sampleInput;
  const busy=['running','checking'].includes(status);
  const code=example?activity.example:draft, input=example?(activity.exampleInput||''):stdin;
  latest.current=work;

  useEffect(()=>{const timer=setTimeout(()=>setSaved(onSave(work)),250);return()=>clearTimeout(timer);},[work]);
  useEffect(()=>{
    const persist=()=>onSave(latest.current);
    window.addEventListener('pagehide',persist);
    return()=>{persist();window.removeEventListener('pagehide',persist);};
  },[]);
  useEffect(()=>{
    runtime.current=new PythonRuntime({
      status:(next,message)=>{setStatus(next);if(message)setError(message);},
      output:text=>{setOutput(old=>old+text);if(active.current)active.current.output+=text;},
      input:()=>setError('Put every input line in Program input before running.'),
      stopping:message=>setNotice(message),
      finish:data=>{
        if(data.type==='checked'&&data.result.passed)data={...data,result:{...data.result,message:'Your code worked on these new inputs. Explain one test.'}};
        const attempt=active.current;
        if(attempt&&!attempt.example) setWork(old=>recordAttempt(old,attempt,data));
        if(data.type==='checked'){
          setFeedback(data.result);
          if(data.result.passed&&attempt&&!attempt.example) setWork(old=>({...old,passed:{...old.passed,[attempt.taskId]:attempt.code}}));
        }
        if(data.type==='done'&&attempt&&!attempt.example) setResult({taskId:attempt.taskId,code:attempt.code,input:attempt.stdin,output:attempt.output});
        if(data.type==='error') setError(data.stopped?'Program stopped. Your code is kept.':data.message);
        active.current=null;
      },
    });
    runtime.current.start();
    return()=>runtime.current.destroy();
  },[]);
  useEffect(()=>{
    const back=()=>{
      if(new URLSearchParams(location.search).get('week')!=='mcc')return;
      if(runtime.current?.active)runtime.current.stop();
      setWork(old=>({...old,...locationFor(location.search,{...old,screen:'overview'})}));
      clear();
    };
    window.addEventListener('popstate',back);return()=>window.removeEventListener('popstate',back);
  },[]);
  useEffect(()=>{if(zoom)dialog.current?.showModal();},[zoom]);
  useEffect(()=>{
    if(work.screen==='problem'&&window.matchMedia('(max-width:650px)').matches)path.current?.querySelector('[aria-current="step"]')?.scrollIntoView({block:'nearest',inline:'center'});
  },[activity.id,work.screen]);

  function clear(){setExample(false);setFeedback(null);setOutput('');setError('');setResult(null);setZoom(false);}
  function guard(){if(runtime.current?.active){setNotice('Stop the program before changing activities.');return false;}return true;}
  function navigate(screen,current=item.id){
    if(!guard())return;
    setWork(old=>({...old,screen,current,visited:{...old.visited,[current]:true}}));
    if(screen!=='files')history.pushState(null,'',preparationUrl(location.href,screen,current));
    clear();setNotice('');window.scrollTo({top:0});
  }
  function update(field,value){setWork(old=>({...old,[field]:{...old[field],[item.id]:value}}));}
  function changeCode(value){if(busy||example)return;update('drafts',value);setFeedback(null);setResult(null);}
  function changePlan(field,value){setWork(old=>({...old,plans:{...old.plans,[item.id]:{...old.plans[item.id],[field]:value}}}));}
  function run(kind='run'){
    if(!runtime.current?.ready||runtime.current.active||example&&kind==='check')return;
    setOutput('');setError('');setFeedback(null);setResult(null);
    active.current={taskId:item.id,code,stdin:input,inputs:input?[input]:[],output:'',kind,example,startedAt:new Date().toISOString()};
    if(!example)setWork(old=>({...old,attempted:{...old.attempted,[item.id]:true}}));
    runtime.current.execute(code,kind==='check'?item.check:null,{stdin:input,spec:checkSpec(item)});
  }
  function showExample(){if(!guard())return;clear();setExample(true);requestAnimationFrame(()=>document.getElementById('prep-python')?.scrollIntoView({behavior:'smooth',block:'start'}));}
  function backup(){downloadFile('MCC-Building-Fences-backup.json',JSON.stringify({format:'kl-coding-lab-backup',version:1,lesson:'mcc-building-fences',student:{name:profile.name,className:profile.className},work:latest.current},null,2),'application/json');}
  async function restore(event){
    const file=event.target.files?.[0];if(!file)return;
    try{
      if(!guard())return;
      if(file.size>5000000)throw Error('Choose a preparation backup smaller than 5 MB.');
      const payload=JSON.parse(await file.text());
      if(payload.format!=='kl-coding-lab-backup'||payload.lesson!=='mcc-building-fences')throw Error('Choose an MCC Building Fences backup. Other lessons keep their own work.');
      const clean=validatePreparation(payload.work);
      backup();setWork(clean);clear();history.replaceState(null,'',preparationUrl(location.href,clean.screen,clean.current));
      setNotice('Preparation restored. Your previous preparation work was downloaded first.');
    }catch(err){setNotice(err.message);}finally{event.target.value='';}
  }
  async function importCode(event){
    const file=event.target.files?.[0];if(!file)return;
    try{
      if(!guard())return;
      if(!file.name.toLowerCase().endsWith('.py')||file.size>100000)throw Error('Choose a Python .py file smaller than 100 KB.');
      const text=await file.text();
      downloadFile(`${item.id}-before-import.py`,draft);clear();update('drafts',text);
      setNotice('Python file opened. Your previous draft was downloaded first.');
    }catch(err){setNotice(err.message);}finally{event.target.value='';}
  }
  async function report(){
    setExporting(true);
    try{const {createReport}=await import('../report.js');const doc=createReport(profile,work,{lessonConfig:reportConfig});downloadFile('MCC-Building-Fences-learning-report.pdf',doc.output('arraybuffer'),'application/pdf');setNotice('Learning report downloaded.');}
    catch(err){setNotice(err.message||'The report could not be made. Download a backup to keep your work.');}
    finally{setExporting(false);}
  }
  const canExport=outputFileReady(result,item,draft,stdin);
  const next=tasks[index+1], nextActivity=next&&next.activityId!==item.activityId;

  return <div className="prep-app">
    <a className="prep-skip" href="#prep-main">Skip to activity</a>
    <header className="prep-topbar"><button className="prep-brand" disabled={busy} onClick={()=>navigate('overview')}><CodeXml size={25}/><span>KL <b>Coding Lab</b></span></button><nav aria-label="Preparation navigation"><button disabled={busy} onClick={()=>navigate('overview')}>MCC Preparation</button><button disabled={busy} onClick={()=>navigate('files')}>My files & report</button><button disabled={busy} onClick={()=>{if(onSave(latest.current))onLeave();else setNotice('Download a backup before switching: saving is unavailable.');}}>Change week / student</button></nav></header>
    <div className="prep-student"><span><b>{profile.name}</b> · {profile.className}</span><span role="status">{saved?'Saved in this browser':'Saving unavailable — download a backup'}</span></div>
    {notice&&<div className="prep-notice" role="status">{notice}<button onClick={()=>setNotice('')} aria-label="Dismiss notice"><X size={18}/></button></div>}
    <main id="prep-main" className="prep-main" tabIndex={-1}>
      {work.screen==='overview'&&<>
        <div className="prep-hero"><div><p className="prep-eyebrow">AFTER WEEK 5 · MCC PREPARATION</p><h1>Small steps.<br/><span>A problem you can solve.</span></h1><p>Understand the input. Break down the processing. Decide the output. Find the Python you need, then predict and test.</p><div className="prep-badges"><span>5 activities</span><span>{tasks.length} short exercises</span><span>Work at your pace</span></div></div><div className="prep-method"><BookOpen size={24}/><h2>Your problem-solving routine</h2><ol><li>Understand</li><li>Break down</li><li>Find out</li><li>Try</li><li>Check</li></ol><p>Prepare over several sessions. Repeat a small exercise whenever you need more practice.</p></div></div>
        <section className="prep-problem-card"><div><p className="prep-eyebrow">PAST QUESTION · PYTHON</p><h2>{problemTitle}</h2><p>A field contains grass and existing fences. Build the skills to find the cheapest vertical wall.</p><p className="prep-muted">{progress(work)} of {tasks.length} practice checks passed. Your drafts and plans stay with each exercise.</p><button className="prep-primary" onClick={()=>navigate('problem',work.current)}>{progress(work)||Object.keys(work.drafts).length?'Continue my preparation':'Start Activity 1'}<ArrowRight size={18}/></button></div><ol className="prep-overview-path">{activities.map((entry,i)=><li key={entry.id}><span className={activityPassed(work,entry)?'is-passed':''}>{activityPassed(work,entry)?<CheckCircle2 size={19}/>:i+1}</span><div><b>{entry.title}</b><p>{entry.summary}</p></div></li>)}</ol></section>
        <section className="prep-teacher-note"><h2>How to use this path</h2><p>Activities 1–4 build skills through short explanations, examples, diagrams and practice. Activity 5 asks you to combine them independently. Move forward one exercise at a time, and revisit any earlier step.</p><p>The checks are classroom feedback. They do not award official MCC points or submit competition work.</p><a href="https://programming-26.mooc.fi/" target="_blank" rel="noreferrer">Explore the Helsinki Python course ↗</a></section>
      </>}

      {work.screen==='problem'&&<>
        <nav className="prep-breadcrumb" aria-label="Breadcrumb"><button disabled={busy} onClick={()=>navigate('overview')}>MCC Preparation</button><span>/</span><span>{problemTitle}</span></nav>
        <nav ref={path} className="prep-path" aria-label="Five preparation activities">{activities.map((entry,i)=><button key={entry.id} disabled={busy} aria-current={entry.id===activity.id?'step':undefined} onClick={()=>navigate('problem',entry.exercises[0].id)}><span>{activityPassed(work,entry)?<CheckCircle2 size={19}/>:i+1}</span><b>{entry.title}</b></button>)}</nav>
        <div className="prep-activity-heading"><div><p className="prep-eyebrow">ACTIVITY {activityIndex+1} OF 5 · EXERCISE {exerciseIndex+1} OF {activity.exercises.length}</p><h1>{activity.title}</h1><p>{activity.summary}</p></div><span className="prep-progress">{progress(work)} / {tasks.length} checks passed</span></div>
        <figure className="prep-visual"><button className="prep-image-button" onClick={()=>setZoom(true)} aria-label={`Enlarge visual: ${activity.title}`}><img src={visualPath(activity)} alt={activity.imageAlt} width="1536" height="1024"/></button><figcaption><span>Follow the picture. Explain what each piece of Python does.</span><button onClick={()=>setZoom(true)}><Expand size={17}/> Enlarge visual</button></figcaption></figure>
        {activity.id==='challenge'&&<section className="prep-statement"><p className="prep-eyebrow">ORIGINAL PAST QUESTION</p><h2>{problemTitle}</h2><p>A grassy field is represented by N rows and M columns. Each cell is grass (.) or an existing fence (#). You can turn any number of grass cells into fences. Find the minimum number of new fences needed to make one complete vertical column of fences.</p><h3>Input and output</h3><p>The first line contains N and M. Each of the next N lines contains M dots or hashes. Output one integer: the minimum number of new fences needed.</p><p><b>Constraints:</b> 1 ≤ N, M ≤ 800. The grid contains only . and #.</p><div className="prep-table-wrap"><table><caption>Official scoring groups · 10 points each</caption><thead><tr><th>Task</th><th>Maximum N and M</th></tr></thead><tbody>{scoringTasks.map(([number,size])=><tr key={number}><td>{number}</td><td>{size}</td></tr>)}</tbody></table></div><p>These are scoring groups for the same problem. Your method should handle fields of different sizes. The classroom checks below are separate from the official judge.</p><a href={sourceUrl} target="_blank" rel="noreferrer">Read the official MCC 2025 question ↗</a></section>}
        <div className="prep-workspace"><div className="prep-learning">
          <section className="prep-section"><p className="prep-eyebrow">1 · READ A LITTLE</p><h2>Ideas and syntax</h2>{activity.reading.map(text=><p key={text}>{text}</p>)}{activity.syntax.length>0&&<dl className="prep-syntax">{activity.syntax.map(([word,meaning])=><div key={word}><dt><code>{word}</code></dt><dd>{meaning}</dd></div>)}</dl>}<a href="https://docs.python.org/3/tutorial/" target="_blank" rel="noreferrer">Python reference ↗</a></section>
          {activity.example&&<section className="prep-section"><p className="prep-eyebrow">2 · STUDY AN EXAMPLE</p><h2>Predict before running</h2><Code>{activity.example}</Code>{activity.exampleNotes.map(text=><p key={text}>{text}</p>)}<p><b>Expected example output</b></p><Code>{activity.exampleOutput}</Code><button className="prep-outline" disabled={busy} onClick={showExample}>Explore example in editor <ArrowRight size={17}/></button></section>}
          <section className="prep-section prep-your-task"><p className="prep-eyebrow">{activity.example?'3':'2'} · YOUR TASK</p><h2>{item.title}</h2><p>{item.goal}</p><p>{item.inputHelp}</p><div className="prep-samples"><div><h3>Sample input</h3><Code>{item.sampleInput.trimEnd()}</Code></div><div><h3>Expected output</h3><Code>{item.sampleOutput||'(nothing printed)'}</Code></div></div></section>
          <section className="prep-section"><p className="prep-eyebrow">THINK BEFORE CODING</p><h2>My input → process → output plan</h2>{planFields.map(([field,label,prompt])=><label className="prep-field" key={field} htmlFor={`prep-plan-${field}`}><b>{label}</b><span>{prompt}</span><textarea id={`prep-plan-${field}`} rows={2} maxLength={3000} value={work.plans[item.id]?.[field]||''} onChange={event=>changePlan(field,event.target.value)}/></label>)}</section>
          <section className="prep-section"><h2>Small clues</h2><button className="prep-outline" disabled={work.hints[item.id]>=item.hints.length} onClick={()=>update('hints',(work.hints[item.id]||0)+1)}>Show {work.hints[item.id]?'another':'a'} clue</button>{item.hints.slice(0,work.hints[item.id]||0).map(text=><p key={text}>{text}</p>)}<h3>Explain your thinking</h3><ul>{activity.questions.map(text=><li key={text}>{text}</li>)}</ul></section>
        </div><div className="prep-coding">
          <section id="prep-python" className="prep-python" aria-label="Python workspace">
            {example&&<div className="prep-example-banner"><b>You are exploring the example.</b><p>Your own draft is kept separately.</p><button disabled={busy} onClick={clear}>Return to my own code</button></div>}
            <div className="prep-editor-heading"><b>{example?'example.py':`${item.id}.py`}</b><span role="status">{({loading:'Loading Python…',ready:'Python ready',running:'Running…',checking:'Checking new inputs…',unavailable:'Python needs attention'})[status]}</span></div>
            <Editor key={item.id+(example?'-example':'')} ref={editor} value={code} onChange={changeCode} onRun={()=>run()} readOnly={busy||example} fontSize={17}/>
            <div className="prep-editor-tools"><button disabled={busy||example} onClick={()=>editor.current?.indent()}>Indent</button><button disabled={busy||example} onClick={()=>editor.current?.outdent()}>Outdent</button><button disabled={busy||example} onClick={()=>editor.current?.undo()}>Undo</button><span>4 spaces per block</span></div>
            <label className="prep-field prep-input" htmlFor="prep-input"><b>Program input</b><span>Put every input line here. Each input() call reads the next line.</span><textarea id="prep-input" rows={6} spellCheck={false} maxLength={700000} disabled={busy||example} value={input} onChange={event=>{update('inputs',event.target.value);setResult(null);}}/></label>
            <div className="prep-runbar"><button className="prep-primary" disabled={status!=='ready'} onClick={()=>run()}><Play size={16}/>Run {example?'example':'my code'}</button>{!example&&<button className="prep-outline" disabled={status!=='ready'} onClick={()=>run('check')}><CheckCircle2 size={17}/>Check my code</button>}<button className="prep-outline" disabled={!busy} onClick={()=>runtime.current.stop()}><Square size={14}/>Stop</button></div>
            <div className="prep-output"><b>Program output</b><pre aria-label="Program output">{output||'Your output will appear here.'}</pre></div>
            {error&&<section className="prep-feedback prep-retry" role="alert"><b>{friendlyError(error).tip}</b><Code>{error}</Code></section>}
            {status==='unavailable'&&<button className="prep-outline" onClick={()=>globalThis.crossOriginIsolated?runtime.current.start():location.reload()}>Try loading Python again</button>}
            {!example&&feedback&&<section className={`prep-feedback ${feedback.passed?'prep-success':'prep-retry'}`} aria-live="polite"><h3>{feedback.passed?'Your current code passed these checks':'Check one small thing'}</h3><p>{feedback.message}</p>{feedback.error&&<Code>{feedback.error}</Code>}<div className="prep-test-list">{feedback.cases?.map((test,i)=><div key={i}><b>Test {i+1} · {test.passed?'Passed':'Try again'}</b><div className="prep-samples"><div><span>Input</span><Code>{test.input||'(none)'}</Code></div><div><span>Expected</span><Code>{test.expected||'(nothing printed)'}</Code></div><div><span>Your output</span><Code>{test.actual||'(nothing printed)'}</Code></div></div>{test.error&&<Code>{test.error}</Code>}</div>)}</div></section>}
            {!example&&<p className="prep-check-state">{taskPassed(work,item)?'✓ Current code passed the practice checks. Explain one test.':'Predict, run, compare and improve. Checks use different inputs from the sample.'}</p>}
            <div className="prep-file-tools"><button disabled={busy} onClick={()=>downloadFile(`${item.id}${example?'-example':''}.py`,code)}><Download size={16}/>Download code</button>{!example&&<><button disabled={busy} onClick={()=>importInput.current.click()}>Open Python file</button><button disabled={!canExport} onClick={()=>downloadFile(`${item.id}.out`,result.output)}>Download output</button></>}</div>
            {!example&&<p className="prep-muted">Output download becomes available after a successful run of your current code and input.</p>}
          </section>
          <section className="prep-section"><h2>Explain and check</h2><label className="prep-field" htmlFor="prep-explanation"><span>One thing I looked up, one test I tried, and what I learned.</span><textarea id="prep-explanation" rows={4} maxLength={3000} value={work.explanations[item.id]||''} onChange={event=>update('explanations',event.target.value)}/></label><label className="prep-readiness"><input type="checkbox" checked={work.readiness[activity.id]||false} onChange={event=>setWork(old=>({...old,readiness:{...old.readiness,[activity.id]:event.target.checked}}))}/><span>{activity.ready}<small>My own readiness reflection; separate from code checks.</small></span></label></section>
        </div></div>
        <div className="prep-bottom"><button className="prep-outline" disabled={busy} onClick={()=>index?navigate('problem',tasks[index-1].id):navigate('overview')}><ArrowLeft size={17}/>{index?'Previous exercise':'Preparation overview'}</button><span>Exercise {index+1} of {tasks.length}</span><button className="prep-primary" disabled={busy} onClick={()=>next?navigate('problem',next.id):navigate('files')}>{next?`${nextActivity?'Next activity':'Next exercise'}: ${nextActivity?activityFor(next.id).title:next.title}`:'Finish & keep my work'}<ArrowRight size={17}/></button></div>
      </>}

      {work.screen==='files'&&<section className="prep-files"><p className="prep-eyebrow">MCC PREPARATION · YOUR LEARNING</p><h1>Keep your Building Fences work</h1><p>{progress(work)} of {tasks.length} practice checks passed. Your backup keeps drafts, input, plans, explanations, readiness reflections and recent run/check evidence.</p><p>Progress saves in this browser under your profile. Download a backup before moving devices.</p><div className="prep-file-buttons"><button className="prep-primary" onClick={backup}><Download size={18}/>Download preparation backup</button><button className="prep-outline" disabled={busy} onClick={()=>restoreInput.current.click()}>Restore preparation backup</button><button className="prep-outline" disabled={busy||exporting} onClick={report}><FileCode2 size={18}/>{exporting?'Creating PDF…':'Download learning report (PDF)'}</button></div><label className="prep-field" htmlFor="prep-reflection"><b>My next step</b><textarea id="prep-reflection" rows={4} maxLength={6000} value={work.reflection} onChange={event=>setWork(old=>({...old,reflection:event.target.value}))}/></label>{activities.map((entry,i)=><div className="prep-file-row" key={entry.id}><span><b>{i+1}. {entry.title}</b><small>{entry.exercises.filter(t=>taskPassed(work,t)).length} / {entry.exercises.length} checks passed</small></span><button onClick={()=>navigate('problem',entry.exercises[0].id)}>Revisit activity <ArrowRight size={16}/></button></div>)}<button className="prep-outline" onClick={()=>navigate('problem',work.current)}>Return to my exercise</button></section>}
    </main>
    <footer className="prep-footer"><span>KL Coding Lab · MCC Preparation</span><span>Understand → Break down → Find out → Try → Check</span></footer>
    <input ref={restoreInput} hidden type="file" accept=".json" onChange={restore}/><input ref={importInput} hidden type="file" accept=".py" onChange={importCode}/>
    {zoom&&<dialog ref={dialog} className="prep-dialog" aria-label={`${activity.title} visual`} onCancel={()=>setZoom(false)} onClick={event=>{if(event.target===event.currentTarget)setZoom(false);}}><div><h2>{activity.title}</h2><button onClick={()=>setZoom(false)} aria-label="Close enlarged visual"><X size={22}/></button></div><img src={visualPath(activity)} alt={activity.imageAlt}/><div><a href={visualPath(activity)} target="_blank" rel="noreferrer">Open full-size image ↗</a><a href={visualPath(activity)} download={activity.image}>Download this visual</a></div></dialog>}
  </div>;
}
