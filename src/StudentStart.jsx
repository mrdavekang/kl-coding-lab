import React, { useState } from 'react';
import { CodeXml, ArrowRight, BookOpen, CheckCircle2, FileCheck2, UserRound, ChevronRight } from 'lucide-react';
import { createProfile, listProfiles, legacyWorkAvailable } from './storage.js';
import { progressSummary } from './evidence.js';

export function StudentStart({ onStart }) {
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
  return <div className="welcome-page">
    <header className="topbar"><div className="brand"><span className="brand-mark"><CodeXml size={25}/></span><span>KL <b>Coding Lab</b></span></div><span className="welcome-club">Your ideas. Your code.</span></header>
    <main className="welcome-main">
      <section className="welcome-intro"><div className="eyebrow">YOUR PYTHON JOURNEY STARTS HERE</div><h1>A small start.<br/><span>A new possibility.</span></h1><p>Read a little. Try an idea. Make it your own.</p><div className="welcome-lesson"><span className="welcome-code" aria-hidden="true"><CodeXml size={32}/></span><div><small>LESSON 01 · 60 MINUTES</small><h2>Your first Python program</h2><p>Input, output and variables</p></div></div><ul className="welcome-benefits"><li><BookOpen size={20}/><span>Short learning cards, at your pace.</span></li><li><CheckCircle2 size={20}/><span>Every challenge level is open to you.</span></li><li><FileCheck2 size={20}/><span>Keep a PDF of what you learned.</span></li></ul></section>
      <section className="student-entry" aria-labelledby="student-start-title"><span className="entry-icon"><UserRound size={24}/></span><h2 id="student-start-title">Let’s get you started</h2><p>Use the name and class your teacher recognises.</p><form onSubmit={submit}><label htmlFor="student-name">Your name</label><input id="student-name" name="student-name" value={name} onChange={e => setName(e.target.value)} required maxLength={80} autoComplete="off" placeholder="e.g. Alex Tan"/><label htmlFor="student-class">Your class</label><input id="student-class" name="student-class" value={className} onChange={e => setClassName(e.target.value)} required maxLength={50} autoComplete="off" placeholder="e.g. 6A, 8B or 10C"/>{hasLegacy && <label className="legacy-choice"><input type="checkbox" checked={keepLegacy} onChange={e => setKeepLegacy(e.target.checked)}/><span>Keep the work already on this browser with my profile, if it is mine.</span></label>}{error && <p className="entry-error" role="alert">{error}</p>}<button type="submit" className="primary-button full">Start my lesson <ArrowRight size={18}/></button></form><p className="local-save-note">Your progress saves in <b>this browser</b>. Download a lesson backup to continue on another device. This is a local profile; anyone using this browser can open it.</p></section>
      {profiles.length > 0 && <section className="saved-students" aria-labelledby="saved-title"><div><h2 id="saved-title">Coming back?</h2><p>Choose your own saved work on this browser.</p></div><div className="saved-profile-grid">{profiles.map(profile => { const stats = progressSummary(profile.work || {}); return <button className="saved-profile" key={profile.id} onClick={() => onStart(profile)} aria-label={`Continue ${profile.name}, ${profile.className}`}><span className="student-avatar">{profile.name.slice(0, 1).toUpperCase()}</span><span><b>{profile.name}</b><small>{profile.className} · {stats.passed}/6 practice checks</small></span><ChevronRight size={20}/></button>; })}</div></section>}
    </main><footer><span>KL Coding Cup · Club practice</span><span>Learn something. Build something. Explain it.</span></footer>
  </div>;
}
