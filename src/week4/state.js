import {cleanLearningReview,learningReviewReport} from '../learningReview.js';
import {validateWork} from '../evidence.js';
import {tasks,stages,main1,main2,curriculum} from './content.js';

const topicData=[
  ['condition','Knowledge','Conditions','I can explain how an if statement chooses whether code runs.','A condition such as score >= 10 is either True or False.','w4-positive-scores','Trace one True case and one False case.'],
  ['counter','Skills','Counting matches','I can initialise and update a counter.','Start at 0, add 1 only for a matching item, then print after the loop.','w4-count-qualifiers','Point to where the counter starts, changes and prints.'],
  ['compound','Knowledge','Compound conditions','I can use and with two boundary tests.','Both comparisons must be True when conditions are joined with and.','w4-count-range','Test both boundary values.'],
  ['nested','Skills','Nested loops','I can explain the job of the outer and inner loop.','The outer loop selects a column; the inner loop visits its cells.','w4-each-column','Name the value that changes in each loop.'],
  ['minimum','Understanding','Best value so far','I can keep the smallest result found so far.','Update the best value only when the new complete count is smaller.','w4-best-column','Trace how the best value changes.'],
  ['tests','Understanding','Competition tests','I can choose tests that include boundaries and unusual cases.','Try no matches, every item matching and an answer of zero.','w4-building-fences','Explain what a complete-fence column should output.']
];

export const topics=topicData.map(([id,group,title,statement,example,destination,action])=>({
  id,group,title,statement,example,
  before:'Think about the Do Now and earlier weeks. It is fine if this is new.',
  after:'Use a code line, tutor step, test or explanation from today.',
  start:[action,destination],
  actions:{new:[action,destination],consolidating:['Try the same pattern with less help. '+action,destination],stretch:['Choose a harder test. '+action,destination],help:['Show your teacher this example. '+action,destination]}
}));

export function reviewAt(work,id){
  const before=cleanLearningReview(work.reviews?.before,topics);
  return id==='focus'?before:{...before,...cleanLearningReview(work.reviews?.[id],topics),before:before.before,focus:before.focus,reason:before.reason};
}
export function updateReview(work,id,review){
  const clean=cleanLearningReview(review,topics);
  return {...work,reviews:{...work.reviews,[id==='focus'?'before':id]:id==='focus'?{before:clean.before,focus:clean.focus,reason:clean.reason}:{after:clean.after,priority:clean.priority,evidence:clean.evidence}}};
}
export function reviewReport(work){
  const result=[];
  for(const id of ['pitstop1','pitstop2'])if(work.reviews?.[id]){
    result.push([id==='pitstop1'?'Learning Pit Stop 1':'Learning Pit Stop 2','Your reflection at this checkpoint.']);
    result.push(...learningReviewReport(reviewAt(work,id),topics));
  }
  return result.length?result:learningReviewReport(reviewAt(work,'focus'),topics);
}
export const reportConfig={number:4,title:'Conditions, counting and MCC grids',date:'29 September 2026',allTasks:tasks,lesson:[...main1,...main2],reviewReport};
const str=(value,limit=100000)=>typeof value==='string'?value.slice(0,limit):'';
export function validateWeek4(value){
  value=value&&typeof value==='object'?value:{};
  const clean=validateWork({...value,drafts:value.drafts||{}},tasks);
  clean.curriculum=curriculum;
  for(const field of ['inputs','recoverable','exampleDrafts','exampleInputs']){
    clean[field]={};
    for(const task of tasks)if(typeof value?.[field]?.[task.id]==='string')clean[field][task.id]=str(value[field][task.id]);
  }
  clean.reviews={};
  for(const id of ['before','pitstop1','pitstop2'])if(value?.reviews?.[id])clean.reviews[id]=cleanLearningReview(value.reviews[id],topics);
  clean.stage=stages.some(stage=>stage.id===value?.stage)?value.stage:'ready';
  clean.task=tasks.some(task=>task.id===value?.task)?value.task:main1[0].id;
  clean.traceEvidence={};
  for(const task of tasks){
    const evidence=value?.traceEvidence?.[task.id];
    if(evidence&&typeof evidence.code==='string')clean.traceEvidence[task.id]={code:str(evidence.code,12000),description:str(evidence.description,5000)};
  }
  return clean;
}
export function progress(work){
  return [...main1,...main2].filter(task=>work.passed?.[task.id]!==undefined&&work.passed[task.id]===(work.drafts?.[task.id]??task.starter)).length;
}
