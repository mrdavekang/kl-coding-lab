import React from 'react';

// The worked picture is fully visible: no clicking is required to reveal its method.
export function FenceDemo({complete=false,noun='Fence'}){
 const rows=complete?['#.','#.']:['.#.','...'];
 const counts=complete?[0,2]:[2,1,2];
 return <section className="mcc-demo" aria-label="Worked fence example">
  <h3>1. See an example</h3>
  <p>Each column goes <b>down ↓</b>. Count its gaps. We only need to finish <b>one</b> column.</p>
  <table className="mcc-field-table"><caption>Example picture · counts already worked out</caption><thead><tr>{counts.map((_,c)=><th key={c} scope="col">Column {c+1} ↓</th>)}</tr></thead><tbody>{rows.map((row,r)=><tr key={r}>{[...row].map((cell,c)=><td key={c} className={cell==='.'?'is-gap':'is-built'}>{cell==='.'?'Gap':noun}</td>)}</tr>)}</tbody><tfoot><tr>{counts.map((n,c)=><td key={c}><b>{n} new {n===1?'piece':'pieces'}</b></td>)}</tr></tfoot></table>
  <p><b>Choose the smallest count: {Math.min(...counts)}.</b> {complete?'The first column is already complete.':'The middle column needs only one new piece.'} Write <b>{Math.min(...counts)}</b> as the answer.</p>
 </section>;
}
export function SmallCodeExample({task}){
 const notes=task.id==='retrieval'?['The loop visits each item in the list.','print(cell) shows the item from that visit.']:['Start gapCount at 0.','Visit each cell. Only a dot adds 1.','Print the final count after the loop.'];
 return <section className="mcc-demo"><h3>1. See an example</h3><p>{task.id==='retrieval'?'This short program shows each cell.':'This working program counts one gap in the list.'}</p><pre className="mcc-code-text"><code>{task.example}</code></pre><p><b>It prints:</b></p><pre className="mcc-code-text">{task.exampleOutput}</pre><ol>{notes.map(note=><li key={note}>{note}</li>)}</ol></section>;
}
const simple={
 a1:{idea:'Make one column complete. Count its empty spaces, then try the other columns. Choose the smallest count.',do:['Look down the first column in your picture below. Count its gaps going down.','Count the other columns. Type the smallest count.','Choose Check my answer. Then download your answer file.'],done:'I can point to the gaps my answer counts.'},
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
 return <section className="mcc-simple-instruction"><h3>2. Your task</h3><p>{guide.idea}</p><p><b>Do these three steps:</b></p><ol>{guide.do.map(step=><li key={step}>{step}</li>)}</ol><p className="mcc-simple-done"><b>Finished:</b> {guide.done}</p></section>;
}
export function SymbolKey({noun="fence"}){return <p className="mcc-symbol-key"><span><b>.</b> = a gap</span><span><b>#</b> = a {noun} already there</span></p>;}
