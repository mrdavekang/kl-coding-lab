import React,{useState} from 'react';

// A worked example only: completing this picture does not mark a practice passed.
export function FenceDemo(){
 const [column,setColumn]=useState(1),[filled,setFilled]=useState([]);
 const rows=['.#.','...'];
 const missing=rows.reduce((n,row,r)=>n+(row[column]==='.'&&!filled.includes(r)?1:0),0);
 return <section className="mcc-demo" aria-label="Worked fence example">
  <h3>Watch the idea: fill one column</h3>
  <p>A column goes <b>down ↓</b>. Choose a column, then tap its gaps to add fence pieces.</p>
  <div className="mcc-picture-grid" style={{gridTemplateColumns:'repeat(3, minmax(60px, 90px))'}}>
   {[0,1,2].map(c=><button key={'head'+c} aria-pressed={column===c} onClick={()=>{setColumn(c);setFilled([]);}}>Column {c+1} ↓</button>)}
   {rows.flatMap((row,r)=>[...row].map((cell,c)=>{
    const added=c===column&&filled.includes(r),gap=cell==='.'&&!added;
    return <button key={r+'-'+c} disabled={c!==column||!gap} className={'mcc-picture-cell '+(gap?'is-gap':'is-built')+(added?' is-added':'')} aria-label={`Row ${r+1}, column ${c+1}: ${added?'added fence':gap?'gap':'existing fence'}`} onClick={()=>setFilled(old=>[...old,r])}>{added?'Added ✓':gap?'Gap':'Fence'}</button>;
   }))}
  </div>
  <p role="status">{missing?`${filled.length} new pieces added. ${missing} ${missing===1?'gap':'gaps'} left in this column.`:`Column ${column+1} complete! You added ${filled.length} new ${filled.length===1?'piece':'pieces'}.`}</p>
  <p><b>The lesson:</b> the middle column needs only 1 new piece. Each outside column needs 2. Choose the column that needs the fewest.</p>
 </section>;
}
const simple={
 a1:{idea:'Make one column complete. Count its empty spaces, then try the other columns. Choose the smallest count.',do:['Pick a column in the picture below. Count its gaps going down.','Count the other columns. Type the smallest count.','Choose Check my answer. Then download your answer file.'],done:'I can point to the gaps my answer counts.'},
 a2:{idea:'This time the picture shows lights. Fill one column of lights. Use as few new lights as you can.',do:['Count the gaps going down each column.','Choose the smallest count. If two columns tie, use that count once.','Type your number and choose Check my answer.'],done:'I found how many new lights one column needs.'},
 a3:{idea:'A column with no gaps needs no new pieces. Zero is allowed.',do:['Look down each column. Is one already complete?','Count the gaps, and type the smallest count.','Choose Check my answer. Explain why zero can be a correct answer.'],done:'I can explain a column that needs no work.'},
 retrieval:{idea:'This code counts all the items. You do not need to write any code yet.',do:['Choose Run. Look for 3 in Program output.','Find the # on the first line. Replace it with a dot.','Run again. There are still three items, so the count stays 3.'],done:'I have run the code twice.'},
 'condition-example':{idea:'Now we count gaps only. The line if cell == ".": means “if this is a gap”.',do:['Choose Run. The code is already complete.','Read the three cells on the first line: fence, gap, fence. Only the gap adds 1.','Leave the code as it is. Continue to practise this same idea.'],done:'I know that a fence adds nothing and a gap adds one.'},
 g1:{idea:'The code already works. It counts dots. Each dot is a gap.',do:['Choose Run. The answer is 2 because the list has two dots.','On the first line, change the # to a dot. Keep the quotation marks.','Run again. There are now three dots. Choose Check my code to try other lists.'],done:'I changed a cell and saw the count change.'},
 g2:{idea:'This program looks for #. We want it to look for a dot instead.',do:['Find this line: if cell == "#":','Change only # to . on that line. Leave the first line unchanged.','Choose Run, then Check my code. The supplied list has three gaps.'],done:'I changed one symbol so the code counts gaps.'},
 g3:{idea:'Adding zero leaves the count unchanged. Each gap must add one.',do:['Find this line: gapCount = gapCount + 0','Change the last 0 on that line to 1. Keep gapCount = 0 near the top.','Choose Run, then Check my code. The supplied list has two gaps.'],done:'I fixed the update without changing the starting count.'},
 exit:{idea:'Use the same counting method on this fresh picture. Try it on your own first.',do:['Count down each column. Choose the smallest gap count.','Type your answer and choose Check my answer.','Save your answer. Explain your method in one sentence, then save your report.'],done:'I have an answer and can explain how I found it.'}
};
export const simpleGuide=id=>simple[id];
export function SimpleInstruction({id}){
 const guide=simple[id];if(!guide)return null;
 return <section className="mcc-simple-instruction"><h3>One idea</h3><p>{guide.idea}</p><h3>Now do this</h3><ol>{guide.do.map(step=><li key={step}>{step}</li>)}</ol><p className="mcc-simple-done"><b>Finished:</b> {guide.done}</p></section>;
}
export function SymbolKey({noun="fence"}){return <p className="mcc-symbol-key"><span><b>.</b> = a gap</span><span><b>#</b> = a {noun} already there</span></p>;}
