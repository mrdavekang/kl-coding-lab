import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { PythonRuntime, friendlyError } from '../src/runtime.js';

test('a finished run releases the worker before the next check', async () => {
  const messages = [];
  const context = vm.createContext({ TextDecoder, TextEncoder, Atomics, Int32Array, Uint8Array, SharedArrayBuffer,
    self: { postMessage: message => messages.push(message) },
  });
  vm.runInContext(fs.readFileSync(new URL('../public/python-worker.js', import.meta.url), 'utf8'), context);
  vm.runInContext(`
    const values = new Map();
    python = {
      globals: {
        has: key => values.has(key), set: (key, value) => values.set(key, value),
        delete: key => { if (!values.has(key)) throw new Error('KeyError'); values.delete(key); }
      },
      toPy: () => ({ destroy() {} }),
      runPythonAsync: async code => code.startsWith('__kl_check') ? JSON.stringify({ passed: true, cases: [] }) : undefined
    };
    controls = new Int32Array(new SharedArrayBuffer(16));
    interrupts = new Uint8Array(new SharedArrayBuffer(1));
  `, context);
  await context.self.onmessage({ data: { type: 'run', id: 1, code: 'print("hello")' } });
  await context.self.onmessage({ data: { type: 'check', id: 2, check: 'hello', code: 'print("hello")' } });
  await context.self.onmessage({ data: { type: 'run', id: 3, code: 'print("again")' } });
  assert.deepEqual(messages.map(x => [x.type, x.id]), [['done', 1], ['checked', 2], ['done', 3]]);
});

test('console answers preserve empty lines, Unicode and spaces; stale answers are ignored', async () => {
  const original = { Worker: globalThis.Worker, document: globalThis.document, isolated: globalThis.crossOriginIsolated };
  class WorkerStub {
    postMessage(message) { this.last = message; }
    terminate() {}
    emit(data) { this.onmessage({ data }); }
  }
  globalThis.Worker = WorkerStub;
  globalThis.document = { baseURI: 'https://example.test/kl-coding-lab/' };
  globalThis.crossOriginIsolated = true;
  const runner = new PythonRuntime({ status() {}, input() {}, output() {}, finish() {} });
  try {
    await runner.start(); runner.worker.emit({ type: 'ready' });
    assert.equal(runner.execute('input()'), true);
    assert.equal(runner.execute('print(2)'), false);
    const id = runner.active.id;
    for (const [request, value] of [[1, ''], [2, '  雪 café  ']]) {
      Atomics.store(runner.control, 2, request);
      runner.worker.emit({ type: 'input', id, request });
      assert.equal(runner.answer(value), true);
      const bytes = runner.input.slice(0, Atomics.load(runner.control, 1));
      assert.equal(new TextDecoder().decode(bytes), value + '\n');
      assert.equal(runner.answer('duplicate'), false);
    }
    runner.worker.emit({ type: 'done', id: id - 1 });
    assert.equal(runner.active.id, id);
    runner.worker.emit({ type: 'done', id });
    assert.equal(runner.active, null);
  } finally {
    runner.destroy();
    globalThis.Worker = original.Worker; globalThis.document = original.document;
    globalThis.crossOriginIsolated = original.isolated;
  }
});

test('errors identify the last line in the pupil program', () => {
  assert.deepEqual(friendlyError('File "main.py", line 2\nFile "main.py", line 6\nNameError: missing'), {
    line: 6, tip: 'Check the spelling of your variable. Give it a value before you use it.',
  });
});
