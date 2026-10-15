"""Verify the explicit teacher solution against placements, not the same formula."""
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
references = json.loads((ROOT / 'tests/corner-cover-reference.json').read_text())
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
    hardcoded = 'print(' + repr(item['sampleOutput']) + ')'
    assert not json.loads(check(hardcoded, json.dumps(item['spec'])))['passed'], item['id']
    if item.get('example'):
        assert execute(item['example'], '') == item['exampleOutput'].strip(), item['id']

spec = next(item['spec'] for item in payload if item['id'] == 'corner-cover')
reference = references['corner-cover']
for misconception in [
    reference.replace('if landscape or portrait:', 'if landscape:'),
    reference.replace('if landscape or portrait:', 'if landscape and portrait:'),
    reference.replace('and (A == n or B == m)', '').replace('and (B == n or A == m)', ''),
    reference.replace('B == m', 'B == [1]'),
    reference.replace('else:\n        answers.append("NO")', 'else:\n        pass'),
    reference.replace('    numbers = []\n', '' ).replace('answers = []\n', 'answers = []\nnumbers = []\n'),
    reference.replace('answers = []\n', '').replace('for i in range(testcase):\n','for i in range(testcase):\n    answers = []\n'),
]:
    assert not json.loads(check(misconception, json.dumps(spec)))['passed'], misconception

def placement_possible(n, m, a, b):
    corners = {(0, 0), (0, m-1), (n-1, 0), (n-1, m-1)}
    for height, width in [(a, b), (b, a)]:
        for top in range(n-height+1):
            for left in range(m-width+1):
                if sum(top <= row < top+height and left <= col < left+width for row, col in corners) >= 2:
                    return True
    return False

cases = list(itertools.product(range(2, 7), range(2, 7), range(1, 8), range(1, 8)))
data = str(len(cases)) + '\n' + '\n'.join(' '.join(map(str, case)) for case in cases) + '\n'
expected = '\n'.join('YES' if placement_possible(*case) else 'NO' for case in cases)
assert execute(compile(reference, 'main.py', 'exec'), data) == expected
data = '200\n' + '1000000000000000000 1000000000000000000 2 1000000000000000000\n' * 200
assert execute(reference, data).splitlines() == ['YES'] * 200
print(f'All 11 exercises and examples passed; seven misconceptions rejected; {len(cases)} placements and 200 huge cases verified.')
