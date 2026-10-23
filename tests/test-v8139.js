// Read-only aggregate regression cases; run: TZ=Europe/London node tests/test-v8139.js
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const listeners={};let page='';let scroll=0;const fakeHall={set innerHTML(v){page=v},get innerHTML(){return page},querySelectorAll(sel){if(sel==='[data-report-view]')return ['sessions','months','years'].map(dataset=>({dataset:{reportView:dataset},addEventListener(type,fn){listeners[dataset]=fn}}));return []},scrollTop:1};
const window={rhSpace:()=>sample,rhSave:()=>{},scrollTo:()=>{scroll++},rhOpenJourneyV7003:()=>{},};
const document={getElementById:(id)=>id==='hall'?fakeHall:null};
const context={window,document,console,Date,Map,Set,Number,String,Array,Math};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root,'js/otg-racing-reports-v8139.js'),'utf8'),context);
const api=window.otgRacingReportsTestV8113;
function entry(id,date,time,carId='C1',track='Road Loop',extra={}){return {id,date,time,carId,track,...extra}}
const sample={cars:[{id:'C1',make:'Vauxhall',model:'Lotus Carlton',year:1990},{id:'C2',make:'Nissan',model:'R390 GT1',year:1998}],runs:[{id:'f1',name:'Road Festival',status:'complete',completedAt:'2026-11-01T01:00:00Z',rounds:[],results:[
 entry('r1','2026-10-31T23:00:00Z',90),entry('r2','2026-11-01T00:10:00Z',87),
 entry('r3','2026-11-01T00:15:00Z',100,'C2','Hill Track',{position:null}),
 entry('r4','2026-12-31T23:50:00Z',99,'C1','Coastal Track'),
 entry('r5','2027-01-01T00:10:00Z',97,'C1','Coastal Track'),
 entry('bad','2027-01-01T01:00:00Z',0),
 entry('lapDup','2026-11-01T00:15:00Z',8,'C2','Hill Track',{advancedTiming:true})]}],customEvents:[{id:'c1',name:'Custom Sprint',status:'complete',completedAt:'2026-11-03T12:30:00Z',results:[entry('r6','2026-11-03T12:00:00Z',25,'C2','Speedway',{allTime:true,position:3})]}],raceOffs:[{id:'ko1',name:'October Knockout',status:'complete',completedAt:'2026-10-31T23:02:00Z',rounds:[{matches:[{resultA:entry('r1','2026-10-31T23:00:00Z',90),resultB:entry('r7','2026-10-31T23:02:00Z',65,'C2','Hill Track',{championshipRecord:true})}]}]}],otgReportBreaksV8113:[]};
const before=JSON.stringify(sample);
const daily=api.build(sample,new Date('2027-01-02T00:00:00Z').getTime());
assert.equal(daily.reduce((a,b)=>a+b.results,0),7,'deduplicate cross-event race id, skip zero/advancedTiming');
assert.equal(daily.reduce((a,b)=>a+b.pbs,0),2,'only repeat improved car/track time counts, first-time fast run not PB');
const groups=api.buildPeriods(sample,new Date('2027-01-02T00:00:00Z').getTime());
const mo=Object.fromEntries(groups.months.map(x=>[x.key,x]));
assert.deepEqual(Object.keys(mo),['2027-01','2026-12','2026-11','2026-10']);
assert.equal(mo['2026-10'].results,2);
assert.equal(mo['2026-11'].results,3);
assert.equal(mo['2026-11'].carsDriven,2,'uniques not sum per daily sessions');
assert.equal(mo['2026-11'].pbs,1);
assert.equal(mo['2026-11'].records,1);
assert.equal(mo['2026-11'].events.length,2,'only real completed events');
assert.equal(mo['2026-10'].events.length,1);
assert.equal(mo['2026-10'].sessionsTouched,1);
assert.equal(mo['2026-11'].sessionsTouched,2,'spanning midnight session counted in both periods it touches');
assert.equal(mo['2026-12'].sessionsTouched,1);
assert.equal(mo['2027-01'].sessionsTouched,1);
assert.equal(mo['2027-01'].pbs,1);
const yr=Object.fromEntries(groups.years.map(x=>[x.key,x]));
assert.equal(yr['2026'].results,6);
assert.equal(yr['2026'].carsDriven,2);
assert.equal(yr['2026'].events.length,3);
assert.equal(yr['2027'].results,1);
assert.equal(yr['2027'].events.length,0);
assert.equal(JSON.stringify(sample),before,'read-only: no mutation of Space results, event statuses, backups');
window.rhOpenRacingReportsV8113();assert.match(page,/SESSIONS/);
listeners.months();assert.match(page,/MONTHLY REPORT/);assert.match(page,/MOST DRIVEN CAR/);assert.match(page,/Vauxhall Lotus Carlton/);assert.doesNotMatch(page,/AI (win|victory)/i);
listeners.years();assert.match(page,/YEARLY REPORT/);
listeners.sessions();assert.match(page,/CURRENT SESSION|SESSION COMPLETE/);
const empty={cars:[],runs:[],raceOffs:[],customEvents:[]};const periodEmpty=api.buildPeriods(empty);assert.equal(periodEmpty.months.length,0);assert.equal(periodEmpty.years.length,0);
const preserved=window.rhSpace;window.rhSpace=()=>empty;listeners.months();assert.match(page,/No dated racing results/);window.rhSpace=preserved;
console.log('PASS v8.0.139: deduplication, spanning midnight/December, unique cars, legitimate completed events, PBs, records, read-only storage and three working views');
