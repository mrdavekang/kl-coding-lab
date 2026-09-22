import React from 'react';
import {cleanLearningReview,learningGroups,startingPoints,learningStages,suggestedAction} from '../learningReview.js';
const beforeLabels={prior:'Already can',prompt:'With a reminder',new:'New to me',unsure:'Not sure'};
const afterLabels={new:'Learning this',consolidating:'Practising',stretch:'Ready for more',help:'Need help',unattempted:'Not tried'};
export function FlatReview({after,work,setWork,onOpen,onContinue,onBack,saved,topics,checkpointLabel}){
 const state=cleanLearningReview(work.learningReview,topics);
 const responses=after?state.after:state.before;
 const choices=after?learningStages:startingPoints;
 const labels=after?afterLabels:beforeLabels;
 const focusId=after?state.priority:state.focus;
 const selected=topics.find(t=>t.id===focusId);
 const action=after?suggestedAction(selected,responses[focusId]):selected?.start;
 function update(fields){setWork(old=>({...old,learningReview:{...cleanLearningReview(old.learningReview,topics),...fields}}));}
 function answer(id,value){setWork(old=>{const review=cleanLearningReview(old.learningReview,topics),key=after?'after':'before';return {...old,learningReview:{...review,[key]:{...review[key],[id]:value}}};});}
 return <section className="mcc-flat-review">
  <h2>{after?checkpointLabel:'Choose your learning focus'}</h2>
  <p><b>1.</b> Read each statement and choose one answer. It is fine to be unsure.</p>
  {learningGroups.map(group=><section key={group.name}><h3>{group.name} · {group.meaning}</h3>{topics.filter(t=>t.group===group.name).map(topic=><fieldset key={topic.id}><legend>{topic.statement}</legend><p className="mcc-small">{topic.example}</p>{after&&<p className="mcc-small">At the start: {beforeLabels[state.before[topic.id]]||'Not recorded'}</p>}<div className="mcc-radio-row">{choices.map(choice=><label key={choice.id}><input type="radio" name={'review-'+topic.id} checked={responses[topic.id]===choice.id} onChange={()=>answer(topic.id,choice.id)}/><span>{labels[choice.id]}</span></label>)}</div></fieldset>)}</section>)}
  <h3>2. Choose one thing to work on</h3><fieldset className="mcc-focus-choices"><legend>My focus</legend>{topics.map(topic=><label key={topic.id}><input type="radio" name="review-focus" checked={focusId===topic.id} onChange={()=>update({[after?'priority':'focus']:topic.id})}/><span>{topic.title}</span></label>)}</fieldset>
  {action&&<div className="mcc-start-here"><b>A next step you can try</b><p>{action[0]}</p><button onClick={()=>onOpen(action[1])}>Go to this practice</button></div>}
  <h3>3. Write one sentence</h3><label htmlFor="review-evidence">{after?'What did you do, or where do you need help?':'Why did you choose this focus?'}</label><textarea id="review-evidence" rows={3} maxLength={3000} value={after?state.evidence:state.reason} onChange={e=>update({[after?'evidence':'reason']:e.target.value})} placeholder={after?'I changed… / I need help with…':'I want to practise…'}/>
  <p className="mcc-small">{saved?'Saved in your report.':'Saving unavailable: download a backup.'} These choices are your reflections, not marks.</p><div className="mcc-bottom"><button onClick={onBack}>Back to my work</button><button className="mcc-primary" onClick={onContinue}>Continue lesson →</button></div>
 </section>;
}
