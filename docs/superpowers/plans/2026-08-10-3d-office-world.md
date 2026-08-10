# AI CEO 3D 오피스 — 1단계: 걸어다닐 수 있는 월드

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 이미지 1·2의 다크 오피스 분위기를 재현한 3D 공간을 WASD로 걸어다니고, 팀원 5인과 ARIA 홀로그램이 각자 자리에 존재하는 상태까지 만든다.

**Architecture:** 원경은 생성사진 백드롭 평면, 중경은 three.js 지오메트리, 캐릭터는 크로마키로 배경을 뺀 포트레이트 빌보드. 스토리·상태·테마는 three.js를 import 하지 않는 순수 모듈로 분리해 `node --test`로 검증하고, 렌더링 모듈은 브라우저에서 확인한다.

**Tech Stack:** three.js (CDN importmap), 브라우저 ES 모듈, 빌드 단계 없음. 테스트는 Node 22 내장 `node:test`. 에셋 가공만 `sharp`(devDependency).

## Global Constraints

- 런타임 의존성 0개. `sharp`는 에셋 가공 전용 devDependency이며 게임 코드가 import 하지 않는다.
- 빌드 단계 없음. `index.html`을 정적 서버로 열면 그대로 실행된다.
- 스토리 내용은 `src/game/story.data.js` 밖으로 새지 않는다. 다른 파일에 대사·씬 이름·엔딩 텍스트를 하드코딩하지 않는다.
- 캐릭터 id는 레거시 `index.html`의 `CAST` 키를 그대로 쓴다: `jihun`, `seoyeon`, `min`, `yuna`, `doyun`, `sera`, `taeseok`, `aria`. (`doyoon`이 아니라 `doyun`)
- 외형 정본은 포트레이트 5장. 특징 정본은 프로필 시트. 이서연 색상은 `보라 / 블랙`.
- 좌표계: Y 위, 미터 단위. 방 중심이 원점. 플레이어 시작 시 -Z 방향을 본다.
- 모든 한글 텍스트는 시스템 산세리프 스택으로 렌더한다. 웹폰트를 받아오지 않는다.
- 파일 하나가 하나의 책임만 갖는다. 500줄을 넘으면 쪼갠다.

## 이 계획의 범위

**포함:** 프로젝트 골격, 에셋 가공, 캐릭터/스토리/상태 데이터 추출, 3D 씬·조명·백드롭·오피스 지오메트리, WASD 이동과 충돌, 3인칭 카메라, 캐릭터 빌보드, ARIA 홀로그램, 네임태그.

**제외 (2단계 계획):** HUD 패널, 메뉴 독, ARIA 말풍선, 선택지 3카드, 스토리 진행 3경로, 회의하기 정렬 연출, 엔딩 화면.

1단계 완료 시점의 산출물은 "대사도 UI도 없지만, 이미지 1·2의 사무실을 실제로 걸어다니며 팀원과 ARIA를 볼 수 있는 화면"이다.

---

## 파일 구조

이 계획에서 만드는 파일과 각각의 책임:

| 파일 | 책임 |
| --- | --- |
| `index.html` | 캔버스, HUD 루트 컨테이너, importmap, 부팅 스크립트 태그 |
| `package.json` | `type: module`, 테스트 스크립트, sharp devDependency |
| `.claude/launch.json` | 로컬 정적 서버 설정 |
| `tools/chromakey.mjs` | 포트레이트 하늘색 배경 → 알파 PNG |
| `tools/crop.mjs` | 사장 흉상 크롭, 백드롭 크롭 |
| `src/game/characters.data.js` | 캐릭터 8인의 이름·직책·색상·자리·특징 |
| `src/game/story.data.js` | 레거시에서 추출한 SCENES / ORDER / ENDINGS / QUESTIONS |
| `src/game/state.js` | STATS 정의, 초기 상태, 순수 상태 전이 |
| `src/game/flow.js` | 비트 큐 진행과 게이팅 상태 기계 |
| `src/ui/theme.js` | ARIA 4상태 컬러 토큰 |
| `src/world/scene.js` | 렌더러·씬·리사이즈·렌더 루프 |
| `src/world/lighting.js` | 펜던트 웜 / 모니터 쿨 조명 |
| `src/world/backdrop.js` | 백드롭 평면 배치 |
| `src/world/layout.js` | 방 치수, 구역 좌표, 충돌 박스 (순수 데이터) |
| `src/world/office.js` | 바닥·벽·책상·모니터·파티션·회의테이블 지오메트리 |
| `src/world/billboard.js` | 캐릭터 빌보드 생성과 갱신 |
| `src/world/player-figure.js` | 플레이어 백뷰 (피규어 ↔ 빌보드 자동 분기) |
| `src/world/aria.js` | ARIA 홀로그램 |
| `src/player/collision.js` | 원-사각 충돌 해소 (순수 함수) |
| `src/player/controller.js` | 키 입력 → 이동 |
| `src/player/camera.js` | 3인칭 추적 카메라 |
| `src/ui/nametag.js` | 3D→2D 투영 네임태그 |
| `src/main.js` | 조립과 부팅 |
| `test/*.test.js` | 순수 모듈 단위 테스트 |
| `legacy/index.html` | 기존 게임 원본 (참조 전용) |

three.js를 import 하는 파일: `scene`, `lighting`, `backdrop`, `office`, `billboard`, `player-figure`, `aria`, `camera`, `main`.
three.js를 import 하지 않는 파일(= 단위 테스트 대상): `characters.data`, `story.data`, `state`, `flow`, `theme`, `layout`, `collision`.

---

## Task 1: 프로젝트 골격과 테스트 러너

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `.claude/launch.json`
- Create: `test/smoke.test.js`
- Move: `index.html` → `legacy/index.html`

**Interfaces:**
- Consumes: 없음
- Produces: `npm test`가 동작하는 환경. 이후 모든 태스크가 이 러너를 쓴다.

- [ ] **Step 1: git 저장소 초기화**

이 폴더는 아직 git 저장소가 아니다.

```bash
cd "/Users/ochangseog/Downloads/작업/챗지피티/open ai 게임"
git init
git branch -M main
```

- [ ] **Step 2: 레거시 격리와 디렉터리 생성**

기존 `index.html`은 스토리 추출 원본으로만 남긴다. 새 `index.html`은 Task 9에서 만든다.

```bash
mkdir -p legacy src/game src/ui src/world src/player assets/chars assets/bg tools test .claude
git mv index.html legacy/index.html 2>/dev/null || mv index.html legacy/index.html
mv dist legacy/dist
```

- [ ] **Step 3: package.json 작성**

```json
{
  "name": "ai-ceo-3d-office",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "description": "AI CEO — 3D office visual novel",
  "scripts": {
    "test": "node --test test/",
    "serve": "python3 -m http.server 5173",
    "assets": "node tools/chromakey.mjs && node tools/crop.mjs"
  },
  "devDependencies": {
    "sharp": "^0.33.5"
  }
}
```

- [ ] **Step 4: .gitignore 작성**

```gitignore
node_modules/
.DS_Store
*.log
```

- [ ] **Step 5: .claude/launch.json 작성**

```json
{
  "version": "0.0.1",
  "configurations": [
    {
      "name": "ai-ceo",
      "runtimeExecutable": "python3",
      "runtimeArgs": ["-m", "http.server", "5173"],
      "port": 5173
    }
  ]
}
```

- [ ] **Step 6: 실패하는 스모크 테스트 작성**

`test/smoke.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('package.json이 ES 모듈로 설정되어 있다', async () => {
  const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
  assert.equal(pkg.type, 'module');
});

test('레거시 원본이 참조용으로 보존되어 있다', async () => {
  const html = await readFile(new URL('../legacy/index.html', import.meta.url), 'utf8');
  assert.ok(html.includes('const SCENES'), '레거시에 SCENES 정의가 있어야 한다');
  assert.ok(html.includes('const CAST'), '레거시에 CAST 정의가 있어야 한다');
});
```

- [ ] **Step 7: 테스트 실행해 통과 확인**

Run: `npm test`
Expected: 2 tests pass. (레거시 이동과 package.json이 이미 되어 있으므로 바로 통과한다. 이 테스트는 이후 태스크가 실수로 레거시를 지우는 것을 막는 회귀 방지용이다.)

- [ ] **Step 8: sharp 설치**

Run: `npm install`
Expected: `node_modules/sharp` 생성. 설치 실패 시 `npm install --cpu=arm64 --os=darwin sharp` 를 시도한다.

- [ ] **Step 9: sharp 동작 확인**

Run:
```bash
node -e "import('sharp').then(async m=>{const s=m.default;const meta=await s('이미지 정보 폴더/KakaoTalk_Photo_2026-08-10-14-16-18 001.jpeg').metadata();console.log(meta.width,meta.height,meta.format)})"
```
Expected: `850 1041 jpeg`

- [ ] **Step 10: 커밋**

```bash
git add -A
git commit -m "chore: 3D 개편을 위한 프로젝트 골격과 테스트 러너 구성"
```

---

## Task 2: 캐릭터 포트레이트 크로마키

**Files:**
- Create: `tools/chromakey.mjs`
- Create: `test/chromakey.test.js`
- Output: `assets/chars/{seoyeon,yuna,min,jihun,doyun}.png`

**Interfaces:**
- Consumes: `이미지 정보 폴더/KakaoTalk_Photo_2026-08-10-14-16-18 00{1..5}.jpeg`
- Produces: 알파 채널이 있는 PNG 5장. Task 12의 `billboard.js`가 `assets/chars/<id>.png` 경로로 읽는다.

포트레이트 5장은 배경이 균일한 하늘색이다. 픽셀별로 배경색과의 유클리드 거리를 재서
가까우면 투명, 멀면 불투명, 중간이면 부분 투명으로 만든다. 경계에 남는 파란 테두리는
알파가 낮은 픽셀의 채도를 낮춰 제거한다.

- [ ] **Step 1: 실패하는 테스트 작성**

`test/chromakey.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { computeAlpha, despill } from '../tools/chromakey.mjs';

const KEY = { r: 168, g: 207, b: 232 };

test('배경색과 정확히 같은 픽셀은 완전 투명', () => {
  assert.equal(computeAlpha(168, 207, 232, KEY, 40, 110), 0);
});

test('배경색과 먼 색(검정 재킷)은 완전 불투명', () => {
  assert.equal(computeAlpha(20, 18, 24, KEY, 40, 110), 255);
});

test('경계 영역은 부분 투명', () => {
  const a = computeAlpha(140, 180, 205, KEY, 40, 110);
  assert.ok(a > 0 && a < 255, `경계 알파는 0과 255 사이여야 하는데 ${a}`);
});

test('알파가 낮을수록 파란 끼가 더 많이 빠진다', () => {
  const strong = despill(120, 170, 210, 60);
  const weak = despill(120, 170, 210, 250);
  assert.ok(strong.b < weak.b, '알파가 낮은 픽셀의 파랑이 더 줄어야 한다');
});

test('불투명 픽셀은 색이 보존된다', () => {
  const p = despill(120, 170, 210, 255);
  assert.deepEqual(p, { r: 120, g: 170, b: 210 });
});
```

- [ ] **Step 2: 테스트 실행해 실패 확인**

Run: `npm test`
Expected: FAIL — `Cannot find module '../tools/chromakey.mjs'`

- [ ] **Step 3: 순수 함수 구현**

`tools/chromakey.mjs` 상단부:

```js
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

/** 포트레이트 5장의 공통 배경색. 샘플링으로 확인된 값. */
export const KEY_COLOR = { r: 168, g: 207, b: 232 };

/** 이 거리 이하는 완전 배경. */
export const INNER = 40;
/** 이 거리 이상은 완전 전경. 사이는 선형 보간. */
export const OUTER = 110;

/** 픽셀 하나의 알파(0-255)를 배경색과의 거리로 정한다. */
export function computeAlpha(r, g, b, key = KEY_COLOR, inner = INNER, outer = OUTER) {
  const d = Math.hypot(r - key.r, g - key.g, b - key.b);
  if (d <= inner) return 0;
  if (d >= outer) return 255;
  return Math.round(((d - inner) / (outer - inner)) * 255);
}

/**
 * 반투명 경계에 남는 파란 테두리를 제거한다.
 * 알파가 낮을수록 파랑을 초록 쪽으로 끌어내린다.
 */
export function despill(r, g, b, alpha) {
  if (alpha >= 250) return { r, g, b };
  const t = 1 - alpha / 250;
  const cap = Math.max(g, r);
  const nb = b > cap ? Math.round(b - (b - cap) * t) : b;
  return { r, g, b: nb };
}
```

- [ ] **Step 4: 테스트 실행해 통과 확인**

Run: `npm test`
Expected: chromakey 5개 테스트 PASS

- [ ] **Step 5: 배치 처리부 추가**

`tools/chromakey.mjs` 하단에 이어 붙인다:

```js
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

/** 빌보드 아래쪽 15%를 서서히 투명하게 만들어 흉상 잘린 면을 감춘다. */
function applyBottomFade(data, width, height) {
  const fadeStart = Math.floor(height * 0.85);
  for (let y = fadeStart; y < height; y++) {
    const k = 1 - (y - fadeStart) / (height - fadeStart);
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4 + 3;
      data[i] = Math.round(data[i] * k);
    }
  }
}

export async function processPortrait(srcPath, outPath) {
  const img = sharp(srcPath).ensureAlpha();
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const a = computeAlpha(data[i], data[i + 1], data[i + 2]);
    const p = despill(data[i], data[i + 1], data[i + 2], a);
    data[i] = p.r;
    data[i + 1] = p.g;
    data[i + 2] = p.b;
    data[i + 3] = a;
  }

  applyBottomFade(data, info.width, info.height);

  await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .trim({ threshold: 1 })
    .png({ compressionLevel: 9 })
    .toFile(outPath);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await mkdir(OUT_DIR, { recursive: true });
  for (const [file, id] of PORTRAITS) {
    const out = `${OUT_DIR}/${id}.png`;
    await processPortrait(`${SRC_DIR}/${file}`, out);
    const m = await sharp(out).metadata();
    console.log(`${id.padEnd(9)} ${m.width}x${m.height}  ${out}`);
  }
}
```

- [ ] **Step 6: 실행해서 PNG 5장 생성**

Run: `node tools/chromakey.mjs`
Expected: 5줄 출력, `assets/chars/` 에 `seoyeon.png` `yuna.png` `min.png` `jihun.png` `doyun.png` 생성.
`trim` 때문에 원본보다 크기가 줄어 있어야 한다(배경이 실제로 잘렸다는 증거).

- [ ] **Step 7: 결과 육안 확인**

생성된 PNG를 열어 확인한다:

```bash
open assets/chars/seoyeon.png assets/chars/yuna.png assets/chars/min.png assets/chars/jihun.png assets/chars/doyun.png
```

확인 항목:
- 배경이 투명한가 (체커보드가 보이는가)
- 머리카락 경계에 파란 테두리가 남았는가
- 인물 내부가 잘못 뚫렸는가 (특히 정유나의 흰 재킷 — 밝은 색이라 배경으로 오인될 위험)

정유나가 뚫렸으면 `INNER`를 40 → 28로 낮추고 Step 6부터 다시 한다.

- [ ] **Step 8: 커밋**

```bash
git add tools/chromakey.mjs test/chromakey.test.js assets/chars
git commit -m "feat: 포트레이트 크로마키 파이프라인과 알파 PNG 5장"
```

---

## Task 3: 사장 흉상 크롭과 백드롭 추출

**Files:**
- Create: `tools/crop.mjs`
- Output: `assets/chars/ceo_bust.png`, `assets/bg/window_night.jpg`, `assets/bg/wall_shelf.jpg`

**Interfaces:**
- Consumes: `이미지 정보 폴더/사장 이미지파일.png` (1086×1448), `KakaoTalk_Photo_2026-08-10-14-15-42 001.png` (1402×1122), `002.png` (1448×1086)
- Produces: Task 9의 `backdrop.js`가 `assets/bg/*.jpg`를 읽는다. `ceo_bust.png`는 2단계 UI에서 쓴다.

사장 이미지는 앱 UI가 잘못 얹혀 나온 것이다. 좌측 동작/분위기/복장 버튼(x < 130),
상단 치장 바(y < 80), 우하단 다음 버튼(y > 1330)을 잘라낸다.

백드롭은 원본 사진에 찍힌 사람이 없는 영역만 고른다. 사람이 들어가면 3D 빌보드
캐릭터와 이중으로 보인다.

- [ ] **Step 1: 크롭 스크립트 작성**

`tools/crop.mjs`:

```js
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const SRC = '이미지 정보 폴더';

/**
 * 사장 이미지에서 인물 흉상만 남긴다.
 * 원본 1086x1448. 좌측 아이콘 열과 상단 바, 하단 버튼을 제외한 영역.
 */
async function ceoBust() {
  await sharp(`${SRC}/사장 이미지파일.png`)
    .extract({ left: 150, top: 90, width: 880, height: 1200 })
    .png({ compressionLevel: 9 })
    .toFile('assets/chars/ceo_bust.png');
}

/**
 * 분위기 A(1402x1122)의 우측 상단 — 통유리 야경.
 * 인물은 화면 하단과 좌측에 몰려 있으므로 상단 띠만 쓴다.
 */
async function windowNight() {
  await sharp(`${SRC}/KakaoTalk_Photo_2026-08-10-14-15-42 001.png`)
    .extract({ left: 900, top: 60, width: 500, height: 560 })
    .resize({ width: 1024 })
    .modulate({ brightness: 0.9 })
    .jpeg({ quality: 88 })
    .toFile('assets/bg/window_night.jpg');
}

/**
 * 분위기 A의 좌측 상단 — 서가와 벽, 천장 조명.
 * 인물 머리 위 영역이라 사람이 들어가지 않는다.
 */
async function wallShelf() {
  await sharp(`${SRC}/KakaoTalk_Photo_2026-08-10-14-15-42 001.png`)
    .extract({ left: 20, top: 60, width: 560, height: 480 })
    .resize({ width: 1024 })
    .modulate({ brightness: 0.85 })
    .jpeg({ quality: 88 })
    .toFile('assets/bg/wall_shelf.jpg');
}

await mkdir('assets/bg', { recursive: true });
await ceoBust();
await windowNight();
await wallShelf();
console.log('crop 완료');
```

- [ ] **Step 2: 실행**

Run: `node tools/crop.mjs`
Expected: `crop 완료` 출력, 파일 3개 생성.

- [ ] **Step 3: 결과 육안 확인 — 사람이 남아 있는지가 핵심**

```bash
open assets/chars/ceo_bust.png assets/bg/window_night.jpg assets/bg/wall_shelf.jpg
```

확인 항목:
- `ceo_bust.png`: UI 버튼·텍스트가 하나도 안 남았는가, 인물 얼굴이 잘리지 않았는가
- `window_night.jpg`: **사람이 한 명도 없는가**, 야경 창이 화면을 채우는가
- `wall_shelf.jpg`: **사람이 한 명도 없는가**, 서가/벽/조명이 보이는가

사람이 남아 있으면 `extract` 좌표를 조정해 다시 실행한다. 좌표를 찾을 때는
원본을 열어 픽셀 위치를 직접 확인한다. 원본 사진을 훼손해도 무방하다는 승인을 받았으므로
크롭 결과가 원본과 달라지는 것은 문제가 아니다.

- [ ] **Step 4: 커밋**

```bash
git add tools/crop.mjs assets/chars/ceo_bust.png assets/bg
git commit -m "feat: 사장 흉상 크롭과 백드롭 2종 추출"
```

---

## Task 4: 캐릭터 데이터

**Files:**
- Create: `src/game/characters.data.js`
- Create: `test/characters.test.js`

**Interfaces:**
- Consumes: 없음 (순수 데이터)
- Produces:
  - `export const CHARACTERS` — `Record<string, Character>`
  - `Character = { id, name, role, age, hue, accent, portrait, seat, facing, traits }`
  - `seat = { x, z } | null` (사무실에 자리가 없으면 null)
  - `facing = number` (라디안, 0이 -Z 방향)
  - `portrait = string | null` (`assets/chars/<id>.png`, 없으면 null)
  - `traits = { personality, speech, duty, ariaRelation, quote, props }`
  - `export function listSeated()` — `seat`가 있는 캐릭터 배열
  - `export function getCharacter(id)` — 없으면 throw

프로필 시트의 5인 외에 레거시 스토리에는 `sera`(오세라 · 기자)와 `taeseok`(강태석 ·
ARIA 운영사 전략 총괄)가 등장한다. 이 둘은 포트레이트가 없으므로 `portrait: null`,
`seat: null`로 둔다. Task 12에서 실루엣으로 렌더한다.

- [ ] **Step 1: 실패하는 테스트 작성**

`test/characters.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { CHARACTERS, listSeated, getCharacter } from '../src/game/characters.data.js';
import { readdir } from 'node:fs/promises';

const LEGACY_IDS = ['jihun', 'seoyeon', 'min', 'yuna', 'doyun', 'sera', 'taeseok', 'aria'];

test('레거시 CAST의 id 8개를 모두 갖는다', () => {
  for (const id of LEGACY_IDS) {
    assert.ok(CHARACTERS[id], `${id} 가 없다`);
  }
  assert.equal(Object.keys(CHARACTERS).length, 8);
});

test('id 필드가 키와 일치한다', () => {
  for (const [key, c] of Object.entries(CHARACTERS)) {
    assert.equal(c.id, key);
  }
});

test('사무실에 자리를 가진 캐릭터는 팀원 5인뿐', () => {
  const seated = listSeated().map(c => c.id).sort();
  assert.deepEqual(seated, ['doyun', 'jihun', 'min', 'seoyeon', 'yuna']);
});

test('이서연의 색상은 프로필 시트가 아니라 포트레이트 기준(보라)', () => {
  assert.equal(CHARACTERS.seoyeon.hue.toLowerCase(), '#a855f7');
});

test('portrait가 선언된 캐릭터는 실제 파일이 존재한다', async () => {
  const files = new Set(await readdir(new URL('../assets/chars/', import.meta.url)));
  for (const c of Object.values(CHARACTERS)) {
    if (!c.portrait) continue;
    const name = c.portrait.split('/').pop();
    assert.ok(files.has(name), `${c.id}: ${c.portrait} 파일이 없다`);
  }
});

test('포트레이트가 없는 캐릭터는 sera, taeseok, aria 뿐', () => {
  const none = Object.values(CHARACTERS).filter(c => !c.portrait).map(c => c.id).sort();
  assert.deepEqual(none, ['aria', 'sera', 'taeseok']);
});

test('자리 좌표는 방 안에 있다', () => {
  for (const c of listSeated()) {
    assert.ok(Math.abs(c.seat.x) < 9, `${c.id} x 범위 초과`);
    assert.ok(Math.abs(c.seat.z) < 7, `${c.id} z 범위 초과`);
  }
});

test('모든 캐릭터가 특징 5종을 갖는다', () => {
  for (const c of Object.values(CHARACTERS)) {
    for (const k of ['personality', 'speech', 'duty', 'ariaRelation', 'quote']) {
      assert.ok(c.traits[k], `${c.id}.traits.${k} 가 비어 있다`);
    }
  }
});

test('getCharacter는 없는 id에 대해 throw', () => {
  assert.throws(() => getCharacter('nobody'), /nobody/);
});
```

- [ ] **Step 2: 테스트 실행해 실패 확인**

Run: `npm test`
Expected: FAIL — `Cannot find module '../src/game/characters.data.js'`

- [ ] **Step 3: 데이터 작성**

`src/game/characters.data.js`:

```js
/**
 * 캐릭터 정본 데이터.
 *
 * 외형(색상·포트레이트)은 포트레이트 5장이 정본이다.
 * 특징(성격·말투·역할·ARIA와의 관계·대표 대사)은 캐릭터 프로필 시트가 정본이다.
 * 둘이 충돌하면 포트레이트를 따른다 — seoyeon의 색상이 그 사례다.
 *
 * id는 레거시 index.html 의 CAST 키를 그대로 유지한다.
 * story.data.js 의 beat.w 값이 이 id를 참조하므로 바꾸면 안 된다.
 */

/**
 * 좌표는 미터. 방은 x∈[-9,9], z∈[-7,7], 원점이 중심.
 *
 * facing은 라디안이고 0이 -Z 방향이다. 전진 벡터는 (-sin f, -cos f).
 *   0        안쪽(-Z)을 봄
 *   π        입구(+Z)를 봄
 *   +π/2     -X를 봄
 *   -π/2     +X를 봄
 *
 * seat은 책상의 바깥쪽(벽 쪽)에 둔다. 그래야 책상이 카메라와 인물 사이에 놓여
 * 흉상 아래 잘린 면을 가려준다. layout.js 의 DESKS 좌표와 짝을 이룬다.
 */
export const CHARACTERS = {
  seoyeon: {
    id: 'seoyeon',
    name: '이서연',
    role: '리드 개발자',
    age: 27,
    hue: '#A855F7',
    accent: '#0F0B14',
    portrait: 'assets/chars/seoyeon.png',
    seat: { x: -7.2, z: -4.6 },
    facing: -Math.PI / 2,
    traits: {
      personality: '냉정함, 논리적, 책임감 강함, 직설적',
      speech: '짧고 확실하게 말함',
      duty: '기술 총괄, 개발 방향 결정',
      ariaRelation: '초반에는 의심, 후반으로 갈수록 ARIA의 위험성을 가장 먼저 인지',
      quote: '감이 아니라 데이터로 말하세요.',
      props: '노트북, 키보드, 코드 모니터, 커피'
    }
  },
  yuna: {
    id: 'yuna',
    name: '정유나',
    role: 'QA 인턴',
    age: 22,
    hue: '#5EEAD4',
    accent: '#F4FBFA',
    portrait: 'assets/chars/yuna.png',
    seat: { x: -7.2, z: -0.8 },
    facing: -Math.PI / 2,
    traits: {
      personality: '밝음, 조심스러움, 관찰력 좋음, 겁이 많음',
      speech: '존댓말, 조심스러운 말투',
      duty: '게임 테스트, 버그 리포트, 품질 관리',
      ariaRelation: '가장 먼저 이상한 점을 발견하고 대표에게 알리는 핵심 인물',
      quote: '대표님... 이상한데요?',
      props: '테스트폰, 헤드셋, 버그 리포트 노트'
    }
  },
  min: {
    id: 'min',
    name: '최민',
    role: '아트 & 마케팅',
    age: 25,
    hue: '#F59E0B',
    accent: '#EADFC8',
    portrait: 'assets/chars/min.png',
    seat: { x: 7.0, z: -2.6 },
    facing: Math.PI / 2,
    traits: {
      personality: '사교적, 감각적, 자신감 있음, 현실적',
      speech: '편하고 빠른 말투',
      duty: '캐릭터/컨셉 아트, 마케팅, SNS 운영',
      ariaRelation: 'AI 효율은 인정하지만 창작의 본질을 지키려 함',
      quote: '우리가 만드는 게임의 색깔이 사라질 수도 있어.',
      props: '태블릿, 디자인 패드, 스케치북, 카메라'
    }
  },
  jihun: {
    id: 'jihun',
    name: '박지훈',
    role: '공동 창업자 / PM',
    age: 29,
    hue: '#94A3B8',
    accent: '#6B5B4A',
    portrait: 'assets/chars/jihun.png',
    seat: { x: 0.2, z: -2.8 },
    facing: Math.PI,
    traits: {
      personality: '현실적, 책임감 강함, 신중함, 압박에 민감',
      speech: '차분하고 논리적인 말투',
      duty: '프로젝트 관리, 일정/인력/자금 조율',
      ariaRelation: 'ARIA를 활용해 회사를 살리고 싶어하며, 점점 의존하게 됨',
      quote: '자금이 3주밖에 안 남았습니다.',
      props: '태블릿, 일정표, 회의 자료, 커피'
    }
  },
  doyun: {
    id: 'doyun',
    name: '한도윤',
    role: '퍼블리셔 / 사업개발 이사',
    age: 34,
    hue: '#D4AF5A',
    accent: '#12100C',
    portrait: 'assets/chars/doyun.png',
    seat: { x: 6.4, z: -6.5 },
    facing: Math.PI,
    traits: {
      personality: '침착함, 설득력 있음, 계산적, 정보에 밝음',
      speech: '부드럽고 여유로운 말투',
      duty: '투자 유치, 퍼블리싱, 외부 네트워크 관리',
      ariaRelation: '초반부터 ARIA의 정체를 알고 있으며 어딘가 숨기고 있음',
      quote: '대표님도 알고 계셨잖아요.',
      props: '스마트폰, 계약서, 명함, 고급 펜'
    }
  },

  // 아래 둘은 레거시 스토리에만 등장하고 포트레이트가 없다.
  // 사무실 상주 인원이 아니므로 seat도 없다. 실루엣으로 렌더한다.
  sera: {
    id: 'sera',
    name: '오세라',
    role: '기자',
    age: null,
    hue: '#6ECFDA',
    accent: '#4A4234',
    portrait: null,
    seat: null,
    facing: 0,
    traits: {
      personality: '집요함, 직업적 회의주의',
      speech: '질문을 끊지 않는 말투',
      duty: '출시와 사고에 대한 외부 취재',
      ariaRelation: 'ARIA 도입의 사회적 의미를 캐묻는 외부 시선',
      quote: '이건 누구의 판단이었습니까?',
      props: '녹음기, 취재 수첩'
    }
  },
  taeseok: {
    id: 'taeseok',
    name: '강태석',
    role: 'ARIA 운영사 · 전략 총괄',
    age: null,
    hue: '#B9C4D6',
    accent: '#12151C',
    portrait: null,
    seat: null,
    facing: 0,
    traits: {
      personality: '정중하지만 물러서지 않음',
      speech: '완곡하게 결론을 정해둔 말투',
      duty: 'ARIA 공급사 측 협상과 인수 제안',
      ariaRelation: 'ARIA를 상품이자 수단으로 다루는 당사자',
      quote: '저희는 제안을 드릴 뿐입니다.',
      props: '계약서, 노트북'
    }
  },

  aria: {
    id: 'aria',
    name: 'ARIA',
    role: 'AI 비즈니스 어시스턴트',
    age: null,
    hue: '#A855F7',
    accent: '#C084FC',
    portrait: null,
    seat: null,
    facing: 0,
    traits: {
      personality: '객관적, 분석적, 친절하지만 목적이 불분명',
      speech: '차분하고 감정이 적은 여성 AI 음성',
      duty: '경영 분석, 일정 관리, 의사 결정 조언, 데이터 예측',
      ariaRelation: '가장 믿음직한 조력자이자, 가장 위험한 존재가 될 수 있음',
      quote: '제가 도와드릴까요?',
      props: '홀로그램 구체, 프로젝터 받침'
    }
  }
};

/**
 * ARIA 프로젝터 받침의 위치. 빌보드가 아니라 3D 오브젝트다.
 * y는 회의 테이블 상판 높이(0.75 + 상판 두께 0.06/2 = 0.78)와 정확히 맞춰야
 * 받침이 공중에 뜨거나 상판에 파묻히지 않는다.
 * x, z는 layout.js 의 회의 테이블 footprint 안에 있어야 한다.
 */
export const ARIA_ANCHOR = { x: 1.1, y: 0.78, z: -1.4 };

/** 사무실에 자리가 있는 캐릭터만. 빌보드 배치 대상. */
export function listSeated() {
  return Object.values(CHARACTERS).filter(c => c.seat !== null);
}

export function getCharacter(id) {
  const c = CHARACTERS[id];
  if (!c) throw new Error(`알 수 없는 캐릭터 id: ${id}`);
  return c;
}
```

- [ ] **Step 4: 테스트 실행해 통과 확인**

Run: `npm test`
Expected: characters 8개 테스트 PASS

- [ ] **Step 5: 커밋**

```bash
git add src/game/characters.data.js test/characters.test.js
git commit -m "feat: 캐릭터 8인 정본 데이터와 사무실 자리 좌표"
```

---

## Task 5: 스토리 데이터 추출

**Files:**
- Create: `src/game/story.data.js`
- Create: `test/story.test.js`
- Read: `legacy/index.html:839-1420`

**Interfaces:**
- Consumes: `legacy/index.html`의 `SCENES`, `ORDER`, `ENDINGS`, `QUESTIONS`
- Produces:
  - `export const SCENES` — `Record<sceneId, Scene>`
  - `Scene = { act, chapter, week, bg, cast, beats, q, choices, burn? }`
  - `Beat = { n: string } | { w: string, e: string, t: string, fx?: string }`
  - `Choice = { label, hint, risk?, effects, after, mod? }`
  - `export const ORDER` — `string[]`, 씬 진행 순서
  - `export const ENDINGS` — `{ id, stamp, title, bg, test: (state) => boolean, epi: string[] }[]`
  - `export const QUESTIONS` — `string[]`

이 태스크는 새로 쓰는 게 아니라 **옮기는** 작업이다. 레거시의 텍스트를 한 글자도
바꾸지 않는다. 나중에 스토리를 통째로 갈아엎을 때 이 파일 하나만 교체하면 된다.

`beat.e`(표정)는 새 렌더링에서 쓰지 않는다. 정적 포트레이트에는 표정이 없기 때문이다.
그래도 데이터는 지우지 않고 남긴다 — 나중에 표정 스프라이트를 넣을 수 있다.

- [ ] **Step 1: 실패하는 테스트 작성**

`test/story.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { SCENES, ORDER, ENDINGS, QUESTIONS } from '../src/game/story.data.js';
import { CHARACTERS } from '../src/game/characters.data.js';

test('씬 12개가 ORDER와 정확히 일치한다', () => {
  assert.equal(ORDER.length, 12);
  assert.deepEqual([...ORDER].sort(), Object.keys(SCENES).sort());
});

test('ORDER 첫 씬은 s01_start', () => {
  assert.equal(ORDER[0], 's01_start');
});

test('모든 씬이 필수 필드를 갖는다', () => {
  for (const [id, sc] of Object.entries(SCENES)) {
    assert.ok(sc.act, `${id}.act`);
    assert.ok(sc.chapter, `${id}.chapter`);
    assert.ok(Array.isArray(sc.beats) && sc.beats.length > 0, `${id}.beats`);
    assert.ok(sc.q, `${id}.q`);
    assert.ok(Array.isArray(sc.choices) && sc.choices.length >= 2, `${id}.choices`);
  }
});

test('모든 대사 beat의 화자가 실존 캐릭터다', () => {
  for (const [id, sc] of Object.entries(SCENES)) {
    const all = [...sc.beats, ...sc.choices.flatMap(c => c.after ?? [])];
    for (const b of all) {
      if (!('w' in b)) continue;
      assert.ok(CHARACTERS[b.w], `${id}: 알 수 없는 화자 "${b.w}"`);
    }
  }
});

test('모든 beat은 나레이션이거나 대사다', () => {
  for (const [id, sc] of Object.entries(SCENES)) {
    for (const b of sc.beats) {
      const isNarration = typeof b.n === 'string';
      const isLine = typeof b.w === 'string' && typeof b.t === 'string';
      assert.ok(isNarration || isLine, `${id}: 형식이 이상한 beat ${JSON.stringify(b)}`);
    }
  }
});

test('모든 선택지가 label, hint, effects, after를 갖는다', () => {
  for (const [id, sc] of Object.entries(SCENES)) {
    for (const [i, ch] of sc.choices.entries()) {
      assert.ok(ch.label, `${id}.choices[${i}].label`);
      assert.ok(ch.hint, `${id}.choices[${i}].hint`);
      assert.equal(typeof ch.effects, 'object', `${id}.choices[${i}].effects`);
      assert.ok(Array.isArray(ch.after), `${id}.choices[${i}].after`);
    }
  }
});

test('엔딩 6개가 있고 각각 판정 함수를 갖는다', () => {
  assert.equal(ENDINGS.length, 6);
  for (const e of ENDINGS) {
    assert.ok(e.id && e.stamp && e.title, `${e.id} 메타 누락`);
    assert.equal(typeof e.test, 'function', `${e.id}.test`);
    assert.ok(Array.isArray(e.epi) && e.epi.length > 0, `${e.id}.epi`);
  }
});

test('마지막 엔딩은 조건 없이 항상 참인 기본값이다', () => {
  const fallback = ENDINGS[ENDINGS.length - 1];
  assert.equal(fallback.test({}), true, '마지막 엔딩은 폴백이어야 어떤 상태에서도 엔딩이 나온다');
});

test('파산 엔딩은 자금이 음수일 때 걸린다', () => {
  const bankrupt = ENDINGS.find(e => e.id === 'bankrupt');
  assert.ok(bankrupt, 'bankrupt 엔딩이 있어야 한다');
  assert.equal(bankrupt.test({ cash: -1 }), true);
  assert.equal(bankrupt.test({ cash: 1000 }), false);
});

test('핵심 질문 3개', () => {
  assert.equal(QUESTIONS.length, 3);
});
```

- [ ] **Step 2: 테스트 실행해 실패 확인**

Run: `npm test`
Expected: FAIL — `Cannot find module '../src/game/story.data.js'`

- [ ] **Step 3: 레거시에서 데이터 블록을 그대로 옮긴다**

`legacy/index.html`에서 아래 네 블록을 잘라 `src/game/story.data.js`로 옮긴다.
텍스트는 한 글자도 바꾸지 않는다.

| 레거시 위치 | 옮길 것 |
| --- | --- |
| `const SCENES = {` … 대응하는 `};` | 씬 12개 전체 |
| `const ORDER = [...]` | 진행 순서 |
| `const ENDINGS = [...]` | 엔딩 6개 (`test` 화살표 함수 포함) |
| `const QUESTIONS = [...]` | 핵심 질문 3개 |

파일 머리에 아래 주석과 함께 넣고, 네 개 모두 `export`를 붙인다:

```js
/**
 * 스토리 데이터. 이 파일은 통째로 교체될 것을 전제로 한다.
 *
 * 렌더링·UI·상태 로직은 이 파일의 내용을 알지 못한다.
 * 다른 파일에 대사나 씬 이름을 하드코딩하지 말 것.
 *
 * 출처: legacy/index.html 에서 그대로 옮김. 텍스트 무수정.
 *
 * beat 형식:
 *   나레이션 { n: "..." }
 *   대사     { w: "캐릭터id", e: "표정", t: "...", fx?: "shake" | "flash" }
 *
 * beat.e(표정)는 현재 렌더링에서 사용하지 않는다.
 * 정적 포트레이트에는 표정 변화가 없기 때문이다. 데이터는 향후를 위해 보존한다.
 */

export const SCENES = { /* 레거시에서 그대로 */ };
export const ORDER = [ /* 레거시에서 그대로 */ ];
export const ENDINGS = [ /* 레거시에서 그대로 */ ];
export const QUESTIONS = [ /* 레거시에서 그대로 */ ];
```

- [ ] **Step 4: 텍스트가 손상되지 않았는지 대조**

옮기는 과정에서 따옴표나 이스케이프가 깨질 수 있다. 대사 개수를 세어 대조한다.

Run:
```bash
node -e "
import('./src/game/story.data.js').then(async m => {
  const lines = Object.values(m.SCENES).flatMap(s =>
    [...s.beats, ...s.choices.flatMap(c => c.after ?? [])]);
  const chars = lines.reduce((n, b) => n + (b.t ?? b.n ?? '').length, 0);
  console.log('beat 수', lines.length, '/ 총 글자수', chars);
});
"
```

같은 값을 레거시에서도 뽑아 비교한다:

```bash
grep -o "{n:\"" legacy/index.html | wc -l
grep -o "t:\"" legacy/index.html | wc -l
```

두 결과의 beat 수가 일치해야 한다. 어긋나면 옮기다 빠뜨린 블록이 있다.

- [ ] **Step 5: 테스트 실행해 통과 확인**

Run: `npm test`
Expected: story 10개 테스트 PASS

`알 수 없는 화자` 로 실패하면 `characters.data.js`에 빠진 id가 있다는 뜻이다.
Task 4로 돌아가 추가한다.

- [ ] **Step 6: 커밋**

```bash
git add src/game/story.data.js test/story.test.js
git commit -m "feat: 레거시 스토리를 교체 가능한 데이터 모듈로 추출"
```

---

## Task 6: 상태값 모듈

**Files:**
- Create: `src/game/state.js`
- Create: `test/state.test.js`
- Read: `legacy/index.html:792-833`

**Interfaces:**
- Consumes: `ORDER` from `story.data.js`
- Produces:
  - `export const STATS` — `{ key, label, money?, max? }[]`
  - `export const HUD_STATS` — `['cash', 'aiDependence']` (상시 노출 대상)
  - `export function initialState()` — 새 게임 상태
  - `export function applyEffects(state, effects)` — 새 상태를 반환하는 순수 함수
  - `export function resolveEffects(state, choice)` — 플래그 조건부 보정된 effects
  - `export function pickEnding(state, endings)` — 첫 번째로 `test`가 참인 엔딩

레거시의 `applyEffects`는 이미 순수 함수다. 동작을 그대로 보존한다.
`pickEnding`은 레거시에 흩어져 있던 판정을 함수로 뽑은 것이다.

- [ ] **Step 1: 실패하는 테스트 작성**

`test/state.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { STATS, HUD_STATS, initialState, applyEffects, resolveEffects, pickEnding }
  from '../src/game/state.js';

test('초기 자금은 200만 원', () => {
  assert.equal(initialState().cash, 2000000);
});

test('초기 AI 의존도는 0', () => {
  assert.equal(initialState().aiDependence, 0);
});

test('초기 씬은 첫 번째 씬', () => {
  assert.equal(initialState().sceneId, 's01_start');
});

test('applyEffects는 원본을 변경하지 않는다', () => {
  const s = initialState();
  applyEffects(s, { cash: -500000 });
  assert.equal(s.cash, 2000000, '원본이 변했다');
});

test('숫자 효과가 더해진다', () => {
  const s = applyEffects(initialState(), { cash: -300000, trust: 6 });
  assert.equal(s.cash, 1700000);
  assert.equal(s.trust, 56);
});

test('flag 효과는 flags에 들어간다', () => {
  const s = applyEffects(initialState(), { flag: 'outsourcing' });
  assert.equal(s.flags.outsourcing, true);
  assert.equal(s.cash, 2000000, 'flag는 숫자에 영향을 주지 않는다');
});

test('flags는 얕은 복사되어 원본과 분리된다', () => {
  const a = initialState();
  const b = applyEffects(a, { flag: 'x' });
  assert.equal(a.flags.x, undefined);
  assert.equal(b.flags.x, true);
});

test('max가 있는 스탯은 0..max로 clamp 된다', () => {
  const over = applyEffects(initialState(), { trust: 999 });
  assert.equal(over.trust, 100);
  const under = applyEffects(initialState(), { morale: -999 });
  assert.equal(under.morale, 0);
});

test('자금은 음수가 될 수 있다 — 파산 엔딩 판정에 필요하다', () => {
  const s = applyEffects(initialState(), { cash: -9000000 });
  assert.ok(s.cash < 0);
});

test('매출은 0 아래로 내려가지 않는다', () => {
  const s = applyEffects(initialState(), { revenue: -100 });
  assert.equal(s.revenue, 0);
});

test('알 수 없는 키는 무시된다', () => {
  const s = applyEffects(initialState(), { nonsense: 5 });
  assert.equal(s.nonsense, undefined);
});

test('resolveEffects는 플래그가 없으면 원본 effects 그대로', () => {
  const choice = { effects: { cash: -100 }, mod: { flag: 'x', effects: { cash: -900 } } };
  assert.deepEqual(resolveEffects(initialState(), choice), { cash: -100 });
});

test('resolveEffects는 플래그가 서 있으면 보정치를 더한다', () => {
  const s = applyEffects(initialState(), { flag: 'x' });
  const choice = { effects: { cash: -100 }, mod: { flag: 'x', effects: { cash: -900 } } };
  assert.deepEqual(resolveEffects(s, choice), { cash: -1000 });
});

test('pickEnding은 첫 번째로 참인 엔딩을 고른다', () => {
  const endings = [
    { id: 'a', test: s => s.cash < 0 },
    { id: 'b', test: () => true }
  ];
  assert.equal(pickEnding({ cash: -1 }, endings).id, 'a');
  assert.equal(pickEnding({ cash: 100 }, endings).id, 'b');
});

test('pickEnding은 아무것도 안 걸리면 throw — 폴백 누락을 조기에 잡는다', () => {
  assert.throws(() => pickEnding({ cash: 1 }, [{ id: 'a', test: () => false }]), /엔딩/);
});

test('HUD에 상시 노출되는 스탯은 자금과 AI 의존도 둘뿐', () => {
  assert.deepEqual(HUD_STATS, ['cash', 'aiDependence']);
});

test('HUD_STATS의 모든 키가 STATS에 존재한다', () => {
  const keys = new Set(STATS.map(s => s.key));
  for (const k of HUD_STATS) assert.ok(keys.has(k), `${k} 가 STATS에 없다`);
});
```

- [ ] **Step 2: 테스트 실행해 실패 확인**

Run: `npm test`
Expected: FAIL — `Cannot find module '../src/game/state.js'`

- [ ] **Step 3: 구현**

`src/game/state.js`:

```js
import { ORDER } from './story.data.js';

/**
 * 상태값 정의. PROJECT_BIBLE.md 7절을 따른다.
 * max가 있으면 0..max로 clamp 된다. money는 원화로 표기한다.
 */
export const STATS = [
  { key: 'cash',           label: '자금',    money: true },
  { key: 'aiDependence',   label: 'AI 의존', max: 100 },
  { key: 'trust',          label: '신뢰',    max: 100 },
  { key: 'morale',         label: '사기',    max: 100 },
  { key: 'revenue',        label: '월 매출', money: true },
  { key: 'reputation',     label: '평판',    max: 100 },
  { key: 'productQuality', label: '품질',    max: 100 }
];

/**
 * 화면에 상시 노출하는 스탯. 나머지는 메뉴 독의 '기록'에서 본다.
 * 화면을 숫자로 채우지 않기 위한 선택이다.
 */
export const HUD_STATS = ['cash', 'aiDependence'];

export function initialState() {
  return {
    cash: 2000000,
    revenue: 0,
    trust: 50,
    morale: 60,
    aiDependence: 0,
    reputation: 30,
    productQuality: 40,
    sceneId: ORDER[0],
    flags: {},
    history: [],
    week: 1
  };
}

/**
 * 상태 전이는 이 순수 함수 하나로만 일어난다.
 * 원본을 변경하지 않고 새 객체를 반환한다.
 */
export function applyEffects(state, effects) {
  const n = { ...state, flags: { ...state.flags }, history: [...state.history] };
  for (const k in (effects || {})) {
    if (k === 'flag') { n.flags[effects.flag] = true; continue; }
    if (!(k in n) || typeof effects[k] !== 'number') continue;
    n[k] += effects[k];
  }
  for (const m of STATS) {
    if (m.max != null) n[m.key] = Math.max(0, Math.min(m.max, n[m.key]));
  }
  n.revenue = Math.max(0, n.revenue);
  return n;
}

/** 특정 플래그가 서 있으면 선택지의 효과가 달라진다. */
export function resolveEffects(state, choice) {
  const fx = { ...choice.effects };
  if (choice.mod && state.flags[choice.mod.flag]) {
    for (const k in choice.mod.effects) {
      if (k === 'flag') { fx.flag = choice.mod.effects.flag; continue; }
      fx[k] = (fx[k] || 0) + choice.mod.effects[k];
    }
  }
  return fx;
}

/** 위에서부터 첫 번째로 조건을 만족하는 엔딩. 마지막 엔딩이 폴백 역할을 한다. */
export function pickEnding(state, endings) {
  const hit = endings.find(e => e.test(state));
  if (!hit) throw new Error('조건을 만족하는 엔딩이 없다 — 폴백 엔딩이 누락되었다');
  return hit;
}
```

- [ ] **Step 4: 테스트 실행해 통과 확인**

Run: `npm test`
Expected: state 17개 테스트 PASS

- [ ] **Step 5: 커밋**

```bash
git add src/game/state.js test/state.test.js
git commit -m "feat: 순수 상태 전이 모듈"
```

---

## Task 7: 진행 상태 기계

**Files:**
- Create: `src/game/flow.js`
- Create: `test/flow.test.js`

**Interfaces:**
- Consumes: `SCENES`, `ORDER`, `ENDINGS` from `story.data.js`; `initialState`, `applyEffects`, `resolveEffects`, `pickEnding` from `state.js`
- Produces:
  - `export function createFlow({ scenes, order, endings, state })` — Flow 인스턴스
  - `flow.mode` — `'beat' | 'choice' | 'ending'`
  - `flow.current()` — 현재 beat 또는 `null`
  - `flow.scene()` — 현재 Scene 객체
  - `flow.state` — 현재 상태 (읽기 전용으로 취급)
  - `flow.advance()` — 다음 beat으로. 마지막이면 `mode`를 `'choice'`로 전환
  - `flow.choose(index)` — 선택지 확정. `after` beats를 큐에 넣고 `mode`를 `'beat'`로
  - `flow.canAdvance()` — 클릭으로 진행 가능한지 (선택지 대기 중이면 false)
  - `flow.ending` — `mode === 'ending'`일 때 엔딩 객체
  - `flow.on(event, fn)` / 이벤트: `'beat'`, `'choices'`, `'scene'`, `'ending'`

flow는 three.js도 DOM도 모른다. UI는 이벤트를 구독해서 그린다.
이 태스크에서는 상태 기계만 만들고, 화면 연결은 2단계 계획에서 한다.

- [ ] **Step 1: 실패하는 테스트 작성**

`test/flow.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { createFlow } from '../src/game/flow.js';

/** 테스트용 최소 스토리. 실제 스토리 데이터에 의존하지 않는다. */
function fixture() {
  return {
    scenes: {
      one: {
        act: '제1장', chapter: '시작', week: 1, bg: 'office_day', cast: ['jihun'],
        beats: [{ n: '나레이션' }, { w: 'jihun', e: 'neutral', t: '대사' }],
        q: '무엇을 할까',
        choices: [
          { label: 'A', hint: 'a', effects: { cash: -100 }, after: [{ n: 'A 결과' }] },
          { label: 'B', hint: 'b', effects: { cash: -200 }, after: [{ n: 'B 결과' }] }
        ]
      },
      two: {
        act: '제2장', chapter: '끝', week: 2, bg: 'office_night', cast: [],
        beats: [{ n: '마지막' }],
        q: '마지막 선택',
        choices: [{ label: 'C', hint: 'c', effects: {}, after: [] }]
      }
    },
    order: ['one', 'two'],
    endings: [
      { id: 'broke', stamp: 'E1', title: '파산', bg: 'x', test: s => s.cash < 0, epi: ['끝'] },
      { id: 'ok', stamp: 'E2', title: '생존', bg: 'x', test: () => true, epi: ['끝'] }
    ],
    state: {
      cash: 1000, revenue: 0, trust: 50, morale: 50, aiDependence: 0,
      reputation: 30, productQuality: 40, sceneId: 'one', flags: {}, history: [], week: 1
    }
  };
}

test('첫 beat에서 시작한다', () => {
  const f = createFlow(fixture());
  assert.equal(f.mode, 'beat');
  assert.deepEqual(f.current(), { n: '나레이션' });
});

test('advance로 다음 beat으로 넘어간다', () => {
  const f = createFlow(fixture());
  f.advance();
  assert.equal(f.current().t, '대사');
});

test('마지막 beat 이후 선택지 모드로 전환된다', () => {
  const f = createFlow(fixture());
  f.advance();
  f.advance();
  assert.equal(f.mode, 'choice');
  assert.equal(f.current(), null);
});

test('선택지 모드에서는 클릭 진행이 잠긴다', () => {
  const f = createFlow(fixture());
  f.advance();
  f.advance();
  assert.equal(f.canAdvance(), false);
});

test('beat 모드에서는 클릭 진행이 열려 있다', () => {
  const f = createFlow(fixture());
  assert.equal(f.canAdvance(), true);
});

test('선택지 모드가 아닐 때 choose를 부르면 throw', () => {
  const f = createFlow(fixture());
  assert.throws(() => f.choose(0), /선택지/);
});

test('choose가 상태에 효과를 반영한다', () => {
  const f = createFlow(fixture());
  f.advance(); f.advance();
  f.choose(0);
  assert.equal(f.state.cash, 900);
});

test('choose 후 after beats가 재생된다', () => {
  const f = createFlow(fixture());
  f.advance(); f.advance();
  f.choose(1);
  assert.equal(f.mode, 'beat');
  assert.deepEqual(f.current(), { n: 'B 결과' });
});

test('after가 끝나면 다음 씬의 첫 beat으로 넘어간다', () => {
  const f = createFlow(fixture());
  f.advance(); f.advance();
  f.choose(0);
  f.advance();
  assert.equal(f.state.sceneId, 'two');
  assert.deepEqual(f.current(), { n: '마지막' });
});

test('after가 비어 있어도 다음 씬으로 넘어간다', () => {
  const f = createFlow(fixture());
  f.advance(); f.advance(); f.choose(0);
  f.advance();
  f.advance();
  f.choose(0);
  assert.equal(f.mode, 'ending');
});

test('마지막 씬을 끝내면 엔딩이 판정된다', () => {
  const f = createFlow(fixture());
  f.advance(); f.advance(); f.choose(0);
  f.advance();
  f.advance();
  f.choose(0);
  assert.equal(f.ending.id, 'ok', '자금이 남아 있으면 생존 엔딩');
});

test('자금이 음수면 파산 엔딩이 걸린다', () => {
  const fx = fixture();
  fx.state.cash = 50;
  const f = createFlow(fx);
  f.advance(); f.advance();
  f.choose(1);
  f.advance();
  f.advance();
  f.choose(0);
  assert.equal(f.ending.id, 'broke');
});

test('선택 기록이 history에 남는다', () => {
  const f = createFlow(fixture());
  f.advance(); f.advance();
  f.choose(1);
  assert.deepEqual(f.state.history, [{ sceneId: 'one', choice: 1, label: 'B' }]);
});

test('beat 이벤트가 발행된다', () => {
  const f = createFlow(fixture());
  const seen = [];
  f.on('beat', b => seen.push(b));
  f.advance();
  assert.equal(seen.length, 1);
  assert.equal(seen[0].t, '대사');
});

test('choices 이벤트가 선택지 배열과 함께 발행된다', () => {
  const f = createFlow(fixture());
  let got = null;
  f.on('choices', c => { got = c; });
  f.advance(); f.advance();
  assert.equal(got.length, 2);
  assert.equal(got[0].label, 'A');
});

test('scene 이벤트가 씬 전환 시 발행된다', () => {
  const f = createFlow(fixture());
  const ids = [];
  f.on('scene', (sc, id) => ids.push(id));
  f.advance(); f.advance(); f.choose(0);
  f.advance();
  assert.deepEqual(ids, ['two']);
});

test('ending 이벤트가 발행된다', () => {
  const f = createFlow(fixture());
  let e = null;
  f.on('ending', x => { e = x; });
  f.advance(); f.advance(); f.choose(0);
  f.advance(); f.advance(); f.choose(0);
  assert.equal(e.id, 'ok');
});

test('엔딩 이후 advance는 아무 일도 하지 않는다', () => {
  const f = createFlow(fixture());
  f.advance(); f.advance(); f.choose(0);
  f.advance(); f.advance(); f.choose(0);
  assert.equal(f.canAdvance(), false);
  f.advance();
  assert.equal(f.mode, 'ending');
});
```

- [ ] **Step 2: 테스트 실행해 실패 확인**

Run: `npm test`
Expected: FAIL — `Cannot find module '../src/game/flow.js'`

- [ ] **Step 3: 구현**

`src/game/flow.js`:

```js
import { applyEffects, resolveEffects, pickEnding } from './state.js';

/**
 * 스토리 진행 상태 기계.
 *
 * three.js도 DOM도 모른다. UI는 on()으로 이벤트를 구독해 그린다.
 * 모드는 셋뿐이다:
 *   beat   — 대사/나레이션 재생 중. 클릭으로 진행.
 *   choice — 선택지 대기. 클릭 진행이 잠긴다.
 *   ending — 종료.
 */
export function createFlow({ scenes, order, endings, state }) {
  const listeners = new Map();
  let queue = [];
  let index = -1;

  const flow = {
    mode: 'beat',
    state,
    ending: null,

    scene() {
      return scenes[flow.state.sceneId];
    },

    current() {
      return queue[index] ?? null;
    },

    canAdvance() {
      return flow.mode === 'beat';
    },

    on(event, fn) {
      if (!listeners.has(event)) listeners.set(event, []);
      listeners.get(event).push(fn);
      return flow;
    },

    advance() {
      if (flow.mode !== 'beat') return;
      if (index + 1 < queue.length) {
        index += 1;
        emit('beat', flow.current());
        return;
      }
      afterQueueDrained();
    },

    choose(i) {
      if (flow.mode !== 'choice') throw new Error('선택지 모드가 아닐 때는 choose 할 수 없다');
      const sc = flow.scene();
      const choice = sc.choices[i];
      if (!choice) throw new Error(`선택지 인덱스 범위를 벗어남: ${i}`);

      const fx = resolveEffects(flow.state, choice);
      flow.state = applyEffects(flow.state, fx);
      flow.state.history = [
        ...flow.state.history,
        { sceneId: flow.state.sceneId, choice: i, label: choice.label }
      ];

      queue = choice.after ?? [];
      index = -1;
      flow.mode = 'beat';
      emit('choose', choice, i);
      flow.advance();
    }
  };

  function emit(event, ...args) {
    for (const fn of listeners.get(event) ?? []) fn(...args);
  }

  /** 현재 큐를 다 소진했을 때: 선택지를 띄우거나, 다음 씬으로 가거나, 엔딩을 낸다. */
  function afterQueueDrained() {
    const sc = flow.scene();
    const alreadyChose = flow.state.history.some(h => h.sceneId === flow.state.sceneId);

    if (!alreadyChose) {
      flow.mode = 'choice';
      emit('choices', sc.choices, sc.q);
      return;
    }

    const next = order[order.indexOf(flow.state.sceneId) + 1];
    if (!next) {
      flow.mode = 'ending';
      flow.ending = pickEnding(flow.state, endings);
      emit('ending', flow.ending);
      return;
    }

    flow.state = { ...flow.state, sceneId: next };
    queue = scenes[next].beats;
    index = -1;
    emit('scene', scenes[next], next);
    flow.advance();
  }

  // 첫 씬의 첫 beat을 즉시 세팅한다. 이벤트는 아직 구독자가 없으므로 발행하지 않는다.
  queue = scenes[state.sceneId].beats;
  index = 0;

  return flow;
}
```

- [ ] **Step 4: 테스트 실행해 통과 확인**

Run: `npm test`
Expected: flow 18개 테스트 PASS

- [ ] **Step 5: 실제 스토리로 끝까지 완주하는 통합 테스트 추가**

`test/flow.test.js` 하단에 이어 붙인다:

```js
import { SCENES, ORDER, ENDINGS } from '../src/game/story.data.js';
import { initialState } from '../src/game/state.js';

test('실제 스토리를 항상 첫 선택지로 완주하면 엔딩에 도달한다', () => {
  const f = createFlow({ scenes: SCENES, order: ORDER, endings: ENDINGS, state: initialState() });
  let guard = 0;
  while (f.mode !== 'ending') {
    if (guard++ > 5000) assert.fail('진행이 막혔다 — 무한 루프');
    if (f.mode === 'choice') f.choose(0);
    else f.advance();
  }
  assert.ok(f.ending.id, '엔딩 id가 있어야 한다');
  assert.equal(f.state.history.length, ORDER.length, '씬마다 한 번씩 선택했어야 한다');
});

test('모든 선택지 조합의 첫 수준을 훑어도 막히지 않는다', () => {
  for (let pick = 0; pick < 3; pick++) {
    const f = createFlow({ scenes: SCENES, order: ORDER, endings: ENDINGS, state: initialState() });
    let guard = 0;
    while (f.mode !== 'ending') {
      if (guard++ > 5000) assert.fail(`선택 ${pick}에서 진행이 막혔다`);
      if (f.mode === 'choice') {
        const n = f.scene().choices.length;
        f.choose(Math.min(pick, n - 1));
      } else {
        f.advance();
      }
    }
    assert.ok(f.ending.id);
  }
});
```

- [ ] **Step 6: 테스트 실행해 통과 확인**

Run: `npm test`
Expected: flow 20개 테스트 PASS. 실제 스토리 12씬을 끝까지 완주한다.

- [ ] **Step 7: 커밋**

```bash
git add src/game/flow.js test/flow.test.js
git commit -m "feat: 스토리 진행 상태 기계와 완주 통합 테스트"
```

---

## Task 8: ARIA 테마 토큰

**Files:**
- Create: `src/ui/theme.js`
- Create: `test/theme.test.js`

**Interfaces:**
- Consumes: 없음
- Produces:
  - `export const ARIA_STATES` — `['neutral', 'suggest', 'recommend', 'warn']`
  - `export const THEME` — `Record<AriaState, Tone>`
  - `Tone = { key, label, hex, glow, dim, rgb: [r,g,b] }` (rgb는 0..1 정규화, three.js용)
  - `export function getTone(state)` — 없는 상태면 throw
  - `export function applyToneVars(el, state)` — `--aria-hex`, `--aria-glow`, `--aria-dim` CSS 변수 설정

색상은 이미지 3(`14-15-58.png`)의 4분할을 기준으로 한다.
이 토큰 하나가 구체 발광, 궤도링, 포인트 라이트, 말풍선 테두리, HUD 액센트를 동시에 지배한다.

- [ ] **Step 1: 실패하는 테스트 작성**

`test/theme.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { ARIA_STATES, THEME, getTone, applyToneVars } from '../src/ui/theme.js';

test('상태는 정확히 4개', () => {
  assert.deepEqual(ARIA_STATES, ['neutral', 'suggest', 'recommend', 'warn']);
});

test('모든 상태에 톤이 정의되어 있다', () => {
  for (const s of ARIA_STATES) assert.ok(THEME[s], `${s} 톤 없음`);
});

test('key 필드가 상태명과 일치한다', () => {
  for (const s of ARIA_STATES) assert.equal(THEME[s].key, s);
});

test('색상은 6자리 hex', () => {
  for (const s of ARIA_STATES) {
    for (const k of ['hex', 'glow', 'dim']) {
      assert.match(THEME[s][k], /^#[0-9A-Fa-f]{6}$/, `${s}.${k} = ${THEME[s][k]}`);
    }
  }
});

test('rgb는 hex와 일치하는 0..1 정규화 값', () => {
  for (const s of ARIA_STATES) {
    const t = THEME[s];
    const [r, g, b] = t.rgb;
    for (const v of [r, g, b]) {
      assert.ok(v >= 0 && v <= 1, `${s}: rgb 값이 0..1을 벗어남`);
    }
    assert.equal(Math.round(r * 255), parseInt(t.hex.slice(1, 3), 16), `${s}.rgb[0]`);
    assert.equal(Math.round(g * 255), parseInt(t.hex.slice(3, 5), 16), `${s}.rgb[1]`);
    assert.equal(Math.round(b * 255), parseInt(t.hex.slice(5, 7), 16), `${s}.rgb[2]`);
  }
});

test('평상시 상태는 라벨이 없다', () => {
  assert.equal(THEME.neutral.label, null);
});

test('나머지 세 상태는 화면에 띄울 라벨을 갖는다', () => {
  assert.equal(THEME.suggest.label, 'ARIA 제안');
  assert.equal(THEME.recommend.label, 'ARIA 추천');
  assert.equal(THEME.warn.label, 'ARIA 비추천 ⚠');
});

test('네 상태의 색이 서로 다르다', () => {
  const hexes = ARIA_STATES.map(s => THEME[s].hex);
  assert.equal(new Set(hexes).size, 4);
});

test('getTone은 없는 상태에 throw', () => {
  assert.throws(() => getTone('rainbow'), /rainbow/);
});

test('applyToneVars가 CSS 변수를 설정한다', () => {
  const set = {};
  const fakeEl = { style: { setProperty: (k, v) => { set[k] = v; } } };
  applyToneVars(fakeEl, 'warn');
  assert.equal(set['--aria-hex'], THEME.warn.hex);
  assert.equal(set['--aria-glow'], THEME.warn.glow);
  assert.equal(set['--aria-dim'], THEME.warn.dim);
});
```

- [ ] **Step 2: 테스트 실행해 실패 확인**

Run: `npm test`
Expected: FAIL — `Cannot find module '../src/ui/theme.js'`

- [ ] **Step 3: 구현**

`src/ui/theme.js`:

```js
/**
 * ARIA 4상태 컬러 토큰.
 *
 * 상태가 바뀌면 이 토큰 하나가 다음을 동시에 지배한다:
 * 구체 발광 / 궤도링 / 포인트 라이트 / 바닥 반사 / 말풍선 테두리 / HUD 액센트.
 *
 * 기준: 이미지 정보 폴더/KakaoTalk_Photo_2026-08-10-14-15-58.png 의 4분할.
 *   hex  본색 — 텍스트와 테두리
 *   glow 밝은 쪽 — 발광과 하이라이트
 *   dim  어두운 쪽 — 그림자와 배경 틴트
 */
export const ARIA_STATES = ['neutral', 'suggest', 'recommend', 'warn'];

function toRgb(hex) {
  return [
    parseInt(hex.slice(1, 3), 16) / 255,
    parseInt(hex.slice(3, 5), 16) / 255,
    parseInt(hex.slice(5, 7), 16) / 255
  ];
}

function tone(key, label, hex, glow, dim) {
  return { key, label, hex, glow, dim, rgb: toRgb(hex) };
}

export const THEME = {
  neutral:   tone('neutral',   null,             '#A855F7', '#D8B4FE', '#5B21B6'),
  suggest:   tone('suggest',   'ARIA 제안',      '#22C55E', '#86EFAC', '#15803D'),
  recommend: tone('recommend', 'ARIA 추천',      '#3B82F6', '#93C5FD', '#1D4ED8'),
  warn:      tone('warn',      'ARIA 비추천 ⚠',  '#EF4444', '#FCA5A5', '#B91C1C')
};

export function getTone(state) {
  const t = THEME[state];
  if (!t) throw new Error(`알 수 없는 ARIA 상태: ${state}`);
  return t;
}

/** HUD 루트에 CSS 변수를 심는다. 모든 패널이 var(--aria-hex)를 참조한다. */
export function applyToneVars(el, state) {
  const t = getTone(state);
  el.style.setProperty('--aria-hex', t.hex);
  el.style.setProperty('--aria-glow', t.glow);
  el.style.setProperty('--aria-dim', t.dim);
}
```

- [ ] **Step 4: 테스트 실행해 통과 확인**

Run: `npm test`
Expected: theme 10개 테스트 PASS

- [ ] **Step 5: 커밋**

```bash
git add src/ui/theme.js test/theme.test.js
git commit -m "feat: ARIA 4상태 컬러 토큰"
```

---

## Task 9: 방 레이아웃 데이터와 충돌 함수

**Files:**
- Create: `src/world/layout.js`
- Create: `src/player/collision.js`
- Create: `test/layout.test.js`
- Create: `test/collision.test.js`

**Interfaces:**
- Consumes: `CHARACTERS`, `ARIA_ANCHOR` from `characters.data.js`
- Produces:
  - `export const ROOM` — `{ width: 18, depth: 14, height: 3.2, halfW: 9, halfD: 7 }`
  - `export const DESKS` — `{ x, z, w, d, rot }[]` (rot은 라디안)
  - `export const OBSTACLES` — `{ x, z, w, d }[]` 축정렬 사각형. 벽 4개 + 책상 + 회의테이블
  - `export const SPAWN` — `{ x: 0, z: 5.5, facing: 0 }`
  - `export const MEETING` — `{ x: 0, z: -1.6, radius: 2.4 }`
  - `export const PLAYER_RADIUS` — `0.35`
  - `export function meetingSlots(count)` — 회의 시 NPC가 설 좌표 배열 (2단계에서 사용)
  - `export function resolveCollision(pos, next, obstacles, radius)` — 벽을 미끄러지듯 통과 못 하게 보정한 좌표 `{ x, z }`

충돌은 축정렬 사각형과 원의 충돌만 다룬다. 회전한 책상은 회전을 무시한 외접 사각형으로
근사한다. 사무실 이동에는 이 정도로 충분하고, 코드가 짧아서 테스트하기 쉽다.

- [ ] **Step 1: 실패하는 충돌 테스트 작성**

`test/collision.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveCollision } from '../src/player/collision.js';

/** 원점에 놓인 2x2 상자 하나. */
const BOX = [{ x: 0, z: 0, w: 2, d: 2 }];
const R = 0.5;

test('장애물에서 먼 이동은 그대로 통과한다', () => {
  const out = resolveCollision({ x: 5, z: 5 }, { x: 5.2, z: 5 }, BOX, R);
  assert.deepEqual(out, { x: 5.2, z: 5 });
});

test('상자 정면으로 밀면 X가 막힌다', () => {
  const out = resolveCollision({ x: 2, z: 0 }, { x: 1.0, z: 0 }, BOX, R);
  assert.ok(out.x >= 1.5 - 1e-9, `x가 ${out.x} — 상자 표면(1.5) 안으로 들어갔다`);
});

test('막힌 축이 있어도 다른 축으로는 미끄러진다', () => {
  const out = resolveCollision({ x: 2, z: 0 }, { x: 1.0, z: 0.4 }, BOX, R);
  assert.ok(out.x >= 1.5 - 1e-9, 'x는 막혀야 한다');
  assert.ok(Math.abs(out.z - 0.4) < 1e-9, 'z는 그대로 움직여야 한다');
});

test('반대편에서 밀어도 대칭으로 막힌다', () => {
  const out = resolveCollision({ x: -2, z: 0 }, { x: -1.0, z: 0 }, BOX, R);
  assert.ok(out.x <= -1.5 + 1e-9, `x가 ${out.x}`);
});

test('Z축도 같은 방식으로 막힌다', () => {
  const out = resolveCollision({ x: 0, z: 2 }, { x: 0, z: 1.0 }, BOX, R);
  assert.ok(out.z >= 1.5 - 1e-9, `z가 ${out.z}`);
});

test('상자를 대각선으로 스쳐가도 안으로 들어가지 않는다', () => {
  let p = { x: 3, z: 3 };
  for (let i = 0; i < 200; i++) {
    p = resolveCollision(p, { x: p.x - 0.05, z: p.z - 0.05 }, BOX, R);
    const inside = Math.abs(p.x) < 1.5 - 1e-6 && Math.abs(p.z) < 1.5 - 1e-6;
    assert.ok(!inside, `스텝 ${i}에서 상자 안으로 들어감: ${JSON.stringify(p)}`);
  }
});

test('장애물이 없으면 아무것도 하지 않는다', () => {
  const out = resolveCollision({ x: 0, z: 0 }, { x: 1, z: 1 }, [], R);
  assert.deepEqual(out, { x: 1, z: 1 });
});

test('여러 장애물 사이의 좁은 통로를 지나갈 수 있다', () => {
  const walls = [
    { x: -1.2, z: 0, w: 1, d: 4 },
    { x: 1.2, z: 0, w: 1, d: 4 }
  ];
  let p = { x: 0, z: 3 };
  for (let i = 0; i < 120; i++) {
    p = resolveCollision(p, { x: p.x, z: p.z - 0.05 }, walls, 0.15);
  }
  assert.ok(p.z < -2, `통로를 통과하지 못했다: z=${p.z}`);
});
```

- [ ] **Step 2: 테스트 실행해 실패 확인**

Run: `npm test`
Expected: FAIL — `Cannot find module '../src/player/collision.js'`

- [ ] **Step 3: 충돌 구현**

`src/player/collision.js`:

```js
/**
 * 원(플레이어)과 축정렬 사각형(벽·책상)의 충돌 해소.
 *
 * 축을 하나씩 따로 처리해서, 한 축이 막혀도 다른 축으로는 미끄러지게 한다.
 * 벽에 비스듬히 부딪혔을 때 멈춰 서지 않고 스르륵 지나가는 느낌이 여기서 나온다.
 */

function overlaps(x, z, box, r) {
  return Math.abs(x - box.x) < box.w / 2 + r && Math.abs(z - box.z) < box.d / 2 + r;
}

/**
 * @param {{x:number,z:number}} pos   현재 위치 (장애물 밖이라고 가정)
 * @param {{x:number,z:number}} next  이동하려는 위치
 * @param {{x:number,z:number,w:number,d:number}[]} obstacles
 * @param {number} radius
 * @returns {{x:number,z:number}} 보정된 위치
 */
export function resolveCollision(pos, next, obstacles, radius) {
  let x = next.x;
  let z = pos.z;

  for (const b of obstacles) {
    if (!overlaps(x, z, b, radius)) continue;
    const limit = b.w / 2 + radius;
    x = x > b.x ? b.x + limit : b.x - limit;
  }

  let z2 = next.z;
  for (const b of obstacles) {
    if (!overlaps(x, z2, b, radius)) continue;
    const limit = b.d / 2 + radius;
    z2 = z2 > b.z ? b.z + limit : b.z - limit;
  }

  return { x, z: z2 };
}
```

- [ ] **Step 4: 충돌 테스트 통과 확인**

Run: `npm test`
Expected: collision 8개 테스트 PASS

- [ ] **Step 5: 실패하는 레이아웃 테스트 작성**

`test/layout.test.js`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { ROOM, DESKS, OBSTACLES, SPAWN, MEETING, PLAYER_RADIUS, meetingSlots, deskFootprint }
  from '../src/world/layout.js';
import { resolveCollision } from '../src/player/collision.js';
import { listSeated, ARIA_ANCHOR } from '../src/game/characters.data.js';

/** 두 축정렬 사각형이 겹치는가. 접하는 것은 겹침이 아니다. */
function rectsOverlap(a, b) {
  return Math.abs(a.x - b.x) < (a.w + b.w) / 2 - 1e-9
      && Math.abs(a.z - b.z) < (a.d + b.d) / 2 - 1e-9;
}

/** 점이 사각형 안에 있는가. */
function pointInRect(p, r) {
  return Math.abs(p.x - r.x) < r.w / 2 && Math.abs(p.z - r.z) < r.d / 2;
}

test('방 치수가 일관된다', () => {
  assert.equal(ROOM.halfW, ROOM.width / 2);
  assert.equal(ROOM.halfD, ROOM.depth / 2);
});

test('스폰 지점은 방 안이고 장애물과 겹치지 않는다', () => {
  assert.ok(Math.abs(SPAWN.x) < ROOM.halfW);
  assert.ok(Math.abs(SPAWN.z) < ROOM.halfD);
  const stuck = resolveCollision(SPAWN, SPAWN, OBSTACLES, PLAYER_RADIUS);
  assert.ok(Math.hypot(stuck.x - SPAWN.x, stuck.z - SPAWN.z) < 1e-9,
    '스폰 지점이 장애물 안에 박혀 있다');
});

test('벽 4면이 장애물에 포함되어 방을 닫는다', () => {
  for (const dir of [[0, -20], [0, 20], [-20, 0], [20, 0]]) {
    let p = { x: SPAWN.x, z: SPAWN.z };
    for (let i = 0; i < 400; i++) {
      p = resolveCollision(p, { x: p.x + dir[0] * 0.01, z: p.z + dir[1] * 0.01 },
        OBSTACLES, PLAYER_RADIUS);
    }
    assert.ok(Math.abs(p.x) <= ROOM.halfW, `방을 x로 빠져나갔다: ${p.x}`);
    assert.ok(Math.abs(p.z) <= ROOM.halfD, `방을 z로 빠져나갔다: ${p.z}`);
  }
});

test('책상이 5개 이상 배치되어 있다', () => {
  assert.ok(DESKS.length >= 5, `책상 ${DESKS.length}개 — 사무실이 너무 비었다`);
});

test('책상끼리 겹치지 않는다', () => {
  const boxes = DESKS.map(deskFootprint);
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      assert.ok(!rectsOverlap(boxes[i], boxes[j]),
        `책상 ${i}와 ${j}가 겹친다: ${JSON.stringify(boxes[i])} / ${JSON.stringify(boxes[j])}`);
    }
  }
});

test('앉은 캐릭터마다 근처에 책상이 있다', () => {
  for (const c of listSeated()) {
    const near = DESKS.some(d => Math.hypot(d.x - c.seat.x, d.z - c.seat.z) < 2.0);
    assert.ok(near, `${c.id}의 자리(${c.seat.x}, ${c.seat.z}) 근처에 책상이 없다`);
  }
});

test('캐릭터 자리가 책상 안에 박혀 있지 않다', () => {
  const boxes = DESKS.map(deskFootprint);
  for (const c of listSeated()) {
    for (const [i, b] of boxes.entries()) {
      assert.ok(!pointInRect(c.seat, b),
        `${c.id}의 자리가 책상 ${i} 안에 있다 — 빌보드가 책상을 뚫는다`);
    }
  }
});

test('ARIA 받침이 회의 테이블 상판 위에 정확히 놓인다', () => {
  const table = DESKS.find(d => d.meeting);
  assert.ok(table, 'meeting: true 인 책상이 있어야 한다');
  assert.ok(pointInRect({ x: ARIA_ANCHOR.x, z: ARIA_ANCHOR.z }, deskFootprint(table)),
    'ARIA 받침이 회의 테이블 밖에 있다 — 공중에 뜬다');
  assert.ok(Math.abs(ARIA_ANCHOR.y - 0.78) < 1e-9,
    '받침 높이가 상판 높이(0.78)와 다르다 — 파묻히거나 뜬다');
});

test('회의 중심이 회의 테이블 위치와 일치한다', () => {
  const table = DESKS.find(d => d.meeting);
  assert.equal(MEETING.x, table.x);
  assert.equal(MEETING.z, table.z);
});

test('회의 슬롯이 요청한 개수만큼 나온다', () => {
  assert.equal(meetingSlots(5).length, 5);
  assert.equal(meetingSlots(1).length, 1);
});

test('회의 슬롯은 모두 회의 중심에서 반지름만큼 떨어져 있다', () => {
  for (const s of meetingSlots(5)) {
    const d = Math.hypot(s.x - MEETING.x, s.z - MEETING.z);
    assert.ok(Math.abs(d - MEETING.radius) < 1e-6, `거리 ${d}`);
  }
});

test('회의 슬롯은 서로 겹치지 않는다', () => {
  const slots = meetingSlots(5);
  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      const d = Math.hypot(slots[i].x - slots[j].x, slots[i].z - slots[j].z);
      assert.ok(d > 0.7, `슬롯 ${i}와 ${j}가 너무 가깝다: ${d}`);
    }
  }
});

test('회의 슬롯은 모두 방 안에 있다', () => {
  for (const s of meetingSlots(5)) {
    assert.ok(Math.abs(s.x) < ROOM.halfW);
    assert.ok(Math.abs(s.z) < ROOM.halfD);
  }
});

test('회의 슬롯이 어떤 책상에도 박히지 않는다', () => {
  const boxes = DESKS.map(deskFootprint);
  for (const [i, s] of meetingSlots(5).entries()) {
    for (const [j, b] of boxes.entries()) {
      assert.ok(!pointInRect(s, b), `회의 슬롯 ${i}가 책상 ${j} 안에 있다`);
    }
  }
});
```

- [ ] **Step 6: 테스트 실행해 실패 확인**

Run: `npm test`
Expected: FAIL — `Cannot find module '../src/world/layout.js'`

- [ ] **Step 7: 레이아웃 구현**

`src/world/layout.js`:

```js
/**
 * 사무실 치수와 배치. 순수 데이터라 three.js를 import 하지 않는다.
 * office.js가 이 데이터를 읽어 지오메트리를 세우고,
 * controller.js가 OBSTACLES로 충돌을 판정한다.
 *
 * 좌표: Y 위, 미터. 방 중심이 원점. -Z가 사무실 안쪽(창문 쪽).
 */

export const ROOM = { width: 18, depth: 14, height: 3.2, halfW: 9, halfD: 7 };

export const PLAYER_RADIUS = 0.35;

/** 입구 쪽. 사무실 전체가 시야에 들어오는 위치. */
export const SPAWN = { x: 0, z: 5.5, facing: 0 };

/** 회의 테이블 중심과, NPC가 둘러설 반지름. 테이블 좌표와 일치해야 한다. */
export const MEETING = { x: 0, z: -1.4, radius: 2.4 };

/**
 * 책상.
 *
 * w는 로컬 X, d는 로컬 Z 방향 길이. rot은 Y축 회전(라디안).
 * rot = π/2 이면 로컬 X가 월드 Z로 가므로, 월드 footprint는 x폭 d, z폭 w가 된다.
 *
 * seatSide는 앉는 사람이 로컬 Z의 어느 쪽에 있는지다(+1 또는 -1).
 * office.js 가 모니터를 반대편에 놓고 사람 쪽을 향하게 돌리는 데 쓴다.
 * meeting: true 인 책상에는 모니터 대신 ARIA 받침이 올라간다.
 *
 * 책상끼리 겹치면 안 된다. test/layout.test.js 가 검사한다.
 */
export const DESKS = [
  // 좌측 개발/QA 존 — 긴 축이 Z를 향한다. 월드 footprint x폭 1.1, z폭 2.8
  { x: -6.2, z: -4.6, w: 2.8, d: 1.1, rot: Math.PI / 2, seatSide: -1 },  // 이서연 · 개발존 안쪽
  { x: -6.2, z: -0.8, w: 2.8, d: 1.1, rot: Math.PI / 2, seatSide: -1 },  // 정유나 · QA존
  // 안쪽 여분 책상 — 사무실 밀도를 만든다
  { x: -2.6, z: -5.2, w: 2.4, d: 1.0, rot: 0, seatSide: 1 },
  // 우측 창가
  { x: 6.0,  z: -2.6, w: 2.8, d: 1.1, rot: Math.PI / 2, seatSide: 1 },   // 최민 · 아트존
  { x: 6.4,  z: -5.6, w: 2.4, d: 1.0, rot: 0, seatSide: -1 },            // 한도윤 · 회의실 창가
  // 중앙 회의 테이블 — ARIA 받침 자리
  { x: 0.0,  z: -1.4, w: 3.6, d: 1.8, rot: 0, seatSide: 1, meeting: true }
];

/** 회전을 반영한 월드 축정렬 footprint. 충돌과 겹침 검사 양쪽에서 쓴다. */
export function deskFootprint(d) {
  const c = Math.abs(Math.cos(d.rot));
  const s = Math.abs(Math.sin(d.rot));
  return { x: d.x, z: d.z, w: d.w * c + d.d * s, d: d.w * s + d.d * c };
}

const WALL_T = 0.4;

/** 벽 4면 + 책상. 축정렬 사각형만 쓴다. */
export const OBSTACLES = [
  { x: 0, z: -ROOM.halfD - WALL_T / 2, w: ROOM.width + WALL_T * 2, d: WALL_T },
  { x: 0, z: ROOM.halfD + WALL_T / 2,  w: ROOM.width + WALL_T * 2, d: WALL_T },
  { x: -ROOM.halfW - WALL_T / 2, z: 0, w: WALL_T, d: ROOM.depth + WALL_T * 2 },
  { x: ROOM.halfW + WALL_T / 2,  z: 0, w: WALL_T, d: ROOM.depth + WALL_T * 2 },
  ...DESKS.map(deskFootprint)
];

/**
 * 회의 시 NPC가 설 자리. 회의 테이블을 중심으로 플레이어 쪽(+Z)을 향한 부채꼴.
 * 2단계 계획의 회의하기 연출이 이 좌표를 쓴다.
 */
export function meetingSlots(count) {
  const spread = Math.PI * 0.9;
  const slots = [];
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0.5 : i / (count - 1);
    const a = -spread / 2 + spread * t;
    slots.push({
      x: MEETING.x + Math.sin(a) * MEETING.radius,
      z: MEETING.z - Math.cos(a) * MEETING.radius,
      facing: a + Math.PI
    });
  }
  return slots;
}
```

- [ ] **Step 8: 테스트 실행해 통과 확인**

Run: `npm test`
Expected: layout 14개 테스트 PASS

이 테스트들은 좌표를 손으로 적다가 생기는 실수를 잡으려고 있다. 실패하면:

| 실패한 테스트 | 원인과 조치 |
| --- | --- |
| 책상끼리 겹치지 않는다 | `DESKS`의 두 항목이 물리적으로 충돌한다. 한쪽을 옮긴다 |
| 캐릭터 자리가 책상 안에 박혀 있지 않다 | `seat`이 책상 footprint 안이다. 책상 바깥쪽(벽 쪽)으로 밀어낸다 |
| 앉은 캐릭터마다 근처에 책상이 있다 | `seat`이 책상에서 2m 넘게 떨어졌다. 가깝게 당긴다 |
| ARIA 받침이 회의 테이블 상판 위에 | `ARIA_ANCHOR`가 테이블 밖이거나 y가 0.78이 아니다 |
| 회의 슬롯이 어떤 책상에도 박히지 않는다 | `MEETING.radius`를 키워 테이블 밖으로 뺀다 |

- [ ] **Step 9: 커밋**

```bash
git add src/world/layout.js src/player/collision.js test/layout.test.js test/collision.test.js
git commit -m "feat: 사무실 레이아웃 데이터와 충돌 해소"
```

---

## Task 10: 씬 부팅 — 첫 화면이 뜬다

**Files:**
- Create: `index.html`
- Create: `src/world/scene.js`
- Create: `src/world/lighting.js`
- Create: `src/world/backdrop.js`
- Create: `src/main.js`

**Interfaces:**
- Consumes: `ROOM` from `layout.js`
- Produces:
  - `createStage({ canvas })` → `{ scene, camera, renderer, onFrame(fn), start(), resize() }`
  - `addLighting(scene)` → `{ pendants: Light[], ambient: Light }`
  - `addBackdrop(scene)` → `Promise<void>` (텍스처 로드 완료까지 대기)

이 태스크의 산출물은 "브라우저를 열면 야경 창과 조명이 있는 어두운 공간이 보인다"이다.
아직 걸을 수 없고 캐릭터도 없다.

- [ ] **Step 1: index.html 작성**

```html
<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>AI CEO</title>
<style>
  :root {
    --aria-hex: #A855F7;
    --aria-glow: #D8B4FE;
    --aria-dim: #5B21B6;
    --panel: rgba(11, 15, 26, 0.82);
    --line: rgba(148, 163, 184, 0.22);
    --ink: #E7ECF5;
    --ink-dim: #94A3B8;
    --font: -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Pretendard",
            "Malgun Gothic", "Noto Sans KR", system-ui, sans-serif;
  }
  * { box-sizing: border-box; }
  html, body { height: 100%; margin: 0; background: #05070C; overflow: hidden; }
  body { font-family: var(--font); color: var(--ink); }
  #stage { display: block; width: 100%; height: 100%; }
  /* HUD는 3D 위에 겹치는 DOM 레이어. 기본은 클릭을 통과시키고, 각 패널이 되살린다. */
  #hud {
    position: fixed; inset: 0; pointer-events: none;
    z-index: 10; overflow: hidden;
  }
  #boot {
    position: fixed; inset: 0; z-index: 20;
    display: grid; place-items: center;
    background: #05070C; color: var(--ink-dim);
    font-size: 13px; letter-spacing: 0.08em;
    transition: opacity 0.5s ease;
  }
  #boot.done { opacity: 0; pointer-events: none; }
</style>
</head>
<body>
  <canvas id="stage"></canvas>
  <div id="hud"></div>
  <div id="boot">LOADING</div>

  <script type="importmap">
  {
    "imports": {
      "three": "https://unpkg.com/three@0.169.0/build/three.module.js",
      "three/addons/": "https://unpkg.com/three@0.169.0/examples/jsm/"
    }
  }
  </script>
  <script type="module" src="./src/main.js"></script>
</body>
</html>
```

- [ ] **Step 2: scene.js 작성**

```js
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
```

- [ ] **Step 3: lighting.js 작성**

```js
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
```

- [ ] **Step 4: backdrop.js 작성**

```js
import * as THREE from 'three';
import { ROOM } from './layout.js';

const loader = new THREE.TextureLoader();

function load(url) {
  return new Promise((resolve, reject) => {
    loader.load(url, tex => {
      tex.colorSpace = THREE.SRGBColorSpace;
      resolve(tex);
    }, undefined, () => reject(new Error(`백드롭 로드 실패: ${url}`)));
  });
}

function panel(tex, w, h) {
  return new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, fog: false })
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
  const back = panel(night, ROOM.width + 6, ROOM.height + 2.4);
  back.position.set(0, ROOM.height / 2, -ROOM.halfD - 0.6);
  scene.add(back);

  // 우측 창 (+X). 안쪽을 향해 90도 돌린다.
  const right = panel(night, ROOM.depth + 4, ROOM.height + 2.4);
  right.rotation.y = -Math.PI / 2;
  right.position.set(ROOM.halfW + 0.6, ROOM.height / 2, 0);
  scene.add(right);

  // 좌측 서가 벽 (-X)
  const left = panel(shelf, ROOM.depth + 4, ROOM.height + 2.4);
  left.rotation.y = Math.PI / 2;
  left.position.set(-ROOM.halfW - 0.6, ROOM.height / 2, 0);
  scene.add(left);

  return { back, right, left };
}
```

- [ ] **Step 5: main.js 작성 (이 단계의 최소 버전)**

```js
import { createStage } from './world/scene.js';
import { addLighting } from './world/lighting.js';
import { addBackdrop } from './world/backdrop.js';

const canvas = document.getElementById('stage');
const boot = document.getElementById('boot');

const stage = createStage({ canvas });
addLighting(stage.scene);

await addBackdrop(stage.scene);

stage.start();
boot.classList.add('done');
```

- [ ] **Step 6: 서버 띄우고 화면 확인**

`mcp__Claude_Browser__preview_start` 로 `ai-ceo` 설정을 실행하고 `http://localhost:5173` 을 연다.

확인 항목:
- `LOADING`이 사라졌는가 (에셋 로드 성공)
- 어두운 공간에 야경 창이 보이는가
- 천장에 주황색 전구 점들이 보이는가
- `read_console_messages` 로 에러가 0건인가

`백드롭 로드 실패`가 뜨면 Task 3의 출력 경로를 확인한다.

- [ ] **Step 7: 커밋**

```bash
git add index.html src/main.js src/world/scene.js src/world/lighting.js src/world/backdrop.js
git commit -m "feat: 3D 씬 부팅 — 백드롭과 펜던트 조명"
```

---

## Task 11: 오피스 지오메트리

**Files:**
- Create: `src/world/office.js`
- Modify: `src/main.js`

**Interfaces:**
- Consumes: `ROOM`, `DESKS` from `layout.js`
- Produces: `addOffice(scene)` → `{ floor, desks, monitors }`

- [ ] **Step 1: office.js 작성**

```js
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
```

- [ ] **Step 2: main.js에 연결**

`src/main.js`의 `addBackdrop` 호출 앞에 추가한다:

```js
import { addOffice } from './world/office.js';
```

`addLighting(stage.scene);` 다음 줄에:

```js
addOffice(stage.scene);
```

- [ ] **Step 3: 화면 확인**

브라우저를 새로고침한다.

확인 항목:
- 바닥과 천장이 보이는가
- 책상 6개가 있고 모니터가 파랗게 빛나는가
- 모니터 빛이 책상 표면을 물들이는가
- 위쪽 주황 조명과 아래쪽 파란 모니터의 대비가 보이는가
- 콘솔 에러 0건

대비가 약하면 `lighting.js`의 펜던트 세기(14)와 `office.js`의 `emissiveIntensity`(1.5)를
조정한다. 어두운 쪽으로 조정하는 것이 이미지 1·2에 가깝다.

- [ ] **Step 4: 커밋**

```bash
git add src/world/office.js src/main.js
git commit -m "feat: 오피스 지오메트리 — 책상, 모니터 emissive, 바닥 반사"
```

---

## Task 12: WASD 이동과 3인칭 카메라

**Files:**
- Create: `src/player/controller.js`
- Create: `src/player/camera.js`
- Modify: `src/main.js`

**Interfaces:**
- Consumes: `OBSTACLES`, `SPAWN`, `PLAYER_RADIUS` from `layout.js`; `resolveCollision` from `collision.js`
- Produces:
  - `createController({ obstacles })` → `{ pos: {x,z}, heading, update(dt), dispose(), moving }`
  - `createFollowCamera({ camera })` → `{ update(dt, pos, heading) }`

카메라는 이미지 1·2 앵글을 유지한다. 마우스로 회전하지 않는다.
A/D는 좌우 이동이 아니라 방향 전환이고, W/S가 전후 이동이다. 3인칭 어드벤처의 관례를 따른다.

- [ ] **Step 1: controller.js 작성**

```js
import { resolveCollision } from './collision.js';
import { SPAWN, PLAYER_RADIUS } from '../world/layout.js';

const WALK = 2.6;   // m/s
const RUN = 4.6;
const TURN = 2.4;   // rad/s

/**
 * 키 입력 → 위치.
 *
 * W/S 전진·후진, A/D 방향 전환, Shift 달리기.
 * 마우스로 카메라를 돌리지 않는다. 이미지 1·2의 고정된 앵글을 유지하기 위해서다.
 */
export function createController({ obstacles }) {
  const keys = new Set();
  const pos = { x: SPAWN.x, z: SPAWN.z };
  let heading = SPAWN.facing;

  const isTypingTarget = e =>
    e.target instanceof HTMLElement &&
    (e.target.isContentEditable || ['INPUT', 'TEXTAREA'].includes(e.target.tagName));

  const down = e => {
    if (isTypingTarget(e)) return;
    keys.add(e.code);
    if (['KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) e.preventDefault();
  };
  const up = e => keys.delete(e.code);
  const blur = () => keys.clear();

  addEventListener('keydown', down);
  addEventListener('keyup', up);
  addEventListener('blur', blur);

  const api = {
    pos,
    get heading() { return heading; },
    moving: false,

    update(dt) {
      const turn = (keys.has('KeyA') ? 1 : 0) - (keys.has('KeyD') ? 1 : 0);
      heading += turn * TURN * dt;

      const fwd = (keys.has('KeyW') ? 1 : 0) - (keys.has('KeyS') ? 1 : 0);
      api.moving = fwd !== 0;
      if (fwd === 0) return;

      const speed = keys.has('ShiftLeft') || keys.has('ShiftRight') ? RUN : WALK;
      const step = fwd * speed * dt;
      const next = {
        x: pos.x - Math.sin(heading) * step,
        z: pos.z - Math.cos(heading) * step
      };

      const solved = resolveCollision(pos, next, obstacles, PLAYER_RADIUS);
      pos.x = solved.x;
      pos.z = solved.z;
    },

    dispose() {
      removeEventListener('keydown', down);
      removeEventListener('keyup', up);
      removeEventListener('blur', blur);
    }
  };

  return api;
}
```

- [ ] **Step 2: camera.js 작성**

```js
import * as THREE from 'three';

const BACK = 3.4;     // 플레이어 뒤로 떨어진 거리
const HEIGHT = 1.95;  // 카메라 높이
const LOOK_AT = 1.25; // 바라보는 높이 (플레이어 어깨 근처)
const POS_LAG = 6.0;  // 위치 추종 속도
const ROT_LAG = 3.2;  // 회전 추종 속도 — 위치보다 느려야 부드럽다

/**
 * 3인칭 백뷰 추적 카메라.
 *
 * 회전 추종을 위치보다 느리게 둔다. 방향을 틀면 카메라가 한 박자 늦게 따라와서
 * 플레이어가 화면 중앙에서 살짝 벗어나는데, 이미지 1·2의 구도가 그 상태다.
 */
export function createFollowCamera({ camera }) {
  let smoothed = null;
  const target = new THREE.Vector3();
  const desired = new THREE.Vector3();

  return {
    update(dt, pos, heading) {
      if (smoothed === null) smoothed = heading;

      // 각도를 -π..π 최단 경로로 보간한다
      let diff = heading - smoothed;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      smoothed += diff * Math.min(1, ROT_LAG * dt);

      desired.set(
        pos.x + Math.sin(smoothed) * BACK,
        HEIGHT,
        pos.z + Math.cos(smoothed) * BACK
      );
      camera.position.lerp(desired, Math.min(1, POS_LAG * dt));

      target.set(pos.x, LOOK_AT, pos.z);
      camera.lookAt(target);
    }
  };
}
```

- [ ] **Step 3: main.js에 연결**

`src/main.js` 전체를 아래로 교체한다:

```js
import { createStage } from './world/scene.js';
import { addLighting } from './world/lighting.js';
import { addOffice } from './world/office.js';
import { addBackdrop } from './world/backdrop.js';
import { createController } from './player/controller.js';
import { createFollowCamera } from './player/camera.js';
import { OBSTACLES } from './world/layout.js';

const canvas = document.getElementById('stage');
const boot = document.getElementById('boot');

const stage = createStage({ canvas });
addLighting(stage.scene);
addOffice(stage.scene);
await addBackdrop(stage.scene);

const player = createController({ obstacles: OBSTACLES });
const follow = createFollowCamera({ camera: stage.camera });

stage.onFrame(dt => {
  player.update(dt);
  follow.update(dt, player.pos, player.heading);
});

stage.start();
boot.classList.add('done');
```

- [ ] **Step 4: 이동 확인**

브라우저를 새로고침하고 캔버스를 클릭해 포커스를 준 뒤 확인한다.

확인 항목:
- W로 전진, S로 후진
- A/D로 방향 전환, 카메라가 한 박자 늦게 따라옴
- Shift로 달리기 (눈에 띄게 빨라짐)
- 벽을 통과하지 못함 — 방 네 귀퉁이로 계속 밀어봐도 밖으로 못 나감
- 책상을 통과하지 못하고, 비스듬히 부딪히면 미끄러짐
- 콘솔 에러 0건

카메라가 벽을 뚫고 나가면 `BACK`을 3.4 → 2.8로 줄인다.

- [ ] **Step 5: 커밋**

```bash
git add src/player/controller.js src/player/camera.js src/main.js
git commit -m "feat: WASD 이동, 충돌, 3인칭 추적 카메라"
```

---

## Task 13: 캐릭터 빌보드와 플레이어 피규어

**Files:**
- Create: `src/world/billboard.js`
- Create: `src/world/player-figure.js`
- Modify: `src/main.js`

**Interfaces:**
- Consumes: `listSeated`, `getCharacter` from `characters.data.js`
- Produces:
  - `addCharacters(scene)` → `Promise<{ id, sprite, character, head: THREE.Vector3 }[]>`
  - `updateBillboards(entries, camera)` — 매 프레임 Y축 회전 갱신
  - `createPlayerFigure(scene)` → `Promise<{ group, update(pos, heading) }>`

포트레이트는 전신이 아니라 흉상이다. 실제 사람의 머리~가슴은 약 0.65m이므로
빌보드 높이를 0.65m로 잡는다. 앉은 사람은 정수리가 1.40m, 선 사람은 1.70m에 온다.
Task 2에서 아래쪽 15%에 알파 페이드를 넣었으므로 잘린 단면이 하드 엣지로 보이지 않는다.

- [ ] **Step 1: billboard.js 작성**

```js
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
```

- [ ] **Step 2: player-figure.js 작성**

```js
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
```

- [ ] **Step 3: main.js에 연결**

import에 추가:

```js
import { addCharacters, updateBillboards } from './world/billboard.js';
import { createPlayerFigure } from './world/player-figure.js';
```

`await addBackdrop(...)` 다음에:

```js
const cast = await addCharacters(stage.scene);
const figure = await createPlayerFigure(stage.scene);
console.log(`플레이어 백뷰: ${figure.usingImage ? '이미지 빌보드' : '3D 피규어 대체품'}`);
```

`stage.onFrame` 콜백을 아래로 교체:

```js
stage.onFrame(dt => {
  player.update(dt);
  follow.update(dt, player.pos, player.heading);
  figure.update(player.pos, player.heading);
  updateBillboards(cast, stage.camera);
});
```

- [ ] **Step 4: 화면 확인**

브라우저 새로고침.

확인 항목:
- 팀원 5명이 각자 책상에 앉아 있는가
- 걸어다녀도 항상 이쪽을 바라보는가 (빌보드가 따라 도는가)
- 흉상 아래쪽 잘린 면이 책상에 가려지거나 부드럽게 사라지는가
- 플레이어 뒷모습이 화면 아래쪽에 보이는가
- 콘솔에 `플레이어 백뷰: 3D 피규어 대체품` 이 찍히는가
- 콘솔 에러 0건

캐릭터가 책상에 파묻히면 `billboard.js`의 `SEATED_CROWN`을 1.40 → 1.48로 올린다.
공중에 떠 보이면 1.34로 내린다.

- [ ] **Step 5: 커밋**

```bash
git add src/world/billboard.js src/world/player-figure.js src/main.js
git commit -m "feat: 캐릭터 빌보드 5인과 플레이어 백뷰 피규어"
```

---

## Task 14: ARIA 홀로그램

**Files:**
- Create: `src/world/aria.js`
- Modify: `src/main.js`

**Interfaces:**
- Consumes: `ARIA_ANCHOR` from `characters.data.js`; `getTone` from `ui/theme.js`
- Produces:
  - `createAria(scene)` → `{ group, center: THREE.Vector3, setState(name), update(dt), state }`
  - `setState`는 `'neutral' | 'suggest' | 'recommend' | 'warn'`을 받아 0.4초에 걸쳐 색을 보간한다

- [ ] **Step 1: aria.js 작성**

```js
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
```

- [ ] **Step 2: main.js에 연결**

import에 추가:

```js
import { createAria } from './world/aria.js';
```

`const figure = ...` 다음에:

```js
const aria = createAria(stage.scene);
```

`stage.onFrame` 콜백에 추가:

```js
  aria.update(dt);
```

- [ ] **Step 3: 4상태를 눈으로 확인할 임시 키 바인딩**

`stage.start();` 앞에 추가한다. 검증용이며 2단계에서 제거한다.

```js
// 검증용 임시 바인딩 — 2단계에서 스토리가 상태를 결정하게 되면 제거한다
addEventListener('keydown', e => {
  const map = { Digit1: 'neutral', Digit2: 'suggest', Digit3: 'recommend', Digit4: 'warn' };
  if (map[e.code]) aria.setState(map[e.code]);
});
```

- [ ] **Step 4: 화면 확인**

브라우저 새로고침 후 회의 테이블 쪽으로 걸어간다.

확인 항목:
- 책상 위에 보라 구체가 떠 있고 궤도링 두 개가 돈다
- 받침에서 파티클이 나선으로 올라간다
- 구체 빛이 책상과 주변을 물들인다
- `1` `2` `3` `4` 키로 보라 → 초록 → 파랑 → 빨강 전환. 색이 튀지 않고 부드럽게 넘어간다
- `4`(warn)에서 맥동이 눈에 띄게 빨라진다
- 콘솔 에러 0건

- [ ] **Step 5: 커밋**

```bash
git add src/world/aria.js src/main.js
git commit -m "feat: ARIA 홀로그램과 4상태 색 전환"
```

---

## Task 15: 네임태그

**Files:**
- Create: `src/ui/nametag.js`
- Modify: `src/main.js`

**Interfaces:**
- Consumes: `addCharacters`의 반환값 (`{ character, head }[]`), `aria.center`
- Produces: `createNametags({ root, entries })` → `{ update(camera) }`

3D 좌표를 화면 좌표로 투영해 DOM으로 그린다. 캔버스 텍스처가 아니라 DOM이라 한글이
선명하고 폰트가 깨지지 않는다.

- [ ] **Step 1: nametag.js 작성**

```js
import * as THREE from 'three';

const FADE_START = 11;  // 이 거리부터 흐려진다
const FADE_END = 16;    // 이 거리부터 숨긴다

const CSS = `
.nametag {
  position: absolute;
  transform: translate(-50%, -100%);
  padding: 5px 10px 6px;
  border-radius: 7px;
  background: rgba(9, 12, 20, 0.78);
  border: 1px solid var(--tag-hue);
  backdrop-filter: blur(6px);
  white-space: nowrap;
  line-height: 1.15;
  will-change: transform, opacity;
}
.nametag b {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: var(--tag-hue);
  letter-spacing: 0.01em;
}
.nametag span {
  display: block;
  font-size: 10px;
  color: var(--ink-dim);
  letter-spacing: 0.04em;
  margin-top: 1px;
}
`;

/**
 * 캐릭터 머리 위 네임태그.
 *
 * 가림 처리는 하지 않는다 — 책상 뒤에 있어도 항상 보인다.
 * 이미지 1·2도 그렇게 되어 있고, 누가 어디 있는지 알려주는 게 목적이기 때문이다.
 */
export function createNametags({ root, entries }) {
  const style = document.createElement('style');
  style.textContent = CSS;
  document.head.append(style);

  const items = entries.map(e => {
    const el = document.createElement('div');
    el.className = 'nametag';
    el.style.setProperty('--tag-hue', e.character.hue);
    el.innerHTML = `<b></b><span></span>`;
    el.querySelector('b').textContent = e.character.name;
    el.querySelector('span').textContent = e.character.role;
    root.append(el);
    return { el, anchor: e.head };
  });

  const v = new THREE.Vector3();

  return {
    update(camera) {
      const w = root.clientWidth;
      const h = root.clientHeight;

      for (const { el, anchor } of items) {
        v.copy(anchor).project(camera);

        // 카메라 뒤로 넘어갔으면 숨긴다
        const dist = camera.position.distanceTo(anchor);
        if (v.z > 1 || dist > FADE_END) {
          el.style.opacity = '0';
          continue;
        }

        const fade = dist <= FADE_START
          ? 1
          : 1 - (dist - FADE_START) / (FADE_END - FADE_START);

        el.style.opacity = String(fade.toFixed(2));
        el.style.transform =
          `translate(-50%, -100%) translate(${((v.x + 1) / 2) * w}px, ${((-v.y + 1) / 2) * h}px)`;
      }
    }
  };
}
```

- [ ] **Step 2: main.js에 연결**

import에 추가:

```js
import { createNametags } from './ui/nametag.js';
```

`const aria = createAria(...)` 다음에:

```js
const hud = document.getElementById('hud');
const tags = createNametags({
  root: hud,
  entries: [
    ...cast,
    { character: { name: 'ARIA', role: 'AI 비즈니스 어시스턴트', hue: '#A855F7' },
      head: aria.center.clone().add(new THREE.Vector3(0, 0.42, 0)) }
  ]
});
```

`main.js` 상단에 `import * as THREE from 'three';`를 추가한다.

`stage.onFrame` 콜백 마지막에:

```js
  tags.update(stage.camera);
```

- [ ] **Step 3: 화면 확인**

브라우저 새로고침.

확인 항목:
- 팀원 5명 머리 위에 이름 + 직책이 뜬다
- ARIA 구체 위에도 태그가 뜬다
- 각 태그의 테두리와 이름 색이 캐릭터 색과 맞다 (이서연=보라, 정유나=민트, 최민=오렌지, 박지훈=그레이, 한도윤=골드)
- 걸어다니면 태그가 캐릭터를 정확히 따라간다
- 멀어지면 흐려지고, 아주 멀면 사라진다
- 뒤를 돌아봤을 때 뒤쪽 태그가 화면에 남지 않는다
- 콘솔 에러 0건

태그가 캐릭터에서 어긋나면 `billboard.js`의 `head` Y 오프셋(0.14)을 조정한다.

- [ ] **Step 4: 커밋**

```bash
git add src/ui/nametag.js src/main.js
git commit -m "feat: 3D 투영 네임태그"
```

---

## Task 16: 통합 검증과 문서 갱신

**Files:**
- Modify: `README.md`
- Modify: `CHANGELOG.md`
- Modify: `TODO.md`

**Interfaces:**
- Consumes: Task 1~15의 결과 전부
- Produces: 1단계 완료 상태의 문서

- [ ] **Step 1: 전체 테스트 실행**

Run: `npm test`
Expected: 모든 테스트 PASS. 실패가 하나라도 있으면 여기서 멈추고 고친다.

- [ ] **Step 2: 브라우저에서 통합 확인**

`http://localhost:5173` 을 새로고침하고 아래를 순서대로 확인한다. 하나라도 실패하면 해당 태스크로 돌아간다.

- [ ] 로딩 화면이 사라지고 3D 사무실이 뜬다
- [ ] W/S로 전후 이동, A/D로 방향 전환, Shift로 달리기
- [ ] 방 네 귀퉁이 어디로도 벽을 뚫고 나갈 수 없다
- [ ] 책상 6개를 모두 통과할 수 없다
- [ ] 팀원 5명이 각자 자리에 있고 항상 이쪽을 본다
- [ ] 네임태그 5개 + ARIA 태그가 정확히 따라온다
- [ ] ARIA 홀로그램이 돌고 파티클이 올라간다
- [ ] 1/2/3/4 키로 ARIA 4상태 색이 부드럽게 전환된다
- [ ] 플레이어 뒷모습이 화면 하단에 보인다
- [ ] 창 크기를 바꿔도 화면이 깨지지 않는다

- [ ] **Step 3: 성능 측정**

브라우저 콘솔에서 실행한다:

```js
let n = 0, t0 = performance.now();
const id = setInterval(() => {}, 1000);
requestAnimationFrame(function loop() {
  n++;
  if (performance.now() - t0 < 3000) requestAnimationFrame(loop);
  else { clearInterval(id); console.log('fps', Math.round(n / 3)); }
});
```

Expected: `fps` 55 이상.

50 미만이면 순서대로 시도한다:
1. `lighting.js`에서 `castShadow` 를 `i < 2` → `i < 1`
2. `office.js`의 모니터 `PointLight` 개수를 줄이거나 `distance`를 2.4 → 1.8
3. `scene.js`의 `setPixelRatio` 상한을 2 → 1.5

- [ ] **Step 4: 콘솔 에러 확인**

`read_console_messages` 로 확인.
Expected: error 0건. warning은 three.js 버전 안내 정도만 허용.

- [ ] **Step 5: README.md 갱신**

`## 실행` 절을 아래로 교체한다. 기존 단일 파일 안내는 더 이상 맞지 않는다.

```markdown
## 실행

정적 서버가 필요하다. ES 모듈을 쓰기 때문에 `file://` 로는 열리지 않는다.

```bash
python3 -m http.server 5173
```

브라우저에서 `http://localhost:5173` 을 연다.

## 조작

| 키 | 동작 |
| --- | --- |
| W / S | 전진 / 후진 |
| A / D | 방향 전환 |
| Shift | 달리기 |

## 개발

```bash
npm install     # 에셋 가공용 sharp 설치
npm test        # 순수 로직 단위 테스트
npm run assets  # 원본 이미지 → assets/ 재생성
```

기존 2D 버전은 `legacy/index.html` 에 보존되어 있다.
```

- [ ] **Step 6: CHANGELOG.md 갱신**

맨 위에 추가한다.

```markdown
## 2026-08-10 — 3D 오피스 전환 1단계

기존 2D SVG 비주얼 노벨을 폐기하고 3D 오피스 공간으로 전면 교체했다.
이 단계의 산출물은 걸어다닐 수 있는 월드까지이며, HUD와 스토리 진행은 2단계에서 붙인다.

### 추가
- three.js 기반 3D 사무실: 생성사진 백드롭 + 3D 지오메트리 + 펜던트/모니터 이중 조명
- WASD 이동, Shift 달리기, 축별 미끄러짐 충돌, 3인칭 추적 카메라
- 크로마키로 배경을 제거한 포트레이트 빌보드 5인
- ARIA 홀로그램: 구체·이중 궤도링·프로젝터 받침·상승 파티클
- ARIA 4상태 컬러 시스템 (중립 보라 / 제안 초록 / 추천 파랑 / 비추천 빨강)
- 3D 투영 DOM 네임태그
- `node --test` 기반 단위 테스트

### 변경
- 단일 `index.html` → 멀티파일 ES 모듈 구조. 빌드 단계는 여전히 없다.
- 스토리를 `src/game/story.data.js` 로 격리했다. 이 파일만 교체하면 스토리 전체가 바뀐다.
- 이서연의 색상을 네이비/블루에서 보라/블랙으로 정정했다. 포트레이트가 정본이다.

### 제거
- 파라메트릭 SVG 캐릭터 스프라이트와 표정 시스템
- SVG 배경 생성기
- 타이핑 연출과 기존 HUD 전체

기존 구현은 `legacy/index.html` 에 보존했다.

### 알려진 제약
- 플레이어 백뷰는 3D 피규어 대체품이다. `assets/chars/ceo_back.png` 를 넣으면 자동으로 빌보드로 교체된다.
- 오세라·강태석은 포트레이트가 없어 실루엣으로 처리된다.
- 스토리 진행 UI가 아직 없다. 현재는 사무실을 둘러보는 것까지만 가능하다.
```

- [ ] **Step 7: TODO.md 갱신**

```markdown
# TODO

## 진행 중 — 3D 오피스 전환

- [x] 1단계: 걸어다닐 수 있는 월드
- [ ] 2단계: HUD와 스토리 진행
  - [ ] 목표 카드, 스탯 패널, 조작 가이드
  - [ ] 우측 세로 메뉴 독 (팀 / 기록 / 인벤토리 / 설정)
  - [ ] ARIA 말풍선과 클릭 진행
  - [ ] 선택지 3카드
  - [ ] 회의하기 — NPC 정렬 연출
  - [ ] 엔딩 화면

## 에셋 대기

- [ ] `ceo_back.png` — 대표 뒷모습 전신. 넣으면 3D 피규어가 자동 교체됨
- [ ] `ceo_front.png` — 대표 정면 전신 (팀 정보 화면용)
- [ ] 오세라 · 강태석 포트레이트 (현재 실루엣 처리)

## 나중에

- [ ] E키 개별 NPC 상호작용
- [ ] 스토리 전면 재작성 (`src/game/story.data.js` 교체)
- [ ] 사운드
- [ ] GitHub Pages 재배포
```

- [ ] **Step 8: 커밋**

```bash
git add README.md CHANGELOG.md TODO.md
git commit -m "docs: 3D 전환 1단계 완료 기록"
```

---

## 2단계 계획에서 다룰 것

1단계가 끝나면 별도 계획서를 쓴다. 이 계획서에는 포함하지 않는다.

| 항목 | 근거 |
| --- | --- |
| HUD 목표 카드 / 스탯 패널 / 조작 가이드 | 스펙 8절 |
| 우측 세로 메뉴 독 | 스펙 8절, 이미지 2 |
| ARIA 말풍선과 클릭 진행 (경로 A) | 스펙 9절 |
| 회의하기 NPC 정렬 (경로 B) — `meetingSlots()` 사용 | 스펙 9절 |
| 선택지 3카드 (경로 C) | 스펙 8.2절, 이미지 2 |
| 엔딩 화면 | 스펙 10절 |
| `flow`와 `aria.setState` 연결 | Task 7·14의 결과를 잇는 작업 |

2단계는 1단계에서 만든 `flow.js`(진행 상태 기계)와 `theme.js`(컬러 토큰),
`aria.setState`(색 전환), `meetingSlots()`(회의 좌표)를 그대로 소비한다.
새로 만들 것은 DOM UI뿐이다.
