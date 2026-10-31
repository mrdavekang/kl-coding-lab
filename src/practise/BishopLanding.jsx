import React,{useEffect} from 'react';
import {ArrowLeft,ArrowRight,CodeXml} from 'lucide-react';
import {blockBishop} from './blockBishop.js';
import {createPreparationState} from '../mcc/state.js';
import {BishopBoard} from './BishopBoard.jsx';
import {PlaygroundLink} from '../playground/PlaygroundLink.jsx';
import {ReferenceLink} from '../reference/ReferenceLink.jsx';
import './bishopLanding.css';

function BishopPicture(){
 return <svg className="bishop-landing-picture" viewBox="0 0 460 170" role="img" aria-labelledby="bishop-picture-title"><title id="bishop-picture-title">A two-row, five-column board. The bishop starts in row 2, column 2. Dots show its diagonal path before a square is blocked.</title>
  {[1,2,3,4,5].map(c=><text key={c} x={104+(c-1)*62} y="25" textAnchor="middle">{c}</text>)}
  {[2,1].map((r,j)=><g key={r}><text x="48" y={72+j*62} textAnchor="middle">Row {r}</text>{[1,2,3,4,5].map(c=>{const start=r===2&&c===2,route=(c%2===0?r===2:r===1);return <g key={c}><rect x={74+(c-1)*62} y={38+j*62} width="60" height="60" rx="4" fill={start?'#f4cd72':route?'#d9edf0':'#f4f7f6'}/><text x={104+(c-1)*62} y={77+j*62} className={start?'bishop-picture-start':'bishop-picture-dot'} textAnchor="middle">{start?'B':route?'•':''}</text></g>;})}</g>)}
 </svg>;
}

export function BishopFeature({onOpen}){
 return <section className="bishop-feature" aria-labelledby="bishop-feature-title"><div><p className="bishop-kicker">MCC PRACTISE · START HERE</p><h2 id="bishop-feature-title">Block Bishop</h2><p>A board puzzle. Tiny Python steps. Your own answer file.</p><button className="bishop-primary" onClick={onOpen}>Explore the course <ArrowRight size={18}/></button></div><BishopPicture/></section>;
}

export function BishopLanding({profile,onStart,onBrowse}){
 const state=createPreparationState(blockBishop),work=state.validatePreparation(profile?.blockBishopWork),passed=state.progress(work);
 const started=Object.keys(work.drafts).length||Object.keys(work.practiceSupport||{}).length||Object.keys(work.answers).length;
 useEffect(()=>{document.title='Block Bishop · MCC Practise · KL Coding Lab';window.scrollTo({top:0});},[]);
 return <div className="bishop-landing">
  <a className="bishop-skip" href="#bishop-course">Skip to the course</a>
  <header className="bishop-landing-nav"><a href="?week=mcc-practise" onClick={e=>{e.preventDefault();onBrowse();}} className="bishop-lab-brand"><CodeXml size={25}/><span>KL <b>Coding Lab</b></span></a><nav aria-label="Course tools"><PlaygroundLink/><ReferenceLink/></nav></header>
  <main id="bishop-course" className="bishop-landing-main" tabIndex={-1}>
   <button className="bishop-back" onClick={onBrowse}><ArrowLeft size={16}/> All MCC Practise courses</button>
   <section className="bishop-landing-hero" aria-labelledby="bishop-course-title"><p className="bishop-kicker">MCC PRACTISE · A BEGINNER COURSE FOR KS2 & KS3</p><h1 id="bishop-course-title">Block Bishop<span>Small steps. A clever solution.</span></h1><p className="bishop-lead">Learn a little Python, try it on a board, and build up to the past question. You can begin with your very first <code>print()</code>.</p>
    <div className="bishop-course-actions"><button className="bishop-primary" onClick={()=>onStart('bb-print')}>Start with Exercise 1 <ArrowRight size={19}/></button>{!!started&&<button className="bishop-secondary" onClick={()=>onStart(work.current)}>Continue my course <ArrowRight size={18}/></button>}<a href="#bishop-explore">Try the board first ↓</a></div>
    <p className="bishop-start-note">No Python experience needed. {profile?`${profile.name} · ${passed} of 34 practice checks passed.`:'Choose your student profile when you start an exercise.'}</p>
    <figure className="bishop-hero-board"><BishopPicture/><figcaption>Two rows. Five columns. B is the bishop. The dots follow its diagonal path.</figcaption></figure>
   </section>
   <section className="bishop-mission" aria-labelledby="bishop-mission-title"><p className="bishop-kicker">THE PUZZLE YOU ARE WORKING TOWARDS</p><h2 id="bishop-mission-title">Where would you put one block?</h2><p>The bishop moves diagonally. Block one square other than its starting square. Can you leave it with as few reachable squares as possible? Its starting square counts too.</p><p>We will build the Python skills first, then use them to make an answer file for the supplied question.</p></section>
   <section className="bishop-path" aria-labelledby="bishop-path-title"><div className="bishop-section-heading"><p className="bishop-kicker">YOUR LEARNING PATH</p><h2 id="bishop-path-title">One small program at a time.</h2><p>34 exercises · 28 Python tasks · 6 answer-file tasks. Every level is open, so you can revisit a skill whenever you need it.</p></div>
    <ol>{blockBishop.activities.map((activity,index)=><li key={activity.id}><span className="bishop-stage-number" aria-hidden="true">{String(index+1).padStart(2,'0')}</span><div><small>EXERCISES {activity.exercises[0].number}–{activity.exercises.at(-1).number}</small><h3>{activity.title}</h3><p>{activity.summary}</p><button aria-label={`Open stage ${index+1}: ${activity.title}`} onClick={()=>onStart(activity.exercises[0].id)}>Open this stage <ArrowRight size={16}/></button></div></li>)}</ol>
   </section>
   <section className="bishop-routine" aria-labelledby="bishop-routine-title"><p className="bishop-kicker">WHAT YOU DO IN EACH EXERCISE</p><h2 id="bishop-routine-title">Type. Understand. Make it work.</h2><ol><li><b>Type a tiny example.</b> Get used to the brackets, spaces and Python words.</li><li><b>Check what it means.</b> Answer a short syntax question and identify input, process or output.</li><li><b>Write your own program.</b> Use the IDLE-style editor and Shell, then check your answer and try again.</li></ol></section>
   <section id="bishop-explore" className="bishop-explore" aria-label="Explore the puzzle"><p className="bishop-kicker">HAVE A GO · NO CODE NEEDED</p><BishopBoard/><p className="bishop-explore-prompt">Try blocking a square next to B on its diagonal path. Then try a different square. What changes in the reachable count?</p></section>
   <section className="bishop-course-finish"><h2>Ready for your first line?</h2><p>Exercise 1 begins with one short <code>print()</code> program.</p><button className="bishop-primary" onClick={()=>onStart('bb-print')}>Start Exercise 1 <ArrowRight size={18}/></button><details><summary>Original question and supplied files</summary><p>The original is an output task. The course includes the official sample and clearly labelled classroom practice. The scored input files were not supplied.</p><a href={`${import.meta.env.BASE_URL}mcc-sources/block-bishop/question.pdf`} target="_blank" rel="noreferrer">Read the Block Bishop question (PDF) ↗</a></details></section>
  </main><footer className="bishop-landing-footer">KL Coding Lab · MCC Practise · Block Bishop</footer>
 </div>;
}
