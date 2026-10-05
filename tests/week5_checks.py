import contextlib
import io
import json
import runpy
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[1]
check = runpy.run_path(str(root / 'public/checks4.py'))['__kl_check4']
trace = runpy.run_path(str(root / 'public/trace.py'))['__kl_trace']
references = json.loads((root / 'tests/week5-reference.json').read_text())
tasks = json.load(sys.stdin)

for task in tasks:
    result = json.loads(check(references[task['id']], json.dumps(task['spec'])))
    assert result['passed'], (task['id'], result)
    assert result['cases'][0]['actual'].strip() == task['sampleOutput'].strip()
    assert not json.loads(check(task['starter'], json.dumps(task['spec'])))['passed'], task['id']
    events = []
    old_stdin = sys.stdin
    output = io.StringIO()
    try:
        sys.stdin = io.StringIO(task.get('exampleInput', ''))
        with contextlib.redirect_stdout(output):
            trace(task['example'], lambda value: events.append(json.loads(value)))
    finally:
        sys.stdin = old_stdin
    assert output.getvalue().strip() == task['exampleOutput'].strip(), task['id']
    assert events and events[-1]['event'] == 'end', task['id']
    for line, code in enumerate(task['example'].splitlines(), 1):
        if code.strip():
            assert task['lineNotes'].get(str(line)), (task['id'], line)
    if task['spec']['requireLoop']:
        assert any(event.get('iterationChanged') for event in events), task['id']

counter = next(t for t in tasks if t['id'] == 'w5-qualifiers')
for source in [references['w5-qualifiers'].replace('>= 10', '> 10'),
               references['w5-qualifiers'].replace('qualifyingCount + 1', 'qualifyingCount + score'),
               references['w5-qualifiers'].replace('for score in scores:', 'for score in scores:\n    qualifyingCount = 0')]:
    assert not json.loads(check(source, json.dumps(counter['spec'])))['passed']
single = next(t for t in tasks if t['id'] == 'w5-input')
assert not json.loads(check(references['w5-input'].replace('input()', 'input("Score? ")'), json.dumps(single['spec'])))['passed']
print(f'{len(tasks)} Week 5 programs passed fresh-data checks and complete Python traces; misconceptions rejected.')
