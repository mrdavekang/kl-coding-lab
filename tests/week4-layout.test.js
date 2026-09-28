import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createServer} from 'vite';

test('every Week 4 task teaches through reading, example and tutor before the pupil editor',async()=>{
  const server=await createServer({server:{middlewareMode:true,ws:false,watch:null},appType:'custom'});
  try{
    const {Week4App}=await server.ssrLoadModule('/src/week4/Week4App.jsx');
    const {tasks,curriculum}=await server.ssrLoadModule('/src/week4/content.js');
    const render=work=>renderToStaticMarkup(React.createElement(Week4App,{profile:{name:'Review',className:'QA'},initialWork:{curriculum,drafts:{},...work},onSave:()=>true,onLeave:()=>{}}));
    for(const task of tasks){
      const html=render({stage:task.group,task:task.id});
      assert.ok(html.includes(task.title),task.id);
      assert.ok(html.includes('1 · READ FIRST'),task.id);
      assert.ok(html.includes('2 · STUDY AN EXAMPLE'),task.id);
      assert.ok(html.includes('Written tutor · every iteration'),task.id);
      assert.ok(html.includes('Open line-by-line tutor'),task.id);
      assert.ok(html.includes(task.exampleTitle),task.id+' example heading');
      assert.ok(html.includes('<pre class="mcc-code-text"><code>'),task.id+' example code block');
      assert.ok(html.indexOf('1 · READ FIRST')<html.indexOf('2 · STUDY AN EXAMPLE'),task.id);
      assert.ok(html.indexOf('2 · STUDY AN EXAMPLE')<html.indexOf('Your answer.py'),task.id);
      assert.equal(html.includes('id="mcc-input"'),!!task.needsInput,task.id);
    }
  }finally{await server.close();}
});
