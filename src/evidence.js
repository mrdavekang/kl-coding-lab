import { allTasks, lesson } from './content.js';

export const HISTORY_LIMIT = 8;
const text = (value, limit = 12000) => typeof value === 'string' ? value.slice(0, limit) : '';
const object = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};

export function recordAttempt(work, attempt, result, now = new Date().toISOString()) {
  const { taskId } = attempt;
  const entry = {
    kind: attempt.kind, startedAt: attempt.startedAt, finishedAt: now,
    code: text(attempt.code), codeTruncated: attempt.code.length > 12000,
    inputs: (attempt.inputs || []).slice(0, 30).map(v => text(v, 500)),
    inputsTruncated: (attempt.inputs || []).length > 30 || (attempt.inputs || []).some(v => v.length > 500),
    output: text(attempt.output, 4000), outputTruncated: (attempt.output || '').length > 4000,
    status: result.stopped ? 'stopped' : result.type === 'error' ? 'error' : result.type === 'checked' ? result.result.passed ? 'passed' : 'retry' : 'finished',
    error: text(result.message, 4000), result: result.type === 'checked' ? result.result : null,
  };
  const previous = work.activity?.[taskId] || {};
  return { ...work, activity: { ...work.activity, [taskId]: {
    runs: (previous.runs || 0) + (entry.kind === 'run' ? 1 : 0),
    checks: (previous.checks || 0) + (entry.kind === 'check' ? 1 : 0),
    entries: [...(previous.entries || []), entry].slice(-HISTORY_LIMIT),
  } } };
}

export function taskStatus(task, work) {
  const code = work.drafts?.[task.id] ?? task.starter;
  if (task.check && work.passed?.[task.id] === code) return 'Current code passed';
  if (work.activity?.[task.id]?.checks) return 'Check again';
  if (work.attempted?.[task.id]) return 'Tried';
  if (code !== task.starter) return 'Edited';
  if (work.visited?.[task.id]) return 'Opened';
  return 'Not started';
}

export function evidenceTasks(work) {
  return allTasks.filter(task => work.attempted?.[task.id] || work.activity?.[task.id]?.entries?.length ||
    work.explanations?.[task.id]?.trim() || (work.drafts?.[task.id] !== undefined && work.drafts[task.id] !== task.starter));
}

export function progressSummary(work) {
  return {
    tasks: evidenceTasks(work).length,
    passed: lesson.filter(task => task.check && taskStatus(task, work) === 'Current code passed').length,
    runs: Object.values(work.activity || {}).reduce((n, item) => n + (item.runs || 0), 0),
    checks: Object.values(work.activity || {}).reduce((n, item) => n + (item.checks || 0), 0),
  };
}

// Backups are untrusted input. Copy only known fields and bounded evidence.
export function validateWork(value) {
  const source = object(value);
  if (!source.drafts || typeof source.drafts !== 'object' || Array.isArray(source.drafts)) throw new Error('Choose a lesson backup made by this app.');
  const work = { drafts: {}, hints: {}, visited: {}, attempted: {}, passed: {}, explanations: {}, activity: {}, reflection: text(source.reflection, 6000) };
  for (const task of allTasks) {
    const id = task.id;
    if (typeof source.drafts[id] === 'string') work.drafts[id] = source.drafts[id].slice(0, 100000);
    work.hints[id] = Math.min(task.hints.length, Math.max(0, Number(object(source.hints)[id]) || 0));
    if (object(source.visited)[id] === true) work.visited[id] = true;
    if (object(source.attempted)[id] === true) work.attempted[id] = true;
    if (typeof object(source.passed)[id] === 'string') work.passed[id] = source.passed[id].slice(0, 100000);
    work.explanations[id] = text(object(source.explanations)[id], 3000);
    const activity = object(object(source.activity)[id]);
    if (Array.isArray(activity.entries)) {
      const entries = activity.entries.filter(e => e && ['run', 'check'].includes(e.kind) && typeof e.code === 'string').slice(-HISTORY_LIMIT).map(e => ({
        kind: e.kind, code: text(e.code), codeTruncated: !!e.codeTruncated,
        startedAt: text(e.startedAt, 40), finishedAt: text(e.finishedAt, 40),
        status: ['finished', 'stopped', 'error', 'passed', 'retry'].includes(e.status) ? e.status : 'finished',
        inputs: Array.isArray(e.inputs) ? e.inputs.slice(0, 30).map(v => text(v, 500)) : [],
        inputsTruncated: !!e.inputsTruncated,
        output: text(e.output, 4000), outputTruncated: !!e.outputTruncated, error: text(e.error, 4000),
        result: e.result && typeof e.result === 'object' ? { passed: e.result.passed === true, message: text(e.result.message, 600), error: text(e.result.error, 4000),
          cases: Array.isArray(e.result.cases) ? e.result.cases.slice(0, 10).map(c => ({ passed: c.passed === true, input: text(c.input, 1500), expected: text(c.expected, 1500), actual: text(c.actual, 1500), error: text(c.error, 4000) })) : [] } : null,
      }));
      work.activity[id] = { entries, runs: Math.max(entries.filter(e => e.kind === 'run').length, Math.min(100000, Number(activity.runs) || 0)), checks: Math.max(entries.filter(e => e.kind === 'check').length, Math.min(100000, Number(activity.checks) || 0)) };
    }
  }
  if (allTasks.some(t => t.id === source.current)) work.current = source.current;
  if (['support', 'practice', 'stretch'].includes(source.pitstop)) work.pitstop = source.pitstop;
  return work;
}
