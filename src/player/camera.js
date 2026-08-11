import * as THREE from 'three';

const BACK = 3.4;     // 플레이어 뒤로 떨어진 거리
const HEIGHT = 1.95;  // 카메라 높이
const LOOK_AT = 1.25; // 바라보는 높이 (플레이어 어깨 근처)
const POS_LAG = 6.0;  // 위치 추종 속도
const ROT_LAG = 3.2;  // 회전 추종 속도 — 위치보다 느려야 부드럽다

/**
 * 3인칭 백뷰 추적 카메라.
 *
 * 회전 추종을 위치보다 느리게 둔다. 방향을 틀면 카메라가 한 박자 늦게 따라와서
 * 플레이어가 화면 중앙에서 살짝 벗어나는데, 이미지 1·2의 구도가 그 상태다.
 */
export function createFollowCamera({ camera }) {
  let smoothed = null;
  const target = new THREE.Vector3();
  const desired = new THREE.Vector3();

  return {
    update(dt, pos, heading) {
      if (smoothed === null) smoothed = heading;

      // 각도를 -π..π 최단 경로로 보간한다
      let diff = heading - smoothed;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      smoothed += diff * Math.min(1, ROT_LAG * dt);

      desired.set(
        pos.x + Math.sin(smoothed) * BACK,
        HEIGHT,
        pos.z + Math.cos(smoothed) * BACK
      );
      camera.position.lerp(desired, Math.min(1, POS_LAG * dt));

      target.set(pos.x, LOOK_AT, pos.z);
      camera.lookAt(target);
    }
  };
}
