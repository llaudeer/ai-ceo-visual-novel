import { resolveCollision } from './collision.js';
import { SPAWN, PLAYER_RADIUS } from '../world/layout.js';

const WALK = 2.6;   // m/s
const RUN = 4.6;
const TURN = 2.4;   // rad/s

/**
 * 키 입력 → 위치.
 *
 * W/S 전진·후진, A/D 방향 전환, Shift 달리기.
 * 마우스로 카메라를 돌리지 않는다. 이미지 1·2의 고정된 앵글을 유지하기 위해서다.
 */
export function createController({ obstacles }) {
  const keys = new Set();
  const pos = { x: SPAWN.x, z: SPAWN.z };
  let heading = SPAWN.facing;

  const isTypingTarget = e =>
    e.target instanceof HTMLElement &&
    (e.target.isContentEditable || ['INPUT', 'TEXTAREA'].includes(e.target.tagName));

  const down = e => {
    if (isTypingTarget(e)) return;
    keys.add(e.code);
    if (['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) e.preventDefault();
  };
  const up = e => keys.delete(e.code);
  const blur = () => keys.clear();

  addEventListener('keydown', down);
  addEventListener('keyup', up);
  addEventListener('blur', blur);

  const api = {
    pos,
    get heading() { return heading; },
    moving: false,

    update(dt) {
      const turn = (keys.has('KeyA') ? 1 : 0) - (keys.has('KeyD') ? 1 : 0);
      heading += turn * TURN * dt;

      const fwd = (keys.has('KeyW') ? 1 : 0) - (keys.has('KeyS') ? 1 : 0);
      api.moving = fwd !== 0;
      if (fwd === 0) return;

      const speed = keys.has('ShiftLeft') || keys.has('ShiftRight') ? RUN : WALK;
      const step = fwd * speed * dt;
      const next = {
        x: pos.x - Math.sin(heading) * step,
        z: pos.z - Math.cos(heading) * step
      };

      const solved = resolveCollision(pos, next, obstacles, PLAYER_RADIUS);
      pos.x = solved.x;
      pos.z = solved.z;
    },

    dispose() {
      removeEventListener('keydown', down);
      removeEventListener('keyup', up);
      removeEventListener('blur', blur);
    }
  };

  return api;
}
