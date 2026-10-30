import React, {useEffect, useRef, useState} from 'react';

export function PythonShell({entries, waiting, busy, ready, more, onSubmit, onStop, focusOnReady=true}) {
  const [value,setValue]=useState(''), [history,setHistory]=useState([]), [historyIndex,setHistoryIndex]=useState(null);
  const field=useRef(), transcript=useRef(), pendingDraft=useRef('');
  const canType=waiting||ready;
  useEffect(()=>{
    if(!focusOnReady)return;
    if(waiting||ready&&entries.length>0)field.current?.focus({preventScroll:!waiting});
    if(waiting||ready&&!more)setValue('');
  },[waiting,ready,more,focusOnReady]);
  useEffect(()=>{if(transcript.current)transcript.current.scrollTop=transcript.current.scrollHeight;},[entries]);
  function submit(event){
    event.preventDefault();if(!canType)return;
    if(onSubmit(value)===false)return;
    if(!waiting&&value.trim())setHistory(old=>[...old.slice(-49),value]);
    setHistoryIndex(null);pendingDraft.current='';
    const indent=value.match(/^ */)?.[0]||'';
    setValue(waiting?'':indent+(value.trimEnd().endsWith(':')?'    ':''));
  }
  function keyDown(event){
    if(event.key==='Enter'&&!event.shiftKey){submit(event);return;}
    if(event.key==='Tab'){
      event.preventDefault();const start=event.currentTarget.selectionStart,end=event.currentTarget.selectionEnd;
      setValue(value.slice(0,start)+'    '+value.slice(end));
      requestAnimationFrame(()=>field.current?.setSelectionRange(start+4,start+4));return;
    }
    if(!waiting&&!more&&!value.includes('\n')&&['ArrowUp','ArrowDown'].includes(event.key)&&history.length){
      event.preventDefault();
      if(historyIndex===null)pendingDraft.current=value;
      const next=event.key==='ArrowUp'?Math.max(0,(historyIndex??history.length)-1):Math.min(history.length,(historyIndex??history.length)+1);
      setHistoryIndex(next);setValue(next===history.length?pendingDraft.current:history[next]);
    }
    if(event.key==='c'&&event.ctrlKey&&busy&&event.currentTarget.selectionStart===event.currentTarget.selectionEnd){event.preventDefault();onStop();}
  }
  return <section className="idle-shell" aria-label="Python Shell">
    <div className="idle-window-title"><b>Python Shell</b><span role="status">{waiting?'Waiting for your input':busy?'Python is working…':ready?'Ready for a command':'Loading Python…'}</span></div>
    <pre ref={transcript} className="idle-transcript" aria-label="Python Shell transcript" tabIndex={0}>{entries.length?entries.map((entry,i)=><span key={i} className={`idle-${entry.kind}`}>{entry.text}</span>):<span className="idle-meta">Your program will run here. You can also try a command such as 2 + 3.</span>}</pre>
    <form className={`idle-prompt ${waiting?'idle-waiting':''}`} onSubmit={submit}>
      <span aria-hidden="true">{waiting?'':more?'...':'>>>'}</span>
      <label className="idle-sr-only" htmlFor="idle-shell-entry">{waiting?'Answer for input()':'Python Shell command'}</label>
      <textarea ref={field} id="idle-shell-entry" rows={1} spellCheck={false} autoCapitalize="off" autoCorrect="off" value={value} disabled={!canType} onChange={event=>setValue(event.target.value)} onKeyDown={keyDown} placeholder={waiting?'Type your answer, then press Enter':more?'Continue your block; an empty line finishes it':ready?'Try a Python command':'Loading Python…'} maxLength={16000}/>
      <button type="submit" disabled={!canType}>{waiting?'Enter input':'Enter'}</button>
    </form>
    <p className="idle-shell-help">{waiting?'Your program has reached input(). Enter one line, just as you would in IDLE.':more?'Indented lines belong to the block. Press Enter on an empty line to finish.':'>>> tries one command. ↑ recalls a previous command. Run Module starts your program again.'}</p>
  </section>;
}
