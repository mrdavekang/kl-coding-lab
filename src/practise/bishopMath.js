// BigInt keeps every digit of the question's 10^18-column inputs.
export function bishopCount(n,y){n=BigInt(n);y=BigInt(y);return y<n-y+1n?y:n-y+1n;}
export const bishopInput=cases=>`${cases.length}\n${cases.map(row=>row.map(String).join(' ')).join('\n')}\n`;
export const bishopAnswers=cases=>cases.map(([n,x,y])=>String(bishopCount(n,y))).join('\n');
export function bishopReachable(n,x,y,blocked=null){
 const seen=new Set([`${x},${y}`]),queue=[[x,y]];
 for(let i=0;i<queue.length;i++){
  const [r,c]=queue[i];
  for(const next of [[3-r,c-1],[3-r,c+1]]){
   const key=next.join(',');
   if(next[1]>=1&&next[1]<=n&&key!==blocked?.join(',')&&!seen.has(key)){seen.add(key);queue.push(next);}
  }
 }
 return seen;
}
