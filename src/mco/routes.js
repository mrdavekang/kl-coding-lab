export const sampleCities = [-15, -6, -1, 0, 8, 11, 12];
export function routeOptions(start, group) {
  if (!group.length) return [];
  const left = group[0], right = group.at(-1);
  const options = [
    {label:'Left end first', route:[start, left, right]},
    {label:'Right end first', route:[start, right, left]},
  ].map(option => ({...option, legs:option.route.slice(1).map((to, index) => ({from:option.route[index], to, distance:Math.abs(to-option.route[index])}))}));
  for (const option of options) option.distance = option.legs.reduce((sum, leg) => sum+leg.distance, 0);
  const minimum = Math.min(...options.map(option => option.distance));
  return options.map(option => ({...option, selected:option.distance === minimum}));
}
export function cutCosts(cut, cities=sampleCities, A=-6, B=10) {
  const alice=routeOptions(A,cities.slice(0,cut)),bob=routeOptions(B,cities.slice(cut));
  const aliceDistance=alice.length?Math.min(...alice.map(option=>option.distance)):0;
  const bobDistance=bob.length?Math.min(...bob.map(option=>option.distance)):0;
  return {cut,alice,bob,aliceDistance,bobDistance,total:aliceDistance+bobDistance};
}
export function traceCuts(cities=sampleCities,A=-6,B=10) {
  let best;
  return Array.from({length:cities.length+1},(_,cut)=>{
    const row=cutCosts(cut,cities,A,B);
    if(cut===0||row.total<best)best=row.total;
    return {...row,best};
  });
}
