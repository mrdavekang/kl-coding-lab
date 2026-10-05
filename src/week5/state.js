import {cleanLearningReview,learningReviewReport} from '../learningReview.js';
import {validateWork} from '../evidence.js';
import {tasks,checkedTasks,stages,main1,curriculum,facts,rehearsalSteps,readinessItems,preferenceOptions} from './content.js';

const topicData = [
  ['condition','Knowledge','Conditions','I can explain a True and a False decision.','A score equal to 10 passes score >= 10.','w5-positive','Trace one True case and one False case.'],
  ['counter','Skills','Counters and totals','I can choose the right update for the question.','A counter adds 1; a running total adds the current value.','w5-qualifiers','Explain the before and after value in one iteration.'],
  ['tests','Understanding','Fresh tests','I can choose a test and predict its answer.','Try 10, no matches and all matches.','w5-qualifiers','Explain one boundary test.'],
  ['ide','Skills','Using an IDE','I can run, save and reopen my program.','The editor contains code; the Shell shows output.','main2','Reopen your saved Python file and show your teacher.'],
  ['formats','Knowledge','Competition formats','I can identify which file to submit.','Output format needs an answer file. Code format needs a general program.','read2','Explain which file belongs to each format.'],
  ['ready','Understanding','Competition readiness','I can explain what I need at school or home.','Consider a computer, internet, a quiet workspace and independent working.','plenary','Record your location preference and one support need.']
];
export const topics=topicData.map(([id,group,title,statement,example,destination,action])=>({id,group,title,statement,example,before:'Use what you remember from Week 4. New ideas are fine.',after:'Use your code, test or IDE rehearsal as evidence.',start:[action,destination],actions:{new:[action,destination],consolidating:['Try with less help. '+action,destination],stretch:['Explain a fresh example. '+action,destination],help:['Ask your teacher to model this step. '+action,destination]}}));
export function reviewAt(work,id){const before=cleanLearningReview(work.reviews?.before,topics);return id==='focus'?before:{...before,...cleanLearningReview(work.reviews?.[id],topics),before:before.before,focus:before.focus,reason:before.reason};}
export function updateReview(work,id,review){const clean=cleanLearningReview(review,topics);return {...work,reviews:{...work.reviews,[id==='focus'?'before':id]:id==='focus'?{before:clean.before,focus:clean.focus,reason:clean.reason}:{after:clean.after,priority:clean.priority,evidence:clean.evidence}}};}
const str=(value,limit=3000)=>typeof value==='string'?value.slice(0,limit):'';
const obj=value=>value&&typeof value==='object'&&!Array.isArray(value)?value:{};
export function cleanPreference(value){
  const source=obj(value),clean={};
  for(const [field,options] of Object.entries(preferenceOptions))clean[field]=options.includes(source[field])?source[field]:'';
  clean.support=str(source.support,1500);clean.confirmedAt=str(source.confirmedAt,40);
  return clean;
}
export function preferenceComplete(value){const p=cleanPreference(value);return !!(p.intent&&p.location&&p.parent&&p.availability);}
export function preferenceText(profile,work){
  const p=cleanPreference(work.preference);
  return ['MCC 2026 · Week 5 response',`Name: ${profile.name}`,`Class: ${profile.className}`,
    `Participation: ${p.intent||'Not answered'}`,`Preferred location: ${p.location||'Not answered'}`,
    `Parent/carer discussion: ${p.parent||'Not answered'}`,`School attendance: ${p.availability||'Not answered'}`,
    `Support needed: ${p.support.trim()||'None recorded'}`,
    `IDE practised: ${work.ide||'Not recorded'}`,
    ...readinessItems.map(([id,label])=>`${label}: ${work.readiness?.[id]===true?'Reported ready':work.readiness?.[id]===false?'Need help':'Not answered'}`),
    `Response recorded: ${p.confirmedAt||'Draft; not yet confirmed'}`,
    'This is a preference, not registration or a confirmed school place. Hand this file to your teacher.'].join('\n');
}
export function reviewReport(work){
  const rows=[];
  for(const id of ['pitstop1','pitstop2'])if(work.reviews?.[id])rows.push([id==='pitstop1'?'Learning Pit Stop 1':'Learning Pit Stop 2','Student reflection.'],...learningReviewReport(reviewAt(work,id),topics));
  if(!rows.length)rows.push(...learningReviewReport(reviewAt(work,'focus'),topics));
  const p=cleanPreference(work.preference);
  rows.push(['MCC participation preference',`Participation: ${p.intent||'Not answered'}; Location: ${p.location||'Not answered'}; Parent/carer: ${p.parent||'Not answered'}; Attendance: ${p.availability||'Not answered'}. Support: ${p.support||'None recorded'}. ${p.confirmedAt?'Confirmed locally: '+p.confirmedAt:'Draft response'}. Hand in to the teacher; this does not register you.`]);
  rows.push(['IDE rehearsal (student self-report)',`IDE: ${work.ide||'Not recorded'}\n`+rehearsalSteps.map(([id,label])=>`${label}: ${work.rehearsal?.[id]===true?'Reported done':'Not recorded'}`).join('\n')]);
  rows.push(['Readiness (student self-report)',readinessItems.map(([id,label])=>`${label}: ${work.readiness?.[id]===true?'Ready':work.readiness?.[id]===false?'Need help':'Not answered'}`).join('\n')]);
  for(const [id,fact] of Object.entries(facts))for(let i=0;i<fact.questions.length;i++){const answer=work.factResponses?.[`${id}-${i}`];if(answer?.trim())rows.push([`${fact.title} · ${fact.questions[i][0]}`,answer]);}
  if(work.plenaryExplanation?.trim())rows.push(['Independent exit explanation',work.plenaryExplanation]);
  return rows;
}
export const reportConfig={number:5,title:'Counters, IDE practice and MCC readiness',date:'Week 5 · October 2026',allTasks:tasks,lesson:checkedTasks,reviewReport};
export function validateWeek5(value){
  const source=obj(value),clean=validateWork({...source,drafts:obj(source.drafts)},tasks);
  clean.curriculum=curriculum;clean.stage=stages.some(s=>s.id===source.stage)?source.stage:'donow';
  clean.task=tasks.some(t=>t.id===source.task)?source.task:main1[1].id;
  for(const field of ['inputs','recoverable']){clean[field]={};for(const task of tasks)if(typeof source[field]?.[task.id]==='string')clean[field][task.id]=str(source[field][task.id],100000);}
  clean.reviews={};for(const id of ['before','pitstop1','pitstop2'])if(source.reviews?.[id])clean.reviews[id]=cleanLearningReview(source.reviews[id],topics);
  clean.traceEvidence={};for(const task of tasks){const v=source.traceEvidence?.[task.id];if(v&&typeof v.code==='string')clean.traceEvidence[task.id]={code:str(v.code,12000),description:str(v.description,5000)};}
  clean.factResponses={};clean.answerReveals={};
  for(const [id,fact] of Object.entries(facts)){if(source.answerReveals?.[id]===true)clean.answerReveals[id]=true;for(let i=0;i<fact.questions.length;i++)clean.factResponses[`${id}-${i}`]=str(source.factResponses?.[`${id}-${i}`]);}
  clean.donowPrediction=str(source.donowPrediction);clean.donowAnswer=source.donowAnswer===true;
  clean.rehearsal={};for(const [id] of rehearsalSteps)if(source.rehearsal?.[id]===true)clean.rehearsal[id]=true;
  clean.readiness={};for(const [id] of readinessItems)if(typeof source.readiness?.[id]==='boolean')clean.readiness[id]=source.readiness[id];
  clean.preference=cleanPreference(source.preference);clean.plenaryExplanation=str(source.plenaryExplanation);
  clean.ide=['Thonny','Browser IDE','Other'].includes(source.ide)?source.ide:'Thonny';
  return clean;
}
export function progress(work){return checkedTasks.filter(task=>work.passed?.[task.id]!==undefined&&work.passed[task.id]===(work.drafts?.[task.id]??task.starter)).length;}
export function outputFileReady(result,taskId,code,input){return !!result&&result.taskId===taskId&&result.code===code&&result.input===input&&!result.output.includes('[Output shortened.');}
