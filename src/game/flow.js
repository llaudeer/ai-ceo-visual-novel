import { applyEffects, resolveEffects, pickEnding } from './state.js';

/**
 * 스토리 진행 상태 기계.
 *
 * three.js도 DOM도 모른다. UI는 on()으로 이벤트를 구독해 그린다.
 * 모드는 셋뿐이다:
 *   beat   — 대사/나레이션 재생 중. 클릭으로 진행.
 *   choice — 선택지 대기. 클릭 진행이 잠긴다.
 *   ending — 종료.
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

      const fx = resolveEffects(flow.state, choice);
      flow.state = applyEffects(flow.state, fx);
      flow.state.history = [
        ...flow.state.history,
        { sceneId: flow.state.sceneId, choice: i, label: choice.label }
      ];

      queue = choice.after ?? [];
      index = -1;
      flow.mode = 'beat';
      emit('choose', choice, i);
      flow.advance();
    }
  };

  function emit(event, ...args) {
    for (const fn of listeners.get(event) ?? []) fn(...args);
  }

  /** 현재 큐를 다 소진했을 때: 선택지를 띄우거나, 다음 씬으로 가거나, 엔딩을 낸다. */
  function afterQueueDrained() {
    const sc = flow.scene();
    const alreadyChose = flow.state.history.some(h => h.sceneId === flow.state.sceneId);

    if (!alreadyChose) {
      flow.mode = 'choice';
      index = -1;
      emit('choices', sc.choices, sc.q);
      return;
    }

    const next = order[order.indexOf(flow.state.sceneId) + 1];
    if (!next) {
      flow.mode = 'ending';
      index = -1;
      flow.ending = pickEnding(flow.state, endings);
      emit('ending', flow.ending);
      return;
    }

    flow.state = { ...flow.state, sceneId: next };
    queue = scenes[next].beats;
    index = -1;
    emit('scene', scenes[next], next);
    flow.advance();
  }

  // 첫 씬의 첫 beat을 즉시 세팅한다. 이벤트는 아직 구독자가 없으므로 발행하지 않는다.
  queue = scenes[state.sceneId].beats;
  index = 0;

  return flow;
}
