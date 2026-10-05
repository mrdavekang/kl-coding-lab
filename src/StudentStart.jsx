import React, { useState } from 'react';
import { CodeXml, ArrowRight, BookOpen, CheckCircle2, FileCheck2, UserRound, ChevronRight } from 'lucide-react';
import { createProfile, listProfiles, legacyWorkAvailable } from './storage.js';
import { stats as week2Stats } from './week2/review.js';
import { coreChecks } from './week2/content.js';
import { progress as week3Progress } from './week3/state.js';
import { progress as week4Progress } from './week4/state.js';
import { progress as week5Progress } from './week5/state.js';
import { progressSummary } from './evidence.js';

export function StudentStart({ onStart, week = 1, onWeekChange }) {
  const [name, setName] = useState('');
  const [className, setClassName] = useState('');
  const [error, setError] = useState('');
  const [keepLegacy, setKeepLegacy] = useState(false);
  const [profiles] = useState(listProfiles);
  const [hasLegacy] = useState(legacyWorkAvailable);
  function submit(e) {
    e.preventDefault(); setError('');
    try { onStart(createProfile(name, className, keepLegacy)); }
    catch (err) { setError(err.message); }
  }
  return <div className={`welcome-page week-${week}`}>
    <header className="topbar"><div className="brand"><span className="brand-mark"><CodeXml size={25}/></span><span>KL <b>Coding Lab</b></span></div><span className="welcome-club">Your ideas. Your code.</span></header>
    <main className="welcome-main">
      <section className="welcome-intro"><div className="eyebrow">YOUR PYTHON JOURNEY STARTS HERE</div><h1>A small start.<br/><span>A new possibility.</span></h1><p>Read a little. Try an idea. Make it your own.</p><div className="welcome-lesson"><span className="welcome-code" aria-hidden="true"><CodeXml size={32}/></span><div><small>WEEK {String(week).padStart(2,"0")} · 60 MINUTES</small><h2>{week === 5 ? "Counters, IDE practice & MCC readiness" : week === 4 ? "Conditions, counting & MCC grids" : week === 3 ? "Weeks 1 + 2 programming practice" : week === 2 ? "Lists, loops & running totals" : "Your first Python program"}</h2><p>{week === 5 ? "Read · Trace · Run · Save · Choose school or home." : week === 4 ? "Read · Study an example · Trace every iteration · Code." : week === 3 ? "Familiar skills · New scenarios · Increasing levels." : week === 2 ? "Follow each line. Explain each iteration." : "Input, output and variables"}</p></div></div><ul className="welcome-benefits"><li><BookOpen size={20}/><span>Short learning cards, at your pace.</span></li><li><CheckCircle2 size={20}/><span>Every challenge level is open to you.</span></li><li><FileCheck2 size={20}/><span>Keep a PDF of what you learned.</span></li></ul></section>
      <section className="student-entry" aria-labelledby="student-start-title"><span className="entry-icon"><UserRound size={24}/></span><h2 id="student-start-title">Let’s get you started</h2><p>Use the name and class your teacher recognises.</p><div className="week-picker" role="group" aria-label="Choose your week"><button type="button" aria-pressed={week===1} onClick={()=>onWeekChange?.(1)}><b>Week 1</b>Input, output & variables</button><button type="button" aria-pressed={week===2} onClick={()=>onWeekChange?.(2)}><b>Week 2</b>Lists, loops & totals</button><button type="button" aria-pressed={week===3} onClick={()=>onWeekChange?.(3)}><b>Week 3</b>Weeks 1 + 2 practice</button><button type="button" aria-pressed={week===4} onClick={()=>onWeekChange?.(4)}><b>Week 4</b>Conditions & MCC grids</button><button type="button" aria-pressed={week===5} onClick={()=>onWeekChange?.(5)}><b>Week 5</b>Counters, IDEs & MCC</button></div><form onSubmit={submit}><label htmlFor="student-name">Your name</label><input id="student-name" name="student-name" value={name} onChange={e => setName(e.target.value)} required maxLength={80} autoComplete="off" placeholder="e.g. Alex Tan"/><label htmlFor="student-class">Your class</label><input id="student-class" name="student-class" value={className} onChange={e => setClassName(e.target.value)} required maxLength={50} autoComplete="off" placeholder="e.g. 6A, 8B or 10C"/>{hasLegacy && <label className="legacy-choice"><input type="checkbox" checked={keepLegacy} onChange={e => setKeepLegacy(e.target.checked)}/><span>Keep the work already on this browser with my profile, if it is mine.</span></label>}{error && <p className="entry-error" role="alert">{error}</p>}<button type="submit" className="primary-button full">Start my lesson <ArrowRight size={18}/></button></form><p className="local-save-note">Your progress saves in <b>this browser</b>. Download a lesson backup to continue on another device. This is a local profile; anyone using this browser can open it.</p></section>
      {profiles.length > 0 && <section className="saved-students" aria-labelledby="saved-title"><div><h2 id="saved-title">Coming back?</h2><p>Choose your own saved work on this browser.</p></div><div className="saved-profile-grid">{profiles.map(profile => { const stats = week === 5 ? {passed:week5Progress(profile.week5Work || {})} : week === 4 ? {passed:week4Progress(profile.week4Work || {})} : week === 3 ? {passed:week3Progress(profile.week3Work || {})} : week === 2 ? week2Stats(profile.week2Work || {}) : progressSummary(profile.work || {}); return <button className="saved-profile" key={profile.id} onClick={() => onStart(profile)} aria-label={`Continue ${profile.name}, ${profile.className}`}><span className="student-avatar">{profile.name.slice(0, 1).toUpperCase()}</span><span><b>{profile.name}</b><small>{profile.className} · {stats.passed}/{week === 5 ? 6 : week === 4 ? 8 : week === 3 ? 10 : week === 2 ? coreChecks : 6} practice checks</small></span><ChevronRight size={20}/></button>; })}</div></section>}
    </main><footer><span>KL Coding Cup · Club practice</span><span>Learn something. Build something. Explain it.</span></footer>
  </div>;
}
