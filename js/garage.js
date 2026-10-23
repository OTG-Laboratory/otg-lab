// OTG! v5.2.3 — Wordmarks & Manufacturer Accents
function manufacturerLogoSlug(make){
 return String(make||'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
}
function manufacturerLogoPath(make){return `assets/logos/${manufacturerLogoSlug(make)}.svg`;}

// Curated brand accents for the most recognisable manufacturers.
// Every other manufacturer receives a stable colour from OTG!'s premium palette.
const MANUFACTURER_ACCENTS={
 'Abarth':'#d91f2b','Alfa Romeo':'#b71c2c','Aston Martin':'#0b7a5a','Audi':'#c7ccd3',
 'BMW':'#2f8fd8','Bugatti':'#4f79a7','Chevrolet':'#f2c230','Dodge':'#d72638',
 'Ferrari':'#e32636','Ford':'#2f6fb2','Honda':'#d71920','Hyundai':'#2d6fb7',
 'Jaguar':'#9fb6ad','Jeep':'#74855b','Koenigsegg':'#f0b429','Lamborghini':'#d8a928',
 'Lancia':'#3d72a4','Land Rover':'#2d7650','Lexus':'#c9cdd1','Lotus':'#f0cf26',
 'Maserati':'#355c9a','Mazda':'#c7253e','McLaren':'#ff7a18','Mercedes-AMG':'#bfc5cc',
 'Mercedes-Benz':'#bfc5cc','Mini':'#d64b4b','Mitsubishi':'#e21f26','Nissan':'#c8243f',
 'Pagani':'#4aa0b8','Peugeot':'#315fa8','Porsche':'#c5a15a','Renault':'#f3c928',
 'Rimac':'#3b9dbf','Subaru':'#3979bd','Toyota':'#e32636','Volkswagen':'#4f8fbd',
 'VW':'#4f8fbd','Volvo':'#4c82ad'
};
const MANUFACTURER_ACCENT_PALETTE=['#4f8fbd','#b56f9a','#55a58a','#bd8652','#8c7bc2','#b75f65','#5c9da8','#9a9f57'];
function manufacturerAccent(make){
 if(MANUFACTURER_ACCENTS[make])return MANUFACTURER_ACCENTS[make];
 const text=String(make||'');let hash=0;for(let i=0;i<text.length;i++)hash=((hash<<5)-hash+text.charCodeAt(i))|0;
 return MANUFACTURER_ACCENT_PALETTE[Math.abs(hash)%MANUFACTURER_ACCENT_PALETTE.length];
}
function renderGarage(){
 const makes=['All',...Array.from(new Set(state.cars.map(c=>c.make))).sort()];
 const completedCount=state.cars.filter(c=>carIsComplete(c.id)).length;
 const startedCount=state.cars.filter(c=>carCompletedEvents(c.id).size&&!carIsComplete(c.id)).length;
 const completionPercent=state.cars.length?Math.round((completedCount/state.cars.length)*100):0;
 let list=state.cars.filter(c=>(garageMake==='All'||c.make===garageMake)&&(!garageSearch||carName(c).toLowerCase().includes(garageSearch.toLowerCase())));
 const groups={};list.forEach(c=>(groups[c.make]??=[]).push(c));
 $('garage').innerHTML=`<div class="garagePage">
  <section class="card garageHero">
   <div class="garageHeroTop"><div><div class="garageEyebrow">Your collection</div><h2>Garage</h2><p class="small">Browse, add or correct the cars in your OTG! collection.</p></div><div class="garageCompletion"><strong>${completionPercent}%</strong><span>complete</span></div></div>
   <div class="garageSummary"><div><strong>${state.cars.length}</strong><span>Total cars</span></div><div><strong>${completedCount}</strong><span>Completed</span></div><div><strong>${startedCount}</strong><span>In progress</span></div><div><strong>${makes.length-1}</strong><span>Manufacturers</span></div></div>
  </section>
  <div class="garageTools">
   <section class="card garageToolCard garageAddCard"><div class="garageToolHeading"><span>＋</span><div><h3>Add a car</h3><p class="small">Add a new car to the collection.</p></div></div><label>Make</label><input id="newMake" placeholder="Lotus"><label>Model</label><input id="newModel" placeholder="Evija"><label>Year optional</label><input id="newYear" inputmode="numeric" placeholder="2020"><button class="btn" onclick="addCar()">Add Car</button></section>
   <section class="card garageToolCard garageSearchCard"><div class="garageToolHeading"><span>⌕</span><div><h3>Find a car</h3><p class="small">Search by make, model or year.</p></div></div><label>Search</label><input id="garageSearch" value="${esc(garageSearch)}" placeholder="Type search"><div class="grid"><button class="btn" onclick="garageSearch=$('garageSearch').value;renderGarage()">Search</button><button class="btn secondary" onclick="garageSearch='';garageMake='All';renderGarage()">Clear</button></div></section>
  </div>
  <section class="card garageCollection"><div class="garageCollectionHeading"><div><h3>Collection</h3><p class="small">${list.length} ${list.length===1?'car':'cars'} shown${garageMake!=='All'?` • ${esc(garageMake)}`:''}${garageSearch?` • “${esc(garageSearch)}”`:''}</p></div></div><div class="chips garageFilters">${makes.map(m=>`<button class="chip ${m===garageMake?'on':''}" onclick="garageMake='${esc(m)}';renderGarage()">${esc(m)} ${m==='All'?'':state.cars.filter(c=>c.make===m).length}</button>`).join('')}</div><div class="garageGroups">${Object.keys(groups).sort().map(m=>`<div class="makeGroup garageMakeGroup" style="--manufacturer-accent:${manufacturerAccent(m)}"><img class="manufacturerWatermark" src="${manufacturerLogoPath(m)}" alt="" aria-hidden="true" onerror="this.remove()"><div class="garageMakeContent"><div class="makeHead"><b>${esc(m)}</b><span>${groups[m].length}</span></div>${groups[m].map(c=>{const done=carCompletedEvents(c.id).size;return `<div class="row garageCarRow ${carIsComplete(c.id)?'garageCarComplete':done?'garageCarStarted':''}"><div class="garageCarIcon">🚗</div><div class="grow garageCarInfo"><strong>${esc(carName(c))}</strong><span class="small">${carIsComplete(c.id)?'✅ Completed':(done?`🏁 ${done}/${state.events.length} events`:'Not started')}</span></div><button class="chip garageEditButton" onclick="editCar('${c.id}')">Edit</button></div>`}).join('')}</div></div>`).join('')||'<div class="empty garageEmpty">No cars found. Try clearing the search or choosing another manufacturer.</div>'}</div></section>
 </div>`;
}
function addCar()

{
 const make=$('newMake').value.trim(), model=$('newModel').value.trim(), year=$('newYear').value.trim();
 if(!make||!model){toast('Enter make and model');return;}
 const name=`${make} ${model}${year?' '+year:''}`.replace(/\s+/g,' ').trim();
 const id=name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
 if(state.cars.some(c=>c.id===id||carName(c).toLowerCase()===name.toLowerCase())){toast('Car already exists');return;}
 state.cars.push({id,make,model,year,name});garageMake=make;garageSearch=model;save();toast('Car added');renderGarage();
}
function editCar(id){
 const car=carById(id);
 if(!car)return;
 closeCarEditor();
 document.body.insertAdjacentHTML('beforeend',`<div id="carEditorOverlay" class="carEditorOverlay">
  <div class="carEditorCard">
   <h2>✏️ Edit Car</h2>
   <p class="small">Changing these details will not remove results, records or progress.</p>
   <label>Manufacturer</label><input id="editCarMake" value="${esc(car.make)}">
   <label>Model</label><input id="editCarModel" value="${esc(car.model)}">
   <label>Year</label><input id="editCarYear" inputmode="numeric" maxlength="4" value="${esc(car.year||'')}">
   <div class="grid"><button class="btn" onclick="saveCarEdit('${car.id}')">Save Changes</button><button class="btn secondary" onclick="closeCarEditor()">Cancel</button></div>
  </div>
 </div>`);
}
function closeCarEditor(){const o=$('carEditorOverlay');if(o)o.remove();}
function saveCarEdit(id){
 const car=carById(id); if(!car)return;
 const cleanMake=$('editCarMake').value.trim();
 const cleanModel=$('editCarModel').value.trim();
 const cleanYear=$('editCarYear').value.trim();
 if(!cleanMake||!cleanModel){toast('Manufacturer and model are required');return;}
 if(cleanYear&&!/^\d{4}$/.test(cleanYear)){toast('Year must be four digits');return;}
 const newName=`${cleanMake} ${cleanModel}${cleanYear?' '+cleanYear:''}`.replace(/\s+/g,' ').trim();
 const duplicate=state.cars.some(c=>c.id!==id&&carName(c).toLowerCase()===newName.toLowerCase());
 if(duplicate){toast('That car already exists');return;}
 car.make=cleanMake; car.model=cleanModel; car.year=cleanYear; car.name=newName;
 garageMake=cleanMake;
 save(); closeCarEditor(); toast('Car updated'); renderGarage();
}

