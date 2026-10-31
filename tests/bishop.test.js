import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readFileSync,existsSync} from 'node:fs';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createServer} from 'vite';
import {blockBishop,bishopCount,bishopInput,bishopAnswers} from '../src/practise/blockBishop.js';
import {bishopReachable} from '../src/practise/bishopMath.js';
import {practiceCourses,practiceTotal} from '../src/practise/catalog.js';
import {parseAnswerInput,checkAnswerFile} from '../src/practise/answerCheck.js';
import {checkSpec} from '../src/mcc/content.js';
import {createPreparationState,taskPassed} from '../src/mcc/state.js';
import {supportTotals} from '../src/practise/learningSupport.js';
import {createProfile,saveProfileLesson,listProfiles} from '../src/storage.js';
const state=createPreparationState(blockBishop),sample='3\n5 2 2\n1 1 1\n6 1 3\n';
function brute(n,x,y,block){
 const reached=new Set(),stack=[[x,y]];
 while(stack.length){const [r,c]=stack.pop(),key=r+':'+c;if(c<1||c>n||r===block[0]&&c===block[1]||reached.has(key))continue;reached.add(key);stack.push([r===1?2:1,c-1],[r===1?2:1,c+1]);}
 return reached.size;
}
test('Block Bishop has 28 small coding tasks followed by 6 answer-file tasks, preserving the earlier 76 levels',()=>{
 assert.equal(blockBishop.tasks.length,34);assert.equal(blockBishop.tasks.filter(t=>!t.answerFile).length,28);assert.equal(blockBishop.tasks.filter(t=>t.answerFile).length,6);assert.equal(practiceTotal,110);assert.equal(supportTotals(blockBishop.tasks).questions,68);
 assert.equal(practiceCourses.filter(c=>c.problemId!=='block-bishop').reduce((n,c)=>n+c.tasks.length,0),76);
 assert.equal(blockBishop.tasks.at(-1).answerFile.outputName,'out_sample_01.txt');assert.equal(blockBishop.tasks.at(-1).sampleInput,sample);
 for(const [i,item] of blockBishop.tasks.entries()){assert.equal(item.number,i+1);assert.equal(item.introduction.reading.length,2,item.id);assert.ok(item.introduction.diagram.caption,item.id);assert.ok(item.support.questions.some(q=>q.kind==='syntax'));assert.ok(item.support.questions.some(q=>q.kind==='ipo'));for(const question of item.support.questions)assert.equal(question.choices.filter(c=>c.id===question.answer).length,1);for(const file of [item.visual.image,item.visual.imageMobile])assert.ok(existsSync(new URL('../public/mcc-bishop/'+file,import.meta.url)));}
 assert.ok(blockBishop.taskById('bb-best-if').number<blockBishop.taskById('bb-min').number);assert.match(blockBishop.taskById('bb-helper').starter,/^#/);assert.ok(!blockBishop.taskById('bb-helper').starter.includes('min('));assert.match(blockBishop.tasks.at(-1).reading.join(' '),/not supplied/);
});
test('the count and interactive board agree with independent exhaustive searches over all small-board blocks',()=>{
 for(let n=1;n<=12;n++)for(let x=1;x<=2;x++)for(let y=1;y<=n;y++){
  let best=Infinity;
  for(let r=1;r<=2;r++)for(let c=1;c<=n;c++)if(r!==x||c!==y){const count=brute(n,x,y,[r,c]);best=Math.min(best,count);assert.equal(bishopReachable(n,x,y,[r,c]).size,count);}
  assert.equal(bishopCount(n,y),BigInt(best),`${n} ${x} ${y}`);
 }
});
test('every typing example and code reference runs, including fresh cases, 1000 cases and integers beyond Number precision',()=>{
 const run=spawnSync('python3',['tests/bishop_checks.py'],{input:JSON.stringify(blockBishop.tasks.map(item=>({...item,spec:checkSpec(item)}))),encoding:'utf8',maxBuffer:1e6});assert.equal(run.status,0,run.stdout+run.stderr);assert.match(run.stdout,/34 typing examples, 28 reference programs/);
});
test('answer files use one exact integer per case and reject labels, missing lines, illegal inputs and rounded large values',()=>{
 const final=blockBishop.tasks.at(-1);assert.ok(checkAnswerFile(final,'2\n1\n3',sample).passed);
 for(const item of blockBishop.tasks.filter(t=>t.answerFile))assert.ok(checkAnswerFile(item,item.sampleOutput,item.sampleInput).passed,item.id);
 for(const text of ['','2 1 3','2\n1','2\n0\n3','print(2)\n1\n3','2\n1\n3\n4'])assert.equal(checkAnswerFile(final,text,sample).passed,false,text);
 const data=bishopInput([['999999999999999999','2','999999999999999998']]);assert.ok(checkAnswerFile(final,'2',data).passed);assert.equal(checkAnswerFile(final,'1',data).passed,false);
 assert.equal(parseAnswerInput('bishop',data).cases[0][0],999999999999999999n);for(const data of ['1\n0 1 1\n','1\n2 3 1\n','1\n2 1 3\n','2\n1 1 1\n'])assert.throws(()=>parseAnswerInput('bishop',data));
 const root=new URL('../public/mcc-sources/block-bishop/',import.meta.url);assert.equal(readFileSync(new URL('sample_in_01.txt',root),'utf8'),sample);assert.equal(readFileSync(new URL('sample_out_01.txt',root),'utf8').trim(),'2\n1\n3');
});
test('Block Bishop stores typing, MCQs, code and answer-file passes separately and preserves earlier course work',()=>{
 const map=new Map();globalThis.localStorage={get length(){return map.size;},key:i=>[...map.keys()][i],getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,String(v))};const profile=createProfile('Bishop QA','Preview');
 for(const course of practiceCourses.filter(c=>c!==blockBishop))assert.ok(saveProfileLesson(profile,{marker:course.problemId,drafts:{[course.tasks[0].id]:'print("kept")'}},course.storageField));
 const item=blockBishop.tasks.at(-1),work=state.validatePreparation({current:item.id,screen:'problem',answers:{[item.id]:item.sampleOutput},passed:{[item.id]:item.sampleOutput},drafts:{[item.id]:'print(2)\nprint(1)\nprint(3)'},practiceSupport:{[item.id]:{version:1,text:item.support.code,answers:{meaning:{choice:item.support.questions[0].answer,checked:true}}}}});assert.ok(taskPassed(work,item));assert.ok(saveProfileLesson(profile,work,blockBishop.storageField));
 const restored=state.validatePreparation(JSON.parse(JSON.stringify(work)));assert.ok(taskPassed(restored,item));restored.answers[item.id]='2';assert.equal(taskPassed(restored,item),false);const link=state.preparationUrl('https://example.test/?week=5&classId=abc','problem',item.id);assert.equal(link.searchParams.get('classId'),'abc');assert.equal(state.locationFor(link.search,work).current,item.id);
 const saved=listProfiles()[0];for(const course of practiceCourses.filter(c=>c!==blockBishop))assert.equal(saved[course.storageField].drafts[course.tasks[0].id],'print("kept")');assert.ok(state.reportConfig.mixedTasks);
});
test('all 34 lessons render a single reading path with IDLE, usable diagrams, code checks or answer downloads as appropriate',async()=>{
 const server=await createServer({server:{middlewareMode:true,ws:false,watch:null},appType:'custom'});
 try{const {PreparationApp}=await server.ssrLoadModule('/src/mcc/PreparationApp.jsx');const {MccPractise}=await server.ssrLoadModule('/src/practise/MccPractise.jsx');const props={profile:{name:'QA',className:'Preview'},onSave:()=>true,onLeave:()=>{}};
  const hub=renderToStaticMarkup(React.createElement(MccPractise,props));assert.match(hub,/28 program tasks · 6 answer-file tasks/);assert.match(hub,/Only the official sample input was supplied/);
  for(const item of blockBishop.tasks){const html=renderToStaticMarkup(React.createElement(PreparationApp,{...props,problem:blockBishop,initialWork:{screen:'problem',current:item.id}}));const keys=['id="prep-intro"','id="prep-typing"','id="prep-understand"','id="prep-read"',...(item.answerFile?['id="prep-answer-file"']:[]),'id="prep-python"'];let last=-1;for(const key of keys){const found=html.indexOf(key);assert.ok(found>last,item.id+' '+key);last=found;}assert.match(html,/Python Shell/);assert.ok(!html.includes('id="prep-reflect"'));if(item.board)assert.match(html,/Bishop starts at row/);if(item.answerFile){assert.match(html,/one count for each case|minimum reachable count for each case/);assert.ok(!html.includes('>Check my code<'));}}
 }finally{await server.close();}
});
