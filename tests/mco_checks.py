"""Check scaffolded exercises and use independent shortest walks for the final task."""
import contextlib
import heapq
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
refs = json.loads((ROOT / 'tests/mco-reference.json').read_text())
payload = json.load(sys.stdin)

def execute(code, data):
    old = sys.stdin
    output = io.StringIO()
    try:
        sys.stdin = io.StringIO(data)
        with contextlib.redirect_stdout(output):
            exec(code, {'__name__': '__main__'})
        return output.getvalue().strip()
    finally:
        sys.stdin = old

for item in payload:
    code = refs[item['id']]
    result = json.loads(check(code, json.dumps(item['spec'])))
    assert result['passed'], (item['id'], result)
    assert execute(code, item['sampleInput']) == item['sampleOutput'].strip(), item['id']
    assert not json.loads(check('print('+repr(item['sampleOutput'])+')', json.dumps(item['spec'])))['passed'], item['id']
    if item.get('example'):
        assert execute(item['example'], '') == item['exampleOutput'].strip(), item['id']

final = refs['two-pointers']
spec = next(item['spec'] for item in payload if item['id'] == 'two-pointers')
wrong = [
    final.replace('range(n + 1)', 'range(n)'),
    final.replace('range(n + 1)', 'range(1, n + 1)').replace('if cut == 0:', 'if cut == 1:'),
    final.replace('        A = B\n        B = temporary', '        A = A\n        B = B'),
    final.replace('min(goLeftFirst, goRightFirst)', 'goLeftFirst'),
    final.replace('min(goLeftFirst, goRightFirst)', 'goRightFirst'),
    final.replace('minimumDistance = totalDistance\n        elif', 'minimumDistance = 0\n        elif'),
    final.replace('totalDistance = aliceDistance + bobDistance', 'totalDistance = max(aliceDistance, bobDistance)'),
]
for code in wrong:
    assert not json.loads(check(code, json.dumps(spec)))['passed'], code
buggy = next(item['starter'] for item in payload if item['id'] == 'tp-try-16')
assert not json.loads(check(buggy, json.dumps(next(item['spec'] for item in payload if item['id'] == 'tp-try-16'))))['passed']

# Dijkstra uses actual traveller positions and visited cities. It never uses cuts
# or the endpoint formula, so it can independently check the proposed solution.
def oracle(cities, A, B):
    all_seen = (1 << len(cities)) - 1
    def passed(first, second):
        low, high = sorted([first, second])
        return sum(1 << index for index, city in enumerate(cities) if low <= city <= high)
    seen = passed(A, A) | passed(B, B)
    start = (seen, A, B)
    best = {start: 0}
    queue = [(0, start)]
    while queue:
        distance, state = heapq.heappop(queue)
        if distance != best[state]:
            continue
        mask, alice, bob = state
        if mask == all_seen:
            return distance
        for index, city in enumerate(cities):
            if mask & (1 << index):
                continue
            for next_state, added in [((mask | passed(alice, city), city, bob), abs(alice-city)), ((mask | passed(bob, city), alice, city), abs(bob-city))]:
                candidate = distance + added
                if candidate < best.get(next_state, float('inf')):
                    best[next_state] = candidate
                    heapq.heappush(queue, (candidate, next_state))

cases = []
for n in range(1, 4):
    for cities in itertools.product([-2, 0, 2], repeat=n):
        for A, B in itertools.product([-3, -1, 0, 1, 3], repeat=2):
            cases.append((cities, A, B))
rng = random.Random(2023)
for _ in range(100):
    cases.append(([rng.randint(-8, 8) for _ in range(rng.randint(1, 5))], rng.randint(-10, 10), rng.randint(-10, 10)))
compiled = compile(final, 'main.py', 'exec')
for offset in range(0, len(cases), 100):
    batch = cases[offset:offset+100]
    data = str(len(batch))+'\n'+''.join(f'{len(cities)} {A} {B}\n'+ ' '.join(map(str, cities))+'\n' for cities, A, B in batch)
    expected = '\n'.join(str(oracle(cities, A, B)) for cities, A, B in batch)
    assert execute(compiled, data) == expected, offset

# Largest total city count, with reversed starts, shuffled order and duplicates.
values = list(range(-100000, 100000))
rng.shuffle(values)
data = '1\n200000 99999 -100000\n'+' '.join(map(str, values))+'\n'
# Two starters at opposite ends split a contiguous run: one unit gap can be left
# between the travellers, so the combined minimum is width minus one.
assert execute(compiled, data) == '199998'
data = '100\n' + ''.join('2000 7 7\n' + ' '.join(['7'] * 2000) + '\n' for _ in range(100))
assert execute(compiled, data) == '\n'.join(['0'] * 100)
print(f'11 Python exercises, all examples and samples passed; 7 misconceptions and the supplied bug rejected; {len(cases)} independent shortest-walk cases and both 200000-city boundaries verified.')
