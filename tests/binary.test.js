import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {existsSync,readFileSync} from 'node:fs';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createServer} from 'vite';
import {binarySorting,tasks} from '../src/practise/binarySorting.js';
import {checkSpec} from '../src/mcc/content.js';
import {createPreparationState,taskPassed} from '../src/mcc/state.js';
import {createProfile,saveProfileLesson,listProfiles} from '../src/storage.js';
import {recordAttempt} from '../src/evidence.js';
const state=createPreparationState(binarySorting);

test('all 30 exercise references work; alternative swaps, misconceptions, shortest paths and full boundaries checked',()=>{
  const run=spawnSync('python3',['tests/binary_checks.py'],{input:JSON.stringify(tasks.map(item=>({...item,spec:checkSpec(item)}))),encoding:'utf8',maxBuffer:1e6});
  assert.equal(run.status,0,run.stdout+'\n'+run.stderr);assert.match(run.stdout,/200000-character boundaries verified/);
});
test('Binary Sorting saves independently and backups keep drafts, input and attempts',()=>{
  const data=new Map();globalThis.localStorage={get length(){return data.size;},key:i=>[...data.keys()][i],getItem:key=>data.get(key)??null,setItem:(key,v)=>data.set(key,String(v))};
  const profile=createProfile('Binary QA','Test');
  const fields=['work','week2Work','week3Work','week4Work','week5Work','mccWork','cornerCoverWork','collatzWork','twoPointersWork'];
  for(const field of fields)assert.ok(saveProfileLesson(profile,{kept:field},field));
  const stale=structuredClone(profile);
  const code='print("0")',item=tasks[0];
  let work=state.validatePreparation({drafts:{[item.id]:code,unknown:'discard'},passed:{[item.id]:code},inputs:{[item.id]:'test'},current:item.id});
  work=recordAttempt(work,{taskId:item.id,kind:'check',code,inputs:[],output:'0',startedAt:'2026-10-26'},{type:'checked',result:{passed:true,cases:[]}});
  const restored=state.validatePreparation(JSON.parse(JSON.stringify(work)));
  assert.ok(taskPassed(restored,item));assert.equal(restored.activity[item.id].entries.length,1);assert.equal(restored.inputs[item.id],'test');assert.equal(restored.drafts.unknown,undefined);
  assert.ok(saveProfileLesson(profile,restored,'binarySortingWork'));assert.equal(saveProfileLesson(stale,{},'binarySortingWork'),false);
  const saved=listProfiles()[0];for(const field of fields)assert.equal(saved[field].kept,field);
  restored.drafts[item.id]='print("1")';assert.equal(taskPassed(restored,item),false);
});
test('course deep links keep classroom parameters and expose 30 ordered exercises',()=>{
  assert.equal(tasks.length,30);assert.equal(new Set(tasks.map(t=>t.id)).size,30);
  assert.deepEqual(tasks.slice(0,5).map(t=>t.id),['bs-print','bs-lines','bs-name-input','bs-echo','bs-read']);
  const url=state.preparationUrl('https://example.test/?week=5&classId=class-123&teacher=1','problem','bs-pairs');
  assert.equal(url.searchParams.get('week'),'mcc-practise');assert.equal(url.searchParams.get('classId'),'class-123');assert.equal(url.searchParams.get('teacher'),'1');
  assert.equal(state.locationFor(url.search,state.validatePreparation({})).current,'bs-pairs');
  assert.deepEqual(state.reviewReport(state.validatePreparation({})),[]);
  for(const item of tasks){assert.equal(item.number,tasks.indexOf(item)+1);for(const image of [item.visual.image,item.visual.imageMobile])assert.ok(existsSync(new URL('../public/mcc-binary-sorting/'+image,import.meta.url)),image);}
  assert.deepEqual(tasks.slice(9,14).map(t=>t.id),['bs-positions','bs-index-variable','bs-index-choice','bs-index-loop','bs-labels']);
  assert.equal(tasks.find(t=>t.id==='bs-labels').number,14);
  assert.deepEqual(binarySorting.activities.map(a=>a.exercises.length),[5,4,7,6,4,4]);
  assert.deepEqual(tasks.slice(16,23).map(t=>t.id),['bs-zero-input','bs-zero-start','bs-zero-update','bs-zero-total','bs-zero-section','bs-zero-select','bs-left']);
  const build=tasks.find(t=>t.id==='bs-left');assert.equal(build.number,23);assert.equal(build.ipo.length,3);assert.equal(build.buildSteps.length,6);assert.ok(!build.starter.includes('zeroCount = 0'));
  assert.ok(tasks.slice(16,23).every(t=>t.buildSteps.length>=3));
  const previousCode='n = int(input())\nbits = input()\nfor index in range(n):\n    print(index + 1, bits[index])';
  const resumed=state.validatePreparation({current:'bs-labels',drafts:{'bs-labels':previousCode},passed:{'bs-labels':previousCode},inputs:{'bs-labels':'5\n01010\n'}});
  assert.equal(resumed.current,'bs-labels');assert.equal(resumed.inputs['bs-labels'],'5\n01010\n');assert.ok(taskPassed(resumed,tasks.find(t=>t.id==='bs-labels')));
  const oldLeftCode='n = int(input())\nbits = input()\nzeroCount = 0\nfor bit in bits:\n    if bit == "0":\n        zeroCount = zeroCount + 1\nfor index in range(zeroCount):\n    if bits[index] == "1":\n        print(index + 1)';
  const oldLeft=state.validatePreparation({current:'bs-left',drafts:{'bs-left':oldLeftCode},passed:{'bs-left':oldLeftCode}});assert.equal(oldLeft.current,'bs-left');assert.ok(taskPassed(oldLeft,build));
});
test('landing page, hub and all 30 lessons render with IDLE and without reflection or planning forms',async()=>{
  const server=await createServer({server:{middlewareMode:true,ws:false,watch:null},appType:'custom'});
  try{
    const {PreparationApp}=await server.ssrLoadModule('/src/mcc/PreparationApp.jsx');
    const {MccPractise}=await server.ssrLoadModule('/src/practise/MccPractise.jsx');
    const {StudentStart}=await server.ssrLoadModule('/src/StudentStart.jsx');
    const props={profile:{name:'QA',className:'Test'},onSave:()=>true,onLeave:()=>{}};
    const landing=renderToStaticMarkup(React.createElement(StudentStart,{week:'mcc-practise',onStart:()=>{}}));assert.match(landing,/MCC Practise/);assert.match(landing,/Binary Sorting &amp; Winning Streak · 76/);
    const hub=renderToStaticMarkup(React.createElement(MccPractise,props));assert.match(hub,/Start Exercise 1/);assert.match(hub,/Print the swap count first/);
    for(const item of tasks){
      const html=renderToStaticMarkup(React.createElement(PreparationApp,{...props,problem:binarySorting,initialWork:{current:item.id,screen:'problem'}}));
      for(const label of ['Python workspace','Python Shell','Run Module','Check my code',item.visual.image,item.visual.imageMobile])assert.ok(html.includes(label),`${item.id}: ${label}`);
      for(const label of ['id="prep-plan"','id="prep-reflect"','Predict before running','prep-readiness'])assert.ok(!html.includes(label),`${item.id}: unwanted ${label}`);
      assert.equal(html.includes('ORIGINAL PAST QUESTION'),item.original===true,item.id);
      if(item.buildSteps)assert.match(html,/Build your program/);
      if(item.id==='bs-left')assert.match(html,/Input, process and output/);
    }
    const main=readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');assert.ok(main.includes("'mcc-practise'"));
  }finally{await server.close();}
});
