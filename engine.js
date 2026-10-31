// TACTICAL XI match model v0.1: explicit tactical parameters -> match probabilities.
// This is a lightweight strategic simulation, not a 22-player physical simulation.
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const avg=(arr)=>arr.reduce((a,b)=>a+b,0)/Math.max(1,arr.length);
const norm=(v)=>((Number(v)||0)-50)/50;
const rand=(a,b)=>a+Math.random()*(b-a);
function getTeamModel(tactic, strength, minute, opposing) {
 const t=tactic.team;
 const p=tactic.players;
 const fatigue = Math.max(0,(minute-28)/65)*((t.press*0.38+t.tempo*0.23+t.transitionSpeed*0.20+t.engageLine*0.19)/100);
 const rangeKeys=(group)=>DEFINITIONS.filter(d=>d.group===group&&d.type==='range').map(d=>norm(t[d.key]));
 const sumGroup=(g)=>avg(rangeKeys(g));
 const individual = avg(p.map(i=>avg([norm(i.run),norm(i.passRisk),norm(i.dribble),norm(i.press),norm(i.track)])));
 const roles = p.filter(i=>i.attackRole&&i.attackRole!=='기본 역할').length;
 const elastic = Math.abs(t.overlapLeft-t.underlapLeft)+Math.abs(t.overlapRight-t.underlapRight);
 const transition = t.won==='빠른 역습'?.14:t.won==='공격 형태 유지'?-.035:0;
 const counterpress=t.lost==='역압박'?.17:t.lost==='수비 재정비'?-.065:0;
 const widthBonus=Math.abs(t.width-(opposing?.width??50))>20?.05:0;
 let attack = 1 + norm(t.mentality)*.26 + norm(t.tempo)*.11 + norm(t.passSpace)*.09 + norm(t.through)*.08 + norm(t.boxRuns)*.10 + norm(t.workBox)*.06 + norm(t.crossFreq)*.04 + norm(t.dribble)*.05 + norm(t.shootEarly)*.04 + transition + sumGroup('전진·전개')*.045 + sumGroup('파이널 서드')*.04 + individual*.06 + roles*.004 + widthBonus - fatigue*.19;
 let defense=1+norm(t.press)*.13+norm(t.compact)*.10+norm(t.restDef)*.13+norm(t.secondBall)*.065+norm(t.stopCross)*.04+norm(t.dropAgainstRuns)*.07+counterpress*.55+sumGroup('수비')*.08 + norm(t.discipline)*.04 - norm(t.mentality)*.11 - fatigue*.30;
 let control=1 + norm(t.buildShort)*.10 - norm(t.passing)*.06 + norm(t.passFeet)*.06 + norm(t.creative)*.025 + norm(t.defWidth)*.03 + norm(t.switchPlay)*.035 + sumGroup('빌드업')*.05 - fatigue*.12;
 // 개인 지시, 상대별 지시, 세트피스 및 선택형 전술 지시의 영향도 계산한다.
 const personalMetric=key=>avg(p.map(i=>norm(i[key])));
 attack+=personalMetric('run')*.025+personalMetric('passRisk')*.018+personalMetric('dribble')*.017+personalMetric('shoot')*.018+personalMetric('cross')*.013+personalMetric('wide')*.010+personalMetric('roam')*.012;
 defense+=personalMetric('hold')*.022+personalMetric('press')*.024+personalMetric('tackle')*.015+personalMetric('mark')*.016+personalMetric('track')*.027;
 control+=personalMetric('passRisk')*.012+personalMetric('hold')*.012;
 // Role and duty profiles: actual location determines which player contributions matter.
 const wingerIndexes=tactic.inPositions.map((pos,i)=>positionAt(pos,i).group==='WIDE'?i:-1).filter(i=>i>=0);
 const wingers=wingerIndexes.map(i=>p[i]);
 const wingValue=(key)=>wingers.length?avg(wingers.map(i=>norm(i[key]))):0;
 const insideFinish=wingers.length?avg(wingers.map(i=>(i.cutInside+i.shoot+i.run)/300)):0;
 const wideSupply=wingers.length?avg(wingers.map(i=>(i.wide+i.cross+i.crossEarly)/300)):0;
 const carryBuild=wingers.length?avg(wingers.map(i=>(i.ballCarry+i.dribble)/200)):0;
 attack += (insideFinish-.5)*.108 + (wideSupply-.5)*.069 + (carryBuild-.5)*.070;
 control += (carryBuild-.5)*.045 + wingValue('passRisk')*.012;
 defense -= (insideFinish-.5)*.018; // attacking wide roles may leave recovery space
 const defensiveShapes=tactic.outPositions.map((pos,i)=>({index:i,group:positionAt(pos,i).group}));
 const defensiveWide=defensiveShapes.filter(item=>['WIDE','WM','WB','FB'].includes(item.group)).map(item=>p[item.index]);
 if(defensiveWide.length)defense+=avg(defensiveWide.map(i=>(norm(i.track)+norm(i.press)+norm(i.mark))/3))*.035;
 // Role fit is not a free multiplier: a role is useful only insofar as its instructions suit the position.
 const keeper=p[0];if(keeper.attackRole?.includes('스위퍼')&&t.defLine>70){defense+=.025;control+=.014;}
 if(wingers.length&&wingValue('wide')>.5&&t.width>66)control+=.015;
 if(wingers.length&&wingValue('cutInside')>.5&&t.overlapLeft+t.overlapRight>115)attack+=.026;

 const op=Object.values(tactic.opp);
 const targetDefense=avg(op.map(i=>(norm(i.press)*.24+norm(i.tight)*.31+norm(i.tackle)*.20+(i.foot==='약한 발'?.09:0))));
 defense+=targetDefense*.095;
 if(t.marking==='대인 마킹'){defense+=(opposing?.approach??50)>65?.018:-.02;}
 if(t.marking==='지역 방어')defense+=(opposing?.width??50)>70?.015:.01;
 if(t.force==='바깥으로') defense+=(opposing?.width??50)<55?.025:-.008;
 if(t.force==='중앙으로') defense+=(opposing?.width??50)>70?.01:-.015;
 if(t.force==='약한 발 방향') defense+=.012;
 if(t.playFocus==='중앙') attack+=(opposing?.width??50)>68?.045:-.007;
 if(t.playFocus==='양쪽 측면') attack+=(opposing?.width??50)<50?.040:.006;
 if(t.playFocus==='좌측'||t.playFocus==='우측')attack+=.009;
 if(t.gkTarget==='상황에 따라')control+=.012;
 if(t.gkTarget==='최전방')attack+=.016;
 if(t.gkMethod==='긴 킥')attack+=(opposing?.press??50)>70?.045:-.015;
 if(t.gkMethod==='짧은 패스')control+=(opposing?.press??50)<65?.025:-.015;
 if(t.gkMethod==='롤링 스로')control+=.015;
 if(t.crossType==='컷백 중심')attack+=t.workBox>60?.026:-.012;
 if(t.crossType==='얼리 크로스')attack+=t.passing>60?.019:.003;
 if(t.crossType==='높고 길게')attack+=.012;
 if(t.crossType==='낮고 빠르게')attack+=.012;
 if(t.won==='공격 형태 유지') control+=.05;
 if(t.lost==='수비 재정비') defense+=.055;
 const sp=tactic.setpieces;
 attack+=norm(sp.cornerCommit)*.015+norm(sp.cornerShort)*.006+norm(sp.longThrow)*.008;
 defense+=norm(sp.counterFromCorners)*.015-norm(sp.cornerCommit)*.013;
 const shifts=avg(tactic.inPositions.map((pos,i)=>Math.hypot(pos[0]-tactic.outPositions[i][0],pos[1]-tactic.outPositions[i][1])));
 if(shifts>37){attack-=.018;defense-=.026;}
 const pressure=clamp(t.press*.45+t.engageLine*.30+t.defLine*.25,0,100);
 let exposure=0;
 if(t.defLine>66 && (opposing?.approach??50)>65) exposure+=(t.defLine-66)/100*.52;
 if(t.defLine>72 && t.offside<40) exposure+=.08;
 if(t.mentality>78 && t.restDef<46) exposure+=.16;
 const conflicts = elastic>120?.035:0;
 const overcomplex=Math.max(0, (roles-6)*.02 + conflicts);
 return {attack:clamp(attack-overcomplex,.54,1.67),defense:clamp(defense-exposure-overcomplex,.52,1.6),control:clamp(control,.65,1.36),pressure,exposure, fatigue, strength};
}
function getOpponentModel(opp, minute, homeTeam) {
 const intensity=opp.press;
 const urgency=opp.approach;
 const attack = 1 + (opp.aggression||0)*.13 + (urgency-50)*.002 + (opp.width-50)*.0006 - Math.max(0,minute-55)/95 * (intensity/100)*.12;
 const defense = 1+(intensity-50)*.002 - (opp.aggression||0)*.05 + (opp.style==='수비형'?.13:0) - (opp.style==='압박형' && minute>70?.09:0);
 const control = 1 + (52-urgency)*.003 + (opp.style==='점유형'?.08:0);
 return {attack,defense,control,pressure:intensity, strength:opp.strength};
}
function formatMinute(m){return `${Math.min(m,90)}'`;}
function calculatePreview(tactic, enemy, minute=20){
 const me=getTeamModel(tactic, 65, minute, enemy);
 const them=getOpponentModel(enemy,minute);
 return {offense:Math.round(clamp(me.attack/them.defense*70,20,100)),defense:Math.round(clamp(me.defense/them.attack*70,20,100)),possession:Math.round(clamp(50+(me.control-them.control)*18+(me.strength-them.strength)*.17,30,70)),press:Math.round(me.pressure),risk:Math.round(clamp(20+me.exposure*105+Math.max(0,tactic.team.mentality-50)*.27,10,95)),fatigue:Math.round(me.fatigue*100)};
}
function newMatch(state) {
 const oppClub=CLUBS[state.career.fixtureIndex%CLUBS.length];
 const enemy={...oppClub,aggression:0,adapted:[],formation:oppClub.formation};
 return {minute:0,home:0,away:0,shots:0,oppShots:0,shotsOn:0,oppShotsOn:0,xg:0,oppXg:0,passes:0,oppPasses:0,events:[{minute:0,kind:'info',text:`${oppClub.name} 전술 분석: ${oppClub.style}, 기본 ${oppClub.formation}. 킥오프 준비 완료.`}],enemy,finished:false};
}
function logEvent(match,text,kind='info') {match.events.unshift({minute:match.minute,text,kind}); match.events=match.events.slice(0,48);}
function updateOpponent(match) {
 const opp=match.enemy;
 if (match.minute===22) {
  if(match.home>match.away || match.xg>match.oppXg+.3){opp.press=clamp(opp.press+14,20,94); opp.aggression+=.1;logEvent(match,`${opp.name} 감독: 압박 강도를 높이고 후방 빌드업을 방해하기 시작했습니다.`,'ai');}
  else{opp.width=clamp(opp.width+12,15,97); logEvent(match,`${opp.name} 감독: 측면에 더 많은 선수를 배치해 공격 폭을 넓혔습니다.`,'ai');}
 }
 if(match.minute===48){
  if(match.away<=match.home){opp.approach=clamp(opp.approach+16,15,96);opp.aggression+=.18;logEvent(match,`${opp.name} 감독: 수비수 한 명을 전진시키고 세로 패스 비중을 높였습니다.`,'ai');}
  else{opp.press=clamp(opp.press-12,10,95);opp.aggression-=.12;logEvent(match,`${opp.name} 감독: 라인을 내리고 공간을 지키는 형태로 변화를 줬습니다.`,'ai');}
 }
 if(match.minute===73){
  if(match.away<match.home){opp.press=clamp(opp.press+18,20,98);opp.aggression+=.29;opp.approach=clamp(opp.approach+12,10,99);logEvent(match,`${opp.name} 감독: 동점골을 위해 전방 압박과 박스 침투 인원을 크게 늘렸습니다.`,'ai');}
  else{opp.press=clamp(opp.press-8,5,95);logEvent(match,`${opp.name} 감독: 경기 종료를 앞두고 압박을 조절하고 있습니다.`,'ai');}
 }
}
function describeUserAttack(t){
 const wing=t.inPositions.map((pos,i)=>({pos:positionAt(pos,i),p:t.players[i]})).filter(x=>x.pos.group==='WIDE'||x.pos.group==='WM');
 const choices=[];
 wing.forEach(w=>{
  const label=w.pos.label,pl=w.p;
  if(pl.ballCarry>=67)choices.push({weight:pl.ballCarry/100,text:`${label}의 볼 운반과 전진 드리블`});
  if(pl.cutInside>=64&&pl.shoot>=60)choices.push({weight:(pl.cutInside+pl.shoot)/200,text:`${label}의 인사이드 침투와 직접 슈팅`});
  if(pl.wide>=65&&pl.cross>=60)choices.push({weight:(pl.wide+pl.cross)/200,text:`${label}의 측면 돌파와 크로스`});
  if(pl.passRisk>=65&&pl.through>=65)choices.push({weight:(pl.passRisk+pl.through)/200,text:`${label}의 플레이메이킹과 스루패스`});
 });
 if(!choices.length)return t.team.playFocus==='중앙'?'중앙에서의 연계':t.team.crossFreq>73?'측면 크로스':t.team.through>64?'침투 패스':'조직적인 공격';
 const total=choices.reduce((s,c)=>s+c.weight,0);let pick=Math.random()*total;
 for(const c of choices){pick-=c.weight;if(pick<=0)return c.text;}
 return choices[choices.length-1].text;
}
function stepMatch(state, n=5) {
 const m=state.match;
 if(!m||m.finished) return;
 const t=state.tactics[state.activeSlot];
 for(let tick=0;tick<n && m.minute<90;tick++){
  m.minute++;
  updateOpponent(m);
  const me=getTeamModel(t,CLUBS[state.career.club].strength,m.minute,m.enemy);
  const them=getOpponentModel(m.enemy,m.minute);
  const teamQuality=Math.pow(1.045,(me.strength-them.strength));
  const oppQuality=1/teamQuality;
  const teamChance=clamp(.118*teamQuality*me.attack/them.defense*(.95+me.control/them.control*.06),.035,.24);
  const oppChance=clamp(.116*oppQuality*them.attack/me.defense,.035,.25);
  m.passes+=Math.round(rand(3,6)*me.control);
  m.oppPasses+=Math.round(rand(3,6)*them.control);
  // 세트피스의 빈도/질은 전술 편집기의 세트피스 항목에서 계산한다.
  if(Math.random()<.04*(me.attack/them.defense)){
   const sp=t.setpieces;
   const quality=clamp(.055+sp.cornerCommit*.00037+sp.cornerShort*.00012+(sp.cornerSide==='쇼트 코너'?.01:0)+(sp.cornerCross==='인스윙'?.008:0),.025,.20);
   m.shots++;m.xg+=quality;
   if(Math.random()<quality){m.home++;m.shotsOn++;logEvent(m,`GOAL! 준비한 코너킥 전술이 적중했습니다. (${m.home}:${m.away})`,'goal');}
   else if(Math.random()<.35){logEvent(m,`코너킥 상황: ${sp.cornerSide} 방향으로 전개했습니다.`,'shot');}
  }
  if(Math.random()<teamChance){
   const quality=clamp(rand(.055,.22)*(.85+me.attack*.14)+rand(-.015,.015),.025,.35);
   m.shots++;m.xg+=quality;
   if(Math.random()<.37+quality*.6){m.shotsOn++;}
   if(Math.random()<quality){m.home++;logEvent(m,`GOAL! 우리 팀이 ${describeUserAttack(t)}로 득점했습니다. (${m.home}:${m.away})`,'goal');}
   else if(quality>.16 || Math.random()<.15)logEvent(m,`우리 팀 슈팅. 추정 xG ${quality.toFixed(2)} — ${t.team.workBox>65?'박스 안에서 연결된 슈팅':'중거리 또는 공간 침투 장면'}.`,'shot');
  }
  if(Math.random()<.039*(them.attack/me.defense)){
   const cornerGuard=t.setpieces.defCorner==='혼합'?.89:t.setpieces.defCorner==='지역 방어'?.93:1;
   const quality=clamp(.11*cornerGuard-(t.setpieces.counterFromCorners-50)*.0001,.04,.17);
   m.oppShots++;m.oppXg+=quality;
   if(Math.random()<quality){m.away++;m.oppShotsOn++;logEvent(m,`실점! 상대 코너킥에서 공간을 허용했습니다. (${m.home}:${m.away})`,'against');}
  }
  if(Math.random()<oppChance){
   const risk=me.exposure*.08;
   const quality=clamp(rand(.055,.20)+risk,.025,.34);
   m.oppShots++;m.oppXg+=quality;
   if(Math.random()<.40+quality*.65)m.oppShotsOn++;
   if(Math.random()<quality){m.away++;logEvent(m,`실점! ${m.enemy.name}이(가) 빈 공간을 공략했습니다. (${m.home}:${m.away})`,'against');}
   else if(quality>.16||Math.random()<.13)logEvent(m,`상대가 슈팅 기회를 만들었습니다. 추정 xG ${quality.toFixed(2)}.`,'shot');
  }
  if(m.minute===45) logEvent(m,'하프타임. 전술실에서 모든 지시를 바꾼 뒤 후반전을 시작할 수 있습니다.','info');
 }
 if(m.minute>=90){m.finished=true;logEvent(m,`경기 종료: ${m.home} : ${m.away}. 경기 리뷰를 확인하십시오.`,'finish');}
}
function completeMatch(state) {
 const m=state.match;
 if(!m?.finished || m.applied) return;
 m.applied=true;
 const c=state.career;
 c.played++; c.fixtureIndex++;c.gf+=m.home;c.ga+=m.away;
 if(m.home>m.away){c.wins++;c.points+=3;c.board=clamp(c.board+5,0,100);c.rep=clamp(c.rep+3,0,100);}
 else if(m.home===m.away){c.draws++;c.points+=1;c.board=clamp(c.board-1,0,100);c.rep=clamp(c.rep+1,0,100);}
 else{c.losses++;c.board=clamp(c.board-8,0,100);c.rep=clamp(c.rep-2,0,100);}
 const expected=(CLUBS[c.club].strength-55)/5;
 if(c.played>=5 && c.points/c.played < expected*.63) c.board=clamp(c.board-5,0,100);
 c.history.unshift({opponent:m.enemy.name,home:m.home,away:m.away,xg:m.xg,oppXg:m.oppXg});
 c.history=c.history.slice(0,24);
 if(c.board<=12 && c.played>=5){c.fired=true;}
 if(c.played%11===0){c.season++;c.fixtureIndex=1;c.played=0;c.wins=0;c.draws=0;c.losses=0;c.points=0;c.gf=0;c.ga=0;c.board=clamp(c.board+6,10,100);}
}