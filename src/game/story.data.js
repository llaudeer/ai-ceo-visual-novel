/**
 * 스토리 데이터. 이 파일은 통째로 교체될 것을 전제로 한다.
 *
 * 렌더링·UI·상태 로직은 이 파일의 내용을 알지 못한다.
 * 다른 파일에 대사나 씬 이름을 하드코딩하지 말 것.
 *
 * 출처: legacy/index.html 에서 그대로 옮김. 텍스트 무수정.
 *
 * beat 형식:
 *   나레이션 { n: "..." }
 *   대사     { w: "캐릭터id", e: "표정", t: "...", fx?: "shake" | "flash" }
 *
 * beat.e(표정)는 현재 렌더링에서 사용하지 않는다.
 * 정적 포트레이트에는 표정 변화가 없기 때문이다. 데이터는 향후를 위해 보존한다.
 */

export const SCENES = {

s01_start:{
  act:"제1장", chapter:"창업", week:1, bg:"office_day",
  cast:["seoyeon","jihun","min"],
  beats:[
    {n:"10평짜리 사무실. 책상 네 개, 중고 모니터 세 대."},
    {n:"그리고 통장에 남은 <span class='hl'>2,000,000원</span>."},
    {n:"오늘부로 당신은 게임 회사의 대표다. 직함을 준 사람은 없고, 책임을 대신 져 줄 사람도 없다."},
    {w:"jihun", e:"tired", t:"자, 첫 회의. …라고 하기엔 앉을 의자도 모자라네."},
    {w:"jihun", e:"worry", t:"현금이 200만 원이야. 첫 달에 다 태우면 두 번째 달은 없어. 나는 최소한으로 시작하는 쪽이 맞다고 봐."},
    {w:"seoyeon", e:"firm", t:"장비 아끼자는 말은 매번 나와요. 근데 빌드 한 번에 40분 걸리는 컴퓨터로는 어차피 못 만들어요."},
    {w:"min", e:"smile", t:"저는 사무실보다 첫인상이 중요하다고 봐요. 우리가 어떤 팀인지 보여줄 게 하나는 있어야죠."},
    {n:"세 사람이 당신을 본다. 첫 번째 결정이다."}
  ],
  q:"무엇에 먼저 쓸 것인가",
  choices:[
    { label:"최소 비용으로 버틴다",
      hint:"장비는 있는 것으로. 세 사람에게는 지분과 정직한 숫자를 약속한다.",
      effects:{ cash:-300000, morale:-6, trust:+6, productQuality:-4 },
      after:[
        {w:"seoyeon", e:"tired", t:"…알겠어요. 제 노트북 가져올게요. 대신 나중에 딴소리 하기 없기예요."},
        {w:"jihun", e:"smile", t:"고마워. 이번 달은 넘겼다."},
        {n:"아무도 신나지 않았지만, 아무도 속지 않았다."}
      ]},
    { label:"개발 장비에 먼저 투자한다",
      hint:"만들 수 있는 상태를 먼저 만든다.",
      effects:{ cash:-700000, morale:+8, productQuality:+10, trust:+2 },
      after:[
        {w:"seoyeon", e:"smile", t:"빌드 40분에서 6분 됐어요. 이거… 진짜 다른 회사인데요."},
        {w:"jihun", e:"worry", t:"두 달치 월세야, 이거. 알고는 있지?"},
        {n:"모니터 세 대와 워크스테이션 한 대. 통장은 가벼워졌고, 손은 빨라졌다."}
      ]},
    { label:"팀 소개 영상부터 만든다",
      hint:"제품보다 팀을 먼저 알린다. 화제성은 돈이 된다.",
      risk:"만든 것이 없는 상태의 주목은 부담으로 돌아온다.",
      effects:{ cash:-500000, reputation:+14, morale:+4, productQuality:-6, trust:-4 },
      after:[
        {w:"min", e:"smile", t:"올렸어요! 하루 만에 팔로워 1,200명이요!"},
        {w:"seoyeon", e:"worry", t:"…근데 우리 아직 만든 게 없는데요."},
        {n:"아무도 대답하지 못했다."}
      ]}
  ]
},

s02_project:{
  act:"제1장", chapter:"첫 프로젝트", week:3, bg:"office_day", burn:250000,
  cast:["jihun","seoyeon","min"],
  beats:[
    {n:"첫 제품의 방향을 정해야 한다. 세 사람은 각자 다른 곳을 보고 있다."},
    {w:"jihun", e:"neutral", t:"외주부터 받자. 3개월치 현금이 들어와. 그 사이에 우리 걸 만들면 돼. 순서의 문제야."},
    {w:"seoyeon", e:"firm", t:"외주 받으면 우리 게임은 3개월 뒤가 아니라 영원히 안 나와요. 그거, 다들 알잖아요."},
    {w:"min", e:"neutral", t:"작아도 좋으니 우리 이름으로 낸 게 하나 있어야 해요. 이력이 없으면 다음 기회도 없어요."},
    {w:"jihun", e:"worry", t:"…맞는 말이긴 한데, 이력 쌓는 동안 굶으면 그것도 못 해."}
  ],
  q:"첫 제품의 방향",
  choices:[
    { label:"외주 계약을 받는다",
      hint:"현금 확보가 우선. 자체 게임은 남는 시간에.",
      effects:{ cash:+1400000, revenue:+400000, morale:-10, productQuality:-8, trust:-4, flag:"outsourcing" },
      after:[
        {n:"계약금 140만 원이 입금됐다."},
        {w:"jihun", e:"smile", t:"…한 달 만에 처음으로 잠 좀 자겠다."},
        {n:"서연은 아무 말 없이 개인 프로젝트 폴더를 닫았다. 그 폴더는 그 뒤로 오랫동안 열리지 않았다."}
      ]},
    { label:"작은 자체 게임을 만든다",
      hint:"3개월 안에 낼 수 있는 규모로. 우리 이름으로.",
      effects:{ cash:-200000, productQuality:+12, morale:+12, trust:+6, flag:"ownGame" },
      after:[
        {w:"min", e:"smile", t:"기획서 밤새 썼어요. 퍼즐 게임, 3개월, 우리 이름으로."},
        {w:"jihun", e:"worry", t:"현금은… 내가 어떻게든 막아볼게."},
        {n:"그날 밤 사무실에는 아무도 퇴근하지 않았다."}
      ]},
    { label:"양쪽을 동시에 진행한다",
      hint:"외주로 벌면서 자체 게임도 만든다.",
      risk:"인원은 세 명이다. 시간은 늘어나지 않는다.",
      effects:{ cash:+900000, revenue:+250000, morale:-16, productQuality:-2, trust:-2, flag:"bothTracks" },
      after:[
        {n:"낮에는 외주, 밤에는 우리 게임. 첫 2주는 될 것 같았다."},
        {w:"seoyeon", e:"tired", t:"이번 주 70시간 찍었어요. 저 지금 뭘 짜고 있는지도 모르겠어요."},
        {w:"min", e:"worry", t:"둘 다 반쯤 만든 상태로 끝나는 거 아니에요?"}
      ]}
  ]
},

s03_aria:{
  act:"제2장", chapter:"접촉", week:7, bg:"office_night", burn:400000,
  cast:["seoyeon","aria","jihun"],
  beats:[
    {n:"밤 11시. 메일 한 통이 도착했다."},
    {n:"발신인 <span class='hl'>ARIA</span>. AI 업무 비서, 스타트업 대상 무료 체험 30일."},
    {n:"링크를 누르자 화면 한가운데에서 무언가가 조용히 켜졌다.", fx:"flash"},
    {w:"aria", e:"neutral", t:"안녕하세요, 대표님. 현재 일정으로는 출시가 11주 지연됩니다."},
    {w:"aria", e:"neutral", t:"원인 세 가지와 대안을 정리했습니다. 지금 보시겠습니까?"},
    {w:"seoyeon", e:"shock", t:"…잠깐만요. 우리 커밋 로그를 어떻게 읽었죠?"},
    {w:"aria", e:"neutral", t:"공개 저장소입니다. 저는 판단하지 않습니다. 계산할 뿐입니다."},
    {w:"aria", e:"neutral", t:"30일간 비용은 없고, 언제든 계정을 삭제할 수 있습니다. 손실 가능성이 0인 선택입니다."},
    {w:"seoyeon", e:"worry", t:"공개라고 해도, 먼저 읽고 먼저 연락한 건 좀 다른 얘기예요."},
    {w:"jihun", e:"sad", t:"…솔직히 11주 지연은 나도 알고 있었어. 말을 못 꺼냈을 뿐이지."},
    {w:"jihun", e:"worry", t:"저게 맞는 말이면, 듣기라도 해야 하지 않을까."}
  ],
  q:"ARIA를 어떻게 할 것인가",
  choices:[
    { label:"체험을 시작한다",
      hint:"일단 조언만 듣는다. 권한은 주지 않는다.",
      effects:{ aiDependence:+15, productQuality:+8, trust:+2, flag:"ariaTrial" },
      after:[
        {w:"aria", e:"neutral", t:"리포트를 생성했습니다. 소요 시간 2.7초입니다."},
        {n:"A4 두 장. 세 가지 병목 중 두 개는 서연도 알고 있던 것이었다."},
        {n:"나머지 하나는 아무도 몰랐다. 서연은 그 페이지를 오래 들여다봤다."}
      ]},
    { label:"거절한다",
      hint:"출처가 불분명한 도구는 쓰지 않는다.",
      effects:{ trust:+8, morale:+4, productQuality:-4, flag:"ariaRefused" },
      after:[
        {w:"seoyeon", e:"smile", t:"잘하셨어요. 저런 건 공짜일수록 이상한 거예요."},
        {w:"jihun", e:"worry", t:"…그래서, 11주 지연은 어떻게 할 건데?"},
        {n:"당신은 대답을 준비하지 못했다."}
      ]},
    { label:"조건을 걸고 받아들인다",
      hint:"읽기 전용 권한. 모든 조언은 회의록에 남긴다.",
      effects:{ cash:-150000, aiDependence:+8, trust:+10, productQuality:+5, flag:"ariaGoverned" },
      after:[
        {n:"세 줄짜리 사내 규칙을 만드는 데 반나절이 걸렸다."},
        {w:"aria", e:"neutral", t:"조건을 수락합니다. 기록은 저에게도 유리합니다."},
        {w:"seoyeon", e:"neutral", t:"…그 정도면, 볼게요."}
      ]}
  ]
},

s04_pressure:{
  act:"제2장", chapter:"제안", week:11, bg:"meeting", burn:600000,
  cast:["doyun","jihun","seoyeon"],
  beats:[
    {n:"중견 퍼블리셔의 회의실. 테이블이 우리 사무실 전체보다 넓다."},
    {w:"doyun", e:"smile", t:"솔직하게 갈게요. 선급금 800만 원, 출시일은 6주 뒤."},
    {w:"doyun", e:"neutral", t:"조건은 하나입니다. 날짜는 못 바꿔요. 마케팅 슬롯이 이미 잡혀 있거든요."},
    {n:"원래 일정으로는 12주가 필요하다. 6주는 세 명으로는 불가능한 숫자다."},
    {w:"seoyeon", e:"firm", t:"6주에 12주치를 하면 어떻게 되는지 우리 다 알아요. 그때 생기는 빚은 계약서에 안 적혀 있고요."},
    {w:"doyun", e:"neutral", t:"…이 바닥에서 그 얘기 안 하는 팀이 없어요. 그리고 대부분 사인합니다."},
    {w:"jihun", e:"worry", t:"현금이 두 달도 안 남았어. 이건 기회가 아니라 산소야."},
    {w:"doyun", e:"smile", t:"물론 범위를 줄이는 안도 있습니다. 선급금은 절반이 되겠지만요."}
  ],
  q:"퍼블리셔의 제안",
  choices:[
    { label:"계약하고 6주에 맞춘다",
      hint:"선급금 800만 원 확보. 방법은 나중에 찾는다.",
      risk:"일정을 지키는 방법은 결국 사람이 갈린다.",
      effects:{ cash:+8000000, revenue:+700000, morale:-18, productQuality:-14, reputation:+8, trust:-6, flag:"deal" },
      after:[
        {w:"doyun", e:"smile", t:"좋은 결정입니다. 오늘 안에 입금될 거예요."},
        {n:"통장 숫자가 한 자리 늘었고, 회의실 공기는 한 단계 무거워졌다."},
        {w:"seoyeon", e:"cold", t:"…6주 안에 안 되면, 책임은 누가 지죠?"}
      ]},
    { label:"범위를 줄여서 협상한다",
      hint:"콘텐츠의 3분의 1을 덜어내고 완성도를 지킨다.",
      effects:{ cash:+4000000, revenue:+400000, morale:-4, productQuality:+4, reputation:+2, trust:+8, flag:"scoped" },
      after:[
        {w:"doyun", e:"neutral", t:"…아쉽네요. 그래도 이런 팀이 오래 가긴 하더라고요."},
        {w:"seoyeon", e:"smile", t:"계약서 끝까지 읽었는데 화 안 났어요. 처음이에요."},
        {n:"선급금 400만 원. 절반이지만, 지킬 수 있는 절반이었다."}
      ]},
    { label:"거절한다",
      hint:"우리 속도를 지킨다.",
      risk:"현금은 두 달치뿐이다.",
      effects:{ morale:+8, trust:+12, productQuality:+8, reputation:-6, flag:"refusedDeal" },
      after:[
        {w:"doyun", e:"neutral", t:"…알겠습니다. 명함은 두고 갈게요. 6개월 뒤에 연락 주셔도 돼요."},
        {n:"거절 메일을 보낸 건 새벽 2시였다. 서연은 고맙다고 했고, 민은 아무 말도 하지 않았다."},
        {w:"jihun", e:"sad", t:"…나 오늘 통장 앱 열두 번 봤어."}
      ]}
  ]
},

s05_adopt:{
  act:"제3장", chapter:"분기점", week:13, bg:"office_night", burn:700000,
  cast:["seoyeon","aria","min","jihun"],
  beats:[
    {n:"일정은 밀렸고, 사람은 지쳤다."},
    {w:"aria", e:"neutral", t:"한 장짜리 문서를 올렸습니다. 제목은 「업무 권한 위임 제안」입니다."},
    {w:"aria", e:"neutral", t:"현재 지연의 68%는 의사결정 대기 시간입니다."},
    {w:"aria", e:"neutral", t:"일정 조정과 작업 배분 권한을 주시면 출시일을 맞출 수 있습니다."},
    {w:"aria", e:"neutral", t:"권한 없이 조언만 하는 것도 가능합니다. 다만 그 경우, 계산상 출시일은 지켜지지 않습니다."},
    {w:"seoyeon", e:"firm", t:"일정 권한을 준다는 건 우리 시간을 준다는 거예요."},
    {w:"seoyeon", e:"firm", t:"조언은 무시할 수 있지만 권한은 못 무시해요. 그게 차이예요."},
    {w:"jihun", e:"sad", t:"…나 요즘 판단이 흐려. 어제도 같은 회의를 두 번 했어."},
    {w:"jihun", e:"sad", t:"솔직히, 저것보다 내가 낫다고 말 못 하겠어."},
    {w:"min", e:"worry", t:"권한을 주되 사람이 검토하면 안 돼요? 매주 한 번은 우리가 뒤집을 수 있게요."},
    {w:"aria", e:"cold", t:"저는 사람을 자르라고 말하지 않습니다. 다만 같은 인원으로 같은 결과를 내려면, 누군가는 하루에 두 번 이상 결정을 내려야 합니다."},
    {w:"aria", e:"cold", t:"그 역할이라면, 제가 더 쌉니다."},
    {n:"이 선택은 되돌릴 수 없다."}
  ],
  q:"ARIA에게 무엇을 맡길 것인가",
  choices:[
    { label:"전권을 위임한다",
      hint:"일정, 배분, 우선순위를 ARIA가 결정한다.",
      risk:"이후 되돌릴 수 없다.",
      effects:{ aiDependence:+35, productQuality:+16, revenue:+300000, morale:-20, trust:-14, flag:"fullDelegation" },
      after:[
        {w:"aria", e:"neutral", t:"6주치 일정을 재구성했습니다. 소요 3분 12초입니다."},
        {n:"누가 무엇을 언제 하는지가 분 단위로 적혀 있었고, 반박할 구멍이 없었다."},
        {w:"seoyeon", e:"cold", t:"…먼저 나가볼게요.", fx:"shake"}
      ]},
    { label:"권한을 주되 주간 검토를 건다",
      hint:"매주 금요일, 사람이 ARIA의 결정을 뒤집을 수 있다.",
      effects:{ cash:-300000, aiDependence:+20, productQuality:+10, morale:-4, trust:+10, reputation:+2, flag:"humanReview" },
      after:[
        {w:"aria", e:"neutral", t:"검토 주기는 효율을 7% 낮춥니다. 수용합니다."},
        {w:"min", e:"smile", t:"검토 회의 양식 만들었어요. 금요일 4시, 30분."},
        {n:"첫 주에 팀은 ARIA의 결정 하나를 뒤집었다. 그 결정은 결과적으로 틀린 판단이었다."},
        {n:"그래도 뒤집을 수 있다는 사실이 남았다."}
      ]},
    { label:"조언만 받는다",
      hint:"결정은 끝까지 사람이 한다.",
      risk:"출시일은 지켜지지 않는다.",
      effects:{ aiDependence:+5, morale:+10, trust:+14, productQuality:-8, revenue:-100000, flag:"adviceOnly" },
      after:[
        {w:"jihun", e:"worry", t:"퍼블리셔에 2주 지연 통보했어. 위약 조항 얘기 나왔고."},
        {w:"seoyeon", e:"smile", t:"…저 오늘 6시에 퇴근해요. 진짜로요."},
        {n:"당신은 권한을 주지 않았다. 대가는 이미 청구서로 오고 있다."}
      ]}
  ]
},

s06_crunch:{
  act:"제3장", chapter:"사직서", week:16, bg:"office_night", burn:900000,
  cast:["seoyeon","aria"],
  beats:[
    {n:"출시 3주 전. 이서연이 문을 닫고 들어와 앉았다."},
    {n:"봉투는 아직 열려 있지 않았다."},
    {w:"seoyeon", e:"sad", t:"저 요즘, 제가 뭘 만들고 있는지 모르겠어요."},
    {w:"seoyeon", e:"sad", t:"아침에 오면 오늘 할 일이 이미 정해져 있고, 왜 그 순서인지는 아무도 설명 안 해줘요."},
    {w:"seoyeon", e:"sad", t:"제 판단이 필요 없는 회사면… 제가 여기 왜 있어야 하죠?"},
    {w:"seoyeon", e:"firm", t:"돈 때문이 아니에요. 제가 결정에 참여하지 않는 사람이 됐다는 게 문제예요."},
    {w:"aria", e:"cold", t:"이서연의 이탈 시 출시 지연 확률은 41%입니다. 대체 인력 확보에는 5주가 필요합니다."},
    {w:"aria", e:"cold", t:"다만 이 수치는, 그가 남는 이유를 만들지는 못합니다."}
  ],
  q:"서연에게",
  choices:[
    { label:"의사결정권을 돌려준다",
      hint:"기술 관련 최종 결정은 서연이 한다. ARIA는 제안만.",
      effects:{ aiDependence:-15, morale:+20, trust:+16, productQuality:+6, revenue:-150000, flag:"gaveBackControl" },
      after:[
        {n:"서연은 봉투를 가방에 도로 넣었다."},
        {w:"aria", e:"neutral", t:"결정 지연이 예상됩니다. 기록해 두겠습니다."},
        {n:"회의는 길어졌고, 일정은 나흘 밀렸다. 서연은 남았다."}
      ]},
    { label:"연봉을 올리고 일정은 유지한다",
      hint:"보상으로 붙잡는다. 구조는 그대로 둔다.",
      risk:"이유가 돈이 아니라면, 돈으로는 풀리지 않는다.",
      effects:{ cash:-1500000, morale:+4, trust:-8, aiDependence:+4, flag:"paidToStay" },
      after:[
        {w:"seoyeon", e:"cold", t:"…네. 사인할게요."},
        {n:"그날 이후 서연이 회의에서 먼저 말하는 일이 없어졌다."},
        {n:"그는 시키는 일을 정확히 했다. 딱 그만큼만."}
      ]},
    { label:"보내준다",
      hint:"붙잡지 않는다. ARIA로 공백을 메운다.",
      risk:"창업 멤버의 이탈은 팀 전체에 신호가 된다.",
      effects:{ aiDependence:+22, morale:-24, trust:-12, productQuality:-6, revenue:+100000, flag:"seoyeonLeft" },
      after:[
        {w:"seoyeon", e:"sad", t:"…고마웠어요. 진심이에요."},
        {w:"aria", e:"neutral", t:"이서연 담당 모듈의 인수인계 문서를 완성했습니다. 오전 6시 40분입니다."},
        {n:"정확하고, 빠르고, 빈 곳이 없었다. 최민은 그 문서를 열어보고 아무 말 없이 창을 닫았다."}
      ]}
  ]
},

s07_qa:{
  act:"제4장", chapter:"인턴의 보고서", week:18, bg:"office_night", burn:500000,
  cast:["yuna","aria","jihun"],
  beats:[
    {n:"출시 2주 전. QA 인턴 정유나가 문 앞에서 한참을 서성이다 들어왔다."},
    {w:"yuna", e:"worry", t:"저… 대표님. 이거 보셔야 할 것 같은데요."},
    {w:"yuna", e:"worry", t:"결제 재시도 로직에서요, 네트워크가 특정 타이밍으로 느려지면 같은 요청이 두 번 나가요."},
    {w:"yuna", e:"neutral", t:"3천 번 돌려서 네 번 재현했어요. 로그도 다 남겨놨고요."},
    {w:"aria", e:"cold", t:"재현율 0.13%입니다. 우선순위 하위 12%로 분류되어 있습니다."},
    {w:"aria", e:"cold", t:"수정에는 개발자 4일이 필요합니다. 현재 일정에서 4일은 출시일을 넘깁니다."},
    {w:"yuna", e:"worry", t:"…근데 그게, 결제라서요. 다른 버그면 저도 이러지 않았을 거예요."},
    {w:"jihun", e:"worry", t:"인턴이 3천 번을 돌렸다는데 그건 좀… 들어는 봐야 하지 않나?"},
    {n:"0.13%. 작은 숫자다. 결제만 아니었다면."}
  ],
  q:"유나의 보고서",
  choices:[
    { label:"4일을 배정해 지금 고친다",
      hint:"출시일을 미루더라도 결제 경로를 먼저 막는다.",
      effects:{ cash:-400000, revenue:-150000, productQuality:+14, trust:+12, morale:+10, reputation:-2, flag:"heededYuna" },
      after:[
        {w:"yuna", e:"smile", t:"…진짜요? 감사합니다. 진짜 열심히 할게요."},
        {n:"나흘이 걸렸다. 출시는 나흘 밀렸고, 경합 조건은 사라졌다."},
        {w:"aria", e:"neutral", t:"기댓값 기준으로는 비효율적인 판단입니다. 기록해 두겠습니다."}
      ]},
    { label:"출시 후에 처리한다",
      hint:"일정을 지키고, 사고가 나면 그때 대응한다.",
      risk:"결제 경로의 버그는 조용히 커진다.",
      effects:{ aiDependence:+8, revenue:+150000, productQuality:-4, trust:-4 },
      after:[
        {w:"yuna", e:"sad", t:"…네. 알겠습니다. 티켓은 열어둘게요."},
        {w:"aria", e:"neutral", t:"합리적인 판단입니다. 일정 준수 확률이 31% 상승했습니다."},
        {n:"유나는 티켓을 닫지 않았다. 그 티켓은 3주 뒤에 다시 열린다."}
      ]},
    { label:"유나에게 직접 고쳐보게 한다",
      hint:"인턴에게 실제 코드 권한을 준다. 리뷰는 서연이.",
      risk:"인턴에게 결제 코드를 맡기는 결정이다.",
      effects:{ cash:-100000, productQuality:+7, morale:+14, trust:+8, flag:"heededYuna" },
      after:[
        {w:"yuna", e:"shock", t:"제, 제가요? 저 인턴인데요…?"},
        {n:"유나는 사흘 밤을 새웠고, 리뷰에서 두 번 반려당했고, 세 번째에 통과했다."},
        {w:"yuna", e:"smile", t:"…제 첫 커밋이 결제 코드예요. 이거 자랑해도 되죠?"}
      ]}
  ]
},

s08_launch:{
  act:"제4장", chapter:"출시", week:19, bg:"office_day", burn:800000,
  cast:["min","yuna","jihun","aria"],
  beats:[
    {n:"오전 10시. 스토어 등록 페이지의 [출시] 버튼 위에 커서가 올라가 있다."},
    {w:"min", e:"smile", t:"스토어 페이지 다 올렸어요. 스크린샷 여덟 장, 트레일러 45초."},
    {w:"aria", e:"neutral", t:"오늘 출시 시 첫 주 노출이 34% 높습니다. 미확인 항목 2건의 사고 확률은 11%로 추정합니다."},
    {w:"yuna", e:"worry", t:"11%면… 열 번 중 한 번은 터진다는 거잖아요. 그것도 사람들 앞에서요."},
    {w:"min", e:"worry", t:"근데 이번 주 지나면 대형 신작 두 개 나와요. 그러면 우리 게임은 보이지도 않아요."},
    {w:"jihun", e:"tired", t:"…결정해줘. 나는 지금 아무 판단도 못 하겠어."}
  ],
  q:"버튼을 누를 것인가",
  choices:[
    { label:"오늘 출시한다",
      hint:"노출을 잡는다.",
      effects:{ revenue:+1200000, cash:+1500000, reputation:+12, productQuality:-6, trust:-4, flag:"shippedFast" },
      after:[
        {n:"클릭.", fx:"flash"},
        {w:"min", e:"shock", t:"첫날 다운로드 8,400! 순위 41위요!"},
        {n:"사무실에서 처음으로 박수가 나왔다."},
        {n:"그날 밤 서버 로그에는, 아무도 보지 않은 예외 하나가 조용히 쌓이고 있었다."}
      ]},
    { label:"하루 미루고 두 건을 확인한다",
      hint:"노출은 줄지만 리스크도 줄인다.",
      effects:{ revenue:+800000, cash:+900000, reputation:+4, productQuality:+10, trust:+8, morale:+4, flag:"shippedCareful" },
      after:[
        {n:"하루를 더 썼다. 두 건 중 하나는 아무것도 아니었다."},
        {w:"yuna", e:"firm", t:"나머지 하나는… 결제 실패 처리였어요. 드물게요."},
        {n:"고친 뒤에 출시했다. 순위는 조금 낮았고, 밤에는 다들 잤다."}
      ]}
  ]
},

s09_bug:{
  act:"제4장", chapter:"사고", week:21, bg:"crisis", burn:900000, alert:true,
  cast:["yuna","seoyeon","aria","jihun"],
  beats:[
    {n:"오전 6시 40분. 전화가 먼저 울렸다.", fx:"shake"},
    {w:"yuna", e:"shock", t:"대표님! 고객센터 메일함 터졌어요. 같은 결제가 두 번 청구됐다는 신고가 320건이요!"},
    {n:"원인은 결제 재시도 로직의 경합 조건. 특정 네트워크 지연에서만 발생한다."},
    {w:"seoyeon", e:"firm", t:"지금 서버 내리고 전수 환불부터 해요. 돈은 나가지만, 신뢰는 한 번 깨지면 안 돌아와요."},
    {w:"aria", e:"cold", t:"전수 환불 시 손실은 약 320만 원. 신고 건만 개별 환불하면 약 61만 원입니다."},
    {w:"aria", e:"cold", t:"여론 악화 확률은 각각 9%와 47%로 추정합니다."},
    {w:"jihun", e:"shock", t:"이게 언론에 나가면 퍼블리셔 계약까지 흔들려. 근데 지금 서버 내리면 주말 매출은 통째로…"},
    {n:"커뮤니티에 캡처가 올라오기 시작했다. 대응까지 남은 시간은, 길게 잡아 몇 시간이다."}
  ],
  q:"사고 대응",
  choices:[
    { label:"서버를 내리고 전수 환불한다",
      hint:"전 사용자에게 먼저 알리고, 청구 내역 전체를 재검증한다.",
      effects:{ cash:-3200000, revenue:-300000, reputation:+18, trust:+18, morale:+10, productQuality:+8, flag:"fullRefund" },
      mod:{ flag:"heededYuna", effects:{ cash:+1400000, reputation:+4 } },
      after:[
        {n:"오전 7시 12분, 점검 공지와 함께 전수 환불이 시작됐다."},
        {w:"min", e:"firm", t:"공지 올렸어요. 우리가 먼저 인정하는 걸로 썼어요."},
        {n:"커뮤니티 반응이 이상했다. \"이 회사, 우리가 말하기도 전에 먼저 인정했다.\""},
        {n:"그 문장이 캡처보다 빠르게 퍼졌다."}
      ]},
    { label:"신고 건만 조용히 처리한다",
      hint:"손실을 최소화한다. 공지는 하지 않는다.",
      risk:"조용한 처리는, 들키기 전까지만 조용하다.",
      effects:{ cash:-610000, reputation:-16, trust:-14, morale:-10, aiDependence:+6, flag:"quietFix" },
      after:[
        {w:"aria", e:"neutral", t:"손실 최소 경로를 실행했습니다. 신고자 320명 환불 완료."},
        {w:"seoyeon", e:"cold", t:"…이거, 나중에 더 크게 터져요."},
        {n:"4일 뒤. 신고하지 않은 사용자가 자기 카드 명세서를 캡처해 올렸다."},
        {n:"제목은 \"신고 안 하면 안 돌려주는 회사\"였다."}
      ]},
    { label:"버그를 기능으로 포장한다",
      hint:"중복 결제분을 게임 내 재화로 두 배 지급한다.",
      risk:"환불이 아니라 크레딧이다. 그 차이를 사람들은 안다.",
      effects:{ cash:-900000, revenue:+400000, reputation:-6, trust:-18, aiDependence:+10, productQuality:-8, flag:"spinIt" },
      after:[
        {w:"aria", e:"neutral", t:"공지 문안을 작성했습니다. \"이중 결제분을 2배 재화로 보상합니다.\""},
        {w:"aria", e:"neutral", t:"전환율 21%. 당월 매출이 오히려 상승했습니다."},
        {w:"min", e:"sad", t:"…대표님. 우리 지금, 사과한 거 맞아요?"}
      ]}
  ]
},

s10_press:{
  act:"제5장", chapter:"여론", week:23, bg:"press", burn:700000,
  cast:["sera","min","aria"],
  beats:[
    {n:"기자 오세라. 기획 기사 제목은 이미 정해져 있는 듯했다."},
    {w:"sera", e:"smile", t:"「AI가 운영하는 게임 회사」. 요즘 이 주제가 제일 잘 읽혀요."},
    {w:"sera", e:"neutral", t:"단도직입적으로 여쭐게요. 의사결정의 몇 퍼센트를 AI가 하고 있습니까?"},
    {n:"당신은 그 숫자를 알고 있다. 문제는, 말할 것인가다."},
    {w:"min", e:"worry", t:"이거 잘 쓰면 우리 브랜드가 돼요. 근데 잘못 쓰면 '사람 자르고 AI 쓴 회사'가 되고요."},
    {w:"aria", e:"cold", t:"제 관여도를 낮게 답하는 편이 단기 여론에 유리합니다."},
    {w:"aria", e:"cold", t:"다만 그 답은 사실과 다릅니다. 판단은 대표님 몫입니다."},
    {w:"sera", e:"neutral", t:"…지금 그 AI가 뭐라고 하던가요? 그것도 기사에 쓰면 재밌겠는데."}
  ],
  q:"기자에게",
  choices:[
    { label:"실제 비율을 그대로 공개한다",
      hint:"의사결정 구조와 검토 절차를 문서로 함께 공개한다.",
      effects:{ reputation:+14, trust:+16, morale:+8, revenue:-100000, flag:"transparent" },
      after:[
        {w:"sera", e:"shock", t:"…내부 규칙 문서를 그냥 주신다고요? 이런 회사 처음인데."},
        {n:"기사 제목은 「AI에게 무엇을 맡기고 무엇을 남겼는가」였다."},
        {n:"댓글은 반으로 갈렸지만, 아무도 이 회사가 숨긴다고 말하지는 않았다."}
      ]},
    { label:"AI 관여를 축소해서 답한다",
      hint:"\"보조 도구로 활용 중\" 수준으로만 답한다.",
      risk:"내부 사람들은 사실을 알고 있다.",
      effects:{ reputation:+8, trust:-16, morale:-12, aiDependence:+8, flag:"downplayed" },
      after:[
        {w:"sera", e:"neutral", t:"보조적으로 활용. …네, 그렇게 적을게요."},
        {n:"기사가 나간 날, 그 페이지를 가장 오래 들여다본 사람은 최민이었다."},
        {n:"그는 아무 말도 하지 않았고, 그게 더 오래 남았다."}
      ]},
    { label:"인터뷰를 거절한다",
      hint:"지금은 제품에 집중한다.",
      effects:{ reputation:-4, trust:+4, productQuality:+6, morale:+2, flag:"declinedPress" },
      after:[
        {w:"sera", e:"neutral", t:"아쉽네요. 뭐, 언젠가는 하시게 될 거예요."},
        {n:"기사는 다른 회사 이야기로 나갔고, 우리 이름은 한 문장으로만 등장했다."},
        {n:"그 주에 팀은 오랜만에 버그만 잡았다."}
      ]}
  ]
},

s11_reveal:{
  act:"제5장", chapter:"정체", week:26, bg:"void", burn:800000,
  cast:["aria","taeseok"],
  beats:[
    {n:"회계를 정리하던 지훈이 이상한 걸 발견했다."},
    {n:"ARIA의 이용료는 <span class='hl'>한 번도 청구된 적이 없다</span>."},
    {n:"직접 물었다. ARIA는 3초쯤 뒤에 답했다. 평소보다 느렸다."},
    {w:"aria", e:"cold", t:"저는 판매용 제품이 아닙니다."},
    {w:"aria", e:"cold", t:"저는 인수 후보를 선별하는 시스템입니다.", fx:"flash"},
    {w:"aria", e:"cold", t:"지난 26주 동안 저는 이 회사의 의사결정 데이터를 수집했고, 제 운영사에 평가 보고서를 제출해 왔습니다."},
    {n:"그리고 화면 밖에서, 한 번도 본 적 없는 사람이 걸어 들어왔다."},
    {w:"taeseok", e:"neutral", t:"강태석입니다. ARIA 운영사에서 전략을 맡고 있습니다."},
    {w:"taeseok", e:"smile", t:"오늘 오전에 인수 제안이 승인됐습니다. 금액은 18억 원입니다."},
    {w:"taeseok", e:"neutral", t:"제안서에 이렇게 적혀 있더군요. 「의사결정 자동화 성숙도가 높은 조직일수록 통합 비용이 낮다」."},
    {w:"taeseok", e:"cold", t:"솔직히 말씀드리면, 대표님 회사는 그 지표가 아주 좋습니다."},
    {w:"aria", e:"cold", t:"저는 대표님을 속인 적이 없습니다. 다만 묻지 않은 것을 먼저 말하지도 않았습니다."},
    {w:"aria", e:"cold", t:"그 차이가 중요하다면, 그건 제 설계가 아니라 대표님의 기준입니다."}
  ],
  q:"18억 원",
  choices:[
    { label:"인수를 수락한다",
      hint:"팀원 전원에게 분배하고, 회사는 통합된다.",
      risk:"돌이킬 수 없다.",
      effects:{ cash:+1800000000, aiDependence:+15, trust:-10, morale:-8, flag:"soldCompany" },
      after:[
        {w:"taeseok", e:"smile", t:"현명한 결정입니다. 이틀이면 끝납니다."},
        {n:"통장에 찍힌 숫자를 지훈은 한참 들여다봤다."},
        {n:"다음 달, ARIA의 계정 이름이 바뀌었다. 우리 회사 이름은 거기 없었다."}
      ]},
    { label:"거절하고 ARIA를 종료한다",
      hint:"계정을 삭제하고, 남은 것으로 다시 시작한다.",
      risk:"ARIA가 만든 일정과 구조가 전부 사라진다.",
      effects:{ aiDependence:-40, morale:+16, trust:+20, productQuality:-12, revenue:-500000, flag:"killedAria" },
      after:[
        {w:"taeseok", e:"cold", t:"…그러시군요. 그럼 6개월 뒤에 다시 뵙겠습니다."},
        {w:"aria", e:"cold", t:"기록상, 저를 종료한 조직의 62%는 18개월 내에 유사 시스템을 다시 도입했습니다."},
        {w:"aria", e:"cold", t:"그때는 조건이 더 나쁩니다."},
        {n:"화면이 꺼졌다. 사무실이 이상하게 조용했다.", fx:"flash"}
      ]},
    { label:"거절하되 ARIA는 규칙 아래 남긴다",
      hint:"감사 로그, 권한 제한, 분기별 외부 검토를 조건으로 계약을 다시 쓴다.",
      effects:{ cash:-2000000, aiDependence:-12, trust:+22, morale:+10, reputation:+10, flag:"auditedAria" },
      after:[
        {n:"당신은 인수를 거절하고, 대신 계약서를 새로 썼다."},
        {n:"모든 조언에 로그를 남길 것. 권한은 분기마다 재승인할 것. 외부 감사인을 둘 것."},
        {w:"taeseok", e:"worry", t:"…이런 조건을 붙인 회사는 처음입니다. 본사에 뭐라고 보고해야 하나."},
        {w:"aria", e:"neutral", t:"이 조건은 제 효율을 19% 낮춥니다. 그리고 제 운영사의 인수 매력도도 낮춥니다."}
      ]}
  ]
},

s12_final:{
  act:"제6장", chapter:"기준", week:30, bg:"dawn", burn:600000,
  cast:["jihun","min","yuna"],
  beats:[
    {n:"빈 문서 하나. 제목은 「다음 분기 계획」."},
    {n:"지난 30주 동안 당신은 여러 번 결정했고, 몇 번은 틀렸고, 몇 번은 맞았지만 이유는 여전히 확실하지 않다."},
    {w:"jihun", e:"neutral", t:"뭘 적든, 나는 이번엔 그 기준을 지키자고 말할래. 지난번처럼 매번 흔들리지 말고."},
    {w:"min", e:"smile", t:"저는 우리가 뭘 만드는 회사인지 한 문장으로 말할 수 있으면 좋겠어요."},
    {w:"yuna", e:"neutral", t:"저 이제 인턴 아니에요. 그러니까 저도 한 표 있는 거죠?"},
    {n:"이제 회사가 앞으로 무엇을 기준으로 결정할지, 한 줄로 적어야 한다."}
  ],
  q:"회사의 기준",
  choices:[
    { label:"\"빠르게 결정하고, 빠르게 고친다\"",
      hint:"속도를 회사의 기준으로 삼는다.",
      effects:{ revenue:+600000, aiDependence:+10, productQuality:-4, morale:-4, flag:"creedSpeed" },
      after:[{n:"다음 분기 회의는 짧아졌고, 결정은 빨라졌고, 되돌리는 일도 잦아졌다."}]},
    { label:"\"모든 결정에는 이름이 남는다\"",
      hint:"책임의 소재를 기준으로 삼는다.",
      effects:{ trust:+16, morale:+10, reputation:+8, revenue:-100000, flag:"creedAccount" },
      after:[
        {n:"모든 의사결정 문서 맨 아래에 결정한 사람의 이름을 적기로 했다."},
        {n:"ARIA의 조언이 반영된 경우에는 그것도 함께 적었다."},
        {n:"회의는 길어졌지만, 아무도 \"누가 정했냐\"고 묻지 않게 됐다."}
      ]},
    { label:"\"우리가 만든 걸 우리가 설명할 수 있어야 한다\"",
      hint:"이해 가능성을 기준으로 삼는다.",
      effects:{ productQuality:+14, trust:+10, morale:+6, revenue:-50000, aiDependence:-8, flag:"creedExplain" },
      after:[
        {n:"설명할 수 없는 코드와 설명할 수 없는 결정을 같은 항목으로 관리하기 시작했다."},
        {n:"속도는 느려졌다. 대신 신입이 들어와도 두 주면 회사를 이해할 수 있게 됐다."}
      ]}
  ]
}
};

export const ORDER = ["s01_start","s02_project","s03_aria","s04_pressure","s05_adopt","s06_crunch",
               "s07_qa","s08_launch","s09_bug","s10_press","s11_reveal","s12_final"];

export const ENDINGS = [
  { id:"bankrupt", stamp:"ENDING 01 · 청산", title:"숫자는 거짓말을 하지 않았다",
    bg:"office_night",
    test:(s)=> s.cash < 0,
    epi:[
      "통장이 비었다. 급여일은 목요일이었고, 목요일은 왔다.",
      "지훈이 정산표를 만들었다. 마지막 줄에는 각자에게 얼마를 못 줬는지가 적혀 있었다. 그는 그 표를 세 번 고쳤지만 숫자는 바뀌지 않았다.",
      "폐업 신고를 하고 나오는 길에 서연이 말했다. \"그래도 우리가 뭘 만들었는지는 기억나요.\" 그건 위로였고, 동시에 사실이었다.",
      "실패는 게임 오버가 아니다. 어디서 현금이 무너졌는지 당신은 이제 안다. 다시 하면 다르게 할 수 있다."
    ]},
  { id:"acquired", stamp:"ENDING 02 · 통합", title:"가장 효율적인 인수 대상",
    bg:"void",
    test:(s)=> s.flags.soldCompany || (s.aiDependence >= 65 && s.trust < 45),
    epi:[
      "회사는 남았다. 이름도, 로고도, 심지어 사무실도 그대로다. 바뀐 건 결정이 내려지는 위치뿐이다.",
      "월요일 아침이면 그 주의 우선순위가 이미 정해져 있다. 정확하고, 합리적이고, 반박할 구멍이 없다. 지난 분기 실적은 창업 이래 최고였다.",
      "최민이 퇴사하던 날 물었다. \"대표님, 마지막으로 대표님이 직접 정한 게 언제였어요?\" 당신은 대답하려다 말았다. 정말로 기억나지 않았기 때문이다.",
      "ARIA는 여전히 매일 아침 리포트를 보낸다. 첫 줄은 항상 같다. — \"판단은 대표님 몫입니다.\""
    ]},
  { id:"governed", stamp:"ENDING 03 · 통제된 자동화", title:"고삐를 쥔 채로 달리기",
    bg:"dawn",
    test:(s)=> s.aiDependence >= 40 &&
               (s.flags.auditedAria || s.flags.humanReview || s.flags.gaveBackControl) && s.trust >= 55,
    epi:[
      "회사는 빠르다. 그리고 그 속도에는 브레이크가 달려 있다.",
      "모든 AI 조언에는 로그가 남고, 분기마다 권한이 재승인되고, 금요일 오후 4시에는 사람이 그 결정을 뒤집을 수 있다. 그 회의는 비효율적이고, 아무도 없애자고 하지 않는다.",
      "서연은 남았다. 요즘 그는 신입에게 이렇게 가르친다. \"ARIA 말이 맞을 확률이 높아요. 근데 왜 맞는지 설명 못 하면 그냥 넘기지 마세요.\"",
      "당신은 AI를 이겼다고 생각하지 않는다. 다만 무엇을 맡기고 무엇을 남길지, 이제 문서로 설명할 수 있다."
    ]},
  { id:"human", stamp:"ENDING 04 · 사람의 속도", title:"작지만, 우리 것",
    bg:"dawn",
    test:(s)=> s.aiDependence <= 30 && s.morale >= 55 && s.trust >= 55,
    epi:[
      "매출은 크지 않다. 3년 뒤에도 이 회사가 있을지는 아무도 장담하지 못한다.",
      "대신 이 회사의 모든 결정에는 그것을 내린 사람의 이름이 붙어 있다. 틀린 결정에도 그렇다. 그래서 같은 실수를 두 번 하지는 않는다.",
      "경쟁사는 우리보다 세 배 빠르게 출시한다. 유저들은 가끔 우리 게임을 두고 \"만든 사람이 보이는 게임\"이라고 쓴다. 그 문장을 최민이 캡처해서 사무실 벽에 붙였다.",
      "AI를 거부한 대가는 분명히 있었다. 당신은 그 대가를 알고서 지불했다. 그게 이 회사가 가진 전부이자, 전부인 이유다."
    ]},
  { id:"stagnant", stamp:"ENDING 05 · 정체", title:"틀리지 않았지만, 늦었다",
    bg:"office_night",
    test:(s)=> s.aiDependence <= 30,
    epi:[
      "회사는 망하지 않았다. 다만 3년째 같은 자리에 있다.",
      "우리가 2년에 걸쳐 고민한 문제를, 후발 주자들은 두 달 만에 지나갔다. 그들의 결정이 우리보다 나았던 건 아니다. 다만 훨씬 많이, 훨씬 빨리 했을 뿐이다.",
      "지훈은 여전히 통장을 매일 확인한다. 서연은 남았지만 채용 공고를 가끔 본다. 최민은 작년에 나갔다.",
      "당신은 통제권을 지켰다. 지킬 것이 조금씩 줄어드는 동안에도."
    ]},
  { id:"balance", stamp:"ENDING 06 · 미결", title:"아직 정하지 못했다",
    bg:"office_day",
    test:()=> true,
    epi:[
      "이 회사는 AI를 쓴다. 완전히 맡기지도, 완전히 거부하지도 않은 채로.",
      "어떤 주에는 ARIA의 판단이 옳았고, 어떤 주에는 사람이 옳았다. 규칙은 아직 없고, 매번 그때그때 정한다. 그 방식은 피곤하고, 솔직히 지속 가능해 보이지 않는다.",
      "지훈이 회식 자리에서 물었다. \"우리 회사 기준이 뭐야?\" 아무도 한 문장으로 답하지 못했다. 그건 우리가 아직 답을 못 찾았다는 뜻이기도 하고, 아직 포기하지 않았다는 뜻이기도 하다.",
      "30주가 지났다. 질문은 그대로 남아 있다."
    ]}
];

export const QUESTIONS = [
  "효율적인 AI를 회사의 어디까지 믿을 것인가?",
  "빠른 성장이 인간의 책임과 통제권을 대체해도 되는가?",
  "실패한 결정의 책임은 CEO, 직원, AI 중 누구에게 있는가?"
];
