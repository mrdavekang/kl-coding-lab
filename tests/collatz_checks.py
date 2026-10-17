"""Exercise checks plus a per-number oracle independent of the round-by-list method."""
import contextlib
import io
import itertools
import json
from pathlib import Path
import random
import sys

ROOT = Path(__file__).resolve().parents[1]
namespace = {}
exec((ROOT / 'public/checks4.py').read_text(), namespace)
check = namespace['__kl_check4']
refs = json.loads((ROOT / 'tests/collatz-reference.json').read_text())
payload = json.load(sys.stdin)

def execute(code, data):
    original_stdin = sys.stdin
    output = io.StringIO()
    try:
        sys.stdin = io.StringIO(data)
        with contextlib.redirect_stdout(output):
            exec(code, {'__name__': '__main__'})
        return output.getvalue().strip()
    finally:
        sys.stdin = original_stdin

for item in payload:
    code = refs[item['id']]
    result = json.loads(check(code, json.dumps(item['spec'])))
    assert result['passed'], (item['id'], result)
    assert execute(code, item['sampleInput']) == item['sampleOutput'].strip(), item['id']
    assert not json.loads(check('print('+repr(item['sampleOutput'])+')', json.dumps(item['spec'])))['passed'], item['id']
    if item.get('example'):
        assert execute(item['example'], '') == item['exampleOutput'].strip(), item['id']

spec = next(item['spec'] for item in payload if item['id'] == 'collatz')
reference = refs['collatz']
misconceptions = [
    reference.replace('        list_of_numbers[index] = number\n', ''),
    reference.replace('for i in range(k):\n    total = 0\n', 'total = 0\nfor i in range(k):\n'),
    reference.replace('        else:\n            number = (3 * number) + 1', '        if number % 2 != 0:\n            number = (3 * number) + 1'),
    reference.replace('        number = int(list_of_numbers[index])\n', '        number = int(list_of_numbers[index])\n        if number == 1:\n            continue\n'),
    reference.replace('for i in range(k):', 'for i in range(n):'),
    reference.replace('    for index in range(n):', '    for index in range(k):'),
    reference.replace('    total = 0\n', '    total = 0\n    list_of_numbers = original[:]\n').replace('for i in range(k):', 'original = list_of_numbers[:]\nfor i in range(k):'),
    reference.replace('print(total)', '    print(total)'),
    reference.replace('print(total)', 'print(list_of_numbers)'),
    reference.replace('        list_of_numbers[index] = number\n        total += number', '        total += int(list_of_numbers[index])\n        list_of_numbers[index] = number'),
]
for code in misconceptions:
    assert not json.loads(check(code, json.dumps(spec)))['passed'], code

def oracle(values, k):
    total = 0
    for original in values:
        value = original
        for _ in range(k):
            if value & 1:
                value = value + value + value + 1
            else:
                value >>= 1
        total += value
    return str(total)

program = compile(reference, 'main.py', 'exec')
count = 0
for n in range(1, 4):
    for values in itertools.product(range(1, 5), repeat=n):
        for k in range(1, 7):
            data = f'{n} {k}\n' + ' '.join(map(str, values)) + '\n'
            assert execute(program, data) == oracle(values, k)
            count += 1
rng = random.Random(2025)
for _ in range(100):
    values = [rng.randint(1, 10000) for _ in range(rng.randint(1, 20))]
    k = rng.randint(1, 1000)
    # Vary line breaks independently of list length and rounds.
    data = f'{len(values)} {k}\n' + '\n'.join(' '.join(map(str, values[i:i+3])) for i in range(0, len(values), 3)) + '\n'
    assert execute(program, data) == oracle(values, k)

values = [10000] * 1000
data = '1000 1000\n' + ' '.join(map(str, values)) + '\n'
assert execute(program, data) == oracle(values, 1000)
for sample in next(item for item in payload if item['id'] == 'collatz').get('extraSamples', []):
    assert execute(program, sample['input']) == sample['output']
print(f'All 13 exercises and examples passed; ten misconceptions rejected; {count} exhaustive cases, 100 random cases and the 1000 x 1000 boundary verified.')
