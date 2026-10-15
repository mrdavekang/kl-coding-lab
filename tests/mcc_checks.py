"""Exercise references, misconception checks and full-size fence verification."""
import contextlib
import io
import itertools
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
namespace = {}
exec((ROOT / 'public/checks4.py').read_text(), namespace)
check = namespace['__kl_check4']
references = json.loads((ROOT / 'tests/mcc-reference.json').read_text())
payload = json.load(sys.stdin)

def execute(code, data):
    old_stdin = sys.stdin
    output = io.StringIO()
    try:
        sys.stdin = io.StringIO(data)
        with contextlib.redirect_stdout(output):
            exec(code, {'__name__': '__main__'})
        return output.getvalue().strip()
    finally:
        sys.stdin = old_stdin

for item in payload:
    code = references[item['id']]
    result = json.loads(check(code, json.dumps(item['spec'])))
    assert result['passed'], (item['id'], result)
    assert execute(code, item['sampleInput']) == item['sampleOutput'].strip(), item['id']
    # A program that memorises the displayed sample must fail fresh checks.
    hardcoded = 'print(' + repr(item['sampleOutput']) + ')'
    assert not json.loads(check(hardcoded, json.dumps(item['spec'])))['passed'], item['id']
    if item.get('example'):
        assert execute(item['example'], item.get('exampleInput', '')) == item['exampleOutput'].strip(), item['id']

specs = {item['id']: item['spec'] for item in payload}
wrong_minimum = references['cheapest'].replace('smallest = costs[0]', 'smallest = 0')
assert not json.loads(check(wrong_minimum, json.dumps(specs['cheapest'])))['passed']
wrong_reset = references['all-columns'].replace('for column in range(m):\n    missing = 0', 'missing = 0\nfor column in range(m):')
assert not json.loads(check(wrong_reset, json.dumps(specs['all-columns'])))['passed']
wrong_rows = references['building-fences'].split('smallest = n')[0] + 'print(min(row.count(".") for row in grid))'
assert not json.loads(check(wrong_rows, json.dumps(specs['building-fences'])))['passed']
wrong_index = references['building-fences'].replace('grid[row][column]', 'grid[column][row]')
assert not json.loads(check(wrong_index, json.dumps(specs['building-fences'])))['passed']

# Independent oracle: maximum existing hashes in a column determines the cost.
program = compile(references['building-fences'], 'main.py', 'exec')
count = 0
for n in range(1, 4):
    for m in range(1, 4):
        for cells in itertools.product('.#', repeat=n*m):
            rows = [''.join(cells[r*m:(r+1)*m]) for r in range(n)]
            expected = n - max(sum(row[c] == '#' for row in rows) for c in range(m))
            data = f'{n} {m}\n' + '\n'.join(rows) + '\n'
            assert execute(program, data) == str(expected)
            count += 1

rows = ['.' * 799 + ('#' if r < 400 else '.') for r in range(800)]
assert execute(program, '800 800\n' + '\n'.join(rows) + '\n') == '400'
print(f'All 13 exercises and examples passed; misconceptions rejected; {count} small fields and the 800 x 800 boundary verified.')
