import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

/**
 * 원본 사진에서 게임 에셋을 잘라낸다.
 *
 * 좌표는 원본에 좌표 그리드를 얹어 확인하고 결과물까지 육안 검증한 값이다.
 * 바꾸면 사람이나 목업 UI가 딸려 들어온다. 근거는 계획서 Task 3에 있다.
 */

const SRC = '이미지 정보 폴더';
const MOOD_A = `${SRC}/KakaoTalk_Photo_2026-08-10-14-15-42 001.png`;

/**
 * 대표(플레이어) 흉상.
 * 좌측 아이콘 열, 상단 치장 바, 우하단 다음 버튼을 잘라내고 인물만 남긴다.
 * 어두운 사무실 배경은 유지한다 — UI 포트레이트 카드용이라 그편이 어울린다.
 */
async function ceoBust() {
  await sharp(`${SRC}/사장 이미지파일.png`)
    .extract({ left: 150, top: 90, width: 880, height: 1200 })
    .png({ compressionLevel: 9 })
    .toFile('assets/chars/ceo_bust.png');
}

/**
 * 통유리 야경. 한도윤의 네임태그(x≤1105)와 그의 머리(y≥330) 사이의 빈 구간.
 * 사람 없음.
 *
 * 강하게 블러·감광한다. 이 크롭은 3D에서 최대 24m 폭 벽에 평면 반복으로
 * 늘어나 붙는 원경이다(backdrop.js). RepeatWrapping으로 이어붙이면
 * 건물 윤곽이 또렷할수록 반복 이음매와 패턴이 눈에 띈다. 여기서 건물
 * 형태를 흐려 "점점이 박힌 창문 불빛"으로 만들어 두면, 이어붙는 자리도
 * 반복도 읽히지 않는다. sigma 8 / brightness 0.55 는 육안으로 확인한 값 —
 * 더 낮추면 통유리가 그냥 안 보이고, 0.8/0.92였던 이전 값은 창틀과 간판
 * 글자가 또렷이 남아 타일링이 바로 티가 났다.
 */
async function windowNight() {
  await sharp(MOOD_A)
    .extract({ left: 1110, top: 125, width: 290, height: 200 })
    .resize({ width: 580, kernel: 'lanczos3' })
    .blur(8)
    .modulate({ brightness: 0.55 })
    .jpeg({ quality: 90 })
    .toFile('assets/bg/window_night.jpg');
}

/**
 * 좌측 벽 띠. TRIPLEDOT 로고, 책장, 화분.
 * 위아래를 네임태그가, 오른쪽을 박지훈이 막고 있는 좁은 구간. 사람 없음.
 */
async function wallShelf() {
  await sharp(MOOD_A)
    .extract({ left: 30, top: 152, width: 400, height: 78 })
    .resize({ width: 800, kernel: 'lanczos3' })
    .blur(0.8)
    .modulate({ brightness: 0.88 })
    .jpeg({ quality: 90 })
    .toFile('assets/bg/wall_shelf.jpg');
}

await mkdir('assets/bg', { recursive: true });
await mkdir('assets/chars', { recursive: true });
await ceoBust();
await windowNight();
await wallShelf();

for (const p of ['assets/chars/ceo_bust.png', 'assets/bg/window_night.jpg', 'assets/bg/wall_shelf.jpg']) {
  const m = await sharp(p).metadata();
  console.log(`${p.padEnd(30)} ${m.width}x${m.height}`);
}
