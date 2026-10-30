export const meaning=(prompt,labels,answer,explanation,hint)=>({id:'meaning',kind:'syntax',prompt,choices:labels.map((label,i)=>({id:String(i),label})),answer:String(answer),explanation,hint});
export const role=(code,answer,explanation)=>({id:'role',kind:'ipo',prompt:'What is the main job of this code?',code,choices:['Input: get new information','Process: work with information','Output: show a result'].map((label,i)=>({id:String(i),label})),answer:String(answer),explanation,hint:'Input brings new information in. Processing works with information. Output shows or saves a result. A line can combine jobs.'});
export function support(code,input,output,syntax,ipo,intro='Type this small example. Keep the brackets, spaces and indentation.'){
  return {version:1,code,input,output,intro,questions:[syntax,ipo]};
}
export function picture(name,alt){return {image:`${name}.svg`,imageMobile:`${name}-mobile.svg`,imageWidth:900,imageHeight:320,imageAlt:alt};}
export function makeCourse(config,exercises,groups){
  const activities=groups.map(([id,title,summary,start,end])=>({id,title,summary,exercises:exercises.slice(start,end),reading:[],syntax:[],questions:[],example:null,...exercises[start].visual}));
  const tasks=activities.flatMap((activity,i)=>activity.exercises.map(task=>({...task,activityId:activity.id,activityNumber:i+1})));
  return {...config,sectionId:'mcc-practise',sectionTitle:'MCC Practise',sectionNumber:'MCC Practise',practiceOnly:true,activities,tasks,taskById:id=>tasks.find(task=>task.id===id),activityFor:id=>activities.find(a=>a.exercises.some(t=>t.id===id))};
}
