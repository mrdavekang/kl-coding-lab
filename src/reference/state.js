import {topics,topicById} from './content.js';
import {practiceCourse} from '../practise/catalog.js';
export const REFERENCE_WEEK='mcc-reference';
export const REFERENCE_KEY='kl-coding-lab.mcc-reference.v1';
export function referenceUrl(href,topic='start'){
 const url=new URL(href);url.searchParams.set('week',REFERENCE_WEEK);url.searchParams.set('topic',topicById(topic)?topic:'start');url.hash='';return url;
}
export function practiceUrl(href,courseId,taskId){
 const url=new URL(href);url.searchParams.set('week','mcc-practise');url.searchParams.delete('topic');url.hash='';
 const course=practiceCourse(courseId||url.searchParams.get('problem'));
 const task=course?.taskById(taskId||url.searchParams.get('exercise'));
 if(course)url.searchParams.set('problem',course.problemId);else url.searchParams.delete('problem');
 if(task){url.searchParams.set('exercise',task.id);url.searchParams.set('activity',String(task.activityNumber));}
 else{url.searchParams.delete('exercise');url.searchParams.delete('activity');}
 return url;
}
export function readTopic(search){return topicById(new URLSearchParams(search).get('topic'))?.id||'start';}
export function cleanReferenceDrafts(value){
 const source=value&&typeof value==='object'&&!Array.isArray(value)?value:{},result={};
 for(const topic of topics){const record=source[topic.id];if(!record||typeof record!=='object'||Array.isArray(record))continue;const clean={};if(typeof record.code==='string')clean.code=record.code.slice(0,12000);if(typeof record.input==='string')clean.input=record.input.slice(0,4000);if(Object.keys(clean).length)result[topic.id]=clean;}
 return result;
}
export function loadReferenceDrafts(){try{return cleanReferenceDrafts(JSON.parse(localStorage.getItem(REFERENCE_KEY)||'{}'));}catch{return {};}}
export function saveReferenceDrafts(drafts){try{localStorage.setItem(REFERENCE_KEY,JSON.stringify(cleanReferenceDrafts(drafts)));return true;}catch{return false;}}
