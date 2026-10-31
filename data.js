const FORMATIONS = {
 '4-3-3': [[50,91],[14,72],[37,77],[63,77],[86,72],[50,60],[27,49],[73,49],[17,26],[50,18],[83,26]],
 '4-2-3-1': [[50,91],[14,72],[37,77],[63,77],[86,72],[38,57],[62,57],[17,34],[50,38],[83,34],[50,16]],
 '4-4-2': [[50,91],[14,72],[37,77],[63,77],[86,72],[16,47],[39,53],[61,53],[84,47],[38,21],[62,21]],
 '3-4-2-1': [[50,91],[25,75],[50,79],[75,75],[10,53],[37,56],[63,56],[90,53],[34,32],[66,32],[50,17]],
 '4-1-4-1': [[50,91],[14,72],[37,77],[63,77],[86,72],[50,62],[13,42],[38,44],[62,44],[87,42],[50,18]],
 '5-3-2': [[50,91],[9,68],[30,76],[50,79],[70,76],[91,68],[30,50],[50,54],[70,50],[38,21],[62,21]],
 '3-5-2': [[50,91],[24,75],[50,79],[76,75],[9,48],[31,52],[50,57],[69,52],[91,48],[38,22],[62,22]]
};
const CLUBS = [
 {name:'해운대 유나이티드', strength:65, style:'균형형', approach:50, press:50, width:50, formation:'4-2-3-1'},
 {name:'대전 블루윙스', strength:67, style:'점유형', approach:32, press:68, width:66, formation:'4-3-3'},
 {name:'남해 타이탄즈', strength:63, style:'롱볼형', approach:87, press:37, width:44, formation:'4-4-2'},
 {name:'수원 아틀라스', strength:70, style:'압박형', approach:48, press:86, width:54, formation:'4-3-3'},
 {name:'강릉 파이오니어스', strength:61, style:'역습형', approach:82, press:30, width:72, formation:'5-3-2'},
 {name:'인천 웨이브', strength:68, style:'측면형', approach:61, press:58, width:89, formation:'3-5-2'},
 {name:'전주 시티', strength:66, style:'점유형', approach:25, press:62, width:50, formation:'4-1-4-1'},
 {name:'창원 레인저스', strength:64, style:'역습형', approach:77, press:39, width:39, formation:'4-2-3-1'},
 {name:'청주 메탈', strength:62, style:'수비형', approach:67, press:24, width:32, formation:'5-3-2'},
 {name:'춘천 포레스트', strength:69, style:'압박형', approach:43, press:83, width:75, formation:'3-4-2-1'},
 {name:'포항 코메츠', strength:71, style:'점유형', approach:38, press:62, width:68, formation:'4-3-3'},
 {name:'울산 머큐리', strength:65, style:'측면형', approach:64, press:56, width:85, formation:'4-4-2'}
];
const DEFINITIONS = [
 {group:'빌드업', key:'buildShort', title:'후방 빌드업 우선', type:'range', value:70, desc:'골키퍼와 수비수가 짧은 패스로 전개할 가능성'},
 {group:'빌드업', key:'passing', title:'패스 길이', type:'range', value:42, left:'짧게', right:'길게',desc:'볼을 전진시키는 패스의 평균 거리'},
 {group:'빌드업', key:'tempo', title:'패스·공격 템포', type:'range', value:56,left:'느리게',right:'빠르게',desc:'패스 결정과 공격 전개 속도'},
 {group:'빌드업', key:'width', title:'공격 폭', type:'range', value:62,left:'좁게',right:'넓게',desc:'공 소유 시 좌우 간격'},
 {group:'빌드업', key:'gkPace', title:'골키퍼 배급 속도', type:'range', value:55,left:'여유롭게',right:'빠르게',desc:'재개 시 공을 배급하는 속도'},
 {group:'빌드업', key:'gkTarget', title:'골키퍼 배급 대상', type:'select', value:'센터백',options:['센터백','풀백','수비형 미드필더','중앙 미드필더','측면','최전방','상황에 따라'],desc:'공격 시작 지점'},
 {group:'빌드업', key:'gkMethod', title:'골키퍼 배급 방법', type:'select', value:'짧은 패스',options:['짧은 패스','긴 킥','롤링 스로','상황에 따라'],desc:'골키퍼가 가장 자주 선택하는 배급 방식'},
 {group:'전진·전개', key:'passSpace', title:'공간으로 패스', type:'range', value:62,desc:'수비 뒤나 빈 곳으로 리드 패스를 시도'},
 {group:'전진·전개', key:'passFeet', title:'발밑으로 패스', type:'range', value:38,desc:'선수의 발을 향한 안정적인 패스 선호'},
 {group:'전진·전개', key:'playFocus', title:'공격 전개 방향', type:'select', value:'균형',options:['균형','좌측','중앙','우측','양쪽 측면'],desc:'공격 루트를 집중할 방향'},
 {group:'전진·전개', key:'overlapLeft', title:'좌측 오버래핑', type:'range', value:60,desc:'측면 수비수가 윙어 바깥으로 전진'},
 {group:'전진·전개', key:'overlapRight', title:'우측 오버래핑', type:'range', value:60,desc:'측면 수비수가 윙어 바깥으로 전진'},
 {group:'전진·전개', key:'underlapLeft', title:'좌측 언더래핑', type:'range', value:35,desc:'측면 수비수가 안쪽 공간으로 전진'},
 {group:'전진·전개', key:'underlapRight', title:'우측 언더래핑', type:'range', value:35,desc:'측면 수비수가 안쪽 공간으로 전진'},
 {group:'전진·전개', key:'switchPlay', title:'방향 전환', type:'range', value:50,desc:'반대쪽 측면으로 전개를 크게 전환'},
 {group:'전진·전개', key:'creative', title:'자유로운 플레이', type:'range', value:50,desc:'조직적 움직임 대신 개인의 판단을 허용'},
 {group:'파이널 서드', key:'workBox', title:'박스 안까지 전개', type:'range', value:64,desc:'먼 거리 슛보다 박스 안 찬스를 노림'},
 {group:'파이널 서드', key:'shootEarly', title:'빠른 슈팅', type:'range', value:36,desc:'공간이 생기면 적극적으로 슛'},
 {group:'파이널 서드', key:'dribble', title:'드리블 돌파', type:'range', value:52,desc:'수비수 상대로 개인 돌파 시도'},
 {group:'파이널 서드', key:'through', title:'스루패스 빈도', type:'range', value:60,desc:'라인 사이로 결정적인 패스 시도'},
 {group:'파이널 서드', key:'crossFreq', title:'크로스 빈도', type:'range', value:55,desc:'측면에서 페널티 박스로 공을 공급'},
 {group:'파이널 서드', key:'crossType', title:'크로스 종류', type:'select', value:'혼합',options:['혼합','낮고 빠르게','높고 길게','컷백 중심','얼리 크로스'],desc:'크로스를 올리는 방법'},
 {group:'파이널 서드', key:'boxRuns', title:'박스 침투 인원', type:'range', value:62,desc:'공격 상황에서 박스 안으로 들어가는 선수 수'},
 {group:'파이널 서드', key:'timeWaste', title:'시간 지연', type:'range', value:5,desc:'공격 전개와 재개를 늦추는 경향'},
 {group:'전환', key:'lost', title:'공을 빼앗기면', type:'select', value:'역압박',options:['역압박','수비 재정비','상황 판단'],desc:'공격권 상실 직후의 팀 행동'},
 {group:'전환', key:'won', title:'공을 되찾으면', type:'select', value:'빠른 역습',options:['빠른 역습','공격 형태 유지','상황 판단'],desc:'공격권 회복 직후의 팀 행동'},
 {group:'전환', key:'transitionSpeed', title:'전환 속도', type:'range', value:65,desc:'공수 전환 시 움직이는 속도'},
 {group:'전환', key:'counterRisk', title:'역습 패스 위험 감수', type:'range', value:52,desc:'공을 탈취한 직후 전진 패스의 위험 수준'},
 {group:'전환', key:'restDef', title:'공격 시 후방 잔류', type:'range', value:56,desc:'역습 대비를 위해 후방에 남겨 둘 인원'},
 {group:'수비', key:'defLine', title:'최종 수비 라인', type:'range', value:61,left:'깊게',right:'높게',desc:'수비수의 기본 위치'},
 {group:'수비', key:'engageLine', title:'압박 시작 위치', type:'range', value:67,left:'후방',right:'전방',desc:'상대를 압박하기 시작하는 높이'},
 {group:'수비', key:'press', title:'압박 강도', type:'range', value:70,desc:'상대가 공을 가졌을 때 접근 빈도'},
 {group:'수비', key:'defWidth', title:'수비 폭', type:'range', value:46,left:'중앙 압축',right:'측면 커버',desc:'공 미소유 시 좌우 간격'},
 {group:'수비', key:'marking', title:'기본 마킹 체계', type:'select', value:'혼합',options:['지역 방어','대인 마킹','혼합'],desc:'공간과 선수를 수비하는 방식'},
 {group:'수비', key:'tackle', title:'태클 적극성', type:'range', value:50,desc:'경합 시 적극적으로 발을 뻗는 정도'},
 {group:'수비', key:'offside', title:'오프사이드 트랩', type:'range', value:47,desc:'수비수들의 라인 상승 빈도'},
 {group:'수비', key:'force', title:'상대 유도 방향', type:'select', value:'자연스럽게',options:['자연스럽게','바깥으로','중앙으로','약한 발 방향'],desc:'상대 공 소유자를 몰아갈 방향'},
 {group:'수비', key:'stopGK', title:'골키퍼 짧은 배급 차단', type:'range', value:61,desc:'상대 센터백과 골키퍼에게 압박'},
 {group:'수비', key:'stopCross', title:'크로스 차단', type:'range', value:52,desc:'상대 측면에서 크로스 공간 차단'},
 {group:'수비', key:'secondBall', title:'세컨드볼 경합', type:'range', value:58,desc:'롱볼 이후의 낙하지점 장악'},
 {group:'수비', key:'compact', title:'라인 간격 압축', type:'range', value:63,desc:'전방과 후방 라인 사이 거리'},
 {group:'수비', key:'dropAgainstRuns', title:'침투 대응 후퇴', type:'range', value:48,desc:'상대 침투에 대응해 수비수가 후퇴'},
 {group:'특수', key:'mentality', title:'팀 공격 성향', type:'range', value:53,left:'극단적 수비',right:'극단적 공격',desc:'공격 시 위험을 감수하려는 성향'},
 {group:'특수', key:'rhythm', title:'경기 리듬 변화', type:'range', value:45,desc:'템포를 불규칙하게 바꾸려는 정도'},
 {group:'특수', key:'discipline', title:'전술 규율', type:'range', value:68,desc:'지시된 위치와 역할을 지키려는 정도'}
];
const PERSONAL_DEFS = [
 {key:'attackRole', label:'공 소유 시 역할',type:'select',options:['기본 역할','인버티드 윙백','오버래핑 풀백','플레이메이킹 풀백','볼 플레잉 수비수','전진형 센터백','앵커맨','딥라잉 플레이메이커','박스 투 박스','메짤라','전진형 플레이메이커','윙어','인사이드 포워드','와이드 포워드','펄스 나인','타깃 포워드','침투형 공격수','포처','스위퍼 키퍼']},
 {key:'defendRole', label:'공 미소유 시 역할',type:'select',options:['기본 역할','지역 수비','대인 마킹','전진 압박','수비 커버','수비라인 지휘','측면 수비','중앙 차단','세컨드볼 경합','역습 대기']},
 {key:'run', label:'전진·침투', type:'range'},
 {key:'hold', label:'위치 유지', type:'range'},
 {key:'roam', label:'자유로운 위치 이동', type:'range'},
 {key:'passRisk', label:'모험적 패스', type:'range'},
 {key:'dribble', label:'개인 드리블', type:'range'},
 {key:'shoot', label:'직접 슈팅', type:'range'},
 {key:'cross', label:'크로스 빈도', type:'range'},
 {key:'press', label:'개인 압박', type:'range'},
 {key:'tackle', label:'개인 태클 적극성', type:'range'},
 {key:'mark', label:'밀착 마킹', type:'range'},
 {key:'track', label:'수비 복귀', type:'range'},
 {key:'wide', label:'측면 벌리기', type:'range'}
];
const OPP_TARGETS = ['GK','LB/LWB','LCB','RCB','RB/RWB','DM','LCM','RCM','LW','AM/RW','ST'];
const SP_DEFS = [
 {key:'cornerSide', label:'코너킥 주요 투입 위치', type:'select',options:['니어 포스트','파 포스트','페널티 스팟','쇼트 코너','혼합']},
 {key:'cornerCross', label:'코너킥 킥 궤적', type:'select',options:['인스윙','아웃스윙','혼합']},
 {key:'cornerCommit', label:'공격 코너킥 가담',type:'range'},
 {key:'cornerShort', label:'쇼트 코너 빈도',type:'range'},
 {key:'freeKick', label:'프리킥 선택', type:'select',options:['직접 슈팅','짧은 패스','박스 안 크로스','상황 판단']},
 {key:'defCorner', label:'수비 코너킥', type:'select',options:['지역 방어','대인 마킹','혼합']},
 {key:'counterFromCorners', label:'수비 코너킥 역습 대기',type:'range'},
 {key:'longThrow', label:'긴 스로인 활용',type:'range'}
];
const DEFAULT_SP = Object.fromEntries(SP_DEFS.map(d=>[d.key,d.options?d.options[0]:50]));
function createTactic(name='기본 전술') {
 const players = Array.from({length:11},(_,i)=> Object.fromEntries(PERSONAL_DEFS.map(d=>[d.key,d.options?d.options[0]:50])));
 return {name,inFormation:'4-2-3-1',outFormation:'4-1-4-1',inPositions:FORMATIONS['4-2-3-1'].map(p=>[...p]),outPositions:FORMATIONS['4-1-4-1'].map(p=>[...p]),team:Object.fromEntries(DEFINITIONS.map(d=>[d.key,d.value])),players, opp:Object.fromEntries(OPP_TARGETS.map(k=>[k,{press:50,tight:50,tackle:50,foot:'자동'}])),setpieces:{...DEFAULT_SP}};
}
