import React,{useEffect,useState} from 'react';
import {ArrowRight,CheckCircle2,CodeXml} from 'lucide-react';
import {practiceCourses,practiceCourse} from './catalog.js';
import {PreparationApp} from '../mcc/PreparationApp.jsx';
import {createPreparationState,taskPassed} from '../mcc/state.js';
import {saveProfileLesson} from '../storage.js';
import {supportStatus,supportTotals} from './learningSupport.js';
import {ReferenceLink} from '../reference/ReferenceLink.jsx';
import {PlaygroundLink} from '../playground/PlaygroundLink.jsx';
import './practise.css';
const selected=()=>typeof location!=='undefined'?practiceCourse(new URLSearchParams(location.search).get('problem'))?.problemId||null:null;
export function MccPractise({profile,onLeave,onOpenMcc,onOpenMco}){
 const [opened,setOpened]=useState(selected);
 useEffect(()=>{window.scrollTo({top:0});const back=()=>setOpened(selected());window.addEventListener('popstate',back);return()=>window.removeEventListener('popstate',back);},[]);
 useEffect(()=>{document.title=`KL Coding Lab · MCC Practise${opened?' · '+practiceCourse(opened).problemTitle:''}`;},[opened]);
 function open(course,current){const state=createPreparationState(course),work=state.validatePreparation(profile[course.storageField]);history.pushState(null,'',state.preparationUrl(location.href,'problem',current||work.current));setOpened(course.problemId);window.scrollTo({top:0});}
 function home(){const url=new URL(location.href);for(const key of ['problem','activity','exercise'])url.searchParams.delete(key);url.hash='';history.pushState(null,'',url);setOpened(null);window.scrollTo({top:0});}
 const course=practiceCourse(opened);
 if(course)return <PreparationApp key={course.problemId} problem={course} profile={profile} initialWork={{...profile[course.storageField],screen:'problem'}} onSave={next=>saveProfileLesson(profile,next,course.storageField)} onLeave={onLeave} onOverview={home}/>;
 return <div className="prep-app practise-theme">
  <a className="prep-skip" href="#practice-main">Skip to courses</a>
  <header className="prep-topbar"><div className="prep-brand"><CodeXml size={25}/><span>KL <b>Coding Lab</b></span></div><nav aria-label="MCC Practise navigation"><PlaygroundLink/><ReferenceLink/><button onClick={onOpenMcc}>MCC Preparation</button><button onClick={onOpenMco}>MCO Tryout</button><button onClick={onLeave}>Change week / student</button></nav></header>
  <div className="prep-student"><span><b>{profile.name}</b> · {profile.className}</span><span>Each course keeps its own saved work.</span></div>
  <main id="practice-main" className="prep-main" tabIndex={-1}>
   <div className="practice-hero"><p className="prep-eyebrow">MCC PRACTISE · KS2 AND KS3</p><h1>Small programs.<br/><span>Plenty of practice.</span></h1><p>Type a tiny program. Run it, try a change, then use the idea in your own challenge. Choose a code course to build a program or an answer-file course to make the answers for supplied cases.</p><p className="practice-route-note">The code courses begin with short input and output programs. Block Bishop combines a beginner coding path with answer-file practice. Every level stays open.</p></div>
   {practiceCourses.map(course=>{
    const state=createPreparationState(course),work=state.validatePreparation(profile[course.storageField]),count=state.progress(work),learning=supportTotals(course.tasks,work),isOutput=course.track==='output',mixed=course.track==='mixed',programCount=course.tasks.filter(t=>!t.answerFile).length,answerCount=course.tasks.length-programCount;
    return <section className="practice-course" aria-labelledby={`${course.problemId}-title`} key={course.problemId}>
     <p className="prep-eyebrow">{mixed?'CODE + ANSWER FILES · ONE LEARNING PATH':isOutput?'ANSWER-FILE COURSE · FIXED INPUTS':'CODE COURSE · BUILD A PROGRAM'}</p><h2 id={`${course.problemId}-title`}>{course.problemTitle}</h2><p>{course.description}</p>
     <div className="prep-badges"><span>{course.tasks.length} typing practices</span><span>{learning.questions} short questions</span><span>{mixed?`${programCount} program tasks · ${answerCount} answer-file tasks`:`${course.tasks.length} ${isOutput?'answer-file tasks':'program tasks'}`}</span><span>IDLE-style editor and Shell</span></div>
     <div className="practice-support-overview"><span><b>{learning.typed} / {course.tasks.length}</b> typing examples matched</span><span><b>{learning.correct} / {learning.questions}</b> multiple-choice answers checked and correct</span><span><b>{count} / {course.tasks.length}</b> {mixed?'practice':isOutput?'answer-file':'program'} checks passed</span></div>
     <p className="practice-route-note">{mixed?'Try the board, learn the Python pieces, then check and download answer files for the supplied cases.':isOutput?'Work out each fixed answer, check it and download the matching text file. Python can help; its draft is saved separately from your answer.':'Short examples, quick checks and plenty of code to write. Run your typed example, try a small remix, then tackle your own task. Later levels give you less help.'}</p>
     <button className="prep-primary" onClick={()=>open(course)}>{count||Object.keys(work.drafts).length||Object.keys(work.practiceSupport||{}).length?`Continue ${course.shortTitle}`:'Start Exercise 1'}<ArrowRight size={18}/></button>
     <details className="practice-course-outline"><summary>See all {course.tasks.length} levels · {course.shortTitle}</summary><div className="practice-course-map">{course.activities.map((activity,i)=><section className="practice-group" key={activity.id}><p className="prep-eyebrow">SECTION {i+1} · EXERCISES {activity.exercises[0].number}–{activity.exercises.at(-1).number}</p><h3>{activity.title}</h3><p>{activity.summary}</p><ol start={activity.exercises[0].number}>{activity.exercises.map(item=>{const learned=supportStatus(item,work.practiceSupport?.[item.id]);return <li key={item.id}><button onClick={()=>open(course,item.id)}><span>{item.title.slice(item.title.indexOf(' ')+1)}<small className="practice-map-status">Typing {learned.typed?'matched':'to try'} · Questions {learned.correct}/{learned.total} · {item.answerFile?'Answer':'Program'} {taskPassed(work,item)?'checked':'to try'}</small></span>{taskPassed(work,item)?<CheckCircle2 size={18} aria-label={`${item.answerFile?'Answer':'Program'} passed`}/>:<ArrowRight size={17}/>}</button></li>;})}</ol></section>)}</div></details>
     <details className="practice-source-files"><summary>Original question and supplied files</summary><p>{course.sourceDescription||'The supplied PDF contains both code-task and output-task scoring. The two uploaded PDF names for this problem have identical contents.'}</p><a href={`${import.meta.env.BASE_URL}mcc-sources/${course.sourceFolder}/question.pdf`} target="_blank" rel="noreferrer">Read the original {course.sourceTitle||(course.sourceFolder==='binary-sorting'?'Binary Sorting':'Winning Streak')} question (PDF) ↗</a><ul>{Array.from({length:course.sampleCount??(course.sourceFolder==='binary-sorting'?2:3)},(_,i)=>{const number=String(i+1).padStart(2,'0');return <li key={number}><a href={`${import.meta.env.BASE_URL}mcc-sources/${course.sourceFolder}/sample_in_${number}.txt`} download>Sample {i+1} input</a> · <a href={`${import.meta.env.BASE_URL}mcc-sources/${course.sourceFolder}/sample_out_${number}.txt`} download>Sample {i+1} answer</a></li>;})}{course.sourceFolder==='winning-streak'&&<li><a href={`${import.meta.env.BASE_URL}mcc-sources/winning-streak/in_01.txt`} download>Supplied scored input: in_01.txt</a> · used in the answer-file challenge</li>}</ul>{course.sourceFolder==='binary-sorting'&&<p>The scored Binary Sorting inputs in_01.txt to in_04.txt were not included in the uploaded archives. The supplied samples are available here.</p>}</details>
    </section>;
   })}
  </main><footer className="prep-footer"><span>KL Coding Lab · MCC Practise</span><span>Type · Understand · Use · Run · Check</span></footer>
 </div>;
}
