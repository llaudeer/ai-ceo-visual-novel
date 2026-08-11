import * as THREE from 'three';

const CEO_BACK = 'assets/chars/ceo_back.png';
const BODY_HEIGHT = 1.74;

/**
 * 플레이어 백뷰.
 *
 * 두 구현을 갖는다:
 *   빌보드 — assets/chars/ceo_back.png 가 있으면 이쪽. 최종 형태.
 *   피규어 — 없으면 이쪽. 사장 이미지의 디자인을 옮긴 대체품
 *            (검정 택티컬 재킷, 보라 LED 라인, 흑발).
 *
 * 파일 존재 여부로 자동 분기하므로, 나중에 이미지를 폴더에 넣기만 하면 교체된다.
 * 호출부는 어느 쪽인지 알 필요가 없다.
 */
export async function createPlayerFigure(scene) {
  const group = new THREE.Group();
  const tex = await tryLoad(CEO_BACK);

  if (tex) buildBillboard(group, tex);
  else buildFigure(group);

  scene.add(group);

  return {
    group,
    usingImage: Boolean(tex),
    update(pos, heading) {
      group.position.set(pos.x, 0, pos.z);
      group.rotation.y = heading;
    }
  };
}

function tryLoad(url) {
  return new Promise(resolve => {
    new THREE.TextureLoader().load(
      url,
      tex => { tex.colorSpace = THREE.SRGBColorSpace; resolve(tex); },
      undefined,
      () => resolve(null)
    );
  });
}

function buildBillboard(group, tex) {
  const aspect = tex.image.width / tex.image.height;
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(BODY_HEIGHT * aspect, BODY_HEIGHT),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.02, toneMapped: false })
  );
  mesh.position.y = BODY_HEIGHT / 2;
  // 카메라가 항상 등 뒤에 있으므로 회전 없이 그룹 방향만 따른다
  mesh.rotation.y = Math.PI;
  group.add(mesh);
}

function buildFigure(group) {
  const jacket = new THREE.MeshStandardMaterial({ color: '#0D0D12', roughness: 0.62, metalness: 0.18 });
  const pants = new THREE.MeshStandardMaterial({ color: '#0A0A0E', roughness: 0.85 });
  const hair = new THREE.MeshStandardMaterial({ color: '#0B0A0C', roughness: 0.55 });
  const skin = new THREE.MeshStandardMaterial({ color: '#D9B394', roughness: 0.8 });
  const led = new THREE.MeshBasicMaterial({ color: '#A855F7', toneMapped: false });

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.21, 0.46, 6, 14), jacket);
  torso.position.y = 1.16;
  torso.scale.set(1.18, 1, 0.72);
  torso.castShadow = true;
  group.add(torso);

  const hips = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.66, 6, 12), pants);
  hips.position.y = 0.52;
  hips.scale.set(1.1, 1, 0.8);
  group.add(hips);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.1, 10), skin);
  neck.position.y = 1.52;
  group.add(neck);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.115, 18, 16), skin);
  head.position.y = 1.63;
  head.scale.set(0.94, 1.1, 1);
  head.castShadow = true;
  group.add(head);

  // 뒤통수를 덮는 흑발
  const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.125, 18, 16), hair);
  hairCap.position.set(0, 1.645, -0.012);
  hairCap.scale.set(0.98, 1.06, 1.04);
  group.add(hairCap);

  // 목덜미까지 내려오는 머리
  const nape = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.13, 0.06), hair);
  nape.position.set(0, 1.5, -0.085);
  group.add(nape);

  for (const s of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.062, 0.5, 5, 10), jacket);
    arm.position.set(s * 0.28, 1.13, 0);
    group.add(arm);

    // 어깨 솔기를 따라 흐르는 보라 LED
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.34, 0.014), led);
    strip.position.set(s * 0.235, 1.24, -0.11);
    group.add(strip);
  }

  // 등판 CEO 패치 자리를 암시하는 가로 라인
  const backLine = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.014, 0.014), led);
  backLine.position.set(0, 1.3, -0.155);
  group.add(backLine);

  // 플레이어 주변을 아주 약하게 밝혀 실루엣이 배경에 묻히지 않게 한다
  const rim = new THREE.PointLight('#A855F7', 0.5, 1.6, 2);
  rim.position.set(0, 1.2, -0.3);
  group.add(rim);
}
