import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

/**
 * 포트레이트 배경 제거.
 *
 * 파라미터는 실제 5장의 픽셀을 측정해 정한 값이다. 근거는 계획서 Task 2의
 * "왜 단순 크로마키로는 안 되는가" 절에 있다. 함부로 바꾸면 피부가 뚫리거나
 * 배경이 남는다.
 */

/** 이 밝기(r+g+b) 아래로는 색도가 불안정하다. 판정하지 않고 피사체로 보존한다. */
export const DARK_SUM = 330;
/** 보정된 배경 색도로부터 이 거리 안이면 완전 배경. */
export const CHROMA_IN = 0.020;
/** 이 거리 밖이면 완전 전경. 사이는 선형 보간. */
export const CHROMA_OUT = 0.048;
/** flood fill이 이웃으로 번질 때 허용하는 채널당 색 차이. */
export const FILL_TOL = 14;
/** flood fill 후보 조건: 파랑이 빨강보다 이만큼 우세해야 배경일 수 있다. */
export const BLUE_GUARD = 40;

/**
 * 상단 스트립에서 배경 색도를 잰다.
 * 5장 모두 상단 5%는 확실히 배경이고, 이미지마다 색이 달라서 매번 새로 잰다.
 */
export function calibrateBackground(data, width, height) {
  let sr = 0, sg = 0, n = 0;
  const rows = Math.max(1, Math.floor(height * 0.05));
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 3;
      const sum = data[i] + data[i + 1] + data[i + 2];
      if (sum < DARK_SUM) continue;
      sr += data[i] / sum;
      sg += data[i + 1] / sum;
      n++;
    }
  }
  if (n === 0) throw new Error('상단 스트립에 배경으로 볼 만한 밝은 픽셀이 없다');
  return { cr: sr / n, cg: sg / n };
}

/**
 * 색도 기반 알파. 밝기로 나눠서 비교하므로 비네팅으로 어두워진 배경도 잡는다.
 * 어두운 픽셀은 색도가 노이즈에 지배되므로 판정하지 않고 불투명으로 둔다.
 */
export function chromaAlpha(r, g, b, cal) {
  const sum = r + g + b;
  if (sum < DARK_SUM) return 255;
  const d = Math.hypot(r / sum - cal.cr, g / sum - cal.cg);
  if (d <= CHROMA_IN) return 0;
  if (d >= CHROMA_OUT) return 255;
  return Math.round(((d - CHROMA_IN) / (CHROMA_OUT - CHROMA_IN)) * 255);
}

/**
 * 테두리에서 시작하는 flood fill.
 *
 * 이웃과의 국소 차이만 보므로 밝기가 서서히 변하는 그라데이션 배경을 끝까지 따라간다.
 * 피사체 경계에서는 색이 급격히 튀어서 저절로 멈춘다.
 * 반환값은 1 = 배경인 Uint8Array.
 */
export function floodFillBackground(data, width, height) {
  const n = width * height;
  const mask = new Uint8Array(n);
  const stack = [];
  const candidate = i => data[i * 3 + 2] - data[i * 3] >= BLUE_GUARD;
  const seed = i => { if (!mask[i] && candidate(i)) { mask[i] = 1; stack.push(i); } };

  for (let x = 0; x < width; x++) { seed(x); seed((height - 1) * width + x); }
  for (let y = 0; y < height; y++) { seed(y * width); seed(y * width + width - 1); }

  while (stack.length) {
    const i = stack.pop();
    const x = i % width;
    const y = (i - x) / width;
    const o = i * 3;
    const r = data[o], g = data[o + 1], b = data[o + 2];
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      const j = ny * width + nx;
      if (mask[j] || !candidate(j)) continue;
      const p = j * 3;
      if (Math.abs(data[p] - r) <= FILL_TOL &&
          Math.abs(data[p + 1] - g) <= FILL_TOL &&
          Math.abs(data[p + 2] - b) <= FILL_TOL) {
        mask[j] = 1;
        stack.push(j);
      }
    }
  }
  return mask;
}

/** 피사체는 하나의 덩어리다. 가장 큰 연결 성분만 남기고 나머지는 배경으로 지운다. */
export function keepLargestComponent(alpha, width, height) {
  const n = width * height;
  const label = new Int32Array(n).fill(-1);
  let best = -1, bestSize = 0, next = 0;

  for (let i = 0; i < n; i++) {
    if (alpha[i] < 8 || label[i] >= 0) continue;
    const queue = [i];
    label[i] = next;
    let size = 0;
    while (queue.length) {
      const c = queue.pop();
      size++;
      const x = c % width;
      const y = (c - x) / width;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const j = ny * width + nx;
        if (alpha[j] < 8 || label[j] >= 0) continue;
        label[j] = next;
        queue.push(j);
      }
    }
    if (size > bestSize) { bestSize = size; best = next; }
    next++;
  }

  for (let i = 0; i < n; i++) if (label[i] !== best) alpha[i] = 0;
}

/**
 * 반투명 경계에 남는 파란 테두리를 제거한다.
 * 알파가 낮을수록 파랑을 빨강/초록 중 큰 쪽으로 끌어내린다.
 */
export function despill(r, g, b, alpha) {
  if (alpha >= 250) return { r, g, b };
  const t = 1 - alpha / 250;
  const cap = Math.max(g, r);
  const nb = b > cap ? Math.round(b - (b - cap) * t) : b;
  return { r, g, b: nb };
}

/** 아래쪽 15%를 서서히 투명하게 만들어 흉상이 잘린 단면을 감춘다. */
export function applyBottomFade(alpha, width, height) {
  const start = Math.floor(height * 0.85);
  const span = Math.max(1, height - 1 - start);
  for (let y = start; y < height; y++) {
    const k = 1 - (y - start) / span;
    for (let x = 0; x < width; x++) alpha[y * width + x] *= k;
  }
}

const SRC_DIR = '이미지 정보 폴더';
const OUT_DIR = 'assets/chars';

/** 포트레이트 파일명 → 캐릭터 id. 순서는 프로필 시트 01~05와 같다. */
export const PORTRAITS = [
  ['KakaoTalk_Photo_2026-08-10-14-16-18 001.jpeg', 'seoyeon'],
  ['KakaoTalk_Photo_2026-08-10-14-16-18 002.jpeg', 'yuna'],
  ['KakaoTalk_Photo_2026-08-10-14-16-18 003.jpeg', 'min'],
  ['KakaoTalk_Photo_2026-08-10-14-16-18 004.jpeg', 'jihun'],
  ['KakaoTalk_Photo_2026-08-10-14-16-18 005.jpeg', 'doyun']
];

export async function buildAlphaMask(srcPath) {
  const { data, info } = await sharp(srcPath).removeAlpha().raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const n = width * height;

  const cal = calibrateBackground(data, width, height);
  const filled = floodFillBackground(data, width, height);

  // A(테두리 flood fill) ∪ B(색도 테스트)
  const alpha = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    alpha[i] = filled[i] ? 0 : chromaAlpha(data[i * 3], data[i * 3 + 1], data[i * 3 + 2], cal);
  }

  keepLargestComponent(alpha, width, height);
  applyBottomFade(alpha, width, height);

  return { data, alpha, width, height, cal };
}

export async function processPortrait(srcPath, outPath) {
  const { data, alpha, width, height } = await buildAlphaMask(srcPath);
  const out = Buffer.alloc(width * height * 4);

  for (let i = 0; i < width * height; i++) {
    const a = Math.round(alpha[i]);
    const p = despill(data[i * 3], data[i * 3 + 1], data[i * 3 + 2], a);
    out[i * 4] = p.r;
    out[i * 4 + 1] = p.g;
    out[i * 4 + 2] = p.b;
    out[i * 4 + 3] = a;
  }

  await sharp(out, { raw: { width, height, channels: 4 } })
    .trim({ threshold: 1 })
    .png({ compressionLevel: 9 })
    .toFile(outPath);
}

// process.argv[1]을 그대로 file://에 이어붙이면 경로에 한글/공백이 있을 때
// import.meta.url(퍼센트 인코딩됨)과 절대 일치하지 않는다. pathToFileURL로 맞춘다.
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await mkdir(OUT_DIR, { recursive: true });
  for (const [file, id] of PORTRAITS) {
    const out = `${OUT_DIR}/${id}.png`;
    await processPortrait(`${SRC_DIR}/${file}`, out);
    const m = await sharp(out).metadata();
    console.log(`${id.padEnd(9)} ${m.width}x${m.height}  ${out}`);
  }
}
