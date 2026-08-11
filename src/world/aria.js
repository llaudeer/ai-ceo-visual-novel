import * as THREE from 'three';
import { ARIA_ANCHOR } from '../game/characters.data.js';
import { getTone } from '../ui/theme.js';

const CORE_R = 0.28;
const CENTER_Y = 0.78;   // 받침 위로 떠오른 높이
const FADE = 0.4;        // 색 전환 시간(초)

/**
 * ARIA 홀로그램.
 *
 * 구체 + 이중 궤도링 + 프로젝터 받침 + 상승 파티클 + 포인트 라이트.
 * 상태가 바뀌면 이 다섯이 한꺼번에 물든다. 색은 theme.js 토큰 하나에서 온다.
 */
export function createAria(scene) {
  const group = new THREE.Group();
  group.position.set(ARIA_ANCHOR.x, ARIA_ANCHOR.y, ARIA_ANCHOR.z);

  const tone = getTone('neutral');
  const color = new THREE.Color(tone.hex);
  const glow = new THREE.Color(tone.glow);

  // ── 프로젝터 받침: 계단형 원반 3층
  const baseMat = new THREE.MeshStandardMaterial({ color: '#15171F', roughness: 0.35, metalness: 0.7 });
  for (const [r, h, y] of [[0.34, 0.05, 0.02], [0.26, 0.045, 0.07], [0.18, 0.04, 0.115]]) {
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(r, r + 0.015, h, 32), baseMat);
    disc.position.y = y;
    group.add(disc);
  }

  // 받침 상단의 발광 링
  const emitter = new THREE.Mesh(
    new THREE.RingGeometry(0.09, 0.15, 32),
    new THREE.MeshBasicMaterial({ color: glow, side: THREE.DoubleSide, transparent: true,
      opacity: 0.85, toneMapped: false })
  );
  emitter.rotation.x = -Math.PI / 2;
  emitter.position.y = 0.138;
  group.add(emitter);

  // ── 빛 원뿔: 받침에서 구체로 올라가는 투영광
  const cone = new THREE.Mesh(
    new THREE.ConeGeometry(0.3, CENTER_Y - 0.14, 28, 1, true),
    new THREE.MeshBasicMaterial({
      color, transparent: true, opacity: 0.1,
      side: THREE.DoubleSide, depthWrite: false, toneMapped: false
    })
  );
  cone.position.y = 0.14 + (CENTER_Y - 0.14) / 2;
  cone.rotation.x = Math.PI;  // 위가 좁고 아래가 넓게
  group.add(cone);

  // ── 중심 구체: 와이어프레임 격자
  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(CORE_R, 3),
    new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true,
      opacity: 0.55, toneMapped: false })
  );
  core.position.y = CENTER_Y;
  group.add(core);

  // 구체 내부의 은은한 덩어리
  const inner = new THREE.Mesh(
    new THREE.SphereGeometry(CORE_R * 0.62, 20, 16),
    new THREE.MeshBasicMaterial({ color: glow, transparent: true, opacity: 0.22,
      depthWrite: false, toneMapped: false })
  );
  inner.position.y = CENTER_Y;
  group.add(inner);

  // ── 이중 궤도링: 서로 다른 축으로 회전
  const rings = [];
  for (const [tilt, radius] of [[0.42, 0.46], [-0.75, 0.56]]) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(radius, 0.006, 8, 96),
      new THREE.MeshBasicMaterial({ color: glow, transparent: true, opacity: 0.75, toneMapped: false })
    );
    ring.position.y = CENTER_Y;
    ring.rotation.x = Math.PI / 2 + tilt;
    group.add(ring);
    rings.push(ring);
  }

  // ── 상승 파티클: 받침에서 구체로
  const COUNT = 90;
  const positions = new Float32Array(COUNT * 3);
  const seeds = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) {
    seeds[i] = Math.random();
    positions[i * 3] = 0;
    positions[i * 3 + 1] = 0;
    positions[i * 3 + 2] = 0;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
    color: glow, size: 0.018, transparent: true, opacity: 0.8,
    depthWrite: false, toneMapped: false
  }));
  group.add(particles);

  // ── 주변을 물들이는 빛
  const light = new THREE.PointLight(color, 3.4, 6.5, 2);
  light.position.y = CENTER_Y;
  group.add(light);

  scene.add(group);

  // ── 상태 전환
  let state = 'neutral';
  let fromColor = color.clone();
  let fromGlow = glow.clone();
  let toColor = color.clone();
  let toGlow = glow.clone();
  let t = 1;
  let elapsed = 0;

  const tinted = [core, cone];
  const glowed = [inner, emitter, particles.material, ...rings];

  function setState(name) {
    const next = getTone(name);
    if (name === state) return;
    state = name;
    fromColor = toColor.clone();
    fromGlow = toGlow.clone();
    toColor = new THREE.Color(next.hex);
    toGlow = new THREE.Color(next.glow);
    t = 0;
  }

  const tmpC = new THREE.Color();
  const tmpG = new THREE.Color();

  function update(dt) {
    elapsed += dt;

    if (t < 1) {
      t = Math.min(1, t + dt / FADE);
      tmpC.copy(fromColor).lerp(toColor, t);
      tmpG.copy(fromGlow).lerp(toGlow, t);
      for (const m of tinted) m.material.color.copy(tmpC);
      for (const m of glowed) (m.material ?? m).color.copy(tmpG);
      light.color.copy(tmpC);
    }

    core.rotation.y += dt * 0.22;
    core.rotation.x += dt * 0.08;
    rings[0].rotation.z += dt * 0.5;
    rings[1].rotation.z -= dt * 0.34;

    // 맥동. warn 상태에서는 두 배 빠르게 뛴다.
    const beat = state === 'warn' ? 4.2 : 1.6;
    const pulse = 1 + Math.sin(elapsed * beat) * 0.045;
    core.scale.setScalar(pulse);
    inner.scale.setScalar(pulse);
    light.intensity = 3.4 + Math.sin(elapsed * beat) * 0.7;

    // 파티클: 나선을 그리며 올라갔다가 아래에서 다시 시작
    const arr = pGeo.attributes.position.array;
    for (let i = 0; i < COUNT; i++) {
      const p = (elapsed * 0.34 + seeds[i]) % 1;
      const a = seeds[i] * Math.PI * 2 + p * 5.5;
      const r = 0.13 * (1 - p) + 0.02;
      arr[i * 3] = Math.cos(a) * r;
      arr[i * 3 + 1] = 0.15 + p * (CENTER_Y - 0.2);
      arr[i * 3 + 2] = Math.sin(a) * r;
    }
    pGeo.attributes.position.needsUpdate = true;
  }

  return {
    group,
    center: new THREE.Vector3(ARIA_ANCHOR.x, ARIA_ANCHOR.y + CENTER_Y, ARIA_ANCHOR.z),
    get state() { return state; },
    setState,
    update
  };
}
