import { jsPDF } from 'jspdf';
import { allTasks } from './content.js';
import { evidenceTasks, progressSummary, taskStatus, HISTORY_LIMIT } from './evidence.js';

export function reportFilename(profile, extension = 'pdf') {
  const safe = value => value.normalize('NFKC').replace(/[^\p{L}\p{N}_-]+/gu, '-').replace(/^-|-$/g, '').slice(0, 55) || 'student';
  return `KL-Coding-Lesson-1-${safe(profile.className)}-${safe(profile.name)}.${extension}`;
}

export function dateLabel(value) {
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? 'Time not recorded' : new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kuala_Lumpur' }).format(date);
}

// Use the browser's font fallback for names/code containing non-Latin characters.
// Those lines are embedded as high-resolution images; ordinary text stays selectable.
function browserRaster(text, size, mono, bold) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const scale = 3;
  const font = `${bold ? 'bold ' : ''}${size * scale}px ${mono ? 'monospace' : 'system-ui, sans-serif'}`;
  context.font = font;
  const width = Math.ceil(context.measureText(text).width) + 6;
  canvas.width = Math.max(1, width); canvas.height = Math.ceil(size * 1.7 * scale);
  context.font = font; context.fillStyle = '#172643'; context.textBaseline = 'alphabetic';
  context.fillText(text, 0, size * 1.2 * scale);
  return { data: canvas.toDataURL('image/png'), width: width / scale, height: canvas.height / scale, baseline: size * 1.2 };
}

export function createReport(profile, work, { now = new Date().toISOString(), rasterize = browserRaster } = {}) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4', compress: true, putOnlyUsedFonts: true });
  doc.setProperties({ title: `${profile.name} - Python learning evidence`, subject: 'Lesson 1: input, output and variables', author: 'KL Coding Lab', creator: 'KL Coding Lab' });
  const left = 44, width = 507, bottom = 783;
  let y = 55;
  let continuation = 'Lesson 1 / Learning evidence';
  const clean = value => String(value ?? '').replace(/\r\n?/g, '\n').replace(/\t/g, '    ').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '');
  const standard = value => !/[^\x20-\x7e]/.test(value);
  function font(size, mono, bold) { doc.setFont(mono ? 'courier' : 'helvetica', bold ? 'bold' : 'normal'); doc.setFontSize(size); }
  function measure(value, size, mono, bold) {
    font(size, mono, bold);
    return standard(value) ? doc.getTextWidth(value) : rasterize(value, size, mono, bold).width;
  }
  function draw(value, x, baseline, size, mono = false, bold = false) {
    font(size, mono, bold); doc.setTextColor('#172643');
    if (standard(value)) doc.text(value, x, baseline);
    else {
      const item = rasterize(value, size, mono, bold);
      doc.addImage(item.data, 'PNG', x, baseline - item.baseline, item.width, item.height);
    }
  }
  function newPage() {
    if (doc.getNumberOfPages() >= 180) throw new Error('This report is very long. Download your lesson backup and Python files to keep the full work.');
    doc.addPage(); y = 60;
    draw('KL CODING LAB  /  ' + continuation, left, 32, 9, false, true);
    doc.setDrawColor('#dce2ee'); doc.line(left, 41, left + width, 41);
  }
  function room(height = 22) { if (y + height > bottom) newPage(); }
  function wrap(value, size, mono, bold, maxWidth) {
    const lines = [];
    for (const raw of clean(value).split('\n')) {
      if (!raw) { lines.push(''); continue; }
      let rest = raw;
      while (measure(rest, size, mono, bold) > maxWidth) {
        const chars = [...rest]; let low = 1, high = chars.length;
        while (low < high) { const mid = Math.ceil((low + high) / 2); if (measure(chars.slice(0, mid).join(''), size, mono, bold) <= maxWidth) low = mid; else high = mid - 1; }
        let count = low;
        if (!mono) { const space = chars.slice(0, count).lastIndexOf(' '); if (space > count / 2) count = space + 1; }
        lines.push(chars.slice(0, count).join('')); rest = chars.slice(count).join('');
      }
      lines.push(rest);
    }
    return lines;
  }
  function paragraph(value, { size = 10.5, mono = false, bold = false, box = false } = {}) {
    const pad = box ? 10 : 0, step = size * 1.5;
    const lines = wrap(value, size, mono, bold, width - pad * 2);
    if (lines.length * step < 180) room(lines.length * step + 8);
    for (const line of lines) {
      room(step + 5);
      if (box) { doc.setFillColor('#f2f5fa'); doc.rect(left, y - size - 2, width, step + 1, 'F'); }
      if (line) draw(line, left + pad, y, size, mono, bold);
      y += step;
    }
    y += 8;
  }
  function heading(title, size = 14) { room(50); y += 9; paragraph(title, { size, bold: true }); }
  function codeBlock(code, limit = 12000) {
    const source = String(code || '');
    paragraph(source.slice(0, limit) || '(No code written.)', { size: 9, mono: true, box: true });
    if (source.length > limit) paragraph(`Excerpt: first ${limit.toLocaleString('en-GB')} characters. The lesson backup and Python download contain the full program.`, { size: 9 });
  }
  const stats = progressSummary(work);
  paragraph('KL CODING LAB', { size: 10, bold: true });
  paragraph('My Python learning report', { size: 24, bold: true });
  paragraph(profile.name, { size: 18, bold: true });
  paragraph(`Class: ${profile.className}`, { size: 12 });
  paragraph('Lesson 1 / Input, output and variables / 8 September 2026');
  paragraph(`Report created: ${dateLabel(now)} (Malaysia time)`, { size: 9 });
  y += 3;
  paragraph(`${stats.tasks} tasks with work     ${stats.passed}/6 core practice checks passed\n${stats.runs} recorded runs     ${stats.checks} recorded checks`, { bold: true, box: true });
  paragraph('This report contains learner work and practice-check evidence from this browser or an imported backup. Passing the supplied checks is evidence for those cases, not a grade or proof of independent understanding.', { size: 9.5 });
  heading('My reflection');
  paragraph(work.reflection?.trim() || 'Not completed yet.');
  const choices = { support: 'I need a hand', practice: 'I want more practice', stretch: 'I am ready to stretch' };
  paragraph(`Learning pit stop: ${choices[work.pitstop] || 'No choice recorded'}`, { size: 10 });
  room(135);
  heading('Teacher review');
  paragraph('Ask the learner to explain a variable, demonstrate a new input and explain a test or a change. Use the work and their explanation together to decide the next step.', { size: 10 });
  paragraph('Feedback / next step: ___________________________________________________\n______________________________________________________________________', { size: 10 });

  continuation = 'Lesson 1 / Progress overview'; newPage();
  heading('My route through the lesson', 19);
  paragraph('Every challenge level is open. An opened card does not count as a completed task.', { size: 10 });
  for (const task of allTasks) {
    room(49);
    paragraph(`${task.level ? task.level + ': ' : ''}${task.title}`, { bold: true, size: 10.5 });
    paragraph(`${taskStatus(task, work)} | Hints opened: ${work.hints?.[task.id] || 0} | Runs: ${work.activity?.[task.id]?.runs || 0} | Checks: ${work.activity?.[task.id]?.checks || 0}`, { size: 9 });
  }
  const included = evidenceTasks(work);
  if (!included.length) { heading('Your work will appear here'); paragraph('No edited programs or recorded attempts yet. Write and run a program, then download a new report.'); }
  for (const task of included) {
    continuation = task.title.replace(/[^\x20-\x7e]/g, ''); newPage();
    heading(`${task.level ? task.level + ' / ' : ''}${task.title}`, 18);
    paragraph(task.task, { size: 10 });
    paragraph(`Status: ${taskStatus(task, work)} | Hints opened: ${work.hints?.[task.id] || 0}`, { size: 10, bold: true });
    heading('My explanation', 12);
    paragraph(work.explanations?.[task.id]?.trim() || 'Not added yet. Ask me how my program works.');
    heading('My current code', 12);
    paragraph('Indentation is preserved. Long lines wrap on the page.', { size: 9 });
    const currentCode = work.drafts?.[task.id] ?? task.starter;
    codeBlock(currentCode);
    const activity = work.activity?.[task.id];
    const entries = activity?.entries || [];
    heading('My attempts and tests', 12);
    paragraph(`Showing the latest ${Math.min(HISTORY_LIMIT, entries.length)} recorded attempts. Total recorded: ${activity?.runs || 0} runs and ${activity?.checks || 0} checks. Earlier app versions did not record attempts.`, { size: 9 });
    entries.forEach((entry, i) => {
      heading(`${i + 1}. ${entry.kind === 'check' ? 'Check work' : 'Run'} / ${entry.status} / ${dateLabel(entry.finishedAt)}`, 10.5);
      if (entry.code !== currentCode || entry.codeTruncated) {
        paragraph('Code used for this attempt (different from the current version, or an excerpt):', { size: 9 }); codeBlock(entry.code);
        if (entry.codeTruncated) paragraph('Recorded code was shortened to 12,000 characters.', { size: 9 });
      } else paragraph('Used the current code shown above.', { size: 9 });
      if (entry.kind === 'run') {
        paragraph('Answers entered: ' + (entry.inputs.length ? entry.inputs.map(v => JSON.stringify(v)).join(' / ') : '(none)'), { size: 9 });
        if (entry.inputsTruncated) paragraph('Input excerpt: up to 30 answers, up to 500 characters each.', { size: 9 });
        codeBlock(entry.output || '(No console output.)', 4000);
        if (entry.outputTruncated) paragraph('Console excerpt: first 4,000 characters.', { size: 9 });
      }
      if (entry.error) codeBlock(entry.error, 4000);
      if (entry.result) {
        paragraph(entry.result.message || 'Check results', { size: 9 });
        if (entry.result.error) codeBlock(entry.result.error, 4000);
        entry.result.cases?.forEach((item, n) => {
          const caseText = `Input: ${item.input || '(none)'}\nExpected: ${item.expected}\nActual: ${item.actual || '(no output)'}`;
          const caseHeight = wrap(caseText, 9, true, false, width - 20).length * 13.5 + 38;
          room(Math.min(caseHeight, 250)); paragraph(`Test ${n + 1}: ${item.passed ? 'Passed' : 'Try again'}`, { size: 9, bold: true });
          codeBlock(`Input: ${item.input || '(none)'}\nExpected: ${item.expected}\nActual: ${item.actual || '(no output)'}`, 5000);
          if (item.error) codeBlock(item.error, 4000);
        });
      }
    });
  }
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    doc.setPage(page); doc.setDrawColor('#dce2ee'); doc.line(left, 803, left + width, 803);
    draw('KL Coding Lab / Lesson 1 / Student learning evidence', left, 821, 8);
    draw(`${page} / ${pages}`, 514, 821, 8);
  }
  return doc;
}
