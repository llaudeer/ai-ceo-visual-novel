/**
 * ARIA 4상태 컬러 토큰.
 *
 * 상태가 바뀌면 이 토큰 하나가 다음을 동시에 지배한다:
 * 구체 발광 / 궤도링 / 포인트 라이트 / 바닥 반사 / 말풍선 테두리 / HUD 액센트.
 *
 * 기준: 이미지 정보 폴더/KakaoTalk_Photo_2026-08-10-14-15-58.png 의 4분할.
 *   hex  본색 — 텍스트와 테두리
 *   glow 밝은 쪽 — 발광과 하이라이트
 *   dim  어두운 쪽 — 그림자와 배경 틴트
 */
export const ARIA_STATES = ['neutral', 'suggest', 'recommend', 'warn'];

function toRgb(hex) {
  return [
    parseInt(hex.slice(1, 3), 16) / 255,
    parseInt(hex.slice(3, 5), 16) / 255,
    parseInt(hex.slice(5, 7), 16) / 255
  ];
}

function tone(key, label, hex, glow, dim) {
  return { key, label, hex, glow, dim, rgb: toRgb(hex) };
}

export const THEME = {
  neutral:   tone('neutral',   null,             '#A855F7', '#D8B4FE', '#5B21B6'),
  suggest:   tone('suggest',   'ARIA 제안',      '#22C55E', '#86EFAC', '#15803D'),
  recommend: tone('recommend', 'ARIA 추천',      '#3B82F6', '#93C5FD', '#1D4ED8'),
  warn:      tone('warn',      'ARIA 비추천 ⚠',  '#EF4444', '#FCA5A5', '#B91C1C')
};

export function getTone(state) {
  const t = THEME[state];
  if (!t) throw new Error(`알 수 없는 ARIA 상태: ${state}`);
  return t;
}

/** HUD 루트에 CSS 변수를 심는다. 모든 패널이 var(--aria-hex)를 참조한다. */
export function applyToneVars(el, state) {
  const t = getTone(state);
  el.style.setProperty('--aria-hex', t.hex);
  el.style.setProperty('--aria-glow', t.glow);
  el.style.setProperty('--aria-dim', t.dim);
}
