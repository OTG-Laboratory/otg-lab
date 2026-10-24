const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
function txt(path){return fs.readFileSync(path,'utf8')}
const gt=txt('js/gt7-catalogue-v6066-main.js'),fh=txt('js/fh6-catalogue-v8104.js'),html=txt('index.html');
assert(gt.includes('if(gt7FindExistingSpace())gt7EnsureSpace(false);'));
assert(fh.includes('fh6EnsureSpace(false,false);'));
assert(!gt.includes('\n    gt7EnsureSpace(false);\n  },0)'));
assert(!fh.includes('  fh6EnsureSpace(false,true);\n  // On a later'));
const gBlock=gt.match(/window\.addEventListener\('load',\(\)=>\{\s*setTimeout\(\(\)=>\{([\s\S]*?)\},0\)\s*\}\);/);
assert(gBlock);
for(const exists of [false,true]){
 let called=0;
 const cx={gt7FindExistingSpace:()=>exists,gt7EnsureSpace:(...args)=>{called++;assert.deepEqual(args,[false])}};
 vm.runInNewContext(gBlock[1],cx);assert.equal(called,exists?1:0);
}
assert(html.includes('name="otg-lab-version" content="0.8.1"'));
assert(html.includes('js/gt7-catalogue-v6066-main.js?v=lab081-sticky-delete'));
assert(html.includes('js/fh6-catalogue-v8104.js?v=lab081-sticky-delete'));
const fBlock=fh.match(/try\{\s*fh6EnsureSpace\(false,false\);/);
assert(fBlock);
console.log('PASS: absent GT7 not automatically recreated; existing GT7 reconciled; FH6 creation disabled during bootstrap; cache-busting versions checked.');
