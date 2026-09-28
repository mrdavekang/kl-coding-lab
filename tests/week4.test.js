import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {stages,main1,main2,challenges,tasks,checkSpec,levels,curriculum} from '../src/week4/content.js';
import {validateWeek4,progress,reportConfig,topics} from '../src/week4/state.js';
import {createProfile,saveProfileLesson,listProfiles} from '../src/storage.js';

const references=JSON.parse(readFileSync(new URL('./week4-reference.json',import.meta.url),'utf8'));

test('Week 4 is a ten-stage, differentiated lesson with eight checked challenges',()=>{
  assert.equal(stages.length,10);
  assert.equal(main1.length,4);
  assert.equal(main2.length,4);
  assert.deepEqual(levels.map(level=>challenges.filter(task=>task.level===level).length),[2,2,2,2]);
  assert.equal(new Set(tasks.map(task=>task.id)).size,tasks.length);
  assert.equal(reportConfig.number,4);
  assert.ok(curriculum);
  assert.equal(topics.length,6);
});

test('every task teaches before asking: reading, vocabulary, complete example and iteration tutor steps',()=>{
  for(const task of tasks){
    for(const field of ['scenario','goal','inputHelp','sampleOutput','sampleExplanation','starter','example','exampleOutput','exampleTitle','exampleScenario'])assert.ok(task[field],task.id+' '+field);
    assert.ok(task.reading.length,task.id+' reading');
    assert.ok(task.vocabulary.length,task.id+' vocabulary');
    assert.ok(task.exampleSteps.length>=4,task.id+' tutor steps');
    assert.ok(task.tests.length>=3,task.id+' tests');
    assert.ok(references[task.id],task.id+' reference');
    if(task.requireLoop)assert.ok(task.exampleSteps.some(step=>/Iteration|iteration/.test(step)),task.id+' iteration explanation');
  }
});

test('reference programs, worked examples and misconceptions are checked with real Python',()=>{
  const run=spawnSync('python3',[new URL('./week4_checks.py',import.meta.url).pathname],{input:JSON.stringify(tasks.map(task=>({...task,spec:checkSpec(task)}))),encoding:'utf8',maxBuffer:2e6});
  assert.equal(run.status,0,run.stdout+'\n'+run.stderr);
  assert.match(run.stdout,/Week 4 references and examples passed/);
});

test('Week 4 validation preserves tutor evidence and only current checked code counts',()=>{
  const task=main1[0];
  const work=validateWeek4({stage:'main1',task:task.id,drafts:{[task.id]:references[task.id]},passed:{[task.id]:references[task.id]},traceEvidence:{[task.id]:{code:task.example,description:'Iteration 2 is True.'}}});
  assert.equal(progress(work),1);
  assert.equal(work.traceEvidence[task.id].description,'Iteration 2 is True.');
  work.drafts[task.id]+='\n# changed';
  assert.equal(progress(work),0);
});

test('Week 4 saves beside earlier lessons and stale writes are rejected',()=>{
  const data=new Map();
  globalThis.localStorage={get length(){return data.size;},key:index=>[...data.keys()][index],getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,String(value))};
  const profile=createProfile('Week Four Learner','QA');
  saveProfileLesson(profile,{drafts:{hello:'week one'}},'work');
  saveProfileLesson(profile,{drafts:{desk:'week two'}},'week2Work');
  saveProfileLesson(profile,{drafts:{practice:'week three'}},'week3Work');
  const stale=structuredClone(profile);
  assert.equal(saveProfileLesson(profile,{curriculum,drafts:{[main1[0].id]:'week four'}},'week4Work'),true);
  assert.equal(saveProfileLesson(stale,{drafts:{}},'week4Work'),false);
  const stored=listProfiles()[0];
  assert.equal(stored.work.drafts.hello,'week one');
  assert.equal(stored.week2Work.drafts.desk,'week two');
  assert.equal(stored.week3Work.drafts.practice,'week three');
  assert.equal(stored.week4Work.drafts[main1[0].id],'week four');
});
