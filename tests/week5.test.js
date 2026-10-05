import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {tasks,checkedTasks,checkSpec,main1,facts} from '../src/week5/content.js';
import {validateWeek5,progress,preferenceText,preferenceComplete,reviewReport,outputFileReady} from '../src/week5/state.js';
import {createProfile,saveProfileLesson,listProfiles} from '../src/storage.js';

test('Week 5 solutions and worked examples execute correctly, including every loop iteration',()=>{
  const run=spawnSync('python3',[new URL('./week5_checks.py',import.meta.url).pathname],{input:JSON.stringify(tasks.map(t=>({...t,spec:checkSpec(t)}))),encoding:'utf8',maxBuffer:2e6});
  assert.equal(run.status,0,run.stdout+'\n'+run.stderr);
  assert.match(run.stdout,/misconceptions rejected/);
});
test('Week 5 restore bounds untrusted input and retains responses, reviews and tutor evidence',()=>{
  const id=main1[1].id;
  const work=validateWeek5({stage:'plenary',task:id,drafts:{[id]:'code',unknown:'discard'},passed:{[id]:'code'},inputs:{[id]:'input'},traceEvidence:{[id]:{code:'example',description:'A True iteration'}},rehearsal:{open:true,unknown:true},readiness:{device:true,internet:false,ide:'true'},preference:{intent:'Yes',location:'Home',parent:'Confirmed',availability:'Awaiting the school time',support:'Need practice',confirmedAt:'2026-10-05T08:00:00Z'},factResponses:{'counter-0':'Add 1'},answerReveals:{counter:true},plenaryExplanation:'Test 10'});
  assert.equal(progress(work),1);work.drafts[id]+=' changed';assert.equal(progress(work),0);
  assert.equal(work.drafts.unknown,undefined);assert.deepEqual(work.rehearsal,{open:true});assert.deepEqual(work.readiness,{device:true,internet:false});
  assert.equal(work.traceEvidence[id].description,'A True iteration');assert.equal(work.factResponses['counter-0'],'Add 1');
  assert.equal(work.preference.location,'Home');assert.equal(preferenceComplete(work.preference),true);
  const text=preferenceText({name:'Learner',className:'6A'},work);assert.match(text,/Home/);assert.match(text,/Hand this file to your teacher/);
  const report=reviewReport(work).map(row=>row.join(' ')).join('\n');assert.match(report,/Need practice/);assert.match(report,/Reported done/);assert.match(report,/Test 10/);
  assert.equal(validateWeek5({preference:{location:'Invalid'}}).preference.location,'');
  assert.equal(validateWeek5({stage:'bad'}).stage,'donow');
});
test('answer-file download requires a successful run of the current program and input',()=>{
  const result={taskId:'w5-input',code:'print(1)',input:'12\n',output:'1\n'};
  assert.equal(outputFileReady(result,result.taskId,result.code,result.input),true);
  assert.equal(outputFileReady(null,result.taskId,result.code,result.input),false);
  assert.equal(outputFileReady(result,'another-task',result.code,result.input),false);
  assert.equal(outputFileReady(result,result.taskId,'print(0)',result.input),false);
  assert.equal(outputFileReady(result,result.taskId,result.code,'9\n'),false);
  assert.equal(outputFileReady({...result,output:'[Output shortened.'},result.taskId,result.code,result.input),false);
});
test('Week 5 save preserves prior weeks and rejects stale profile writes',()=>{
  const data=new Map();globalThis.localStorage={get length(){return data.size;},key:i=>[...data.keys()][i],getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,String(value))};
  const profile=createProfile('Week Five Learner','QA');
  for(const field of ['work','week2Work','week3Work','week4Work'])assert.equal(saveProfileLesson(profile,{drafts:{retained:field}},field),true);
  const stale=structuredClone(profile);assert.equal(saveProfileLesson(profile,{drafts:{[main1[0].id]:'new code'}},'week5Work'),true);
  assert.equal(saveProfileLesson(stale,{drafts:{}},'week5Work'),false);
  const stored=listProfiles()[0];for(const field of ['work','week2Work','week3Work','week4Work'])assert.equal(stored[field].drafts.retained,field);
  assert.equal(stored.week5Work.drafts[main1[0].id],'new code');
});
