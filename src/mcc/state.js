import {validateWork} from '../evidence.js';
import {activities, tasks, taskById, problemId, problemTitle} from './content.js';

const object = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
const text = value => typeof value === 'string' ? value.slice(0,3000) : '';
export const planFields = [['input','Input','What information will I receive? What do its numbers and symbols mean?'],['process','Process','What smaller jobs must my program perform?'],['output','Output','What exactly must my program display?'],['lookup','Find out','What Python syntax do I need to find out about?'],['prediction','Predict and test','What small input will I try? What output do I expect?']];

export function validatePreparation(value) {
  const source = object(value);
  const clean = validateWork({...source,drafts:object(source.drafts)},tasks);
  clean.current = taskById(source.current) ? source.current : tasks[0].id;
  clean.screen = source.screen === 'problem' ? 'problem' : 'overview';
  clean.inputs = {}; clean.plans = {}; clean.readiness = {};
  for (const item of tasks) {
    if (typeof source.inputs?.[item.id] === 'string') clean.inputs[item.id] = source.inputs[item.id].slice(0,700000);
    clean.plans[item.id] = {};
    for (const [field] of planFields) clean.plans[item.id][field] = text(source.plans?.[item.id]?.[field]);
  }
  for (const activity of activities) clean.readiness[activity.id] = source.readiness?.[activity.id] === true;
  return clean;
}
export function taskPassed(work,item) {return work.passed?.[item.id] !== undefined && work.passed[item.id] === (work.drafts?.[item.id] ?? item.starter);}
export function progress(work) {return tasks.filter(item=>taskPassed(work,item)).length;}
export function activityPassed(work,activity) {return activity.exercises.every(item=>taskPassed(work,item));}
export function locationFor(search,work) {
  const query = new URLSearchParams(search);
  if (query.get('problem') !== problemId) return {screen:work.screen,current:work.current};
  const item = taskById(query.get('exercise'));
  const activity = activities[Number(query.get('activity'))-1];
  return {screen:'problem',current:item?.id || activity?.exercises[0].id || work.current};
}
export function preparationUrl(href,screen,current) {
  const url = new URL(href);
  url.searchParams.set('week','mcc');
  if (screen === 'problem') {
    url.searchParams.set('problem',problemId);
    const item = taskById(current) || tasks[0];
    url.searchParams.set('activity',String(item.activityNumber));
    url.searchParams.set('exercise',item.id);
  } else {
    for (const key of ['problem','activity','exercise']) url.searchParams.delete(key);
  }
  return url;
}
export function outputFileReady(result,item,code,input) {return !!result && result.taskId===item.id && result.code===code && result.input===input && !result.output.includes('[Output shortened.');}
export function reviewReport(work) {
  const rows=[];
  for (const item of tasks) for (const [field,label] of planFields) {
    const answer=work.plans?.[item.id]?.[field];
    if(answer?.trim()) rows.push([`${item.title} / ${label}`,answer]);
  }
  for (const activity of activities) rows.push([`Activity ${activities.indexOf(activity)+1} readiness (self-report)`,`${activity.ready} ${work.readiness?.[activity.id]?'Reported ready.':'Not yet recorded.'}`]);
  return rows;
}
export const reportConfig={number:'MCC',title:problemTitle,date:'MCC preparation / five activities',allTasks:tasks,lesson:tasks,reviewReport};
