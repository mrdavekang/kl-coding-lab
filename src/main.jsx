import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CodeXml, Play, Square, Check, ArrowRight, ArrowLeft, BookOpen, Flag, List, Lightbulb, RotateCcw, Download, Upload, IndentIncrease, IndentDecrease, Undo2, X, Clock, CheckCircle2, ChevronRight, Terminal, LoaderCircle, Send, HelpCircle, FileCode2, Plus } from 'lucide-react';
import { Editor } from './Editor.jsx';
import { PythonRuntime, friendlyError } from './runtime.js';
import { lesson, challenges, allTasks, lessonPlan } from './content.js';
import { downloadFile, saveProfileWork } from './storage.js';
import { StudentStart } from './StudentStart.jsx';
import { ReportPanel } from './ReportPanel.jsx';
import { recordAttempt, validateWork } from './evidence.js';
import './style.css';

function Modal({ title, children, onClose, wide = false }) {
  const ref = useRef(null);
  useEffect(() => { ref.current.showModal(); }, []);
  return <dialog ref={ref} className={wide ? 'modal wide' : 'modal'} onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) onClose(); }} aria-label={title}>
    <div className="modal-heading"><h2>{title}</h2><button className="icon-button" onClick={onClose} aria-label="Close"><X size={21}/></button></div>{children}
  </dialog>;
}

function LessonApp({ profile, initialWork, onSave, onLeave }) {
  const [work, setWork] = useState(initialWork);
  const [taskId, setTaskId] = useState(() => allTasks.some(x => x.id === initialWork.current) ? initialWork.current : 'hello');
  const [page, setPage] = useState('lesson');
  const [modal, setModal] = useState(null);
  const [runtimeState, setRuntimeState] = useState('loading');
  const [runtimeMessage, setRuntimeMessage] = useState('');
  const [consoleText, setConsoleText] = useState('');
  const [waiting, setWaiting] = useState(false);
  const [answer, setAnswer] = useState('');
  const [runError, setRunError] = useState(null);
  const [runDone, setRunDone] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [saved, setSaved] = useState(true);
  const [toast, setToast] = useState('');
  const [fontSize, setFontSize] = useState(17);
  const editor = useRef(), runtime = useRef(), inputRef = useRef(), consoleRef = useRef(), uploadRef = useRef();
  const latestWork = useRef(null);
  const active = useRef(null), current = useRef(null), stopReason = useRef('Program stopped. Your code is still here.');
  const task = allTasks.find(x => x.id === taskId) || lesson[0];
  const code = work.drafts?.[task.id] ?? task.starter;
  const busy = ['running', 'checking'].includes(runtimeState);
  const isChallenge = !!task.level;
  const index = lesson.findIndex(x => x.id === task.id);
  const hintCount = work.hints?.[task.id] || 0;
  const checked = work.passed?.[task.id] === code;
  const completed = lesson.filter(item => item.check && work.passed?.[item.id] === (work.drafts?.[item.id] ?? item.starter)).length;
  current.current = { task, code, busy, runtimeState };
  latestWork.current = { ...work, current: taskId };

  useEffect(() => { const timer = setTimeout(() => setSaved(onSave({ ...work, current: taskId })), 250); return () => clearTimeout(timer); }, [work, taskId]);
  useEffect(() => {
    const persist = () => onSave(latestWork.current);
    window.addEventListener('pagehide', persist);
    return () => { persist(); window.removeEventListener('pagehide', persist); };
  }, []);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(''), 4500); return () => clearTimeout(t); }, [toast]);
  useEffect(() => {
    runtime.current = new PythonRuntime({
      status: (status, message = '') => { setRuntimeState(status); setRuntimeMessage(message); if (status === 'unavailable') { setWaiting(false); setFeedback(null); } },
      output: text => { if (active.current?.kind === 'run') active.current.output += text; setConsoleText(old => old + text); },
      input: () => { setWaiting(true); setAnswer(''); },
      stopping: message => { stopReason.current = message; },
      finish: data => {
        setWaiting(false);
        if (active.current) { const attempt = active.current; setWork(old => recordAttempt(old, attempt, data)); }
        if (data.type === 'checked') {
          setFeedback(data.result);
          if (data.result.passed && active.current) {
            const item = active.current;
            setWork(old => ({ ...old, passed: { ...old.passed, [item.taskId]: item.code } }));
          }
        } else if (data.type === 'error') {
          if (data.kind === 'check') setFeedback({ passed: false, message: data.stopped ? stopReason.current : 'The checks could not finish. Read the error and try again.', error: data.stopped ? null : data.message, cases: [] });
          else if (data.stopped) { setConsoleText(old => old + '\n' + stopReason.current + '\n'); setRunError(null); }
          else setRunError({ ...friendlyError(data.message), message: data.message });
        } else setRunDone(true);
        active.current = null;
      },
    });
    runtime.current.start();
    return () => runtime.current.destroy();
  }, []);
  useEffect(() => {
    if (consoleRef.current) consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    if (waiting) {
      inputRef.current?.focus({ preventScroll: true });
      if (window.matchMedia('(max-width: 900px)').matches) inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [consoleText, waiting]);

  function changeCode(value) { setWork(old => ({ ...old, drafts: { ...old.drafts, [task.id]: value } })); setFeedback(null); }
  function selectTask(id) {
    if (runtime.current?.active) { setToast('Stop the running program before changing tasks.'); return; }
    setTaskId(id); setPage('lesson'); setModal(null); setFeedback(null); setRunError(null); setRunDone(false); setConsoleText(''); setWaiting(false);
    setWork(old => ({ ...old, visited: { ...old.visited, [id]: true } }));
  }
  function run(check = false) {
    const { task: liveTask, code: liveCode } = current.current;
    if (!runtime.current?.ready || runtime.current.active) return;
    if (check && !liveTask.check) return;
    active.current = { taskId: liveTask.id, code: liveCode, kind: check ? 'check' : 'run', startedAt: new Date().toISOString(), inputs: [], output: '' };
    stopReason.current = 'Program stopped. Your code is still here.';
    if (!check) { setConsoleText(''); setRunError(null); setRunDone(false); setWaiting(false); setAnswer(''); }
    else setFeedback(null);
    setWork(old => ({ ...old, attempted: { ...old.attempted, [liveTask.id]: true } }));
    runtime.current.execute(liveCode, check ? liveTask.check : null);
  }
  function submitAnswer(e) {
    e.preventDefault();
    try {
      if (runtime.current.answer(answer)) { if (active.current) { active.current.inputs.push(answer); active.current.output += answer + '\n'; } setConsoleText(old => old + answer + '\n'); setWaiting(false); setAnswer(''); }
    } catch (error) { setToast(error.message); }
  }
  function downloadCode() { downloadFile('kl-coding-' + task.id + '.py', code); setToast('Python file downloaded.'); }
  function backup() { downloadFile('kl-coding-lesson-1-backup.json', JSON.stringify({ format: 'kl-coding-lab-backup', version: 2, student: { name: profile.name, className: profile.className }, work: { ...work, drafts: work.drafts || {}, current: taskId } }, null, 2), 'application/json'); }
  async function importFile(e) {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.size > 5000000) { setToast('Choose a Python file or lesson backup smaller than 5 MB.'); e.target.value = ''; return; }
    try {
      const contents = await file.text();
      if (file.name.endsWith('.json')) {
        const payload = JSON.parse(contents);
        const imported = validateWork(payload.work || payload);
        setWork(old => ({ ...old, ...imported, drafts: { ...old.drafts, ...imported.drafts }, importedAt: new Date().toISOString() }));
        if (imported.current) setTaskId(imported.current);
        setToast('Lesson backup restored to ' + profile.name + '. Recorded checks are practice evidence.');
      } else { changeCode(contents); setToast('Python file opened in this task. Undo restores the previous code.'); }
      setFeedback(null); setModal(null);
    } catch (error) { setToast(error.message || 'That file could not be opened.'); }
    e.target.value = '';
  }
  function showHint() { setWork(old => ({ ...old, hints: { ...old.hints, [task.id]: Math.min(hintCount + 1, task.hints.length) } })); }

  return <>
    <header className="topbar">
      <a className="brand" href="#" onClick={e => { e.preventDefault(); setPage('lesson'); }} aria-label="KL Coding Lab home"><span className="brand-mark"><CodeXml size={25}/></span><span>KL <b>Coding Lab</b></span></a>
      <nav className="main-nav" aria-label="Main navigation"><button className={page === 'lesson' ? 'active' : ''} onClick={() => setPage('lesson')}><BookOpen size={18}/> Lesson</button><button className={page === 'challenges' ? 'active' : ''} onClick={() => setPage('challenges')}><Flag size={18}/> Challenges</button></nav>
      <button className="quiet-button lesson-plan" onClick={() => setModal('teacher')}><Clock size={18}/><span>60-minute lesson</span></button>
    </header>
    <main>
      <div className="student-bar"><div><span className="student-avatar" aria-hidden="true">{profile.name.slice(0, 1).toUpperCase()}</span><span><b>{profile.name}</b><small>{profile.className}</small></span><button className="text-button" disabled={busy} onClick={() => { if (onSave({ ...work, current: taskId })) onLeave(); else setToast('Saving is unavailable. Download your backup from My files before switching.'); }}>Switch student</button></div><button className="outline-button" onClick={() => setModal('report')}><FileCode2 size={18}/> My learning report</button></div>
      <div className="lesson-heading"><div><div className="eyebrow">LESSON 01 <span>·</span> 8 SEPTEMBER 2026</div><h1>{page === 'challenges' ? 'Choose your next challenge' : 'Your first Python program'}</h1></div><button className="outline-button" onClick={() => setModal('map')}><List size={18}/> Lesson map</button></div>

      {page === 'challenges' ? <section className="challenge-page">
        <p className="page-intro">Every level is open. Start where you feel ready, and use the learning cards whenever you need them.</p>
        <div className="challenge-grid">{challenges.map((item, n) => <article className={'challenge-card ' + item.colour} key={item.id}>
          <div className="challenge-top"><span className={'level-pill ' + item.colour}>{item.level}</span><span className="challenge-number">0{n + 1}</span></div>
          <h2>{item.title}</h2><p>{item.summary}</p><div className="concept-label">{item.conceptsLabel}</div>
          <button className="outline-button" onClick={() => selectTask(item.id)}>{work.drafts?.[item.id] !== undefined ? 'Continue challenge' : 'Open challenge'}<ArrowRight size={18}/></button>
          {work.passed?.[item.id] === (work.drafts?.[item.id] ?? item.starter) && <span className="challenge-passed"><CheckCircle2 size={16}/> Checks passed</span>}
        </article>)}</div>
        <div className="challenge-note"><Lightbulb size={22}/><div><b>Let the challenge grow with you.</b><p>Silver and Gold use lists, loops and grids. They can continue next lesson. These are our club’s practice routes.</p></div></div>
        <button className="text-button" onClick={() => setPage('lesson')}><ArrowLeft size={17}/> Back to my task</button>
      </section> : <>
        <div className="progress-strip"><div className="steps-track" aria-label="Lesson steps">{lesson.map((item, n) => <button key={item.id} aria-label={`${n + 1}. ${item.title}`} aria-current={task.id === item.id ? 'step' : undefined} className={task.id === item.id ? 'current' : work.passed?.[item.id] === (work.drafts?.[item.id] ?? item.starter) ? 'passed' : ''} onClick={() => selectTask(item.id)}>{work.passed?.[item.id] === (work.drafts?.[item.id] ?? item.starter) ? <Check size={13}/> : <span>{n + 1}</span>}</button>)}</div><span>{completed} of 6 practice checks passed</span></div>
        <div className="workspace">
          <section className="learning-panel" aria-label="Current learning card">
            <div className="card-meta"><span className={isChallenge ? 'level-pill ' + task.colour : 'card-type'}>{isChallenge ? task.level : task.phase}</span><span><Clock size={14}/>{task.time}</span></div>
            <h2>{task.title}</h2><p className="card-intro">{task.intro}</p>
            <button className="go-to-code outline-button" onClick={() => document.querySelector('.coding-panel').scrollIntoView({ behavior: 'smooth', block: 'start' })}><CodeXml size={17}/> Go to my editor <ArrowRight size={17}/></button>
            <div className="learn-box"><div className="box-label"><BookOpen size={16}/> LEARN</div><p>{task.learn}</p>{task.example && <pre className="example"><code>{task.example}</code></pre>}{task.vocab && <p className="vocab"><b>{task.vocab[0]}</b> · {task.vocab[1]}</p>}</div>
            {task.concepts && <div className="concepts">{task.concepts.map(([label, text]) => <div key={label}><b>{label}</b><p>{text}</p></div>)}</div>}
            <div className="task-box"><div className="box-label"><Flag size={16}/> YOUR TASK</div><h3>{task.task}</h3><ol>{task.steps.map(step => <li key={step}>{step}</li>)}</ol></div>
            {task.sample && <div className="samples">{task.sample.map((sample, n) => <div key={n} className="sample"><div><b>Input {n + 1}</b><pre>{sample.input}</pre></div><ArrowRight size={17}/><div><b>Output</b><pre>{sample.output}</pre></div></div>)}</div>}
            {task.kind === 'pitstop' && <div className="pitstop-choices">{[
              ['support', 'I need a hand', 'Open a small input example.', 'input'],
              ['practice', 'I want more practice', 'Try the club welcome again.', 'welcome'],
              ['stretch', 'I’m ready to stretch', 'Explore an open challenge.', 'challenges'],
            ].map(([id, label, detail, destination]) => <button key={id} onClick={() => { setWork(old => ({ ...old, pitstop: id })); destination === 'challenges' ? setPage('challenges') : selectTask(destination); }}><span><b>{label}</b><small>{detail}</small></span><ArrowRight size={18}/></button>)}</div>}
            {task.kind === 'choose' && <button className="primary-button full" onClick={() => setPage('challenges')}>Explore challenges <ArrowRight size={18}/></button>}
            {task.kind === 'reflect' && <div className="reflection"><label htmlFor="reflection">One test I tried… My next step…</label><textarea id="reflection" rows={4} maxLength={6000} value={work.reflection || ''} onChange={e => setWork(old => ({ ...old, reflection: e.target.value }))} placeholder="I tested… because… Next I want to…"/><button className="primary-button" onClick={() => setModal('report')}><Download size={17}/> Get my learning report</button></div>}
            <div className="hint-box"><button className="hint-toggle" onClick={showHint} disabled={hintCount >= task.hints.length}><span><Lightbulb size={18}/>{hintCount ? 'Show another hint' : 'Need a small hint?'}</span><Plus size={17}/></button>{task.hints.slice(0, hintCount).map((hint, n) => <p key={hint}><b>Hint {n + 1}.</b> {hint}</p>)}</div>
            {task.extension && <details className="extension"><summary>Take it further</summary><p>{task.extension}</p></details>}
            <div className="card-bottom"><button className="text-button" disabled={index === 0} onClick={() => isChallenge ? setPage('challenges') : selectTask(lesson[Math.max(0, index - 1)].id)}><ArrowLeft size={17}/> Back</button><span>{isChallenge ? 'Your route, your pace' : `Card ${index + 1} of ${lesson.length}`}</span><button className="primary-button" onClick={() => isChallenge ? setPage('challenges') : index === lesson.length - 1 ? setModal('save') : selectTask(lesson[index + 1].id)}>{isChallenge ? 'All challenges' : index === lesson.length - 1 ? 'Save my work' : 'Next card'}<ArrowRight size={17}/></button></div>
          </section>

          <section className="coding-panel" aria-label="Python workspace">
            <div className="mobile-task-summary"><b>{task.title}</b><p>{task.task}</p><button className="text-button" onClick={() => document.querySelector('.learning-panel').scrollIntoView({ behavior: 'smooth', block: 'start' })}><ArrowLeft size={15}/> Read the card</button></div>
            <div className="editor-frame"><div className="editor-heading"><span className="file-label"><span className="py-icon">PY</span> main.py</span><span className={'runtime-status ' + runtimeState}>{runtimeState === 'loading' ? <LoaderCircle size={13} className="spin"/> : <span className="status-dot"/>}{({loading:'Starting Python…', ready:'Python ready', running:'Running', checking:'Checking', unavailable:'Python needs attention'})[runtimeState]}</span></div>
              <div className="editor-tools"><div><button onClick={() => editor.current?.indent()} aria-label="Indent code"><IndentIncrease size={17}/><span>Indent</span></button><button onClick={() => editor.current?.outdent()} aria-label="Outdent code"><IndentDecrease size={17}/><span>Outdent</span></button><button onClick={() => editor.current?.undo()} aria-label="Undo code change"><Undo2 size={17}/><span>Undo</span></button></div><div><button onClick={() => setFontSize(size => size === 21 ? 15 : size + 2)} aria-label="Change code text size">A<span className="small-a">A</span></button><button onClick={() => setModal('reset')} disabled={busy} aria-label="Reset this task"><RotateCcw size={17}/></button></div></div>
              <Editor key={task.id} ref={editor} value={code} onChange={changeCode} onRun={() => run()} fontSize={fontSize}/>
              <div className="runbar"><button className="run-button" disabled={runtimeState !== 'ready'} onClick={() => run()}><Play size={17} fill="currentColor"/>Run</button><button className="stop-button" disabled={!busy} onClick={() => runtime.current.stop()}><Square size={13} fill="currentColor"/>Stop</button><span className="run-shortcut">Ctrl / ⌘ + Enter</span><button className="editor-download" onClick={downloadCode} aria-label="Download Python file"><Download size={18}/></button></div>
            </div>
            <div className="console-frame"><div className="console-heading"><span><Terminal size={17}/> Console</span><span className={waiting ? 'waiting-label' : 'console-label'}>{waiting ? 'Waiting for your answer' : runDone ? 'Run finished' : 'Program output'}</span></div>
              <div className="console-body" ref={consoleRef} tabIndex={0} aria-label="Program output">
                {consoleText ? <pre>{consoleText}</pre> : <p className="console-empty">{runtimeState === 'loading' ? 'Python is loading. You can read the card while you wait.' : busy ? 'Your program is running…' : 'Press Run to see what your program does.'}</p>}
                {runError && <div className="python-error" role="alert"><b>{runError.line ? `Check line ${runError.line}` : 'Python found an error'}</b><p>{runError.tip}</p><details><summary>Read the Python error</summary><pre>{runError.message}</pre></details></div>}
              </div>
              {waiting && <form className="console-input" onSubmit={submitAnswer}><span aria-hidden="true">›</span><label className="sr-only" htmlFor="python-input">Your answer to the Python prompt</label><input ref={inputRef} id="python-input" value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Type an answer, then press Enter" autoComplete="off" autoCapitalize="off" spellCheck="false" enterKeyHint="send"/><button type="submit" aria-label="Send answer"><Send size={18}/></button></form>}
              <div role="status" className="sr-only">{waiting ? 'Python is waiting for your answer in the console.' : runDone ? 'Program finished.' : ''}</div>
              {runtimeState === 'unavailable' && <div className="runtime-error" role="alert"><p>{runtimeMessage}</p><button className="outline-button" onClick={() => { if (globalThis.crossOriginIsolated) runtime.current.start(); else location.reload(); }}>Try loading Python again</button></div>}
            </div>
            <div className="check-panel"><div><CheckCircle2 size={20}/><span>{checked ? 'Your current code passed' : task.check ? 'Ready to test your work?' : 'A space to experiment'}</span></div><button className="outline-button" onClick={() => run(true)} disabled={!task.check || runtimeState !== 'ready'}>{runtimeState === 'checking' ? <LoaderCircle size={16} className="spin"/> : <Check size={16}/>}{runtimeState === 'checking' ? 'Checking…' : 'Check work'}</button></div>
            {task.goal && <p className="check-goal">{task.goal}</p>}
            {feedback && <div className={'feedback ' + (feedback.passed ? 'success' : 'retry')} role="status"><b>{feedback.message}</b>{feedback.error && <details><summary>Python error</summary><pre>{feedback.error}</pre></details>}{feedback.cases?.map((item, n) => <details key={n}><summary><span>{item.passed ? '✓' : '○'} Test {n + 1}</span><span>{item.passed ? 'Passed' : 'Try again'}</span></summary><div className="test-details"><p><b>Input</b></p><pre>{item.input || '(no input)'}</pre><p><b>Expected</b></p><pre>{item.expected}</pre><p><b>Your output</b></p><pre>{item.actual || '(no output)'}</pre>{item.error && <pre>{item.error}</pre>}</div></details>)}</div>}
            <details className="explain-program" key={'explain-' + task.id}><summary>Explain my program <span>Optional · included in my report</span></summary><label htmlFor="explanation">How does your code work? What did you change or test?</label><textarea id="explanation" rows={3} maxLength={3000} value={work.explanations?.[task.id] || ''} onChange={e => setWork(old => ({ ...old, explanations: { ...old.explanations, [task.id]: e.target.value } }))} placeholder="My variable keeps… When I enter… I fixed…"/></details>
            <div className="workspace-foot"><span>{saved ? <Check size={14}/> : <HelpCircle size={14}/>} {saved ? 'Saved on this device' : 'Saving unavailable — download your work'}</span><button className="text-button" onClick={() => setModal('save')}>My files <ChevronRight size={15}/></button></div>
            <p className="keyboard-note">Tab indents · Shift + Tab outdents · Escape, then Tab leaves the editor</p>
          </section>
        </div>
      </>}
    </main>
    <footer><span>KL Coding Cup · Club practice</span><button onClick={() => setModal('help')}><HelpCircle size={16}/> Help & expectations</button><span className="footer-method">Read · Run · Change · Build · Check</span></footer>
    <input className="sr-only" ref={uploadRef} type="file" accept=".py,.txt,.json" onChange={importFile} aria-label="Import Python code or a lesson backup"/>
    {toast && <div className="toast" role="status">{toast}</div>}
    {modal === 'map' && <Modal title="Your lesson map" onClose={() => setModal(null)}><p className="modal-intro">Go straight to any card. Your draft stays with its task.</p><div className="lesson-map">{lesson.map((item, n) => <button key={item.id} className={task.id === item.id ? 'selected' : ''} onClick={() => selectTask(item.id)}><span className="map-number">{n + 1}</span><span><b>{item.title}</b><small>{item.phase} · {item.time}</small></span>{work.passed?.[item.id] === (work.drafts?.[item.id] ?? item.starter) ? <CheckCircle2 size={19}/> : <ChevronRight size={19}/>}</button>)}</div></Modal>}
    {modal === 'reset' && <Modal title="Reset this task?" onClose={() => setModal(null)}><p>Your editor will return to this task’s starter code. You can use Undo to recover your current version.</p><div className="modal-actions"><button className="outline-button" onClick={() => setModal(null)}>Keep my code</button><button className="primary-button" onClick={() => { changeCode(task.starter); setModal(null); setToast('Starter code restored. Undo brings back your last version.'); }}>Reset task</button></div></Modal>}
    {modal === 'report' && <Modal title="My learning report" onClose={() => setModal(null)}><ReportPanel profile={profile} work={work} setWork={setWork} busy={busy} onBackup={backup}/></Modal>}
    {modal === 'save' && <Modal title="Keep your work" onClose={() => setModal(null)}><p>Your work is saved under {profile.name} in this browser. Download a backup to move to another device or protect your work if browser data is cleared.</p><div className="file-actions"><button onClick={() => setModal('report')}><FileCode2/><span><b>My learning report (PDF)</b><small>Code, tests and reflection to upload to Teams</small></span><ChevronRight size={18}/></button><button onClick={downloadCode}><FileCode2/><span><b>Download this Python file</b><small>{task.title}</small></span><Download size={18}/></button><button onClick={backup}><Download/><span><b>Download my lesson backup</b><small>All drafts, progress and recorded attempts</small></span><ChevronRight size={18}/></button><button disabled={busy} onClick={() => { backup(); uploadRef.current.click(); }}><Upload/><span><b>Import a file or backup</b><small>Your current work downloads first. A backup restores its progress and merges its drafts.</small></span><ChevronRight size={18}/></button></div><div className="new-learner"><h3>Sharing this device?</h3><p>Download your backup and report before switching. Saved profiles are visible to other people using this browser.</p><button className="outline-button" disabled={busy} onClick={() => { if (onSave({ ...work, current: taskId })) onLeave(); else setToast('Download a backup first: this browser could not save your work.'); }}>Switch student</button></div></Modal>}
    {modal === 'help' && <Modal title="Make this your learning space" onClose={() => setModal(null)}><div className="help-section"><h3>Try, test and explain</h3><p>Errors are clues. Make a small change, run again and explain what happened. Use the hints or ask your teacher when you need help.</p><h3>Working together</h3><p>The coder types and runs. The checker asks questions and suggests test inputs. Swap roles, and each show something you can do independently.</p><h3>Using the editor</h3><p>Use four spaces for a Python block. Tab and Shift + Tab indent and outdent; the buttons do the same on a tablet. Press Escape, then Tab to move out of the editor.</p><h3>Run and Check work</h3><p>Run uses your answers in the console. Check work tries prepared inputs separately. You can keep running and improving your code after any result.</p><h3>Keeping your work</h3><p>Drafts stay in this browser. Use My files to download them before changing devices. The lesson needs an internet connection to load Python.</p></div></Modal>}
    {modal === 'teacher' && <Modal title="Lesson 1 · 60-minute guide" wide onClose={() => setModal(null)}><p className="modal-intro">8 September 2026 · KS2–KS4 · Input, output and variables</p><div className="teacher-objective"><b>Learning intention</b><p>Write and test a Python program that takes input and produces useful output.</p></div><div className="table-scroll"><table><thead><tr><th>Minutes</th><th>Phase</th><th>Pupils</th><th>Teacher</th></tr></thead><tbody>{lessonPlan.map(row => <tr key={row[0]}>{row.map((cell, i) => <td key={i}>{cell}</td>)}</tr>)}</tbody></table></div><div className="teacher-differentiation"><div><b>KS2 starting support</b><p>Short prompts, visible vocabulary and starter lines.</p></div><div><b>KS3 starting support</b><p>Less starter code and an optional numerical-input primer.</p></div><div><b>KS4 starting support</b><p>Fast access to list and grid challenges; explain test choices.</p></div></div><p>Any learner can use any route. Keep whole-class explanation to about 10–12 minutes; coach individuals during practice. Under-13s follow the planned school practice and internal competition route.</p></Modal>}
  </>;
}

function App() {
  const [profile, setProfile] = useState(null);
  return profile ? <LessonApp key={profile.id} profile={profile} initialWork={profile.work || {}} onSave={work => saveProfileWork(profile, work)} onLeave={() => setProfile(null)}/> : <StudentStart onStart={setProfile}/>;
}
const root = import.meta.hot?.data.root || createRoot(document.getElementById('root'));
if (import.meta.hot) import.meta.hot.data.root = root;
root.render(<App/>);
