import ast
import contextlib
import io
import json
import runpy
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[1]
check = runpy.run_path(str(root / 'public/checks4.py'))['__kl_check4']
trace = runpy.run_path(str(root / 'public/trace.py'))['__kl_trace']
references = json.loads((root / 'tests/week4-reference.json').read_text())
tasks = json.load(sys.stdin)

for task in tasks:
    source = references[task['id']]
    result = json.loads(check(source, json.dumps(task['spec'])))
    assert result['passed'], (task['id'], result)
    assert result['cases'][0]['actual'].strip() == task['sampleOutput'].strip(), task['id']
    assert not json.loads(check(task['starter'], json.dumps(task['spec'])))['passed'], task['id']
    fixed = 'print(' + repr(task['sampleOutput']) + ')'
    assert not json.loads(check(fixed, json.dumps(task['spec'])))['passed'], task['id']

    events = []
    old_stdin = sys.stdin
    example_output = io.StringIO()
    try:
        sys.stdin = io.StringIO(task.get('exampleInput', ''))
        with contextlib.redirect_stdout(example_output):
            trace(task['example'], lambda value: events.append(json.loads(value)))
    finally:
        sys.stdin = old_stdin
    assert events, task['id']
    assert example_output.getvalue().strip() == task['exampleOutput'].strip(), task['id']
    if task['spec'].get('requireLoop'):
        assert any(event.get('iterationChanged') for event in events), task['id']

# Common misconceptions: count everything, reset in the wrong place, and choose a row.
mutants = {
    'w4-count-qualifiers': 'scores=[9,12,7,15]\nc=0\nfor score in scores:\n    if score>=10:\n        c=c+score\nprint(c)',
    'w4-best-column': "fenceColumns=[['.','.','#','.'],['#','.','#','#'],['.','.','.','.']]\nbest=5\nfor column in fenceColumns:\n    missing=0\n    for cell in column:\n        if cell=='.':\n            missing=missing+1\n        if missing<best:\n            best=missing\nprint(best)",
    'w4-building-fences': "dimensions=input().split()\nn=int(dimensions[0])\nm=int(dimensions[1])\nrows=[]\nfor i in range(n):\n    rows.append(input())\nbest=m+1\nfor row in rows:\n    c=0\n    for cell in row:\n        if cell=='.':\n            c=c+1\n    if c<best:\n        best=c\nprint(best)"
}
for task_id, source in mutants.items():
    task = next(item for item in tasks if item['id'] == task_id)
    assert not json.loads(check(source, json.dumps(task['spec'])))['passed'], task_id

print(f"{len(tasks)} Week 4 references and examples passed fresh-data checks and real traces.")
