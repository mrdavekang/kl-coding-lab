const integer=/^[+-]?\d+$/;
export function parseAnswerInput(type,data){
 const parts=data.trim().split(/\s+/),n=Number(parts.shift());
 if(!Number.isInteger(n)||n<1||n>(type==='binary'?200000:500000))throw Error('The input needs a valid number of items on its first line.');
 if(type==='binary'){
  if(parts.length!==1||parts[0].length!==n||!/^[01]+$/.test(parts[0]))throw Error('The binary input must contain n characters, using only 0 and 1.');
  return {n,values:parts[0]};
 }
 if(parts.length!==n||parts.some(x=>x!=='0'&&x!=='1')||!parts.includes('1'))throw Error('The streak input must contain n spaced results, with at least one win.');
 return {n,values:parts};
}
export function checkAnswerFile(item,answer,data){
 const fail=message=>({passed:false,message,cases:[]});
 try{
  const {n,values}=parseAnswerInput(item.answerFile.type,data);
  const lines=answer.trim().split(/\n/).filter(line=>line.trim()).map(line=>line.trim().split(/\s+/));
  if(!answer.trim())return fail('Enter the answer text first. The answer box is separate from the Python editor.');
  if(lines.some(line=>line.some(x=>!integer.test(x))))return fail('Use only integer answers. Remove prompts, labels, quotes and Python instructions.');
  if(item.answerFile.type==='binary'){
   if(lines[0].length!==1)return fail('Print K alone on the first line, then one swap pair per line.');
   let zeros=0;for(const bit of values)if(bit==='0')zeros++;
   let minimum=0;for(let i=0;i<zeros;i++)if(values[i]==='1')minimum++;
   const k=Number(lines[0][0]);if(k!==minimum)return fail(`This case needs ${minimum} swaps. Count the wrong ones in the zero section.`);
   if(lines.length!==k+1)return fail(`After the count, include exactly ${k} pair lines.`);
   const changed=[...values];
   for(let i=1;i<lines.length;i++){
    if(lines[i].length!==2)return fail(`Swap ${i} needs exactly two positions.`);
    const [a,b]=lines[i].map(Number);
    if(!Number.isSafeInteger(a)||!Number.isSafeInteger(b)||a<1||b<1||a>n||b>n||a===b)return fail(`Swap ${i}: use two different question positions from 1 to ${n}.`);
    [changed[a-1],changed[b-1]]=[changed[b-1],changed[a-1]];
   }
   for(let i=0;i<n;i++)if(changed[i]!== (i<zeros?'0':'1'))return fail('Applying these swaps does not sort this input. Match each wrong one with a wrong zero.');
   return {passed:true,message:'This answer uses a valid minimum swap sequence. Different correct sequences are accepted. Download the matching text file.',cases:[]};
  }
  if(lines.length!==1||lines[0].length!==2)return fail('Give l and r on one line, separated by a space. Do not give the length alone.');
  const [l,r]=lines[0].map(Number);
  if(!Number.isSafeInteger(l)||!Number.isSafeInteger(r)||l<1||r<l||r>n)return fail(`Round numbers run from 1 to ${n}, with start no greater than end.`);
  let current=0,best=0,bestL=0,bestR=0;
  for(let i=0;i<n;i++){current=values[i]==='1'?current+1:0;if(current>0&&current>=best){best=current;bestR=i+1;bestL=bestR-current+1;}}
  for(let i=l-1;i<r;i++)if(values[i]!=='1')return fail('The chosen interval contains a loss. A winning streak contains only consecutive wins.');
  if(r-l+1!==best)return fail('This is a winning streak, but a longer one exists. Compare consecutive run lengths, not the total number of wins.');
  if(l!==bestL||r!==bestR)return fail('This is a longest streak, but it is an earlier tie. Choose the longest streak with the greatest starting round.');
  return {passed:true,message:'This answer gives the longest winning streak and uses the later start when tied. Download the matching text file.',cases:[]};
 }catch(error){return fail(error.message);}
}
