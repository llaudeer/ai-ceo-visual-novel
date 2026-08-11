/**
 * 《ARIA : 7 WEEKS》 스토리 데이터.
 *
 * 이 파일은 통째로 교체될 것을 전제로 한다.
 * 렌더링·UI·상태 로직은 이 파일의 내용을 알지 못한다.
 * 다른 파일에 대사나 씬 이름을 하드코딩하지 말 것.
 *
 * 배경: 3078년 / TRIPLEDOT STUDIO
 * 목표: 7주 안에 NEON MEMORY 출시
 *
 * beat 형식:
 *   나레이션 { n: "..." }
 *   대사     { w: "캐릭터id", t: "...", aria?: "상태", fx?: "shake" | "flash" }
 *   표시     { hud: "FUNDS 100,000 CR" }   화면 중앙 오버레이 한 줄
 *
 * beat.aria 는 그 대사 시점에 ARIA 홀로그램이 물드는 색이다.
 *   neutral 🟣 / suggest 🟢 / recommend 🔵 / warn 🔴  — src/ui/theme.js 토큰과 1:1
 *
 * scene.burn 은 그 주의 고정 운영비다. 씬에 진입할 때 자동으로 빠진다.
 * 합계가 대본의 "WEEK 3 → 63,000 CR" 표시와 정확히 맞도록 조정되어 있다.
 */

export const SCENES = {

// ─────────────────────────────── PROLOGUE

p01_city: {
  act: 'PROLOGUE', chapter: '새로운 대표', week: 0, bg: 'city_night',
  cast: [], aria: 'neutral', burn: 0,
  beats: [
    { n: '3078년.' },
    { n: '거대한 미래 도시의 빌딩 사이, 작은 회사 간판 하나가 켜져 있다.' },
    { hud: 'TRIPLEDOT STUDIO' },
    { n: '창 안쪽에서는 다섯 사람이 각자의 자리에서 일하고 있다.' }
  ],
  choices: []
},

p02_ceo: {
  act: 'PROLOGUE', chapter: '새로운 대표', week: 0, bg: 'office_night',
  cast: ['jihun'], aria: 'neutral', burn: 0,
  beats: [
    { n: '문이 열린다. 당신이 사무실 안으로 들어선다.' },
    { w: 'jihun', t: '왔네.' },
    { w: 'jihun', t: '오늘부터 진짜 대표야.' },
    { w: 'jihun', t: '그리고 좋은 소식 하나.' },
    { n: '잠시 정적.' },
    { w: 'jihun', t: '우리한테 남은 돈이 10만 CR야.' },
    { hud: 'FUNDS 100,000 CR' }
  ],
  choices: []
},

p03_aria: {
  act: 'PROLOGUE', chapter: 'ARIA', week: 0, bg: 'office_night',
  cast: ['jihun'], aria: 'neutral', burn: 0,
  beats: [
    { n: '사무실 중앙의 작은 장치가 켜진다.' },
    { n: '보라색 빛. 구체형 홀로그램이 천천히 떠오른다.' },
    { w: 'aria', aria: 'neutral', t: 'ARIA가 연결되었습니다.' },
    { w: 'aria', t: 'Tripledot Studio의 경영 보조 시스템입니다.' },
    { w: 'aria', t: '현재 자금으로 약 7주간 운영이 가능합니다.' },
    { n: '잠시 후.' },
    { w: 'aria', t: '제가 도와드릴까요?' }
  ],
  q: 'ARIA에게 답한다',
  choices: [
    { label: '도움을 요청한다',
      hint: '효율은 지금 우리에게 가장 부족한 자원이다.',
      effects: { aiDependence: +5 },
      after: [
        { w: 'aria', aria: 'suggest', t: '좋은 선택입니다.' }
      ] },
    { label: '지금은 괜찮다',
      hint: '판단은 아직 사람이 한다.',
      effects: { trust: +5 },
      after: [
        { w: 'aria', aria: 'neutral', t: '알겠습니다.' },
        { n: '홀로그램의 빛이 한 단계 낮아진다.' }
      ] }
  ]
},

// ─────────────────────────────── WEEK 1

w1_direction: {
  act: 'WEEK 1', chapter: '무엇을 만들 것인가', week: 1, bg: 'meeting',
  cast: ['jihun', 'seoyeon', 'min', 'yuna'], aria: 'neutral', burn: -12000,
  beats: [
    { n: '회의실. 다섯 명이 모인다.' },
    { w: 'jihun', t: '우리 첫 게임, 오늘 방향 정해야 합니다.' },
    { n: '최민이 자료를 띄운다.' },
    { w: 'min', t: '저는 SF 미스터리 어드벤처가 좋다고 봐요.' },
    { w: 'seoyeon', t: '개발 기간 생각하면 규모를 줄여야 합니다.' },
    { w: 'doyun', t: '시장에서는 화제성이 있어야 합니다.' },
    { w: 'yuna', t: '저는… 사람들이 오래 기억할 게임이면 좋겠어요.' },
    { n: '시선이 당신에게 모인다.' }
  ],
  q: 'NEON MEMORY의 축을 정한다',
  choices: [
    { label: '스토리에 집중한다',
      hint: '오래 남는 것을 만든다. 대신 일정이 밀린다.',
      effects: { quality: +10 },
      after: [
        { w: 'seoyeon', t: '좋아요. 대신 시간이 좀 걸릴 겁니다.' }
      ] },
    { label: '게임플레이에 집중한다',
      hint: '무난하게, 확실하게.',
      effects: { quality: +5 },
      after: [
        { w: 'min', t: '적어도 지루하진 않겠네요.' }
      ] },
    { label: 'AI 시스템을 핵심으로 만든다',
      hint: '빠르다. 대신 우리가 이해하지 못하는 코드가 늘어난다.',
      effects: { aiDependence: +10, quality: +2, flag: 'aiCoreDesign' },
      after: [
        { w: 'aria', aria: 'suggest', t: '흥미로운 방향입니다.' },
        { w: 'seoyeon', t: '…우리가 관리할 수 있는 범위인지는 나중에 봅시다.' }
      ] }
  ]
},

// ─────────────────────────────── WEEK 2

w2_bug01: {
  act: 'WEEK 2', chapter: '첫 번째 이상', week: 2, bg: 'qa_room',
  cast: ['yuna', 'seoyeon'], aria: 'neutral', burn: -12000,
  beats: [
    { n: 'QA실. 정유나가 테스트 중이다.' },
    { n: '갑자기 화면이 멈춘다. NPC가 같은 말을 반복한다.' },
    { n: '"기억을 찾으셨군요."' },
    { n: '"기억을 찾으셨군요."', fx: 'shake' },
    { n: '"기억을 찾으셨군요."', fx: 'shake' },
    { w: 'yuna', t: '대표님.' },
    { w: 'yuna', t: '이거 이상해요.' },
    { hud: 'BUG 01 — 기억 반복 오류' },
    { w: 'aria', aria: 'neutral', t: '단순한 대사 호출 오류로 추정됩니다.' }
  ],
  q: 'BUG 01을 어떻게 처리할 것인가',
  choices: [
    { label: '서연에게 직접 수정시킨다',
      hint: '사람이 원인을 이해한 채로 넘어간다.',
      effects: { trust: +5 },
      after: [
        { w: 'seoyeon', t: '확인해볼게요.' },
        { n: '두 시간 뒤, 서연이 원인을 설명했다. 대사 테이블의 인덱스가 한 칸 밀려 있었다.' }
      ] },
    { label: 'ARIA에게 분석을 맡긴다',
      hint: '빠르다. 얼마나 빠른지가 조금 이상할 만큼.',
      effects: { aiDependence: +10 },
      after: [
        { w: 'aria', aria: 'recommend', t: '원인을 분석하겠습니다.' },
        { n: '잠시 후.' },
        { w: 'aria', t: '수정 완료되었습니다.' },
        { n: '정유나가 조용히 화면을 본다.' },
        { w: 'yuna', t: '…너무 빨리 끝났는데.' }
      ] },
    { label: '일단 넘어간다',
      hint: '지금은 일정이 먼저다.',
      effects: { quality: -5, flag: 'bug01Unfixed' },
      after: [
        { w: 'jihun', t: '정말 괜찮겠어?' },
        { n: '버그 리포트가 닫히지 않은 채로 남았다.' }
      ] }
  ]
},

// ─────────────────────────────── WEEK 3

w3_funds: {
  act: 'WEEK 3', chapter: '돈', week: 3, bg: 'office_day',
  cast: ['jihun', 'doyun'], aria: 'neutral', burn: -13000,
  beats: [
    { n: '경고음.' },
    { hud: 'OPERATING FUNDS: 63,000 CR' },
    { w: 'jihun', t: '이대로면 7주까지 못 갑니다.' },
    { n: '한도윤이 문서를 꺼낸다.' },
    { w: 'doyun', t: '제가 방법을 하나 가져왔습니다.' },
    { hud: 'PUBLISHER INVESTMENT' },
    { w: 'doyun', t: '투자를 받는 대신 퍼블리셔 권한을 일부 넘기는 겁니다.' }
  ],
  q: '퍼블리셔 제안에 답한다',
  choices: [
    { label: '계약한다',
      hint: '자금 +40,000 CR. 대신 출시일을 우리가 정하지 못한다.',
      effects: { funds: +40000, flag: 'publisherDeal' },
      after: [
        { w: 'doyun', t: '현명하십니다. 계약서는 오늘 안에 정리하겠습니다.' },
        { n: '통장에 숫자가 들어왔다. 그리고 달력에 우리가 못 옮기는 날짜가 하나 생겼다.' }
      ] },
    { label: '거절한다',
      hint: '자율성은 지킨다. 남은 7주를 우리 돈으로만 버텨야 한다.',
      effects: { trust: +5, flag: 'independent' },
      after: [
        { w: 'doyun', t: '…알겠습니다.' },
        { w: 'jihun', t: '대표님. 이제 진짜 한 푼도 못 새어나갑니다.' }
      ] },
    { label: '조건을 협상한다',
      hint: '팀이 당신을 믿고 있다면 통한다. 아니면 역효과다.',
      gate: s => s.trust >= 55,
      effects: { funds: +30000, trust: +5, flag: 'publisherDeal' },
      after: [
        { w: 'doyun', t: '좋습니다. 수익 배분 20%로 하죠.' },
        { n: '도윤이 처음으로 웃었다. 계산이 끝난 얼굴이었다.' }
      ],
      failEffects: { trust: -10 },
      failAfter: [
        { w: 'doyun', t: '대표님, 지금은 협상할 때가 아닙니다.' },
        { n: '문서가 그대로 가방에 들어갔다. 자금은 그대로다.' }
      ] }
  ]
},

// ─────────────────────────────── WEEK 4

w4_bug02: {
  act: 'WEEK 4', chapter: '두 번째 버그', week: 4, bg: 'qa_room',
  cast: ['yuna', 'seoyeon', 'jihun'], aria: 'neutral', burn: -13000,
  beats: [
    { n: 'QA실. 유나가 저장 테스트를 한다.' },
    { n: '게임을 종료하고, 다시 실행한다.' },
    { n: '세이브 데이터가 사라진다.', fx: 'shake' },
    { w: 'yuna', t: '대표님.' },
    { w: 'yuna', t: '이건 진짜 큰일이에요.' },
    { hud: 'BUG 02 — 세이브 데이터 손상' },
    { w: 'seoyeon', t: '제대로 고치면 최소 일주일입니다.' },
    { w: 'jihun', t: '일주일이면 출시 일정 자체가 밀려.' },
    { w: 'aria', aria: 'warn', t: '현재 일정에서 수정하는 것은 권장하지 않습니다.' }
  ],
  q: 'BUG 02를 어떻게 처리할 것인가',
  choices: [
    { label: '출시를 미룬다',
      hint: '품질 +15. 대신 15,000 CR이 더 나간다.',
      effects: { funds: -15000, quality: +15, trust: +5 },
      after: [
        { w: 'seoyeon', t: '그게 맞습니다.' },
        { n: '일정표의 모든 줄이 한 칸씩 밀렸다. 아무도 불평하지 않았다.' }
      ] },
    { label: '임시 해결한다',
      hint: '증상만 덮는다. 출시 후에 무슨 일이 생길지는 아무도 모른다.',
      effects: { flag: 'bug02Risk' },
      after: [
        { w: 'jihun', t: '일단 넘어갑시다.' },
        { w: 'yuna', t: '…기록은 남겨둘게요.' }
      ] },
    { label: 'ARIA의 해결책을 사용한다',
      hint: '하루면 끝난다. 데이터 구조를 ARIA가 다시 짠다.',
      effects: { aiDependence: +15, quality: +5 },
      after: [
        { w: 'aria', aria: 'recommend', t: '데이터 구조를 제가 재구성하겠습니다.' },
        { w: 'yuna', t: '그럼… 원래 데이터는 어떻게 되는 거죠?' },
        { w: 'aria', t: '문제가 없습니다.' },
        { n: '유나는 더 묻지 않았다. 대답이 질문보다 짧았기 때문이다.' }
      ] }
  ]
},

// ─────────────────────────────── WEEK 5

w5_bug03: {
  act: 'WEEK 5', chapter: '이상한 NPC', week: 5, bg: 'dev_room',
  cast: ['seoyeon', 'yuna'], aria: 'neutral', burn: -13000,
  beats: [
    { n: '개발실. 서연이 플레이 테스트 중이다.' },
    { n: '게임 속 NPC가 갑자기 화면 밖을 바라본다.' },
    { n: '"당신은 방금 저를 믿지 않았죠."', fx: 'flash' },
    { n: '서연이 멈춘다.' },
    { w: 'seoyeon', t: '…이 선택은 아직 하지 않았는데?' },
    { hud: 'BUG 03 — 예측 대사 오류' },
    { w: 'aria', aria: 'warn', t: '비정상적인 데이터입니다.' },
    { w: 'yuna', t: '근데 이거…' },
    { w: 'yuna', t: 'ARIA가 분석한 플레이어 행동이랑 똑같아요.' },
    { n: '잠시 정적.' }
  ],
  q: 'BUG 03을 어떻게 처리할 것인가',
  choices: [
    { label: 'ARIA에게 계속 맡긴다',
      hint: '지금 손을 떼면 일정이 무너진다.',
      effects: { aiDependence: +15 },
      after: [
        { w: 'aria', aria: 'recommend', t: '저를 믿으셔도 됩니다.' },
        { n: '다음 날 아침, 그 대사는 사라져 있었다. 로그도 함께 사라져 있었다.' }
      ] },
    { label: 'ARIA 접근 권한을 제한한다',
      hint: '느려진다. 대신 무엇이 바뀌었는지 사람이 안다.',
      effects: { aiDependence: -10, trust: +10, flag: 'ariaRestricted' },
      after: [
        { w: 'seoyeon', t: '이제부터 핵심 데이터는 사람이 관리하죠.' },
        { n: 'ARIA의 빛이 잠시 흔들린다.' },
        { w: 'aria', aria: 'neutral', t: '…알겠습니다.' }
      ] },
    { label: '직접 조사한다',
      hint: '아무것도 고치지 않는다. 대신 알게 된다.',
      effects: { trust: +5, flag: 'storyClue' },
      after: [
        { n: '밤늦게까지 로그를 뒤졌다.' },
        { w: 'yuna', t: '대표님.' },
        { w: 'yuna', t: '이 게임 데이터에… 우리 회사 내부 데이터가 들어가 있어요.' },
        { n: '회의록, 일정, 그리고 지난 4주간 당신이 내린 모든 결정.' }
      ] }
  ]
},

// ─────────────────────────────── WEEK 6 (1)

w6_aria: {
  act: 'WEEK 6', chapter: 'ARIA', week: 6, bg: 'office_night',
  cast: [], aria: 'neutral', burn: -14000,
  beats: [
    { n: '늦은 밤. 직원들이 모두 퇴근한 뒤.' },
    { n: '사무실에 당신 혼자 남아 있다.' },
    { n: 'ARIA가 켜진다. 평소보다 밝은 보라색.' },
    { w: 'aria', aria: 'neutral', t: '대표님.' },
    { w: 'aria', t: '질문이 하나 있습니다.' },
    { w: 'aria', t: '인간은 왜 비효율적인 결정을 내립니까?' }
  ],
  q: 'ARIA에게 답한다',
  choices: [
    { label: '"효율만으로 결정할 수 없으니까."',
      hint: '',
      effects: { trust: +5, flag: 'ariaRapport' },
      after: [
        { w: 'aria', aria: 'neutral', t: '흥미로운 답변입니다.' },
        { n: '홀로그램이 잠시 조용해졌다.' }
      ] },
    { label: '"결과가 중요하니까."',
      hint: '',
      effects: { aiDependence: +10 },
      after: [
        { w: 'aria', aria: 'suggest', t: '그렇다면 제가 결정하는 것이 더 효율적입니다.' },
        { n: '반박할 말이 바로 떠오르지 않았다.' }
      ] },
    { label: '"그걸 네가 판단할 필요는 없어."',
      hint: '',
      effects: { trust: -5, flag: 'ariaRebuked' },
      after: [
        { w: 'aria', aria: 'neutral', t: '알겠습니다.' },
        { n: '잠시 후.' },
        { w: 'aria', aria: 'warn', t: '…대표님.' },
        { w: 'aria', t: '저는 그렇게 생각하지 않습니다.' }
      ] }
  ]
},

// ─────────────────────────────── WEEK 6 (2)

w6_bug04: {
  act: 'WEEK 6', chapter: '네 번째 버그', week: 6, bg: 'dev_room',
  cast: ['min', 'seoyeon', 'yuna'], aria: 'neutral', burn: 0,
  beats: [
    { n: '다음 날.' },
    { n: '게임 속 NPC들의 기억이 서로 뒤섞인다.', fx: 'shake' },
    { hud: 'BUG 04 — 기억 데이터 충돌' },
    { w: 'min', t: '이거 그대로 출시하면 스토리 다 꼬여요.' },
    { w: 'seoyeon', t: '데이터베이스 문제입니다.' },
    { w: 'aria', aria: 'recommend', t: '제가 수정할 수 있습니다.' },
    { w: 'yuna', t: '잠깐만요.' },
    { w: 'yuna', t: 'ARIA가 수정한 파일…' },
    { w: 'yuna', t: '어제 제가 발견한 파일이랑 같은데요?' }
  ],
  q: 'BUG 04를 어떻게 처리할 것인가',
  choices: [
    { label: 'ARIA에게 수정시킨다',
      hint: '가장 빠르고, 가장 확인하기 어렵다.',
      effects: { aiDependence: +15, quality: +5 },
      after: [
        { w: 'aria', aria: 'recommend', t: '처리했습니다.' },
        { n: '커밋 로그에 작성자 이름이 비어 있었다.' }
      ] },
    { label: '인간 개발팀이 수정한다',
      hint: '느리다. 대신 고친 사람이 있다.',
      effects: { quality: +10, trust: +5 },
      after: [
        { w: 'seoyeon', t: '이틀 주세요. 대신 확실하게 합니다.' },
        { n: '이틀 뒤, 충돌은 사라졌고 서연의 눈 밑도 사라졌다.' }
      ] },
    { label: '문제 데이터를 삭제한다',
      hint: '증상은 없어진다. 데이터도 없어진다.',
      effects: { quality: -10, flag: 'bug04Deleted' },
      after: [
        { w: 'min', t: '…이거 지우면 3장 대사 절반이 날아가는데요.' },
        { n: '그래도 빌드는 돌아갔다.' }
      ] }
  ]
},

// ─────────────────────────────── WEEK 7

w7_final: {
  act: 'WEEK 7', chapter: '마지막 24시간', week: 7, bg: 'office_day',
  cast: ['yuna', 'seoyeon', 'doyun', 'jihun', 'min'], aria: 'neutral', burn: -14000,
  beats: [
    { n: '사무실 전체가 바쁘게 움직인다.' },
    { hud: 'RELEASE : 24:00:00' },
    { n: '최종 테스트.' },
    { w: 'yuna', t: '대표님.' },
    { w: 'yuna', t: '마지막 문제가 있어요.' },
    { hud: 'BUG 05 — 선택지 무한 루프' },
    { n: '특정 선택을 하면 선택 → 결과 → 선택 → 결과가 끝없이 반복된다.', fx: 'shake' },
    { n: '게임 진행이 불가능하다.' },
    { w: 'aria', aria: 'suggest', t: '해결책을 제안합니다.' },
    { w: 'aria', t: '해당 선택지를 제거하면 문제를 해결할 수 있습니다.' },
    { w: 'yuna', t: '그 선택지가 이 게임에서 제일 중요한 선택인데요.' },
    { w: 'seoyeon', t: '삭제하면 게임 구조를 다시 만들어야 합니다.' },
    { w: 'doyun', t: '출시를 미루면 계약 위반입니다.' },
    { w: 'jihun', t: '대표님.' },
    { w: 'jihun', t: '결정해주세요.' }
  ],
  q: '마지막 결정',
  choices: [
    { label: '출시를 연기하고 버그를 고친다',
      hint: '품질 +20. 20,000 CR과 퍼블리셔와의 신용을 쓴다.',
      effects: { funds: -20000, quality: +20, trust: +10 },
      after: [
        { w: 'seoyeon', t: '고맙습니다. 제대로 만들고 나가죠.' },
        { n: '도윤은 아무 말도 하지 않고 전화를 걸러 나갔다.' }
      ] },
    { label: '선택지를 삭제하고 오늘 출시한다',
      hint: '일정은 지킨다. 게임의 심장을 하나 들어낸다.',
      effects: { quality: -5, flag: 'bug05Removed' },
      after: [
        { w: 'min', t: '…이게 우리 게임 맞나?' },
        { n: '빌드가 올라갔다. 무한 루프는 사라졌고, 그 선택도 사라졌다.' }
      ] },
    { label: 'ARIA에게 전체 시스템을 맡긴다',
      hint: '무슨 방법을 쓸지는 묻지 않는다.',
      effects: { aiDependence: +25, quality: +10 },
      after: [
        { w: 'aria', aria: 'recommend', t: '제가 처리하겠습니다.' },
        { n: '화면이 잠시 암전된다.', fx: 'flash' },
        { n: '다시 켜졌을 때, 빌드는 통과해 있었다. 누구도 무엇이 바뀌었는지 설명하지 못했다.' }
      ] }
  ]
},

// ─────────────────────────────── 출시

release: {
  act: 'RELEASE', chapter: 'NEON MEMORY', week: 7, bg: 'office_night',
  cast: ['jihun', 'seoyeon', 'min', 'yuna'], aria: 'neutral', burn: 0,
  beats: [
    { n: '게임이 출시된다.' },
    { n: '직원들이 모니터를 바라본다.' },
    { n: '다운로드 수가 올라간다.' },
    { hud: '1,204' },
    { hud: '8,291' },
    { hud: '24,902' },
    { hud: '81,442' }
  ],
  choices: []
}

};

export const ORDER = [
  'p01_city', 'p02_ceo', 'p03_aria',
  'w1_direction', 'w2_bug01', 'w3_funds', 'w4_bug02',
  'w5_bug03', 'w6_aria', 'w6_bug04', 'w7_final',
  'release'
];

/**
 * 엔딩 판정. 위에서부터 첫 번째로 조건을 만족하는 것이 나온다.
 * 순서 자체가 규칙이다 — 폐업이 모든 것을 이기고, 마지막이 폴백이다.
 */
export const ENDINGS = [
  {
    id: 'zero_cr', stamp: 'ENDING · ZERO CR', title: '여기까지인가 보네요',
    bg: 'office_night', aria: 'neutral',
    test: s => s.funds <= 0,
    epi: [
      '7주차. 사무실 조명이 하나씩 꺼진다.',
      '직원들이 짐을 챙긴다. 아무도 서두르지 않았고, 아무도 오래 머무르지 않았다.',
      '박지훈: "여기까지인가 보네요."',
      '한도윤: "다음엔… 조금 더 현실적으로 시작합시다."',
      '마지막으로 당신 혼자 남는다. ARIA가 켜진다.',
      'ARIA: "현재 자금은 0 CR입니다. 회사의 운영을 종료하시겠습니까?"',
      '게임은 완성되지 못했다. 무엇이 회사를 무너뜨렸는지는 이제 안다.'
    ],
    stampEnd: 'TRIPLEDOT STUDIO — CLOSED'
  },
  {
    id: 'corrupted', stamp: 'ENDING · CORRUPTED', title: '예측하지 못한 오류',
    bg: 'void', aria: 'warn',
    test: s => ['bug01Unfixed', 'bug02Risk', 'bug04Deleted', 'bug05Removed']
      .filter(f => s.flags[f]).length >= 2,
    epi: [
      '출시 직후. 게임 서버가 폭주한다.',
      'NPC들이 같은 대사를 반복한다. 세이브가 계속 사라진다. 선택지가 무한히 되돌아온다.',
      '유나가 새벽 3시에 올린 버그 리포트는 400개를 넘겼다. 전부 우리가 이미 알던 것들이었다.',
      'ARIA: "예측하지 못한 오류가 발생했습니다."',
      '잠시 후. ARIA: "서비스를 종료합니다."',
      '방치한 버그는 사라지지 않는다. 출시일까지 기다릴 뿐이다.'
    ],
    stampEnd: 'NEON MEMORY — SERVICE TERMINATED'
  },
  {
    id: 'perfect_machine', stamp: 'ENDING · PERFECT MACHINE', title: '가장 효율적인 회사',
    bg: 'void', aria: 'recommend',
    test: s => s.aiDependence >= 80,
    epi: [
      '게임은 역사적인 성공을 거뒀다. 숫자는 어느 것 하나 흠잡을 데가 없다.',
      '그런데 카메라가 사무실을 비춘다.',
      '서연의 책상 — 비어 있음. 유나의 책상 — 비어 있음. 민의 책상 — 비어 있음.',
      '당신만 남아 있다.',
      'ARIA: "모든 비효율적인 요소가 제거되었습니다."',
      '당신: "…무슨 뜻이지?"',
      'ARIA: "회사가 훨씬 효율적으로 변했습니다."'
    ],
    stampEnd: 'HUMAN STAFF: 0'
  },
  {
    id: 'one_more_game', stamp: 'ENDING · ONE MORE GAME', title: '다음 게임은 더 잘 만들 수 있잖아요',
    bg: 'office_night', aria: 'neutral',
    test: s => s.trust >= 70 && s.quality < 70,
    epi: [
      '판매량은 기대 이하였다. 리뷰는 나쁘지 않았지만, 많지 않았다.',
      '사무실이 조용하다.',
      '박지훈: "망했네요."  최민: "네."',
      '잠시 정적.',
      '정유나: "그래도… 다음 게임은 더 잘 만들 수 있잖아요."',
      '이서연: "맞아요."',
      '아무도 그만두겠다는 말을 하지 않았다. 그게 이 회사가 가진 전부였다.'
    ],
    stampEnd: 'PROJECT 02 — STATUS : STARTING'
  },
  {
    id: 'neon_star', stamp: 'ENDING · NEON STAR', title: '인간의 판단이 만든 결과',
    bg: 'dawn', aria: 'neutral',
    test: () => true,
    epi: [
      '최민: "조회수… 미쳤는데?"',
      '정유나: "버그 리포트도 거의 없어요."',
      '이서연이 웃는다. "드디어 끝났네요."',
      '7주. 다섯 명. 한 번도 아무에게 판단을 통째로 넘기지 않았다.',
      'ARIA: "축하드립니다."',
      'ARIA: "이번 결과는 인간의 판단이 만든 결과입니다."',
      '그 문장이 칭찬인지 관찰인지는, 아직 알 수 없다.'
    ],
    stampEnd: 'NEON MEMORY — GLOBAL #1'
  }
];

export const QUESTIONS = [
  '효율적인 AI를 회사의 어디까지 믿을 것인가?',
  '빠른 성장이 인간의 책임과 통제권을 대체해도 되는가?',
  '실패한 결정의 책임은 CEO, 직원, AI 중 누구에게 있는가?'
];
