import {cleanLearningReview,learningReviewReport} from '../learningReview.js';
import {validateWork} from '../evidence.js';
import {tasks,stages,main1,main2,curriculum} from './content.js';
const topicData=[
 ['input','Knowledge','Input and variables','I can store an input in a variable.','A visitor name comes from input. A variable keeps it.','rev-w1-1','Test your welcome with another name.'],
 ['numbers','Knowledge','Numbers and text','I can read whole-number input for a calculation.','input() gives text. int() changes whole-number text into a number.','rev-w1-2','Explain why your calculation needs numbers.'],
 ['calculate','Skills','Useful calculations','I can combine calculations in the right order.','A total cost uses the quantity and the price of one item.','rev-w1-3','Explain the cost before finding the money left.'],
 ['loop','Skills','Visit each list item','I can use a loop to process every item.','Indented instructions repeat for each item in a for loop.','rev-w2-1','Test your program with a longer list.'],
 ['total','Understanding','Count and total','I can explain how a count differs from a total.','For [3, 0, 5], the count is 3 and the total is 8.','rev-w2-3','Explain which value your program adds on each visit.'],
 ['tests','Understanding','Different test data','I can explain why a program must work beyond the sample.','Changing the input should change the result when the task requires it.','rev-w2-2','Try zero and explain the result.'],
];
export const topics=topicData.map(([id,group,title,statement,example,destination,action])=>({id,group,title,statement,example,before:'Think about your Do Now or a previous lesson. It is fine if this is new.',after:'Use an answer, code line, test or explanation from today.',start:[action,destination],actions:{new:[action,destination],consolidating:['Try with less help. '+action,destination],stretch:['Choose a harder input. '+action,destination],help:['Show your teacher this example. '+action,destination]}}));
export function reviewAt(work,id){const before=cleanLearningReview(work.reviews?.before,topics);return id==='focus'?before:{...before,...cleanLearningReview(work.reviews?.[id],topics),before:before.before,focus:before.focus,reason:before.reason};}
export function updateReview(work,id,review){const clean=cleanLearningReview(review,topics);return {...work,reviews:{...work.reviews,[id==='focus'?'before':id]:id==='focus'?{before:clean.before,focus:clean.focus,reason:clean.reason}:{after:clean.after,priority:clean.priority,evidence:clean.evidence}}};}
export function reviewReport(work){const result=[];for(const id of ['pitstop1','pitstop2'])if(work.reviews?.[id]){result.push([id==='pitstop1'?'Learning Pit Stop 1':'Learning Pit Stop 2','Your reflection at this checkpoint.']);result.push(...learningReviewReport(reviewAt(work,id),topics));}return result.length?result:learningReviewReport(reviewAt(work,'focus'),topics);}
export const reportConfig={number:3,title:'Weeks 1 and 2 programming practice',date:'22 September 2026',allTasks:tasks,lesson:[...main1,...main2],reviewReport};
const str=(v,n=100000)=>typeof v==='string'?v.slice(0,n):'';
export function validateWeek3(value){
 value=value&&typeof value==='object'?value:{};
 // Start the replacement lesson separately. Preserve the original record for download.
 if(value.curriculum!==curriculum && (Object.keys(value.drafts||{}).length>0 || Object.keys(value).some(k=>k!=='drafts')) && !tasks.some(t=>t.id===value.task || Object.hasOwn(value.drafts||{},t.id))){
  const previous=JSON.parse(JSON.stringify(value));
  return {curriculum,drafts:{},stage:'ready',task:main1[0].id,previousLesson:previous};
 }
 const clean=validateWork({...value,drafts:value.drafts||{}},tasks);
 clean.curriculum=curriculum;
 if(value.previousLesson&&typeof value.previousLesson==='object'&&!Array.isArray(value.previousLesson)){
  const encoded=JSON.stringify(value.previousLesson);
  if(encoded.length>4500000)throw new Error('Earlier lesson archive is too large. Keep it as a separate backup.');
  clean.previousLesson=JSON.parse(encoded);
 }
 for(const field of ['answers','inputs','recoverable','exampleDrafts','exampleInputs']){clean[field]={};for(const t of tasks)if(typeof value?.[field]?.[t.id]==='string')clean[field][t.id]=str(value[field][t.id]);}
 clean.reviews={};for(const id of ['before','pitstop1','pitstop2'])if(value?.reviews?.[id])clean.reviews[id]=cleanLearningReview(value.reviews[id],topics);
 clean.stage=stages.some(s=>s.id===value?.stage)?value.stage:'ready';
 clean.task=tasks.some(t=>t.id===value?.task)?value.task:main1[0].id;
 clean.traceEvidence={};for(const t of tasks){const v=value?.traceEvidence?.[t.id];if(v&&typeof v.code==='string')clean.traceEvidence[t.id]={code:str(v.code,12000),description:str(v.description,5000)};}
 return clean;
}
export function progress(work){return [...main1,...main2].filter(t=>work.passed?.[t.id]!==undefined&&work.passed[t.id]===(t.kind==='output'?(work.answers?.[t.id]||''):(work.drafts?.[t.id]??t.starter))).length;}
