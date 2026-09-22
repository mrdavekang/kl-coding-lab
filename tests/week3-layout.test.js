import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createServer} from 'vite';

// Component rendering verifies lesson structure; it does not claim browser interaction or visual QA.
test('Week 3 exposes examples, reflection choices and navigation without hidden menus',async()=>{
 const server=await createServer({server:{middlewareMode:true,ws:false,watch:null},appType:'custom'});
 try {
  const {Week3App}=await server.ssrLoadModule('/src/week3/Week3App.jsx');
  const {tasks,stages}=await server.ssrLoadModule('/src/week3/content.js');
  const {simpleGuide,FenceDemo}=await server.ssrLoadModule('/src/week3/SimpleStart.jsx');
  const render=work=>renderToStaticMarkup(React.createElement(Week3App,{profile:{name:'Review',className:'QA'},initialWork:{drafts:{},...work},onSave:()=>true,onLeave:()=>{}}));
  for(const task of tasks){
   const html=render({stage:task.level?'main2':task.group,task:task.id});
   assert.ok(!/<details|<summary|<select/.test(html),task.id);
   if(simpleGuide(task.id)&&task.id!=='exit'){
    assert.ok(html.includes('1. See an example'),task.id);
    assert.ok(html.indexOf('1. See an example')<html.indexOf('2. Your task'),task.id);
   }
  }
  for(const stage of stages)assert.ok(!/<details|<summary|<select/.test(render({stage:stage.id})),stage.id);
  const pitstop=render({stage:'pitstop1',reviews:{before:{before:{condition:'new'}},pitstop1:{after:{condition:'help'},priority:'condition',evidence:'I need help.'}}});
  assert.ok(pitstop.includes('I need help.'));
  assert.ok(pitstop.includes('type="radio"'));
  assert.ok(render({stage:'main2',task:'g1'}).includes('Next: Change one symbol'));
  assert.ok(!renderToStaticMarkup(React.createElement(FenceDemo)).includes('<button'));
 } finally {await server.close();}
});
