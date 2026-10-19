import React,{useState} from 'react';
import {ArrowLeft,ArrowRight} from 'lucide-react';
import {sampleCities,traceCuts} from './routes.js';

function Leg({leg,index}) {
  const {from,to,distance}=leg, right=to>from;
  return <div className="mco-leg"><p>Step {index+1}: <b>{distance} {distance===1?'unit':'units'}{distance?right?' right':' left':' — already here'}</b></p>
    <svg viewBox="0 0 360 90" role="img" aria-label={`${from} to ${to}, ${distance} units${distance?right?' right':' left':''}`}>
      {distance ? <><line x1="45" y1="24" x2="315" y2="24" stroke="currentColor" strokeWidth="3"/>
        <path d={right?'M 302 16 L 315 24 L 302 32':'M 58 16 L 45 24 L 58 32'} stroke="currentColor" strokeWidth="3" fill="none"/>
        <text x="30" y="72" textAnchor="middle">{Math.min(from,to)}</text><text x="330" y="72" textAnchor="middle">{Math.max(from,to)}</text></>
        : <><circle cx="180" cy="24" r="5" fill="currentColor"/><text x="180" y="72" textAnchor="middle">{from}</text></>}
    </svg>
  </div>;
}
function Person({name,start,group,options,distance}) {
  return <section className={`mco-person ${name.toLowerCase()}`} aria-label={`${name}'s route comparison`}>
    <div className="mco-person-heading"><h3>{name} starts at {start}</h3><b>Choose {distance} units</b></div>
    <p className="prep-muted">Assigned cities: {group.length?group.join(', '):'none'}</p>
    {!group.length?<p className="mco-stays">{name} stays at {start}. No endpoints to compare. Distance = 0.</p>:options.map(option=><div className={`mco-route ${option.selected?'chosen':''}`} key={option.label}>
      <div className="mco-route-heading"><b>{option.label}</b><span>{option.legs.map(leg=>leg.distance).join(' + ')} = <b>{option.distance}</b> · {option.selected?'USE':'Longer route'}</span></div>
      <div className="mco-legs">{option.legs.map((leg,index)=><Leg key={index} leg={leg} index={index}/>)}</div>
    </div>)}
  </section>;
}
export function RouteExplorer() {
  const [cut,setCut]=useState(2), trace=traceCuts(),row=trace[cut];
  return <section className="mco-explorer prep-section" aria-labelledby="mco-explorer-heading">
    <p className="prep-eyebrow">ACT IT OUT · THEN COMPARE</p><h2 id="mco-explorer-heading">Move the cut and inspect both routes</h2>
    <p>Every plan starts Alice at −6 and Bob at 10. Choose a cut, compare each person’s two route orders, then add their smaller distances. These arrows show movement direction; their lengths are not to scale.</p>
    <div className="mco-cut-controls" role="group" aria-label="Choose a cut">{trace.map(entry=><button key={entry.cut} aria-pressed={cut===entry.cut} onClick={()=>setCut(entry.cut)}>Cut {entry.cut}</button>)}</div>
    <div className="mco-city-scroll"><div className="mco-city-strip" aria-label={`Cut ${cut}: Alice receives ${cut} cities and Bob receives ${7-cut}`}>
      {sampleCities.map((city,index)=><span key={index} className={`${index<cut?'alice':'bob'} ${index===cut?'cut-before':''}`}>{city}<small>{index<cut?'Alice':'Bob'}</small></span>)}{cut===7&&<span className="mco-end-cut" aria-label="Divider after the last city"/>}
    </div></div>
    <div className="mco-people"><Person name="Alice" start={-6} group={sampleCities.slice(0,cut)} options={row.alice} distance={row.aliceDistance}/><Person name="Bob" start={10} group={sampleCities.slice(cut)} options={row.bob} distance={row.bobDistance}/></div>
    <p className="mco-combined" aria-live="polite">Cut {cut}: <b>{row.aliceDistance} + {row.bobDistance} = {row.total}</b><span>Best after cuts 0–{cut}: <b>{row.best}</b></span></p>
    <div className="mco-explorer-bottom"><button className="prep-outline" disabled={cut===0} onClick={()=>setCut(cut-1)}><ArrowLeft size={16}/>Previous cut</button><button className="prep-outline" disabled={cut===7} onClick={()=>setCut(cut+1)}>Next cut<ArrowRight size={16}/></button></div>
    <p className="prep-muted">Equal route costs are both marked USE. Choosing the route and choosing the best cut are separate comparisons.</p>
  </section>;
}
