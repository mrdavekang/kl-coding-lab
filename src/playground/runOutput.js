export const OUTPUT_LIMIT=2_000_000;

export function textFilename(value){
 const stem=String(value||'').split(/[\\/]/).at(-1).replace(/\.txt$/i,'').replace(/[^a-zA-Z0-9_. -]/g,'').replace(/^\.+/,'').trim().slice(0,70)||'output';
 return stem+'.txt';
}
export function createOutputCapture(program){
 return {kind:'run',code:program.code,mode:program.mode,input:program.mode==='prepared'?program.input:'',chunks:[],length:0,overflow:false};
}
export function captureRunOutput(job,text,stream='stdout'){
 if(job?.kind!=='run'||stream!=='stdout')return;
 if(job.length+text.length>OUTPUT_LIMIT){job.overflow=true;return;}
 job.chunks.push(text);job.length+=text.length;
}
export function finishOutputCapture(job,data){
 if(job?.kind!=='run'||data.type!=='done'||data.stopped||data.outputTruncated||job.overflow)return null;
 return {complete:true,code:job.code,mode:job.mode,input:job.input,text:job.chunks.join('')};
}
export function outputMatchesProgram(result,program){
 return !!result?.complete&&result.code===program.code&&result.mode===program.mode&&(program.mode!=='prepared'||result.input===program.input);
}
