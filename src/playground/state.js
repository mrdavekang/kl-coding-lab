export const PLAYGROUND_KEY='kl-coding-lab.playground.v1';
export const CODE_LIMIT=50000,INPUT_LIMIT=4000000,TEXT_EDIT_LIMIT=16000;
export const examples=[
 {id:'hello',title:'Say hello',code:'print("Hello, coder!")',input:'',output:'Hello, coder!\n',tip:'Change coder to your name. Keep the quotes, then press Run again.'},
 {id:'ask',title:'Ask a question',code:'name = input("What is your name? ")\nprint("Hello,", name)',input:'Ada\n',output:'What is your name? Hello, Ada\n',tip:'Press Run. Type your name in the yellow Shell box and press Enter.'},
 {id:'score',title:'Add a point',code:'score = int(input("How many points? "))\nprint("Your next score is", score + 1)',input:'4\n',output:'How many points? Your next score is 5\n',tip:'Enter a whole number when the Shell asks. What changes if you add 2 instead?'},
 {id:'repeat',title:'Repeat five times',code:'for number in range(1, 6):\n    print(number)',input:'',output:'1\n2\n3\n4\n5\n',tip:'The four spaces keep print inside the loop. Change 6 to 4 and run again.'},
];
export const exampleById=id=>examples.find(example=>example.id===id);
export function pythonFilename(value){
 const name=String(value||'main.py').split(/[\\/]/).at(-1).replace(/[^a-zA-Z0-9_. -]/g,'').slice(0,70).replace(/^\.+/,'')||'main.py';
 return name.toLowerCase().endsWith('.py')?name:name+'.py';
}
export function newProgram(id='hello'){
 const example=exampleById(id);
 return {code:example?.code??'',input:example?.input??'',inputFilename:'',mode:'shell',filename:example?example.id+'.py':'main.py',fontSize:17,exampleId:example?.id??''};
}
function cleanProgram(value){
 if(!value||typeof value!=='object'||Array.isArray(value)||typeof value.code!=='string'||value.code.length>CODE_LIMIT||typeof value.input==='string'&&value.input.length>INPUT_LIMIT)return null;
 return {code:value.code,input:typeof value.input==='string'?value.input:'',inputFilename:typeof value.inputFilename==='string'?value.inputFilename.split(/[\\/]/).at(-1).slice(0,120):'',mode:value.mode==='prepared'?'prepared':'shell',filename:pythonFilename(value.filename),fontSize:[15,17,20].includes(value.fontSize)?value.fontSize:17,exampleId:exampleById(value.exampleId)?.id??''};
}
export function cleanPlayground(value){
 const program=cleanProgram(value?.program)??newProgram();
 const previous=Array.isArray(value?.previous)?value.previous.map(cleanProgram).filter(Boolean).slice(-5):[];
 return {program,previous};
}
export function replaceProgram(work,program){
 const clean=cleanProgram(program);if(!clean)throw new Error('This program is too large. Open a Python file with at most 50,000 characters.');
 const previous=[...work.previous];
 if(JSON.stringify(work.program)!==JSON.stringify(clean))previous.push({...work.program});
 return {program:clean,previous:previous.slice(-5)};
}
export function restoreProgram(work){return work.previous.length?{program:{...work.previous.at(-1)},previous:work.previous.slice(0,-1)}:work;}
export function loadPlayground(){try{return cleanPlayground(JSON.parse(localStorage.getItem(PLAYGROUND_KEY)||'{}'));}catch{return cleanPlayground({});}}
export function savePlayground(work){
 try{if(!cleanProgram(work.program))return false;localStorage.setItem(PLAYGROUND_KEY,JSON.stringify(cleanPlayground(work)));return true;}catch{return false;}
}
export async function readPythonFile(file){
 if(!file||!file.name.toLowerCase().endsWith('.py'))throw new Error('Choose a Python file whose name ends in .py.');
 if(file.size>128000)throw new Error('This file is too large. Choose a Python file smaller than 128 KB.');
 const code=await file.text();
 if(code.length>CODE_LIMIT)throw new Error('This file has more than 50,000 characters. Choose a smaller Python program.');
 if(code.includes('\0'))throw new Error('This does not look like a text Python file. Choose a .py file saved from an editor.');
 return {...newProgram('blank'),code,filename:pythonFilename(file.name)};
}
export async function readTextFile(file){
 if(!file||!file.name.toLowerCase().endsWith('.txt'))throw new Error('Choose a text file whose name ends in .txt.');
 if(file.size>8000000)throw new Error('Choose a text file smaller than 8 MB.');
 const text=(await file.text()).replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n');
 if(text.length>INPUT_LIMIT)throw new Error('Choose a text file with at most 4 million characters.');
 if(text.includes('\0'))throw new Error('This does not look like a plain text file. Choose a .txt file.');
 return {filename:file.name.split(/[\\/]/).at(-1).slice(0,120),text};
}
