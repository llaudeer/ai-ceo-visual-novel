import { createStage } from './world/scene.js';
import { addLighting } from './world/lighting.js';
import { addOffice } from './world/office.js';
import { addBackdrop } from './world/backdrop.js';
import { createController } from './player/controller.js';
import { createFollowCamera } from './player/camera.js';
import { OBSTACLES } from './world/layout.js';
import { addCharacters, updateBillboards } from './world/billboard.js';
import { createPlayerFigure } from './world/player-figure.js';
import { createAria } from './world/aria.js';

import { SCENES, ORDER, ENDINGS } from './game/story.data.js';
import { initialState } from './game/state.js';
import { createFlow } from './game/flow.js';
import { createHud } from './ui/hud.js';

const canvas = document.getElementById('stage');
const boot = document.getElementById('boot');
const title = document.getElementById('title');
const startBtn = document.getElementById('start');

// ── 3D 월드
const stage = createStage({ canvas });
addLighting(stage.scene);
addOffice(stage.scene);
await addBackdrop(stage.scene);

const cast = await addCharacters(stage.scene);
const figure = await createPlayerFigure(stage.scene);
const aria = createAria(stage.scene);

const player = createController({ obstacles: OBSTACLES });
const follow = createFollowCamera({ camera: stage.camera });

stage.onFrame(dt => {
  player.update(dt);
  follow.update(dt, player.pos, player.heading);
  figure.update(player.pos, player.heading);
  updateBillboards(cast, stage.camera);
  aria.update(dt);
});

stage.start();

// ── 스토리
const hudRoot = document.getElementById('hud');
const flow = createFlow({
  scenes: SCENES, order: ORDER, endings: ENDINGS, state: initialState()
});

const hud = createHud({
  root: hudRoot,
  onAdvance: () => flow.advance(),
  onChoose: i => flow.choose(i),
  onRestart: () => location.reload()
});

/** beat나 씬이 지정한 색으로 홀로그램과 HUD를 동시에 물들인다. */
function tone(name) {
  aria.setState(name);
  hud.setTone(name);
}

flow.on('scene', scene => {
  hud.showScene(scene);
  if (scene.aria) tone(scene.aria);
});

flow.on('beat', beat => {
  if (beat.aria) tone(beat.aria);
  hud.showBeat(beat);
  hud.setStats(flow.state);
});

flow.on('choices', (choices, q) => hud.showChoices(choices, q));

flow.on('choose', () => hud.setStats(flow.state));

flow.on('ending', e => {
  if (e.aria) tone(e.aria);
  hud.showEnding(e, flow.state);
});

// ── 시작 화면에서 첫 beat까지
boot.classList.add('done');
title.classList.add('on');

startBtn.addEventListener('click', () => {
  title.classList.remove('on');
  const first = flow.scene();
  hud.showScene(first);
  if (first.aria) tone(first.aria);
  hud.setStats(flow.state);
  hud.showBeat(flow.current());
}, { once: true });
