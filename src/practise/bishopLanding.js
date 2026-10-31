export function isBishopLanding(search){
 const query=new URLSearchParams(search);
 return query.get('week')==='mcc-practise'&&query.get('problem')==='block-bishop'&&!query.has('exercise')&&!query.has('activity');
}
export function bishopLandingUrl(href){
 const url=new URL(href);
 url.searchParams.set('week','mcc-practise');
 url.searchParams.set('problem','block-bishop');
 for(const key of ['activity','exercise','topic'])url.searchParams.delete(key);
 url.hash='';
 return url;
}
