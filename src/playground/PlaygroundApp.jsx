import React,{useEffect,useRef,useState} from 'react';
import {CodeXml,Play,Square,BookOpen,ArrowRight,Download,FolderOpen,FilePlus2} from 'lucide-react';
import {Editor} from '../Editor.jsx';
import {PythonShell} from '../mcc/PythonShell.jsx';
import {PythonRuntime,friendlyError} from '../runtime.js';
import {downloadFile} from '../storage.js';
import {ReferenceLink} from '../reference/ReferenceLink.jsx';
import {shortExampleError} from '../practise/playIdeas.js';
import {pageUrl} from '../navigation.js';
import {examples,exampleById,newProgram,loadPlayground,savePlayground,replaceProgram,restoreProgram,readPythonFile,readTextFile,pythonFilename,INPUT_LIMIT,TEXT_EDIT_LIMIT,CODE_LIMIT} from './state.js';
import '../mcc/idle.css';
import './playground.css';
const href=()=>typeof location==='undefined'?'https://example.test/':location.href;
export function PlaygroundApp(){
 const [work,setWork]=useState(loadPlayground),[saved,setSaved]=useState(true),[status,setStatus]=useState('loading'),[entries,setEntries]=useState([]),[waiting,setWaiting]=useState(false),[more,setMore]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState(''),[opening,setOpening]=useState(false),[incomingText,setIncomingText]=useState(null),[helpOpen,setHelpOpen]=useState(false),[cursor,setCursor]=useState({line:1,column:0});
 const runtime=useRef(),editor=useRef(),upload=useRef(),shell=useRef(),latest=useRef(),active=useRef(),fresh=useRef(true),runNow=useRef(),textChoice=useRef();
 const program=work.program,busy=status==='running',locked=busy||opening||!!incomingText,example=exampleById(program.exampleId),issue=error?friendlyError(error):null;
 latest.current={work,program,busy,opening,incomingText};
 function append(text,kind='stdout'){setEntries(old=>{const next=[...old.slice(-159),{text,kind}];let size=next.reduce((sum,item)=>sum+item.text.length,0);while(size>30000&&next.length>1)size-=next.shift().text.length;return next;});}
 useEffect(()=>{if(incomingText)textChoice.current?.focus();},[incomingText]);
 function changeProgram(change){setWork(old=>({...old,program:{...old.program,...change}}));}
 useEffect(()=>{
  document.title='Python Playground · KL Coding Lab';
  runtime.current=new PythonRuntime({
   status:(next,note)=>{setStatus(next);if(note)setMessage(note);if(next==='loading'){fresh.current=true;setWaiting(false);setMore(false);}},
   output:(text,stream)=>append(text,stream==='stderr'?'stderr':'stdout'),
   input:()=>setWaiting(true),stopping:note=>setMessage(note),
   finish:data=>{const job=active.current;active.current=null;setWaiting(false);
    if(data.type==='error'){setMore(false);const detail=data.stopped?'Program stopped. Your code is still here.':data.message;setError(data.stopped?'':detail);append((data.stopped?detail:shortExampleError(detail))+'\n',data.stopped?'meta':'stderr');setMessage(data.stopped?detail:'Fix the line below, then press Run again.');}
    else if(job?.kind==='console')setMore(!!data.more);
    else{setMore(false);setMessage('Finished. Try changing something, then press Run again.');}
   }
  });runtime.current.start();return()=>runtime.current.destroy();
 },[]);
 useEffect(()=>{const timer=setTimeout(()=>setSaved(savePlayground(work)),200);return()=>clearTimeout(timer);},[work]);
 useEffect(()=>{const save=()=>savePlayground(latest.current.work);window.addEventListener('pagehide',save);return()=>{save();window.removeEventListener('pagehide',save);};},[]);
 useEffect(()=>{const shortcut=event=>{if(event.key==='F5'&&!event.defaultPrevented){event.preventDefault();runNow.current?.();}};window.addEventListener('keydown',shortcut);return()=>window.removeEventListener('keydown',shortcut);},[]);
 function run(){
  if(!runtime.current?.ready||runtime.current.active||latest.current.opening||latest.current.incomingText)return;
  const current=latest.current.program;setError('');setMessage('');setWaiting(false);setMore(false);
  setEntries([{text:`================ RESTART: ${pythonFilename(current.filename)} ================\n`,kind:'meta'}]);active.current={kind:'run'};
  runtime.current.execute(current.code,null,{idle:true,maxOutput:20000,...(current.mode==='prepared'?{stdin:current.input}:{})});fresh.current=false;
  requestAnimationFrame(()=>shell.current?.scrollIntoView({behavior:'smooth',block:'nearest'}));
 }
 runNow.current=run;
 function submit(value){
  if(latest.current.opening||latest.current.incomingText)return false;
  if(waiting){try{if(!runtime.current.answer(value))return false;append(value+'\n','input');setWaiting(false);return true;}catch(err){setMessage(err.message);return false;}}
  if(!runtime.current?.ready||runtime.current.active)return false;
  setError('');setMessage('');append((more?'... ':'>>> ')+value+'\n','command');active.current={kind:'console'};runtime.current.command(value,{reset:fresh.current});fresh.current=false;return true;
 }
 function replace(next){
  if(busy||opening)return;setWork(old=>replaceProgram(old,next));setEntries([]);setError('');setWaiting(false);setMore(false);fresh.current=true;setCursor({line:1,column:0});setMessage('Program opened. Your previous program is kept in Restore previous. Press Run when you are ready.');requestAnimationFrame(()=>editor.current?.focus());
 }
 async function openFile(event){
  const file=event.target.files?.[0];event.target.value='';if(!file||latest.current.busy)return;
  setOpening(true);try{
   if(file.name.toLowerCase().endsWith('.txt')){setIncomingText(await readTextFile(file));setMessage('Choose whether this text file is sample input or Python code.');}
   else{const next=await readPythonFile(file);setWork(old=>replaceProgram(old,next));setEntries([]);setError('');setMore(false);fresh.current=true;setMessage('Python file opened. Press Run to start it. Restore previous brings back your earlier program.');}
  }
  catch(err){setMessage(err.message);}finally{setOpening(false);}
 }
 const route=week=>pageUrl(href(),week).toString();
 return <div className="playground-app">
  <a className="pg-skip" href="#playground-code">Skip to Python editor</a>
  <header className="pg-header"><a className="pg-brand" href={route('playground')}><CodeXml size={24}/><span>KL <b>Coding Lab</b></span></a><nav aria-label="Playground navigation"><a href="#playground-courses">Lessons & practice</a><ReferenceLink/></nav></header>
  <main className="pg-main">
   <div className="pg-intro"><div><h1>Python playground</h1><p>Write code. Press <b>Run</b>. See what happens.</p></div><span className={`pg-runtime pg-${status}`} role="status"><i/>{status==='loading'?'Loading Python…':status==='unavailable'?'Python needs attention':busy?waiting?'Waiting for your answer':'Running your program':'Python 3 ready'}</span></div>
   <ol className="pg-steps" aria-label="How to use the playground"><li><b>1</b><span><strong>Editor</strong> — write your instructions.</span></li><li><b>2</b><span><strong>Run</strong> — start the whole program.</span></li><li><b>3</b><span><strong>Shell</strong> — see results and type answers.</span></li></ol>
   <section className="pg-desk idle-workspace" aria-label="Python workspace" id="playground-code">
    <div className="pg-starters"><span>Try an example:</span>{examples.map(item=><button key={item.id} disabled={locked} onClick={()=>replace(newProgram(item.id))}>{item.title}</button>)}</div>
    {incomingText&&<section className="pg-open-text" aria-labelledby="pg-open-text-title"><h2 id="pg-open-text-title" ref={textChoice} tabIndex={-1}>Open {incomingText.filename}</h2><p>Is this the question’s input data, or Python code saved as text?</p><pre aria-label="Text file preview">{incomingText.text.slice(0,500)||'(empty text file)'}{incomingText.text.length>500?'\n… preview only':''}</pre><div><button onClick={()=>{replace({...program,input:incomingText.text,inputFilename:incomingText.filename,mode:'prepared'});setIncomingText(null);setHelpOpen(true);setMessage('Text file loaded as input. Your Python code is kept. Press Run to use the file’s lines.');}}>Use as input</button><button disabled={incomingText.text.length>CODE_LIMIT} onClick={()=>{replace({...newProgram('blank'),code:incomingText.text,filename:pythonFilename(incomingText.filename.replace(/\.txt$/i,''))});setIncomingText(null);}}>Open as code</button><button onClick={()=>{setIncomingText(null);setMessage('Text file closed. Your code and input are kept.');}}>Cancel</button></div>{incomingText.text.length>CODE_LIMIT&&<p>This file is larger than the code editor limit. You can use the full file as input.</p>}</section>}
    <div className="idle-editor-window"><div className="pg-editor-title"><div><b>Python Editor</b><label className="pg-filename">File name<input aria-label="Python file name" value={program.filename} maxLength={70} disabled={locked} onChange={e=>changeProgram({filename:e.target.value})} onBlur={()=>changeProgram({filename:pythonFilename(latest.current.program.filename)})}/></label></div><div className="pg-actions"><button className="pg-run" disabled={status!=='ready'||opening||!!incomingText} onClick={run}><Play size={16} fill="currentColor"/>Run <kbd>F5</kbd></button><button disabled={!busy} onClick={()=>runtime.current.stop()}><Square size={14}/>Stop</button></div></div>
     <div className="pg-tools" role="toolbar" aria-label="Python editor tools"><button disabled={locked} onClick={()=>replace(newProgram('blank'))}><FilePlus2 size={14}/>New</button><button disabled={locked} onClick={()=>upload.current?.click()}><FolderOpen size={14}/>Open…</button><button onClick={()=>downloadFile(pythonFilename(program.filename),program.code)}><Download size={14}/>Download .py</button><span className="pg-tool-divider"/><button disabled={locked} onClick={()=>editor.current?.undo()}>Undo</button><button disabled={locked} onClick={()=>editor.current?.redo()}>Redo</button><button disabled={locked} onClick={()=>editor.current?.indent()}>Indent</button><button disabled={locked} onClick={()=>editor.current?.outdent()}>Dedent</button><label>Text size<select aria-label="Editor text size" value={program.fontSize} onChange={e=>changeProgram({fontSize:Number(e.target.value)})}><option value={15}>Small</option><option value={17}>Medium</option><option value={20}>Large</option></select></label></div>
     <Editor ref={editor} value={program.code} onChange={code=>changeProgram({code})} onRun={run} appearance="idle" fontSize={program.fontSize} readOnly={locked} onCursor={setCursor} guideLine={issue?.line}/>
     <div className="idle-editor-status"><span>Ln {cursor.line}, Col {cursor.column} · Tab = 4 spaces</span><span role="status">{saved?'Draft saved in this browser':'Not saved — download your code and keep your input file'}</span></div>
    </div>
    <div className="pg-below-editor">{example&&<p><b>Try this:</b> {program.mode==='prepared'?'Your program will use the input shown below. Press Run to try it.':example.tip}</p>}{work.previous.length>0&&<button disabled={locked} onClick={()=>{setWork(restoreProgram);setEntries([]);setError('');setMore(false);fresh.current=true;setMessage('Previous program restored, including its input.');}}>Restore previous program</button>}</div>
    {program.mode==='prepared'&&<div className="pg-input-banner"><span><b>Input:</b> {program.inputFilename||'prepared sample input'} · {program.input.length.toLocaleString()} characters</span><button disabled={locked} onClick={()=>changeProgram({mode:'shell'})}>Type in the Shell instead</button></div>}
    <div ref={shell} className="pg-shell-wrap"><div className="pg-shell-caption"><p><b>Output & input</b> appear in the Shell below.</p><button disabled={busy} onClick={()=>{setEntries([]);setError('');setMessage('Output cleared. Your code is still here.');}}>Clear output</button></div><PythonShell entries={entries} waiting={waiting} busy={busy} ready={status==='ready'} more={more} onSubmit={submit} onStop={()=>runtime.current.stop()} runLabel="Run" emptyText="Press Run to see your program’s output here." inputHelp="Your program is asking for input. Type one answer above, then press Enter."/></div>
    {message&&<p className="pg-message" role="status">{message}</p>}
    {issue&&<aside className="pg-error" role="alert"><h2>{issue.line?`Check line ${issue.line}`:'Try one small fix'}</h2><p>{issue.tip}</p><pre>{shortExampleError(error)}</pre><ReferenceLink topic="errors">Look up this error ↗</ReferenceLink><details><summary>Full Python message</summary><pre>{error}</pre></details></aside>}
    {status==='unavailable'&&<div className="pg-load-error"><p>Check your connection, then try loading Python again.</p><button onClick={()=>globalThis.crossOriginIsolated?runtime.current.start():location.reload()}>Load Python again</button></div>}
    <details className="pg-help" open={helpOpen} onToggle={e=>setHelpOpen(e.currentTarget.open)}><summary>Sample input & help with the editor</summary><fieldset disabled={locked}><legend>How should input() receive its lines?</legend><label><input type="radio" name="playground-input-mode" checked={program.mode==='shell'} onChange={()=>changeProgram({mode:'shell'})}/>Type answers in the Shell (start here)</label><label><input type="radio" name="playground-input-mode" checked={program.mode==='prepared'} onChange={()=>changeProgram({mode:'prepared'})}/>Use prepared sample input</label></fieldset>{program.mode==='prepared'&&<div className="pg-prepared">{program.input.length>TEXT_EDIT_LIMIT?<><b>Input file preview</b><pre aria-label="Large input preview">{program.input.slice(0,1000)}{'\n… preview only. The full file will be used.'}</pre><button disabled={locked} onClick={()=>{setWork(old=>replaceProgram(old,{...old.program,input:'',inputFilename:''}));setMessage('Input box cleared. Restore previous program brings the file back.');}}>Replace with typed input</button></>:<label>Sample input<textarea aria-label="Prepared sample input" rows={4} value={program.input} disabled={locked} maxLength={INPUT_LIMIT} onChange={e=>changeProgram({input:e.target.value,inputFilename:''})}/></label>}<span>Each input() reads the next line. Open… can load a .txt input file.</span><button onClick={()=>downloadFile(program.inputFilename||'input.txt',program.input)}>Download input .txt</button></div>}<p><b>Run / F5</b> starts the whole program with fresh variables. <b>Stop</b> interrupts it. In the Shell, <code>&gt;&gt;&gt;</code> also lets you try one Python command, such as <code>2 + 3</code>.</p><p><b>Tab</b> adds four spaces. <b>Shift + Tab</b> removes one indent. Press <b>Escape</b>, then <b>Tab</b> to leave the editor. Do not type line numbers or <code>&gt;&gt;&gt;</code> into your program.</p><p>Your playground draft saves on this browser. Download your .py file before changing devices or sharing this computer. Use <b>Open…</b> to continue it later. Text files can supply sample input or open as code.</p></details>
   </section>
   <section className="pg-courses" id="playground-courses" aria-labelledby="pg-courses-title"><h2 id="pg-courses-title">Choose your next practice</h2><p>Ready for a lesson? Choose a course and open your student profile there.</p><div className="pg-course-grid"><article><BookOpen size={21}/><h3>Weekly Python lessons</h3><p>Learn input, variables, loops and decisions in small steps.</p><div className="pg-week-links">{[1,2,3,4,5].map(n=><a key={n} href={route(n)}>Week {n}</a>)}</div></article>{[['mcc','MCC Preparation','Building Fences, Corner Cover and Collatz.'],['mcc-practise','MCC Practise','Binary Sorting, Winning Streak and Block Bishop, from first lines to competition questions.'],['mco','MCO Tryout','Explore routes on a number line, then build your Python solution.']].map(([id,title,description])=><a className="pg-course-card" key={id} href={route(id)}><CodeXml size={21}/><h3>{title}</h3><p>{description}</p><span>Open course <ArrowRight size={16}/></span></a>)}</div></section>
  </main><footer className="pg-footer"><span>KL Coding Lab · Create · Run · Try again</span><ReferenceLink>Need a Python word? Open the reference ↗</ReferenceLink></footer>
  <input ref={upload} type="file" accept=".py,.txt,text/x-python,text/plain" className="idle-sr-only" onChange={openFile} aria-label="Open a Python or text file"/>
 </div>;
}
