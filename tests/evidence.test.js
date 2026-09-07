import test from 'node:test';
import assert from 'node:assert/strict';
import { recordAttempt, validateWork, taskStatus, progressSummary } from '../src/evidence.js';
import { allTasks } from '../src/content.js';
import { createProfile, listProfiles, saveProfileWork, legacyWorkAvailable } from '../src/storage.js';

function memoryStorage() {
  const data = new Map();
  return { get length() { return data.size; }, key: i => [...data.keys()][i], getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, String(value)) };
}

test('profiles isolate work, resume matching names, preserve legacy work and resist stale saves', () => {
  globalThis.localStorage = memoryStorage();
  localStorage.setItem('kl-coding-lab.lesson1.v1', JSON.stringify({ drafts: { hello: 'legacy' }, reflection: 'kept' }));
  assert.equal(legacyWorkAvailable(), true);
  const first = createProfile(' Alex  Tan ', '6A', true);
  assert.equal(first.work.drafts.hello, 'legacy');
  assert.equal(legacyWorkAvailable(), false);
  const second = createProfile('Sam Test', '10B');
  assert.deepEqual(second.work, {});
  const stale = structuredClone(first);
  assert.equal(saveProfileWork(first, { drafts: { hello: 'my code' } }), true);
  assert.equal(saveProfileWork(stale, { drafts: { hello: 'older tab' } }), false);
  assert.equal(createProfile('alex tan', '6a').work.drafts.hello, 'my code');
  assert.deepEqual(listProfiles().find(p => p.id === second.id).work, {});
  assert.ok(localStorage.getItem('kl-coding-lab.lesson1.v1').includes('legacy'));
  const before = localStorage.getItem('kl-coding-lab.student.v2.' + first.id);
  localStorage.setItem = () => { throw new Error('QuotaExceeded'); };
  assert.equal(saveProfileWork(first, { drafts: { hello: 'unsaved' } }), false);
  assert.equal(localStorage.getItem('kl-coding-lab.student.v2.' + first.id), before);
});

test('evidence keeps code snapshots and bounded recent attempts without losing totals', () => {
  let work = {};
  for (let i = 0; i < 12; i++) work = recordAttempt(work, { taskId: 'input', kind: 'run', code: `print(${i})`, output: String(i), inputs: ['雪', ''], startedAt: '2026-09-08T00:00:00Z' }, { type: 'done' });
  assert.equal(work.activity.input.runs, 12);
  assert.equal(work.activity.input.entries.length, 8);
  assert.equal(work.activity.input.entries[0].code, 'print(4)');
  assert.deepEqual(work.activity.input.entries.at(-1).inputs, ['雪', '']);
  const task = allTasks.find(t => t.id === 'input');
  work.passed = { input: 'checked code' }; work.drafts = { input: 'changed code' };
  assert.notEqual(taskStatus(task, work), 'Current code passed');
  assert.equal(progressSummary(work).passed, 0);
});

test('backup validation preserves learning evidence and rejects malformed data', () => {
  const source = recordAttempt({ drafts: { hello: 'print(1)' }, reflection: 'I tested zero.', passed: { hello: 'print(1)' } }, { taskId: 'hello', kind: 'check', code: 'print(1)', inputs: [], output: '', startedAt: '2026-09-08T00:00:00Z' }, { type: 'checked', result: { passed: false, message: 'Try again', cases: [{ input: '', expected: 'two lines', actual: '1', passed: false }] } });
  const restored = validateWork(JSON.parse(JSON.stringify(source)));
  assert.equal(restored.activity.hello.entries[0].result.cases[0].expected, 'two lines');
  assert.equal(restored.reflection, 'I tested zero.');
  assert.equal(restored.activity.hello.checks, 1);
  assert.throws(() => validateWork({ drafts: [] }));
  assert.throws(() => validateWork(null));
  assert.equal(validateWork({ drafts: { unknown: 'bad', hello: 'fine' } }).drafts.unknown, undefined);
});
