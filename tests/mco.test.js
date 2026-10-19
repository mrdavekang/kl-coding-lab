import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createServer} from 'vite';
import {twoPointers} from '../src/mco/twoPointers.js';
import {checkReasoning} from '../src/mco/reasoning.js';
import {traceCuts} from '../src/mco/routes.js';
import {checkSpec} from '../src/mcc/content.js';
import {createPreparationState,taskPassed} from '../src/mcc/state.js';
import {createProfile,saveProfileLesson,listProfiles} from '../src/storage.js';
import {progressSummary,recordAttempt} from '../src/evidence.js';

const state=createPreparationState(twoPointers);
test('six reasoning tasks check actual answers; editing invalidates a pass and report evidence persists',()=>{
  assert.equal(twoPointers.activities.length,8);assert.equal(twoPointers.tasks.length,17);
  for(const item of twoPointers.tasks.filter(task=>task.reasoning)){
    const answer=item.reasoning.map(field=>field.expected).join('\n');
    assert.equal(checkReasoning(item,answer).passed,true,item.id);
    assert.equal(checkReasoning(item,'').passed,false,item.id);
    assert.equal(checkReasoning(item,'99\n'.repeat(item.reasoning.length)).passed,false,item.id);
    let work=state.validatePreparation({answers:{[item.id]:answer},passed:{[item.id]:answer},plans:{[item.id]:{process:'Use the number line'}},explanations:{[item.id]:'I counted the gaps.'}});
    assert.equal(taskPassed(work,item),true);assert.equal(state.progress(work),1);
    work=recordAttempt(work,{taskId:item.id,code:answer,kind:'check',inputs:[],output:answer},{type:'checked',result:checkReasoning(item,answer)});
    work=state.validatePreparation(JSON.parse(JSON.stringify(work)));
    assert.equal(progressSummary(work,twoPointers.tasks,twoPointers.tasks).passed,1);
    assert.equal(work.activity[item.id].entries[0].status,'passed');
    assert.match(state.reviewReport(work).flat().join(' '),/Use the number line/);
    work.answers[item.id]+='9';assert.equal(taskPassed(work,item),false);
  }
  assert.equal(state.validatePreparation({answers:{'tp-try-1':'x'.repeat(20000),unknown:'bad','tp-try-7':'bad'}}).answers['tp-try-1'].length,12000);
  assert.equal(state.validatePreparation({answers:{unknown:'bad','tp-try-7':'bad'}}).answers.unknown,undefined);
  assert.equal(state.validatePreparation({answers:{'tp-try-7':'bad'}}).answers['tp-try-7'],undefined);
});
test('both route orders and two minimum decisions produce all eight sample totals',()=>{
  const trace=traceCuts();
  assert.deepEqual(trace.map(row=>row.total),[29,29,24,33,27,34,37,36]);
  assert.deepEqual(trace.map(row=>row.best),[29,29,24,24,24,24,24,24]);
  assert.deepEqual(trace[2].alice.map(route=>route.distance),[18,9]);
  assert.deepEqual(trace[2].bob.map(route=>route.distance),[24,15]);
  assert.ok(trace[4].bob.every(route=>route.selected));
  assert.equal(trace[0].alice.length,0);assert.equal(trace[7].bob.length,0);
  for(const row of trace)for(const person of ['alice','bob'])for(const option of row[person])assert.equal(option.distance,option.legs.reduce((sum,leg)=>sum+Math.abs(leg.from-leg.to),0));
});
test('all Python exercises and complete solution pass independent walk checks and boundaries',()=>{
  const payload=twoPointers.tasks.filter(item=>!item.reasoning).map(item=>({...item,spec:checkSpec(item),example:twoPointers.activityFor(item.id).example,exampleOutput:twoPointers.activityFor(item.id).exampleOutput}));
  const result=spawnSync('python3',[fileURLToPath(new URL('./mco_checks.py',import.meta.url))],{input:JSON.stringify(payload),encoding:'utf8',maxBuffer:2e6});
  assert.equal(result.status,0,result.stdout+'\n'+result.stderr);assert.match(result.stdout,/200000-city boundaries verified/);
});
test('MCO deep links, storage and report configuration stay independent of MCC and weekly work',()=>{
  const work=state.validatePreparation({current:'tp-try-5',screen:'problem'});
  const url=state.preparationUrl('https://example.test/?week=mcc&classId=class-1&teacher=1','problem','tp-try-5');
  assert.equal(url.searchParams.get('week'),'mco');assert.equal(url.searchParams.get('activity'),'2');
  assert.equal(url.searchParams.get('classId'),'class-1');assert.equal(url.searchParams.get('teacher'),'1');
  assert.deepEqual(state.locationFor(url.search,work),{screen:'problem',current:'tp-try-5'});
  assert.equal(state.locationFor('?week=mco&problem=two-pointers&activity=8',work).current,'two-pointers');
  assert.equal(state.preparationUrl(url,'overview','tp-try-5').searchParams.has('exercise'),false);
  assert.equal(state.reportConfig.number,'MCO');assert.match(state.reportConfig.date,/8 activities/);
  const data=new Map();globalThis.localStorage={get length(){return data.size;},key:index=>[...data.keys()][index],getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,String(value))};
  const profile=createProfile('MCO QA','Test');
  for(const field of ['work','week2Work','week3Work','week4Work','week5Work','mccWork','cornerCoverWork','collatzWork'])assert.equal(saveProfileLesson(profile,{retained:field},field),true);
  const stale=structuredClone(profile);
  assert.equal(saveProfileLesson(profile,{answers:{'tp-try-1':'3\n5\n3\nNO'}},'twoPointersWork'),true);
  assert.equal(saveProfileLesson(stale,{},'twoPointersWork'),false);
  const saved=listProfiles()[0];for(const field of ['work','week2Work','week3Work','week4Work','week5Work','mccWork','cornerCoverWork','collatzWork'])assert.equal(saved[field].retained,field);
  assert.equal(saved.twoPointersWork.answers['tp-try-1'],'3\n5\n3\nNO');
});
test('hub, all Try tasks and independent challenge render with correct labels, assets and no early Python requirement',async()=>{
  const server=await createServer({server:{middlewareMode:true,ws:false,watch:null},appType:'custom'});
  try{
    const {McoTryout}=await server.ssrLoadModule('/src/mco/McoTryout.jsx');
    const {PreparationApp}=await server.ssrLoadModule('/src/mcc/PreparationApp.jsx');
    const {RouteExplorer}=await server.ssrLoadModule('/src/mco/RouteExplorer.jsx');
    const {StudentStart}=await server.ssrLoadModule('/src/StudentStart.jsx');
    const profile={name:'QA',className:'Test'};
    const hub=renderToStaticMarkup(React.createElement(McoTryout,{profile,onLeave:()=>{}}));
    assert.match(hub,/16 Try tasks/);assert.match(hub,/First 6 need no Python/);assert.match(hub,/8 stages/);assert.match(hub,/KS2/);assert.match(hub,/KS3/);
    for(const item of twoPointers.tasks){
      const html=renderToStaticMarkup(React.createElement(PreparationApp,{profile,problem:twoPointers,initialWork:{screen:'problem',current:item.id},onSave:()=>true,onLeave:()=>{},Explorer:RouteExplorer}));
      assert.ok(html.includes(item.title.replaceAll('&','&amp;')),item.id);
      assert.match(html,/My input → process → output plan/);assert.match(html,/MCO Tryout/);assert.match(html,/OF 8/);
      assert.equal(html.includes('Reasoning workspace'),!!item.reasoning,item.id);
      assert.equal(html.includes('Python workspace'),!item.reasoning,item.id);
      const activity=twoPointers.activityFor(item.id);
      const visual=item.visual || activity;
      assert.ok(html.includes(visual.image),item.id);
      assert.ok(existsSync(new URL('../public/mco-two-pointers/'+visual.image,import.meta.url)),item.id);
      if(item.explorer){assert.match(html,/Left end first/);assert.match(html,/Right end first/);assert.match(html,/USE/);}
      if(item.id==='two-pointers'){assert.match(html,/200,000/);assert.match(html,/2000000000/);assert.ok(!html.includes('STUDY AN EXAMPLE'));}
    }
    const chooser=renderToStaticMarkup(React.createElement(StudentStart,{week:'mco',onStart:()=>{}}));
    assert.match(chooser,/MCO Tryout/);assert.ok(chooser.indexOf('<b>MCC Preparation</b>')<chooser.indexOf('<b>MCO Tryout</b>'));
    const source=readFileSync(new URL('../src/mcc/PreparationApp.jsx',import.meta.url),'utf8');
    assert.match(source,/lesson:backupLesson/);assert.match(source,/payload.lesson!==backupLesson/);
  }finally{await server.close();}
});
test('MCO report includes labelled reasoning answers, program code and separate evidence',async()=>{
  const {createReport}=await import('../src/report.js');
  const item=twoPointers.tasks[0],answer=item.reasoning.map(field=>field.expected).join('\n');
  const code='parts = input().split()\nprint(int(parts[0]) + int(parts[1]))';
  const work=state.validatePreparation({answers:{[item.id]:answer},passed:{[item.id]:answer,'tp-try-7':code},drafts:{'tp-try-7':code},explanations:{[item.id]:'I counted three units left.'},plans:{[item.id]:{process:'Compare both possible visitors.'}}});
  const config={...state.reportConfig,allTasks:state.reportConfig.allTasks.map(task=>({...task,title:task.title.replace(/[^\x20-\x7e]/g,' ')}))};
  const doc=createReport({name:'Test learner',className:'QA'},work,{lessonConfig:config,rasterize:text=>({data:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4//8/AAX+Av4N70a4AAAAAElFTkSuQmCC',width:text.length*5,height:12,baseline:10})});
  assert.ok(doc.output('arraybuffer').byteLength>1000);
  const text=doc.internal.pages.flat().join('\n');
  for(const expected of ['MCO','My reasoning answers','Smallest combined distance: 3','NO','I counted three units left.','Compare both possible visitors.','print','2/17'])assert.ok(text.includes(expected),expected);
});
