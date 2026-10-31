const STORAGE_KEY='tactical-xi-career-v01';
const $=(selector,root=document)=>root.querySelector(selector);
const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];
const escapeHtml=(v)=>String(v).replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[s]));
function defaultState(){return {version:1,activeSlot:0,tactics:[createTactic('기본 전술'),createTactic('대안 전술'),createTactic('마무리 전술')],career:{club:0,season:1,fixtureIndex:1,played:0,wins:0,draws:0,losses:0,points:0,gf:0,ga:0,board:69,rep:22,history:[],fired:false},match:null,notes:{}};}
let state;
try{state=JSON.parse(localStorage.getItem(STORAGE_KEY))||defaultState();if(!state.tactics?.[0]?.team||!state.career)state=defaultState();}catch(e){state=defaultState();}
const ui={page:'tactics',shape:'in',tab:'team',player:5,opponent:10};
function tactic(){return state.tactics[state.activeSlot];}
function save(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}catch(e){}const s=$('#saveLabel');s.textContent='● 자동 저장';}
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
 const pos=tactic()[shapeKey()];
 pos.forEach((p,i)=>{
  const node=document.createElementNS('http://www.w3.org/2000/svg','g');node.classList.add('player');node.dataset.player=i;
  if(i===ui.player)node.classList.add('selected');
  node.setAttribute('transform',`translate(${14+p[0]*3.12},${14+p[1]*4.72})`);
  const circle=document.createElementNS('http://www.w3.org/2000/svg','circle');circle.setAttribute('r','15.5');circle.setAttribute('fill',i===ui.player?'#f3c77d':'#eaf7ee');circle.setAttribute('stroke','#0c3327');circle.setAttribute('stroke-width','2');circle.setAttribute('filter','url(#shadow)');
  const txt=document.createElementNS('http://www.w3.org/2000/svg','text');txt.setAttribute('fill','#14352b');txt.setAttribute('font-weight','900');txt.setAttribute('font-size','12');txt.setAttribute('text-anchor','middle');txt.setAttribute('y','4.5');txt.setAttribute('pointer-events','none');txt.textContent=i+1;
  node.append(circle,txt);g.append(node);
  let moved=false;
  node.addEventListener('pointerdown',e=>{e.preventDefault();moved=false;ui.player=i;g.querySelectorAll('circle').forEach((c,idx)=>c.setAttribute('fill',idx===i?'#f3c77d':'#eaf7ee'));node.setPointerCapture(e.pointerId);});
  node.addEventListener('pointermove',e=>{if(!node.hasPointerCapture(e.pointerId))return;moved=true;const pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const pnt=pt.matrixTransform(svg.getScreenCTM().inverse());const x=clamp((pnt.x-14)/3.12,3,97),y=clamp((pnt.y-14)/4.72,4,96);tactic()[shapeKey()][i]=[Number(x.toFixed(1)),Number(y.toFixed(1))];node.setAttribute('transform',`translate(${14+x*3.12},${14+y*4.72})`);});
  node.addEventListener('pointerup',e=>{if(node.hasPointerCapture(e.pointerId))node.releasePointerCapture(e.pointerId);if(moved){save();renderPreview();}if(ui.tab==='player')renderInstructions();});
 });
}
function makeControl(def,value, onUpdate){
 const control=document.createElement('div');control.className='control';
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
function renderInstructions(){
 const root=$('#instructions');root.innerHTML='';const t=tactic();
 const message=(text)=>{const p=document.createElement('p');p.className='tip';p.textContent=text;root.append(p);};
 if(ui.tab==='team'){
  message('항목을 직접 조정하십시오. 각 수치는 경기 엔진의 전술 계산에 반영됩니다. 상충하는 지시는 팀의 전술 조직력을 약화시킬 수 있습니다.');
  addGroupedControls(root,DEFINITIONS,(op,key,v)=>{
   if(op==='get')return t.team[key]; t.team[key]=v;save();renderPreview();updateMatchTacticsSummary();
  });
 }
 if(ui.tab==='player'){
  message('축구장 위의 선수를 터치하거나 아래 번호를 선택하십시오. 11명 모두 공 소유/미소유 역할과 세부 행동을 별도로 지시할 수 있습니다.');
  const picker=document.createElement('div');picker.className='player-picker';
  for(let i=0;i<11;i++){let b=document.createElement('button');b.textContent=`${i+1}번${i===0?' GK':''}`;b.classList.toggle('active',ui.player===i);b.onclick=()=>{ui.player=i;renderPitch();renderInstructions();};picker.append(b);}root.append(picker);
  const selected=document.createElement('div');selected.className='player-selected';selected.innerHTML=`<span>${ui.player+1}번 선수 · 공격 / 수비 역할 별도 편집</span><span>고정 선수단</span>`;root.append(selected);
  PERSONAL_DEFS.forEach(d=>root.append(makeControl(d,t.players[ui.player][d.key],v=>{t.players[ui.player][d.key]=v;save();renderPreview();})));
 }
 if(ui.tab==='opponent'){
  message('특정 상대 포지션만 집중 마킹하거나 압박할 수 있습니다. 상대에게 지시를 강제로 적용하는 기능이 아니라 우리 수비수의 행동을 변경합니다.');
  const box=document.createElement('div');box.className='opponent-picker';
  OPP_TARGETS.forEach((target,i)=>{const b=document.createElement('button');b.textContent=target;b.classList.toggle('active',ui.opponent===i);b.onclick=()=>{ui.opponent=i;renderInstructions();};box.append(b);});root.append(box);
  const target=OPP_TARGETS[ui.opponent];
  [{key:'press',title:'이 상대를 압박하는 빈도',type:'range',desc:'선택한 위치의 상대 선수에게 압박 집중'}, {key:'tight',title:'밀착 마킹',type:'range',desc:'선택한 상대의 볼 받는 공간을 차단'}, {key:'tackle',title:'상대에 대한 태클 적극성',type:'range',desc:'경고 위험과 탈취 기회 모두 증가'}, {key:'foot',title:'유도할 발',type:'select',options:['자동','왼발','오른발','약한 발'],desc:'상대가 공을 차는 방향 유도'}].forEach(d=>root.append(makeControl(d,t.opp[target][d.key],v=>{t.opp[target][d.key]=v;save();renderPreview();})));
 }
 if(ui.tab==='setpiece'){
  message('코너킥, 프리킥, 스로인과 수비 시 세트피스 행동을 조정할 수 있습니다.');
  SP_DEFS.forEach(d=>root.append(makeControl(d,t.setpieces[d.key],v=>{t.setpieces[d.key]=v;save();renderPreview();})));
 }
}
function renderPreview(){
 const enemy=state.match&&!state.match.finished?state.match.enemy:CLUBS[state.career.fixtureIndex%CLUBS.length];
 const data=calculatePreview(tactic(),enemy,state.match?.minute||20);
 $('#tacticalPreview').innerHTML=[['공격 지표',data.offense],['수비 지표',data.defense],['점유 예측',data.possession+'%'],['압박 지표',data.press],['뒷공간 위험',data.risk],['소모 지수',data.fatigue]].map(([k,v],i)=>`<div class="preview-item"><span>${k}</span><strong class="${i===4?'risk':''}">${v}</strong></div>`).join('');
}
function renderMatch(){
 if(!state.match&&!state.career.fired){state.match=newMatch(state);save();}
 const m=state.match,c=state.career;
 $('#homeName').textContent=CLUBS[c.club].name;$('#clubBadge').textContent=CLUBS[c.club].name;$('#seasonBadge').textContent='SEASON '+String(c.season).padStart(2,'0');
 $('#matchRound').textContent=`시즌 ${c.season} · 리그 ${c.played+1}라운드`;
 if(!m){$('#matchStatus').textContent='경질';return;}
 $('#matchStatus').textContent=m.finished?'경기 종료':m.minute===0?'킥오프 대기':'진행 중';
 $('#awayName').textContent=m.enemy.name;$('#matchTime').textContent=formatMinute(m.minute);
 $('#score').innerHTML=`${m.home} <small>:</small> ${m.away}`;
 $('#matchCaption').textContent=m.finished?'FULL TIME':m.minute===0?'KICK OFF':m.minute===45?'HALF TIME':'TACTICAL BATTLE';
 $('#advance5').hidden=m.finished||c.fired;$('#advance15').hidden=m.finished||c.fired;$('#finishMatch').hidden=!m.finished;
 $('#advance5').textContent=m.minute===0?'킥오프 / 5분 진행':'5분 진행';
 $('#matchHelp').textContent=c.fired?'구단이 감독을 경질했습니다. 새 커리어를 시작하십시오.':m.finished?'최종 결과를 확정하면 다음 라운드로 넘어갑니다.':'전술 수정 버튼을 누르면 시간이 멈춥니다. 전술실에서 직접 지시를 바꾸고 매치데이로 돌아와 진행하십시오.';
 const sum=Math.max(1,m.passes+m.oppPasses),poss=Math.round(m.passes/sum*100);
 $('#matchStats').innerHTML=[['점유율',`${poss}%`,`${100-poss}%`,poss],['슈팅',m.shots,m.oppShots,Math.round((m.shots/Math.max(1,m.shots+m.oppShots))*100)],['유효슈팅',m.shotsOn,m.oppShotsOn,Math.round(m.shotsOn/Math.max(1,m.shotsOn+m.oppShotsOn)*100)],['xG',m.xg.toFixed(2),m.oppXg.toFixed(2),Math.round(m.xg/Math.max(.001,m.xg+m.oppXg)*100)]].map(([label,a,b,part])=>`<div><div class="stat-caption">${label}</div><div class="stat-row"><b>${a}</b><div class="stat-bar"><div class="stat-fill" style="width:${clamp(part,0,100)}%"></div></div><b>${b}</b></div></div>`).join('');
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
 save();renderPitch();renderPreview();toast(`${ui.shape==='in'?'공 소유':'공 미소유'} 포메이션 변경: ${f}`);
});
$('#renameTactic').addEventListener('click',()=>{const name=prompt('전술 이름을 입력하세요.',tactic().name);if(name!==null&&name.trim()){tactic().name=name.trim().slice(0,35);save();renderTactics();}});
$('#cloneTactic').addEventListener('click',()=>{const dest=(state.activeSlot+1)%3;const src=JSON.parse(JSON.stringify(tactic()));src.name=tactic().name+' 복제';if(confirm(`현재 전술을 ${'ABC'[dest]} 슬롯에 복사할까요? 기존 설정은 덮어씁니다.`)){state.tactics[dest]=src;save();renderTactics();toast(`전술 ${'ABC'[dest]} 슬롯에 복사했습니다.`);}});
$('#resetTactic').addEventListener('click',()=>{if(confirm('현재 전술 슬롯을 초기 설정으로 되돌릴까요?')){state.tactics[state.activeSlot]=createTactic(tactic().name);save();renderTactics();}});
$('#advance5').addEventListener('click',()=>{stepMatch(state,5);save();renderMatch();});
$('#advance15').addEventListener('click',()=>{stepMatch(state,15);save();renderMatch();});
$('#pauseTactics').addEventListener('click',()=>setPage('tactics'));
$('#finishMatch').addEventListener('click',()=>{completeMatch(state);save();if(state.career.fired){toast('이사회가 감독을 경질했습니다.');state.match=null;save();setPage('career');return;}state.match=null;save();toast('경기 결과 반영 완료. 다음 라운드가 준비됐습니다.');setPage('career');});
$('#notes').addEventListener('input',e=>{const c=state.career;state.notes[`${c.season}-${c.fixtureIndex}`]=e.target.value;save();});
renderTactics();
