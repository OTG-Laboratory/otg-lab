// v8.0.143 heading hotfix contract — deliberately no data mutation.
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
const base=path.resolve(__dirname,'..');
const R=f=>fs.readFileSync(path.join(base,f),'utf8');
const legacy=R('style-v595.css'), css=R('style-v8143.css');
const html=R('index-v8143.html'), worker=R('otg-service-worker-v8143.js');
assert.match(legacy,/\.nav,header\{display:none!important\}/,'reproduce global header-hide rule');
assert.match(R('js/otg-lifetime-career-v8142.js'),/<h2>LIFETIME CAREER<\/h2>/,'original section has heading in DOM');
assert.match(css,/#more\s+\.otgLifetime8142\s*>\s*header\s*\{[\s\S]*?display:\s*flex\s*!important/,'scoped !important override wins cascade');
assert.match(css,/padding:\s*0\s*!important/,'reset inherited app header padding');
assert.doesNotMatch(css,/\.nav,header|^header\s*\{/m,'do not expose all app headers');
assert.match(html,/style-v8142.css\?v=8142[\s\S]*style-v8143.css\?v=8143/,'hotfix stylesheet loads AFTER original');
assert.match(html,/meta name="racehub-version" content="8\.0\.143"/);
assert.match(html,/otg-lifetime-career-v8142\.js/,'lifetime result calculations unchanged');
for(const item of ['index-v8143.html','style-v8143.css?v=8143','js/bootstrap-v8143.js?v=8143','js/update-wire-v8143.js?v=8143']){assert(worker.includes(`'./${item}'`),`worker missing ${item}`)}
assert.match(worker,/caches\.match\('\.\/index-v8143\.html'\)/);
assert.match(R('js/bootstrap-v8143.js'),/otg-service-worker-v8143\.js/);
assert.match(R('js/update-wire-v8143.js'),/otg-service-worker-v8143\.js/);
assert.equal(JSON.parse(R('version.json')).version,'8.0.143');
console.log('PASS v8.0.143: bug reproduced, scoped visible header override, old JS unchanged, new page/worker wiring');
