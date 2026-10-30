import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {createServer} from 'vite';
import {readWeek,pageUrl,pages} from '../src/navigation.js';
import {examples,newProgram,replaceProgram,restoreProgram,cleanPlayground,savePlayground,loadPlayground,PLAYGROUND_KEY,CODE_LIMIT,INPUT_LIMIT,readPythonFile,readTextFile,pythonFilename} from '../src/playground/state.js';

test('the default landing is the public playground; explicit lesson and reference deep links keep their routes',()=>{
 for(const search of ['','?classId=class-1','?week=unknown','?week=0'])assert.equal(readWeek(search),'playground');
 for(const page of pages)assert.equal(readWeek('?week='+page),page);
 const original='https://example.test/kl-coding-lab/?week=mcc-practise&problem=binary-sorting&exercise=bs-echo&activity=1&classId=class-1&teacher=1#editor';
 for(const page of pages){const link=pageUrl(original,page);assert.equal(link.origin,'https://example.test');assert.equal(link.pathname,'/kl-coding-lab/');assert.equal(link.searchParams.get('week'),String(page));assert.equal(link.searchParams.get('classId'),'class-1');assert.equal(link.searchParams.get('teacher'),'1');assert.equal(link.hash,'');for(const key of ['problem','activity','exercise','topic'])assert.equal(link.searchParams.has(key),false);}
});
test('starter examples execute with their advertised input/output and default to interactive Shell input',()=>{
 const script='import json,sys,io,contextlib\nfor item in json.load(sys.stdin):\n old=sys.stdin;out=io.StringIO()\n try:\n  sys.stdin=io.StringIO(item["input"])\n  with contextlib.redirect_stdout(out):exec(compile(item["code"],"main.py","exec"),{})\n finally:sys.stdin=old\n assert out.getvalue()==item["output"],(item["id"],out.getvalue())\nprint("4 working starter programs")';
 const result=spawnSync('python3',['-c',script],{input:JSON.stringify(examples),encoding:'utf8'});assert.equal(result.status,0,result.stdout+result.stderr);assert.match(result.stdout,/4 working/);
 for(const example of examples){const program=newProgram(example.id);assert.equal(program.mode,'shell');assert.equal(program.code,example.code);assert.equal(program.filename,example.id+'.py');}
 assert.equal(newProgram('blank').code,'');
});
test('opening examples or new files retains recoverable previous code, filename, input and preferences',()=>{
 let work={program:{...newProgram('ask'),code:'print("My original")',input:'Ada\n',filename:'my-work.py',mode:'prepared',fontSize:20},previous:[]};
 const original=structuredClone(work.program);work=replaceProgram(work,newProgram('hello'));work=replaceProgram(work,newProgram('blank'));work=restoreProgram(work);assert.equal(work.program.exampleId,'hello');work=restoreProgram(work);assert.deepEqual(work.program,original);assert.equal(restoreProgram(work),work);
 for(let i=0;i<12;i++)work=replaceProgram(work,{...newProgram('blank'),code:'print('+i+')'});assert.equal(work.previous.length,5);assert.throws(()=>replaceProgram(work,{...newProgram(),code:'x'.repeat(CODE_LIMIT+1)}),/too large/);
});
test('playground storage is separate from student profiles and reference drafts, rejects unsafe sizes and preserves empty code',()=>{
 const map=new Map([['kl-coding-lab.student.v2.test','original course work'],['kl-coding-lab.mcc-reference.v1','original reference draft']]);globalThis.localStorage={getItem:key=>map.get(key)??null,setItem:(key,value)=>map.set(key,value)};
 const work=replaceProgram(cleanPlayground({}),{...newProgram('blank'),code:'',filename:'my-empty.py',input:'3\n010\n',mode:'prepared'});assert.ok(savePlayground(work));assert.deepEqual(loadPlayground(),work);assert.equal(map.get('kl-coding-lab.student.v2.test'),'original course work');assert.equal(map.get('kl-coding-lab.mcc-reference.v1'),'original reference draft');
 const before=map.get(PLAYGROUND_KEY);assert.equal(savePlayground({...work,program:{...work.program,code:'x'.repeat(CODE_LIMIT+1)}}),false);assert.equal(map.get(PLAYGROUND_KEY),before);
 map.set(PLAYGROUND_KEY,'bad json');assert.equal(loadPlayground().program.code,newProgram().code);assert.equal(cleanPlayground({program:{code:'print(1)',mode:'bad',fontSize:999,filename:'../../my.py'}}).program.filename,'my.py');
 globalThis.localStorage={getItem:()=>{throw new Error('blocked');},setItem:()=>{throw new Error('full');}};assert.equal(loadPlayground().program.code,newProgram().code);assert.equal(savePlayground(work),false);
});
test('opening a Python file reads plain code without running it and rejects wrong, binary or oversized files',async()=>{
 const file=(name,text,size=text.length)=>({name,size,text:async()=>text});
 const program=await readPythonFile(file('my-program.py','name = input()\nprint(name)'));assert.equal(program.code,'name = input()\nprint(name)');assert.equal(program.filename,'my-program.py');assert.equal(program.mode,'shell');
 await assert.rejects(readPythonFile(file('image.png','not Python')),/ends in .py/);await assert.rejects(readPythonFile(file('large.py','',128001)),/128 KB/);await assert.rejects(readPythonFile(file('large.py','x'.repeat(CODE_LIMIT+1))),/50,000/);await assert.rejects(readPythonFile(file('binary.py','abc\0')),/text Python/);assert.equal(pythonFilename('../../answer'), 'answer.py');
});
test('text inputs retain spaces, blank lines and large cases while normalising file line endings',async()=>{
 const file=(name,text,size=text.length)=>({name,size,text:async()=>text});
 const text=await readTextFile(file('sample.txt','\uFEFF4\r\n 0 1 \r\n\r\n'));assert.deepEqual(text,{filename:'sample.txt',text:'4\n 0 1 \n\n'});
 const large='500000\n'+'1 '.repeat(500000)+'\n';const loaded=await readTextFile(file('in_01.txt',large));assert.equal(loaded.text,large);const work=replaceProgram(cleanPlayground({}),{...newProgram('blank'),input:loaded.text,inputFilename:loaded.filename,mode:'prepared'});assert.equal(work.program.input.length,large.length);assert.equal(work.program.inputFilename,'in_01.txt');
 await assert.rejects(readTextFile(file('data.csv','0,1')),/ends in .txt/);await assert.rejects(readTextFile(file('bad.txt','a\0')),/plain text/);await assert.rejects(readTextFile(file('big.txt','',8000001)),/8 MB/);await assert.rejects(readTextFile(file('long.txt','x'.repeat(INPUT_LIMIT+1))),/4 million/);
});
test('the public landing renders the editor, Shell, tools, help and course navigation before a student profile is required',async()=>{
 const server=await createServer({server:{middlewareMode:true,ws:false,watch:null},appType:'custom'});
 try{
  const {PlaygroundApp}=await server.ssrLoadModule('/src/playground/PlaygroundApp.jsx');const html=renderToStaticMarkup(React.createElement(PlaygroundApp));
  for(const label of ['Python playground','Python Editor','Python Shell','Open…','Download .py','Say hello','Ask a question','Repeat five times','Sample input','MCC Practise','MCO Tryout','Week 1','Week 5'])assert.ok(html.includes(label),label);
  assert.ok(html.indexOf('Python Editor')<html.indexOf('Python Shell'));assert.ok(!html.includes('Start my lesson'));assert.ok(!html.includes('student-name'));
  const {PlaygroundLink}=await server.ssrLoadModule('/src/playground/PlaygroundLink.jsx');const link=renderToStaticMarkup(React.createElement(PlaygroundLink));assert.match(link,/target="_blank"/);assert.match(link,/noopener/);assert.match(link,/week=playground/);
  const main=readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');assert.ok(main.indexOf("if(week==='playground')")<main.indexOf('if (!profile)'));
 }finally{await server.close();}
});
