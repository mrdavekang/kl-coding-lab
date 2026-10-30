import React,{useEffect,useState} from 'react';
import {ArrowRight,CheckCircle2,CodeXml} from 'lucide-react';
import {binarySorting} from './binarySorting.js';
import {PreparationApp} from '../mcc/PreparationApp.jsx';
import {createPreparationState,taskPassed} from '../mcc/state.js';
import {saveProfileLesson} from '../storage.js';
import {supportStatus,supportTotals} from './learningSupport.js';
import './practise.css';
const selected=()=>typeof location!=='undefined'&&new URLSearchParams(location.search).get('problem')==='binary-sorting';
export function MccPractise({profile,onLeave,onOpenMcc,onOpenMco}){
  const [opened,setOpened]=useState(selected);
  const state=createPreparationState(binarySorting),work=state.validatePreparation(profile.binarySortingWork),count=state.progress(work);
  const learning=supportTotals(binarySorting.tasks,work);
  useEffect(()=>{window.scrollTo({top:0});const back=()=>setOpened(selected());window.addEventListener('popstate',back);return()=>window.removeEventListener('popstate',back);},[]);
  useEffect(()=>{document.title=`KL Coding Lab · MCC Practise${opened?' · Binary Sorting':''}`;},[opened]);
  function open(current=work.current){history.pushState(null,'',state.preparationUrl(location.href,'problem',current));setOpened(true);window.scrollTo({top:0});}
  function home(){history.pushState(null,'',state.preparationUrl(location.href,'overview',work.current));setOpened(false);window.scrollTo({top:0});}
  if(opened)return <PreparationApp key="binary-sorting" problem={binarySorting} profile={profile} initialWork={{...profile.binarySortingWork,screen:'problem'}} onSave={next=>saveProfileLesson(profile,next,'binarySortingWork')} onLeave={onLeave} onOverview={home}/>;
  return <div className="prep-app practise-theme">
    <a className="prep-skip" href="#practice-main">Skip to courses</a>
    <header className="prep-topbar"><div className="prep-brand"><CodeXml size={25}/><span>KL <b>Coding Lab</b></span></div><nav aria-label="MCC Practise navigation"><button onClick={onOpenMcc}>MCC Preparation</button><button onClick={onOpenMco}>MCO Tryout</button><button onClick={onLeave}>Change week / student</button></nav></header>
    <div className="prep-student"><span><b>{profile.name}</b> · {profile.className}</span><span>Course progress saves in this browser.</span></div>
    <main id="practice-main" className="prep-main" tabIndex={-1}>
      <div className="practice-hero"><p className="prep-eyebrow">MCC PRACTISE · PYTHON</p><h1>Small programs.<br/><span>Plenty of practice.</span></h1><p>Type a small example, check what it means, then use the idea in your own program. Build towards Binary Sorting one skill at a time.</p></div>
      <section className="practice-course" aria-labelledby="binary-course-title"><p className="prep-eyebrow">COURSE · KS2 AND KS3 BEGINNERS</p><h2 id="binary-course-title">Binary Sorting</h2><p>{binarySorting.description}</p><div className="prep-badges"><span>{binarySorting.tasks.length} typing practices</span><span>{learning.questions} short questions</span><span>{binarySorting.tasks.length} program tasks</span><span>IDLE-style editor and Shell</span></div><div className="practice-support-overview"><span><b>{learning.typed} / {binarySorting.tasks.length}</b> typing examples matched</span><span><b>{learning.correct} / {learning.questions}</b> multiple-choice answers checked and correct</span><span><b>{count} / {binarySorting.tasks.length}</b> program checks passed</span></div><p className="practice-route-note">Start by following examples. Later, complete the gaps, combine the pieces and write your own solution. Every level stays open. Your typing, answers and program drafts save separately.</p><button className="prep-primary" onClick={()=>open()}>{count||Object.keys(work.drafts).length||Object.keys(work.practiceSupport||{}).length?'Continue Binary Sorting':'Start Exercise 1'}<ArrowRight size={18}/></button></section>
      <section className="practice-course-map" aria-labelledby="practice-map-title"><h2 id="practice-map-title">Your course</h2>{binarySorting.activities.map((activity,i)=><section className="practice-group" key={activity.id}><p className="prep-eyebrow">SECTION {i+1} · EXERCISES {activity.exercises[0].number}–{activity.exercises.at(-1).number}</p><h3>{activity.title}</h3><p>{activity.summary}</p><ol start={activity.exercises[0].number}>{activity.exercises.map(item=>{const learned=supportStatus(item,work.practiceSupport?.[item.id]);return <li key={item.id}><button onClick={()=>open(item.id)}><span>{item.title.slice(item.title.indexOf(' ')+1)}<small className="practice-map-status">Typing {learned.typed?'matched':'to try'} · Questions {learned.correct}/{learned.total} · Program {taskPassed(work,item)?'checked':'to try'}</small></span>{taskPassed(work,item)?<CheckCircle2 size={18} aria-label="Program passed"/>:<ArrowRight size={17}/>}</button></li>;})}</ol></section>)}</section>
    </main><footer className="prep-footer"><span>KL Coding Lab · MCC Practise</span><span>Type · Understand · Use · Run · Check</span></footer>
  </div>;
}
