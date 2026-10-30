import React, {useEffect, useRef, useState} from 'react';
import {ArrowLeft, ArrowRight, BookOpen, CheckCircle2, CodeXml, Download, Expand, FileCode2, Play, Square, X} from 'lucide-react';
import {Editor} from '../Editor.jsx';
import {PythonShell} from './PythonShell.jsx';
import {PracticeCard} from '../practise/PracticeCard.jsx';
import {PracticeLearning} from '../practise/PracticeLearning.jsx';
import {ReferenceLink} from '../reference/ReferenceLink.jsx';
import {PlaygroundLink} from '../playground/PlaygroundLink.jsx';
import {AnswerFilePractice} from '../practise/AnswerFilePractice.jsx';
import {checkAnswerFile,parseAnswerInput} from '../practise/answerCheck.js';
import {PythonRuntime, friendlyError} from '../runtime.js';
import {downloadFile} from '../storage.js';
import {recordAttempt} from '../evidence.js';
import {buildingFences, checkSpec} from './content.js';
import {createPreparationState, activityPassed, taskPassed, planFields, outputFileReady} from './state.js';
import {ReasoningPractice} from '../mco/ReasoningPractice.jsx';
import {checkReasoning} from '../mco/reasoning.js';
import './preparation.css';
import './idle.css';
import './fences.css';

const reasoningPrompts={input:'What information is given? What do its numbers mean?',process:'What smaller jobs does my plan need?',output:'What answer must I find?',lookup:'What do I need to find out or ask about?',prediction:'What result do I predict? How can I check it?'};
const Code = ({children}) => <pre className="prep-code"><code>{children}</code></pre>;

export function PreparationApp({profile, initialWork, onSave, onLeave, problem=buildingFences, onOverview, Explorer}) {
  const {activities,tasks,taskById,activityFor,problemTitle,shortTitle,filePrefix,problemId,statement}=problem;
  const {validatePreparation,progress,locationFor,preparationUrl,reportConfig}=createPreparationState(problem);
  const sectionTitle=problem.sectionTitle || 'MCC Preparation', sectionId=problem.sectionId || 'mcc';
  const practice=!!problem.practiceOnly;
  const backupLesson=`${sectionId}-${problemId}`;
  const visualPath = activity => `${import.meta.env.BASE_URL}${problem.imageDirectory}/${activity.image}`;
  const [work,setWork] = useState(()=>{
    const clean=validatePreparation(initialWork);
    return {...clean,...locationFor(typeof location==='undefined'?'':location.search,clean)};
  });
  const [status,setStatus]=useState('loading'), [error,setError]=useState('');
  const [feedback,setFeedback]=useState(null), [example,setExample]=useState(false), [result,setResult]=useState(null);
  const [saved,setSaved]=useState(true), [notice,setNotice]=useState(''), [zoom,setZoom]=useState(false), [exporting,setExporting]=useState(false);
  const [fileInput,setFileInput]=useState({id:'',data:'',status:'loading'});
  const [answerFeedback,setAnswerFeedback]=useState(null);
  const [exampleRun,setExampleRun]=useState(null);
  const [inputMode,setInputMode]=useState('shell'), [waiting,setWaiting]=useState(false), [shell,setShell]=useState([]), [more,setMore]=useState(false), [cursor,setCursor]=useState({line:1,column:0});
  const freshShell=useRef(true),focusShell=useRef(true);
  const lastSearch=useRef(typeof location==='undefined'?'':location.search);
  const runtime=useRef(), editor=useRef(), active=useRef(), latest=useRef(work), restoreInput=useRef(), importInput=useRef(), dialog=useRef(), path=useRef();
  const item=taskById(work.current)||tasks[0], activity=activityFor(item.id), index=tasks.indexOf(item);
  const isReasoning=!!item.reasoning, visual=item.visual || activity;
  const reading=item.reading || activity.reading, syntax=item.syntax || activity.syntax, questions=item.questions || activity.questions;
  const activityIndex=activities.indexOf(activity), exerciseIndex=activity.exercises.findIndex(t=>t.id===item.id);
  const isAnswerFile=!!item.answerFile;
  const fileReady=!item.answerFile?.inputUrl||(fileInput.id===item.id&&fileInput.status==='ready');
  const draft=work.drafts[item.id]??item.starter, stdin=isAnswerFile?(item.answerFile.inputUrl?(fileInput.id===item.id?fileInput.data:''):item.sampleInput):work.inputs[item.id]??item.sampleInput;
  const busy=['running','checking'].includes(status);
  const code=example?activity.example:draft, input=example?(activity.exampleInput||''):stdin;
  latest.current=work;

  useEffect(()=>{
    setAnswerFeedback(null);
    if(!item.answerFile?.inputUrl)return;
    let cancelled=false;
    setFileInput({id:item.id,data:'',status:'loading'});
    fetch(import.meta.env.BASE_URL+item.answerFile.inputUrl).then(response=>{if(!response.ok)throw Error('Input unavailable');return response.text();}).then(data=>{
      parseAnswerInput(item.answerFile.type,data);
      if(!cancelled)setFileInput({id:item.id,data,status:'ready'});
    }).catch(()=>{if(!cancelled)setFileInput({id:item.id,data:'',status:'error'});});
    return()=>{cancelled=true;};
  },[item.id]);

  useEffect(()=>{const timer=setTimeout(()=>setSaved(onSave(work)),250);return()=>clearTimeout(timer);},[work]);
  useEffect(()=>{
    const persist=()=>onSave(latest.current);
    window.addEventListener('pagehide',persist);
    return()=>{persist();window.removeEventListener('pagehide',persist);};
  },[]);
  useEffect(()=>{
    if(isReasoning)return;
    setStatus('loading');
    runtime.current=new PythonRuntime({
      status:(next,message)=>{setStatus(next);if(next==='loading'){freshShell.current=true;setWaiting(false);setMore(false);}if(message)setError(message);},
      output:(text,stream)=>{
        if(active.current?.warmup){
          active.current.output+=text;
          const output=active.current.output;
          setExampleRun(old=>old?{...old,output}:old);
          return;
        }
        appendShell(text,stream==='stderr'?'stderr':'stdout');
        if(active.current&&active.current.kind!=='console')active.current.output+=text;
      },
      input:()=>setWaiting(true),
      stopping:message=>setNotice(message),
      finish:data=>{
        if(active.current?.warmup){
          const attempt=active.current;
          setExampleRun({taskId:attempt.taskId,code:attempt.code,input:attempt.stdin,output:attempt.output,status:'finished',error:data.type==='error'?(data.stopped?'Program stopped. Your experiment is kept.':data.message):''});
          active.current=null;
          return;
        }
        setWaiting(false);
        if(data.type==='error')appendShell(data.stopped?'KeyboardInterrupt: program stopped.\n':data.message+'\n','stderr');
        const attempt=active.current;
        if(attempt?.kind==='console'){
          setMore(data.type==='done'&&data.more);active.current=null;return;
        }
        setMore(false);
        if(!practice&&data.type==='checked'&&data.result.passed)data={...data,result:{...data.result,message:attempt?.fixedOutput?'The Shell shows a dot. Explain the symbol you changed.':'Your code worked on these new inputs. Explain one test.'}};
        if(attempt&&!attempt.example) setWork(old=>recordAttempt(attempt.interactive?{...old,inputs:{...old.inputs,[attempt.taskId]:attempt.stdin}}:old,attempt,data));
        if(data.type==='checked'){
          appendShell(data.result.passed?'Practice checks passed.\n':'Practice checks finished. Read the feedback below.\n','meta');
          setFeedback(data.result);
          if(data.result.passed&&attempt&&!attempt.example) setWork(old=>({...old,passed:{...old.passed,[attempt.taskId]:attempt.code}}));
        }
        if(data.type==='done'&&attempt&&!attempt.example) setResult({taskId:attempt.taskId,code:attempt.code,input:attempt.stdin,output:attempt.output});
        if(data.type==='error') setError(data.stopped?'Program stopped. Your code is kept.':data.message);
        active.current=null;
      },
    });
    runtime.current.start();
    return()=>{runtime.current.destroy();runtime.current=null;};
  },[isReasoning]);
  useEffect(()=>{
    const back=()=>{
      // In-page lesson links only change the hash. Keep the editor and shell session.
      if(location.search===lastSearch.current)return;
      lastSearch.current=location.search;
      if(new URLSearchParams(location.search).get('week')!==sectionId)return;
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

  function appendShell(text,kind='meta'){setShell(old=>{const entries=[...old.slice(-159),{text,kind}];if(practice){let length=entries.reduce((n,entry)=>n+entry.text.length,0);while(length>32000&&entries.length>1)length-=entries.shift().text.length;}return entries;});}
  function clear(){setExample(false);setExampleRun(null);setFeedback(null);setAnswerFeedback(null);setError('');setResult(null);setZoom(false);setShell([]);setWaiting(false);setMore(false);setCursor({line:1,column:0});freshShell.current=true;focusShell.current=true;}
  function guard(){if(runtime.current?.active){setNotice('Stop the program before changing activities.');return false;}return true;}
  function navigate(screen,current=item.id){
    if(!guard())return;
    if(screen==='overview'&&onOverview){
      if(!onSave(latest.current)){setNotice('Download a backup before switching: saving is unavailable.');return;}
      onOverview();return;
    }
    setWork(old=>({...old,screen,current,visited:{...old.visited,[current]:true}}));
    if(screen!=='files')history.pushState(null,'',preparationUrl(location.href,screen,current));
    lastSearch.current=location.search;
    clear();setNotice('');window.scrollTo({top:0});
  }
  function update(field,value){setWork(old=>({...old,[field]:{...old[field],[item.id]:value}}));}
  function changeSupport(change){setWork(old=>{const previous=old.practiceSupport?.[item.id]||{version:item.support.version,text:'',answers:{}};const next=typeof change==='function'?change(previous):{...previous,...change};return {...old,practiceSupport:{...old.practiceSupport,[item.id]:next}};});}
  function changeCode(value){if(busy||example)return;update('drafts',value);setFeedback(null);setResult(null);}
  function changePlan(field,value){setWork(old=>({...old,plans:{...old.plans,[item.id]:{...old.plans[item.id],[field]:value}}}));}
  function runSmallExample(source,exampleInput){
    if(!item.support||!runtime.current?.ready||runtime.current.active||!source.trim())return;
    focusShell.current=false;
    active.current={taskId:item.id,code:source,stdin:exampleInput,output:'',kind:'run',warmup:true,example:true};
    setExampleRun({taskId:item.id,code:source,input:exampleInput,output:'',status:'running',error:''});
    runtime.current.execute(source,null,{stdin:exampleInput,idle:false,maxOutput:20000});
  }
  function run(kind='run'){
    if(!runtime.current?.ready||runtime.current.active||example&&kind==='check'||isAnswerFile&&(!fileReady||kind==='check'))return;
    focusShell.current=true;
    setError('');setFeedback(null);setResult(null);setNotice('');
    const interactive=kind==='run'&&inputMode==='shell', filename=example?'example.py':`${item.id}.py`;
    setWaiting(false);setMore(false);
    setShell([{text:kind==='check'?'Checking your code…\n':`================ RESTART: ${filename} ================\n`,kind:'meta'}]);
    active.current={taskId:item.id,code,stdin:interactive?'':input,inputs:interactive?[]:input?[input]:[],output:'',kind,example,interactive,fixedOutput:item.fixedOutput,startedAt:new Date().toISOString()};
    if(!example)setWork(old=>({...old,attempted:{...old.attempted,[item.id]:true}}));
    runtime.current.execute(code,kind==='check'?item.check:null,{...(interactive?{}:{stdin:input}),idle:kind==='run',...(practice?{maxOutput:2_000_000}:{}),spec:checkSpec(item)});
    if(kind==='run')freshShell.current=false;
  }
  function submitShell(value){
    focusShell.current=true;
    if(waiting){
      try{
        if(!runtime.current.answer(value))return false;
        appendShell(value+'\n','input');
        if(active.current?.interactive){active.current.inputs.push(value);active.current.stdin=active.current.inputs.join('\n')+'\n';}
        setWaiting(false);return true;
      }catch(err){setNotice(err.message);return false;}
    }
    if(!runtime.current?.ready||runtime.current.active)return false;
    setError('');appendShell((more?'... ':'>>> ')+value+'\n','command');
    active.current={kind:'console'};
    runtime.current.command(value,{reset:freshShell.current});freshShell.current=false;
    return true;
  }
  function checkAnswers(){
    const answer=work.answers[item.id] || '', checked=checkReasoning(item,answer);
    const attempt={taskId:item.id,code:answer,kind:'check',inputs:[],output:answer,startedAt:new Date().toISOString()};
    setFeedback(checked);
    setWork(old=>{const next=recordAttempt({...old,attempted:{...old.attempted,[item.id]:true}},attempt,{type:'checked',result:checked});return checked.passed?{...next,passed:{...next.passed,[item.id]:answer}}:next;});
  }
  function checkFileAnswer(){
    if(!fileReady)return;
    const answer=work.answers[item.id]||'',checked=checkAnswerFile(item,answer,stdin);
    const attempt={taskId:item.id,code:answer,kind:'check',inputs:[item.answerFile.inputName],output:answer,startedAt:new Date().toISOString()};
    setAnswerFeedback(checked);
    setWork(old=>{const next=recordAttempt({...old,attempted:{...old.attempted,[item.id]:true}},attempt,{type:'checked',result:checked});return checked.passed?{...next,passed:{...next.passed,[item.id]:answer}}:next;});
  }
  function showExample(){if(!guard())return;clear();setExample(true);requestAnimationFrame(()=>document.getElementById('prep-python')?.scrollIntoView({behavior:'smooth',block:'start'}));}
  function backup(){downloadFile(`${filePrefix}-backup.json`,JSON.stringify({format:'kl-coding-lab-backup',version:1,lesson:backupLesson,student:{name:profile.name,className:profile.className},work:latest.current},null,2),'application/json');}
  async function restore(event){
    const file=event.target.files?.[0];if(!file)return;
    try{
      if(!guard())return;
      if(file.size>5000000)throw Error('Choose a preparation backup smaller than 5 MB.');
      const payload=JSON.parse(await file.text());
      if(payload.format!=='kl-coding-lab-backup'||payload.lesson!==backupLesson)throw Error(`Choose the ${sectionTitle} ${shortTitle} backup. Other lessons keep their own work.`);
      const clean=validatePreparation(payload.work);
      if(onOverview)clean.screen='problem';
      backup();setWork(clean);clear();history.replaceState(null,'',preparationUrl(location.href,clean.screen,clean.current));
      lastSearch.current=location.search;
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
    try{const {createReport}=await import('../report.js');const doc=createReport(profile,work,{lessonConfig:reportConfig});downloadFile(`${filePrefix}-learning-report.pdf`,doc.output('arraybuffer'),'application/pdf');setNotice('Learning report downloaded.');}
    catch(err){setNotice(err.message||'The report could not be made. Download a backup to keep your work.');}
    finally{setExporting(false);}
  }
  const supported=!!problem.supportedSteps;
  const canExport=outputFileReady(result,item,draft,stdin);
  const visualCard=<figure className="prep-visual"><button className="prep-image-button" onClick={()=>setZoom(true)} aria-label={`Enlarge visual: ${activity.title}`}><picture>{visual.imageMobile&&<source media="(max-width:600px)" srcSet={visualPath({image:visual.imageMobile})}/>}<img src={visualPath(visual)} alt={visual.imageAlt} width={visual.imageWidth || 1536} height={visual.imageHeight || 1024}/></picture></button><figcaption>{!practice&&<span>{supported?'Look at one small idea. Say what you think will happen.':'Follow the picture. Explain the movements or the Python in your own words.'}</span>}<button onClick={()=>setZoom(true)}><Expand size={17}/> Enlarge visual</button></figcaption></figure>;
  const next=tasks[index+1], nextActivity=next&&next.activityId!==item.activityId;
  const planInputs=(supported?planFields.slice(0,3):planFields).map(([field,label,prompt])=><label className="prep-field" key={field} htmlFor={`prep-plan-${field}`}><b>{label}</b><span>{isReasoning?reasoningPrompts[field]:prompt}</span><textarea id={`prep-plan-${field}`} rows={2} maxLength={3000} value={work.plans[item.id]?.[field]||''} onChange={event=>changePlan(field,event.target.value)}/></label>);
  const clueCard=<section className="prep-section"><h2>Small clues</h2><button className="prep-outline" disabled={work.hints[item.id]>=item.hints.length} onClick={()=>update('hints',(work.hints[item.id]||0)+1)}>Show {work.hints[item.id]?'another':'a'} clue</button>{item.hints.slice(0,work.hints[item.id]||0).map(text=><p key={text}>{text}</p>)}{!supported&&<><h3>Explain your thinking</h3><ul>{questions.map(text=><li key={text}>{text}</li>)}</ul></>}</section>;
  function supportedStarter(){
    if(!guard())return;
    downloadFile(`${item.id}-before-supported-starter.py`,draft);
    clear();update('drafts',item.starter);setNotice('Supported starter opened. Your previous code was downloaded first.');
  }

  return <div className={`prep-app ${sectionId==='mco'?'mco-theme':''} ${supported?'fence-supported':''} ${practice?'practice-only practise-theme':''}`}>
    <a className="prep-skip" href="#prep-main">Skip to activity</a>
    <header className="prep-topbar"><button className="prep-brand" disabled={busy} onClick={()=>navigate('overview')}><CodeXml size={25}/><span>KL <b>Coding Lab</b></span></button><nav aria-label="Preparation navigation"><PlaygroundLink/>{practice&&<ReferenceLink/>}<button disabled={busy} onClick={()=>navigate('overview')}>{sectionTitle}</button><button disabled={busy} onClick={()=>navigate('files')}>My files & report</button><button disabled={busy} onClick={()=>{if(onSave(latest.current))onLeave();else setNotice('Download a backup before switching: saving is unavailable.');}}>Change week / student</button></nav></header>
    <div className="prep-student"><span><b>{profile.name}</b> · {profile.className}</span><span role="status">{saved?'Saved in this browser':'Saving unavailable — download a backup'}</span></div>
    {notice&&<div className="prep-notice" role="status">{notice}<button onClick={()=>setNotice('')} aria-label="Dismiss notice"><X size={18}/></button></div>}
    <main id="prep-main" className="prep-main" tabIndex={-1}>
      {work.screen==='overview'&&<>
        <div className="prep-hero"><div><p className="prep-eyebrow">AFTER WEEK 5 · MCC PREPARATION</p><h1>Small steps.<br/><span>A problem you can solve.</span></h1><p>Understand the input. Break down the processing. Decide the output. Find the Python you need, then predict and test.</p><div className="prep-badges"><span>5 activities</span><span>{tasks.length} short exercises</span><span>Work at your pace</span></div></div><div className="prep-method"><BookOpen size={24}/><h2>Your problem-solving routine</h2><ol><li>Understand</li><li>Break down</li><li>Find out</li><li>Try</li><li>Check</li></ol><p>Prepare over several sessions. Repeat a small exercise whenever you need more practice.</p></div></div>
        <section className="prep-problem-card"><div><p className="prep-eyebrow">PAST QUESTION · PYTHON</p><h2>{problemTitle}</h2><p>{problem.description}</p><p className="prep-muted">{progress(work)} of {tasks.length} practice checks passed. Your drafts and plans stay with each exercise.</p><button className="prep-primary" onClick={()=>navigate('problem',work.current)}>{progress(work)||Object.keys(work.drafts).length?'Continue my preparation':'Start Activity 1'}<ArrowRight size={18}/></button></div><ol className="prep-overview-path">{activities.map((entry,i)=><li key={entry.id}><span className={activityPassed(work,entry)?'is-passed':''}>{activityPassed(work,entry)?<CheckCircle2 size={19}/>:i+1}</span><div><b>{entry.title}</b><p>{entry.summary}</p></div></li>)}</ol></section>
        <section className="prep-teacher-note"><h2>How to use this path</h2><p>{supported?'Begin with supplied code. Run it, make one small change and explain what happened. The final activity is a supported version of the past question. When ready, try writing it again with less help.':'Activities 1–4 build skills through short explanations, examples, diagrams and practice. Activity 5 asks you to combine them independently. Move forward one exercise at a time, and revisit any earlier step.'}</p><p>The checks are classroom feedback. They do not award official MCC points or submit competition work.</p><a href="https://programming-26.mooc.fi/" target="_blank" rel="noreferrer">Explore the Helsinki Python course ↗</a></section>
      </>}

      {work.screen==='problem'&&<>
        <nav className="prep-breadcrumb" aria-label="Breadcrumb"><button disabled={busy} onClick={()=>navigate('overview')}>{sectionTitle}</button><span>/</span><span>{problemTitle}</span></nav>
        <nav ref={path} className={`prep-path ${activities.length>5?'prep-long-path':''}`} aria-label={`${activities.length} ${practice?'course sections':'preparation activities'}`}>{activities.map((entry,i)=><button key={entry.id} disabled={busy} aria-current={entry.id===activity.id?'step':undefined} onClick={()=>navigate('problem',entry.exercises[0].id)}><span>{activityPassed(work,entry)?<CheckCircle2 size={19}/>:i+1}</span><b>{entry.title}</b></button>)}</nav>
        <div className="prep-activity-heading"><div><p className="prep-eyebrow">{practice?'SECTION':'ACTIVITY'} {activityIndex+1} OF {activities.length} · EXERCISE {practice?index+1:exerciseIndex+1} OF {practice?tasks.length:activity.exercises.length}</p><h1>{practice?item.title:activity.title}</h1><p>{activity.summary}</p></div><span className="prep-progress">{progress(work)} / {tasks.length} {practice?(isAnswerFile?'answer-file checks':'program checks'):'checks'} passed</span></div>
        {practice?<details className="practice-picture"><summary>Picture hint · {activity.title}</summary>{visualCard}</details>:visualCard}
        {item.explorer&&Explorer&&<details className="mco-explorer-toggle"><summary>Explore both routes at every cut</summary><Explorer/></details>}
        {(practice?item.original:activity.id==='challenge')&&<section className="prep-statement"><p className="prep-eyebrow">ORIGINAL PAST QUESTION</p><h2>{problemTitle}</h2><p>{statement.description}</p><h3>Input and output</h3><p>{statement.input}</p><p><b>Constraints:</b> {statement.constraints}</p><div className="prep-table-wrap"><table><caption>{statement.tableCaption}</caption><thead><tr>{statement.tableHead.map(label=><th key={label}>{label}</th>)}</tr></thead><tbody>{statement.tableRows.map((row,i)=><tr key={i}>{row.map((value,j)=><td key={j}>{value}</td>)}</tr>)}</tbody></table></div><p>{statement.note}</p>{statement.sourceUrl&&<a href={statement.sourceUrl} target="_blank" rel="noreferrer">{statement.sourceLabel}</a>}</section>}
        {(practice?item.original:activity.id==='challenge')&&problem.resources?.length>0&&<section className="prep-statement" aria-labelledby="prep-resources-title"><h2 id="prep-resources-title">Additional resource</h2>{problem.resources.map(resource=><div key={resource.url}><h3>{resource.title}</h3><p>{resource.description}</p><a href={resource.url} target="_blank" rel="noreferrer">Watch the teacher’s walkthrough on YouTube ↗</a></div>)}</section>}
        {practice?<nav className="prep-flow" aria-label="Exercise shortcuts">{item.support&&<><a href="#prep-typing">Type a little code</a><span>→</span><a href="#prep-understand">Check the meaning</a><span>→</span></>}<a href="#prep-read">{isAnswerFile?'Your answer task':'Your program task'}</a><span>→</span>{isAnswerFile&&<><a href="#prep-answer-file">Check and save answer</a><span>→</span></>}<a href="#prep-python">{isAnswerFile?'Optional Python':'Code and run'}</a>{!isAnswerFile&&<><span>→</span><a href="#prep-check">Check program</a></>}</nav>:<>
        <nav className="prep-flow" aria-label="Steps in this exercise"><a href="#prep-read">1. Understand</a><span>→</span><a href="#prep-plan">2. Plan</a><span>→</span><a href={isReasoning?'#prep-answer':'#prep-python'}>3. {isReasoning?'Try':'Code and run'}</a><span>→</span><a href="#prep-reflect">4. Explain</a></nav>
        </>}
        <div className="prep-workspace">
          {practice&&item.support&&<PracticeLearning key={item.id} item={item} record={work.practiceSupport?.[item.id]} onChange={changeSupport} disabled={busy} runnerStatus={status} onRun={runSmallExample} onStop={()=>runtime.current.stop()} runResult={exampleRun}/>}
          {practice?<PracticeCard item={item} extraSamples={problem.extraSamples}/>:<>
          <section id="prep-read" className="prep-section"><p className="prep-eyebrow">1 · UNDERSTAND</p><h2>{isReasoning?'Ideas to try':'Ideas and syntax'}</h2>{reading.map(text=><p key={text}>{text}</p>)}{syntax.length>0&&<dl className="prep-syntax">{syntax.map(([word,meaning])=><div key={word}><dt><code>{word}</code></dt><dd>{meaning}</dd></div>)}</dl>}{!isReasoning&&<a href="https://docs.python.org/3/tutorial/" target="_blank" rel="noreferrer">Python reference ↗</a>}</section>
          {activity.example&&!supported&&<section className="prep-section"><p className="prep-eyebrow">STUDY AN EXAMPLE</p><h2>Predict before running</h2><Code>{activity.example}</Code>{activity.exampleNotes.map(text=><p key={text}>{text}</p>)}<p><b>Expected example output</b></p><Code>{activity.exampleOutput}</Code><button className="prep-outline" disabled={busy} onClick={showExample}>Explore example in editor <ArrowRight size={17}/></button></section>}
          <section className="prep-section prep-your-task"><p className="prep-eyebrow">YOUR TASK</p><h2>{item.title}</h2><p>{item.goal}</p>{item.beforeCoding&&<p><b>Act it out first:</b> {item.beforeCoding}</p>}{isReasoning?<p className="mco-scenario">{item.scenario}</p>:<><p>{item.inputHelp}</p><div className="prep-samples"><div><h3>Sample input</h3><Code>{item.sampleInput.trimEnd()||'(no input needed)'}</Code></div><div><h3>Expected output</h3><Code>{item.sampleOutput||'(nothing printed)'}</Code></div></div></>}{activity.id==='challenge'&&problem.extraSamples?.map(sample=><div key={sample.title}><div className="prep-samples"><div><h3>{sample.title}</h3><Code>{sample.input.trimEnd()}</Code></div><div><h3>Expected output</h3><Code>{sample.output}</Code></div></div><p>{sample.explanation}</p></div>)}</section>
          {supported?<section id="prep-plan" className="prep-section fence-mini-plan"><h2>Say the plan</h2><dl>{['Input','Process','Output'].map((label,i)=><div key={label}><dt>{label}</dt><dd>{item.ipo[i]}</dd></div>)}</dl><details><summary>My input → process → output plan · optional notes</summary>{planInputs}</details></section>:<section id="prep-plan" className="prep-section"><p className="prep-eyebrow">2 · PLAN</p><h2>My input → process → output plan</h2>{planInputs}</section>}
          {!supported&&clueCard}
          </>}
          {isAnswerFile&&<AnswerFilePractice item={item} answer={work.answers[item.id]||''} data={stdin} loadState={fileReady?'ready':fileInput.status} disabled={busy} onChange={value=>{update('answers',value);setAnswerFeedback(null);}} onCheck={checkFileAnswer} feedback={answerFeedback} passed={taskPassed(work,item)} onPrepare={()=>{setInputMode('test');document.getElementById('prep-python')?.scrollIntoView({behavior:'smooth',block:'start'});}} canUseRun={canExport} onUseRun={()=>{if(canExport){update('answers',result.output);setAnswerFeedback(null);document.getElementById('prep-answer-file')?.scrollIntoView({behavior:'smooth',block:'start'});}}}/>}
          {isReasoning?<div id="prep-answer"><ReasoningPractice item={item} answer={work.answers[item.id]||''} onChange={value=>{update('answers',value);setFeedback(null);}} onCheck={checkAnswers} feedback={feedback}/></div>:<section id="prep-python" className="prep-python idle-workspace" aria-label="Python workspace" onKeyDownCapture={event=>{if(event.key==='F5'){event.preventDefault();event.stopPropagation();run();}}}>
            <div className="idle-intro"><p className="prep-eyebrow">{practice?(item.support?'4':'2'):'3'} · CODE AND RUN</p><h2>Your Python desk</h2><p>{isAnswerFile?'Python is optional for this fixed input. Run with the supplied file, then use its output as your answer above.':practice?'Use the idea in your own code below. Run it with the sample, then check your program.':supported?'The starter code is supplied. Follow your tiny change, then run it.':<>Write in the editor. Choose <b>Run Module</b> or press <kbd>F5</kbd>. Read and answer in the Shell below.</>}</p></div>
            {supported&&<div className="fence-tiny-change"><b>{item.guideLine?'Your tiny change':'Your first run'}</b><p>{item.change}</p><button className="prep-outline" disabled={busy||draft===item.starter} onClick={supportedStarter}>Use supported starter</button><small>Line numbers refer to the supported starter. Opening it downloads your current code first.</small></div>}
            {practice&&<div className="practice-guide">{item.guide&&<><b>Your task in the editor</b><p>{item.guide}</p></>}<button className="prep-outline" disabled={busy||draft===item.starter} onClick={supportedStarter}>Use starter code</button><small>Opening the starter downloads your current code first.</small></div>}
            {example&&<div className="prep-example-banner"><b>You are exploring the example.</b><p>Your own draft is kept separately.</p><button disabled={busy} onClick={clear}>Return to my own code</button></div>}
            <div className="idle-editor-window">
              <div className="idle-window-title"><b>Python Editor</b><span>{example?'example.py':`${item.id}.py`}</span></div>
              <div className="idle-toolbar" role="toolbar" aria-label="File and editing tools">
                {!example&&<button disabled={busy} onClick={()=>importInput.current.click()}>Open .py</button>}
                <button disabled={busy} onClick={()=>downloadFile(`${item.id}${example?'-example':''}.py`,code)}><Download size={14}/>Save .py</button>
                <span className="idle-toolbar-divider"/>
                <button disabled={busy||example} onClick={()=>editor.current?.undo()}>Undo</button><button disabled={busy||example} onClick={()=>editor.current?.redo()}>Redo</button>
                <button disabled={busy||example} onClick={()=>editor.current?.indent()}>Indent</button><button disabled={busy||example} onClick={()=>editor.current?.outdent()}>Dedent</button>
              </div>
              <Editor key={item.id+(example?'-example':'')} ref={editor} appearance="idle" value={code} onChange={changeCode} onCursor={setCursor} onRun={()=>run()} readOnly={busy||example} fontSize={17} guideLine={supported||practice?item.guideLine:null}/>
              <div className="idle-editor-status"><span>Ln {cursor.line}, Col {cursor.column}</span><span>Tab = 4 spaces · Enter indents a block</span><span>{example?'Example · read only':saved?'Draft saved in this browser':'Saving unavailable'}</span></div>
            </div>
            <div className="idle-run-controls">
              <div className="prep-runbar"><button className="prep-primary" disabled={status!=='ready'||!fileReady} onClick={()=>run()}><Play size={16}/>Run {example?'Example':'Module'} <kbd>F5</kbd></button><button className="prep-outline" disabled={!busy} onClick={()=>runtime.current.stop()}><Square size={14}/>Stop</button><span role="status">{({loading:'Loading Python…',ready:'Python ready',running:waiting?'Waiting for input…':'Running…',checking:'Checking new inputs…',unavailable:'Python needs attention'})[status]}</span></div>
              <fieldset className="idle-input-mode" disabled={busy}><legend>How will you enter input?</legend><label><input type="radio" name="idle-input-mode" checked={inputMode==='shell'} onChange={()=>setInputMode('shell')}/>In the Shell, like IDLE</label><label><input type="radio" name="idle-input-mode" checked={inputMode==='test'} onChange={()=>setInputMode('test')}/>Use prepared test input</label></fieldset>
              {inputMode==='test'&&isAnswerFile?<div className="prep-field prep-input"><b>Prepared input: {item.answerFile.inputName}</b><span>{fileReady?`${stdin.length.toLocaleString('en-GB')} characters loaded. Each input() reads the next line.`:'Waiting for the supplied input file.'}</span><Code>{stdin.length>1500?stdin.slice(0,250)+'\n[Preview shortened. The complete file is used.]':stdin}</Code></div>:inputMode==='test'&&<label className="prep-field prep-input" htmlFor="prep-input"><b>Program input</b><span>Optional shortcut: each input() reads the next line here. Switch back to the Shell to type answers as you run.</span><textarea id="prep-input" rows={5} spellCheck={false} maxLength={700000} disabled={busy||example} value={input} onChange={event=>{update('inputs',event.target.value);setResult(null);}}/></label>}
            </div>
            <PythonShell key={item.id+(example?'-example':'')} entries={shell} focusOnReady={focusShell.current} waiting={waiting} busy={busy} ready={status==='ready'} more={more} onSubmit={submitShell} onStop={()=>runtime.current.stop()}/>
            {error&&<section className="prep-feedback prep-retry" role="alert"><b>{friendlyError(error).tip}</b><Code>{error}</Code></section>}
            {status==='unavailable'&&<button className="prep-outline" onClick={()=>globalThis.crossOriginIsolated?runtime.current.start():location.reload()}>Try loading Python again</button>}
            {!example&&feedback&&<section className={`prep-feedback ${feedback.passed?'prep-success':'prep-retry'}`} aria-live="polite"><h3>{feedback.passed?'Your current code passed these checks':'Check one small thing'}</h3><p>{feedback.message}</p>{feedback.error&&<Code>{feedback.error}</Code>}<details className="practice-test-details" open={!practice||!feedback.passed}><summary>See the practice tests</summary><div className="prep-test-list">{feedback.cases?.map((test,i)=><div key={i}><b>Test {i+1} · {test.passed?'Passed':'Try again'}</b><div className="prep-samples"><div><span>Input</span><Code>{test.input||'(none)'}</Code></div><div><span>{practice&&item.validator?'One valid answer':'Expected'}</span><Code>{test.expected||'(nothing printed)'}</Code></div><div><span>Your output</span><Code>{test.actual||'(nothing printed)'}</Code></div></div>{test.error&&<Code>{test.error}</Code>}</div>)}</div></details>{practice&&feedback.passed&&next&&<button className="prep-primary practice-next-task" onClick={()=>navigate('problem',next.id)}>Next small challenge: {next.title.slice(next.title.indexOf(' ')+1)}<ArrowRight size={17}/></button>}</section>}
            {!example&&!isAnswerFile&&<div id="prep-check" className="idle-check"><h3>{practice?'Check your exercise':'Compare, then check'}</h3><p>{practice?'Run your code, then try the practice checks.':'Does the Shell show the output you predicted? Practice checks try different inputs.'}</p><button className="prep-outline" disabled={status!=='ready'} onClick={()=>run('check')}><CheckCircle2 size={17}/>Check my code</button><p className="prep-check-state">{taskPassed(work,item)?(practice?'✓ Current code passed. Continue to the next exercise.':'✓ Current code passed the practice checks. Explain one test.'):'Make one small change and run again whenever you need to.'}</p></div>}
            {!example&&!isAnswerFile&&<div className="prep-file-tools"><button disabled={!canExport} onClick={()=>downloadFile(`${item.id}.out`,result.output)}>Download output</button></div>}
            {!example&&!isAnswerFile&&<p className="prep-muted">Output download becomes available after a successful run of your current code and input.</p>}
            {practice&&item.hints.length>0&&<div className="practice-hints"><button className="prep-outline" disabled={work.hints[item.id]>=item.hints.length} onClick={()=>update('hints',(work.hints[item.id]||0)+1)}>Show {work.hints[item.id]?'another hint':'a hint'}</button>{item.hints.slice(0,work.hints[item.id]||0).map(text=><p key={text}>{text}</p>)}</div>}
            {practice&&result?.output.length>32000&&<p className="prep-muted">The Shell shows recent output. Download output keeps the complete run.</p>}
          </section>}
          {supported&&clueCard}
          {!practice&&<section id="prep-reflect" className="prep-section"><p className="prep-eyebrow">4 · EXPLAIN</p><h2>Explain and check</h2><label className="prep-field" htmlFor="prep-explanation"><span>{supported?`${item.explain} Say it aloud, or write a short note (optional).`:'One thing I looked up, one test I tried, and what I learned.'}</span><textarea id="prep-explanation" rows={supported?2:4} maxLength={3000} value={work.explanations[item.id]||''} onChange={event=>update('explanations',event.target.value)}/></label>{(!supported||exerciseIndex===activity.exercises.length-1)&&<label className="prep-readiness"><input type="checkbox" checked={work.readiness[activity.id]||false} onChange={event=>setWork(old=>({...old,readiness:{...old.readiness,[activity.id]:event.target.checked}}))}/><span>{activity.ready}<small>My own readiness reflection; separate from code checks.</small></span></label>}</section>}
        </div>
        <div className="prep-bottom"><button className="prep-outline" disabled={busy} onClick={()=>index?navigate('problem',tasks[index-1].id):navigate('overview')}><ArrowLeft size={17}/>{index?'Previous exercise':'Preparation overview'}</button><span>Exercise {index+1} of {tasks.length}</span><button className="prep-primary" disabled={busy} onClick={()=>next?navigate('problem',next.id):navigate('files')}>{next?`${nextActivity?'Next activity':'Next exercise'}: ${nextActivity?activityFor(next.id).title:next.title}`:'Finish & keep my work'}<ArrowRight size={17}/></button></div>
      </>}

      {work.screen==='files'&&<section className="prep-files"><p className="prep-eyebrow">{sectionTitle.toUpperCase()} · YOUR LEARNING</p><h1>Keep your {shortTitle} work</h1><p>{progress(work)} of {tasks.length} practice checks passed. {practice?'Your backup keeps typing practice, MCQ answers, answer-file text, program drafts, input and recent run/check evidence.':'Your backup keeps drafts, input, plans, explanations, readiness reflections and recent run/check evidence.'}</p><p>Progress saves in this browser under your profile. Download a backup before moving devices.</p><div className="prep-file-buttons"><button className="prep-primary" onClick={backup}><Download size={18}/>Download preparation backup</button><button className="prep-outline" disabled={busy} onClick={()=>restoreInput.current.click()}>Restore preparation backup</button><button className="prep-outline" disabled={busy||exporting} onClick={report}><FileCode2 size={18}/>{exporting?'Creating PDF…':'Download learning report (PDF)'}</button></div>{!practice&&<label className="prep-field" htmlFor="prep-reflection"><b>My next step</b><textarea id="prep-reflection" rows={4} maxLength={6000} value={work.reflection} onChange={event=>setWork(old=>({...old,reflection:event.target.value}))}/></label>}{activities.map((entry,i)=><div className="prep-file-row" key={entry.id}><span><b>{i+1}. {entry.title}</b><small>{entry.exercises.filter(t=>taskPassed(work,t)).length} / {entry.exercises.length} checks passed</small></span><button onClick={()=>navigate('problem',entry.exercises[0].id)}>Revisit activity <ArrowRight size={16}/></button></div>)}<button className="prep-outline" onClick={()=>navigate('problem',work.current)}>Return to my exercise</button></section>}
    </main>
    <footer className="prep-footer"><span>KL Coding Lab · {sectionTitle}</span><span>{practice?'Type · Understand · Use · Run · Check':'Understand → Break down → Find out → Try → Check'}</span></footer>
    <input ref={restoreInput} hidden type="file" accept=".json" onChange={restore}/><input ref={importInput} hidden type="file" accept=".py" onChange={importCode}/>
    {zoom&&<dialog ref={dialog} className="prep-dialog" aria-label={`${activity.title} visual`} onCancel={()=>setZoom(false)} onClick={event=>{if(event.target===event.currentTarget)setZoom(false);}}><div><h2>{activity.title}</h2><button onClick={()=>setZoom(false)} aria-label="Close enlarged visual"><X size={22}/></button></div><img src={visualPath(visual)} alt={visual.imageAlt}/><div><a href={visualPath(visual)} target="_blank" rel="noreferrer">Open full-size image ↗</a><a href={visualPath(visual)} download={visual.image}>Download this visual</a></div></dialog>}
  </div>;
}
