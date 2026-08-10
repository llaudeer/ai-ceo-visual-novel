import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calibrateBackground, chromaAlpha, floodFillBackground,
  keepLargestComponent, despill, applyBottomFade
} from '../tools/chromakey.mjs';

/**
 * 합성 이미지 헬퍼. width x height RGB 버퍼를 만들고 fn(x,y)이 [r,g,b]를 준다.
 */
function makeImage(width, height, fn) {
  const data = Buffer.alloc(width * height * 3);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const [r, g, b] = fn(x, y);
      const i = (y * width + x) * 3;
      data[i] = r; data[i + 1] = g; data[i + 2] = b;
    }
  }
  return data;
}

/** 실제 포트레이트에서 측정한 대표 색. */
const BG_BRIGHT = [168, 207, 232];
const BG_DARK = [118, 147, 169];   // 비네팅으로 어두워진 같은 배경
const SKIN = [234, 204, 202];
const WHITE_JACKET = [223, 212, 215];
const BLACK_JACKET = [33, 35, 51];

test('calibrateBackground는 상단 스트립에서 배경 색도를 뽑는다', () => {
  const data = makeImage(20, 100, () => BG_BRIGHT);
  const cal = calibrateBackground(data, 20, 100);
  const sum = 168 + 207 + 232;
  assert.ok(Math.abs(cal.cr - 168 / sum) < 1e-6);
  assert.ok(Math.abs(cal.cg - 207 / sum) < 1e-6);
});

test('calibrateBackground는 어두운 픽셀을 보정에서 제외한다', () => {
  // 상단 절반은 밝은 배경, 나머지 절반은 새까만 픽셀
  const data = makeImage(20, 100, (x) => (x < 10 ? BG_BRIGHT : [2, 2, 2]));
  const cal = calibrateBackground(data, 20, 100);
  const sum = 168 + 207 + 232;
  assert.ok(Math.abs(cal.cr - 168 / sum) < 1e-3, '어두운 픽셀이 보정을 오염시켰다');
});

test('chromaAlpha: 배경색은 완전 투명', () => {
  const cal = { cr: 168 / 607, cg: 207 / 607 };
  assert.equal(chromaAlpha(...BG_BRIGHT, cal), 0);
});

test('chromaAlpha: 비네팅으로 어두워진 같은 배경도 투명', () => {
  const cal = { cr: 168 / 607, cg: 207 / 607 };
  assert.equal(chromaAlpha(...BG_DARK, cal), 0,
    '색도는 밝기에 불변이므로 어두운 배경도 잡혀야 한다');
});

test('chromaAlpha: 피부는 완전 불투명', () => {
  const cal = { cr: 168 / 607, cg: 207 / 607 };
  assert.equal(chromaAlpha(...SKIN, cal), 255);
});

test('chromaAlpha: 흰 재킷은 완전 불투명', () => {
  const cal = { cr: 168 / 607, cg: 207 / 607 };
  assert.equal(chromaAlpha(...WHITE_JACKET, cal), 255,
    '정유나의 흰 재킷이 배경으로 오인되면 안 된다');
});

test('chromaAlpha: 어두운 픽셀은 밝기 게이트로 무조건 불투명', () => {
  const cal = { cr: 168 / 607, cg: 207 / 607 };
  assert.equal(chromaAlpha(...BLACK_JACKET, cal), 255,
    '어두운 픽셀은 색도가 불안정하므로 판정하지 않고 보존한다');
});

test('floodFillBackground는 그라데이션 배경을 끝까지 따라간다', () => {
  // 좌우로 밝기가 서서히 변하는 배경. 국소 차이는 작지만 양끝 차이는 크다.
  const W = 60, H = 40;
  const data = makeImage(W, H, (x) => {
    const k = 0.65 + 0.35 * (x / W);
    return [Math.round(168 * k), Math.round(207 * k), Math.round(232 * k)];
  });
  const mask = floodFillBackground(data, W, H);
  const cleared = mask.reduce((n, v) => n + v, 0);
  assert.equal(cleared, W * H, `${W * H}px 중 ${cleared}px만 지워졌다 — 그라데이션을 못 따라갔다`);
});

test('floodFillBackground는 피사체를 뚫고 들어가지 않는다', () => {
  // 가운데 피부색 사각형
  const W = 60, H = 40;
  const inSubject = (x, y) => x >= 20 && x < 40 && y >= 10 && y < 30;
  const data = makeImage(W, H, (x, y) => (inSubject(x, y) ? SKIN : BG_BRIGHT));
  const mask = floodFillBackground(data, W, H);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (inSubject(x, y)) assert.equal(mask[y * W + x], 0, `피사체 (${x},${y})가 지워졌다`);
    }
  }
});

test('floodFillBackground는 갇힌 배경에 닿지 못한다 — 색도 테스트가 필요한 이유', () => {
  // 피부색 고리 안에 갇힌 배경
  const W = 40, H = 40;
  const ring = (x, y) => x >= 10 && x < 30 && y >= 10 && y < 30;
  const hole = (x, y) => x >= 15 && x < 25 && y >= 15 && y < 25;
  const data = makeImage(W, H, (x, y) => {
    if (hole(x, y)) return BG_BRIGHT;
    if (ring(x, y)) return SKIN;
    return BG_BRIGHT;
  });
  const mask = floodFillBackground(data, W, H);
  assert.equal(mask[20 * W + 20], 0,
    'flood fill이 갇힌 배경에 닿았다면 이 테스트의 전제가 틀린 것이다');
});

test('keepLargestComponent는 고립된 조각을 지운다', () => {
  const W = 20, H = 20;
  const alpha = new Float32Array(W * H);          // 전부 배경
  for (let y = 2; y < 12; y++) for (let x = 2; x < 12; x++) alpha[y * W + x] = 255;  // 큰 덩어리
  for (let y = 15; y < 17; y++) for (let x = 15; x < 17; x++) alpha[y * W + x] = 255; // 작은 섬
  keepLargestComponent(alpha, W, H);
  assert.equal(alpha[5 * W + 5], 255, '큰 덩어리는 남아야 한다');
  assert.equal(alpha[16 * W + 16], 0, '작은 섬은 지워져야 한다');
});

test('despill: 알파가 낮을수록 파란 끼가 더 많이 빠진다', () => {
  const strong = despill(120, 170, 210, 60);
  const weak = despill(120, 170, 210, 250);
  assert.ok(strong.b < weak.b, '알파가 낮은 픽셀의 파랑이 더 줄어야 한다');
});

test('despill: 불투명 픽셀은 색이 보존된다', () => {
  assert.deepEqual(despill(120, 170, 210, 255), { r: 120, g: 170, b: 210 });
});

test('despill: 파랑이 이미 낮으면 건드리지 않는다', () => {
  assert.deepEqual(despill(200, 180, 100, 40), { r: 200, g: 180, b: 100 });
});

test('applyBottomFade는 아래쪽만 서서히 투명하게 만든다', () => {
  const W = 4, H = 100;
  const alpha = new Float32Array(W * H).fill(255);
  applyBottomFade(alpha, W, H);
  assert.equal(alpha[50 * W + 0], 255, '중간 높이는 손대지 않는다');
  assert.equal(alpha[(H - 1) * W + 0], 0, '맨 아래는 완전 투명');
  const mid = alpha[Math.floor(H * 0.925) * W];
  assert.ok(mid > 40 && mid < 215, `페이드 중간값이 ${mid} — 선형으로 줄지 않았다`);
});
