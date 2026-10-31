import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createServer} from 'vite';
import {practiceCourses} from '../src/practise/catalog.js';
import {playIdea,firstUnanswered,shortExampleError} from '../src/practise/playIdeas.js';
import {createPreparationState,taskPassed} from '../src/mcc/state.js';
import {supportStatus} from '../src/practise/learningSupport.js';
import {createReport} from '../src/report.js';
const binary=practiceCourses[0];

test('every example has an optional experiment; early input exercises do not introduce index jargon',()=>{
 for(const course of practiceCourses)for(const item of course.tasks){const idea=playIdea(item);assert.ok(idea.title&&idea.change,item.id);assert.ok(idea.change.length<250,item.id);}
 assert.equal(playIdea(binary.tasks[0]).title,'Give your robot a voice');
 assert.ok(!playIdea(binary.tasks[2]).change.includes('index'));
 assert.match(playIdea(binary.tasks.find(t=>t.id==='bs-index-variable')).change,/index/);
 const final=playIdea(binary.tasks.at(-1));assert.match(final.change,/print\(bits\)/);assert.ok(!final.change.includes('leftWrong'));
});
test('quick checks resume at an unchecked or incorrect answer and never skip an unfinished question',()=>{
 const unit=binary.tasks[0].support,[a,b]=unit.questions;
 assert.equal(firstUnanswered(unit),0);
 const record={answers:{[a.id]:{checked:true,choice:a.answer},[b.id]:{checked:false,choice:b.answer}}};
 assert.equal(firstUnanswered(unit,record),1);
 record.answers[b.id].checked=true;assert.equal(firstUnanswered(unit,record),-1);
 record.answers[a.id].choice=a.choices.find(c=>c.id!==a.answer).id;assert.equal(firstUnanswered(unit,record),0);
});
test('experiment backups keep the typed match and main draft separate without awarding a program pass',()=>{
 const state=createPreparationState(binary),item=binary.tasks[0];
 let work=state.validatePreparation({drafts:{[item.id]:'print("1")'},practiceSupport:{[item.id]:{version:1,text:item.support.code,playText:'print("Beep!")',playInput:'',answers:{},passed:true},bad:{playText:'discard'}}});
 work=state.validatePreparation(JSON.parse(JSON.stringify(work)));
 assert.equal(work.drafts[item.id],'print("1")');assert.equal(work.practiceSupport[item.id].playText,'print("Beep!")');assert.ok(supportStatus(item,work.practiceSupport[item.id]).typed);assert.equal(state.progress(work),0);assert.equal(taskPassed(work,item),false);assert.equal(work.practiceSupport[item.id].passed,undefined);assert.equal(work.practiceSupport.bad,undefined);
 const bounded=state.validatePreparation({practiceSupport:{[item.id]:{version:1,text:'',playText:'x'.repeat(5000),playInput:'x'.repeat(5000),answers:{}}}}).practiceSupport[item.id];assert.equal(bounded.playText.length,2500);assert.equal(bounded.playInput.length,3000);
 const old=state.validatePreparation({practiceSupport:{[item.id]:{version:1,text:item.support.code,answers:{}}}});assert.ok(!('playText' in old.practiceSupport[item.id]));
});
test('all lessons show one visible MCQ, preserve review choices and offer real example runs',async()=>{
 const server=await createServer({server:{middlewareMode:true,ws:false,watch:null},appType:'custom'});
 try{
  const {PreparationApp}=await server.ssrLoadModule('/src/mcc/PreparationApp.jsx');
  for(const course of practiceCourses)for(const item of course.tasks){
   const html=renderToStaticMarkup(React.createElement(PreparationApp,{problem:course,profile:{name:'QA',className:'Preview'},initialWork:{current:item.id,screen:'problem'},onSave:()=>true,onLeave:()=>{}}));
   const fields=html.match(/<fieldset class="practice-question"[^>]*>/g)||[];
   assert.equal(fields.filter(s=>!s.includes('hidden')).length,1,item.id);assert.equal(fields.length,item.support.questions.length,item.id);
   for(const label of ['Run my example','Try a change','Review all questions',item.introduction?'FIRST · READ AND LOOK':'Picture hint'])assert.ok(html.includes(label),item.id+': '+label);
   assert.ok(!html.includes('leaderboard'));assert.ok(!html.includes('words per minute'));
  }
 }finally{await server.close();}
});
test('reports label experiments separately from main-task check evidence',()=>{
 const state=createPreparationState(binary),item=binary.tasks[0];const work=state.validatePreparation({practiceSupport:{[item.id]:{version:1,text:item.support.code,playText:'print("Beep!")',playInput:'Hello',answers:{}}}});
 const doc=createReport({name:'QA',className:'Preview'},work,{lessonConfig:{...state.reportConfig,allTasks:[item],lesson:[item]},rasterize:()=>null});
 const text=doc.internal.pages.flat().join('\n');assert.match(text,/My small experiment/);assert.match(text,/Experiment input/);assert.match(text,/0\/1 core practice checks passed/);assert.equal(state.progress(work),0);
});

test('example errors retain the student line and error while leaving runtime paths out of the short message',()=>{
 const raw='Traceback (most recent call last):\n  File "/lib/python/runner.py", line 99\n  File "main.py", line 2\n  File "main.py", line 6\nNameError: name missing is not defined\n';
 assert.equal(shortExampleError(raw),'Line 6\nNameError: name missing is not defined');
 assert.equal(shortExampleError('Program stopped. Your experiment is kept.'),'Program stopped. Your experiment is kept.');
});
