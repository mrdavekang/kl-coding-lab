// Small, optional experiments based on the exact example the learner typed.
export function playIdea(item){
 const {code,input,output}=item.support;
 if(input&&output===''){
  const names=[...code.matchAll(/^(\w+)\s*=.*input\(/gm)];
  const name=names.at(-1)?.[1]||'n';
  return {title:'Make the invisible visible',change:`Add print(${name}) on a new line. Run again to see what this variable remembers.`};
 }
 if(input)return {title:'Surprise the program',change:'Keep your code. Change one value in the example input, then run again. Keep the same input format.'+(code.includes('[')?' Keep any chosen index inside the text or list.':'')};
 const greeting=/print\("([^"\n]+)"\)/.exec(code);
 if(greeting&&!code.includes('if ')&&!code.includes('for '))return {title:'Give your robot a voice',change:`Change "${greeting[1]}" to your own short message. Keep the quotation marks and run again.`};
 if(/\brange\(\d+\)/.test(code))return {title:'One more turn',change:'Increase the number inside range(...) by one. Run again to see the extra loop turn.'};
 if(code.includes('>=')||code.includes(' > '))return {title:'Make a tie',change:'Give the two compared values the same number. Run again. Then make the first value larger and compare what happens.'};
 if(/\b(end|bestEnd) = \d+/.test(code))return {title:'Move the finish line',change:'Increase the ending round by one. Keep the length unchanged and run again. Watch where the starting round moves.'};
 if(code.includes('[')&&(/append\(/.test(code)||/=\s*\[[\d, ]*\]/.test(code)))return {title:'Remix the list',change:'Change one number in the example list, then run again. Keep any indices inside the list.'};
 if(/\[\w+\]/.test(code))return {title:'Choose a different place',change:'Change the example index to another valid index. Run again to read a different character. Index 0 is the first place.'};
 if(code.includes('for '))return {title:'Change the pattern',change:'Change one character or result in the fixed example sequence. Keep its quotes or list brackets, then run again.'};
 return {title:'One-number remix',change:'Change one number in your example, then run again. Watch which output values change.'};
}
export function firstUnanswered(support,record={}){
 return support.questions.findIndex(q=>!record.answers?.[q.id]?.checked||record.answers[q.id].choice!==q.answer);
}

export function shortExampleError(message){
 const text=String(message||'').trim();
 const line=[...text.matchAll(/File "main\.py", line (\d+)/g)].at(-1)?.[1];
 const error=text.split('\n').filter(x=>x.trim()).at(-1)||'Run stopped.';
 return (line?'Line '+line+'\n':'')+error;
}
