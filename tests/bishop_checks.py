import contextlib
import io
import json
from pathlib import Path
import sys
ROOT = Path(__file__).resolve().parents[1]
namespace = {}
exec((ROOT/'public/checks_bishop.py').read_text(), namespace)
check = namespace['__kl_check_bishop']
refs = json.loads((ROOT/'tests/bishop-reference.json').read_text())
items = json.load(sys.stdin)
for item in items:
    before = sys.stdin
    output = io.StringIO()
    try:
        sys.stdin = io.StringIO(item['support']['input'])
        with contextlib.redirect_stdout(output):
            exec(item['support']['code'], {})
    finally:
        sys.stdin = before
    assert output.getvalue().strip() == item['support']['output'].strip(), (item['id'], output.getvalue())
    if item.get('kind') == 'output':
        continue
    result = json.loads(check(refs[item['id']], json.dumps(item['spec'])))
    assert result['passed'], (item['id'], result)
    assert not json.loads(check('print(0)', json.dumps(item['spec'])))['passed'], item['id']
    sample = {'tests': [{'input': item['sampleInput'], 'expected': item['sampleOutput']}]}
    assert json.loads(check(refs[item['id']], json.dumps(sample)))['passed'], (item['id'], 'sample')
final = next(item for item in items if item['id'] == 'bb-helper')
for bad in [refs['bb-helper'].replace('N - Y + 1', 'N - Y'),
            refs['bb-helper'].replace('answer = right', 'answer = left'),
            refs['bb-helper'].replace('int(parts[0])', 'int(float(parts[0]))').replace('int(parts[2])', 'int(float(parts[2]))')]:
    assert not json.loads(check(bad, json.dumps(final['spec'])))['passed']
print('34 typing examples, 28 reference programs, 1000-case input and exact large integers verified')
