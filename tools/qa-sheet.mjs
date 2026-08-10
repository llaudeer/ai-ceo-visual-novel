import sharp from 'sharp';
import { PORTRAITS } from './chromakey.mjs';

const tiles = [];
for (const [, id] of PORTRAITS) {
  tiles.push(await sharp(`assets/chars/${id}.png`)
    .flatten({ background: '#FF00FF' })
    .resize({ height: 520 })
    .toBuffer());
}
const metas = await Promise.all(tiles.map(t => sharp(t).metadata()));
let left = 0;
const composite = tiles.map((input, i) => {
  const spec = { input, left, top: 0 };
  left += metas[i].width;
  return spec;
});
await sharp({ create: { width: left, height: 520, channels: 3, background: '#000' } })
  .composite(composite).jpeg({ quality: 82 }).toFile('assets/chars/_qa-sheet.jpg');
console.log(`QA 시트 생성: assets/chars/_qa-sheet.jpg (${left}x520)`);
