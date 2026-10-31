import {validateWork} from '../evidence.js';
import {buildingFences} from './content.js';
import {cleanSupport} from '../practise/learningSupport.js';

const object = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
const text = value => typeof value === 'string' ? value.slice(0,3000) : '';
export const planFields = [['input','Input','What information will I receive? What do its numbers and symbols mean?'],['process','Process','What smaller jobs must my program perform?'],['output','Output','What exactly must my program display?'],['lookup','Find out','What Python syntax do I need to find out about?'],['prediction','Predict and test','What small input will I try? What output do I expect?']];

export function createPreparationState(problem) {
  const {activities,tasks,taskById,problemId,problemTitle}=problem;
  function validatePreparation(value) {
    const source = object(value);
    const clean = validateWork({...source,drafts:object(source.drafts)},tasks);
    clean.current = taskById(source.current) ? source.current : tasks[0].id;
    clean.screen = source.screen === 'problem' ? 'problem' : 'overview';
    clean.inputs = {}; clean.plans = {}; clean.readiness = {}; clean.answers = {};
    for (const item of tasks) {
      if (item.kind === 'output' && typeof source.answers?.[item.id] === 'string') clean.answers[item.id] = source.answers[item.id].slice(0,12000);
      if (typeof source.inputs?.[item.id] === 'string') clean.inputs[item.id] = source.inputs[item.id].slice(0,700000);
      clean.plans[item.id] = {};
      for (const [field] of planFields) clean.plans[item.id][field] = text(source.plans?.[item.id]?.[field]);
    }
    for (const activity of activities) clean.readiness[activity.id] = source.readiness?.[activity.id] === true;
    if(problem.practiceOnly)clean.practiceSupport=cleanSupport(source.practiceSupport,tasks);
    return clean;
  }
  function progress(work) {return tasks.filter(item=>taskPassed(work,item)).length;}
  function locationFor(search,work) {
    const query = new URLSearchParams(search);
    if (query.get('problem') !== problemId) return {screen:work.screen,current:work.current};
    const item = taskById(query.get('exercise'));
    const activity = activities[Number(query.get('activity'))-1];
    return {screen:'problem',current:item?.id || activity?.exercises[0].id || work.current};
  }
  function preparationUrl(href,screen,current) {
    const url = new URL(href);
    url.searchParams.set('week',problem.sectionId || 'mcc');
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
  function reviewReport(work) {
    if(problem.practiceOnly)return [];
    const rows=[];
    for (const item of tasks) for (const [field,label] of planFields) {
      const answer=work.plans?.[item.id]?.[field];
      if(answer?.trim()) rows.push([`${item.title} / ${label}`,answer]);
    }
    for (const activity of activities) rows.push([`Activity ${activities.indexOf(activity)+1} readiness (self-report)`,`${activity.ready} ${work.readiness?.[activity.id]?'Reported ready.':'Not yet recorded.'}`]);
    return rows;
  }
  const reportConfig={number:problem.sectionNumber || 'MCC',title:problemTitle,date:`${problem.sectionTitle || 'MCC preparation'} / ${activities.length} activities`,allTasks:tasks,lesson:tasks,reviewReport,practiceOnly:!!problem.practiceOnly,answerFilesOnly:problem.track==='output',mixedTasks:problem.track==='mixed'};
  return {validatePreparation,progress,locationFor,preparationUrl,reviewReport,reportConfig};
}
export function taskPassed(work,item) {return work.passed?.[item.id] !== undefined && work.passed[item.id] === (item.kind==='output' ? work.answers?.[item.id] || '' : work.drafts?.[item.id] ?? item.starter);}
export function activityPassed(work,activity) {return activity.exercises.every(item=>taskPassed(work,item));}
export function outputFileReady(result,item,code,input) {return !!result && result.taskId===item.id && result.code===code && result.input===input && !result.output.includes('[Output shortened.');}
export const {validatePreparation,progress,locationFor,preparationUrl,reviewReport,reportConfig}=createPreparationState(buildingFences);
