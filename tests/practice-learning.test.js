import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createServer} from 'vite';
import {binarySorting,tasks} from '../src/practise/binarySorting.js';
import {typingStatus,cleanSupport,supportStatus,supportTotals} from '../src/practise/learningSupport.js';
import {createPreparationState,taskPassed} from '../src/mcc/state.js';
import {createReport} from '../src/report.js';

test('all 30 typing examples execute with their advertised input and output; 62 questions have valid choices',()=>{
  assert.equal(tasks.length,30);
  const seen=new Set();
  for(const item of tasks){
    assert.ok(item.support,item.id);const unit=item.support;
    assert.ok(unit.code.length<=350,item.id);assert.ok(!seen.has(item.id));seen.add(item.id);
    assert.ok(unit.questions.some(q=>q.kind==='syntax'),item.id);assert.ok(unit.questions.some(q=>q.kind==='ipo'),item.id);
    assert.equal(new Set(unit.questions.map(q=>q.id)).size,unit.questions.length,item.id);
    for(const q of unit.questions){assert.equal(q.choices.length,3,item.id);assert.equal(q.choices.filter(c=>c.id===q.answer).length,1,item.id);assert.ok(q.explanation&&q.hint,item.id);}
  }
  assert.equal(supportTotals(tasks).questions,62);
  const runner=`import json,sys,io,contextlib\nitems=json.load(sys.stdin)\nfor item in items:\n before=sys.stdin;out=io.StringIO()\n try:\n  sys.stdin=io.StringIO(item['support']['input'])\n  with contextlib.redirect_stdout(out):exec(compile(item['support']['code'],'typing.py','exec'),{'__name__':'__main__'})\n finally:sys.stdin=before\n assert out.getvalue().strip()==item['support']['output'].strip(),(item['id'],out.getvalue())\nprint('30 executable typing examples verified')`;
  const result=spawnSync('python3',['-c',runner],{input:JSON.stringify(tasks),encoding:'utf8'});
  assert.equal(result.status,0,result.stdout+result.stderr);assert.match(result.stdout,/30 executable/);
});

test('typing feedback locates errors and keeps indentation/newlines visible while typing',()=>{
  const target='for bit in "01":\n    print(bit)';
  assert.equal(typingStatus('',target).prefix,0);
  const partial='for bit in "01":\n    ';
  assert.equal(typingStatus(partial,target).prefix,partial.length);assert.equal(typingStatus(partial,target).error,null);
  const mistake=typingStatus('for bit in "01":\n  p',target);assert.equal(mistake.line,2);assert.equal(mistake.column,3);assert.equal(mistake.expected[mistake.error],' ');
  assert.equal(typingStatus(target,target).complete,true);
  assert.equal(typingStatus(target+'\n',target).complete,true);
  assert.equal(typingStatus(target.replace('\n    ','\r\n\t'),target).complete,true);
  assert.equal(typingStatus(target+'x',target).complete,false);
  assert.equal(typingStatus('print("0")','print("Hi")').complete,false);
  assert.equal(typingStatus(null,target).complete,false);
});

test('saved typing and checked choices survive backup validation without becoming a program pass',()=>{
  const state=createPreparationState(binarySorting),item=tasks[2],unit=item.support;
  const record={version:unit.version,text:unit.code,answers:Object.fromEntries(unit.questions.map(q=>[q.id,{choice:q.answer,checked:true}]))};
  let work=state.validatePreparation({current:item.id,drafts:{'bs-left':'old saved code'},practiceSupport:{[item.id]:record,unknown:record}});
  work=state.validatePreparation(JSON.parse(JSON.stringify(work)));
  assert.deepEqual(supportStatus(item,work.practiceSupport[item.id]),{typed:true,correct:2,total:2});
  assert.equal(work.practiceSupport.unknown,undefined);assert.equal(work.drafts['bs-left'],'old saved code');
  assert.equal(taskPassed(work,item),false);assert.equal(state.progress(work),0);
  assert.equal(supportTotals(tasks,work).typed,1);assert.equal(supportTotals(tasks,work).correct,2);
  work.practiceSupport[item.id].answers.meaning.checked=false;assert.equal(supportStatus(item,work.practiceSupport[item.id]).correct,1);
  work.practiceSupport[item.id].text+='x';assert.equal(supportStatus(item,work.practiceSupport[item.id]).typed,false);
  const invalid=cleanSupport({[item.id]:{version:unit.version,text:'x'.repeat(10000),answers:{meaning:{choice:'999',checked:true},role:{choice:unit.questions[1].answer,checked:'true'},unknown:{choice:'0',checked:true}},passed:true}},tasks)[item.id];
  assert.equal(invalid.text.length,2500);assert.equal(invalid.answers.meaning,undefined);assert.equal(invalid.answers.unknown,undefined);assert.equal(invalid.answers.role.checked,false);assert.equal(invalid.passed,undefined);
  const stale=cleanSupport({[item.id]:{...record,version:0}},tasks)[item.id];assert.deepEqual(stale.answers,{});assert.equal(stale.text,unit.code);
  assert.deepEqual(cleanSupport([],tasks),{});
});

test('typing, questions and learner programs render in one ordered path, with empty typing boxes',async()=>{
  const server=await createServer({server:{middlewareMode:true,ws:false,watch:null},appType:'custom'});
  try{
    const {PreparationApp}=await server.ssrLoadModule('/src/mcc/PreparationApp.jsx');
    const {MccPractise}=await server.ssrLoadModule('/src/practise/MccPractise.jsx');
    const props={profile:{name:'QA',className:'Test'},onSave:()=>true,onLeave:()=>{}};
    const hub=renderToStaticMarkup(React.createElement(MccPractise,props));assert.match(hub,/62/);assert.match(hub,/typing practices/);assert.match(hub,/multiple-choice/);
    for(const item of tasks){
      const html=renderToStaticMarkup(React.createElement(PreparationApp,{...props,problem:binarySorting,initialWork:{current:item.id,screen:'problem'}}));
      const typing=html.indexOf('id="prep-typing"'),questions=html.indexOf('id="prep-understand"'),task=html.indexOf('id="prep-read"'),editor=html.indexOf('id="prep-python"');
      assert.ok(typing>=0&&typing<questions&&questions<task&&task<editor,item.id);
      assert.match(html,/<textarea[^>]*id="typing-entry"[^>]*><\/textarea>/,item.id);
      assert.ok(!html.includes('words per minute'),item.id);assert.ok(!html.includes('Copy to editor'),item.id);
      assert.match(html,/Input, process or output/);assert.match(html,/Check answer/);
    }
    const final=tasks.at(-1);assert.equal(final.support.questions.length,4);assert.equal(final.support.code.split('\n').length,2);assert.ok(!final.starter.includes('leftWrong'));
  }finally{await server.close();}
});

test('practice report includes learning-only work and keeps it separate from program evidence',()=>{
  const state=createPreparationState(binarySorting),item=tasks[0],q=item.support.questions[0];
  const work=state.validatePreparation({practiceSupport:{[item.id]:{version:item.support.version,text:item.support.code,answers:{[q.id]:{choice:q.answer,checked:true}}}}});
  const config={...state.reportConfig,allTasks:[item],lesson:[item]};
  const doc=createReport({name:'Test learner',className:'QA'},work,{lessonConfig:config,rasterize:()=>null});
  const content=doc.internal.pages.flat().join('\n');
  assert.match(content,/Typing and syntax practice/);assert.match(content,/Selected:/);assert.match(content,/Checked: correct/);assert.ok(!content.includes('My reflection'));
  assert.ok(doc.output('arraybuffer').byteLength>1000);
});
