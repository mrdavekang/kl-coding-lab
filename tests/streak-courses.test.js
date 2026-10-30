import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readFileSync,existsSync} from 'node:fs';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createServer} from 'vite';
import {practiceCourses,practiceCourse,practiceTotal} from '../src/practise/catalog.js';
import {winningStreak,streakPair,streakInput} from '../src/practise/winningStreak.js';
import {binarySortingOutput,winningStreakOutput} from '../src/practise/answerFiles.js';
import {checkAnswerFile,parseAnswerInput} from '../src/practise/answerCheck.js';
import {checkSpec} from '../src/mcc/content.js';
import {createPreparationState,taskPassed} from '../src/mcc/state.js';
import {supportTotals} from '../src/practise/learningSupport.js';
import {createProfile,saveProfileLesson,listProfiles} from '../src/storage.js';
import {taskStatus,recordAttempt} from '../src/evidence.js';
import {createReport} from '../src/report.js';
const fresh=practiceCourses.filter(c=>c.problemId!=='binary-sorting');
const source=(folder,name)=>readFileSync(new URL(`../public/mcc-sources/${folder}/${name}`,import.meta.url),'utf8');

test('four distinct tracks preserve Binary Sorting and provide 76 levels with 156 meaning/IPO questions',()=>{
 assert.equal(practiceTotal,76);assert.deepEqual(practiceCourses.map(c=>c.tasks.length),[30,8,30,8]);
 assert.equal(new Set(practiceCourses.flatMap(c=>c.tasks.map(t=>t.id))).size,76);
 assert.equal(practiceCourses.reduce((n,c)=>n+supportTotals(c.tasks).questions,0),156);
 assert.equal(practiceCourse('missing'),undefined);
 for(const course of fresh){
  assert.ok(course.tasks.at(-1).original);
  for(const [i,item] of course.tasks.entries()){
   assert.equal(item.number,i+1);assert.ok(item.support);assert.ok(item.reading.length);assert.ok(item.support.questions.some(q=>q.kind==='syntax'));assert.ok(item.support.questions.some(q=>q.kind==='ipo'));
   for(const q of item.support.questions){assert.equal(q.choices.filter(c=>c.id===q.answer).length,1);assert.ok(q.explanation&&q.hint);}
   for(const path of [item.visual.image,item.visual.imageMobile])assert.ok(existsSync(new URL(`../public/${course.imageDirectory}/${path}`,import.meta.url)),path);
  }
 }
});
test('all 46 added typing examples run and all 30 Winning Streak reference programs pass',()=>{
 const items=fresh.flatMap(c=>c.tasks);
 const runner='import json,sys,io,contextlib\nitems=json.load(sys.stdin)\nfor item in items:\n old=sys.stdin;out=io.StringIO()\n try:\n  sys.stdin=io.StringIO(item["support"]["input"])\n  with contextlib.redirect_stdout(out):exec(item["support"]["code"],{})\n finally:sys.stdin=old\n assert out.getvalue().strip()==item["support"]["output"].strip(),(item["id"],out.getvalue())\nprint("typing verified")';
 const typed=spawnSync('python3',['-c',runner],{input:JSON.stringify(items),encoding:'utf8'});assert.equal(typed.status,0,typed.stdout+typed.stderr);
 const checked=spawnSync('python3',['tests/streak_checks.py'],{input:JSON.stringify(winningStreak.tasks.map(t=>({...t,spec:checkSpec(t)}))),encoding:'utf8',maxBuffer:1e6});assert.equal(checked.status,0,checked.stdout+checked.stderr);assert.match(checked.stdout,/500000-round/);
});
function oracle(values){let bestL=0,bestR=0,bestLength=0;for(let l=0;l<values.length;l++)for(let r=l;r<values.length;r++){if(values.slice(l,r+1).every(x=>x===1)&& (r-l+1>bestLength||r-l+1===bestLength&&l+1>bestL)){bestL=l+1;bestR=r+1;bestLength=r-l+1;}}return `${bestL} ${bestR}`;}
test('streak answers and later ties agree with independent exhaustive interval enumeration',()=>{
 const item=winningStreakOutput.tasks[0];
 for(let n=1;n<=8;n++)for(let mask=1;mask<2**n;mask++){
  const values=Array.from({length:n},(_,i)=>(mask>>i)&1),expected=oracle(values);
  assert.equal(streakPair(values),expected);assert.ok(checkAnswerFile(item,expected,streakInput(values)).passed);
  for(let l=1;l<=n;l++)for(let r=l;r<=n;r++)assert.equal(checkAnswerFile(item,`${l} ${r}`,streakInput(values)).passed,`${l} ${r}`===expected);
 }
 const tied=checkAnswerFile(item,'1 2',streakInput([1,1,0,1,1]));assert.equal(tied.passed,false);assert.match(tied.message,/earlier tie/);
 assert.equal(checkAnswerFile(item,'0 1',streakInput([1])).passed,false);
 assert.equal(checkAnswerFile(item,'print(1, 1)',streakInput([1])).passed,false);
});
test('binary answer files accept alternative minimum swaps and reject incorrect counts, ranges and sequences',()=>{
 const item=binarySortingOutput.tasks[0],input='6\n010100\n';
 for(const answer of ['2\n2 6\n4 5','2\n5 2\n4 6','2\n4 5\n2 6'])assert.ok(checkAnswerFile(item,answer,input).passed,answer);
 for(const answer of ['','2 2 6 4 5','1\n2 6','2\n0 5\n4 6','2\n2 2\n4 5','2\n1 6\n4 5','2\n2 6','2\n2 6\n4 5\n1 2','K=2\n2 6\n4 5'])assert.equal(checkAnswerFile(item,answer,input).passed,false,answer);
 assert.ok(checkAnswerFile(item,'0','5\n00111\n').passed);
 assert.throws(()=>parseAnswerInput('binary','3\n01\n'));
 assert.throws(()=>parseAnswerInput('streak','3\n0 0 0\n'));
});
test('all supplied samples, fixed practices and actual output-kit input validate; no archive script is required',()=>{
 for(const course of [binarySortingOutput,winningStreakOutput])for(const item of course.tasks){if(item.answerFile.inputUrl)continue;assert.ok(checkAnswerFile(item,item.sampleOutput,item.sampleInput).passed,item.id);}
 for(const [folder,course,count] of [['binary-sorting',binarySortingOutput,2],['winning-streak',winningStreakOutput,3]])for(let i=1;i<=count;i++){const s=String(i).padStart(2,'0');assert.ok(checkAnswerFile(course.tasks[0],source(folder,`sample_out_${s}.txt`),source(folder,`sample_in_${s}.txt`)).passed);}
 const real=source('winning-streak','in_01.txt'),parsed=parseAnswerInput('streak',real);
 assert.equal(parsed.n,500000);const firstLoss=parsed.values.indexOf('0');assert.ok(firstLoss>0);assert.ok(parsed.values.slice(firstLoss).every(x=>x==='0'));
 const final=winningStreakOutput.tasks.at(-1);assert.ok(checkAnswerFile(final,`1 ${firstLoss}`,real).passed);assert.equal(final.answerFile.outputName,'out_01.txt');
 assert.match(binarySortingOutput.tasks.at(-1).reading.join(' '),/not supplied/);
});
test('new courses keep saved work, progress and deep links separate',()=>{
 const data=new Map();globalThis.localStorage={get length(){return data.size;},key:i=>[...data.keys()][i],getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,String(v))};
 const profile=createProfile('Four courses QA','Teacher preview');
 for(const course of practiceCourses){const state=createPreparationState(course),item=course.tasks[0],q=item.support.questions[0],answer=item.kind==='output'?item.sampleOutput:'print("0")';
  const work=state.validatePreparation({current:item.id,screen:'problem',drafts:{[item.id]:'print("kept")'},answers:{[item.id]:answer},passed:{[item.id]:item.kind==='output'?answer:'print("kept")'},practiceSupport:{[item.id]:{version:1,text:item.support.code,answers:{[q.id]:{choice:q.answer,checked:true}}}}});
  assert.ok(taskPassed(work,item));assert.ok(saveProfileLesson(profile,work,course.storageField));
  const url=state.preparationUrl('https://example.test/?week=5&classId=abc','problem',item.id);assert.equal(url.searchParams.get('classId'),'abc');assert.equal(state.locationFor(url.search,work).current,item.id);
  const restored=state.validatePreparation(JSON.parse(JSON.stringify(work)));assert.ok(taskPassed(restored,item));assert.equal(restored.practiceSupport[item.id].text,item.support.code);
  if(item.kind==='output'){restored.answers[item.id]+='extra';assert.equal(taskPassed(restored,item),false);}
 }
 const saved=listProfiles()[0];for(const c of practiceCourses)assert.equal(saved[c.storageField].current,c.tasks[0].id);
});
test('answer-file reports count checked answers and distinguish untouched tasks from optional Python',()=>{
 const course=winningStreakOutput,state=createPreparationState(course),item=course.tasks[4],answer='4 5';
 let work=state.validatePreparation({answers:{[item.id]:answer},drafts:{[item.id]:'print(4, 5)'},passed:{[item.id]:answer}});
 assert.equal(taskStatus(course.tasks[0],work),'Not started');assert.equal(taskStatus(item,work),'Current answer passed');
 const result=checkAnswerFile(item,answer,item.sampleInput);
 work=recordAttempt(work,{taskId:item.id,kind:'check',code:answer,inputs:[item.answerFile.inputName],output:answer},{type:'checked',result});
 const doc=createReport({name:'File QA',className:'Preview'},work,{lessonConfig:state.reportConfig,rasterize:text=>({data:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4//8/AAX+Av4N70a4AAAAAElFTkSuQmCC',width:text.length*5,height:12,baseline:10})}),content=doc.internal.pages.flat().join('\n');
 assert.match(content,/answer-file tasks with work/);assert.match(content,/1\/8 core practice checks passed/);assert.match(content,/My answer file/);assert.match(content,/Optional Python/);assert.ok(!content.includes('My reflection'));
});
test('new lessons render typing, questions, tasks and IDLE in one flow; answer tasks have a distinct check/download',async()=>{
 const server=await createServer({server:{middlewareMode:true,ws:false,watch:null},appType:'custom'});
 try{
  const {PreparationApp}=await server.ssrLoadModule('/src/mcc/PreparationApp.jsx');const {MccPractise}=await server.ssrLoadModule('/src/practise/MccPractise.jsx');
  const props={profile:{name:'QA',className:'Test'},onSave:()=>true,onLeave:()=>{}};
  const hub=renderToStaticMarkup(React.createElement(MccPractise,props));for(const course of practiceCourses)assert.ok(hub.includes(course.problemTitle));
  for(const course of fresh)for(const item of course.tasks){const html=renderToStaticMarkup(React.createElement(PreparationApp,{...props,problem:course,initialWork:{screen:'problem',current:item.id}}));
   const order=['id="prep-typing"','id="prep-understand"','id="prep-read"',...(item.answerFile?['id="prep-answer-file"']:[]),'id="prep-python"'].map(x=>html.indexOf(x));assert.ok(order.every((x,i)=>x>=0&&(!i||x>order[i-1])),item.id);
   assert.match(html,/Python Shell/);assert.ok(!html.includes('id="prep-reflect"'));
   if(item.answerFile){assert.match(html,/Check my answer file/);assert.ok(html.includes('Download '+item.answerFile.outputName));assert.ok(!html.includes('>Check my code<'));}
  }
 }finally{await server.close();}
});
