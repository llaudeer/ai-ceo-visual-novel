import { ORDER } from './story.data.js';

/**
 * 《ARIA : 7 WEEKS》 상태값.
 *
 * 대본이 요구하는 변수는 넷뿐이다. 화면에 숫자를 늘리지 않기 위해
 * 이전 판(원화 7스탯)에서 의도적으로 축소했다. PROJECT_BIBLE.md 7절 참조.
 *
 *   funds         자금(CR). 0 이하로 떨어지면 즉시 폐업 엔딩.
 *   trust         팀 신뢰. 사람의 판단을 택할수록 오른다.
 *   quality       게임 품질. 출시 성적을 가른다.
 *   aiDependence  AI 의존도. ARIA에게 맡길수록 오른다.
 *
 * max가 있으면 0..max로 clamp 된다. funds는 clamp하지 않는다 —
 * 음수가 되어야 ZERO CR 엔딩을 판정할 수 있기 때문이다.
 */
export const STATS = [
  { key: 'funds',        label: '자금',     unit: 'CR' },
  { key: 'trust',        label: '팀 신뢰',  max: 100 },
  { key: 'quality',      label: '품질',     max: 100 },
  { key: 'aiDependence', label: 'AI 의존',  max: 100 }
];

/**
 * 화면에 상시 노출하는 스탯.
 * 자금과 AI 의존도만 띄운다. 나머지는 결과로 체감하게 둔다.
 */
export const HUD_STATS = ['funds', 'aiDependence'];

/** 방치하면 서비스가 무너지는 버그. 이 플래그가 2개 이상이면 CORRUPTED 엔딩. */
export const CRITICAL_BUG_FLAGS = ['bug01Unfixed', 'bug02Risk', 'bug04Deleted', 'bug05Removed'];

export function initialState() {
  return {
    funds: 100000,
    trust: 50,
    quality: 50,
    aiDependence: 0,
    sceneId: ORDER[0],
    flags: {},
    history: [],
    week: 0
  };
}

/** 방치된 치명적 버그 수. 엔딩 판정의 입력이다. */
export function criticalBugs(state) {
  return CRITICAL_BUG_FLAGS.filter(f => state.flags[f]).length;
}

/**
 * 상태 전이는 이 순수 함수 하나로만 일어난다.
 * 원본을 변경하지 않고 새 객체를 반환한다.
 *
 * effects.flag 는 문자열 하나 또는 문자열 배열을 받는다.
 */
export function applyEffects(state, effects) {
  const n = { ...state, flags: { ...state.flags }, history: [...state.history] };
  for (const k in (effects || {})) {
    if (k === 'flag') {
      for (const f of [].concat(effects.flag)) n.flags[f] = true;
      continue;
    }
    if (!(k in n) || typeof effects[k] !== 'number') continue;
    n[k] += effects[k];
  }
  for (const m of STATS) {
    if (m.max == null || typeof n[m.key] !== 'number') continue;
    n[m.key] = Math.max(0, Math.min(m.max, n[m.key]));
  }
  return n;
}

/** 특정 플래그가 서 있으면 선택지의 효과가 달라진다. */
export function resolveEffects(state, choice) {
  const fx = { ...choice.effects };
  if (choice.mod && state.flags[choice.mod.flag]) {
    for (const k in choice.mod.effects) {
      if (k === 'flag') {
        fx.flag = [].concat(fx.flag ?? [], choice.mod.effects.flag);
        continue;
      }
      fx[k] = (fx[k] || 0) + choice.mod.effects[k];
    }
  }
  return fx;
}

/**
 * 선택지가 조건부로 성공/실패하는 경우(WEEK 3 협상 등).
 * gate를 통과하지 못하면 fail 쪽 효과와 대사를 쓴다.
 */
export function resolveBranch(state, choice) {
  if (!choice.gate) return { effects: resolveEffects(state, choice), after: choice.after ?? [], passed: true };
  const passed = choice.gate(state);
  if (passed) return { effects: resolveEffects(state, choice), after: choice.after ?? [], passed: true };
  return { effects: choice.failEffects ?? {}, after: choice.failAfter ?? [], passed: false };
}

/** 위에서부터 첫 번째로 조건을 만족하는 엔딩. 마지막 엔딩이 폴백 역할을 한다. */
export function pickEnding(state, endings) {
  const hit = endings.find(e => e.test(state));
  if (!hit) throw new Error('조건을 만족하는 엔딩이 없다 — 폴백 엔딩이 누락되었다');
  return hit;
}
