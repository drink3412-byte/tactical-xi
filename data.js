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
// Positional roles are hard-constrained by the tactical board location.
const PERSONAL_DEFS = [
 {key:'ballCarry',label:'볼 운반 거리',type:'range',group:'공 소유 · 드리블',desc:'공을 가진 채 전진하며 공간을 끌어낼 빈도'},
 {key:'dribble',label:'1대1 돌파',type:'range',group:'공 소유 · 드리블',desc:'수비수를 직접 제치는 돌파 시도'},
 {key:'cutInside',label:'안쪽으로 파고들기',type:'range',group:'공 소유 · 드리블',desc:'측면에서 하프스페이스와 중앙으로 진입'},
 {key:'passRisk',label:'모험적인 패스',type:'range',group:'공 소유 · 배급',desc:'전진·킬패스의 위험을 감수'},
 {key:'through',label:'스루패스 시도',type:'range',group:'공 소유 · 배급',desc:'수비 라인 사이로 찔러 넣는 패스'},
 {key:'cross',label:'크로스 빈도',type:'range',group:'공 소유 · 배급',desc:'측면에서 박스로 공 공급'},
 {key:'crossEarly',label:'얼리 크로스',type:'range',group:'공 소유 · 배급',desc:'깊게 들어가지 않고 빠르게 올리는 크로스'},
 {key:'shoot',label:'직접 슈팅',type:'range',group:'공 소유 · 마무리',desc:'직접 마무리하려는 성향'},
 {key:'holdUp',label:'등지고 공 지키기',type:'range',group:'공 소유 · 마무리',desc:'공을 받아 동료에게 연결할 때까지 버티기'},
 {key:'run',label:'뒷공간 침투',type:'range',group:'공 소유 · 움직임',desc:'수비 라인 뒤쪽을 공략하는 움직임'},
 {key:'wide',label:'터치라인 유지',type:'range',group:'공 소유 · 움직임',desc:'폭을 넓히며 바깥쪽에 위치'},
 {key:'roam',label:'포지션 이탈 자유도',type:'range',group:'공 소유 · 움직임',desc:'정해진 구역을 벗어나 공을 받는 움직임'},
 {key:'hold',label:'자리 지키기',type:'range',group:'공 소유 · 움직임',desc:'기본 위치를 유지하며 균형을 지킴'},
 {key:'press',label:'압박 빈도',type:'range',group:'공 미소유 · 수비',desc:'볼 소유자에게 적극 접근'},
 {key:'tackle',label:'태클 적극성',type:'range',group:'공 미소유 · 수비',desc:'위험을 감수한 볼 탈취'},
 {key:'mark',label:'밀착 마킹',type:'range',group:'공 미소유 · 수비',desc:'상대의 볼 받는 공간을 차단'},
 {key:'track',label:'수비 복귀',type:'range',group:'공 미소유 · 수비',desc:'공격권을 잃었을 때 내려오는 정도'}
];
const ROLE_LIBRARY = {
 GK:[
  ['골키퍼','골문 앞을 지키는 안정적인 골키퍼',{run:5,hold:90,passRisk:20,ballCarry:5}],
  ['스위퍼 키퍼','수비라인 뒤 공간을 커버하고 빌드업에 참여',{run:35,hold:55,passRisk:52,ballCarry:24}],
  ['공격형 스위퍼 키퍼','높은 위치에서 전개에 적극 가담',{run:45,hold:40,passRisk:65,ballCarry:35}]
 ],
 CB:[
  ['중앙 수비수','수비 위치와 공간을 우선 보호',{hold:85,run:10,passRisk:20}],
  ['볼 플레잉 수비수','후방에서 전진 패스와 빌드업 주도',{hold:75,passRisk:73,through:45}],
  ['전진형 센터백','필요할 때 공을 몰고 전진해 숫자 우위 형성',{hold:48,ballCarry:64,run:43}],
  ['커버형 센터백','수비 뒷공간을 우선적으로 보호',{hold:91,press:36,track:88}]
 ],
 FB:[
  ['풀백','측면 수비에 우선 집중',{hold:78,wide:65,run:35,track:84}],
  ['오버래핑 풀백','윙어 바깥으로 전진하며 크로스 제공',{hold:35,run:78,wide:88,cross:74}],
  ['인버티드 풀백','안쪽으로 좁혀 후방 빌드업을 지원',{hold:65,wide:15,cutInside:75,passRisk:48}],
  ['공격형 풀백','측면 전개와 직선 돌파를 적극 지원',{run:82,ballCarry:68,cross:68,wide:78}]
 ],
 WB:[
  ['윙백','측면 공격과 수비에 균형 있게 가담',{run:70,wide:80,cross:65,track:65}],
  ['공격형 윙백','높은 위치에서 돌파와 크로스 주도',{run:82,wide:87,ballCarry:72,cross:84}],
  ['인버티드 윙백','중원 안쪽으로 이동해 패스 연결',{wide:18,cutInside:78,passRisk:63,hold:42}],
  ['수비형 윙백','측면 공간을 지키며 상대 윙어 봉쇄',{hold:78,track:89,run:28}]
 ],
 DM:[
  ['수비형 미드필더','중앙의 위험한 공간을 보호',{hold:86,track:78,mark:72}],
  ['앵커맨','수비 라인 앞을 떠나지 않는 보호막',{hold:94,run:12,press:42}],
  ['딥라잉 플레이메이커','낮은 위치에서 전진 패스로 전개',{hold:81,passRisk:75,through:67}],
  ['하프백','빌드업 시 센터백 사이로 내려옴',{hold:88,run:22,passRisk:48}],
  ['볼 위닝 미드필더','강한 압박과 태클로 중원 장악',{press:86,tackle:80,mark:73}]
 ],
 CM:[
  ['중앙 미드필더','공수 간격을 연결하는 균형형',{hold:57,run:51,passRisk:50}],
  ['박스 투 박스','양쪽 페널티 박스를 오가는 활동형',{run:82,track:80,press:74}],
  ['메짤라','중앙에서 하프스페이스로 빠져 침투',{run:76,roam:75,cutInside:60,hold:26}],
  ['전진형 플레이메이커','전방에서 패스와 찬스 메이킹',{through:82,passRisk:83,roam:70}],
  ['딥라잉 플레이메이커','낮은 자리에서 경기 흐름 조율',{hold:82,passRisk:71,through:67}],
  ['카릴레로','중원과 측면 사이 공간을 왕복',{track:74,wide:67,run:61}]
 ],
 AM:[
  ['공격형 미드필더','전방에서 공격에 균형 있게 기여',{run:62,shoot:60,passRisk:62}],
  ['전진형 플레이메이커','최전방에 창의적인 패스 공급',{passRisk:84,through:86,roam:75,shoot:30}],
  ['쉐도우 스트라이커','공격수 뒤에서 박스 안까지 침투',{run:89,shoot:84,hold:20}],
  ['엔간체','중앙에 머물며 패스 허브 역할 수행',{run:25,hold:81,through:81,passRisk:78}]
 ],
 WIDE:[
  ['정통 윙어','터치라인을 넓게 쓰며 크로스를 제공',{wide:92,cutInside:12,ballCarry:54,dribble:64,cross:79,shoot:24,run:65}],
  ['볼 운반형 윙어','공을 받아 길게 몰고 전진하며 수비를 끌어냄',{ballCarry:95,dribble:76,wide:67,cutInside:37,cross:48,shoot:39,run:65}],
  ['인버티드 윙어','측면에서 안쪽으로 들어와 패스 연결',{cutInside:91,wide:24,ballCarry:64,passRisk:78,through:75,shoot:54,cross:24}],
  ['인사이드 포워드','안쪽으로 침투하며 직접 슈팅을 노림',{cutInside:96,wide:14,ballCarry:75,dribble:74,shoot:95,run:89,cross:13}],
  ['와이드 플레이메이커','측면에서 공간을 찾고 창의적인 패스 공급',{wide:55,roam:86,passRisk:90,through:90,cross:44,shoot:24}],
  ['크로스 특화 윙어','폭을 유지하며 조기에 크로스를 투입',{wide:94,cross:96,crossEarly:91,shoot:14,cutInside:10}],
  ['압박형 윙어','상대 빌드업을 괴롭히고 볼을 탈취',{press:95,track:86,mark:78,run:57,shoot:34}]
 ],
 WM:[
  ['와이드 미드필더','측면에서 공수 균형을 유지',{wide:74,track:76,run:46}],
  ['정통 윙어','바깥쪽에서 넓게 전진하고 크로스',{wide:93,cross:79,run:70,track:54}],
  ['볼 운반형 윙어','공을 소유해 측면에서 앞으로 운반',{ballCarry:94,dribble:74,wide:70,run:65}],
  ['인버티드 윙어','중원 쪽으로 좁혀 패스 연결',{cutInside:90,wide:22,passRisk:74,through:68}],
  ['인사이드 포워드','바깥에서 중앙으로 침투해 슈팅',{cutInside:94,shoot:91,run:85,wide:18}],
  ['와이드 플레이메이커','측면에서 찬스를 만드는 패스 공급',{roam:82,passRisk:86,through:81}],
  ['수비형 와이드 미드필더','후방을 지원하고 상대 풀백을 마킹',{track:93,press:74,mark:83,run:27}]
 ],
 ST:[
  ['전방 공격수','전방에서 침투와 마무리를 모두 수행',{run:80,shoot:78,holdUp:48}],
  ['침투형 공격수','수비 뒷공간을 반복적으로 공략',{run:97,shoot:82,holdUp:23}],
  ['포처','박스에서 슈팅 기회를 기다림',{run:62,shoot:97,hold:66,passRisk:12}],
  ['타깃 포워드','등지고 볼을 받으며 동료의 침투를 지원',{holdUp:96,hold:74,run:24,passRisk:38}],
  ['펄스 나인','중원으로 내려와 연결과 공간 창출',{holdUp:65,roam:94,passRisk:82,through:76,run:30}],
  ['압박형 포워드','상대 수비와 골키퍼를 적극 압박',{press:95,track:62,run:73,shoot:66}],
  ['딥라잉 포워드','낮게 내려와 공격형 미드필더와 연계',{holdUp:79,roam:80,passRisk:72,through:60}]
 ]
};
const DEFEND_ROLES={
 GK:['골키퍼','스위핑 커버'],CB:['지역 수비','대인 마킹','커버','압박 전진','수비라인 지휘'],
 FB:['측면 보호','대인 마킹','전진 압박','안쪽 커버'],WB:['측면 보호','전진 압박','수비 복귀','안쪽 커버'],
 DM:['중앙 차단','대인 마킹','세컨드볼 경합','커버','전진 압박'],
 CM:['중앙 차단','전진 압박','세컨드볼 경합','수비 복귀','대인 마킹'],
 AM:['전진 압박','중앙 패스 차단','역습 대기','수비 복귀'],
 WIDE:['전진 압박','측면 수비','상대 풀백 추적','역습 대기'],
 WM:['측면 수비','상대 풀백 추적','전진 압박','수비 복귀'],
 ST:['전진 압박','패스 차단','역습 대기','상대 센터백 마킹']
};
const DEFEND_PRESETS={
 '지역 수비':{hold:85,mark:40},'대인 마킹':{mark:93,track:82},'커버':{track:89,hold:84,press:32},
 '압박 전진':{press:92,mark:57},'수비라인 지휘':{hold:88,mark:72},'측면 보호':{track:85,wide:83},
 '전진 압박':{press:93,track:67},'안쪽 커버':{track:78,wide:24},'수비 복귀':{track:95,press:44},
 '중앙 차단':{mark:74,hold:82},'세컨드볼 경합':{mark:65,press:74},'중앙 패스 차단':{mark:72,press:69},
 '역습 대기':{track:20,press:38},'측면 수비':{track:85,wide:85},'상대 풀백 추적':{track:93,mark:86},
 '패스 차단':{press:73,mark:77},'상대 센터백 마킹':{press:80,mark:83},'골키퍼':{hold:90},'스위핑 커버':{run:40,track:74}
};
const POSITION_NAMES={GK:'GK',CB:'CB',FB:'FB',WB:'WB',DM:'DM',CM:'CM',AM:'AM',WIDE:'W',WM:'WM',ST:'ST'};
function positionAt(coords,index){
 if(index===0)return {group:'GK',label:'GK',name:'골키퍼'};
 const [x,y]=coords,side=x<40?'L':x>60?'R':'C',wide=x<27||x>73;
 let group;
 if(y>=67)group=wide?'FB':'CB';
 else if(y>=55)group=wide?'WB':'DM';
 else if(y>=39)group=wide?'WM':'CM';
 else if(y>=26)group=wide?'WIDE':'AM';
 else group=wide?'WIDE':'ST';
 const label={GK:'GK',CB:'CB',FB:side==='L'?'LB':'RB',WB:side==='L'?'LWB':'RWB',DM:'DM',CM:'CM',AM:'AM',WIDE:side==='L'?'LW':'RW',WM:side==='L'?'LM':'RM',ST:'ST'}[group];
 const name={GK:'골키퍼',CB:'센터백',FB:'풀백',WB:'윙백',DM:'수비형 미드필더',CM:'중앙 미드필더',AM:'공격형 미드필더',WIDE:'윙어',WM:'측면 미드필더',ST:'스트라이커'}[group];
 return {group,label,name};
}
function roleOptions(pos,shape='in'){
 return shape==='in'?ROLE_LIBRARY[pos.group].map(x=>x[0]):DEFEND_ROLES[pos.group];
}
function rolePreset(pos,role){return ROLE_LIBRARY[pos.group]?.find(x=>x[0]===role)?.[2]||{};}
function roleDescription(pos,role){return ROLE_LIBRARY[pos.group]?.find(x=>x[0]===role)?.[1]||'';}
function ensureRoleValidity(t,i,shape,applyPreset=false){
 const isIn=shape==='in',pos=positionAt(t[isIn?'inPositions':'outPositions'][i],i),key=isIn?'attackRole':'defendRole';
 const options=roleOptions(pos,shape),old=t.players[i][key],invalid=!options.includes(old);
 if(invalid)t.players[i][key]=options[0];
 if((invalid||applyPreset)&&isIn){Object.assign(t.players[i],rolePreset(pos,t.players[i][key]));}
 if((invalid||applyPreset)&&!isIn)Object.assign(t.players[i],DEFEND_PRESETS[t.players[i][key]]||{});
 return invalid;
}
function normalizeTacticRoles(t){
 if(!t||!t.players)return;
 t.players.forEach((player,i)=>{
  PERSONAL_DEFS.forEach(d=>{if(!Number.isFinite(player[d.key]))player[d.key]=50;});
  ensureRoleValidity(t,i,'in');ensureRoleValidity(t,i,'out');
 });
}
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
 const players = Array.from({length:11},()=> Object.fromEntries(PERSONAL_DEFS.map(d=>[d.key,50])));
 const t={name,inFormation:'4-2-3-1',outFormation:'4-1-4-1',inPositions:FORMATIONS['4-2-3-1'].map(p=>[...p]),outPositions:FORMATIONS['4-1-4-1'].map(p=>[...p]),team:Object.fromEntries(DEFINITIONS.map(d=>[d.key,d.value])),players, opp:Object.fromEntries(OPP_TARGETS.map(k=>[k,{press:50,tight:50,tackle:50,foot:'자동'}])),setpieces:{...DEFAULT_SP}};
 normalizeTacticRoles(t);return t;
}