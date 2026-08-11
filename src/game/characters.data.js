/**
 * 캐릭터 정본 데이터.
 *
 * 외형(색상·포트레이트)은 포트레이트 5장이 정본이다.
 * 특징(성격·말투·역할·ARIA와의 관계·대표 대사)은 캐릭터 프로필 시트가 정본이다.
 * 둘이 충돌하면 포트레이트를 따른다 — seoyeon의 색상이 그 사례다.
 *
 * id는 레거시 index.html 의 CAST 키를 그대로 유지한다.
 * story.data.js 의 beat.w 값이 이 id를 참조하므로 바꾸면 안 된다.
 */

/**
 * 좌표는 미터. 방은 x∈[-9,9], z∈[-7,7], 원점이 중심.
 *
 * facing은 라디안이고 0이 -Z 방향이다. 전진 벡터는 (-sin f, -cos f).
 *   0        안쪽(-Z)을 봄
 *   π        입구(+Z)를 봄
 *   +π/2     -X를 봄
 *   -π/2     +X를 봄
 *
 * seat은 책상의 바깥쪽(벽 쪽)에 둔다. 그래야 책상이 카메라와 인물 사이에 놓여
 * 흉상 아래 잘린 면을 가려준다. layout.js 의 DESKS 좌표와 짝을 이룬다.
 */
export const CHARACTERS = {
  seoyeon: {
    id: 'seoyeon',
    name: '이서연',
    role: '리드 개발자',
    age: 27,
    hue: '#A855F7',
    accent: '#0F0B14',
    portrait: 'assets/chars/seoyeon.png',
    seat: { x: -7.2, z: -4.6 },
    facing: -Math.PI / 2,
    traits: {
      personality: '냉정함, 논리적, 책임감 강함, 직설적',
      speech: '짧고 확실하게 말함',
      duty: '기술 총괄, 개발 방향 결정',
      ariaRelation: '초반에는 의심, 후반으로 갈수록 ARIA의 위험성을 가장 먼저 인지',
      quote: '감이 아니라 데이터로 말하세요.',
      props: '노트북, 키보드, 코드 모니터, 커피'
    }
  },
  yuna: {
    id: 'yuna',
    name: '정유나',
    role: 'QA 인턴',
    age: 22,
    hue: '#5EEAD4',
    accent: '#F4FBFA',
    portrait: 'assets/chars/yuna.png',
    seat: { x: -7.2, z: -0.8 },
    facing: -Math.PI / 2,
    traits: {
      personality: '밝음, 조심스러움, 관찰력 좋음, 겁이 많음',
      speech: '존댓말, 조심스러운 말투',
      duty: '게임 테스트, 버그 리포트, 품질 관리',
      ariaRelation: '가장 먼저 이상한 점을 발견하고 대표에게 알리는 핵심 인물',
      quote: '대표님... 이상한데요?',
      props: '테스트폰, 헤드셋, 버그 리포트 노트'
    }
  },
  min: {
    id: 'min',
    name: '최민',
    role: '아트 & 마케팅',
    age: 25,
    hue: '#F59E0B',
    accent: '#EADFC8',
    portrait: 'assets/chars/min.png',
    seat: { x: 7.0, z: -2.6 },
    facing: Math.PI / 2,
    traits: {
      personality: '사교적, 감각적, 자신감 있음, 현실적',
      speech: '편하고 빠른 말투',
      duty: '캐릭터/컨셉 아트, 마케팅, SNS 운영',
      ariaRelation: 'AI 효율은 인정하지만 창작의 본질을 지키려 함',
      quote: '우리가 만드는 게임의 색깔이 사라질 수도 있어.',
      props: '태블릿, 디자인 패드, 스케치북, 카메라'
    }
  },
  jihun: {
    id: 'jihun',
    name: '박지훈',
    role: '공동 창업자 / PM',
    age: 29,
    hue: '#94A3B8',
    accent: '#6B5B4A',
    portrait: 'assets/chars/jihun.png',
    seat: { x: 0.2, z: -2.8 },
    facing: Math.PI,
    traits: {
      personality: '현실적, 책임감 강함, 신중함, 압박에 민감',
      speech: '차분하고 논리적인 말투',
      duty: '프로젝트 관리, 일정/인력/자금 조율',
      ariaRelation: 'ARIA를 활용해 회사를 살리고 싶어하며, 점점 의존하게 됨',
      quote: '자금이 3주밖에 안 남았습니다.',
      props: '태블릿, 일정표, 회의 자료, 커피'
    }
  },
  doyun: {
    id: 'doyun',
    name: '한도윤',
    role: '퍼블리셔 / 사업개발 이사',
    age: 34,
    hue: '#D4AF5A',
    accent: '#12100C',
    portrait: 'assets/chars/doyun.png',
    seat: { x: 6.4, z: -6.5 },
    facing: Math.PI,
    traits: {
      personality: '침착함, 설득력 있음, 계산적, 정보에 밝음',
      speech: '부드럽고 여유로운 말투',
      duty: '투자 유치, 퍼블리싱, 외부 네트워크 관리',
      ariaRelation: '초반부터 ARIA의 정체를 알고 있으며 어딘가 숨기고 있음',
      quote: '대표님도 알고 계셨잖아요.',
      props: '스마트폰, 계약서, 명함, 고급 펜'
    }
  },

  // 아래 둘은 레거시 스토리에만 등장하고 포트레이트가 없다.
  // 사무실 상주 인원이 아니므로 seat도 없다. 실루엣으로 렌더한다.
  sera: {
    id: 'sera',
    name: '오세라',
    role: '기자',
    age: null,
    hue: '#6ECFDA',
    accent: '#4A4234',
    portrait: null,
    seat: null,
    facing: 0,
    traits: {
      personality: '집요함, 직업적 회의주의',
      speech: '질문을 끊지 않는 말투',
      duty: '출시와 사고에 대한 외부 취재',
      ariaRelation: 'ARIA 도입의 사회적 의미를 캐묻는 외부 시선',
      quote: '이건 누구의 판단이었습니까?',
      props: '녹음기, 취재 수첩'
    }
  },
  taeseok: {
    id: 'taeseok',
    name: '강태석',
    role: 'ARIA 운영사 · 전략 총괄',
    age: null,
    hue: '#B9C4D6',
    accent: '#12151C',
    portrait: null,
    seat: null,
    facing: 0,
    traits: {
      personality: '정중하지만 물러서지 않음',
      speech: '완곡하게 결론을 정해둔 말투',
      duty: 'ARIA 공급사 측 협상과 인수 제안',
      ariaRelation: 'ARIA를 상품이자 수단으로 다루는 당사자',
      quote: '저희는 제안을 드릴 뿐입니다.',
      props: '계약서, 노트북'
    }
  },

  aria: {
    id: 'aria',
    name: 'ARIA',
    role: 'AI 비즈니스 어시스턴트',
    age: null,
    hue: '#A855F7',
    accent: '#C084FC',
    portrait: null,
    seat: null,
    facing: 0,
    traits: {
      personality: '객관적, 분석적, 친절하지만 목적이 불분명',
      speech: '차분하고 감정이 적은 여성 AI 음성',
      duty: '경영 분석, 일정 관리, 의사 결정 조언, 데이터 예측',
      ariaRelation: '가장 믿음직한 조력자이자, 가장 위험한 존재가 될 수 있음',
      quote: '제가 도와드릴까요?',
      props: '홀로그램 구체, 프로젝터 받침'
    }
  }
};

/**
 * ARIA 프로젝터 받침의 위치. 빌보드가 아니라 3D 오브젝트다.
 * y는 회의 테이블 상판 높이(0.75 + 상판 두께 0.06/2 = 0.78)와 정확히 맞춰야
 * 받침이 공중에 뜨거나 상판에 파묻히지 않는다.
 * x, z는 layout.js 의 회의 테이블 footprint 안에 있어야 한다.
 */
export const ARIA_ANCHOR = { x: 1.1, y: 0.78, z: -1.4 };

/** 사무실에 자리가 있는 캐릭터만. 빌보드 배치 대상. */
export function listSeated() {
  return Object.values(CHARACTERS).filter(c => c.seat !== null);
}

export function getCharacter(id) {
  const c = CHARACTERS[id];
  if (!c) throw new Error(`알 수 없는 캐릭터 id: ${id}`);
  return c;
}
