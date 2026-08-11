import * as THREE from 'three';
import { ROOM } from './layout.js';

/**
 * 이미지 1·2 인상의 핵심은 두 광원의 대비다.
 *   위에서 내려오는 따뜻한 펜던트 (2700K 근처, 좁은 원뿔)
 *   아래에서 올라오는 차가운 모니터 빛 (office.js가 emissive로 담당)
 * 앰비언트는 아주 낮게 깔아 어둠을 살린다.
 */
export function addLighting(scene) {
  const ambient = new THREE.HemisphereLight('#2A3550', '#07090F', 0.28);
  scene.add(ambient);

  const pendantPositions = [
    [-6.0, -3.4], [-6.0, -0.4], [0.0, -1.4], [5.6, -2.4], [6.4, -5.4], [0.0, 3.0]
  ];

  const pendants = pendantPositions.map(([x, z], i) => {
    const light = new THREE.SpotLight('#FFB46B', 14, 9, Math.PI * 0.26, 0.55, 1.6);
    light.position.set(x, ROOM.height - 0.55, z);
    light.target.position.set(x, 0, z);
    scene.add(light, light.target);

    // 처음 두 개만 실시간 그림자. 나머지는 성능을 위해 끈다.
    light.castShadow = i < 2;
    if (light.castShadow) {
      light.shadow.mapSize.set(1024, 1024);
      light.shadow.bias = -0.0015;
    }

    // 전구 자체를 보이게 한다. 이미지 1의 점점이 박힌 조명이 이것.
    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.055, 12, 10),
      new THREE.MeshBasicMaterial({ color: '#FFD9A8' })
    );
    bulb.position.copy(light.position);
    scene.add(bulb);

    return light;
  });

  return { pendants, ambient };
}
