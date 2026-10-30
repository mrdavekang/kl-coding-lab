import React,{useEffect,useRef,useState} from 'react';
import {Editor} from '../Editor.jsx';
import {PythonShell} from '../mcc/PythonShell.jsx';
import {PythonRuntime,friendlyError} from '../runtime.js';
import {shortExampleError} from '../practise/playIdeas.js';
import {downloadFile} from '../storage.js';
export function ReferencePlayground({topic,draft={},onChange,onBusy}){
 const [status,setStatus]=useState('loading'),[entries,setEntries]=useState([]),[waiting,setWaiting]=useState(false),[more,setMore]=useState(false),[mode,setMode]=useState('prepared'),[error,setError]=useState(''),[message,setMessage]=useState(''),[cursor,setCursor]=useState({line:1,column:0}),[beforeReset,setBeforeReset]=useState(null);
 const runtime=useRef(),editor=useRef(),active=useRef(),latest=useRef(),fresh=useRef(true);
 const code=draft.code??topic.example.code,input=draft.input??topic.example.input,busy=status==='running';
 latest.current={topic,code,input,mode,onChange};
 function append(text,kind='stdout'){setEntries(old=>{const next=[...old.slice(-159),{text,kind}];let total=next.reduce((n,e)=>n+e.text.length,0);while(total>24000&&next.length>1)total-=next.shift().text.length;return next;});}
 useEffect(()=>{
  runtime.current=new PythonRuntime({status:(next,note)=>{setStatus(next);onBusy(next==='running'||next==='checking');if(note)setMessage(note);if(next==='loading'){fresh.current=true;setWaiting(false);setMore(false);}},
   output:(text,stream)=>{if(active.current?.topicId===latest.current.topic.id)append(text,stream==='stderr'?'stderr':'stdout');},
   input:()=>{if(active.current?.topicId===latest.current.topic.id)setWaiting(true);},stopping:note=>setMessage(note),finish:data=>{
    const job=active.current;active.current=null;setWaiting(false);
    if(!job||job.topicId!==latest.current.topic.id)return;
    if(data.type==='error'){const text=data.stopped?'Program stopped. Your code is kept.':data.message;setError(text);append(shortExampleError(text)+'\n','stderr');}
    else if(job.kind==='console')setMore(!!data.more);
    else{setMore(false);setMessage('Example finished. Change a value and run again if you like.');}
    if(job.interactive)latest.current.onChange({input:job.inputs.length?job.inputs.join('\n')+'\n':''});
   }});
  runtime.current.start();return()=>{runtime.current.destroy();onBusy(false);};
 },[]);
 useEffect(()=>{
  if(runtime.current?.active)runtime.current.stop('The previous example was stopped when the topic changed.');
  setEntries([]);setError('');setMessage('');setWaiting(false);setMore(false);setCursor({line:1,column:0});fresh.current=true;
 },[topic.id]);
 function run(){
  if(!runtime.current?.ready||runtime.current.active)return;
  const current=latest.current,interactive=current.mode==='shell';
  setError('');setMessage('');setWaiting(false);setMore(false);
  setEntries([{text:`================ RESTART: ${current.topic.id}.py ================\n`,kind:'meta'}]);
  active.current={topicId:current.topic.id,kind:'run',interactive,inputs:[]};
  runtime.current.execute(current.code,null,{...(interactive?{}:{stdin:current.input}),idle:true,maxOutput:20000});fresh.current=false;
 }
 function submit(value){
  if(waiting){try{if(!runtime.current.answer(value))return false;append(value+'\n','input');active.current?.inputs?.push(value);setWaiting(false);return true;}catch(err){setMessage(err.message);return false;}}
  if(!runtime.current?.ready||runtime.current.active)return false;
  setError('');append((more?'... ':'>>> ')+value+'\n','command');active.current={topicId:latest.current.topic.id,kind:'console'};runtime.current.command(value,{reset:fresh.current});fresh.current=false;return true;
 }
 function reset(){setBeforeReset({topicId:topic.id,code,input});onChange({code:topic.example.code,input:topic.example.input});setError('');setMessage('Original example restored. Restore previous draft brings your code and input back.');}
 return <section id="reference-playground" className="ref-playground idle-workspace" aria-labelledby="ref-playground-title">
  <div className="ref-playground-heading"><div><p className="ref-eyebrow">TRY IT YOURSELF</p><h2 id="ref-playground-title">Your Python desk</h2></div><span role="status">{status==='loading'?'Loading Python…':busy?waiting?'Waiting for input…':'Running…':status==='unavailable'?'Python needs attention':'Python ready'}</span></div>
  <p>Edit this example and press F5. Your reference experiments save in this browser, separately from course work.</p>
  <div className="idle-editor-window"><div className="idle-window-title"><b>Python Editor</b><span>{topic.id}.py</span></div><div className="idle-toolbar" role="toolbar" aria-label="Reference editor tools"><button disabled={busy} onClick={()=>editor.current?.undo()}>Undo</button><button disabled={busy} onClick={()=>editor.current?.redo()}>Redo</button><button disabled={busy} onClick={()=>editor.current?.indent()}>Indent</button><button disabled={busy} onClick={()=>editor.current?.outdent()}>Dedent</button><button disabled={busy} onClick={()=>downloadFile(`reference-${topic.id}.py`,code)}>Save .py</button><button disabled={busy} onClick={reset}>Reset example</button>{beforeReset?.topicId===topic.id&&<button disabled={busy} onClick={()=>{onChange({code:beforeReset.code,input:beforeReset.input});setBeforeReset(null);setMessage('Previous draft restored.');}}>Restore previous draft</button>}</div>
  <Editor key={topic.id} ref={editor} value={code} onChange={value=>onChange({code:value.slice(0,12000)})} onRun={run} readOnly={busy} appearance="idle" fontSize={16} onCursor={setCursor}/><div className="idle-editor-status"><span>Ln {cursor.line}, Col {cursor.column}</span><span>Tab = 4 spaces · Escape then Tab leaves the editor</span></div></div>
  <div className="ref-run-controls"><button className="ref-primary" disabled={status!=='ready'} onClick={run}>Run Module <kbd>F5</kbd></button><button className="ref-outline" disabled={!busy} onClick={()=>runtime.current.stop()}>Stop</button></div>
  <fieldset className="ref-input-choice" disabled={busy}><legend>How should input() receive its lines?</legend><label><input type="radio" name="reference-input" checked={mode==='prepared'} onChange={()=>setMode('prepared')}/>Use example input</label><label><input type="radio" name="reference-input" checked={mode==='shell'} onChange={()=>setMode('shell')}/>Type in the Shell</label></fieldset>
  {mode==='prepared'&&<label className="ref-input-label" htmlFor="ref-example-input">Example input<span>Each input() reads the next line. Leave empty if no input is needed.</span><textarea id="ref-example-input" rows={3} spellCheck={false} value={input} disabled={busy} maxLength={4000} onChange={e=>onChange({input:e.target.value})}/></label>}
  <PythonShell key={topic.id} entries={entries} waiting={waiting} busy={busy} ready={status==='ready'} more={more} onSubmit={submit} onStop={()=>runtime.current.stop()}/>
  {message&&<p className="ref-run-message" role="status">{message}</p>}
  {error&&<div className="ref-error" role="alert"><b>Try one small fix</b><p>{friendlyError(error).tip}</p><details><summary>Full Python error</summary><pre>{error}</pre></details></div>}
  {status==='unavailable'&&<button className="ref-outline" onClick={()=>globalThis.crossOriginIsolated?runtime.current.start():location.reload()}>Try loading Python again</button>}
 </section>;
}
