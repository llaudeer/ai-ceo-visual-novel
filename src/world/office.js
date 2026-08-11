import * as THREE from 'three';
import { ROOM, DESKS } from './layout.js';

const DARK = (hex, rough, metal = 0) =>
  new THREE.MeshStandardMaterial({ color: hex, roughness: rough, metalness: metal });

/**
 * 중경. 플레이어가 실제로 걷고 부딪히는 층.
 *
 * 모니터는 emissive 로 만든다. 이게 아래에서 올라오는 차가운 빛이 되어
 * 위쪽 펜던트의 따뜻한 빛과 대비를 이룬다. 이미지 1·2의 핵심 인상.
 */
export function addOffice(scene) {
  const group = new THREE.Group();

  // ── 바닥: 어둡고 살짝 젖은 콘크리트
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM.width, ROOM.depth),
    DARK('#14171F', 0.42, 0.15)
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  group.add(floor);

  // ── 천장
  const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM.width, ROOM.depth),
    DARK('#0A0C12', 0.95)
  );
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = ROOM.height;
  group.add(ceiling);

  const deskTop = DARK('#3A2E24', 0.72);
  const deskLeg = DARK('#12141A', 0.6, 0.3);
  const screenSide = DARK('#0C0E14', 0.5, 0.4);

  const desks = [];
  const monitors = [];

  for (const d of DESKS) {
    const desk = new THREE.Group();
    desk.position.set(d.x, 0, d.z);
    desk.rotation.y = d.rot;

    const top = new THREE.Mesh(new THREE.BoxGeometry(d.w, 0.06, d.d), deskTop);
    top.position.y = 0.75;
    top.castShadow = true;
    top.receiveShadow = true;
    desk.add(top);

    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.75, 0.07), deskLeg);
        leg.position.set(sx * (d.w / 2 - 0.12), 0.375, sz * (d.d / 2 - 0.12));
        desk.add(leg);
      }
    }

    // 회의 테이블에는 모니터를 놓지 않는다. ARIA 받침 자리다.
    if (!d.meeting) {
      // 모니터는 앉는 사람의 반대편 가장자리에 놓고, 화면이 사람 쪽을 향하게 돌린다.
      const monZ = -d.seatSide * (d.d / 2 - 0.25);
      const monFace = d.seatSide > 0 ? 0 : Math.PI;

      for (const ox of [-0.6, 0.6]) {
        const mon = new THREE.Group();

        const back = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.38, 0.03), screenSide);
        mon.add(back);

        // 화면. emissive 라서 스스로 빛난다.
        const face = new THREE.Mesh(
          new THREE.PlaneGeometry(0.58, 0.34),
          new THREE.MeshStandardMaterial({
            color: '#0A1A2E',
            emissive: '#3E7FD4',
            emissiveIntensity: 1.5,
            roughness: 1
          })
        );
        face.position.z = 0.017;
        mon.add(face);

        // 화면이 주변을 물들이는 빛
        const glow = new THREE.PointLight('#5B9BE8', 1.1, 2.4, 2);
        glow.position.set(0, 0, 0.35);
        mon.add(glow);

        const stand = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.16, 0.05), screenSide);
        stand.position.y = -0.27;
        mon.add(stand);

        mon.position.set(ox, 0.99, monZ);
        mon.rotation.y = monFace;
        desk.add(mon);
        monitors.push(mon);
      }
    }

    group.add(desk);
    desks.push(desk);
  }

  scene.add(group);
  return { floor, desks, monitors };
}
