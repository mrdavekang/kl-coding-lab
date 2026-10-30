export const pages=[1,2,3,4,5,'mcc','mcc-practise','mco','mcc-reference','playground'];
export function readWeek(search){
 const value=new URLSearchParams(search).get('week');
 return pages.find(page=>String(page)===value)??'playground';
}
export function pageUrl(href,week='playground'){
 const url=new URL(href);url.searchParams.set('week',pages.includes(week)?String(week):'playground');
 for(const key of ['problem','activity','exercise','topic'])url.searchParams.delete(key);
 url.hash='';return url;
}
