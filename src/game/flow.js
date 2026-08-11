import { applyEffects, resolveBranch, pickEnding } from './state.js';

/**
 * 스토리 진행 상태 기계.
 *
 * three.js도 DOM도 모른다. UI는 on()으로 이벤트를 구독해 그린다.
 * 모드는 셋뿐이다:
 *   beat   — 대사/나레이션 재생 중. 클릭으로 진행.
 *   choice — 선택지 대기. 클릭 진행이 잠긴다.
 *   ending — 종료.
 *
 * 씬에 choices가 없으면(프롤로그 나레이션, 출시 씬) 선택 단계를 건너뛰고
 * 곧바로 다음 씬으로 넘어간다. 이게 없으면 선택지 없는 씬에서 진행이 막힌다.
 */
export function createFlow({ scenes, order, endings, state }) {
  const listeners = new Map();
  let queue = [];
  let index = -1;

  const flow = {
    mode: 'beat',
    state,
    ending: null,

    scene() {
      return scenes[flow.state.sceneId];
    },

    current() {
      return queue[index] ?? null;
    },

    canAdvance() {
      return flow.mode === 'beat';
    },

    on(event, fn) {
      if (!listeners.has(event)) listeners.set(event, []);
      listeners.get(event).push(fn);
      return flow;
    },

    advance() {
      if (flow.mode !== 'beat') return;
      if (index + 1 < queue.length) {
        index += 1;
        emit('beat', flow.current());
        return;
      }
      afterQueueDrained();
    },

    choose(i) {
      if (flow.mode !== 'choice') throw new Error('선택지 모드가 아닐 때는 choose 할 수 없다');
      const sc = flow.scene();
      const choice = sc.choices[i];
      if (!choice) throw new Error(`선택지 인덱스 범위를 벗어남: ${i}`);

      const { effects, after, passed } = resolveBranch(flow.state, choice);
      flow.state = applyEffects(flow.state, effects);
      flow.state.history = [
        ...flow.state.history,
        { sceneId: flow.state.sceneId, choice: i, label: choice.label, passed }
      ];

      queue = after;
      index = -1;
      flow.mode = 'beat';
      emit('choose', choice, i, passed);
      flow.advance();
    }
  };

  function emit(event, ...args) {
    for (const fn of listeners.get(event) ?? []) fn(...args);
  }

  function hasChoices(sc) {
    return Array.isArray(sc.choices) && sc.choices.length > 0;
  }

  /** 씬에 들어갈 때의 고정 비용과 주차를 반영한다. */
  function enterScene(id) {
    const sc = scenes[id];
    flow.state = { ...flow.state, sceneId: id, week: sc.week ?? flow.state.week };
    if (sc.burn) flow.state = applyEffects(flow.state, { funds: sc.burn });
    queue = sc.beats;
    index = -1;
    emit('scene', sc, id);
  }

  function toEnding() {
    flow.mode = 'ending';
    index = -1;
    flow.ending = pickEnding(flow.state, endings);
    emit('ending', flow.ending);
  }

  /** 현재 큐를 다 소진했을 때: 선택지를 띄우거나, 다음 씬으로 가거나, 엔딩을 낸다. */
  function afterQueueDrained() {
    const sc = flow.scene();
    const alreadyChose = flow.state.history.some(h => h.sceneId === flow.state.sceneId);

    if (hasChoices(sc) && !alreadyChose) {
      flow.mode = 'choice';
      index = -1;
      emit('choices', sc.choices, sc.q);
      return;
    }

    const next = order[order.indexOf(flow.state.sceneId) + 1];
    if (!next) { toEnding(); return; }

    enterScene(next);
    flow.advance();
  }

  // 첫 씬을 세팅한다. 이벤트는 아직 구독자가 없으므로 발행하지 않는다.
  const first = scenes[state.sceneId];
  if (first.burn) flow.state = applyEffects(flow.state, { funds: first.burn });
  flow.state = { ...flow.state, week: first.week ?? 0 };
  queue = first.beats;
  index = 0;

  return flow;
}
