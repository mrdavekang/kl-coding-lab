import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createServer} from 'vite';

test('the real Python shell retains variables, restarts modules, handles blocks and recovers from errors',()=>{
  const run=spawnSync('python3',['tests/idle_test.py'],{encoding:'utf8'});
  assert.equal(run.status,0,run.stdout+'\n'+run.stderr);
});

test('both preparation sections teach, plan, edit, run in the shell and reflect in that order',async()=>{
  const server=await createServer({server:{middlewareMode:true,ws:false,watch:null},appType:'custom'});
  try{
    const {PreparationApp}=await server.ssrLoadModule('/src/mcc/PreparationApp.jsx');
    const {twoPointers}=await server.ssrLoadModule('/src/mco/twoPointers.js');
    for(const problem of [undefined,twoPointers]){
      const task=problem?.tasks.find(t=>!t.reasoning);
      const html=renderToStaticMarkup(React.createElement(PreparationApp,{profile:{name:'QA',className:'Preview'},initialWork:{screen:'problem',current:task?.id||'double'},problem,onSave:()=>true,onLeave:()=>{}}));
      const order=['id="prep-read"','id="prep-plan"','id="prep-python"','Python Editor','Python Shell transcript','id="prep-reflect"'].map(label=>html.indexOf(label));
      assert.ok(order.every((at,i)=>at>=0&&(!i||at>order[i-1])),order.join(','));
      assert.ok(html.includes('In the Shell, like IDLE'));
      assert.ok(html.includes('Use prepared test input'));
      assert.ok(!html.includes('id="prep-input"'),'prepared input is optional, rather than the default experience');
      assert.ok(!html.includes('prep-learning')&&!html.includes('prep-coding'),'no separate learning/coding columns');
    }
  }finally{await server.close();}
});
