/* ═══════════════════════════════════════════════════════════
   Family Tree Application - Main Logic
   Modular, clean, professional code with full i18n support
═══════════════════════════════════════════════════════════ */

/* ─── GENERATION METADATA ──────────────────────────────── */
const GM = {
  '-3':{label:'−3 · Gt-gt-grandparents',short:'−3',color:'#f59e0b',bg:'#2d1f00'},
  '-2':{label:'−2 · Great-grandparents', short:'−2',color:'#a78bfa',bg:'#1e1040'},
  '-1':{label:'−1 · Grandparents',       short:'−1',color:'#34d399',bg:'#003322'},
  '0': {label:' 0 · Parents of Nana Aku',short:' 0',color:'#e879f9',bg:'#2a0030'},
   1:  {label:'I — Matriarch',            short:'I',  color:'#c0392b',bg:'#2d0f0c'},
   2:  {label:'II — Children',            short:'II', color:'#c87941',bg:'#2d1a0c'},
   3:  {label:'III — Grandchildren',      short:'III',color:'#3a9e6f',bg:'#0c2d1e'},
   4:  {label:'IV — Great-Grandchildren', short:'IV', color:'#7c5bb5',bg:'#1e1030'},
   5:  {label:'V — 5th Generation',       short:'V',  color:'#c0875a',bg:'#2d1808'},
   6:  {label:'VI — 6th Generation',      short:'VI', color:'#2e9fb5',bg:'#082028'},
   7:  {label:'VII — 7th Generation',     short:'VII',color:'#b55a7c',bg:'#2d0818'},
   8:  {label:'VIII — 8th Generation',    short:'VIII',color:'#7aab47',bg:'#182808'},
   9:  {label:'IX — 9th Generation',      short:'IX', color:'#5a7cb5',bg:'#080e28'},
  10:  {label:'X — 10th Generation',      short:'X',  color:'#b5a83a',bg:'#28240a'},
};
function gm(g){ return GM[g]||GM[String(g)]||GM[4]; }

/* ─── STATE ─────────────────────────────────────────────── */
let members=[], selId=null, editId=null, zoomObj, svgSel, gSel, pollTimer=null, currentTransform=null;
const NW=158, NH=66;
const isMobile=()=>window.innerWidth<=600;
const FIRST_VISIT_KEY='myFamilySeenHelp';
let isAdminMode=false;
let changeRequests=[];
let ancestorChildId=null; // Track which child we're adding a parent for
let matrilinealOnly=false; // Filter to show only female lineage

/* ─── SEED DATA (Fallback) ────────────────────────────────── */
const SEED=[{id:1,name:'Nana Aku',gender:'Female',gen:1,parentId:null,birth:'',death:'',town:'',notes:'Family matriarch',by:''}];

/* ─── API ───────────────────────────────────────────────── */
async function api(url,opts={}){
  if(opts.body&&typeof opts.body==='object'){
    opts.body=JSON.stringify(opts.body);
  }
  const r=await fetch(url,{headers:{'Content-Type':'application/json'},...opts});
  const d=await r.json();
  if(!r.ok)throw new Error(d.error||`Server error ${r.status}`);
  return d;
}

/* ─── CONNECTION STATUS ────────────────────────────────── */
function setConn(s,m){
  const b=document.getElementById('connBar');
  b.className='conn-bar '+s;
  document.getElementById('connText').textContent=m;
}

/* ─── UPDATE UI TEXT (Translation Support) ────────────── */
function updateUIText(){
  document.getElementById('searchInput').placeholder=t('searchPlaceholder');
  document.getElementById('adminBtn').title=t('adminMode');
  document.getElementById('themeBtn').title=t('toggleTheme');
  document.getElementById('backupText').textContent=t('backup');
  document.getElementById('importText').textContent=t('import');
  document.getElementById('requestsText').textContent='📋 '+t('requests');
  document.getElementById('addText').textContent=t('addMember');
  document.getElementById('fitBtn').title=t('fitScreen');
  // Loading screen might be removed already
  const loadingMsg=document.getElementById('loadingMsg');
  if(loadingMsg)loadingMsg.textContent=t('connLoading');
  updateHintBar();
  renderWelcomeModal();
  renderFormModal();
  renderExportModal();
  renderImportModal();
  renderChangeRequestsModal();
  if(selId)renderSidebar(selId);
  buildLegend();
}

function updateHintBar(){
  document.getElementById('hintBar').textContent=isMobile()?t('hintMobile'):t('hintDesktop');
}

/* ─── LOAD MEMBERS ──────────────────────────────────────── */
async function loadMembers(silent=false){
  if(!silent)setConn('loading',t('connLoading'));
  try{
    const data=await api('/api/members');
    const prev=members.length;
    members=data;
    if(!silent)hideLoading();
    setConn('ok',t('connOk',{count:members.length}));
    updatePills();buildLegend();renderTree(silent);
    if(selId)renderSidebar(selId);
    if(silent&&members.length>prev){
      const d=members.length-prev;
      toast(t('toastNewMembers',{count:d,s:d>1?'s':''}),'info');
    }
    return true;
  }catch(e){
    setConn('err',t('connError'));
    if(!silent)document.getElementById('loadingMsg').textContent='❌ '+t('connError');
    if(!members.length){members=SEED.map(x=>({...x}));hideLoading();updatePills();buildLegend();renderTree(false);}
    return false;
  }
}

function startPolling(){
  clearInterval(pollTimer);
  pollTimer=setInterval(()=>{loadMembers(true);loadChangeRequests(true);},30000);
}

function hideLoading(){
  const s=document.getElementById('loadingScreen');
  s.classList.add('gone');
  setTimeout(()=>s.remove(),500);
}

/* ─── INIT ──────────────────────────────────────────────── */
async function init(){
  updateHintBar();
  renderWelcomeModal();
  renderFormModal();
  renderExportModal();
  renderImportModal();
  renderChangeRequestsModal();
  const ok=await loadMembers();
  await loadChangeRequests();
  if(ok)startPolling();
  try{
    if(!localStorage.getItem(FIRST_VISIT_KEY)){
      localStorage.setItem(FIRST_VISIT_KEY,'1');
      setTimeout(openHelp, 800);
    }
  }catch(e){}
}

/* ─── RENDER TREE ───────────────────────────────────────── */
function renderTree(preserveZoom=false){
  const cv=document.getElementById('canvas'),W=cv.clientWidth,H=cv.clientHeight;
  svgSel=d3.select('#svg').attr('width',W).attr('height',H);
  svgSel.selectAll('*').remove();
  if(!members.length)return;

  // Apply matrilineal filter if enabled
  let filteredMembers = members;
  if(matrilinealOnly){
    // Build matrilineal lineage: trace through female ancestors only
    const includedIds = new Set();
    
    // Add members iteratively to build matrilineal line
    // Start with root females (no parent or parent not in dataset)
    members.forEach(m => {
      if(!m.parentId){
        // Root member with no parent - include if female
        if(m.gender === 'Female'){
          includedIds.add(m.id);
        }
      }
    });
    
    // Iteratively add children of females until no more can be added
    let added = true;
    while(added){
      added = false;
      members.forEach(m => {
        if(!includedIds.has(m.id) && m.parentId){
          const parent = members.find(p => p.id === m.parentId);
          // Add if parent is female AND parent is in the matrilineal line
          if(parent && parent.gender === 'Female' && includedIds.has(parent.id)){
            includedIds.add(m.id);
            added = true;
          }
        }
      });
    }
    
    // Filter members and fix parent references
    filteredMembers = members
      .filter(m => includedIds.has(m.id))
      .map(m => {
        // Connect to virtual root if: no parent OR parent not in filtered set
        if(!m.parentId || (m.parentId && !includedIds.has(m.parentId))){
          return {...m, parentId: 'virtual_root'};
        }
        return m;
      });
    
    // Add virtual root node to connect all orphaned branches
    filteredMembers.unshift({
      id: 'virtual_root',
      name: 'Matrilineal Lineage',
      gender: 'Female',
      gen: -10,
      parentId: null,
      birth: '',
      death: '',
      town: '',
      notes: '',
      by: '',
      isVirtual: true
    });
  } else {
    // Normal mode: Check for multiple roots and create virtual root if needed
    const rootMembers = members.filter(m => !m.parentId || !members.find(p => p.id === m.parentId));
    
    if(rootMembers.length > 1){
      // Multiple roots detected - create virtual root
      filteredMembers = members.map(m => {
        if(!m.parentId || !members.find(p => p.id === m.parentId)){
          return {...m, parentId: 'virtual_root'};
        }
        return m;
      });
      
      filteredMembers.unshift({
        id: 'virtual_root',
        name: 'Family Tree',
        gender: '',
        gen: Math.min(...members.map(m => m.gen)) - 1,
        parentId: null,
        birth: '',
        death: '',
        town: '',
        notes: 'Root node connecting all family branches',
        by: '',
        isVirtual: true
      });
    }
  }

  let root;
  try{root=d3.stratify().id(d=>d.id).parentId(d=>d.parentId)(filteredMembers);}
  catch(e){
    console.error('D3 Stratify Error:', e);
    console.log('Filtered Members:', filteredMembers);
    setConn('err',`Tree error: ${e.message}`);
    toast(`⚠ Tree error: ${e.message}`,'err');
    return;
  }

  const tL=d3.tree().nodeSize([NW+22,NH+78]);tL(root);
  let x0=Infinity,x1=-Infinity;root.each(d=>{if(d.x<x0)x0=d.x;if(d.x>x1)x1=d.x;});
  const tW=x1-x0+NW+90,tH=(root.height+1)*(NH+78)+70;
  gSel=svgSel.append('g');

  const defs=svgSel.append('defs');
  const gf=defs.append('filter').attr('id','glow').attr('x','-30%').attr('y','-30%').attr('width','160%').attr('height','160%');
  gf.append('feGaussianBlur').attr('stdDeviation',5).attr('result','blur');
  const mg=gf.append('feMerge');mg.append('feMergeNode').attr('in','blur');mg.append('feMergeNode').attr('in','SourceGraphic');

  zoomObj=d3.zoom().scaleExtent([0.04,4]).on('zoom',ev=>{
    gSel.attr('transform',ev.transform);
    currentTransform=ev.transform;
  });
  svgSel.call(zoomObj).on('dblclick.zoom',null);
  
  // Restore previous zoom or set default
  if(preserveZoom && currentTransform){
    svgSel.call(zoomObj.transform,currentTransform);
  } else {
    const baseScale=Math.min(0.9,Math.min(W/tW,H/tH));
    // Mobile: prioritize readability over fitting entire tree - start at 0.7x minimum
    const sc=isMobile()?Math.max(0.7,Math.min(1.2,baseScale*1.5)):baseScale;
    // Center on root node (matriarch) instead of middle of tree - show top hierarchy
    const topY=isMobile()?80:60;
    const newTransform=d3.zoomIdentity.translate(W/2-root.x*sc,topY*sc).scale(sc);
    svgSel.call(zoomObj.transform,newTransform);
    currentTransform=newTransform;
  }

  const lp=d3.linkVertical().x(d=>d.x).y(d=>d.y);
  gSel.selectAll('.link').data(root.links()).enter().append('path').attr('class','link')
    .attr('d',d=>lp({source:{x:d.source.x,y:d.source.y+NH/2},target:{x:d.target.x,y:d.target.y-NH/2}}))
    .attr('stroke',d=>gm(d.target.data.gen).color).attr('stroke-opacity',.3).attr('stroke-width',1.5);

  const ng=gSel.selectAll('.node-g').data(root.descendants()).enter()
    .append('g').attr('class',d=>'node-g'+(d.data.id===selId?' selected':'')+(d.data.isVirtual?' virtual':''))
    .attr('transform',d=>`translate(${d.x},${d.y})`)
    .style('filter',d=>d.data.id===selId?'url(#glow)':null)
    .style('opacity',d=>d.data.isVirtual?0.5:1)
    .on('click',(e,d)=>{e.stopPropagation();if(!d.data.isVirtual)selectNode(d.data.id);})
    .on('touchend',(e,d)=>{e.preventDefault();e.stopPropagation();if(!d.data.isVirtual)selectNode(d.data.id);});

  ng.each(function(d){
    const g=d3.select(this),m=d.data,gmv=gm(m.gen),s=m.id===selId;
    const mobile=isMobile();
    const nameSize=mobile?14.5:12.5;
    const genderSize=mobile?17:15;
    const labelSize=mobile?10:8.5;
    const badgeSize=mobile?11:10;
    
    if(s)g.append('rect').attr('x',-NW/2-5).attr('y',-NH/2-5).attr('width',NW+10).attr('height',NH+10).attr('rx',14).attr('fill','none').attr('stroke',gmv.color).attr('stroke-width',2).attr('stroke-opacity',.7);
    g.append('rect').attr('class','n-bg').attr('x',-NW/2).attr('y',-NH/2).attr('width',NW).attr('height',NH).attr('rx',10).attr('fill',gmv.bg).attr('stroke',gmv.color).attr('stroke-width',s?2.5:1.2).attr('stroke-opacity',s?1:.7);
    g.append('rect').attr('x',-NW/2).attr('y',-NH/2).attr('width',4).attr('height',NH).attr('rx',2).attr('fill',gmv.color);
    
    // Add profile photo if available
    if(m.photoUrl && !m.isVirtual){
      const photoSize=40;
      const photoX=-NW/2+10;
      const photoY=-NH/2+8;
      g.append('clipPath').attr('id',`clip-${m.id}`).append('circle').attr('cx',photoX+photoSize/2).attr('cy',photoY+photoSize/2).attr('r',photoSize/2);
      g.append('image').attr('x',photoX).attr('y',photoY).attr('width',photoSize).attr('height',photoSize).attr('href',m.photoUrl).attr('clip-path',`url(#clip-${m.id})`).attr('preserveAspectRatio','xMidYMid slice');
      g.append('circle').attr('cx',photoX+photoSize/2).attr('cy',photoY+photoSize/2).attr('r',photoSize/2).attr('fill','none').attr('stroke',gmv.color).attr('stroke-width',2);
    }
    
    const gg=m.gender==='Female'?'♀':m.gender==='Male'?'♂':'·';
    
    // Adjust text positioning based on photo presence
    if(m.photoUrl){
      // With photo: shift everything right, use left-aligned text
      const textStartX=-NW/2+58;
      g.append('text').attr('x',textStartX).attr('y',-12).attr('fill',gmv.color).attr('font-size',genderSize).attr('font-family','DM Sans,sans-serif').attr('dominant-baseline','middle').text(gg);
      g.append('text').attr('x',textStartX+20).attr('y',-12).attr('text-anchor','start').attr('dominant-baseline','middle').attr('font-family','Playfair Display,serif').attr('font-size',nameSize).attr('font-weight',700).attr('fill','#f5ead5').text(m.name.length>14?m.name.slice(0,13)+'…':m.name);
      g.append('text').attr('x',textStartX+20).attr('y',6).attr('text-anchor','start').attr('dominant-baseline','middle').attr('font-family','DM Mono,monospace').attr('font-size',labelSize).attr('fill',gmv.color).attr('fill-opacity',.85).text(gmv.label);
      if(m.birth)g.append('text').attr('x',textStartX+20).attr('y',20).attr('text-anchor','start').attr('dominant-baseline','middle').attr('font-family','DM Mono,monospace').attr('font-size',labelSize).attr('fill','#7a6e5f').text(`${m.birth} – ${m.death||t('present')}`);
    }else{
      // Without photo: centered text as before
      g.append('text').attr('x',-NW/2+13).attr('y',-7).attr('fill',gmv.color).attr('font-size',genderSize).attr('font-family','DM Sans,sans-serif').attr('dominant-baseline','middle').text(gg);
      g.append('text').attr('x',5).attr('y',-10).attr('text-anchor','middle').attr('dominant-baseline','middle').attr('font-family','Playfair Display,serif').attr('font-size',nameSize).attr('font-weight',700).attr('fill','#f5ead5').text(m.name.length>17?m.name.slice(0,16)+'…':m.name);
      g.append('text').attr('x',5).attr('y',9).attr('text-anchor','middle').attr('dominant-baseline','middle').attr('font-family','DM Mono,monospace').attr('font-size',labelSize).attr('fill',gmv.color).attr('fill-opacity',.85).text(gmv.label);
      if(m.birth)g.append('text').attr('x',5).attr('y',25).attr('text-anchor','middle').attr('dominant-baseline','middle').attr('font-family','DM Mono,monospace').attr('font-size',labelSize).attr('fill','#7a6e5f').text(`${m.birth} – ${m.death||t('present')}`);
    }
    
    const kc=d.children?d.children.length:0;
    if(kc>0){
      g.append('circle').attr('cx',NW/2-12).attr('cy',-NH/2+12).attr('r',12).attr('fill',gmv.color).attr('stroke',gmv.bg).attr('stroke-width',2.5);
      g.append('text').attr('x',NW/2-12).attr('y',-NH/2+12).attr('text-anchor','middle').attr('dominant-baseline','middle').attr('fill','#fff').attr('font-size',badgeSize).attr('font-family','DM Mono,monospace').attr('font-weight','700').text(kc);
    }
  });

  svgSel.on('click',()=>{if(selId!==null){selId=null;closeSidebar();renderTree();}});
}

function zoomBy(f){if(svgSel)svgSel.transition().duration(260).call(zoomObj.scaleBy,f);}
function resetView(){renderTree();}

/* ─── SIDEBAR ───────────────────────────────────────────── */
function selectNode(id){
  selId=id;renderTree(true);renderSidebar(id);
  
  // Zoom in on selected node with smooth animation (like search)
  setTimeout(()=>{
    const selectedNode=document.querySelector('.node-g.selected');
    if(selectedNode && svgSel && zoomObj){
      const transform=selectedNode.getAttribute('transform');
      const match=transform.match(/translate\(([^,]+),([^)]+)\)/);
      if(match){
        const x=parseFloat(match[1]);
        const y=parseFloat(match[2]);
        const cv=document.getElementById('canvas');
        const W=cv.clientWidth;
        const H=cv.clientHeight;
        
        // Zoom to 1.4x scale on mobile, 1.2x on desktop, and center on node
        const targetScale=isMobile()?1.4:1.2;
        const currentScale=currentTransform?currentTransform.k:1;
        const newScale=Math.max(currentScale,targetScale);
        
        const newTransform=d3.zoomIdentity
          .translate(W/2-x*newScale,H/2-y*newScale)
          .scale(newScale);
        
        svgSel.transition()
          .duration(500)
          .ease(d3.easeCubicOut)
          .call(zoomObj.transform,newTransform);
      }
    }
  },50);
  
  if(isMobile()){
    setTimeout(()=>document.getElementById('sbContent').scrollTop=0,60);
    // Gentle haptic feedback on mobile
    if(navigator.vibrate)navigator.vibrate(10);
  }
}

function renderSidebar(id){
  const m=members.find(x=>x.id===id);if(!m)return;
  document.getElementById('sidebar').classList.add('open');
  const gmv=gm(m.gen),par=members.find(x=>x.id===m.parentId),kids=members.filter(x=>x.parentId===m.id);
  const isRoot=!par&&m.gen===1;
  const isAncestor=m.gen<=0;
  const genderText=m.gender==='Female'?`♀ ${t('female')}`:m.gender==='Male'?`♂ ${t('male')}`:`⊕ ${t('genderNotRecorded')}`;
  const yearsText=m.birth?`${m.birth} – ${m.death||t('present')}`:t('notRecorded');

  document.getElementById('sbContent').innerHTML=`
    <div class="sb-top">
      <div class="sb-badge" style="background:${gmv.color}18;color:${gmv.color};border:1px solid ${gmv.color}40">${gmv.short} · ${gmv.label}</div>
      <button class="sb-close" onclick="closeSidebar()" title="${t('close')}">✕</button>
    </div>
    ${m.photoUrl?`
    <div class="sb-photo" style="position:relative;margin-bottom:16px">
      <img src="${m.photoUrl}" alt="${m.name}" style="width:100%;height:200px;object-fit:cover;border-radius:8px">
      <button onclick="removePhoto(${m.id})" style="position:absolute;top:8px;right:8px;background:rgba(0,0,0,0.7);color:#fff;border:none;border-radius:50%;width:32px;height:32px;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;transition:all 0.2s" onmouseover="this.style.background='#c0392b'" onmouseout="this.style.background='rgba(0,0,0,0.7)'" title="Remove photo">✕</button>
    </div>`:''}
    <div class="sb-name">${m.name}</div>
    <div class="sb-sub">${genderText}</div>
    <div class="info-grid">
      <div class="info-box">
        <div class="lbl">${t('parent')}</div>
        <div class="val${par?' link':''}" onclick="${par?`selectNode(${par.id})`:''}">${par?par.name:t('notRecorded')}</div>
      </div>
      <div class="info-box">
        <div class="lbl">${t('years')}</div>
        <div class="val">${yearsText}</div>
      </div>
      <div class="info-box">
        <div class="lbl">${t('hometown')}</div>
        <div class="val">${m.town||t('notRecorded')}</div>
      </div>
      <div class="info-box">
        <div class="lbl">${t('addedBy')}</div>
        <div class="val">${m.by||'—'}</div>
      </div>
    </div>
    ${m.notes?`<div class="notes-box"><div class="lbl">${t('notes')}</div><div class="val">${m.notes}</div></div>`:''}
    <div class="sb-actions">
      <button class="btn btn-gold btn-sm" onclick="openAdd(${m.id})">＋ ${t('addChild')}</button>
      ${isAncestor||isRoot?`<button class="btn btn-purple btn-sm" onclick="openAddAncestor(${m.id})">▲ ${t('addParent')}</button>`:''}
      <button class="btn btn-teal btn-sm" onclick="openPhotoUpload(${m.id})">📸 Add Photo</button>
      ${isAdminMode?`<button class="btn btn-ghost btn-sm" onclick="openEdit(${m.id})">✎ ${t('edit')}</button>`:''}
      ${isAdminMode?`<button class="btn btn-red btn-sm" onclick="deleteMember(${m.id})">✕ ${t('delete')}</button>`:''}
      ${!isAdminMode?`<button class="btn btn-blue btn-sm" onclick="requestChange(${m.id})">📝 ${t('requestChange')}</button>`:''}
    </div>
    ${kids.length?`
    <div class="kids-section" style="margin-top:16px">
      <h4>${t('childrenOf',{name:m.name,count:kids.length})}</h4>
      ${kids.map(c=>{const cg=gm(c.gen),gi=c.gender==='Female'?'♀':c.gender==='Male'?'♂':'·';
        return`<span class="kid-chip" onclick="selectNode(${c.id})" style="border-color:${cg.color}40">
          <span style="color:${cg.color}">${gi}</span> ${c.name}
        </span>`;}).join('')}
    </div>`:`
    <div style="margin-top:14px;padding:12px;background:var(--card);border:1px solid var(--border);border-radius:8px;font-size:11px;color:var(--ink3);text-align:center;line-height:1.5">
      ${t('noChildren')}<br>${t('pressAddChild')}
    </div>`}
  `;
}

function closeSidebar(){
  selId=null;
  document.getElementById('sidebar').classList.remove('open');
  renderTree(true);
}

/* ─── DYNAMIC MODAL RENDERERS (For Translation) ───────── */
function renderWelcomeModal(){
  document.getElementById('welcomeContent').innerHTML=`
    <div class="welcome-hero">
      <span class="tree-icon">🌳</span>
      <h1>${t('welcomeTitle')}</h1>
      <p>${t('welcomeSubtitle')}</p>
    </div>
    <div class="welcome-body">
      <div class="steps-grid">
        <div class="step-card">
          <div class="step-num">1</div>
          <h3>${t('step1Title')}</h3>
          <p>${t('step1Desc')}</p>
        </div>
        <div class="step-card">
          <div class="step-num">2</div>
          <h3>${t('step2Title')}</h3>
          <p>${t('step2Desc')}</p>
        </div>
        <div class="step-card">
          <div class="step-num">3</div>
          <h3>${t('step3Title')}</h3>
          <p>${t('step3Desc')}</p>
        </div>
        <div class="step-card">
          <div class="step-num">4</div>
          <h3>${t('step4Title')}</h3>
          <p>${t('step4Desc')}</p>
        </div>
      </div>
      <div class="faq-section">
        <div class="faq-item">
          <div class="faq-q">${t('faqGeneration')}</div>
          <div class="faq-a">${t('faqGenerationAnswer')}</div>
        </div>
        <div class="faq-item">
          <div class="faq-q">${t('faqParent')}</div>
          <div class="faq-a">${t('faqParentAnswer')}</div>
        </div>
        <div class="faq-item">
          <div class="faq-q">${t('faqAncestor')}</div>
          <div class="faq-a">${t('faqAncestorAnswer')}</div>
        </div>
        <div class="faq-item">
          <div class="faq-q">${t('faqSearch')}</div>
          <div class="faq-a">${t('faqSearchAnswer')}</div>
        </div>
        <div class="faq-item">
          <div class="faq-q">${t('faqAdmin')}</div>
          <div class="faq-a">${t('faqAdminAnswer')}</div>
        </div>
      </div>
    </div>
    <div class="welcome-foot">
      <button class="btn btn-gold" onclick="closeHelp()">${t('gotIt')}</button>
    </div>
  `;
}

function renderFormModal(){
  const form=document.getElementById('formModalContent');
  if(!form)return;
  
  form.innerHTML=`
    <h2 id="modalTitle">${t('addFamilyMember')}</h2>
    <p class="modal-sub" id="modalSub">${t('fillDetails')}</p>
    <div class="ctx-box ancestor" id="ctxAncestor">
      <strong>${t('genHintAncestor').split('.')[0]}</strong>
      ${t('genHintAncestor')}
    </div>
    <div class="form-grid">
      <div class="fld full">
        <label>${t('fullName')} <span>${t('required')}</span></label>
        <input id="f-name" placeholder="${t('namePlaceholder')}">
        <div class="fld-hint">${t('nameHint')}</div>
      </div>
      <div class="fld">
        <label>${t('gender')}</label>
        <select id="f-gender">
          <option value="">${t('notSpecified')}</option>
          <option value="Female">${t('female')}</option>
          <option value="Male">${t('male')}</option>
          <option value="Other">${t('nonBinary')}</option>
        </select>
      </div>
      <div class="fld">
        <label>${t('generation')} <em>${t('genWhere')}</em></label>
        <select id="f-gen" onchange="onGenChange()">
          ${[-3,-2,-1,0,1,2,3,4,5,6,7,8,9,10].map(g=>`<option value="${g}">${gm(g).label}</option>`).join('')}
        </select>
        <div class="fld-hint" id="genHint">${t('genHintDefault')}</div>
      </div>
      <div class="fld full">
        <label>${t('parentLabel')} <em>${t('parentWho')}</em></label>
        <select id="f-parent"></select>
        <div class="fld-hint">${t('parentHint')}</div>
      </div>
      <div class="fld">
        <label>${t('birthYear')}</label>
        <input id="f-birth" placeholder="${t('birthPlaceholder')}">
      </div>
      <div class="fld">
        <label>${t('deathYear')} <em>${t('deathHint')}</em></label>
        <input id="f-death" placeholder="${t('deathPlaceholder')}">
      </div>
      <div class="fld full">
        <label>${t('hometownLabel')}</label>
        <input id="f-town" placeholder="${t('hometownPlaceholder')}">
      </div>
      <div class="fld full">
        <label>${t('addedByLabel')} <span>${t('required')}</span> <em>${t('addedByYourName')}</em></label>
        <input id="f-by" placeholder="${t('addedByPlaceholder')}">
        <div class="fld-hint">${t('addedByHint')}</div>
      </div>
      <div class="fld full">
        <label>${t('notesLabel')} <em>${t('optional')}</em></label>
        <textarea id="f-notes" placeholder="${t('notesPlaceholder')}"></textarea>
      </div>
    </div>
    <div class="modal-foot">
      <button class="btn btn-ghost" onclick="closeModal()">${t('cancel')}</button>
      <button class="btn btn-gold" id="saveBtn" onclick="saveMember()">💾 ${t('saveMember')}</button>
    </div>
  `;
}

function renderExportModal(){
  document.getElementById('exportContent').innerHTML=`
    <h2>📤 ${t('backupTitle')}</h2>
    <p class="modal-sub">${t('backupDesc')}</p>
    <div class="stat-grid" id="exStats"></div>
    <div style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:12px 14px;font-size:11px;color:var(--ink3);line-height:1.6;margin-bottom:4px">
      ${t('backupTip')}
    </div>
    <div class="modal-foot">
      <button class="btn btn-ghost" onclick="closeEx()">${t('close')}</button>
      <button class="btn btn-green" onclick="doExport()">⬇ ${t('downloadBackup')}</button>
    </div>
  `;
}

function renderImportModal(){
  document.getElementById('importContent').innerHTML=`
    <h2>📥 ${t('importTitle')}</h2>
    <p class="modal-sub">${t('importDesc')}</p>
    <div style="background:#c0392b18;border:1px solid #c0392b44;border-radius:8px;padding:12px 14px;font-size:11px;color:#e57373;line-height:1.6;margin-bottom:14px">
      ${t('importWarning')}
    </div>
    <div class="fld" style="margin-bottom:14px">
      <label>${t('selectFile')} <span>*</span></label>
      <input type="file" id="importFile" accept=".json" style="padding:8px">
    </div>
    <div class="modal-foot">
      <button class="btn btn-ghost" onclick="closeImport()">${t('close')}</button>
      <button class="btn btn-purple" onclick="doImport()" id="importDoBtn">⬆ ${t('importButton')}</button>
    </div>
  `;
}

function renderChangeRequestsModal(){
  document.getElementById('requestsHeader').innerHTML=`
    <h2>📋 ${t('changeRequestsTitle')}</h2>
    <p class="modal-sub">${t('changeRequestsDesc')}</p>
  `;
}

/* ─── MODAL FUNCTIONS ───────────────────────────────────── */
function onGenChange(){
  const v=parseInt(document.getElementById('f-gen').value);
  document.getElementById('ctxAncestor').classList.toggle('show',v<=0);
  document.getElementById('genHint').textContent = v<=0?t('genHintAncestor'):t('genHintDefault');
}

function populateParent(preselect){
  const s=document.getElementById('f-parent');
  s.innerHTML=`<option value="">${t('parentUnknown')}</option>`;
  const sorted=[...members].sort((a,b)=>a.gen-b.gen||a.name.localeCompare(b.name));
  sorted.forEach(m=>{
    const o=document.createElement('option');
    o.value=m.id;
    o.textContent=`${m.name}  (${gm(m.gen).label.replace(' — ',' · ')})`;
    if(m.id==preselect)o.selected=true;
    s.appendChild(o);
  });
}

function openAdd(pid){
  editId=null;
  renderFormModal();
  document.getElementById('modalTitle').textContent=t('addFamilyMember');
  document.getElementById('modalSub').textContent=t('fillDetails');
  document.getElementById('ctxAncestor').classList.remove('show');
  ['name','birth','death','town','by'].forEach(k=>document.getElementById(`f-${k}`).value='');
  document.getElementById('f-notes').value='';
  document.getElementById('f-gender').value='';
  populateParent(pid);
  if(pid){
    const p=members.find(x=>x.id===pid);
    if(p){document.getElementById('f-gen').value=Math.min(p.gen+1,10);document.getElementById('f-parent').value=pid;}
  } else {
    document.getElementById('f-gen').value=2;
  }
  document.getElementById('genHint').textContent=t('genHintDefault');
  document.getElementById('saveBtn').textContent=`💾 ${t('saveMember')}`;
  document.getElementById('overlay').classList.add('show');
  setTimeout(()=>{
    const nameInput=document.getElementById('f-name');
    const byInput=document.getElementById('f-by');
    nameInput.focus();
    setupNameCapitalization(nameInput);
    setupNameCapitalization(byInput);
  },120);
}

function openAddAncestor(childId){
  editId=null;
  ancestorChildId=childId; // Remember which child needs this parent
  renderFormModal();
  const child=members.find(x=>x.id===childId);
  document.getElementById('modalTitle').textContent=t('addAncestor');
  document.getElementById('modalSub').textContent=`${t('fillDetails')} ${child?t('parentFor',{name:child.name})||`(Parent for ${child.name})`:''}`;
  document.getElementById('ctxAncestor').classList.add('show');
  ['name','birth','death','town','by'].forEach(k=>document.getElementById(`f-${k}`).value='');
  document.getElementById('f-notes').value='';
  document.getElementById('f-gender').value='';
  document.getElementById('f-gen').value=Math.max(-3,(child?child.gen:1)-1);
  populateParent(null);
  document.getElementById('f-parent').value='';
  document.getElementById('genHint').textContent=t('genHintAncestor');
  document.getElementById('saveBtn').textContent=`💾 ${t('saveAncestor')}`;
  document.getElementById('overlay').classList.add('show');
  setTimeout(()=>{
    const nameInput=document.getElementById('f-name');
    const byInput=document.getElementById('f-by');
    nameInput.focus();
    setupNameCapitalization(nameInput);
    setupNameCapitalization(byInput);
  },120);
}

function openEdit(id){
  if(!isAdminMode){toast(t('toastErrorEdit'),'err');return;}
  const m=members.find(x=>x.id===id);if(!m)return;
  editId=id;
  renderFormModal();
  document.getElementById('modalTitle').textContent=t('editMember',{name:m.name});
  document.getElementById('modalSub').textContent=t('updateDetails');
  document.getElementById('f-name').value=m.name;
  document.getElementById('f-gender').value=m.gender||'';
  document.getElementById('f-gen').value=m.gen;
  document.getElementById('f-birth').value=m.birth||'';
  document.getElementById('f-death').value=m.death||'';
  document.getElementById('f-town').value=m.town||'';
  document.getElementById('f-by').value=m.by||'';
  document.getElementById('f-notes').value=m.notes||'';
  document.getElementById('ctxAncestor').classList.toggle('show',m.gen<=0);
  populateParent(m.parentId);
  document.getElementById('f-parent').value=m.parentId||'';
  document.getElementById('saveBtn').textContent=` ${t('saveChanges')}`;
  document.getElementById('overlay').classList.add('show');
  setTimeout(()=>{
    const nameInput=document.getElementById('f-name');
    const byInput=document.getElementById('f-by');
    nameInput.focus();
    nameInput.select();
    setupNameCapitalization(nameInput);
    setupNameCapitalization(byInput);
  },120);
}

function closeModal(){document.getElementById('overlay').classList.remove('show');editId=null;ancestorChildId=null;}

async function saveMember(){
  const name=document.getElementById('f-name').value.trim();
  const by=document.getElementById('f-by').value.trim();
  if(!name){toast(t('toastErrorName'),'err');document.getElementById('f-name').focus();shakeElement('f-name');return;}
  if(!by){toast(t('toastErrorAddedBy'),'err');document.getElementById('f-by').focus();shakeElement('f-by');return;}
  const data={name,gender:document.getElementById('f-gender').value,gen:parseInt(document.getElementById('f-gen').value),parentId:parseInt(document.getElementById('f-parent').value)||null,birth:document.getElementById('f-birth').value,death:document.getElementById('f-death').value,town:document.getElementById('f-town').value.trim(),by,notes:document.getElementById('f-notes').value.trim()};
  const btn=document.getElementById('saveBtn');
  btn.textContent=t('saving')+'...';btn.disabled=true;btn.style.opacity='0.6';
  try{
    if(editId){
      const u=await api(`/api/members/${editId}`,{method:'PUT',body:JSON.stringify(data)});
      const i=members.findIndex(x=>x.id===editId);if(i>=0)members[i]=u;
      selId=editId;toast(t('toastSaved'),'success');
    } else {
      const c=await api('/api/members',{method:'POST',body:JSON.stringify(data)});
      members.push(c);
      
      // If adding ancestor, link child to new parent
      if(ancestorChildId){
        const child=members.find(x=>x.id===ancestorChildId);
        if(child){
          const updated=await api(`/api/members/${ancestorChildId}`,{method:'PUT',body:JSON.stringify({...child,parentId:c.id})});
          const idx=members.findIndex(x=>x.id===ancestorChildId);
          if(idx>=0)members[idx]=updated;
          toast(t('toastAdded',{name:c.name})+' '+t('linkedToChild',{child:child.name})||` & linked to ${child.name}`,'success');
        }
        ancestorChildId=null;
      } else {
        toast(t('toastAdded',{name:c.name}),'success');
      }
      
      selId=c.id;
    }
    setConn('ok',t('connOk',{count:members.length}));
    closeModal();updatePills();buildLegend();renderTree(true);renderSidebar(selId);
  }catch(e){toast(` ${e.message}`,'err');shakeElement('saveBtn');}
  finally{btn.textContent=editId?` ${t('saveChanges')}`:` ${t('saveMember')}`;btn.disabled=false;btn.style.opacity='1';}
}

async function deleteMember(id){
  if(!isAdminMode){toast(t('toastErrorDelete'),'err');return;}
  const m=members.find(x=>x.id===id);
  if(members.some(x=>x.parentId===id)){
    toast(t('toastErrorChildren',{name:m?.name||'This person'}),'err');return;
  }
  const ok=await confirm2(t('deleteTitle'),t('deleteMessage',{name:m?.name||'This person'}));
  if(!ok)return;
  try{
    await api(`/api/members/${id}`,{method:'DELETE'});
    members=members.filter(x=>x.id!==id);
    closeSidebar();updatePills();buildLegend();renderTree(true);
    setConn('ok',t('connOk',{count:members.length}));
    toast(t('toastDeleted'),'info');
  }catch(e){toast(` ${e.message}`,'err');}
}

/* ─── HELP/EXPORT/IMPORT ────────────────────────────────── */
function openHelp(){renderWelcomeModal();document.getElementById('helpOverlay').classList.add('show');}
function closeHelp(){document.getElementById('helpOverlay').classList.remove('show');}

function openExport(){
  renderExportModal();
  const m=members.length,mg=m?Math.max(...members.map(x=>x.gen)):0;
  const minG=m?Math.min(...members.map(x=>x.gen)):0;
  const f=members.filter(x=>x.gender==='Female').length,ml=members.filter(x=>x.gender==='Male').length;
  document.getElementById('exStats').innerHTML=
    `<div class="stat-box"><div class="num">${m}</div><div class="lbl">${t('totalMembers')}</div></div>`+
    `<div class="stat-box"><div class="num">${mg-minG+1}</div><div class="lbl">${t('generationsCount')}</div></div>`+
    `<div class="stat-box"><div class="num">${f}</div><div class="lbl">${t('female')}</div></div>`+
    `<div class="stat-box"><div class="num">${ml}</div><div class="lbl">${t('male')}</div></div>`;
  document.getElementById('exOverlay').classList.add('show');
}
function closeEx(){document.getElementById('exOverlay').classList.remove('show');}

function doExport(){
  const blob=new Blob([JSON.stringify({exportDate:new Date().toISOString(),version:5,members},null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);
  const d=new Date(),ds=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  a.download=`my-family-backup-${ds}.json`;a.click();URL.revokeObjectURL(a.href);
  toast(t('toastBackup',{count:members.length}),'success');
}

function openImport(){
  renderImportModal();
  document.getElementById('importOverlay').classList.add('show');
  document.getElementById('importFile').value='';
}
function closeImport(){document.getElementById('importOverlay').classList.remove('show');}

async function doImport(){
  const fileInput=document.getElementById('importFile');
  if(!fileInput.files||!fileInput.files[0]){toast(t('toastErrorFile'),'err');return;}
  
  const password=prompt(t('promptImportPassword'));
  if(!password)return;
  
  const btn=document.getElementById('importDoBtn');
  btn.textContent=t('importing');
  btn.disabled=true;
  
  try{
    const file=fileInput.files[0];
    const text=await file.text();
    const data=JSON.parse(text);
    
    if(!data.members||!Array.isArray(data.members)){
      throw new Error('Invalid backup file format');
    }
    
    const result=await api('/api/import',{
      method:'POST',
      body:JSON.stringify({members:data.members,password})
    });
    
    members=result.members;
    closeImport();
    setConn('ok',t('connOk',{count:members.length}));
    updatePills();
    buildLegend();
    renderTree();
    toast(t('toastImported',{count:members.length}),'success');
  }catch(e){
    if(e.message.includes('password')||e.message.includes('401')){
      toast(t('toastErrorImport'),'err');
    }else{
      toast(` ${e.message}`,'err');
    }
  }finally{
    btn.textContent=` ${t('importButton')}`;
    btn.disabled=false;
  }
}

/* ─── ENHANCED SEARCH ───────────────────────────────────── */
let searchResults = [];
let currentResultIndex = -1;
let searchDebounceTimer = null;

function performSearch(query) {
  const q = query.toLowerCase().trim();
  const searchInput = document.getElementById('searchInput');
  const clearBtn = document.getElementById('searchClear');
  const resultsDiv = document.getElementById('searchResults');
  const resultsCount = document.getElementById('resultsCount');
  const dropdown = document.getElementById('searchDropdown');
  
  // Clear state if empty query
  if (!q) {
    searchResults = [];
    currentResultIndex = -1;
    d3.selectAll('.node-g').classed('dim', false).classed('bright', false).classed('search-current', false);
    clearBtn.style.display = 'none';
    resultsDiv.style.display = 'none';
    dropdown.style.display = 'none';
    dropdown.innerHTML = '';
    return;
  }
  
  // Show clear button
  clearBtn.style.display = 'block';
  
  // Perform search across name, town, and notes
  const matches = members.filter(m => 
    m.name.toLowerCase().includes(q) || 
    m.town.toLowerCase().includes(q) || 
    (m.notes || '').toLowerCase().includes(q)
  );
  
  searchResults = matches.map(m => m.id);
  
  // Update UI based on results
  if (searchResults.length === 0) {
    // No results found
    resultsDiv.style.display = 'none';
    d3.selectAll('.node-g').classed('dim', true).classed('bright', false).classed('search-current', false);
    searchInput.style.borderColor = '#e57373';
    
    // Show empty dropdown
    dropdown.style.display = 'block';
    dropdown.innerHTML = '<div class="dropdown-empty">No matches found</div>';
  } else {
    // Results found
    searchInput.style.borderColor = '';
    resultsCount.textContent = `${searchResults.length} ${searchResults.length === 1 ? 'match' : 'matches'}`;
    resultsDiv.style.display = 'flex';
    
    // Populate dropdown with results
    dropdown.style.display = 'block';
    dropdown.innerHTML = matches.map((m, index) => {
      const genderIcon = m.gender === 'Female' ? '♀' : m.gender === 'Male' ? '♂' : '●';
      const town = m.town ? `📍 ${m.town}` : '';
      const gen = m.gen !== undefined ? `Gen ${m.gen}` : '';
      
      return `
        <div class="dropdown-item ${index === 0 ? 'active' : ''}" data-index="${index}" onclick="selectDropdownItem(${index})">
          <div class="dropdown-name">${genderIcon} ${m.name}</div>
          <div class="dropdown-meta">
            ${town ? `<span>${town}</span>` : ''}
            ${gen ? `<span>${gen}</span>` : ''}
          </div>
        </div>
      `;
    }).join('');
    
    // Highlight all matches
    const matchIds = new Set(searchResults);
    d3.selectAll('.node-g').each(function(d) {
      const isMatch = matchIds.has(d.data.id);
      d3.select(this).classed('bright', isMatch).classed('dim', !isMatch).classed('search-current', false);
    });
    
    // Auto-focus first result
    currentResultIndex = 0;
    highlightCurrentResult();
  }
  
  updateNavigationButtons();
}

function highlightCurrentResult() {
  if (currentResultIndex < 0 || currentResultIndex >= searchResults.length) return;
  
  const currentId = searchResults[currentResultIndex];
  
  // Update visual highlighting
  d3.selectAll('.node-g').classed('search-current', false);
  d3.selectAll('.node-g').each(function(d) {
    if (d.data.id === currentId) {
      d3.select(this).classed('search-current', true);
      
      // Center on this node with smooth animation
      const node = d3.select(this);
      const transform = node.attr('transform');
      const match = transform.match(/translate\(([^,]+),([^)]+)\)/);
      if (match && svgSel && zoomObj) {
        const x = parseFloat(match[1]);
        const y = parseFloat(match[2]);
        const cv = document.getElementById('canvas');
        const W = cv.clientWidth;
        const H = cv.clientHeight;
        const scale = currentTransform ? currentTransform.k : 1;
        
        // Smooth pan to center the node
        const newTransform = d3.zoomIdentity
          .translate(W/2 - x * scale, H/2 - y * scale)
          .scale(scale);
        
        svgSel.transition()
          .duration(400)
          .call(zoomObj.transform, newTransform);
      }
    }
  });
  
  // Update counter
  const resultsCount = document.getElementById('resultsCount');
  resultsCount.textContent = `${currentResultIndex + 1} of ${searchResults.length}`;
}

function navigateResults(direction) {
  if (searchResults.length === 0) return;
  
  currentResultIndex += direction;
  
  // Wrap around
  if (currentResultIndex < 0) currentResultIndex = searchResults.length - 1;
  if (currentResultIndex >= searchResults.length) currentResultIndex = 0;
  
  highlightCurrentResult();
  updateNavigationButtons();
}

function updateNavigationButtons() {
  const prevBtn = document.getElementById('prevResult');
  const nextBtn = document.getElementById('nextResult');
  
  if (searchResults.length <= 1) {
    prevBtn.disabled = true;
    nextBtn.disabled = true;
  } else {
    prevBtn.disabled = false;
    nextBtn.disabled = false;
  }
}

function selectDropdownItem(index) {
  if (index < 0 || index >= searchResults.length) return;
  
  currentResultIndex = index;
  
  // Update dropdown active state
  const dropdown = document.getElementById('searchDropdown');
  const items = dropdown.querySelectorAll('.dropdown-item');
  items.forEach((item, i) => {
    item.classList.toggle('active', i === index);
  });
  
  // Highlight and pan to result
  highlightCurrentResult();
  updateNavigationButtons();
  
  // Update counter
  const resultsCount = document.getElementById('resultsCount');
  resultsCount.textContent = `${currentResultIndex + 1} of ${searchResults.length}`;
}

function clearSearch() {
  const searchInput = document.getElementById('searchInput');
  searchInput.value = '';
  searchInput.focus();
  performSearch('');
}

// Initialize search on DOM load
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  const dropdown = document.getElementById('searchDropdown');
  
  // Debounced search on input
  searchInput.addEventListener('input', function() {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      performSearch(this.value);
    }, 250); // 250ms debounce for better performance
  });
  
  // Keyboard shortcuts
  searchInput.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (searchResults.length > 0) {
        const newIndex = (currentResultIndex + 1) % searchResults.length;
        selectDropdownItem(newIndex);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (searchResults.length > 0) {
        const newIndex = currentResultIndex - 1 < 0 ? searchResults.length - 1 : currentResultIndex - 1;
        selectDropdownItem(newIndex);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults.length > 0) {
        // Close dropdown and focus on selected result
        dropdown.style.display = 'none';
        highlightCurrentResult();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      clearSearch();
    }
  });
  
  // Global keyboard shortcut: Ctrl+K or Cmd+K to focus search
  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
    }
  });
  
  // Close dropdown when clicking outside
  document.addEventListener('click', function(e) {
    if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });
  
  // Reopen dropdown when focusing search input with existing results
  searchInput.addEventListener('focus', function() {
    if (searchResults.length > 0 && this.value.trim()) {
      dropdown.style.display = 'block';
    }
  });
});

/* ─── PILLS + LEGEND ────────────────────────────────────── */
function updatePills(){
  if(!members.length)return;
  const total=members.length,mg=Math.max(...members.map(m=>m.gen)),minG=Math.min(...members.map(m=>m.gen));
  const f=members.filter(m=>m.gender==='Female').length,ml=members.filter(m=>m.gender==='Male').length;
  document.getElementById('pills').innerHTML=
    `<div class="pill"><b>${total}</b> ${t('members')}</div>`+
    `<div class="pill"><b>${mg-minG+1}</b> ${t('generations')}</div>`+
    `<div class="pill">♀<b>${f}</b> ♂<b>${ml}</b></div>`;
}

function buildLegend(){
  if(!members.length)return;
  const gs=[...new Set(members.map(m=>m.gen))].sort((a,b)=>a-b);
  document.getElementById('legend').innerHTML=
    `<div class="legend-hdr">${t('legendTitle')}</div>`+
    gs.map(g=>{const gmv=gm(g);return`<div class="leg-row"><div class="leg-dot" style="background:${gmv.color}"></div><span>${gmv.label}</span></div>`;}).join('');
}

/* ─── CONFIRM DIALOG ────────────────────────────────────── */
let cfRes=null;
function confirm2(title,msg){
  document.getElementById('cfTitle').textContent=title;
  document.getElementById('cfMsg').textContent=msg;
  document.getElementById('cfOverlay').classList.add('show');
  return new Promise(r=>{cfRes=r;});
}
function cfResolve(v){document.getElementById('cfOverlay').classList.remove('show');if(cfRes){cfRes(v);cfRes=null;}}

/* ─── TOAST ─────────────────────────────────────────────── */
let tTimer;
function toast(msg,type='info'){
  const t=document.getElementById('toast');
  t.textContent=msg;
  t.className=`toast ${type} show`;
  // Gentle haptic feedback
  if(navigator.vibrate){
    if(type==='success')navigator.vibrate(20);
    else if(type==='err')navigator.vibrate([10,50,10]);
  }
  clearTimeout(tTimer);
  tTimer=setTimeout(()=>t.classList.remove('show'),3000);
}

/* ─── VISUAL FEEDBACK HELPERS ───────────────────────────── */
function shakeElement(id){
  const el=document.getElementById(id);
  if(!el)return;
  el.style.animation='none';
  setTimeout(()=>{
    el.style.animation='shake 0.4s ease-in-out';
    setTimeout(()=>el.style.animation='',400);
  },10);
}

function pulseElement(id){
  const el=document.getElementById(id);
  if(!el)return;
  el.style.animation='pulse 0.6s ease-in-out';
  setTimeout(()=>el.style.animation='',600);
}

/* ─── NAME CAPITALIZATION ────────────────────────────────── */
function capitalizeWords(str){
  return str.split(' ').map(word=>{
    if(!word)return word;
    // Handle special cases like "O'Brien", "McDonald"
    if(word.includes("'")){
      return word.split("'").map(part=>part.charAt(0).toUpperCase()+part.slice(1).toLowerCase()).join("'");
    }
    if(word.toLowerCase().startsWith('mc')){
      return 'Mc'+word.charAt(2).toUpperCase()+word.slice(3).toLowerCase();
    }
    if(word.toLowerCase().startsWith('mac')){
      return 'Mac'+word.charAt(3).toUpperCase()+word.slice(4).toLowerCase();
    }
    return word.charAt(0).toUpperCase()+word.slice(1).toLowerCase();
  }).join(' ');
}

function setupNameCapitalization(input){
  if(!input)return;
  
  // Remove existing listener if any
  input.removeEventListener('blur',handleNameCapitalization);
  
  // Capitalize on blur (when user leaves the field)
  input.addEventListener('blur',handleNameCapitalization);
  
  // Also capitalize on Enter key
  input.removeEventListener('keydown',handleNameEnter);
  input.addEventListener('keydown',handleNameEnter);
}

function handleNameCapitalization(e){
  const input=e.target;
  const value=input.value.trim();
  if(value){
    input.value=capitalizeWords(value);
  }
}

function handleNameEnter(e){
  if(e.key==='Enter'){
    const input=e.target;
    const value=input.value.trim();
    if(value){
      input.value=capitalizeWords(value);
    }
  }
}

/* ─── STATISTICS DASHBOARD ──────────────────────────────── */
async function openStatistics(){
  const overlay=document.getElementById('statsOverlay');
  const content=document.getElementById('statsContent');
  
  content.innerHTML=`
    <h2 style="margin:0 0 24px 0">📊 Family Statistics</h2>
    <div style="text-align:center;padding:40px;color:var(--ink3)">
      <div class="spinner"></div>
      <p style="margin-top:16px">Loading statistics...</p>
    </div>
  `;
  overlay.classList.add('active');
  
  try{
    const stats=await api('/api/statistics');
    
    content.innerHTML=`
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">
        <h2 style="margin:0">📊 Family Statistics</h2>
        <button class="btn btn-ghost" onclick="closeStats()">✕</button>
      </div>
      
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:16px;margin-bottom:24px">
        <div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px;text-align:center">
          <div style="font-size:32px;font-weight:700;color:var(--gold)">${stats.total_members||0}</div>
          <div style="font-size:12px;color:var(--ink3);margin-top:4px">Total Members</div>
        </div>
        <div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px;text-align:center">
          <div style="font-size:32px;font-weight:700;color:#27ae60">${stats.living_members||0}</div>
          <div style="font-size:12px;color:var(--ink3);margin-top:4px">Living</div>
        </div>
        <div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px;text-align:center">
          <div style="font-size:32px;font-weight:700;color:var(--purple)">${stats.female_count||0}</div>
          <div style="font-size:12px;color:var(--ink3);margin-top:4px">Female</div>
        </div>
        <div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:16px;text-align:center">
          <div style="font-size:32px;font-weight:700;color:var(--blue)">${stats.male_count||0}</div>
          <div style="font-size:12px;color:var(--ink3);margin-top:4px">Male</div>
        </div>
      </div>
      
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
        <div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:20px">
          <h4 style="margin:0 0 12px 0;font-size:14px;color:var(--ink2)">Generations</h4>
          <div style="font-size:11px;color:var(--ink3)">
            <div style="margin:8px 0"><strong>Total:</strong> ${(stats.max_generation||1)-(stats.min_generation||0)+1}</div>
            <div style="margin:8px 0"><strong>Range:</strong> Gen ${stats.min_generation||0} to ${stats.max_generation||1}</div>
          </div>
        </div>
        
        <div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:20px">
          <h4 style="margin:0 0 12px 0;font-size:14px;color:var(--ink2)">Locations</h4>
          <div style="font-size:11px;color:var(--ink3)">
            <div style="margin:8px 0"><strong>Unique Hometowns:</strong> ${stats.unique_hometowns||0}</div>
            ${stats.topHometowns&&stats.topHometowns.length>0?`<div style="margin-top:12px;max-height:100px;overflow-y:auto">
              ${stats.topHometowns.slice(0,5).map(h=>`<div style="margin:4px 0">${h.hometown} (${h.count})</div>`).join('')}
            </div>`:''}
          </div>
        </div>
      </div>
      
      ${stats.averageLifespan?`<div style="margin-top:20px;background:var(--card);border:1px solid var(--border);border-radius:12px;padding:20px;text-align:center">
        <div style="font-size:11px;color:var(--ink3);margin-bottom:8px">Average Lifespan (Deceased)</div>
        <div style="font-size:28px;font-weight:700;color:var(--green)">${Math.round(stats.averageLifespan)} years</div>
      </div>`:''}
      
      <div class="modal-foot" style="margin-top:24px">
        <button class="btn btn-ghost" onclick="closeStats()">Close</button>
      </div>
    `;
  }catch(e){
    content.innerHTML=`
      <h2>📊 Family Statistics</h2>
      <div style="padding:40px;text-align:center;color:var(--red)">
        <p>❌ Failed to load statistics</p>
        <p style="font-size:12px;color:var(--ink3)">${e.message}</p>
      </div>
      <div class="modal-foot">
        <button class="btn btn-ghost" onclick="closeStats()">Close</button>
      </div>
    `;
  }
}

function closeStats(){
  document.getElementById('statsOverlay').classList.remove('active');
}

/* ─── TIMELINE VIEW ─────────────────────────────────────── */
async function openTimeline(){
  const overlay=document.getElementById('timelineOverlay');
  const content=document.getElementById('timelineContent');
  
  content.innerHTML=`
    <h2 style="margin:0 0 24px 0">📅 Family Timeline</h2>
    <div style="text-align:center;padding:40px;color:var(--ink3)">
      <div class="spinner"></div>
      <p style="margin-top:16px">Loading timeline...</p>
    </div>
  `;
  overlay.classList.add('active');
  
  try{
    const events=await api('/api/timeline');
    
    if(!events||events.length===0){
      content.innerHTML=`
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">
          <h2 style="margin:0">📅 Family Timeline</h2>
          <button class="btn btn-ghost" onclick="closeTimeline()">✕</button>
        </div>
        <div style="padding:40px;text-align:center;color:var(--ink3)">
          <p>No timeline events found</p>
          <p style="font-size:12px">Add birth and death years to members to see them here</p>
        </div>
        <div class="modal-foot">
          <button class="btn btn-ghost" onclick="closeTimeline()">Close</button>
        </div>
      `;
      return;
    }
    
    content.innerHTML=`
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">
        <h2 style="margin:0">📅 Family Timeline</h2>
        <button class="btn btn-ghost" onclick="closeTimeline()">✕</button>
      </div>
      
      <div style="max-height:500px;overflow-y:auto;padding-right:8px">
        ${events.map(evt=>{
          const icon=evt.event_type==='birth'?'🎂':evt.event_type==='death'?'🕊️':'📌';
          const color=evt.event_type==='birth'?'var(--green)':evt.event_type==='death'?'var(--ink3)':'var(--blue)';
          return`
            <div style="display:flex;gap:16px;margin-bottom:16px;padding:12px;background:var(--card);border:1px solid var(--border);border-radius:8px;cursor:pointer;transition:all 0.2s" 
                 onclick="selectNode(${evt.id});closeTimeline()"
                 onmouseover="this.style.borderColor='${color}'"
                 onmouseout="this.style.borderColor='var(--border)'">
              <div style="flex-shrink:0;width:60px;text-align:center;padding-top:4px">
                <div style="font-size:18px;font-weight:700;color:${color}">${evt.year||'?'}</div>
                <div style="font-size:20px;margin-top:4px">${icon}</div>
              </div>
              <div style="flex:1">
                <div style="font-weight:600;color:var(--ink);margin-bottom:4px">${evt.title||evt.name}</div>
                ${evt.name?`<div style="font-size:12px;color:var(--ink3)">${evt.name}</div>`:''}
                ${evt.location?`<div style="font-size:11px;color:var(--ink3);margin-top:4px">📍 ${evt.location}</div>`:''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
      
      <div class="modal-foot" style="margin-top:20px">
        <button class="btn btn-ghost" onclick="closeTimeline()">Close</button>
      </div>
    `;
  }catch(e){
    content.innerHTML=`
      <h2>📅 Family Timeline</h2>
      <div style="padding:40px;text-align:center;color:var(--red)">
        <p>❌ Failed to load timeline</p>
        <p style="font-size:12px;color:var(--ink3)">${e.message}</p>
      </div>
      <div class="modal-foot">
        <button class="btn btn-ghost" onclick="closeTimeline()">Close</button>
      </div>
    `;
  }
}

function closeTimeline(){
  document.getElementById('timelineOverlay').classList.remove('active');
}

/* ─── PRINT DIALOG ──────────────────────────────────────── */
function openPrintDialog(){
  const overlay=document.getElementById('printOverlay');
  const content=document.getElementById('printContent');
  
  content.innerHTML=`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">
      <h2 style="margin:0">🖨️ Print Family Tree</h2>
      <button class="btn btn-ghost" onclick="closePrint()">✕</button>
    </div>
    
    <div style="margin-bottom:20px">
      <label style="display:block;font-size:13px;font-weight:600;margin-bottom:8px;color:var(--ink2)">
        Orientation
      </label>
      <select id="printOrientation" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--card);color:var(--ink);font-size:13px">
        <option value="landscape">Landscape (recommended)</option>
        <option value="portrait">Portrait</option>
      </select>
    </div>
    
    <div style="margin-bottom:20px">
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
        <input type="checkbox" id="printCompact" style="width:16px;height:16px">
        <span style="font-size:13px;color:var(--ink2)">Compact view (smaller nodes)</span>
      </label>
    </div>
    
    <div style="padding:12px;background:var(--bg);border:1px solid var(--border);border-radius:8px;margin-bottom:20px">
      <p style="margin:0;font-size:11px;color:var(--ink3);line-height:1.6">
        💡 <strong>Tip:</strong> For best results, set your printer to landscape orientation 
        and adjust margins to minimum. You can also save as PDF from the print dialog.
      </p>
    </div>
    
    <div class="modal-foot">
      <button class="btn btn-ghost" onclick="closePrint()">Cancel</button>
      <button class="btn btn-blue" onclick="printTree()">🖨️ Print</button>
    </div>
  `;
  
  overlay.classList.add('active');
}

function closePrint(){
  document.getElementById('printOverlay').classList.remove('active');
}

function printTree(){
  const orientation=document.getElementById('printOrientation').value;
  const compact=document.getElementById('printCompact').checked;
  
  closePrint();
  
  document.body.classList.add('printing');
  if(compact)document.body.classList.add('print-compact');
  
  const style=document.createElement('style');
  style.id='printStyle';
  style.textContent=`
    @media print {
      @page { size: ${orientation}; margin: 0.5cm; }
      body { background: white !important; }
      .hdr, .sidebar, .hint-bar, .legend, .ctrl-cluster { display: none !important; }
      .canvas { height: auto !important; }
      svg { width: 100% !important; height: auto !important; }
    }
  `;
  document.head.appendChild(style);
  
  setTimeout(()=>{
    window.print();
    setTimeout(()=>{
      document.body.classList.remove('printing','print-compact');
      const s=document.getElementById('printStyle');
      if(s)s.remove();
    },500);
  },300);
}

/* ─── PHOTO UPLOAD ─────────────────────────────────────────*/
let currentPhotoMemberId=null;

function openPhotoUpload(memberId){
  currentPhotoMemberId=memberId;
  const member=members.find(m=>m.id===memberId);
  const overlay=document.getElementById('photoOverlay');
  const content=document.getElementById('photoContent');
  
  content.innerHTML=`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px">
      <h2 style="margin:0">📸 Upload Photo for ${member?.name||'Member'}</h2>
      <button class="btn btn-ghost" onclick="closePhotoUpload()">✕</button>
    </div>
    
    <div style="margin-bottom:20px">
      <label style="display:block;font-size:13px;font-weight:600;margin-bottom:8px;color:var(--ink2)">
        Select Photo
      </label>
      <input type="file" id="photoFileInput" accept="image/*" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--card);color:var(--ink);font-size:13px">
      <div id="photoPreview" style="margin-top:12px;display:none">
        <img id="photoPreviewImg" style="width:100%;max-height:300px;object-fit:contain;border-radius:8px;border:1px solid var(--border)">
      </div>
    </div>
    
    <div style="margin-bottom:20px">
      <label style="display:block;font-size:13px;font-weight:600;margin-bottom:8px;color:var(--ink2)">
        Caption (optional)
      </label>
      <input type="text" id="photoCaption" placeholder="E.g., At graduation, Family reunion..." style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--card);color:var(--ink);font-size:13px">
    </div>
    
    <div style="margin-bottom:20px">
      <label style="display:block;font-size:13px;font-weight:600;margin-bottom:8px;color:var(--ink2)">
        Year (optional)
      </label>
      <input type="text" id="photoYear" placeholder="E.g., 1998, 2020" style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;background:var(--card);color:var(--ink);font-size:13px">
    </div>
    
    <div style="margin-bottom:20px">
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
        <input type="checkbox" id="photoIsProfile" checked style="width:16px;height:16px">
        <span style="font-size:13px;color:var(--ink2)">Set as profile photo (displays in sidebar and on tree)</span>
      </label>
    </div>
    
    <div class="modal-foot">
      <button class="btn btn-ghost" onclick="closePhotoUpload()">Cancel</button>
      <button class="btn btn-teal" onclick="uploadPhoto()" id="uploadPhotoBtn">📸 Upload Photo</button>
    </div>
  `;
  
  overlay.classList.add('active');
  
  setTimeout(()=>{
    const fileInput=document.getElementById('photoFileInput');
    fileInput.addEventListener('change',(e)=>{
      const file=e.target.files[0];
      if(file){
        const reader=new FileReader();
        reader.onload=(e)=>{
          document.getElementById('photoPreview').style.display='block';
          document.getElementById('photoPreviewImg').src=e.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  },100);
}

function closePhotoUpload(){
  document.getElementById('photoOverlay').classList.remove('active');
  currentPhotoMemberId=null;
}

async function uploadPhoto(){
  const fileInput=document.getElementById('photoFileInput');
  const caption=document.getElementById('photoCaption').value.trim();
  const year=document.getElementById('photoYear').value.trim();
  const isProfile=document.getElementById('photoIsProfile').checked;
  const btn=document.getElementById('uploadPhotoBtn');
  
  if(!fileInput.files||!fileInput.files[0]){
    toast('Please select a photo','err');
    return;
  }
  
  const file=fileInput.files[0];
  if(file.size>5*1024*1024){
    toast('Photo must be less than 5MB','err');
    return;
  }
  
  btn.disabled=true;
  btn.textContent='Uploading...';
  
  try{
    const formData=new FormData();
    formData.append('photo',file);
    formData.append('memberId',currentPhotoMemberId);
    formData.append('caption',caption);
    formData.append('year',year);
    formData.append('isProfile',isProfile);
    formData.append('uploadedBy','User');
    
    const response=await fetch('/api/photos/upload',{
      method:'POST',
      body:formData
    });
    
    if(!response.ok){
      const error=await response.json();
      throw new Error(error.error||'Upload failed');
    }
    
    const result=await response.json();
    
    if(isProfile){
      const member=members.find(m=>m.id===currentPhotoMemberId);
      if(member){
        member.photoUrl=result.filePath;
      }
    }
    
    toast('✅ Photo uploaded successfully!','success');
    closePhotoUpload();
    renderSidebar(currentPhotoMemberId);
    renderTree(true);
    
  }catch(e){
    toast(`❌ ${e.message}`,'err');
  }finally{
    btn.disabled=false;
    btn.textContent='📸 Upload Photo';
  }
}

async function removePhoto(memberId){
  const member=members.find(m=>m.id===memberId);
  if(!member||!member.photoUrl){
    toast('No photo to remove','err');
    return;
  }
  
  const ok=await confirm2('Remove Photo',`Remove profile photo for ${member.name}?`);
  if(!ok)return;
  
  try{
    const updatedMember={
      name:member.name,
      gender:member.gender,
      gen:member.gen,
      parentId:member.parentId,
      birth:member.birth,
      death:member.death,
      town:member.town,
      notes:member.notes,
      by:member.by,
      photoUrl:null
    };
    
    await api(`/api/members/${memberId}`,{
      method:'PUT',
      body:updatedMember
    });
    
    member.photoUrl=null;
    toast('✅ Photo removed','success');
    renderSidebar(memberId);
    renderTree(true);
    
  }catch(e){
    toast(`❌ ${e.message}`,'err');
  }
}

/* ─── CHANGE REQUESTS ───────────────────────────────────── */
async function loadChangeRequests(silent=false){
  try{
    changeRequests=await api('/api/change-requests');
    if(!silent)updateRequestsBadge();
  }catch(e){}
}

function updateRequestsBadge(){
  const pending=changeRequests.filter(r=>r.status==='pending').length;
  const badge=document.getElementById('requestsBadge');
  const badgeMobile=document.getElementById('requestsBadgeMobile');
  const btn=document.getElementById('requestsBtn');
  if(pending>0){
    badge.textContent=pending;
    badge.style.display='block';
    if(badgeMobile){
      badgeMobile.textContent=pending;
      badgeMobile.style.display='block';
    }
    btn.classList.add('has-badge');
  }else{
    badge.style.display='none';
    if(badgeMobile)badgeMobile.style.display='none';
    btn.classList.remove('has-badge');
  }
}

async function requestChange(id){
  const m=members.find(x=>x.id===id);
  if(!m)return;
  const issue=prompt(t('promptChangeRequest',{name:m.name}));
  if(!issue||!issue.trim())return;
  const requester=prompt(t('promptRequesterName'));
  if(!requester||!requester.trim())return;
  
  try{
    await api('/api/change-requests',{
      method:'POST',
      body:JSON.stringify({
        memberId:m.id,
        memberName:m.name,
        issue:issue.trim(),
        requestedBy:requester.trim()
      })
    });
    toast(t('toastChangeSubmitted'),'success');
    await loadChangeRequests();
  }catch(e){
    toast(`⚠ ${e.message}`,'err');
  }
}

function openChangeRequests(){
  renderChangeRequestsModal();
  const list=document.getElementById('requestsList');
  const pending=changeRequests.filter(r=>r.status==='pending');
  const resolved=changeRequests.filter(r=>r.status!=='pending');
  
  if(changeRequests.length===0){
    list.innerHTML=`<div style="text-align:center;padding:40px 20px;color:var(--ink3)">
      <div style="font-size:40px;margin-bottom:10px">📋</div>
      <div style="font-size:13px;margin-bottom:5px;color:var(--ink2)">${t('noRequests')}</div>
      <div style="font-size:11px;line-height:1.5">${t('noRequestsDesc')}</div>
    </div>`;
  } else {
    let html='';
    if(pending.length){
      html+=`<h4 style="font-size:11px;color:var(--gold);margin:14px 0 8px;font-family:'DM Mono',monospace">${t('pendingRequests',{count:pending.length})}</h4>`;
      pending.forEach(r=>{
        html+=`<div style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:12px;margin-bottom:8px">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px">
            <strong style="font-size:12px;color:var(--ink)">${r.memberName}</strong>
            <button class="btn btn-ghost btn-sm" onclick="viewMemberFromRequest(${r.memberId})">${t('viewMember')}</button>
          </div>
          <div style="font-size:11px;color:var(--ink2);margin-bottom:8px;line-height:1.5">${r.issue}</div>
          <div style="font-size:10px;color:var(--ink3);margin-bottom:8px">${t('requestedBy')}: ${r.requestedBy} · ${new Date(r.createdAt).toLocaleDateString()}</div>
          <div style="display:flex;gap:6px">
            <button class="btn btn-green btn-sm" onclick="resolveRequest(${r.id},'resolved')">✓ ${t('markResolved')}</button>
            <button class="btn btn-ghost btn-sm" onclick="resolveRequest(${r.id},'dismissed')">✕ ${t('dismiss')}</button>
          </div>
        </div>`;
      });
    }
    if(resolved.length){
      html+=`<h4 style="font-size:11px;color:var(--ink3);margin:18px 0 8px;font-family:'DM Mono',monospace">${t('resolvedDismissed',{count:resolved.length})}</h4>`;
      resolved.forEach(r=>{
        html+=`<div style="background:var(--card);border:1px solid var(--border);border-radius:8px;padding:12px;margin-bottom:8px;opacity:.6">
          <div style="display:flex;justify-content:space-between;margin-bottom:6px">
            <strong style="font-size:12px;color:var(--ink)">${r.memberName}</strong>
            <span style="font-size:9px;padding:2px 6px;background:var(--border);border-radius:4px;color:var(--ink3)">${r.status==='resolved'?t('resolved'):t('dismissed')}</span>
          </div>
          <div style="font-size:11px;color:var(--ink3)">${r.issue}</div>
        </div>`;
      });
    }
    list.innerHTML=html;
  }
  document.getElementById('requestsOverlay').classList.add('show');
}

function closeRequests(){document.getElementById('requestsOverlay').classList.remove('show');}

function viewMemberFromRequest(id){
  closeRequests();
  selectNode(id);
}

async function resolveRequest(reqId,status){
  try{
    await api(`/api/change-requests/${reqId}`,{
      method:'PUT',
      body:JSON.stringify({status,resolvedBy:'Admin'})
    });
    toast(status==='resolved'?t('toastRequestResolved'):t('toastRequestDismissed'),'info');
    await loadChangeRequests();
    openChangeRequests();
  }catch(e){
    toast(`⚠ ${e.message}`,'err');
  }
}

/* ─── ADMIN MODE ────────────────────────────────────────── */
async function toggleAdminMode(){
  const btn=document.getElementById('adminBtn');
  if(isAdminMode){
    isAdminMode=false;
    btn.textContent='🔒';
    btn.title=t('adminMode');
    btn.style.background='';
    btn.style.color='';
    btn.style.transform='rotate(0deg)';
    toast(t('toastAdminLocked'),'info');
    if(selId)renderSidebar(selId);
  } else {
    const pw=prompt(t('promptAdminPassword'));
    if(!pw)return;
    
    // Visual loading state
    btn.style.opacity='0.5';
    btn.style.transform='scale(0.9)';
    
    try{
      const result=await api('/api/auth/verify',{method:'POST',body:JSON.stringify({password:pw})});
      if(result.valid){
        isAdminMode=true;
        btn.textContent='🔓';
        btn.title='Click to lock admin mode';
        btn.style.background='var(--gold)';
        btn.style.color='#0f0a03';
        btn.style.opacity='1';
        btn.style.transform='rotate(360deg) scale(1)';
        btn.style.transition='all 0.4s ease-out';
        toast(t('toastAdminUnlocked'),'success');
        if(selId)renderSidebar(selId);
      }else{
        btn.style.opacity='1';
        btn.style.transform='scale(1)';
        shakeElement('adminBtn');
        toast(t('toastErrorPassword'),'err');
      }
    }catch(e){
      btn.style.opacity='1';
      btn.style.transform='scale(1)';
      shakeElement('adminBtn');
      toast(t('toastErrorPassword'),'err');
    }
  }
}

/* ─── LANGUAGE TOGGLE ───────────────────────────────────── */
function toggleLanguage(){
  const btn=document.getElementById('langBtn');
  const newLang=getLanguage()==='en'?'fr':'en';
  
  // Visual feedback
  btn.style.transform='scale(0.8) rotate(180deg)';
  setTimeout(()=>{
    setLanguage(newLang);
    updateUIText();
    btn.textContent=newLang==='fr'?'🇫🇷':'🌐';
    btn.title=newLang==='fr'?'Changer la langue':'Switch language';
    btn.style.transform='scale(1) rotate(0deg)';
    toast(newLang==='fr'?'🇫🇷 Langue changée en français':'🇬🇧 Language changed to English','info');
  },150);
}

/* ─── THEME TOGGLE ──────────────────────────────────────── */
function toggleTheme(){
  const html=document.documentElement;
  const btn=document.getElementById('themeBtn');
  const current=html.getAttribute('data-theme');
  
  // Smooth transition animation
  btn.style.transform='rotate(180deg) scale(0.8)';
  
  setTimeout(()=>{
    if(current==='light'){
      html.removeAttribute('data-theme');
      btn.textContent='☀';
      try{localStorage.setItem('myFamilyTheme','dark');}catch(e){}
    } else {
      html.setAttribute('data-theme','light');
      btn.textContent='🌙';
      try{localStorage.setItem('myFamilyTheme','light');}catch(e){}
    }
    btn.style.transform='rotate(360deg) scale(1)';
    setTimeout(()=>btn.style.transform='',200);
  },150);
}

function loadTheme(){
  try{
    const saved=localStorage.getItem('myFamilyTheme');
    if(saved==='light'){
      document.documentElement.setAttribute('data-theme','light');
      document.getElementById('themeBtn').textContent='🌙';
    }
  }catch(e){}
}

/* ─── MOBILE MENU ──────────────────────────────────────────*/
function toggleMobileMenu(){
  const menu=document.getElementById('mobileMenu');
  menu.classList.toggle('active');
}

/* ─── MATRILINEAL FILTER ────────────────────────────────── */
function toggleMatrilineal(){
  const btn=document.getElementById('matriBtn');
  matrilinealOnly=!matrilinealOnly;
  
  if(matrilinealOnly){
    btn.style.background='var(--gold)';
    btn.style.color='#0f0a03';
    btn.title='Showing matrilineal lineage only (click to show all)';
    toast('👩 Showing female lineage only','info');
  } else {
    btn.style.background='';
    btn.style.color='';
    btn.title='Show matrilineal lineage only';
    toast('👥 Showing all members','info');
  }
  
  renderTree(true);
}

/* ─── MOBILE SWIPE ──────────────────────────────────────── */
let ty0=0;
document.addEventListener('DOMContentLoaded',()=>{
  document.getElementById('sidebar').addEventListener('touchstart',e=>{ty0=e.touches[0].clientY;},{passive:true});
  document.getElementById('sidebar').addEventListener('touchend',e=>{if(e.changedTouches[0].clientY-ty0>70)closeSidebar();},{passive:true});
});

/* ─── GLOBAL EVENTS ─────────────────────────────────────── */
document.addEventListener('DOMContentLoaded',()=>{
  ['overlay','exOverlay','helpOverlay','cfOverlay','requestsOverlay','importOverlay'].forEach(id=>{
    document.getElementById(id).addEventListener('click',function(e){
      if(e.target===this){
        if(id==='overlay')closeModal();
        else if(id==='exOverlay')closeEx();
        else if(id==='helpOverlay')closeHelp();
        else if(id==='cfOverlay')cfResolve(false);
        else if(id==='requestsOverlay')closeRequests();
        else if(id==='importOverlay')closeImport();
      }
    });
  });

  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){closeModal();closeEx();closeHelp();closeSidebar();closeRequests();closeImport();closeStats();closeTimeline();closePrint();closePhotoUpload();}
    if((e.key==='f'||e.key==='F')&&(e.ctrlKey||e.metaKey)){e.preventDefault();document.getElementById('searchInput').focus();}
    if(e.key==='?'){openHelp();}
  });

  let rt;
  window.addEventListener('resize',()=>{
    clearTimeout(rt);
    rt=setTimeout(()=>{updateHintBar();renderTree(true);},150);
  });

  window.addEventListener('focus',()=>{loadMembers(true);loadChangeRequests(true);});
});

/* ─── START ─────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded',()=>{
  loadLanguage();
  loadTheme();
  init();
  updateUIText();
});
