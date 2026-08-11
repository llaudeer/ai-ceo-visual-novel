import * as THREE from 'three';
import { listSeated } from '../game/characters.data.js';

/** 포트레이트가 담는 실제 인체 높이(머리~가슴). 미터. */
const BUST_HEIGHT = 0.65;
/** 앉은 사람의 정수리 높이. */
const SEATED_CROWN = 1.40;

const loader = new THREE.TextureLoader();

function loadTexture(url) {
  return new Promise((resolve, reject) => {
    loader.load(url, tex => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.anisotropy = 8;
      resolve(tex);
    }, undefined, () => reject(new Error(`포트레이트 로드 실패: ${url}`)));
  });
}

/** 포트레이트가 없는 인물(오세라·강태석)용 실루엣. 캐릭터 색으로 물들인다. */
function silhouette(hue) {
  const mat = new THREE.MeshBasicMaterial({
    color: hue, transparent: true, opacity: 0.32,
    depthWrite: false, toneMapped: false
  });
  const w = BUST_HEIGHT * 0.8;
  return new THREE.Mesh(new THREE.PlaneGeometry(w, BUST_HEIGHT), mat);
}

async function makeSprite(character) {
  if (!character.portrait) return silhouette(character.hue);

  const tex = await loadTexture(character.portrait);
  const aspect = tex.image.width / tex.image.height;
  return new THREE.Mesh(
    new THREE.PlaneGeometry(BUST_HEIGHT * aspect, BUST_HEIGHT),
    new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      // 알파 페이드 경계에서 정렬이 깨지지 않도록 깊이 기록을 끈다
      depthWrite: false,
      alphaTest: 0.02,
      toneMapped: false
    })
  );
}

/**
 * 자리가 있는 캐릭터를 빌보드로 세운다.
 *
 * 앉은 자세를 전제로 정수리를 1.40m에 맞춘다. 흉상 아래쪽은 책상에 가려지고,
 * 가려지지 않는 부분은 텍스처의 알파 페이드가 처리한다.
 */
export async function addCharacters(scene) {
  const entries = [];

  for (const character of listSeated()) {
    const sprite = await makeSprite(character);
    const y = SEATED_CROWN - BUST_HEIGHT / 2;
    sprite.position.set(character.seat.x, y, character.seat.z);
    sprite.renderOrder = 2;
    scene.add(sprite);

    entries.push({
      id: character.id,
      character,
      sprite,
      head: new THREE.Vector3(character.seat.x, SEATED_CROWN + 0.14, character.seat.z)
    });
  }

  return entries;
}

/** Y축만 카메라를 향하게 돌린다. 위아래로 눕지 않게 X/Z 회전은 건드리지 않는다. */
export function updateBillboards(entries, camera) {
  for (const e of entries) {
    const dx = camera.position.x - e.sprite.position.x;
    const dz = camera.position.z - e.sprite.position.z;
    e.sprite.rotation.y = Math.atan2(dx, dz);
  }
}
