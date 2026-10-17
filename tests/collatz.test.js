import test from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createServer} from 'vite';
import {collatz} from '../src/mcc/collatz.js';
import {problems} from '../src/mcc/catalog.js';
import {checkSpec} from '../src/mcc/content.js';
import {createPreparationState,validatePreparation,taskPassed} from '../src/mcc/state.js';
import {createProfile,saveProfileLesson,listProfiles} from '../src/storage.js';

const state=createPreparationState(collatz);
test('Collatz teacher-style exercises, examples and samples work; independent oracle and misconceptions checked',()=>{
  const payload=collatz.tasks.map(item=>({...item,spec:checkSpec(item),example:collatz.activityFor(item.id).example,exampleOutput:collatz.activityFor(item.id).exampleOutput,extraSamples:item.id==='collatz'?collatz.extraSamples:[]}));
  const result=spawnSync('python3',[fileURLToPath(new URL('./collatz_checks.py',import.meta.url))],{input:JSON.stringify(payload),encoding:'utf8',maxBuffer:2e6});
  assert.equal(result.status,0,result.stdout+'\n'+result.stderr);assert.match(result.stdout,/1000 x 1000 boundary verified/);
});
test('Collatz saves, validation, deep links and reports stay independent of previous problems',()=>{
  const work=state.validatePreparation({current:'cl-rounds',screen:'problem',drafts:{'cl-rounds':'my code',double:'fence code','cc-name':'corner code'},passed:{'cl-rounds':'my code'},plans:{'cl-rounds':{process:'Keep updated values'}},readiness:{'cl-repeat':true,input:true}});
  assert.equal(state.progress(work),1);assert.equal(work.drafts.double,undefined);assert.equal(work.drafts['cc-name'],undefined);assert.equal(work.readiness.input,undefined);
  assert.equal(validatePreparation(work).drafts['cl-rounds'],undefined);
  const url=state.preparationUrl('https://example.test/?week=mcc&classId=class-1&teacher=1','problem','cl-rounds');
  assert.equal(url.searchParams.get('problem'),'collatz');assert.equal(url.searchParams.get('classId'),'class-1');assert.equal(url.searchParams.get('teacher'),'1');
  assert.deepEqual(state.locationFor(url.search,work),{screen:'problem',current:'cl-rounds'});
  assert.equal(state.locationFor('?problem=collatz&activity=5',work).current,'collatz');
  assert.equal(state.reportConfig.title,'Collatz');assert.equal(state.reportConfig.allTasks.length,13);
  assert.match(state.reviewReport(work).flat().join(' '),/Keep updated values/);
  work.drafts['cl-rounds']='changed';assert.equal(taskPassed(work,collatz.taskById('cl-rounds')),false);
  const data=new Map();globalThis.localStorage={get length(){return data.size;},key:i=>[...data.keys()][i],getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,String(value))};
  const profile=createProfile('Collatz QA','Test');
  for(const field of ['work','week2Work','week3Work','week4Work','week5Work','mccWork','cornerCoverWork'])assert.equal(saveProfileLesson(profile,{retained:field},field),true);
  const stale=structuredClone(profile);
  assert.equal(saveProfileLesson(profile,{drafts:{'cl-rounds':'collatz code'}},'collatzWork'),true);
  assert.equal(saveProfileLesson(stale,{},'collatzWork'),false);
  const saved=listProfiles()[0];for(const field of ['work','week2Work','week3Work','week4Work','week5Work','mccWork','cornerCoverWork'])assert.equal(saved[field].retained,field);
  assert.equal(saved.collatzWork.drafts['cl-rounds'],'collatz code');
});
test('all three paths and 13 Collatz exercises render; both supplied samples and visuals are available',async()=>{
  const server=await createServer({server:{middlewareMode:true,ws:false,watch:null},appType:'custom'});
  try{
    const {MccPreparation}=await server.ssrLoadModule('/src/mcc/MccPreparation.jsx');
    const {PreparationApp}=await server.ssrLoadModule('/src/mcc/PreparationApp.jsx');
    const {StudentStart}=await server.ssrLoadModule('/src/StudentStart.jsx');
    const profile={name:'QA',className:'Test'};
    const hub=renderToStaticMarkup(React.createElement(MccPreparation,{profile,onLeave:()=>{}}));
    assert.equal(problems.length,3);for(const problem of problems)assert.ok(hub.includes(problem.problemTitle));
    assert.ok(hub.includes('Start Collatz'));assert.ok(hub.includes('3 problem pathways'));
    const chooser=renderToStaticMarkup(React.createElement(StudentStart,{week:'mcc',onStart:()=>{}}));
    assert.ok(chooser.includes('Building Fences, Corner Cover &amp; Collatz'));
    for(const item of collatz.tasks){
      const html=renderToStaticMarkup(React.createElement(PreparationApp,{profile,problem:collatz,initialWork:{screen:'problem',current:item.id},onSave:()=>true,onLeave:()=>{}}));
      assert.ok(html.includes(item.title.replaceAll('&','&amp;')),item.id);
      assert.ok(html.includes('My input → process → output plan'));assert.ok(html.includes('aria-current="step"'));assert.ok(html.includes('Python workspace'));
      const activity=collatz.activityFor(item.id);
      assert.ok(html.includes('mcc-collatz/'+activity.image));assert.ok(existsSync(new URL('../public/mcc-collatz/'+activity.image,import.meta.url)));
      if(item.id==='collatz'){assert.ok(html.includes('Sample input 2'));assert.ok(html.includes('1000'));assert.ok(!html.includes('STUDY AN EXAMPLE'));assert.ok(!html.includes('corner cells'));assert.ok(!html.includes('Building Fences: teacher video'));}
    }
  }finally{await server.close();}
});
