import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createServer} from 'vite';
import {topics,topicById,referenceGroups,searchTopics} from '../src/reference/content.js';
import {REFERENCE_KEY,referenceUrl,practiceUrl,readTopic,cleanReferenceDrafts,saveReferenceDrafts,loadReferenceDrafts} from '../src/reference/state.js';
import {practiceCourse,practiceCourses} from '../src/practise/catalog.js';

test('26 student reference topics contain working Python examples and valid course/related links',()=>{
 assert.equal(topics.length,26);assert.equal(new Set(topics.map(t=>t.id)).size,26);assert.equal(referenceGroups.length,7);
 for(const item of topics){assert.ok(item.summary&&item.syntax&&item.mistake,item.id);assert.ok(item.explanation.length>=2);assert.ok(item.parts.length>=3);for(const id of item.related)assert.ok(topicById(id),item.id+' → '+id);for(const [course,id] of item.practice)assert.ok(practiceCourse(course)?.taskById(id),item.id+' → '+id);}
 const runner='import json,sys,io,contextlib\nitems=json.load(sys.stdin)\nfor item in items:\n old=sys.stdin;out=io.StringIO()\n try:\n  sys.stdin=io.StringIO(item["example"]["input"])\n  with contextlib.redirect_stdout(out):exec(compile(item["example"]["code"],"reference.py","exec"),{})\n finally:sys.stdin=old\n assert out.getvalue().strip()==item["example"]["output"].strip(),(item["id"],out.getvalue())\nprint("26 examples executed")';
 const result=spawnSync('python3',['-c',runner],{input:JSON.stringify(topics),encoding:'utf8'});assert.equal(result.status,0,result.stdout+result.stderr);assert.match(result.stdout,/26 examples executed/);
});
test('keyword search finds exact skills, syntax symbols and error clues without case sensitivity',()=>{
 assert.equal(searchTopics('input')[0].id,'input');assert.equal(searchTopics('PRINT')[0].id,'print');assert.equal(searchTopics('range')[0].id,'range');assert.equal(searchTopics('.append()')[0].id,'lists');assert.equal(searchTopics('#')[0].id,'comments');
 assert.ok(searchTopics('index value').some(t=>t.id==='indexing'));assert.ok(searchTopics('reset').some(t=>t.id==='streak-counter'));assert.ok(searchTopics('not defined').some(t=>t.id==='errors'));assert.ok(searchTopics('>=')[0].id==='comparisons');assert.equal(searchTopics('nonsense-symbol-123').length,0);assert.equal(searchTopics('').length,topics.length);
});
test('reference deep links preserve classroom/exercise context and validate return targets',()=>{
 const original='https://example.test/kl-coding-lab/?week=mcc-practise&problem=binary-sorting&exercise=bs-labels&activity=3&classId=abc&teacher=1#prep-python';
 const reference=referenceUrl(original,'indexing');assert.equal(reference.searchParams.get('week'),'mcc-reference');assert.equal(reference.searchParams.get('topic'),'indexing');assert.equal(reference.searchParams.get('classId'),'abc');assert.equal(reference.hash,'');assert.equal(readTopic(reference.search),'indexing');
 const back=practiceUrl(reference);assert.equal(back.searchParams.get('exercise'),'bs-labels');assert.equal(back.searchParams.get('activity'),'3');assert.equal(back.searchParams.get('classId'),'abc');assert.equal(back.searchParams.has('topic'),false);
 const streak=practiceUrl(reference,'winning-streak','ws-rounds');assert.equal(streak.searchParams.get('problem'),'winning-streak');assert.equal(streak.searchParams.get('exercise'),'ws-rounds');assert.equal(streak.searchParams.get('classId'),'abc');
 const bad=practiceUrl('https://example.test/?week=mcc-reference&problem=https://evil.test&exercise=bad&activity=9');assert.equal(bad.origin,'https://example.test');assert.equal(bad.searchParams.has('problem'),false);assert.equal(bad.searchParams.has('exercise'),false);assert.equal(readTopic('?topic=bad'),'start');
});
test('reference drafts use their own bounded storage and cannot change course profile work',()=>{
 const data=new Map([['kl-coding-lab.student.v2.example',JSON.stringify({name:'Learner',binarySortingWork:{drafts:{'bs-print':'print("kept")'},passed:{'bs-print':'print("kept")'}}})]]);globalThis.localStorage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,String(v))};
 const before=data.get('kl-coding-lab.student.v2.example');assert.ok(saveReferenceDrafts({print:{code:'print("Ada")',input:''},unknown:{code:'discard'},input:{code:'x'.repeat(13000),input:'x'.repeat(5000)}}));
 const loaded=loadReferenceDrafts();assert.equal(loaded.print.code,'print("Ada")');assert.equal(loaded.input.code.length,12000);assert.equal(loaded.input.input.length,4000);assert.equal(loaded.unknown,undefined);assert.equal(data.get('kl-coding-lab.student.v2.example'),before);assert.ok(data.has(REFERENCE_KEY));assert.deepEqual(cleanReferenceDrafts([]),{});
 data.set(REFERENCE_KEY,'bad json');assert.deepEqual(loadReferenceDrafts(),{});
});
test('the public reference and all 26 articles render with examples, explanations and a lazy separate playground',async()=>{
 const server=await createServer({server:{middlewareMode:true,ws:false,watch:null},appType:'custom'});
 try{
  const {ReferenceApp}=await server.ssrLoadModule('/src/reference/ReferenceApp.jsx');
  const {ReferencePlayground}=await server.ssrLoadModule('/src/reference/ReferencePlayground.jsx');
  const {ReferenceLink}=await server.ssrLoadModule('/src/reference/ReferenceLink.jsx');
  for(const item of topics){const html=renderToStaticMarkup(React.createElement(ReferenceApp,{initialTopic:item.id}));for(const label of ['Search topics','Read the parts','Watch out for this','Practise this skill','Try it yourself'])assert.ok(html.includes(label),item.id+' '+label);assert.ok(html.includes(renderToStaticMarkup(React.createElement('p',null,item.summary)).replace(/^<p>|<\/p>$/g,'')));assert.ok(!html.includes('id="reference-playground"'));assert.ok(!html.includes('Start my lesson'));assert.ok(!html.includes('Check my code'));}
  const lab=renderToStaticMarkup(React.createElement(ReferencePlayground,{topic:topics[0],onChange:()=>{},onBusy:()=>{}}));for(const label of ['Python Editor','Python Shell','Run Module','Example input','Save .py','Reset example'])assert.ok(lab.includes(label));assert.ok(!lab.includes('Check my code'));
  const link=renderToStaticMarkup(React.createElement(ReferenceLink));assert.match(link,/target="_blank"/);assert.match(link,/noopener/);assert.match(link,/week=mcc-reference/);
  const main=readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');assert.ok(main.indexOf("if(week==='mcc-reference')")<main.indexOf('if (!profile)'));
 }finally{await server.close();}
});
test('every practice course still exposes all tasks after the reference is added',()=>{
 assert.equal(practiceCourses.reduce((n,c)=>n+c.tasks.length,0),76);
 const lessons=readFileSync(new URL('../src/mcc/PreparationApp.jsx',import.meta.url),'utf8');assert.match(lessons,/practice&&<ReferenceLink/);
});
