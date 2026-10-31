const STORAGE_KEY='tactical-xi-career-v01';
const $=(selector,root=document)=>root.querySelector(selector);
const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];
const escapeHtml=(v)=>String(v).replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[s]));
function defaultState(){return {version:1,activeSlot:0,tactics:[createTactic('기본 전술'),createTactic('대안 전술'),createTactic('마무리 전술')],career:{club:0,season:1,fixtureIndex:1,played:0,wins:0,draws:0,losses:0,points:0,gf:0,ga:0,board:69,rep:22,history:[],fired:false},match:null,notes:{}};}
let state;
try{state=JSON.parse(localStorage.getItem(STORAGE_KEY))||defaultState();if(!state.tactics?.[0]?.team||!state.career)state=defaultState();}catch(e){state=defaultState();}
state.tactics.forEach(normalizeTacticRoles);
const ui={page:'tactics',shape:'in',tab:'player',player:7,opponent:10,expandedGroup:'공 소유 · 드리블'};
function tactic(){return state.tactics[state.activeSlot];}
function save(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch(e){}const s=$('#saveLabel');if(s)s.textContent='● 자동 저장';if(ui?.page==='tactics'&&state.match&&!state.match.finished)renderMatchDiagnosis();}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('visible');clearTimeout(toast.timeout);toast.timeout=setTimeout(()=>t.classList.remove('visible'),2600);}
function setPage(page){ui.page=page;$$('.nav').forEach(b=>b.classList.toggle('active',b.dataset.page===page));$$('.page').forEach(p=>p.classList.toggle('active',p.id==='page-'+page));if(page==='match')renderMatch();if(page==='career')renderCareer();if(page==='tactics'){renderTactics();}window.scrollTo({top:0,behavior:'instant'});}
function renderTactics(){
 $$('.slot').forEach(b=>{b.classList.toggle('active',Number(b.dataset.slot)===state.activeSlot);$('span',b).textContent=tacticSlotName(Number(b.dataset.slot));});
 $$('.shape-switch button').forEach(b=>b.classList.toggle('active',b.dataset.shape===ui.shape));
 $$('.tabbar button').forEach(b=>b.classList.toggle('active',b.dataset.tab===ui.tab));
 const t=tactic(), select=$('#formationInput');
 select.innerHTML=Object.keys(FORMATIONS).map(f=>`<option value="${f}">${f}</option>`).join('');
 select.value=ui.shape==='in'?t.inFormation:t.outFormation;
 $('#liveIndicator').textContent=state.match&&!state.match.finished?`● ${state.match.minute}' 경기 중 전술 편집`:'● 경기 전';
 renderPitch();renderInstructions();renderPreview();
}
function tacticSlotName(i){return state.tactics[i]?.name||`전술 ${i+1}`;}
function shapeKey(){return ui.shape==='in'?'inPositions':'outPositions';}
function renderPitch(){
 const svg=$('#pitch'), g=$('#playerMarkers');g.innerHTML='';
 const t=tactic(),pos=t[shapeKey()];
 pos.forEach((p,i)=>{
  const node=document.createElementNS('http://www.w3.org/2000/svg','g');node.classList.add('player','position-'+positionAt(p,i).group.toLowerCase());node.dataset.player=i;
  if(i===ui.player)node.classList.add('selected');
  const pointX=14+p[0]*3.12,pointY=14+p[1]*4.72;
  node.setAttribute('transform',`translate(${pointX},${pointY})`);
  const meta=positionAt(p,i);let role=ui.shape==='in'?t.players[i].attackRole:t.players[i].defendRole;
  const shortened=({ '볼 운반형 윙어':'볼 운반','인사이드 포워드':'인사이드 FW','전진형 플레이메이커':'전진 PM','딥라잉 플레이메이커':'딥라잉 PM','공격형 스위퍼 키퍼':'스위퍼 GK','수비형 미드필더':'수비형 MF','상대 센터백 마킹':'CB 마킹' })[role]||role;
  const palette={GK:'#dfbe80',CB:'#78b5ed',FB:'#78b5ed',WB:'#9abcf0',DM:'#9fb0ea',CM:'#a9a6ee',AM:'#edb984',WIDE:'#72e0ae',WM:'#72d7bc',ST:'#f0a283'};
  const fill=palette[meta.group];
  node.innerHTML=`<circle class="player-halo" r="20" fill="${fill}" fill-opacity="${i===ui.player?.32:.12}"/><circle class="marker-circle" r="15.5" fill="${i===ui.player?'#f2d39e':'#182b33'}" stroke="${fill}" stroke-width="${i===ui.player?3:2}"/><text class="marker-number" y="4" text-anchor="middle">${i+1}</text><rect class="marker-pill" x="-25" y="20" width="50" height="16" rx="5"/><text class="marker-pos" y="32" text-anchor="middle">${escapeHtml(meta.label)}</text><text class="marker-role" y="47" text-anchor="middle">${escapeHtml(shortened.length>10?shortened.slice(0,9)+'…':shortened)}</text>`;
  g.append(node);
  let moved=false,initial=null;
  node.addEventListener('pointerdown',e=>{e.preventDefault();moved=false;initial=[e.clientX,e.clientY];ui.player=i;g.querySelectorAll('.player').forEach((n)=>n.classList.toggle('selected',n===node));node.setPointerCapture(e.pointerId);});
  node.addEventListener('pointermove',e=>{
   if(!node.hasPointerCapture(e.pointerId)||!initial)return;
   if(Math.hypot(e.clientX-initial[0],e.clientY-initial[1])<3&&!moved)return;
   moved=true;
   const pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;
   const ctm=svg.getScreenCTM();if(!ctm)return;
   const pnt=pt.matrixTransform(ctm.inverse());
   let x=clamp((pnt.x-14)/3.12,4,96),y=clamp((pnt.y-14)/4.72,4,96);
   if(i===0){x=clamp(x,32,68);y=clamp(y,87,96);}
   else y=clamp(y,5,79);
   t[shapeKey()][i]=[Number(x.toFixed(1)),Number(y.toFixed(1))];
   node.setAttribute('transform',`translate(${14+x*3.12},${14+y*4.72})`);
  });
  node.addEventListener('pointerup',e=>{
   if(node.hasPointerCapture(e.pointerId))node.releasePointerCapture(e.pointerId);
   if(moved){
    const changed=ensureRoleValidity(t,i,ui.shape);
    save();renderPreview();
    if(changed)toast('위치가 바뀌어 해당 포지션의 기본 역할로 자동 변경했습니다.');
   }
   renderPitch();if(ui.tab==='player')renderInstructions();
  });
  node.addEventListener('pointercancel',()=>{renderPitch();if(ui.tab==='player')renderInstructions();});
 });
}
function makeControl(def,value, onUpdate){
 const control=document.createElement('div');control.className='control';control.dataset.controlKey=def.key;
 const safeId='control-'+Math.random().toString(36).slice(2);
 const title=def.title||def.label;
 if(def.type==='select'){
  control.innerHTML=`<div class="control-head"><label for="${safeId}">${escapeHtml(title)}</label></div><select id="${safeId}">${def.options.map(o=>`<option value="${escapeHtml(o)}">${escapeHtml(o)}</option>`).join('')}</select>${def.desc?`<p>${escapeHtml(def.desc)}</p>`:''}`;
  const s=$('select',control);s.value=value;s.addEventListener('change',e=>onUpdate(e.target.value));
 }else{
  control.innerHTML=`<div class="control-head"><label for="${safeId}">${escapeHtml(title)}</label><output for="${safeId}">${value}</output></div><input id="${safeId}" type="range" min="0" max="100" step="5" value="${value}" aria-label="${escapeHtml(title)}"><div class="control-foot"><span>${def.left||'낮게'}</span><span>${def.right||'높게'}</span></div>${def.desc?`<p>${escapeHtml(def.desc)}</p>`:''}`;
  $('input',control).addEventListener('input',e=>{$('output',control).textContent=e.target.value;onUpdate(Number(e.target.value));});
 }
 return control;
}
function addGroupedControls(root, items, onUpdate){
 const groups=[...new Set(items.map(d=>d.group||'개별 지시'))];
 groups.forEach((group,i)=>{
  const details=document.createElement('details');details.className='control-group';details.open=i<2;
  details.innerHTML=`<summary>${escapeHtml(group)} <span class="micro">· ${items.filter(d=>(d.group||'개별 지시')===group).length}개 설정</span></summary><div class="group-content"></div>`;
  items.filter(d=>(d.group||'개별 지시')===group).forEach(d=>$('.group-content',details).append(makeControl(d,onUpdate('get',d.key),v=>onUpdate('set',d.key,v))));
  root.append(details);
 });
}
function rolePickerSection(root,t,player,shape){
 const inPossession=shape==='in';
 const pos=positionAt(t[inPossession?'inPositions':'outPositions'][player],player);
 const field=inPossession?'attackRole':'defendRole';
 const roles=roleOptions(pos,shape),current=t.players[player][field];
 const stage=document.createElement('div');stage.className='role-stage';
 stage.innerHTML=`<div class="role-stage-label">${inPossession?'IN POSSESSION · 공격 역할':'OUT OF POSSESSION · 수비 역할'}</div><div class="role-stage-main"><strong>${escapeHtml(pos.label)} <span>${escapeHtml(pos.name)}</span></strong><span class="role-stage-number">#${String(player+1).padStart(2,'0')}</span></div><div class="role-stage-foot">${inPossession?'볼을 가진 상황에서 수행할 역할을 선택하세요.':'공을 잃었을 때 수행할 수비 역할을 선택하세요.'}</div>`;
 root.append(stage);
 const title=document.createElement('div');title.className='role-section-heading';
 title.innerHTML=`<div><b>${inPossession?'공격 역할 · Duty':'수비 역할 · Duty'}</b><span>${roles.length}개 선택 가능 · 포지션 ${escapeHtml(pos.label)} 전용</span></div>`;root.append(title);
 const cards=document.createElement('div');cards.className='role-cards';
 roles.forEach((role,idx)=>{
  const btn=document.createElement('button');btn.className='role-card'+(role===current?' selected':'');
  btn.type='button';btn.setAttribute('aria-pressed',role===current?'true':'false');
  const explain=inPossession?roleDescription(pos,role):'공 미소유 상태에서 '+role+' 행동을 우선 수행';
  btn.innerHTML=`<span class="role-card-top"><b>${escapeHtml(role)}</b><span class="role-select-dot"></span></span><span class="role-card-desc">${escapeHtml(explain)}</span>`;
  btn.addEventListener('click',()=>{
   t.players[player][field]=role;
   Object.assign(t.players[player],inPossession?rolePreset(pos,role):DEFEND_PRESETS[role]||{});
   save();renderPitch();renderPreview();renderInstructions();updateMatchTacticsSummary();
   toast(`${pos.label} · ${role} 적용`);
  });
  cards.append(btn);
 });root.append(cards);
 const note=document.createElement('div');note.className='role-notice';
 note.innerHTML=`<b>역할 선택 = 기본 행동값 적용</b><span>아래 슬라이더로 볼 운반·안쪽 침투·슈팅 등 세부 행동을 별도로 덮어쓸 수 있습니다. 위치가 바뀌면 그 포지션에서 가능한 역할만 표시됩니다.</span>`;
 root.append(note);
}
function renderInstructions(){
 const root=$('#instructions');root.innerHTML='';const t=tactic();
 const message=(text)=>{const p=document.createElement('p');p.className='tip';p.textContent=text;root.append(p);};
 if(ui.tab==='team'){
  message('지시는 전술 엔진에 반영됩니다. 공 소유 및 수비 전술을 개별 조정하십시오.');
  addGroupedControls(root,DEFINITIONS,(op,key,v)=>{
   if(op==='get')return t.team[key];t.team[key]=v;save();renderPreview();updateMatchTacticsSummary();
  });
 }
 if(ui.tab==='player'){
  const picker=document.createElement('div');picker.className='player-picker enhanced-picker';
  for(let i=0;i<11;i++){
   const meta=positionAt(t[shapeKey()][i],i),b=document.createElement('button');
   b.innerHTML=`<strong>${i+1}</strong><small>${escapeHtml(meta.label)}</small>`;
   b.title=`${i+1}번 ${meta.name}`;
   b.classList.toggle('active',ui.player===i);
   b.onclick=()=>{ui.player=i;renderPitch();renderInstructions();};picker.append(b);
  }root.append(picker);
  rolePickerSection(root,t,ui.player,ui.shape);
  const dTitle=document.createElement('div');dTitle.className='role-section-heading role-detail-heading';
  dTitle.innerHTML=`<div><b>세부 행동 지시 · Fine tuning</b><span>개인별 수치를 원하는 대로 조절</span></div><button class="role-reset" type="button">역할 기본값 재적용</button>`;
  root.append(dTitle);
  $('.role-reset',dTitle).addEventListener('click',()=>{
   const shape=ui.shape,pos=positionAt(t[shapeKey()][ui.player],ui.player);
   const role=t.players[ui.player][shape==='in'?'attackRole':'defendRole'];
   Object.assign(t.players[ui.player],shape==='in'?rolePreset(pos,role):DEFEND_PRESETS[role]||{});
   save();renderInstructions();renderPreview();toast('역할 기본 세부 지시를 다시 적용했습니다.');
  });
  const items=PERSONAL_DEFS.filter(d=>ui.shape==='in'?!d.group.startsWith('공 미소유'):d.group.startsWith('공 미소유'));
  const groups=[...new Set(items.map(d=>d.group))];
  groups.forEach(group=>{
   const div=document.createElement('div');div.className='tuning-group';
   div.innerHTML=`<div class="tuning-title">${escapeHtml(group)}</div><div class="tuning-grid"></div>`;
   items.filter(d=>d.group===group).forEach(def=>$('.tuning-grid',div).append(makeControl(def,t.players[ui.player][def.key],v=>{
    t.players[ui.player][def.key]=v;save();renderPreview();
   })));
   root.append(div);
  });
 }
 if(ui.tab==='opponent'){
  message('특정 상대 포지션만 집중 마킹하거나 압박할 수 있습니다. 상대의 지시가 아니라 우리 선수들의 대응을 설정합니다.');
  const box=document.createElement('div');box.className='opponent-picker';
  OPP_TARGETS.forEach((target,i)=>{const b=document.createElement('button');b.textContent=target;b.classList.toggle('active',ui.opponent===i);b.onclick=()=>{ui.opponent=i;renderInstructions();};box.append(b);});root.append(box);
  const target=OPP_TARGETS[ui.opponent];
  [{key:'press',title:'상대 압박 빈도',type:'range',desc:'선택한 상대에게 압박 집중'}, {key:'tight',title:'밀착 마킹',type:'range',desc:'볼 받는 공간을 차단'}, {key:'tackle',title:'태클 적극성',type:'range',desc:'위험과 탈취 기회가 함께 증가'}, {key:'foot',title:'유도할 발',type:'select',options:['자동','왼발','오른발','약한 발'],desc:'공을 처리하도록 유도하는 방향'}].forEach(d=>root.append(makeControl(d,t.opp[target][d.key],v=>{t.opp[target][d.key]=v;save();renderPreview();})));
 }
 if(ui.tab==='setpiece'){
  message('코너킥, 프리킥, 스로인과 수비 시 세트피스 행동을 조정합니다.');
  SP_DEFS.forEach(d=>root.append(makeControl(d,t.setpieces[d.key],v=>{t.setpieces[d.key]=v;save();renderPreview();})));
 }
}
function renderPreview(){
 const enemy=state.match&&!state.match.finished?state.match.enemy:CLUBS[state.career.fixtureIndex%CLUBS.length];
 const data=calculatePreview(tactic(),enemy,state.match?.minute||20);
 $('#tacticalPreview').innerHTML=[['공격 지표',data.offense],['수비 지표',data.defense],['점유 예측',data.possession+'%'],['압박 지표',data.press],['뒷공간 위험',data.risk],['소모 지수',data.fatigue]].map(([k,v],i)=>`<div class="preview-item"><span>${k}</span><strong class="${i===4?'risk':''}">${v}</strong></div>`).join('');
}

function renderMatchDiagnosis(){
 const panel=$('#matchDiagnosis');if(!panel)return;
 const m=state.match;if(!m){panel.innerHTML='<p class="analyst-muted">경기를 시작하면 위험 요소가 나타납니다.</p>';return;}
 const profiles=getThreatProfiles(tactic(),m.enemy,m.minute);
 const incident=m.incidents?.[0],warning=m.latestWarning;
 const lead=incident||warning||null;
 const top=profiles[0];
 const opponentShift=(m.events||[]).find(e=>e.kind==='ai');
 const aiLine=opponentShift?`<div class="analyst-opponent-shift"><b>${opponentShift.minute}' 상대 감독 변화</b> ${safe(opponentShift.text)}</div>`:'';
 const history=(m.incidents||[]).length>1?`<div class="analyst-history"><strong>이번 경기 이전 실점</strong>${m.incidents.slice(1,5).map(i=>`<div><span>${i.minute}' · ${safe(i.category)}</span><b>${safe(i.title)}</b></div>`).join('')}</div>`:'';
 const safe=(v)=>escapeHtml(v);
 const rank=(score)=>score>=75?'높음':score>=55?'주의':'관찰';
 const btn=(d,label)=>`<button type="button" class="analyst-jump" data-group="${safe(d.group)}" data-focus="${safe(d.target)}">${safe(label)} <span>↗</span></button>`;
 let major='';
 if(lead){
  const incidentState=!!incident;
  const now=getThreatProfiles(tactic(),m.enemy,m.minute).find(x=>x.id===lead.id);
  const diff=now && now.severity!==lead.severity ? `<div class="analyst-comparison">당시 위험 지표 ${lead.severity} → 현재 설정 ${now.severity} <small>※ 상대 전술·경과 시간도 반영한 모형 값</small></div>`:'';
  major=`<div class="analyst-critical ${incidentState?'is-conceded':'is-warning'}"><div class="analyst-status"><span>${incidentState?'실점 경로 추정':'상대 공격 위험 경고'}</span><b>${lead.minute}' · ${safe(lead.category)}</b></div><h4>${safe(lead.title)}</h4><div class="analyst-evidence">${safe(lead.evidence)}${incidentState?` · 장면 xG ${Number(lead.quality).toFixed(2)}`:` · 최근 상대 xG ${Number(lead.recentXg||0).toFixed(2)}`}</div><p>${safe(lead.explanation)}</p><div class="analyst-recommend"><span>확인할 지시</span>${safe(lead.advice)}</div>${diff}<div class="analyst-actions">${btn(lead,'해당 설정 직접 수정')}<span>선택지 강요 없이 전술실에서 수치 변경</span></div></div>`;
 }
 const topTwo=profiles.slice(0,2).map(d=>`<div class="analyst-risk"><div class="analyst-risk-head"><span>${safe(d.category)} <b>${safe(d.title)}</b></span><strong class="${d.severity>=75?'high':d.severity>=55?'mid':'low'}">${rank(d.severity)} ${d.severity}</strong></div><div class="analyst-meter"><i style="width:${d.severity}%"></i></div><p>${safe(d.evidence)}</p>${btn(d,'지시 보기')}</div>`).join('');
 panel.innerHTML=`${major}${aiLine}<div class="analyst-subtitle"><strong>현재 예상 위험 경로</strong><small>전술·상대 성향을 계산한 예측, 확정 원인 아님</small></div><div class="analyst-risk-grid">${topTwo}</div>${history}`;
 panel.querySelectorAll('.analyst-jump').forEach(b=>b.addEventListener('click',()=>jumpToTeamControl(b.dataset.group,b.dataset.focus)));
}
function jumpToTeamControl(group,key){
 ui.tab='team';setPage('tactics');
 const target=$(`[data-control-key="${key}"]`,$('#instructions'));
 if(!target){toast('해당 설정을 찾지 못했습니다.');return;}
 const details=target.closest('details');if(details)details.open=true;
 target.classList.add('analysis-target');
 target.scrollIntoView({behavior:'smooth',block:'center'});
 const input=target.querySelector('input, select');if(input)input.focus({preventScroll:true});
 setTimeout(()=>target.classList.remove('analysis-target'),3000);
 toast(`${group} · ${target.querySelector('label')?.textContent||key} 직접 편집`);
}

function renderMatch(){
 if(!state.match&&!state.career.fired){state.match=newMatch(state);save();}
 const m=state.match,c=state.career;
 $('#homeName').textContent=CLUBS[c.club].name;$('#clubBadge').textContent=CLUBS[c.club].name;$('#seasonBadge').textContent='SEASON '+String(c.season).padStart(2,'0');
 $('#matchRound').textContent=`시즌 ${c.season} · 리그 ${c.played+1}라운드`;
 if(!m){$('#matchStatus').textContent='경질';return;}
 $('#matchStatus').textContent=m.finished?'경기 종료':m.minute===0?'킥오프 대기':m.pausedReason==='conceded'?'실점 · 분석 중':m.pausedReason==='warning'?'위험 경고 · 중단':'진행 중';
 $('#awayName').textContent=m.enemy.name;$('#matchTime').textContent=formatMinute(m.minute);
 $('#score').innerHTML=`${m.home} <small>:</small> ${m.away}`;
 $('#matchCaption').textContent=m.finished?'FULL TIME':m.minute===0?'KICK OFF':m.minute===45?'HALF TIME':'TACTICAL BATTLE';
 $('#advance5').hidden=m.finished||c.fired;$('#advance15').hidden=m.finished||c.fired;$('#finishMatch').hidden=!m.finished;
 $('#advance5').textContent=m.minute===0?'킥오프 / 5분 진행':'5분 진행';
 $('#matchHelp').textContent=c.fired?'구단이 감독을 경질했습니다. 새 커리어를 시작하십시오.':m.finished?'최종 결과를 확정하면 다음 라운드로 넘어갑니다.':m.pausedReason==='conceded'?'실점 직후 경기를 자동으로 멈췄습니다. 아래 분석에서 원인을 확인하고 지시를 직접 고치세요.':m.pausedReason==='warning'?'연속 위험 신호를 감지해 경기를 잠시 멈췄습니다. 전술 분석관을 확인하세요.':'전술은 언제든 수정할 수 있습니다. 실점 또는 강한 위험 신호에는 경기 진행이 자동으로 멈춥니다.';
 const sum=Math.max(1,m.passes+m.oppPasses),poss=Math.round(m.passes/sum*100);
 $('#matchStats').innerHTML=[['점유율',`${poss}%`,`${100-poss}%`,poss],['슈팅',m.shots,m.oppShots,Math.round((m.shots/Math.max(1,m.shots+m.oppShots))*100)],['유효슈팅',m.shotsOn,m.oppShotsOn,Math.round(m.shotsOn/Math.max(1,m.shotsOn+m.oppShotsOn)*100)],['xG',m.xg.toFixed(2),m.oppXg.toFixed(2),Math.round(m.xg/Math.max(.001,m.xg+m.oppXg)*100)]].map(([label,a,b,part])=>`<div><div class="stat-caption">${label}</div><div class="stat-row"><b>${a}</b><div class="stat-bar"><div class="stat-fill" style="width:${clamp(part,0,100)}%"></div></div><b>${b}</b></div></div>`).join('');
 renderMatchDiagnosis();
 $('#events').innerHTML=m.events.map(ev=>`<div class="event ${ev.kind}"><span class="event-minute">${formatMinute(ev.minute)}</span>${escapeHtml(ev.text)}</div>`).join('');
 $('#scout').innerHTML=[['상대 감독 성향',m.enemy.style],['공격 포메이션',m.enemy.formation],['공격 전개','직선 패스 성향 '+m.enemy.approach+'/100'],['압박 수준',m.enemy.press+'/100'],['공격 폭',m.enemy.width+'/100'],['기본 전력',m.enemy.strength+'/100']].map(([a,b])=>`<div class="scout-item"><span>${a}</span><b>${b}</b></div>`).join('');
 const matchKey=`${c.season}-${c.fixtureIndex}`;
 $('#notes').value=state.notes[matchKey]||'';updateMatchTacticsSummary();
}
function updateMatchTacticsSummary(){
 const el=$('#currentTactics');if(!el)return;
 const t=tactic();el.innerHTML=[['사용 중 슬롯',`${'ABC'[state.activeSlot]} · ${t.name}`],['공 소유',t.inFormation],['공 미소유',t.outFormation],['패스 길이',t.team.passing+'/100'],['압박',t.team.press+'/100'],['수비 라인',t.team.defLine+'/100']].map(([a,b])=>`<div class="scout-item"><span>${a}</span><b>${escapeHtml(b)}</b></div>`).join('');
}
function renderCareer(){
 const c=state.career;
 $('#clubBadge').textContent=CLUBS[c.club].name;$('#seasonBadge').textContent='SEASON '+String(c.season).padStart(2,'0');
 const metrics=[['승점',c.points],['전적',`${c.wins}승 ${c.draws}무 ${c.losses}패`],['득실',`${c.gf-c.ga>0?'+':''}${c.gf-c.ga}`],['이사회 신임도',c.board+' / 100'],['감독 명성',c.rep+' / 100'],['잔여 경기',11-c.played]];
 $('#careerOverview').innerHTML=`<div class="career-metrics">${metrics.map(([k,v])=>`<div class="career-metric"><span>${k}</span><strong>${v}</strong></div>`).join('')}</div><p class="user-manual">${c.fired?'경질 통보: 보드 신임도 악화로 감독직을 잃었습니다.':'구단 운영은 자동입니다. 영입·육성 없이 전술과 경기 결과만 평가합니다.'}</p><button class="subtle-btn" id="careerReset">${c.fired?'새 커리어 시작':'커리어 처음부터 시작'}</button>`;
 $('#careerHistory').innerHTML=c.history.length?c.history.map(r=>`<div class="career-result"><span>${escapeHtml(r.opponent)}</span><b>${r.home} : ${r.away}</b><span class="small-label">xG ${r.xg.toFixed(1)} – ${r.oppXg.toFixed(1)}</span></div>`).join(''):'<div class="empty">아직 경기 기록이 없습니다. 매치데이에서 경기를 진행하십시오.</div>';
 $('#careerReset').addEventListener('click',()=>{if(confirm('현재 커리어 기록과 전술을 모두 초기화할까요?')){state=defaultState();save();setPage('career');toast('새 커리어가 시작되었습니다.');}});
}
$$('.nav').forEach(b=>b.addEventListener('click',()=>setPage(b.dataset.page)));
$$('.shape-switch button').forEach(b=>b.addEventListener('click',()=>{ui.shape=b.dataset.shape;renderTactics();}));
$$('.tabbar button').forEach(b=>b.addEventListener('click',()=>{ui.tab=b.dataset.tab;renderInstructions();$$('.tabbar button').forEach(t=>t.classList.toggle('active',t.dataset.tab===ui.tab));}));
$$('.slot').forEach(b=>b.addEventListener('click',()=>{state.activeSlot=Number(b.dataset.slot);save();renderTactics();toast(`전술 ${'ABC'[state.activeSlot]} 적용`);}));
$('#formationInput').addEventListener('change',e=>{
 const t=tactic(),f=e.target.value;
 if(ui.shape==='in'){t.inFormation=f;t.inPositions=FORMATIONS[f].map(p=>[...p]);}
 else {t.outFormation=f;t.outPositions=FORMATIONS[f].map(p=>[...p]);}
 t.players.forEach((_,i)=>ensureRoleValidity(t,i,ui.shape));
 save();renderPitch();renderInstructions();renderPreview();toast(`${ui.shape==='in'?'공 소유':'공 미소유'} 포메이션 변경: ${f}`);
});
$('#renameTactic').addEventListener('click',()=>{const name=prompt('전술 이름을 입력하세요.',tactic().name);if(name!==null&&name.trim()){tactic().name=name.trim().slice(0,35);save();renderTactics();}});
$('#cloneTactic').addEventListener('click',()=>{const dest=(state.activeSlot+1)%3;const src=JSON.parse(JSON.stringify(tactic()));normalizeTacticRoles(src);src.name=tactic().name+' 복제';if(confirm(`현재 전술을 ${'ABC'[dest]} 슬롯에 복사할까요? 기존 설정은 덮어씁니다.`)){state.tactics[dest]=src;save();renderTactics();toast(`전술 ${'ABC'[dest]} 슬롯에 복사했습니다.`);}});
$('#resetTactic').addEventListener('click',()=>{if(confirm('현재 전술 슬롯을 초기 설정으로 되돌릴까요?')){state.tactics[state.activeSlot]=createTactic(tactic().name);save();renderTactics();}});
$('#advance5').addEventListener('click',()=>{stepMatch(state,5);save();renderMatch();});
$('#advance15').addEventListener('click',()=>{stepMatch(state,15);save();renderMatch();});
$('#pauseTactics').addEventListener('click',()=>setPage('tactics'));
$('#finishMatch').addEventListener('click',()=>{completeMatch(state);save();if(state.career.fired){toast('이사회가 감독을 경질했습니다.');state.match=null;save();setPage('career');return;}state.match=null;save();toast('경기 결과 반영 완료. 다음 라운드가 준비됐습니다.');setPage('career');});
$('#notes').addEventListener('input',e=>{const c=state.career;state.notes[`${c.season}-${c.fixtureIndex}`]=e.target.value;save();});
renderTactics();