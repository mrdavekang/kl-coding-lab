export class PythonRuntime {
  constructor(events) { this.events = events; this.serial = 0; this.ready = false; this.active = null; }
  async start() {
    this.destroy(); this.events.status('loading');
    // Registration on GitHub Pages may reload once before React starts Python.
    if (!globalThis.crossOriginIsolated || typeof SharedArrayBuffer === 'undefined') {
      this.events.status('unavailable', 'Live Python needs a normal browser tab with browser storage enabled. Open the app directly, then reload.');
      return;
    }
    this.control = new Int32Array(new SharedArrayBuffer(16));
    this.input = new Uint8Array(new SharedArrayBuffer(65536));
    this.interrupt = new Uint8Array(new SharedArrayBuffer(1));
    this.worker = new Worker(new URL('python-worker.js', document.baseURI), { type: 'module' });
    const currentWorker = this.worker;
    this.bootTimer = setTimeout(() => {
      if (this.worker !== currentWorker || this.ready) return;
      this.destroy(); this.events.status('unavailable', 'Python is taking too long to load. Check your connection and try again.');
    }, 90000);
    this.worker.onmessage = ({ data }) => {
      if (this.worker !== currentWorker) return;
      if (data.type === 'ready') {
        clearTimeout(this.bootTimer); this.ready = true; this.events.status('ready'); return;
      }
      if (data.type === 'fatal') {
        this.destroy(); this.events.status('unavailable', data.message); return;
      }
      if (!this.active || data.id !== this.active.id) return;
      if (data.type === 'output') this.events.output(data.text);
      if (data.type === 'input') { this.request = data.request; this.events.input(); }
      if (['done', 'error', 'checked'].includes(data.type)) {
        const previous = this.active;
        clearTimeout(this.stopTimer); clearTimeout(this.checkTimer);
        this.active = null; this.request = null;
        this.events.finish({ ...data, kind: previous.kind });
        this.events.status('ready');
      }
    };
    this.worker.onerror = () => {
      this.destroy(); this.events.status('unavailable', 'Python could not start. Check the connection and try again.');
    };
    this.worker.postMessage({ type: 'init', controlBuffer: this.control.buffer, inputBuffer: this.input.buffer, interruptBuffer: this.interrupt.buffer });
  }
  execute(code, check) {
    if (!this.ready || this.active) return false;
    const id = ++this.serial;
    this.active = { id, kind: check ? 'check' : 'run' };
    this.request = null;
    this.events.status(check ? 'checking' : 'running');
    this.worker.postMessage({ type: check ? 'check' : 'run', id, code, check });
    if (check) this.checkTimer = setTimeout(() => this.stop('The checks took too long. Look for a loop that does not finish.'), 6000);
    return true;
  }
  answer(value) {
    if (!this.active || !this.request || Atomics.load(this.control, 2) !== this.request) return false;
    const bytes = new TextEncoder().encode(value + '\n');
    if (bytes.length > this.input.length) throw new Error('That answer is too long. Try fewer than 16,000 characters.');
    this.input.set(bytes); Atomics.store(this.control, 1, bytes.length);
    Atomics.store(this.control, 0, 1); Atomics.notify(this.control, 0);
    this.request = null; return true;
  }
  stop(reason = 'Program stopped. Your code is still here.') {
    if (!this.active) return;
    Atomics.store(this.interrupt, 0, 2);
    this.events.stopping?.(reason);
    const activeId = this.active.id;
    this.stopTimer = setTimeout(() => {
      if (this.active?.id !== activeId) return;
      const kind = this.active.kind;
      this.events.finish({ type: 'error', stopped: true, message: reason, kind });
      this.start();
    }, 900);
  }
  destroy() {
    clearTimeout(this.bootTimer); clearTimeout(this.stopTimer); clearTimeout(this.checkTimer);
    this.worker?.terminate(); this.worker = null; this.ready = false; this.active = null; this.request = null;
  }
}

export function friendlyError(message) {
  const matches = [...message.matchAll(/File "main\.py", line (\d+)/g)];
  const line = matches.length ? Number(matches.at(-1)[1]) : null;
  let tip = 'Read the error below, make one small change and run again.';
  if (/IndentationError|TabError/.test(message)) tip = 'Check the spacing at the start of this line. Lines inside the same block need matching indentation.';
  else if (/SyntaxError/.test(message)) tip = 'Check matching quotes and brackets. A line starting a block also needs a colon.';
  else if (/NameError/.test(message)) tip = 'Check the spelling of your variable. Give it a value before you use it.';
  else if (/ValueError/.test(message)) tip = 'Check the answer you entered. int() needs text representing a whole number, such as 4.';
  else if (/TypeError/.test(message)) tip = 'Check the kinds of values you are combining. Convert numeric input with int() before adding.';
  else if (/ZeroDivisionError/.test(message)) tip = 'This calculation divides by zero. Check the divisor before dividing.';
  return { line, tip };
}
