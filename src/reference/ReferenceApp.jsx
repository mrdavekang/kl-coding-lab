import React,{useEffect,useRef,useState} from 'react';
import {BookOpen,CodeXml,Search,ArrowLeft,ArrowRight} from 'lucide-react';
import {topics,topicById,referenceGroups,searchTopics} from './content.js';
import {readTopic,referenceUrl,practiceUrl,loadReferenceDrafts,saveReferenceDrafts} from './state.js';
import {practiceCourse} from '../practise/catalog.js';
import {ReferenceVisual} from './ReferenceVisual.jsx';
import {ReferencePlayground} from './ReferencePlayground.jsx';
import '../mcc/idle.css';
import './reference.css';
const currentHref=()=>typeof location==='undefined'?'https://example.test/?week=mcc-reference':location.href;
const Code=({children})=><pre className="ref-code"><code>{children}</code></pre>;
export function ReferenceApp({initialTopic=null}){
 const [topicId,setTopicId]=useState(()=>topicById(initialTopic)?.id||readTopic(typeof location==='undefined'?'':location.search)),[query,setQuery]=useState(''),[menu,setMenu]=useState(false),[labOpen,setLabOpen]=useState(false),[labBusy,setLabBusy]=useState(false),[notice,setNotice]=useState(''),[drafts,setDrafts]=useState(loadReferenceDrafts),[saved,setSaved]=useState(true);
 const heading=useRef(),topicList=useRef(),latest=useRef(drafts);
 const topic=topicById(topicId)||topics[0],index=topics.indexOf(topic),found=searchTopics(query),foundIds=new Set(found.map(t=>t.id));latest.current=drafts;
 useEffect(()=>{if(window.matchMedia('(min-width:901px)').matches){const nav=topicList.current,current=nav?.querySelector('[aria-current=page]');if(current){const box=current.getBoundingClientRect(),frame=nav.getBoundingClientRect();if(box.bottom>frame.bottom)nav.scrollTop+=box.bottom-frame.bottom+10;else if(box.top<frame.top)nav.scrollTop-=frame.top-box.top+10;}}},[topic.id,query]);
 useEffect(()=>{document.title=`${topic.title} · MCC Python Reference · KL Coding Lab`;},[topic.id]);
 useEffect(()=>{const back=()=>{setTopicId(readTopic(location.search));setMenu(false);window.scrollTo({top:0});};window.addEventListener('popstate',back);return()=>window.removeEventListener('popstate',back);},[]);
 useEffect(()=>{const timer=setTimeout(()=>setSaved(saveReferenceDrafts(drafts)),250);return()=>clearTimeout(timer);},[drafts]);
 useEffect(()=>{const persist=()=>saveReferenceDrafts(latest.current);window.addEventListener('pagehide',persist);return()=>{persist();window.removeEventListener('pagehide',persist);};},[]);
 function navigate(event,id){
  event?.preventDefault();if(labBusy){setNotice('Choose Stop in the Python desk before changing topics.');return;}
  setTopicId(id);setMenu(false);setNotice('');history.pushState(null,'',referenceUrl(currentHref(),id));window.scrollTo({top:0});requestAnimationFrame(()=>heading.current?.focus({preventScroll:true}));
 }
 function openLab(){setLabOpen(true);requestAnimationFrame(()=>document.getElementById('reference-playground')?.scrollIntoView({behavior:'smooth',block:'start'}));}
 function changeDraft(change){setDrafts(old=>({...old,[topic.id]:{...old[topic.id],...change}}));}
 return <div className="reference-app">
  <a className="ref-skip" href="#reference-main">Skip to reference topic</a>
  <header className="ref-header"><a className="ref-brand" href={referenceUrl(currentHref(),'start').toString()} onClick={e=>navigate(e,'start')}><CodeXml size={25}/><span>KL <b>Coding Lab</b></span></a><span className="ref-header-label"><BookOpen size={18}/> Python reference</span><a className="ref-outline" href={practiceUrl(currentHref()).toString()}>MCC Practise <ArrowRight size={16}/></a></header>
  <div className="ref-layout">
   <aside className="ref-sidebar" aria-label="Python reference topics"><div className="ref-sidebar-top"><b>Find the Python you need</b><button className="ref-menu-toggle" aria-expanded={menu} aria-controls="reference-topic-list" onClick={()=>setMenu(!menu)}>{menu?'Close topics':'Browse topics'}</button></div>
    <form className="ref-search" role="search" onSubmit={e=>{e.preventDefault();if(found[0])navigate(null,found[0].id);}}><label htmlFor="reference-search"><Search size={16}/>Search topics</label><input id="reference-search" type="search" placeholder="Try input, index, count…" value={query} onChange={e=>{setQuery(e.target.value);setMenu(true);}} autoComplete="off"/>{query&&<button type="button" className="ref-search-clear" onClick={()=>setQuery('')}>Clear search</button>}</form>
    {query&&<p className="ref-search-count" role="status">{found.length?`${found.length} topic${found.length===1?'':'s'} found`:'No topics found. Try input, index, counter or error.'}</p>}
    <nav ref={topicList} id="reference-topic-list" className={menu?'ref-topic-list is-open':'ref-topic-list'} aria-label="Reference topics">{referenceGroups.map(group=>{const rows=topics.filter(t=>t.group===group&&foundIds.has(t.id));return rows.length?<section key={group}><h2>{group}</h2><ul>{rows.map(item=><li key={item.id}><a href={referenceUrl(currentHref(),item.id).toString()} aria-current={item.id===topic.id?'page':undefined} onClick={e=>navigate(e,item.id)}>{item.title}</a></li>)}</ul></section>:null;})}</nav>
   </aside>
   <main id="reference-main" className="ref-main">
    <p className="ref-eyebrow">MCC PRACTISE · STUDENT REFERENCE</p><h1 ref={heading} tabIndex={-1}>{topic.title}</h1><p className="ref-lead">{topic.summary}</p>
    {topic.id==='start'&&<><p className="ref-welcome">Look up a word, read a short example, then try it. These topics follow the Python used in Binary Sorting, Winning Streak and their answer-file practices. No student profile is needed to read this reference.</p><div className="ref-quick-links" aria-label="Popular lookups">{['print','input','indexing','counters','errors'].map(id=><a key={id} href={referenceUrl(currentHref(),id).toString()} onClick={e=>navigate(e,id)}>{topicById(id).title}</a>)}</div></>}
    {notice&&<p className="ref-notice" role="status">{notice}</p>}
    <section className="ref-syntax"><h2>{['start','streak-counter','zero-section','errors','files'].includes(topic.id)?'Idea at a glance':'Syntax at a glance'}</h2><Code>{topic.syntax}</Code></section>
    <section className="ref-explanation" aria-label="What it means">{topic.explanation.map(p=><p key={p}>{p}</p>)}</section>
    {topic.widget&&<ReferenceVisual key={topic.id} kind={topic.widget}/>}
    {topic.table&&<div className="ref-table-wrap"><table className="ref-data-table"><caption>{topic.title}: compare the cases</caption><thead><tr>{topic.table.head.map(x=><th key={x}>{x}</th>)}</tr></thead><tbody>{topic.table.rows.map((row,i)=><tr key={i}>{row.map((x,j)=><td key={j}>{x}</td>)}</tr>)}</tbody></table></div>}
    <section className="ref-example" aria-labelledby="reference-example-title"><p className="ref-eyebrow">SMALL WORKING EXAMPLE</p><h2 id="reference-example-title">See it in Python</h2><Code>{topic.example.code}</Code><div className="ref-example-data"><div><h3>Example input</h3><pre>{topic.example.input.trimEnd()||'(no input needed)'}</pre></div><div><h3>Output for this example</h3><pre>{topic.example.output||'(nothing printed)'}</pre></div></div><button className="ref-primary" onClick={openLab}>Try it yourself <ArrowRight size={17}/></button></section>
    {labOpen&&<><p className="ref-save-state" role="status">{saved?'Your reference drafts save in this browser.':'Saving is unavailable. Use Save .py to keep your code.'}</p><ReferencePlayground topic={topic} draft={drafts[topic.id]} onChange={changeDraft} onBusy={setLabBusy}/></>}
    <section className="ref-parts"><h2>Read the parts</h2><div className="ref-table-wrap"><table className="ref-data-table"><thead><tr><th>Python or symbol</th><th>Meaning</th><th>Job</th></tr></thead><tbody>{topic.parts.map(([code,meaning,role])=><tr key={code}><th scope="row"><code>{code}</code></th><td>{meaning}</td><td><span className="ref-role">{role}</span></td></tr>)}</tbody></table></div><p className="ref-table-note">Input receives information. Process works with it. Output shows or saves a result. A row can combine jobs.</p></section>
    <aside className="ref-mistake"><h2>Watch out for this</h2><p>{topic.mistake}</p></aside>
    <section className="ref-practice-links"><h2>Practise this skill</h2><p>Use these course levels when you want more practice.</p><ul>{topic.practice.map(([courseId,taskId])=>{const course=practiceCourse(courseId),task=course.taskById(taskId);return <li key={courseId+taskId}><a href={practiceUrl(currentHref(),courseId,taskId).toString()} target="_blank" rel="noopener noreferrer"><b>{course.shortTitle}</b><span>{task.title} ↗</span></a></li>;})}</ul></section>
    <section className="ref-related"><h2>Related lookups</h2><div>{topic.related.map(id=><a key={id} href={referenceUrl(currentHref(),id).toString()} onClick={e=>navigate(e,id)}>{topicById(id).title}</a>)}</div>{topic.source&&<p><a href={topic.source} target="_blank" rel="noopener noreferrer">Read more in the official Python documentation ↗</a></p>}</section>
    <nav className="ref-bottom" aria-label="Previous and next reference topic">{index>0?<a className="ref-outline" href={referenceUrl(currentHref(),topics[index-1].id).toString()} onClick={e=>navigate(e,topics[index-1].id)}><ArrowLeft size={16}/>{topics[index-1].title}</a>:<span/>}{index<topics.length-1&&<a className="ref-primary" href={referenceUrl(currentHref(),topics[index+1].id).toString()} onClick={e=>navigate(e,topics[index+1].id)}>{topics[index+1].title}<ArrowRight size={16}/></a>}</nav>
   </main>
  </div><footer className="ref-footer"><span>KL Coding Lab · MCC Python Reference</span><span>{topics.length} lookups · Read · Try · Return to your task</span></footer>
 </div>;
}
