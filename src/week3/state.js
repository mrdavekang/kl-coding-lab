import {cleanLearningReview,learningReviewReport} from '../learningReview.js';
import {validateWork} from '../evidence.js';
import {tasks,stages,main1,main2} from './content.js';
const topicData=[
 ['io','Knowledge','Input and output','I can identify the input and required output.','A field is input. The number of new fences is output.','a1','Point to the input, then write what the answer represents.'],
 ['formats','Knowledge','Two submission formats','I can distinguish an answer-file submission from a code submission.','Output mode: submit an answer file. Code mode: submit a program for unseen inputs.','formats','Explain which file you would submit in each mode.'],
 ['condition','Skills','Conditional counting','I can count only cells that meet a condition.','if cell == ".":\n    gapCount = gapCount + 1','g2','Trace one gap and one existing fence; explain the counter.'],
 ['exact','Skills','Exact output','I can produce and check an answer in the required format.','Required output: 2\nNot: The answer is 2','a2','Download your answer file and check its contents.'],
 ['meaning','Understanding','Count versus position','I can explain why a fence count differs from a column number.','Column 4 might need only 2 new fences. The answer is 2.','a1','Use one column to explain its position and its gap count.'],
 ['tests','Understanding','Testing fresh inputs','I can explain why passing a sample is not enough.','print(2) can pass one sample but fail an all-fence grid.','g3','Choose a fresh test and explain which mistake it could expose.'],
];
export const topics=topicData.map(([id,group,title,statement,example,destination,action])=>({id,group,title,statement,example,before:'Think about your Do Now or a previous lesson. It is fine if this is new.',after:'Use an answer, code line, test or explanation from today.',start:[action,destination],actions:{new:[action,destination],consolidating:['Try with less help. '+action,destination],stretch:['Choose a harder input. '+action,destination],help:['Show your teacher this example. '+action,destination]}}));
export function reviewAt(work,id){const before=cleanLearningReview(work.reviews?.before,topics);return id==='focus'?before:{...before,...cleanLearningReview(work.reviews?.[id],topics),before:before.before,focus:before.focus,reason:before.reason};}
export function updateReview(work,id,review){const clean=cleanLearningReview(review,topics);return {...work,reviews:{...work.reviews,[id==='focus'?'before':id]:id==='focus'?{before:clean.before,focus:clean.focus,reason:clean.reason}:{after:clean.after,priority:clean.priority,evidence:clean.evidence}}};}
export function reviewReport(work){const result=[];for(const id of ['pitstop1','pitstop2'])if(work.reviews?.[id]){result.push([id==='pitstop1'?'Learning Pit Stop 1':'Learning Pit Stop 2','Your reflection at this checkpoint.']);result.push(...learningReviewReport(reviewAt(work,id),topics));}return result.length?result:learningReviewReport(reviewAt(work,'focus'),topics);}
export const reportConfig={number:3,title:'Count the gaps',date:'22 September 2026',allTasks:tasks,lesson:[...main1,...main2],reviewReport};
const str=(v,n=100000)=>typeof v==='string'?v.slice(0,n):'';
export function validateWeek3(value){
 const clean=validateWork(value,tasks);
 for(const field of ['answers','inputs','recoverable','exampleDrafts','exampleInputs']){clean[field]={};for(const t of tasks)if(typeof value?.[field]?.[t.id]==='string')clean[field][t.id]=str(value[field][t.id]);}
 clean.reviews={};for(const id of ['before','pitstop1','pitstop2'])if(value?.reviews?.[id])clean.reviews[id]=cleanLearningReview(value.reviews[id],topics);
 clean.stage=stages.some(s=>s.id===value?.stage)?value.stage:'ready';
 clean.task=tasks.some(t=>t.id===value?.task)?value.task:'a1';
 clean.traceEvidence={};for(const t of tasks){const v=value?.traceEvidence?.[t.id];if(v&&typeof v.code==='string')clean.traceEvidence[t.id]={code:str(v.code,12000),description:str(v.description,5000)};}
 return clean;
}
export function answerResult(task,answer){const passed=answer.trim()===task.answer;return {passed,message:passed?'Your answer file passed this case. Explain how you found it.':'Check what your number represents. Count gaps in a vertical column and compare all columns.',cases:[{input:task.sampleInput,expected:task.answer,actual:answer,passed}]};}
export function progress(work){return [...main1,...main2].filter(t=>work.passed?.[t.id]!==undefined&&work.passed[t.id]===(t.kind==='output'?(work.answers?.[t.id]||''):(work.drafts?.[t.id]??t.starter))).length;}
