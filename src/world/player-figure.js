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
  // 재킷은 완전한 검정이 아니라 살짝 밝히고 광택을 준다 — 실루엣이 배경과 뭉개지지
  // 않고 윤곽에 하이라이트가 걸리게 하기 위해서다.
  const jacket = new THREE.MeshStandardMaterial({ color: '#1C1C26', roughness: 0.42, metalness: 0.32 });
  const pants = new THREE.MeshStandardMaterial({ color: '#121218', roughness: 0.75, metalness: 0.15 });
  const hair = new THREE.MeshStandardMaterial({ color: '#16141A', roughness: 0.4, metalness: 0.2 });
  const skin = new THREE.MeshStandardMaterial({ color: '#D9B394', roughness: 0.8 });
  const led = new THREE.MeshBasicMaterial({ color: '#C084FC', toneMapped: false });
  const ledGlow = new THREE.MeshBasicMaterial({
    color: '#A855F7', transparent: true, opacity: 0.45,
    blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false
  });

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

    // 어깨 솔기를 따라 흐르는 보라 LED. 실제 발광면(led)에 더 넓은 반투명 겹
    // (ledGlow)을 겹쳐 후처리 블룸 없이도 번져 보이게 한다.
    const strip = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.36, 0.028), led);
    strip.position.set(s * 0.235, 1.24, -0.115);
    group.add(strip);

    const glow = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.4, 0.07), ledGlow);
    glow.position.copy(strip.position);
    group.add(glow);

    // 어깨 뒤쪽 가장자리를 밝히는 보라 림 라이트 — LED 위치와 짝을 맞춘다
    const shoulderRim = new THREE.PointLight('#B266FF', 3.2, 2.4, 1.5);
    shoulderRim.position.set(s * 0.3, 1.28, -0.28);
    group.add(shoulderRim);
  }

  // 등판 CEO 패치 자리를 암시하는 가로 라인
  const backLine = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.02, 0.018), led);
  backLine.position.set(0, 1.3, -0.155);
  group.add(backLine);

  const backGlow = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.05, 0.05), ledGlow);
  backGlow.position.copy(backLine.position);
  group.add(backGlow);

  // 정수리 위쪽에서 은은하게 내려오는 냉색 에지 라이트 — 사무실 펜던트 조명이
  // 어깨선을 스치는 것처럼 실루엣의 위쪽 윤곽을 살려 형태가 읽히게 한다.
  const edge = new THREE.PointLight('#C7D8FF', 1.4, 2.6, 1.7);
  edge.position.set(0, 1.9, -0.25);
  group.add(edge);

  // 플레이어 주변을 아주 약하게 밝혀 실루엣이 배경에 묻히지 않게 한다
  const rim = new THREE.PointLight('#A855F7', 1.8, 2.2, 1.6);
  rim.position.set(0, 1.2, -0.35);
  group.add(rim);
}
