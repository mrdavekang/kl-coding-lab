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
  const link = document.createElement('a'); link.href = url; link.download = name; document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

const PROFILE_PREFIX = 'kl-coding-lab.student.v2.';
const CLAIM_KEY = 'kl-coding-lab.legacy-claimed.v2';
const normalize = value => value.trim().replace(/\s+/g, ' ');

export function listProfiles() {
  try {
    const profiles = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(PROFILE_PREFIX)) continue;
      try {
        const profile = JSON.parse(localStorage.getItem(key));
        if (profile?.id && typeof profile.name === 'string' && typeof profile.className === 'string') profiles.push(profile);
      } catch { /* Preserve unreadable records instead of replacing them. */ }
    }
    return profiles.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  } catch { return []; }
}

export function legacyWorkAvailable() {
  try { return !localStorage.getItem(CLAIM_KEY) && Object.keys(loadWork()).length > 0; }
  catch { return false; }
}

export function createProfile(name, className, keepLegacy = false) {
  name = normalize(name).slice(0, 80); className = normalize(className).slice(0, 50);
  if (!name || !className) throw new Error('Enter your name and class to start.');
  const existing = listProfiles().find(p => normalize(p.name).toLocaleLowerCase() === name.toLocaleLowerCase() && normalize(p.className).toLocaleLowerCase() === className.toLocaleLowerCase());
  if (existing) return existing;
  const profile = { id: crypto.randomUUID(), name, className, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), revision: 1, work: keepLegacy && legacyWorkAvailable() ? loadWork() : {} };
  try {
    localStorage.setItem(PROFILE_PREFIX + profile.id, JSON.stringify(profile));
    if (keepLegacy && legacyWorkAvailable()) localStorage.setItem(CLAIM_KEY, profile.id);
    return profile;
  } catch { throw new Error('This browser could not save a student profile. Allow site storage or try another browser. Existing work has been kept.'); }
}

export function saveProfileWork(profile, work) {
  try {
    const key = PROFILE_PREFIX + profile.id;
    const latest = JSON.parse(localStorage.getItem(key) || 'null');
    if (!latest || latest.revision !== profile.revision) return false;
    const next = { ...profile, work, revision: profile.revision + 1, updatedAt: new Date().toISOString() };
    localStorage.setItem(key, JSON.stringify(next));
    // This reference belongs to the current lesson session, so subsequent saves use its revision.
    Object.assign(profile, next);
    return true;
  } catch { return false; }
}
