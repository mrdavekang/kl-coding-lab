import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {stages,main1,main2,challenges,tasks,checkSpec,levels,curriculum} from '../src/week3/content.js';
import {validateWeek3,reviewAt,updateReview,progress,reportConfig,topics} from '../src/week3/state.js';
import {createProfile,saveProfileLesson,listProfiles} from '../src/storage.js';
import {recordAttempt,taskStatus} from '../src/evidence.js';
import {createReport} from '../src/report.js';
const refs=JSON.parse(readFileSync(new URL('./week3-reference.json',import.meta.url),'utf8'));
test('Week 3 has ten scenarios split across both weeks, in increasing levels without full solutions',()=>{
 assert.equal(stages.length,10);assert.equal(main1.length,5);assert.equal(main2.length,5);
 assert.deepEqual(levels.map(l=>challenges.filter(t=>t.level===l).length),[2,4,3,1]);
 assert.equal(new Set(tasks.map(t=>t.id)).size,tasks.length);
 for(const group of [main1,main2])assert.deepEqual(group.map(t=>levels.indexOf(t.level)),group.map(t=>levels.indexOf(t.level)).sort((a,b)=>a-b));
 for(const t of challenges){for(const k of ['scenario','goal','inputHelp','sampleOutput','sampleExplanation','starter','skills'])assert.ok(t[k],t.id+' '+k);assert.ok(t.tests.length>=3);assert.equal(t.kind,'code');assert.equal(t.solution,undefined);assert.equal(t.example,undefined);assert.ok(t.hints.length);}
 for(const topic of topics)assert.ok(tasks.some(t=>t.id===topic.start[1]));
});
test('all programs pass fresh data and samples using only Weeks 1 and 2 core skills',()=>{
 const run=spawnSync('python3',[new URL('./week3_checks.py',import.meta.url).pathname],{input:JSON.stringify(tasks.map(t=>({...t,spec:checkSpec(t)}))),encoding:'utf8',maxBuffer:2e6});assert.equal(run.status,0,run.stdout+'\n'+run.stderr);assert.match(run.stdout,/reference solutions passed/);
});
test('edits invalidate a pass and old fence passes never count',()=>{
 const id=main1[0].id;const work={drafts:{[id]:refs[id]},passed:{[id]:refs[id],a1:'2',g1:'old'}};
 assert.equal(progress(work),1);assert.equal(taskStatus(main1[0],work),'Current code passed');work.drafts[id]+='\n# changed';assert.equal(progress(work),0);
});
test('old fence work is archived intact, including draft-only records, without becoming new answers',()=>{
 for(const old of [{drafts:{b1:'counter',b3:'grid'},answers:{a1:'2'},task:'b3',stage:'main2',passed:{b3:'grid'},reviews:{before:{focus:'condition'}}},{drafts:{g1:'my code'}}]){
  const migrated=validateWeek3(old);assert.deepEqual(migrated.previousLesson,old);assert.deepEqual(migrated.drafts,{});assert.equal(migrated.stage,'ready');assert.equal(progress(migrated),0);assert.deepEqual(validateWeek3(JSON.parse(JSON.stringify(migrated))).previousLesson,old);
 }
});
test('new backup keeps current code, inputs, recoverable draft and both pit stops',()=>{
 const id=main1[1].id;let work={curriculum,drafts:{[id]:'my code'},inputs:{[id]:'3\n4\n'},recoverable:{[id]:'previous'},stage:'main1',task:id,traceEvidence:{[id]:{code:'x=1',description:'x changes'}}};
 work=updateReview(work,'focus',{before:{numbers:'new'},focus:'numbers',reason:'Remember conversion.'});
 work=updateReview(work,'pitstop1',{after:{numbers:'new'},priority:'numbers',evidence:'One test.'});
 work=updateReview(work,'pitstop2',{after:{numbers:'consolidating'},priority:'tests',evidence:'New data.'});
 const restored=validateWeek3(JSON.parse(JSON.stringify(work)));assert.equal(restored.drafts[id],'my code');assert.equal(restored.inputs[id],'3\n4\n');assert.equal(restored.recoverable[id],'previous');assert.equal(restored.traceEvidence[id].description,'x changes');assert.equal(reviewAt(restored,'pitstop1').after.numbers,'new');assert.equal(reviewAt(restored,'pitstop2').after.numbers,'consolidating');assert.equal(reviewAt(restored,'pitstop2').before.numbers,'new');assert.equal(restored.previousLesson,undefined);
});
test('Week 3 saves leave Weeks 1 and 2 intact and reject stale writes',()=>{
 const data=new Map();globalThis.localStorage={get length(){return data.size;},key:i=>[...data.keys()][i],getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,String(v))};
 const profile=createProfile('Practice learner','QA');saveProfileLesson(profile,{drafts:{hello:'week one'}},'work');saveProfileLesson(profile,{drafts:{desk:'week two'}},'week2Work');const stale=structuredClone(profile);assert.equal(saveProfileLesson(profile,{curriculum,drafts:{'rev-w1-1':'week three'}},'week3Work'),true);assert.equal(saveProfileLesson(stale,{drafts:{}},'week3Work'),false);const stored=listProfiles()[0];assert.equal(stored.work.drafts.hello,'week one');assert.equal(stored.week2Work.drafts.desk,'week two');
});
test('practice PDF includes code and both checkpoints without old lesson answers',()=>{
 const id=main1[1].id;let work={curriculum,drafts:{[id]:refs[id]},explanations:{[id]:'Four cartons cost twelve.'},passed:{[id]:refs[id]}};work=updateReview(work,'pitstop1',{after:{input:'new'},evidence:'First checkpoint.'});work=updateReview(work,'pitstop2',{after:{input:'consolidating'},evidence:'Second checkpoint.'});work=recordAttempt(work,{taskId:id,code:refs[id],kind:'run',inputs:['4\n3\n'],output:'12'},{type:'finished'});
 const config={...reportConfig,allTasks:reportConfig.allTasks.map(t=>({...t,title:t.title.replace(/[^\x20-\x7e]/g,' ')}))};const doc=createReport({name:'Test Student',className:'QA'},work,{lessonConfig:config,rasterize:text=>({data:'',width:text.length*5,height:12,baseline:10})});assert.ok(doc.output('arraybuffer').byteLength>1000);const text=doc.internal.pages.flat().join('\n');for(const expected of ['First checkpoint.','Second checkpoint.','Four cartons cost twelve.','print'])assert.ok(text.includes(expected),expected);assert.ok(!text.includes('My answer file'));
});
