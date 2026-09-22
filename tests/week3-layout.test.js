import test from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createServer} from 'vite';
test('every challenge shows the scenario and sample before the IDE, without hidden menus or solutions',async()=>{
 const server=await createServer({server:{middlewareMode:true,ws:false,watch:null},appType:'custom'});
 try{const {Week3App}=await server.ssrLoadModule('/src/week3/Week3App.jsx');const {tasks,stages,curriculum}=await server.ssrLoadModule('/src/week3/content.js');const render=work=>renderToStaticMarkup(React.createElement(Week3App,{profile:{name:'Review',className:'QA'},initialWork:{curriculum,drafts:{},...work},onSave:()=>true,onLeave:()=>{}}));
 for(const t of tasks){const html=render({stage:t.group,task:t.id});assert.ok(!/<details|<summary|<select/.test(html),t.id);assert.ok(html.includes(t.title),t.id);assert.ok(html.indexOf('Sample · what should happen')<html.indexOf('Your Python code'),t.id);assert.ok(html.includes('Small clues'));assert.ok(!html.includes('Reference Python'));assert.ok(!html.includes('Explore this example'));assert.equal(html.includes('id="mcc-input"'),t.needsInput,t.id);}
 for(const stage of stages)assert.ok(!/<details|<summary|<select/.test(render({stage:stage.id})),stage.id);
 const pitstop=render({stage:'pitstop1',reviews:{before:{before:{numbers:'new'}},pitstop1:{after:{numbers:'help'},priority:'numbers',evidence:'I need help.'}}});assert.ok(pitstop.includes('I need help.'));assert.ok(pitstop.includes('type="radio"'));assert.ok(render({stage:'main1',task:'rev-w1-1'}).includes('Next: Juice stall'));
 }finally{await server.close();}
});
