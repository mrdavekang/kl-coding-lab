const PYODIDE_URL = 'https://cdn.jsdelivr.net/pyodide/v314.0.6/full/';
let python, controls, inputBytes, interrupts;
let job = null, requestNumber = 0, pendingInput = new Uint8Array(), pendingOffset = 0;
let output = '', outputLength = 0, truncated = false;
const decoder = new TextDecoder();
const MAX_OUTPUT = 24000;

function send(type, fields = {}) { self.postMessage({ type, id: job?.id, ...fields }); }
function flush() { if (output) { send('output', { text: output }); output = ''; } }
function write(bytes) {
  const text = decoder.decode(bytes, { stream: true });
  if (outputLength < MAX_OUTPUT) {
    const fragment = text.slice(0, MAX_OUTPUT - outputLength);
    output += fragment; outputLength += fragment.length;
    if (output.length >= 512) flush();
  } else if (!truncated) {
    truncated = true; flush(); send('output', { text: '\n[Output shortened. Use Stop if your program keeps printing.]\n' });
  }
  return bytes.length;
}
function read(buffer) {
  if (pendingOffset >= pendingInput.length) {
    flush();
    Atomics.store(controls, 0, 0);
    const request = ++requestNumber;
    Atomics.store(controls, 2, request);
    send('input', { request });
    while (Atomics.load(controls, 0) === 0) {
      Atomics.wait(controls, 0, 0, 50);
      python.checkInterrupt();
    }
    python.checkInterrupt();
    const length = Atomics.load(controls, 1);
    pendingInput = inputBytes.slice(0, length); pendingOffset = 0;
  }
  const count = Math.min(buffer.length, pendingInput.length - pendingOffset);
  buffer.set(pendingInput.subarray(pendingOffset, pendingOffset + count));
  pendingOffset += count;
  return count;
}

self.onmessage = async ({ data }) => {
  if (data.type === 'init') {
    try {
      if (!self.crossOriginIsolated) throw new Error('The Python worker could not enable live input. Reload this page in its own browser tab.');
      controls = new Int32Array(data.controlBuffer);
      inputBytes = new Uint8Array(data.inputBuffer);
      interrupts = new Uint8Array(data.interruptBuffer);
      const { loadPyodide } = await import(PYODIDE_URL + 'pyodide.mjs');
      python = await loadPyodide({ indexURL: PYODIDE_URL });
      python.setInterruptBuffer(interrupts);
      python.setStdin({ read, isatty: true });
      python.setStdout({ write });
      python.setStderr({ write });
      const response = await fetch(new URL('./checks.py', self.location.href));
      if (!response.ok) throw new Error('The task checks could not load. Please reload.');
      await python.runPythonAsync(await response.text());
      send('ready');
    } catch (error) { send('fatal', { message: String(error.message || error) }); }
    return;
  }
  if (!python || job || !['run', 'check'].includes(data.type)) return;
  job = data;
  output = ''; outputLength = 0; truncated = false;
  pendingInput = new Uint8Array(); pendingOffset = 0;
  Atomics.store(interrupts, 0, 0); Atomics.store(controls, 0, 0);
  let completion;
  try {
    if (data.type === 'check') {
      python.globals.set('__kl_source', data.code);
      python.globals.set('__kl_task', data.check);
      const result = await python.runPythonAsync('__kl_check(__kl_source, __kl_task)');
      completion = { type: 'checked', result: JSON.parse(result) };
    } else {
      // A fresh namespace avoids carrying variables from a previous task or run.
      const globals = python.toPy({ __name__: '__main__' });
      try { await python.runPythonAsync(data.code, { globals, filename: 'main.py' }); }
      finally { globals.destroy(); }
      flush(); completion = { type: 'done' };
    }
  } catch (error) {
    flush();
    completion = { type: 'error', message: String(error.message || error), stopped: /KeyboardInterrupt/.test(String(error)) };
  } finally {
    // PyProxy.delete raises for a missing key. Interactive runs create neither key.
    if (python.globals.has('__kl_source')) python.globals.delete('__kl_source');
    if (python.globals.has('__kl_task')) python.globals.delete('__kl_task');
    job = null;
  }
  // Announce completion only after the worker can accept its next request.
  self.postMessage({ ...completion, id: data.id });
};
