"""Check all exercise answers, constructive validation and independent optimality."""
from collections import deque
import contextlib
import io
import json
from pathlib import Path
import sys

ROOT=Path(__file__).resolve().parents[1]
namespace={}
exec((ROOT/'public/checks_binary.py').read_text(),namespace)
check=namespace['__kl_check_binary']
validate=namespace['_binary_moves']
references=json.loads((ROOT/'tests/binary-reference.json').read_text())
payload=json.load(sys.stdin)

def execute(code,data):
    before=sys.stdin
    output=io.StringIO()
    try:
        sys.stdin=io.StringIO(data)
        with contextlib.redirect_stdout(output):
            exec(code,{'__name__':'__main__'})
        return output.getvalue()
    finally:
        sys.stdin=before

for item in payload:
    result=json.loads(check(references[item['id']],json.dumps(item['spec'])))
    assert result['passed'],(item['id'],result)
    sample=execute(references[item['id']],item['sampleInput'])
    if item.get('validator'):
        assert validate(item['sampleInput'],sample,item['validator']=='swaps')[0],item['id']
    else:
        assert sample.strip()==item['sampleOutput'].strip(),item['id']
    if item['number']>2:
        constant='print('+repr(item['sampleOutput'])+')'
        assert not json.loads(check(constant,json.dumps(item['spec'])))['passed'],item['id']

# Index practice must distinguish a label from its selected character, including
# the first and last valid indices. The combined task must not shift its lookup.
by_id={item['id']:item for item in payload}
mistakes={
    'bs-index-variable': ['bits = input()\nindex = 2\nprint(index)', 'bits = input()\nindex = 2\nprint(bits[index + 1])'],
    'bs-index-choice': ['bits = input()\nindex = int(input())\nprint(index)', 'bits = input()\nindex = int(input())\nprint(bits[0])', 'bits = input()\nindex = int(input())\nprint(bits[index + 1])'],
    'bs-index-loop': ['n = int(input())\nbits = input()\nfor index in range(n):\n    print(index)', 'n = int(input())\nbits = input()\nfor index in range(n):\n    print(bits[index + 1])'],
    'bs-labels': ['n = int(input())\nbits = input()\nfor index in range(n):\n    print(index + 1, bits[index + 1])'],
}
for task_id, programs in mistakes.items():
    for code in programs:
        assert not json.loads(check(code,json.dumps(by_id[task_id]['spec'])))['passed'],(task_id,code)

# Check why the zero count is needed: preserve input zeros, retain the running
# count, wait for the full count, then inspect that many places (not half of n).
read='n = int(input())\nbits = input()\n'
count='zeroCount = 0\nfor bit in bits:\n    if bit == "0":\n        zeroCount = zeroCount + 1\n'
zero_mistakes={
    'bs-zero-input': ['n = int(input())\nbits = int(input())\nprint(n)\nprint(bits)'],
    'bs-zero-start': [read+'for bit in bits:\n    zeroCount = 0\n    print(zeroCount)\n    print(bit)'],
    'bs-zero-update': [read+'for bit in bits:\n    zeroCount = 0\n    if bit == "0":\n        zeroCount = zeroCount + 1\n    print(zeroCount)'],
    'bs-zero-total': [read+count.replace('zeroCount = zeroCount + 1','zeroCount = zeroCount + 1\n    print(zeroCount)'),read+'zeroCount = 0\nfor bit in bits:\n    if bit == "1":\n        zeroCount = zeroCount + 1\nprint(zeroCount)'],
    'bs-zero-section': [read+count+'for index in range(n // 2):\n    print(index + 1, bits[index])',read+count+'for index in range(n):\n    print(index + 1, bits[index])'],
    'bs-zero-select': [read+count+'for index in range(n):\n    if bits[index] == "1":\n        print(index + 1)'],
    'bs-left': [read+count+'for index in range(n // 2):\n    if bits[index] == "1":\n        print(index + 1)',read+count+'for index in range(zeroCount):\n    if bits[index] == "1":\n        print(zeroCount)'],
}
for task_id,programs in zero_mistakes.items():
    for code in programs:
        assert not json.loads(check(code,json.dumps(by_id[task_id]['spec'])))['passed'],(task_id,code)

# Different optimal pairings and reversed pair direction are all legal.
data='6\n010100\n'
for output in ['2\n2 6\n4 5\n','2\n2 5\n4 6\n','2\n5 4\n6 2\n']:
    assert validate(data,output)[0],output
assert validate(data,'2 5\n4 6\n',False)[0]
for output in ['0\n','2\n1 2\n3 4\n','2\n0 5\n4 6\n','2\n2 2\n4 6\n','2\n2 6\n','2\n2 6\n4 5\n1 2\n','2 swaps\n2 6\n4 5\n','2\n2.0 6\n4 5\n']:
    assert not validate(data,output)[0],output
assert validate('5\n00111\n','0\n')[0]
assert validate('1\n1\n','',False)[0]
assert not validate('1\n1\n','0\n',False)[0]

# Breadth-first search gives the actual shortest path, independently of the formula.
solver=compile(references['bs-challenge'],'main.py','exec')
total=0
for n in range(1,10):
    for zeros in range(n+1):
        target='0'*zeros+'1'*(n-zeros)
        distance={target:0};queue=deque([target])
        while queue:
            bits=queue.popleft()
            for first in range(n):
                for second in range(first+1,n):
                    if bits[first]==bits[second]:continue
                    moved=list(bits);moved[first],moved[second]=moved[second],moved[first]
                    new=''.join(moved)
                    if new not in distance:
                        distance[new]=distance[bits]+1;queue.append(new)
        for bits,minimum in distance.items():
            input_data=f'{n}\n{bits}\n'
            output=execute(solver,input_data)
            assert int(output.split()[0])==minimum,(bits,output,minimum)
            assert validate(input_data,output)[0],(bits,output)
            total+=1
for bits in ['1'*100000+'0'*100000,'0'*200000,'1'*200000,'01'*100000]:
    input_data=f'{len(bits)}\n{bits}\n'
    assert validate(input_data,execute(solver,input_data))[0]
print(f'All {len(payload)} exercises passed; {total} shortest paths and 200000-character boundaries verified.')
