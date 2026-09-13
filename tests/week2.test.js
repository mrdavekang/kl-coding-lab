import test from 'node:test';
import assert from 'node:assert/strict';
import {createProfile,saveProfileWork,saveProfileLesson,listProfiles} from '../src/storage.js';
import {reviewAt,updateReview,reviewReport,validateWeek2,topics,stats} from '../src/week2/review.js';
import {allTasks,lesson,coreTasks,coreChecks,practiceGroups,practiceFor,stageIndex,adjacentTask} from '../src/week2/content.js';
import {learningStages,suggestedAction} from '../src/learningReview.js';
import {evidenceTasks} from '../src/evidence.js';
function memoryStorage(){const data=new Map();return {get length(){return data.size;},key:i=>[...data.keys()][i],getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,String(v))};}
test('Week 1 and Week 2 retain independent work and reject stale profile writes',()=>{
 globalThis.localStorage=memoryStorage(); const profile=createProfile('Two Weeks','QA');
 assert.equal(saveProfileWork(profile,{drafts:{variable:'week one'},learningReview:{focus:'variableValue'}}),true);
 const stale=structuredClone(profile);
 assert.equal(saveProfileLesson(profile,{drafts:{desk:'week two'},reviews:{before:{focus:'total'}}}),true);
 assert.equal(saveProfileWork(stale,{drafts:{}}),false);
 assert.equal(saveProfileWork(profile,{drafts:{variable:'week one changed'}}),true);
 const saved=listProfiles()[0];assert.equal(saved.work.drafts.variable,'week one changed');assert.equal(saved.week2Work.drafts.desk,'week two');
});
test('two pit stops preserve the starting point and one another through backup restore',()=>{
 let work={drafts:{desk:'print(3)'}};
 work=updateReview(work,'focus',{before:{total:'new'},focus:'total',reason:'New loop idea.'});
 work=updateReview(work,'pitstop1',{...reviewAt(work,'pitstop1'),after:{total:'unattempted'},priority:'total',evidence:'I only tried announcing.'});
 work=updateReview(work,'pitstop2',{...reviewAt(work,'pitstop2'),after:{total:'consolidating'},priority:'countTotal',evidence:'4 + 7 = 11 in my trace.'});
 const restored=validateWeek2(JSON.parse(JSON.stringify(work)));
 assert.equal(reviewAt(restored,'pitstop1').after.total,'unattempted');assert.equal(reviewAt(restored,'pitstop2').after.total,'consolidating');
 assert.equal(reviewAt(restored,'pitstop2').before.total,'new');assert.equal(reviewAt(restored,'focus').reason,'New loop idea.');
 const report=reviewReport(restored).flat().join('\n');assert.match(report,/I only tried announcing/);assert.match(report,/4 \+ 7 = 11/);
});
test('observing and saving a trace never passes a check, but selected evidence reaches the report',()=>{
 const work={drafts:{},traceUses:{desk:3},traceEvidence:{desk:{code:'print(3)',description:'My program | Step 2 | 1 + 2 = 3',savedAt:'2026-09-15'}}};
 assert.equal(stats(work).passed,0);assert.equal(stats(work).runs,0);
 assert.equal(evidenceTasks(work,allTasks)[0].id,'desk');
 const restored=validateWeek2(work);assert.equal(restored.traceEvidence.desk.description,work.traceEvidence.desk.description);
 assert.equal(validateWeek2({drafts:{hello:'week1',desk:'week2'}}).drafts.hello,undefined);
});
test('every Week 2 reflection suggestion has an open destination and every practical stage has reading',()=>{
 for(const topic of topics)for(const stage of learningStages)assert.ok(allTasks.some(t=>t.id===suggestedAction(topic,stage.id)[1]));
 for(const task of allTasks.filter(t=>t.check)){assert.ok(task.learn);assert.ok(task.example);assert.ok(task.solution);assert.ok(task.tests);assert.ok(task.teacher);}
 assert.equal(lesson.filter(t=>t.kind==='review').length,3);
});
test('practice groups keep ten stages while navigation visits all eight scenarios and both pit stops',()=>{
 assert.equal(lesson.length,10); assert.equal(coreChecks,10);
 assert.deepEqual(practiceGroups.map(g=>g.cards.length),[3,5]);
 assert.equal(new Set(allTasks.map(t=>t.id)).size,allTasks.length);
 assert.equal(adjacentTask('announcer',1),'badges'); assert.equal(adjacentTask('badges',1),'laps');
 assert.equal(adjacentTask('laps',1),'pitstop1'); assert.equal(adjacentTask('pitstop1',-1),'laps');
 assert.equal(adjacentTask('desk',1),'shelves'); assert.equal(adjacentTask('supplies',1),'pitstop2');
 assert.equal(adjacentTask('plenary',1),undefined); assert.equal(adjacentTask('silver2',1),undefined);
 for(const group of practiceGroups)for(const id of group.cards){
  assert.equal(practiceFor(id),group); assert.equal(stageIndex(id),stageIndex(group.id));
  assert.ok(coreTasks.some(t=>t.id===id&&t.check));
 }
});
test('each scenario preserves its own code, explanation, trace and passed status in restored evidence',()=>{
 const drafts=Object.fromEntries(practiceGroups.flatMap(g=>g.cards).map(id=>[id,allTasks.find(t=>t.id===id).solution]));
 const restored=validateWeek2(JSON.parse(JSON.stringify({drafts,passed:{...drafts},explanations:{tickets:'Two tickets give RM 6.'},traceEvidence:{rainfall:{code:drafts.rainfall,description:'The zero runs once.',savedAt:'2026-09-15'}}})));
 assert.deepEqual(restored.drafts,drafts);assert.equal(stats(restored).passed,8);
 assert.equal(evidenceTasks(restored,allTasks).filter(t=>practiceFor(t.id)).length,8);
 assert.equal(restored.explanations.tickets,'Two tickets give RM 6.');assert.ok(restored.traceEvidence.rainfall);
 restored.drafts.tickets+='\n# changed';assert.equal(stats(restored).passed,7);
});
