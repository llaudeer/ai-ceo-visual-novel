import * as THREE from 'three';
import { ROOM } from './layout.js';

/**
 * 렌더러·씬·카메라와 렌더 루프.
 *
 * 카메라 화각은 38도로 좁게 잡는다. 이미지 1·2의 망원 압축감이
 * 사무실이 빽빽해 보이는 인상의 절반을 만든다. 60도로 넓히면 전혀 다른 그림이 된다.
 */
export function createStage({ canvas }) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#05070C');
  scene.fog = new THREE.Fog('#05070C', 14, 34);

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 120);
  camera.position.set(0, 1.62, ROOM.halfD + 1.2);
  camera.lookAt(0, 1.3, 0);

  const callbacks = [];
  const clock = new THREE.Clock();

  function resize() {
    const w = canvas.clientWidth || innerWidth;
    const h = canvas.clientHeight || innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  function start() {
    resize();
    addEventListener('resize', resize);
    renderer.setAnimationLoop(() => {
      const dt = Math.min(clock.getDelta(), 0.1);
      for (const fn of callbacks) fn(dt);
      renderer.render(scene, camera);
    });
  }

  return {
    scene,
    camera,
    renderer,
    resize,
    start,
    onFrame(fn) { callbacks.push(fn); }
  };
}
