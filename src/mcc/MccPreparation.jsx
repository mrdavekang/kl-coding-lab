import React,{useEffect,useState} from 'react';
import {ArrowRight,BookOpen,CheckCircle2,CodeXml} from 'lucide-react';
import {problems,problemById} from './catalog.js';
import {createPreparationState,activityPassed} from './state.js';
import {saveProfileLesson} from '../storage.js';
import {PreparationApp} from './PreparationApp.jsx';

const selectedProblem = () => typeof location==='undefined' ? null : problemById(new URLSearchParams(location.search).get('problem')) || null;

export function MccPreparation({profile,onLeave,onOpenMco}) {
  const [problem,setProblem]=useState(selectedProblem);
  useEffect(()=>{
    const back=()=>setProblem(selectedProblem());
    window.addEventListener('popstate',back);
    return()=>window.removeEventListener('popstate',back);
  },[]);
  useEffect(()=>{document.title=`KL Coding Lab · MCC Preparation${problem?' · '+problem.shortTitle:''}`;},[problem]);
  function open(next){
    const state=createPreparationState(next),work=state.validatePreparation(profile[next.storageField]);
    history.pushState(null,'',state.preparationUrl(location.href,'problem',work.current));
    setProblem(next);window.scrollTo({top:0});
  }
  function home(){
    const url=new URL(location.href);
    for(const key of ['problem','activity','exercise'])url.searchParams.delete(key);
    history.pushState(null,'',url);setProblem(null);window.scrollTo({top:0});
  }
  if(problem)return <PreparationApp key={problem.problemId} problem={problem} profile={profile} initialWork={{...profile[problem.storageField],screen:'problem'}} onSave={work=>saveProfileLesson(profile,work,problem.storageField)} onLeave={onLeave} onOverview={home}/>;
  return <div className="prep-app">
    <a className="prep-skip" href="#prep-main">Skip to preparation</a>
    <header className="prep-topbar"><div className="prep-brand"><CodeXml size={25}/><span>KL <b>Coding Lab</b></span></div><nav aria-label="Preparation navigation">{onOpenMco&&<button onClick={onOpenMco}>MCO Tryout</button>}<button onClick={onLeave}>Change week / student</button></nav></header>
    <div className="prep-student"><span><b>{profile.name}</b> · {profile.className}</span><span>Each problem keeps its own work in this browser.</span></div>
    <main id="prep-main" className="prep-main" tabIndex={-1}>
      <div className="prep-hero"><div><p className="prep-eyebrow">AFTER WEEK 5 · MCC PREPARATION</p><h1>Small steps.<br/><span>A problem you can solve.</span></h1><p>Choose a problem. Understand its input, break down the processing and decide its output. Find the Python you need, then predict and test.</p><div className="prep-badges"><span>{problems.length} problem pathways</span><span>5 activities in each</span><span>Work at your pace</span></div></div><div className="prep-method"><BookOpen size={24}/><h2>Your problem-solving routine</h2><ol><li>Understand</li><li>Break down</li><li>Find out</li><li>Try</li><li>Check</li></ol><p>Use several sessions if you need them. Explain each small program before combining the pieces.</p></div></div>
      <div className="prep-catalog">{problems.map(entry=>{
        const state=createPreparationState(entry),work=state.validatePreparation(profile[entry.storageField]),count=state.progress(work);
        return <section className="prep-problem-card" key={entry.problemId}><div><p className="prep-eyebrow">PAST QUESTION · PYTHON</p><h2>{entry.problemTitle}</h2><p>{entry.description}</p><p className="prep-muted">{count} of {entry.tasks.length} practice checks passed · 5 activities</p><button className="prep-primary" onClick={()=>open(entry)}>{count||Object.keys(work.drafts).length?'Continue':'Start'} {entry.shortTitle}<ArrowRight size={18}/></button></div><ol className="prep-overview-path" aria-label={`${entry.shortTitle} activities`}>{entry.activities.map((activity,i)=><li key={activity.id}><span className={activityPassed(work,activity)?'is-passed':''}>{activityPassed(work,activity)?<CheckCircle2 size={19}/>:i+1}</span><div><b>{activity.title}</b><p>{activity.summary}</p></div></li>)}</ol></section>;
      })}</div>
      {onOpenMco&&<section className="prep-section"><h2>Continue with MCO Tryout</h2><p>Explore Two Pointers through paper reasoning, both route orders and sixteen small Try tasks before the complete past question.</p><button className="prep-outline" onClick={onOpenMco}>Open MCO Tryout<ArrowRight size={18}/></button></section>}
      <section className="prep-teacher-note"><h2>How to use these paths</h2><p>Activities 1–4 build skills through short explanations, examples, diagrams and practice. Activity 5 brings those skills together in the past question. Work through the exercises in order and revisit any step.</p><p>Building Fences starts with print and input. Supplied programs, one highlighted change and optional planning notes help you start writing. Its final question also has a supported starter; try writing it again with less help when ready.</p><p>Corner Cover and Collatz follow your teacher’s step-by-step solutions. Collatz builds from reading and changing one number to updating a list, repeating rounds and calculating the final total.</p><p>The checks give classroom feedback and do not award official MCC points or submit competition work.</p></section>
    </main><footer className="prep-footer"><span>KL Coding Lab · MCC Preparation</span><span>Understand → Break down → Find out → Try → Check</span></footer>
  </div>;
}
