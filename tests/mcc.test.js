import {fileURLToPath} from 'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readFileSync,existsSync} from 'node:fs';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createServer} from 'vite';
import {activities,tasks,checkSpec} from '../src/mcc/content.js';
import {validatePreparation,progress,taskPassed,activityPassed,locationFor,preparationUrl,outputFileReady,reviewReport} from '../src/mcc/state.js';
import {createProfile,saveProfileLesson,listProfiles} from '../src/storage.js';

test('all preparation exercises, examples and full-size fence cases work; common misconceptions fail',()=>{
  const payload=tasks.map(item=>({...item,spec:checkSpec(item),example:activities.find(a=>a.id===item.activityId).example,exampleInput:'',exampleOutput:activities.find(a=>a.id===item.activityId).exampleOutput}));
  const run=spawnSync('python3',[fileURLToPath(new URL('./mcc_checks.py',import.meta.url))],{input:JSON.stringify(payload),encoding:'utf8',maxBuffer:2e6});
  assert.equal(run.status,0,run.stdout+'\n'+run.stderr);
  assert.match(run.stdout,/800 x 800 boundary verified/);
});

test('preparation restore bounds input and keeps known plans, code, evidence and readiness separately',()=>{
  const work=validatePreparation({drafts:{double:'print(2)',unknown:'discard'},passed:{double:'print(2)'},current:'double',screen:'problem',inputs:{double:'1\n'},plans:{double:{input:'One number',lookup:'int',unknown:'discard'}},readiness:{input:true,unknown:true},reflection:'Next test',activity:{double:{entries:[{kind:'run',code:'print(2)',output:'2',status:'finished'}],runs:1}}});
  assert.equal(progress(work),1);assert.equal(taskPassed(work,tasks.find(t=>t.id==='double')),true);assert.equal(activityPassed(work,activities[0]),false);
  assert.equal(work.plans.double.input,'One number');assert.equal(work.plans.double.unknown,undefined);assert.equal(work.drafts.unknown,undefined);assert.equal(work.readiness.unknown,undefined);
  assert.equal(work.activity.double.entries[0].output,'2');assert.match(reviewReport(work).flat().join(' '),/One number/);
  work.drafts.double='print(3)';assert.equal(progress(work),0);
  assert.equal(validatePreparation({current:'bad',plans:[],inputs:[],readiness:'bad'}).current,'fence-print');
  assert.equal(validatePreparation({plans:{double:{input:'x'.repeat(4000)}}}).plans.double.input.length,3000);
});

test('deep links preserve the classroom and select a linear exercise; URL construction retains unrelated parameters',()=>{
  const work=validatePreparation({current:'double'});
  assert.deepEqual(locationFor('?week=mcc&problem=building-fences&activity=4',work),{screen:'problem',current:'store-field'});
  assert.equal(locationFor('?week=mcc&problem=building-fences&exercise=count-column',work).current,'count-column');
  const url=preparationUrl('https://example.test/kl-coding-lab/?week=5&classId=class-123&teacher=1','problem','count-column');
  assert.equal(url.searchParams.get('classId'),'class-123');assert.equal(url.searchParams.get('teacher'),'1');assert.equal(url.searchParams.get('week'),'mcc');assert.equal(url.searchParams.get('activity'),'4');
  const overview=preparationUrl(url,'overview','double');assert.equal(overview.searchParams.has('exercise'),false);assert.equal(overview.searchParams.get('classId'),'class-123');
});

test('MCC storage preserves weeks 1–5 and rejects a stale profile write',()=>{
  const data=new Map();globalThis.localStorage={get length(){return data.size;},key:i=>[...data.keys()][i],getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,String(value))};
  const profile=createProfile('Preparation QA','Test');
  for(const field of ['work','week2Work','week3Work','week4Work','week5Work'])assert.equal(saveProfileLesson(profile,{retained:field},field),true);
  const stale=structuredClone(profile);assert.equal(saveProfileLesson(profile,{drafts:{double:'code'}},'mccWork'),true);assert.equal(saveProfileLesson(stale,{drafts:{}},'mccWork'),false);
  const stored=listProfiles()[0];for(const field of ['work','week2Work','week3Work','week4Work','week5Work'])assert.equal(stored[field].retained,field);
  assert.equal(stored.mccWork.drafts.double,'code');
});

test('only a successful current run can become an output file',()=>{
  const item=tasks[0],result={taskId:item.id,code:'print(2)',input:'1\n',output:'2\n'};
  assert.equal(outputFileReady(result,item,result.code,result.input),true);
  assert.equal(outputFileReady(null,item,result.code,result.input),false);
  assert.equal(outputFileReady(result,item,'print(3)',result.input),false);
  assert.equal(outputFileReady(result,item,result.code,'2\n'),false);
  assert.equal(outputFileReady({...result,output:'[Output shortened.'},item,result.code,result.input),false);
});

test('all 16 supported exercises render with focused visuals, one edit and optional planning',async()=>{
  const server=await createServer({server:{middlewareMode:true,ws:false,watch:null},appType:'custom'});
  try{
    const {PreparationApp}=await server.ssrLoadModule('/src/mcc/PreparationApp.jsx');
    for(const item of tasks){
      const html=renderToStaticMarkup(React.createElement(PreparationApp,{profile:{name:'QA',className:'Test'},initialWork:{screen:'problem',current:item.id},onSave:()=>true,onLeave:()=>{}}));
      assert.ok(html.includes(item.title.replaceAll('&','&amp;')),item.id);
      assert.ok(html.includes('My input → process → output plan'),item.id);
      assert.ok(html.includes('Python workspace'),item.id);
      assert.ok(html.includes('aria-current="step"'),item.id);
      assert.ok(html.includes('Use supported starter'),item.id);
      assert.ok(html.includes('optional notes'),item.id);
      assert.ok(!html.includes('id="prep-plan-lookup"'),item.id);
      assert.ok(!html.includes('STUDY AN EXAMPLE'),item.id);
      assert.ok(item.reading.length<=2&&item.syntax.length<=2,item.id);
      const activity=activities.find(a=>a.id===item.activityId);
      const visual=item.visual||activity;
      assert.ok(html.includes(visual.image),item.id);
      assert.ok(existsSync(new URL('../public/mcc-building-fences/'+visual.image,import.meta.url)),item.id);
      if(item.id==='building-fences')assert.ok(!html.includes('STUDY AN EXAMPLE'));
    }
    const chooser=readFileSync(new URL('../src/StudentStart.jsx',import.meta.url),'utf8');
    assert.ok(chooser.indexOf('<b>Week 5</b>')<chooser.indexOf('<b>MCC Preparation</b>'));
    const overview=renderToStaticMarkup(React.createElement(PreparationApp,{profile:{name:'QA',className:'Test'},initialWork:{},onSave:()=>true,onLeave:()=>{}}));
    assert.ok(overview.includes('MCC 2025 P1: Building Fences'));assert.ok(overview.includes('Start Activity 1'));
  }finally{await server.close();}
});
