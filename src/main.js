import { createStage } from './world/scene.js';
import { addLighting } from './world/lighting.js';
import { addOffice } from './world/office.js';
import { addBackdrop } from './world/backdrop.js';

const canvas = document.getElementById('stage');
const boot = document.getElementById('boot');

const stage = createStage({ canvas });
addLighting(stage.scene);
addOffice(stage.scene);

await addBackdrop(stage.scene);

stage.start();
boot.classList.add('done');
