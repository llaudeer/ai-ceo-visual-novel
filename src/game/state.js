import { ORDER } from './story.data.js';

/**
 * 상태값 정의. PROJECT_BIBLE.md 7절을 따른다.
 * max가 있으면 0..max로 clamp 된다. money는 원화로 표기한다.
 */
export const STATS = [
  { key: 'cash',           label: '자금',    money: true },
  { key: 'aiDependence',   label: 'AI 의존', max: 100 },
  { key: 'trust',          label: '신뢰',    max: 100 },
  { key: 'morale',         label: '사기',    max: 100 },
  { key: 'revenue',        label: '월 매출', money: true },
  { key: 'reputation',     label: '평판',    max: 100 },
  { key: 'productQuality', label: '품질',    max: 100 }
];

/**
 * 화면에 상시 노출하는 스탯. 나머지는 메뉴 독의 '기록'에서 본다.
 * 화면을 숫자로 채우지 않기 위한 선택이다.
 */
export const HUD_STATS = ['cash', 'aiDependence'];

export function initialState() {
  return {
    cash: 2000000,
    revenue: 0,
    trust: 50,
    morale: 60,
    aiDependence: 0,
    reputation: 30,
    productQuality: 40,
    sceneId: ORDER[0],
    flags: {},
    history: [],
    week: 1
  };
}

/**
 * 상태 전이는 이 순수 함수 하나로만 일어난다.
 * 원본을 변경하지 않고 새 객체를 반환한다.
 */
export function applyEffects(state, effects) {
  const n = { ...state, flags: { ...state.flags }, history: [...state.history] };
  for (const k in (effects || {})) {
    if (k === 'flag') { n.flags[effects.flag] = true; continue; }
    if (!(k in n) || typeof effects[k] !== 'number') continue;
    n[k] += effects[k];
  }
  for (const m of STATS) {
    if (m.max != null) n[m.key] = Math.max(0, Math.min(m.max, n[m.key]));
  }
  n.revenue = Math.max(0, n.revenue);
  return n;
}

/** 특정 플래그가 서 있으면 선택지의 효과가 달라진다. */
export function resolveEffects(state, choice) {
  const fx = { ...choice.effects };
  if (choice.mod && state.flags[choice.mod.flag]) {
    for (const k in choice.mod.effects) {
      if (k === 'flag') { fx.flag = choice.mod.effects.flag; continue; }
      fx[k] = (fx[k] || 0) + choice.mod.effects[k];
    }
  }
  return fx;
}

/** 위에서부터 첫 번째로 조건을 만족하는 엔딩. 마지막 엔딩이 폴백 역할을 한다. */
export function pickEnding(state, endings) {
  const hit = endings.find(e => e.test(state));
  if (!hit) throw new Error('조건을 만족하는 엔딩이 없다 — 폴백 엔딩이 누락되었다');
  return hit;
}
