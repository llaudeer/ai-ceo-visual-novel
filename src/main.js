import { createStage } from './world/scene.js';
import { addLighting } from './world/lighting.js';
import { addOffice } from './world/office.js';
import { addBackdrop } from './world/backdrop.js';
import { createController } from './player/controller.js';
import { createFollowCamera } from './player/camera.js';
import { OBSTACLES } from './world/layout.js';
import { addCharacters, updateBillboards } from './world/billboard.js';
import { createPlayerFigure } from './world/player-figure.js';

const canvas = document.getElementById('stage');
const boot = document.getElementById('boot');

const stage = createStage({ canvas });
addLighting(stage.scene);
addOffice(stage.scene);
await addBackdrop(stage.scene);

const cast = await addCharacters(stage.scene);
const figure = await createPlayerFigure(stage.scene);
console.log(`플레이어 백뷰: ${figure.usingImage ? '이미지 빌보드' : '3D 피규어 대체품'}`);

const player = createController({ obstacles: OBSTACLES });
const follow = createFollowCamera({ camera: stage.camera });

stage.onFrame(dt => {
  player.update(dt);
  follow.update(dt, player.pos, player.heading);
  figure.update(player.pos, player.heading);
  updateBillboards(cast, stage.camera);
});

stage.start();
boot.classList.add('done');
