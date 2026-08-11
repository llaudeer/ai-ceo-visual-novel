import { CHARACTERS } from '../game/characters.data.js';
import { STATS, HUD_STATS } from '../game/state.js';
import { applyToneVars } from './theme.js';

/**
 * 3D 위에 겹치는 DOM 레이어 전체.
 *
 * three.js를 모른다. flow.js도 모른다. main.js가 둘을 연결한다.
 * 루트(#hud)는 기본적으로 클릭을 통과시키고, 각 패널만 pointer-events를 되살린다.
 * 그래야 대사창이 떠 있어도 뒤의 사무실을 계속 걸어다닐 수 있다.
 *
 * 타이핑 중 클릭 = 전체 표시. 다 표시된 뒤 클릭 = 다음 beat.
 */

const TYPE_MS = 18;   // 글자당 타이핑 간격

export function createHud({ root, onAdvance, onChoose, onRestart }) {
  root.innerHTML = '';
  injectStyle();

  // ── 상단 좌: 막/주차
  const chapter = el('div', 'hud-chapter');
  root.appendChild(chapter);

  // ── 상단 우: 스탯
  const stats = el('div', 'hud-stats');
  root.appendChild(stats);
  const statEls = new Map();
  for (const key of HUD_STATS) {
    const def = STATS.find(s => s.key === key);
    const box = el('div', 'stat');
    const label = el('span', 'stat-label', def.label);
    const value = el('span', 'stat-value');
    box.append(label, value);
    stats.appendChild(box);
    statEls.set(key, value);
  }

  // ── 중앙: 큰 표시 한 줄 (FUNDS 100,000 CR / BUG 01 …)
  const banner = el('div', 'hud-banner');
  root.appendChild(banner);

  // ── 하단: 대사창
  const box = el('div', 'hud-box');
  const who = el('div', 'hud-who');
  const text = el('div', 'hud-text');
  const more = el('div', 'hud-more', '▼');
  box.append(who, text, more);
  root.appendChild(box);

  // ── 하단: 선택지
  const choiceWrap = el('div', 'hud-choices');
  const question = el('div', 'hud-q');
  const list = el('div', 'hud-list');
  choiceWrap.append(question, list);
  root.appendChild(choiceWrap);

  // ── 전체 화면 클릭 수집기. beat 모드에서만 켠다.
  const catcher = el('div', 'hud-catcher');
  root.appendChild(catcher);
  catcher.addEventListener('click', handleAdvance);

  // ── 엔딩
  const ending = el('div', 'hud-ending');
  root.appendChild(ending);

  addEventListener('keydown', e => {
    if (ending.classList.contains('on')) return;
    if (choiceWrap.classList.contains('on')) {
      const n = Number(e.key);
      if (n >= 1 && n <= list.children.length) list.children[n - 1].click();
      return;
    }
    if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); handleAdvance(); }
  });

  // ── 타이핑 상태
  let full = '';
  let typed = 0;
  let timer = null;

  function handleAdvance() {
    if (timer) { finishTyping(); return; }
    onAdvance();
  }

  function finishTyping() {
    clearInterval(timer);
    timer = null;
    typed = full.length;
    text.textContent = full;
    more.classList.add('on');
  }

  function type(str) {
    clearInterval(timer);
    full = str;
    typed = 0;
    text.textContent = '';
    more.classList.remove('on');
    timer = setInterval(() => {
      typed += 1;
      text.textContent = full.slice(0, typed);
      if (typed >= full.length) finishTyping();
    }, TYPE_MS);
  }

  let bannerTimer = null;

  const hud = {
    /** 씬이 바뀔 때. 막/주차 표시를 갱신한다. */
    showScene(scene) {
      chapter.innerHTML = '';
      chapter.append(
        el('span', 'act', scene.act),
        el('span', 'chapter-name', scene.chapter)
      );
    },

    /** beat 하나를 그린다. speaker는 캐릭터 객체이거나 null(나레이션). */
    showBeat(beat) {
      choiceWrap.classList.remove('on');
      catcher.classList.add('on');

      if (beat.hud != null) {
        box.classList.remove('on');
        showBanner(beat.hud);
        return;
      }
      banner.classList.remove('on');

      box.classList.add('on');
      if (beat.w) {
        const c = CHARACTERS[beat.w];
        who.textContent = c ? c.name : beat.w;
        who.style.color = c ? c.hue : '';
        who.classList.add('on');
      } else {
        who.textContent = '';
        who.classList.remove('on');
      }
      type(beat.n ?? beat.t ?? '');
      if (beat.fx) flash(beat.fx);
    },

    showChoices(choices, q) {
      clearInterval(timer); timer = null;
      box.classList.remove('on');
      banner.classList.remove('on');
      catcher.classList.remove('on');

      question.textContent = q ?? '';
      list.innerHTML = '';
      choices.forEach((c, i) => {
        const b = el('button', 'choice');
        b.append(
          el('span', 'choice-num', String(i + 1)),
          el('span', 'choice-label', c.label)
        );
        if (c.hint) b.appendChild(el('span', 'choice-hint', c.hint));
        b.addEventListener('click', () => {
          choiceWrap.classList.remove('on');
          onChoose(i);
        });
        list.appendChild(b);
      });
      choiceWrap.classList.add('on');
    },

    setStats(state) {
      for (const [key, node] of statEls) {
        const def = STATS.find(s => s.key === key);
        node.textContent = def.unit === 'CR'
          ? `${state[key].toLocaleString('en-US')} CR`
          : String(state[key]);
        node.classList.toggle('danger', key === 'funds' && state[key] <= 20000);
      }
    },

    setTone(state) {
      applyToneVars(root, state);
    },

    showEnding(e, state) {
      clearInterval(timer); timer = null;
      box.classList.remove('on');
      choiceWrap.classList.remove('on');
      banner.classList.remove('on');
      catcher.classList.remove('on');

      ending.innerHTML = '';
      ending.append(
        el('div', 'end-stamp', e.stamp),
        el('div', 'end-title', e.title)
      );
      const epi = el('div', 'end-epi');
      for (const line of e.epi) epi.appendChild(el('p', null, line));
      ending.appendChild(epi);
      ending.appendChild(el('div', 'end-final', e.stampEnd));

      const sum = el('div', 'end-stats');
      for (const s of STATS) {
        const v = s.unit === 'CR' ? `${state[s.key].toLocaleString('en-US')} CR` : state[s.key];
        sum.appendChild(el('div', 'end-stat', `${s.label} ${v}`));
      }
      ending.appendChild(sum);

      const again = el('button', 'end-again', '다시 시작');
      again.addEventListener('click', onRestart);
      ending.appendChild(again);

      ending.classList.add('on');
    }
  };

  function showBanner(t) {
    clearTimeout(bannerTimer);
    banner.textContent = t;
    banner.classList.remove('on');
    void banner.offsetWidth;      // 리플로우를 강제해 애니메이션을 다시 태운다
    banner.classList.add('on');
  }

  function flash(kind) {
    document.body.classList.remove('fx-shake', 'fx-flash');
    void document.body.offsetWidth;
    document.body.classList.add(kind === 'shake' ? 'fx-shake' : 'fx-flash');
  }

  return hud;
}

function el(tag, cls, txt) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (txt != null) n.textContent = txt;
  return n;
}

function injectStyle() {
  if (document.getElementById('hud-style')) return;
  const s = document.createElement('style');
  s.id = 'hud-style';
  s.textContent = CSS;
  document.head.appendChild(s);
}

const CSS = `
#hud { --pad: clamp(14px, 3vw, 32px); }
#hud * { box-sizing: border-box; }

.hud-catcher { position: absolute; inset: 0; pointer-events: none; cursor: pointer; }
.hud-catcher.on { pointer-events: auto; }

/* ── 상단 좌: 막 */
.hud-chapter {
  position: absolute; top: var(--pad); left: var(--pad);
  display: flex; align-items: baseline; gap: 10px;
  font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase;
  text-shadow: 0 2px 12px rgba(0,0,0,0.9);
}
.hud-chapter .act { color: var(--aria-hex); font-weight: 700; }
.hud-chapter .chapter-name { color: var(--ink-dim); letter-spacing: 0.08em; text-transform: none; }

/* ── 상단 우: 스탯 */
.hud-stats {
  position: absolute; top: var(--pad); right: var(--pad);
  display: flex; gap: 18px;
}
.hud-stats .stat { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
.stat-label { font-size: 10px; letter-spacing: 0.14em; color: var(--ink-dim); text-transform: uppercase; }
.stat-value {
  font-size: 15px; font-variant-numeric: tabular-nums; font-weight: 600;
  color: var(--ink); text-shadow: 0 2px 12px rgba(0,0,0,0.9);
  transition: color 0.3s ease;
}
.stat-value.danger { color: #EF4444; }

/* ── 중앙 배너 */
.hud-banner {
  position: absolute; top: 34%; left: 50%; transform: translate(-50%, -50%);
  font-size: clamp(20px, 4.4vw, 44px); font-weight: 700;
  letter-spacing: 0.14em; color: var(--ink);
  text-shadow: 0 0 28px var(--aria-hex), 0 4px 24px rgba(0,0,0,0.9);
  opacity: 0; pointer-events: none; white-space: nowrap;
}
.hud-banner.on { animation: banner 1.6s ease forwards; }
@keyframes banner {
  0%   { opacity: 0; letter-spacing: 0.34em; }
  22%  { opacity: 1; letter-spacing: 0.14em; }
  78%  { opacity: 1; }
  100% { opacity: 0.85; }
}

/* ── 대사창 */
.hud-box {
  position: absolute; left: 50%; bottom: var(--pad); transform: translateX(-50%) translateY(12px);
  width: min(880px, calc(100% - var(--pad) * 2));
  padding: 20px 26px 22px;
  background: var(--panel); backdrop-filter: blur(14px);
  border: 1px solid var(--line); border-top: 1px solid var(--aria-hex);
  border-radius: 4px;
  box-shadow: 0 0 40px rgba(0,0,0,0.6), 0 0 60px -30px var(--aria-hex);
  opacity: 0; pointer-events: none;
  transition: opacity 0.22s ease, transform 0.22s ease;
}
.hud-box.on { opacity: 1; transform: translateX(-50%) translateY(0); }
.hud-who {
  font-size: 13px; font-weight: 700; letter-spacing: 0.1em;
  margin-bottom: 8px; display: none;
}
.hud-who.on { display: block; }
.hud-text {
  font-size: clamp(15px, 1.7vw, 18px); line-height: 1.75; color: var(--ink);
  min-height: 3.5em; white-space: pre-wrap;
}
.hud-more {
  position: absolute; right: 18px; bottom: 12px;
  font-size: 11px; color: var(--aria-hex);
  opacity: 0; transition: opacity 0.2s ease;
}
.hud-more.on { opacity: 1; animation: bob 1.1s ease-in-out infinite; }
@keyframes bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(3px); } }

/* ── 선택지 */
.hud-choices {
  position: absolute; left: 50%; bottom: var(--pad); transform: translateX(-50%) translateY(12px);
  width: min(880px, calc(100% - var(--pad) * 2));
  opacity: 0; pointer-events: none;
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.hud-choices.on { opacity: 1; pointer-events: auto; transform: translateX(-50%) translateY(0); }
.hud-q {
  font-size: 12px; letter-spacing: 0.14em; color: var(--aria-hex);
  text-transform: uppercase; margin-bottom: 12px; padding-left: 2px;
  text-shadow: 0 2px 12px rgba(0,0,0,0.9);
}
.hud-list { display: flex; flex-direction: column; gap: 8px; }
.choice {
  display: grid; grid-template-columns: 26px 1fr; gap: 4px 12px;
  align-items: baseline; text-align: left; width: 100%;
  padding: 14px 18px; cursor: pointer;
  font-family: inherit; color: var(--ink);
  background: var(--panel); backdrop-filter: blur(14px);
  border: 1px solid var(--line); border-left: 2px solid transparent;
  border-radius: 4px;
  transition: border-color 0.18s ease, background 0.18s ease, transform 0.18s ease;
}
.choice:hover, .choice:focus-visible {
  border-left-color: var(--aria-hex);
  background: rgba(30, 20, 48, 0.9);
  transform: translateX(4px);
  outline: none;
}
.choice-num { color: var(--aria-hex); font-size: 12px; font-weight: 700; }
.choice-label { font-size: clamp(14px, 1.6vw, 16px); font-weight: 500; }
.choice-hint {
  grid-column: 2; font-size: 12.5px; color: var(--ink-dim); line-height: 1.5;
}

/* ── 엔딩 */
.hud-ending {
  position: absolute; inset: 0; z-index: 5;
  display: none; flex-direction: column; justify-content: center; align-items: center;
  gap: 10px; padding: 6vh var(--pad);
  background: radial-gradient(ellipse at center, rgba(5,7,12,0.86), rgba(5,7,12,0.98));
  backdrop-filter: blur(6px);
  pointer-events: auto; overflow-y: auto;
  animation: fadein 1.2s ease;
}
.hud-ending.on { display: flex; }
@keyframes fadein { from { opacity: 0; } to { opacity: 1; } }
.end-stamp {
  font-size: 11px; letter-spacing: 0.3em; color: var(--aria-hex); text-transform: uppercase;
}
.end-title {
  font-size: clamp(22px, 4vw, 38px); font-weight: 700; color: var(--ink);
  text-align: center; margin-bottom: 10px;
  text-shadow: 0 0 40px var(--aria-hex);
}
.end-epi { max-width: 640px; display: flex; flex-direction: column; gap: 12px; }
.end-epi p {
  margin: 0; font-size: 15px; line-height: 1.85; color: var(--ink-dim); text-align: center;
}
.end-final {
  margin-top: 22px; font-size: clamp(14px, 2vw, 20px); font-weight: 700;
  letter-spacing: 0.22em; color: var(--ink);
  border-top: 1px solid var(--line); border-bottom: 1px solid var(--line);
  padding: 12px 26px; text-align: center;
}
.end-stats { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 18px; }
.end-stat { font-size: 12px; color: var(--ink-dim); font-variant-numeric: tabular-nums; }
.end-again {
  margin-top: 24px; padding: 12px 30px; cursor: pointer;
  font-family: inherit; font-size: 13px; letter-spacing: 0.14em;
  color: var(--ink); background: transparent;
  border: 1px solid var(--aria-hex); border-radius: 3px;
  transition: background 0.2s ease;
}
.end-again:hover { background: var(--aria-dim); }

/* ── 화면 효과 */
.fx-shake { animation: shake 0.42s ease; }
@keyframes shake {
  0%,100% { transform: translate(0,0); }
  20% { transform: translate(-6px, 3px); }
  40% { transform: translate(5px, -3px); }
  60% { transform: translate(-4px, -2px); }
  80% { transform: translate(3px, 2px); }
}
.fx-flash { animation: flashfx 0.5s ease; }
@keyframes flashfx {
  0% { filter: brightness(1); }
  15% { filter: brightness(2.4) saturate(0.4); }
  100% { filter: brightness(1); }
}

@media (max-width: 620px) {
  .hud-stats { gap: 12px; }
  .choice { padding: 12px 14px; }
  .hud-text { min-height: 4.5em; }
}
`;
