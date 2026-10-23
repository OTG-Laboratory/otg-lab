'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const res=(id,carId,roundId,time,position)=>({id,carId,roundId,time,position,date:'2026-10-23T17:20:00.000Z'});
const fh5={id:'fh5',name:'Forza Horizon 5',cars:[...Array.from({length:6},(_,i)=>({id:String(i+1)}))],runs:[
 {id:'festival',status:'complete',entries:['1','2','3'],rounds:[{id:'a'}],results:[res('a1','1','a',90,12),res('a2','2','a',100,1),res('a3','3','a',110,3),{id:'lap',carId:'1',roundId:'a',time:20,advancedTiming:true}]},
 {id:'groups',status:'complete',v8Groups:{completedGroups:[{final:true,standings:[{id:'4',total:75},{id:'1',total:70}]}]},rounds:[{id:'b'}],results:[res('b1','1','b',70,2),res('b2','4','b',75,1)]},
 {id:'unfinished',status:'active',rounds:[{id:'c'}],results:[res('c1','5','c',60,1),res('c1','5','c',60,1)]},
 {id:'tied',status:'complete',entries:['1','3'],rounds:[{id:'d'}],results:[res('d1','1','d',42,1),res('d2','3','d',42,2)]}
 ],raceOffs:[{
  id:'raceoff',status:'complete',championCarId:'1',rounds:[
   {id:'semi',matches:[
    {status:'complete',loserCarId:'3',carA:{id:'1'},carB:{id:'3'},resultA:res('s1','1','semi',41,8),resultB:res('s2','3','semi',43,1)},
    {status:'complete',loserCarId:'4',carA:{id:'2'},carB:{id:'4'},resultA:res('s3','2','semi',40,10),resultB:res('s4','4','semi',44,1)}
   ]},{id:'final',matches:[{status:'complete',winnerCarId:'1',loserCarId:'2',carA:{id:'1'},carB:{id:'2'},resultA:res('f1','1','final',44,7),resultB:res('f2','2','final',46,1)}]}
  ]
 }],customEvents:[{id:'custom',status:'complete',rounds:[{id:'x'}],results:[res('x1','6','x',80,1)]}],otgReportBreaksV8113:[111]};
const gt7={id:'gt7',name:'Gran Turismo 7',runs:[{id:'gt-run',status:'complete',entries:['1','9'],rounds:[{id:'1'}],results:[res('g1','1','1',90,null),res('g2','9','1',95,1)]}],raceOffs:[],customEvents:[]};
const data={schema:2,activeSpaceId:'fh5',spaces:[fh5,gt7]};
let html='',renders=0;
const target={insertAdjacentHTML:(where,markup)=>{assert.equal(where,'afterend');html+=markup}};
const host={querySelector:selector=>selector==='#otgLifetimeCareer8142'?(html?{}:null):selector.includes('v7StatsCards')?target:null};
const ctx={console,Map,Set,WeakSet,Number,String,Date,Math,Array,Object,state:data,rhMoreMode:'stats',document:{getElementById:id=>id==='more'?host:null},window:{rhRenderMore:()=>{renders++;html='';},rhRenderStats:()=>{renders++;html='';}}};
vm.createContext(ctx);vm.runInContext(fs.readFileSync(path.join(root,'js/otg-lifetime-career-v8142.js'),'utf8'),ctx);
const api=ctx.window.otgLifetimeCareerQA8142;assert(api);
const original=JSON.stringify(data),result=api.lifetime(data);
assert.equal(JSON.stringify(data),original,'read-only aggregation');
assert.equal(result.spaces.length,2);assert.equal(result.spaces[0].races,15); // 3 regular + 2 group + 1 partial + 2 tied + 6 Race Off + 1 Custom
assert.equal(result.spaces[0].cars,6);assert.equal(result.spaces[0].competitions,5); // 3 complete Festival incl tied + Race Off + Custom
assert.equal(result.spaces[0].medals.gold,3);assert.equal(result.spaces[0].medals.silver,3);assert.equal(result.spaces[0].medals.bronze,3);
assert.equal(result.spaces[1].races,2);assert.equal(result.spaces[1].cars,2);assert.equal(result.spaces[1].competitions,1);
assert.equal(result.spaces[1].medals.gold,1);assert.equal(result.all.races,17);
assert.equal(result.all.cars,8,'car IDs are counted separately in each Space');assert.equal(result.all.competitions,6);
assert.equal(result.all.medals.gold,4);assert.equal(result.all.medals.silver,4);assert.equal(result.all.medals.bronze,3);
assert.equal(result.all.finished.festival,4);assert.equal(result.all.finished.raceoff,1);assert.equal(result.all.finished.custom,1);
assert.equal(api.festivalPodium(fh5.runs[3]).length,0,'tied Festival champions must not be invented');
assert.equal(api.raceOffPodium({...fh5.raceOffs[0],championCarId:'3'}).length,0,'unconfirmed Race Off champion invalid');
ctx.window.rhRenderMore();assert.match(html,/LIFETIME CAREER/);assert.match(html,/Gran Turismo 7/);assert.match(html,/CURRENT SPACE/);
assert.match(html,/GAME SPACES/);assert.match(html,/Never from game-AI finishing positions/i);
assert.equal(JSON.stringify(data),original,'no writes after UI render');
ctx.rhMoreMode='settings';ctx.window.rhRenderMore();assert.equal(html,'','no career panel on Settings');
ctx.rhMoreMode='stats';ctx.window.rhRenderMore();assert.match(html,/LIFETIME CAREER/);
assert.equal(renders,3);
assert.equal(api.lifetime({spaces:[{id:'empty',name:'Empty'}]}).all.races,0);
console.log('PASS v8.0.142: two Spaces, genuine honours, ties/AI ignored, undated results, real event statuses, duplicate/lap exclusion, per-Space cars, no mutation, existing Stats/Settings navigation');
