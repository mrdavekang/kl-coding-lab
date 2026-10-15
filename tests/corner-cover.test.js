import test from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createServer} from 'vite';
import {cornerCover} from '../src/mcc/cornerCover.js';
import {problems} from '../src/mcc/catalog.js';
import {checkSpec} from '../src/mcc/content.js';
import {createPreparationState,validatePreparation,taskPassed} from '../src/mcc/state.js';
import {createProfile,saveProfileLesson,listProfiles} from '../src/storage.js';

const state=createPreparationState(cornerCover);
test('teacher-style programs and examples work; placement oracle, huge cases and misconceptions checked',()=>{
  const payload=cornerCover.tasks.map(item=>({...item,spec:checkSpec(item),example:cornerCover.activityFor(item.id).example,exampleOutput:cornerCover.activityFor(item.id).exampleOutput}));
  const run=spawnSync('python3',[fileURLToPath(new URL('./corner_cover_checks.py',import.meta.url))],{input:JSON.stringify(payload),encoding:'utf8',maxBuffer:2e6});
  assert.equal(run.status,0,run.stdout+'\n'+run.stderr);assert.match(run.stdout,/1225 placements and 200 huge cases verified/);
});
test('Corner Cover routes, restore, reports and passed work stay scoped to their own problem',()=>{
  const work=state.validatePreparation({screen:'problem',current:'cc-name',drafts:{'cc-name':'my code',double:'fence draft'},passed:{'cc-name':'my code'},plans:{'cc-name':{input:'Four dimensions'},double:{input:'fences'}},readiness:{'cc-input':true,input:true}});
  assert.equal(state.progress(work),1);assert.equal(work.drafts.double,undefined);assert.equal(work.readiness.input,undefined);
  assert.equal(validatePreparation(work).drafts['cc-name'],undefined);
  const url=state.preparationUrl('https://example.test/?week=mcc&classId=class-1&teacher=1','problem','cc-orientations');
  assert.equal(url.searchParams.get('problem'),'corner-cover');assert.equal(url.searchParams.get('classId'),'class-1');assert.equal(url.searchParams.get('teacher'),'1');
  assert.deepEqual(state.locationFor(url.search,work),{screen:'problem',current:'cc-orientations'});
  assert.equal(state.locationFor('?problem=corner-cover&activity=5',work).current,'corner-cover');
  assert.equal(state.reportConfig.title,'Corner Cover');assert.equal(state.reportConfig.allTasks.length,11);
  assert.match(state.reviewReport(work).flat().join(' '),/Four dimensions/);
  work.drafts['cc-name']='changed';assert.equal(taskPassed(work,cornerCover.taskById('cc-name')),false);
});
test('saving Corner Cover preserves the existing fences and weekly drafts',()=>{
  const data=new Map();globalThis.localStorage={get length(){return data.size;},key:i=>[...data.keys()][i],getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,String(value))};
  const profile=createProfile('Corner QA','Test');
  for(const field of ['work','week2Work','week3Work','week4Work','week5Work','mccWork'])assert.equal(saveProfileLesson(profile,{retained:field},field),true);
  assert.equal(saveProfileLesson(profile,{drafts:{'cc-name':'corner code'}},'cornerCoverWork'),true);
  const saved=listProfiles()[0];assert.equal(saved.mccWork.retained,'mccWork');assert.equal(saved.week5Work.retained,'week5Work');assert.equal(saved.cornerCoverWork.drafts['cc-name'],'corner code');
});
test('hub lists separate paths; all 11 Corner Cover exercises render with visuals and linear navigation',async()=>{
  const server=await createServer({server:{middlewareMode:true,ws:false,watch:null},appType:'custom'});
  try{
    const {MccPreparation}=await server.ssrLoadModule('/src/mcc/MccPreparation.jsx');
    const {PreparationApp}=await server.ssrLoadModule('/src/mcc/PreparationApp.jsx');
    const profile={name:'QA',className:'Test'};
    const hub=renderToStaticMarkup(React.createElement(MccPreparation,{profile,onLeave:()=>{}}));
    for(const problem of problems)assert.ok(hub.includes(problem.problemTitle));
    assert.ok(hub.includes('Start Corner Cover'));assert.ok(hub.includes('0 of 11 practice checks'));
    for(const item of cornerCover.tasks){
      const html=renderToStaticMarkup(React.createElement(PreparationApp,{profile,problem:cornerCover,initialWork:{screen:'problem',current:item.id},onSave:()=>true,onLeave:()=>{}}));
      assert.ok(html.includes(item.title.replaceAll('&','&amp;')),item.id);
      assert.ok(html.includes('My input → process → output plan'));assert.ok(html.includes('aria-current="step"'));assert.ok(html.includes('Python workspace'));
      const activity=cornerCover.activityFor(item.id);
      assert.ok(html.includes('mcc-corner-cover/'+activity.image));assert.ok(existsSync(new URL('../public/mcc-corner-cover/'+activity.image,import.meta.url)));
      if(item.id==='corner-cover'){assert.ok(html.includes('10¹⁸'));assert.ok(!html.includes('STUDY AN EXAMPLE'));assert.ok(!html.includes('grassy field'));}
    }
  }finally{await server.close();}
});
