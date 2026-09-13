"""Read exported lesson JSON on stdin; verify models and rebuild teacher references."""
import contextlib
import io
import json
from pathlib import Path
import runpy
import sys

ROOT = Path(__file__).resolve().parents[1]
data = json.load(sys.stdin)
trace = runpy.run_path(str(ROOT / 'public/trace.py'))['__kl_trace']
check = runpy.run_path(str(ROOT / 'public/checks2.py'))['__kl_check2']
traces = {}
lines = ['# Week 2 teacher reference', '', '15 September 2026 · 60 minutes · KS2–KS4', '',
         'Lists, loops and running totals. Read a short example, build a program, test changed data, then explain an actual value.', '',
         '## Lesson sequence', '', '| Minutes | Stage | Focus |', '| --- | --- | --- |']
groups = {group['id']: group for group in data['practiceGroups']}
for task in data['lesson']:
    group = groups.get(task['id'])
    title = group['title'] if group else task['title']
    lines.append(f"| {task['time']} | {task['phase']} | {title} |")
lines += ['', '## Practice and pacing', '',
          'Main Task 1 has three programs in 13 minutes (about 4 minutes each). Main Task 2 has five in 15 minutes (about 3 minutes each). These are flexible windows including reading, coding and checking. Offer the worked example or hints to students who need them. Confident students can build with less help.', '',
          'Swap coder and checker after a card. Every student explains one step. Pause everyone for the pit stops at minutes 27 and 50, even with unfinished cards; students can return to those later. Cards are available to every student, and each keeps its own code, tests and evidence.', '',
          'KS2: use short lists and missing-line starters. KS3: reduce scaffolding and compare contexts. KS4: use conditions, functions or one-pass reasoning in the separate Extensions area. These guide support, not access.', '',
          'Use meaningful camelCase names, double-quoted strings, four spaces and explicit updates. Accept correct alternatives when they meet the stated task. Check work substitutes fresh data in the named list; model code and student drafts are unchanged.', '']
for group in data['practiceGroups']:
    lines += ['### ' + group['title'], '', group['note'], '']
    for index, identifier in enumerate(group['cards'], 1):
        task = next(t for t in data['allTasks'] if t['id'] == identifier)
        lines.append(f"{index}. **{task['title']}** — {task['skill']}.")
    lines.append('')
lines += ['## Solutions and actual execution traces', '',
          'These traces come from running the model through the same Python tracing engine as the app. Line numbers refer to the model shown. Use a student’s own trace when discussing their program.', '']
for task in data['allTasks']:
    if not (task.get('solution') or task.get('teacher')):
        continue
    code = task.get('solution') or task['example']
    if task.get('check'):
        result = json.loads(check(code, task['check']))
        if not result['passed']:
            raise AssertionError(f"{task['id']} model failed: {result}")
    events = []
    with contextlib.redirect_stdout(io.StringIO()):
        trace(code, lambda event: events.append(json.loads(event)))
    traces[task['id']] = [{
        'line': event['executedLine'],
        'iteration': ', '.join(str(loop['iteration']) for loop in event['loops']),
        'explanation': event['explanation'],
    } for event in events]
    title = (task.get('level', '') + ' · ' if task.get('level') else '') + task['title']
    lines += ['### ' + title, '', task.get('teacher', ''), '', '```python', code.rstrip(), '```', '',
              '**Expected tests:** ' + task.get('tests', ''), '', '**Common error:** ' + task.get('error', ''), '',
              '**Ask after running:** ' + task.get('discussion', ''), '',
              '| Line | Iteration | What happened and why |', '| --- | --- | --- |']
    for event in traces[task['id']]:
        explanation = event['explanation'].replace('|', '\\|').replace('\n', ' ')
        lines.append(f"| {event['line'] or 'Start'} | {event['iteration'] or '—'} | {explanation} |")
    lines.append('')
lines += ['## Learning pit stops', '',
          'Use the same Knowledge, Skills and Understanding statements before and after learning. Ask for the scenario title, the line or iteration, an actual value, and a precise next action. A checked program is evidence for discussion, not a grade. Both pit stops are saved separately.', '',
          'Students download their Week 2 PDF and lesson backup. Reports include each attempted scenario separately. Saving is local to the browser; students attach the PDF to Teams themselves.', '']
(ROOT / 'src/week2/teacher-traces.json').write_text(json.dumps(traces, indent=2) + '\n')
(ROOT / 'public/week-2-teacher-guide.md').write_text('\n'.join(lines))
print(f"Verified and traced {len(traces)} teaching models.")
