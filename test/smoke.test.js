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
