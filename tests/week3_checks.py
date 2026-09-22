import contextlib
import io
import json
from pathlib import Path
import runpy
import sys

root = Path(__file__).resolve().parents[1]
check = runpy.run_path(str(root / 'public/checks3.py'))['__kl_check3']
trace = runpy.run_path(str(root / 'public/trace.py'))['__kl_trace']
tasks = json.load(sys.stdin)
count = 0
for task in tasks:
    if task.get('tests'):
        result = json.loads(check(task['solution'], json.dumps(task['spec'])))
        assert result['passed'], (task['id'], result)
        # A fixed sample answer must not be enough for any code exercise.
        fixed = 'print(' + repr(task['sampleOutput']) + ')'
        assert not json.loads(check(fixed, json.dumps(task['spec'])))['passed'], task['id']
        if task['id'] in ['g2', 'g3']:
            assert not json.loads(check(task['starter'], json.dumps(task['spec'])))['passed'], task['id']
        count += 1
    if task['kind'] != 'output' and task.get('example'):
        old = sys.stdin
        stream = io.StringIO()
        try:
            sys.stdin = io.StringIO(task.get('exampleInput', ''))
            with contextlib.redirect_stdout(stream):
                exec(compile(task['example'], 'main.py', 'exec'), {})
        finally:
            sys.stdin = old
        assert stream.getvalue().strip() == task['exampleOutput'].strip(), (task['id'], stream.getvalue())
# Exercise the new split/append/count/dictionary tracing subset on small inputs.
for task_id in ['b3', 'br3', 'si3', 'go1']:
    task = next(t for t in tasks if t['id'] == task_id)
    old = sys.stdin
    events = []
    try:
        sys.stdin = io.StringIO(task['sampleInput'])
        with contextlib.redirect_stdout(io.StringIO()):
            trace(task['solution'], lambda value: events.append(json.loads(value)))
    finally:
        sys.stdin = old
    assert events, task_id
assert not json.loads(check('while True:\n    print("x" * 1000)', json.dumps({'tests':[{'input':'','expected':'0'}]})))['passed']
assert not json.loads(check('print(input())', json.dumps({'tests':[{'input':'','expected':'0'}]})))['passed']
print(str(count) + ' reference solutions passed, examples verified, fixed-answer failures rejected, tracing checked.')
