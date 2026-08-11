import * as THREE from 'three';
import { ROOM } from './layout.js';

const loader = new THREE.TextureLoader();

function load(url) {
  return new Promise((resolve, reject) => {
    loader.load(url, tex => {
      tex.colorSpace = THREE.SRGBColorSpace;
      // 백드롭 크롭은 작다(580x400, 800x156). 큰 벽에 그대로 늘이면 가로로 뭉개지므로
      // 거울 반복으로 타일링한다. 거울이라 이음매가 생기지 않는다.
      tex.wrapS = THREE.MirroredRepeatWrapping;
      tex.wrapT = THREE.MirroredRepeatWrapping;
      resolve(tex);
    }, undefined, () => reject(new Error(`백드롭 로드 실패: ${url}`)));
  });
}

/**
 * 백드롭 평면 하나.
 * repeat 은 평면의 가로세로 비율과 텍스처 비율의 차이를 메운다.
 * 이걸 안 하면 좁은 크롭이 넓은 벽에 가로로 늘어져 뭉개진다.
 */
function panel(tex, w, h, repeatX = 1, repeatY = 1) {
  const map = tex.clone();
  map.needsUpdate = true;
  map.repeat.set(repeatX, repeatY);
  return new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({ map, toneMapped: false, fog: false })
  );
}

/**
 * 원경. 사진을 큰 평면으로 세운다.
 *
 * 벽보다 약간 뒤에 두어 3D 지오메트리와 겹치지 않게 한다.
 * MeshBasicMaterial + toneMapped:false 라서 씬 조명의 영향을 받지 않는다.
 * 사진 안에 이미 조명이 구워져 있기 때문이다.
 */
export async function addBackdrop(scene) {
  const [night, shelf] = await Promise.all([
    load('assets/bg/window_night.jpg'),
    load('assets/bg/wall_shelf.jpg')
  ]);

  // 안쪽 벽 전체를 채우는 야경 (-Z)
  const back = panel(night, ROOM.width + 6, ROOM.height + 2.4, 3, 1);
  back.position.set(0, ROOM.height / 2, -ROOM.halfD - 0.6);
  scene.add(back);

  // 우측 창 (+X). 안쪽을 향해 90도 돌린다.
  const right = panel(night, ROOM.depth + 4, ROOM.height + 2.4, 2.5, 1);
  right.rotation.y = -Math.PI / 2;
  right.position.set(ROOM.halfW + 0.6, ROOM.height / 2, 0);
  scene.add(right);

  // 좌측 서가 벽 (-X)
  const left = panel(shelf, ROOM.depth + 4, ROOM.height + 2.4, 2, 3);
  left.rotation.y = Math.PI / 2;
  left.position.set(-ROOM.halfW - 0.6, ROOM.height / 2, 0);
  scene.add(left);

  return { back, right, left };
}
