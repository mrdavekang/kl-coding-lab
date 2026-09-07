const KEY = 'kl-coding-lab.lesson1.v1';
export function loadWork() {
  try { const value = JSON.parse(localStorage.getItem(KEY) || '{}'); return value && typeof value === 'object' ? value : {}; }
  catch { return {}; }
}
export function saveWork(value) {
  try { localStorage.setItem(KEY, JSON.stringify(value)); return true; }
  catch { return false; }
}
export function downloadFile(name, contents, type = 'text/plain') {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const link = document.createElement('a'); link.href = url; link.download = name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
