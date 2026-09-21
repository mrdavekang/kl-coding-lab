import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {stages,main1,main2,extensions,tasks,checkSpec,levels,plenary} from '../src/week3/content.js';
import {validateWeek3,reviewAt,updateReview,progress,answerResult,reportConfig,topics} from '../src/week3/state.js';
import {createProfile,saveProfileLesson,listProfiles} from '../src/storage.js';
import {recordAttempt,taskStatus,evidenceTasks} from '../src/evidence.js';
import {createReport} from '../src/report.js';

test('Week 3 exposes ten stages, independent 3+5 core practices and exactly 2/4/3/1 extensions',()=>{
 assert.equal(stages.length,10);assert.equal(main1.length,3);assert.equal(main2.length,5);
 assert.deepEqual(levels.map(l=>extensions.filter(t=>t.level===l).length),[2,4,3,1]);
 assert.equal(new Set(tasks.map(t=>t.id)).size,tasks.length);
 for(const t of [...main1,...main2,...extensions]){assert.ok(t.learn);assert.ok(t.example);assert.ok(t.goal);assert.ok(t.teacher);assert.ok(t.hints.length);if(t.kind!=='output'){assert.ok(t.solution);assert.ok(t.tests.length>=3);}}
 for(const topic of topics){assert.ok(tasks.some(t=>t.id===topic.start[1])||stages.some(s=>s.id===topic.start[1]));}
});
test('all Week 3 Python reference solutions, examples and fresh-test anti-hardcoding checks execute',()=>{
 const data=tasks.map(t=>({...t,spec:checkSpec(t)}));
 const run=spawnSync('python3',[new URL('./week3_checks.py',import.meta.url).pathname],{input:JSON.stringify(data),encoding:'utf8',maxBuffer:2e6});
 assert.equal(run.status,0,run.stdout+'\n'+run.stderr);
 assert.match(run.stdout,/reference solutions passed/);
});
test('manual answer evidence is distinct from program evidence and edits invalidate a pass',()=>{
 const task=main1[0];let work={drafts:{},answers:{a1:'2'},passed:{a1:'2'}};
 assert.equal(progress(work),1);assert.equal(taskStatus(task,work),'Current answer passed');
 assert.equal(answerResult(task,'4').passed,false);assert.equal(answerResult(task,'The answer is 2').passed,false);
 work.answers.a1='4';assert.equal(progress(work),0);
 work.answers.a1='2';work.drafts.b1=main2[0].solution;work.passed.b1=main2[0].solution;
 assert.equal(progress(work),2);assert.equal(evidenceTasks(work,tasks).length,2);
});
test('Week 3 backup preserves separate drafts, samples, output files, two pit stops and recoverable reset',()=>{
 let work={drafts:{b1:'my code'},answers:{a1:'2'},inputs:{b4:'2 3\n...\n...\n'},exampleDrafts:{b1:'example code'},exampleInputs:{b4:'2 4\n'},recoverable:{b1:'previous'},stage:'main2',task:'b1',traceEvidence:{b1:{code:'x=1',description:'x changes'}}};
 work=updateReview(work,'focus',{before:{condition:'new'},focus:'condition',reason:'This is new.'});
 work=updateReview(work,'pitstop1',{after:{condition:'new'},priority:'condition',evidence:'One step.'});
 work=updateReview(work,'pitstop2',{after:{condition:'consolidating'},priority:'tests',evidence:'A fresh input.'});
 const restored=validateWeek3(JSON.parse(JSON.stringify(work)));
 assert.equal(restored.drafts.b1,'my code');assert.equal(restored.answers.a1,'2');assert.equal(restored.exampleDrafts.b1,'example code');assert.equal(restored.recoverable.b1,'previous');
 assert.equal(reviewAt(restored,'pitstop1').after.condition,'new');assert.equal(reviewAt(restored,'pitstop2').after.condition,'consolidating');assert.equal(reviewAt(restored,'pitstop2').before.condition,'new');
 assert.equal(restored.traceEvidence.b1.description,'x changes');
 assert.equal(validateWeek3({drafts:{},stage:'bad',task:'bad',answers:{unknown:'9'}}).stage,'ready');
});
test('Week 3 saves without overwriting earlier lessons and rejects stale concurrent writes',()=>{
 const data=new Map();globalThis.localStorage={get length(){return data.size;},key:i=>[...data.keys()][i],getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,String(v))};
 const profile=createProfile('MCC student','QA');saveProfileLesson(profile,{drafts:{hello:'week one'}},'work');saveProfileLesson(profile,{drafts:{desk:'week two'}},'week2Work');const stale=structuredClone(profile);
 assert.equal(saveProfileLesson(profile,{drafts:{b1:'week three'}},'week3Work'),true);
 assert.equal(saveProfileLesson(stale,{drafts:{}},'week3Work'),false);
 const stored=listProfiles()[0];assert.equal(stored.work.drafts.hello,'week one');assert.equal(stored.week2Work.drafts.desk,'week two');assert.equal(stored.week3Work.drafts.b1,'week three');
});
test('Week 3 PDF contains manual answers, student code, test evidence and both reflections',()=>{
 let work={drafts:{b1:'print(3)'},answers:{a1:'2'},explanations:{a1:'Two new pieces.'},passed:{a1:'2'}};
 work=updateReview(work,'pitstop1',{after:{io:'new'},evidence:'First checkpoint.'});work=updateReview(work,'pitstop2',{after:{io:'consolidating'},evidence:'Second checkpoint.'});
 work=recordAttempt(work,{taskId:'a1',code:'2',kind:'check',inputs:[main1[0].sampleInput],output:'2'},{type:'checked',result:answerResult(main1[0],'2')});
 // The production report supports Unicode through a browser canvas. Use ASCII copies for this non-browser check.
 const config={...reportConfig,allTasks:reportConfig.allTasks.map(t=>({...t,title:t.title.replace(/[^\x20-\x7e]/g,' ')}))};
 const doc=createReport({name:'Test Student',className:'QA'},work,{lessonConfig:config,rasterize:(text)=>({data:'',width:text.length*5,height:12,baseline:10})});
 assert.ok(doc.getNumberOfPages()>=4);assert.ok(doc.output('arraybuffer').byteLength>1000);
 const text=doc.internal.pages.flat().join('\n');
 for(const expected of ['First checkpoint.', 'Second checkpoint.', 'Two new pieces.', 'print', 'My answer file']) assert.ok(text.includes(expected),expected+' missing from PDF');
});
