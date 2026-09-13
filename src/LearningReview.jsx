import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Compass } from 'lucide-react';
import { learningGroups, learningTopics, startingPoints, learningStages, cleanLearningReview, startingAdvice, suggestedAction } from './learningReview.js';

export function LearningReview({ after = false, work, setWork, onOpen, onContinue, onBack, saved }) {
  const [groupIndex, setGroupIndex] = useState(0);
  const state = cleanLearningReview(work.learningReview);
  const group = learningGroups[groupIndex];
  const responses = after ? state.after : state.before;
  const selected = learningTopics.find(t => t.id === (after ? state.priority : state.focus));
  const action = after ? suggestedAction(selected, responses[selected?.id]) : selected?.start;
  const needsHelp = after && Object.values(state.after).includes('help');
  function update(fields) { setWork(old => ({ ...old, learningReview: { ...cleanLearningReview(old.learningReview), ...fields } })); }
  function answer(id, value) { setWork(old => { const review = cleanLearningReview(old.learningReview); const key = after ? 'after' : 'before'; return { ...old, learningReview: { ...review, [key]: { ...review[key], [id]: value } } }; }); }
  return <section className="learning-review" aria-labelledby="learning-review-title">
    <div className="review-heading"><span className="card-type">{after ? 'Pause · look at your work · choose a next step' : 'After your Do Now · choose a learning focus'}</span>
      <h2 id="learning-review-title">{after ? 'Learning pit stop: where am I now?' : 'Types of learning: what do I need to get better at?'}</h2>
      <p>{after ? 'Revisit the same statements. Use your code, output or explanation to help you choose. Your stage can be different for each topic.' : 'Look back at your starter. What could you already do, and what needed a reminder? Choose a focus you want to improve.'}</p>
      <p className="review-note">{after ? 'These describe this task today. You can be making progress in one part and need help with another.' : 'Knowledge, skills and understanding describe your learning. You can work on more than one today.'}</p>
    </div>
    {after && <div className="review-starting-focus"><Compass size={20}/><p><b>Your starting focus</b><br/>{learningTopics.find(t => t.id === state.focus)?.title || 'You have not chosen one yet. You can still reflect on what you tried.'}</p></div>}
    {after && <details className="review-stage-guide"><summary>What do the learning stages mean?</summary><dl>{learningStages.map(stage => <div key={stage.id}><dt>{stage.label}</dt><dd>{stage.description}</dd></div>)}</dl></details>}
    <div className="review-layout"><div>
      <div className="review-groups" role="group" aria-label="Kinds of learning">{learningGroups.map((item, n) => <button key={item.name} aria-pressed={groupIndex === n} onClick={() => setGroupIndex(n)}><b>{item.name}</b><span>{item.meaning}</span><small>{learningTopics.filter(t => t.group === item.name && responses[t.id]).length} / 2 reflected on</small></button>)}</div>
      <div className="review-questions" aria-label={group.name + ' reflection'}><h3>{after && group.name === 'Knowledge' ? 'What do I know now?' : group.question}</h3>
        {learningTopics.filter(t => t.group === group.name).map(topic => { const next = suggestedAction(topic, responses[topic.id]); const choice = (after ? learningStages : startingPoints).find(c => c.id === responses[topic.id]); return <div className="review-question" key={topic.id}>
          <label htmlFor={'review-' + topic.id}>{topic.statement}</label><p id={'review-help-' + topic.id}>{after ? topic.after : topic.before}</p>
          <details><summary><BookOpen size={15}/> {topic.exampleLabel || 'See a small example'}</summary><pre><code>{topic.example}</code></pre></details>
          {after && <p className="review-prior">My starting point: <b>{startingPoints.find(c => c.id === state.before[topic.id])?.label || 'Not recorded'}</b></p>}
          <select id={'review-' + topic.id} aria-describedby={'review-help-' + topic.id} value={responses[topic.id] || ''} onChange={e => answer(topic.id, e.target.value)}><option value="">{after ? 'Choose your current stage' : 'Choose your starting point'}</option>{(after ? learningStages : startingPoints).map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
          {after && choice && <p className="review-stage-description">{choice.description}</p>}
          {after && next && <div className="review-feedback" role="status"><b>One next step</b><p>{next[0]}</p></div>}
        </div>; })}
      </div>
      <div className="review-group-nav"><button className="text-button" disabled={!groupIndex} onClick={() => setGroupIndex(n => n - 1)}><ArrowLeft size={16}/> Previous group</button>{groupIndex < 2 ? <button className="outline-button" onClick={() => setGroupIndex(n => n + 1)}>Next: {learningGroups[groupIndex + 1].name}<ArrowRight size={16}/></button> : <span>You can revisit any group.</span>}</div>
    </div><aside className="review-focus" aria-label="My learning focus">
      <span className="box-label"><Compass size={17}/> MY NEXT STEP</span><h3>{after ? 'What will help me move forward?' : 'Choose what to get better at'}</h3>
      <p className="review-count">{Object.keys(responses).length} of {learningTopics.length} statements reflected on</p>
      <p>{after ? 'Choose one topic. Use its suggestion, explain your choice or ask for help.' : startingAdvice(state)}</p>
      <label htmlFor="review-focus">{after ? 'Which part should I focus on next?' : 'What do I want to get better at?'}</label>
      <select id="review-focus" value={after ? state.priority : state.focus} onChange={e => update({ [after ? 'priority' : 'focus']: e.target.value })}><option value="">Choose one topic</option>{learningGroups.map(item => <optgroup key={item.name} label={item.name}>{learningTopics.filter(t => t.group === item.name).map(topic => <option key={topic.id} value={topic.id}>{topic.title}</option>)}</optgroup>)}</select>
      {selected && <div className="review-feedback"><b>{after ? 'My next action' : 'A place to start'}</b><p>{action?.[0] || 'Choose your stage for this topic to see a next step, or tell your teacher what is unclear.'}</p>{action && <button className="text-button" onClick={() => onOpen(action[1])}>Open this practice<ArrowRight size={16}/></button>}</div>}
      <label htmlFor="review-evidence">{after ? 'What in my work supports my choice?' : 'What helped me choose this focus?'}</label>
      <p className="review-note">{after ? 'Name a line, a test or a change. You can also write a specific question for help.' : 'Give one starter example, or record the focus you discussed with your teacher.'}</p>
      <textarea id="review-evidence" rows={4} maxLength={3000} value={after ? state.evidence : state.reason} onChange={e => update({ [after ? 'evidence' : 'reason']: e.target.value })} placeholder={after ? 'I changed… This showed… My next step is…' : 'I could already… I needed help with…'}/>
      {needsHelp && <p className="review-help-now" role="status"><b>It is okay to pause.</b> Show your teacher the statement you chose. You do not need to finish every check first.</p>}
      <p className="review-note">{after ? 'Need help now? Tell your teacher or show this page. Saving a reflection does not send an alert.' : 'These are your own reflections. Your teacher can help you check them against your work.'}</p>
    </aside></div>
    <div className="review-bottom"><button className="text-button" onClick={onBack}><ArrowLeft size={17}/> Back to my work</button><span role="status">{saved ? 'Saved on this device · included in your PDF' : 'Saving unavailable · download a backup'}<small>You can continue if you are unsure. These choices are not marks.</small></span><button className="primary-button" onClick={onContinue}>Continue lesson<ArrowRight size={17}/></button></div>
  </section>;
}
