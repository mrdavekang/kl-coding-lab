import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createServer} from 'vite';

test('Week 5 renders every stage and teaches before each task; preferences never imply automatic submission',async()=>{
  const server=await createServer({server:{middlewareMode:true,ws:false,watch:null},appType:'custom'});
  try{
    const {Week5App}=await server.ssrLoadModule('/src/week5/Week5App.jsx');
    const {tasks,stages}=await server.ssrLoadModule('/src/week5/content.js');
    const render=work=>renderToStaticMarkup(React.createElement(Week5App,{profile:{name:'Review',className:'QA'},initialWork:work,onSave:()=>true,onLeave:()=>{}}));
    for(const stage of stages)assert.ok(render({stage:stage.id}).includes(stage.label),stage.id);
    for(const task of tasks){
      const html=render({stage:task.group,task:task.id});
      assert.ok(html.includes(task.exampleTitle),task.id);
      assert.ok(html.indexOf('1 · READ FIRST')<html.indexOf('2 · STUDY AN EXAMPLE'),task.id);
      assert.ok(html.indexOf('Written tutor · every code line')<html.indexOf('Your answer.py'),task.id);
      assert.ok(html.includes('Written tutor · every iteration'),task.id);
      assert.ok(html.includes('Open line-by-line tutor'),task.id);
    }
    const briefing=render({stage:'read2'});assert.ok(briefing.includes('School option · awaiting confirmation'));assert.ok(briefing.includes('Reveal discussion answers'));assert.ok(briefing.includes('CODE FORMAT'));
    const plenary=render({stage:'plenary'});assert.ok(plenary.includes('Nothing is sent automatically.'));assert.ok(plenary.includes('School'));assert.ok(plenary.includes('Home'));
    const ide=render({stage:'main2'});assert.ok(ide.includes('Close and reopen'));assert.ok(ide.includes('Load input file'));assert.ok(ide.includes('Download output file'));
  }finally{await server.close();}
});
