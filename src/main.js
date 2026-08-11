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
