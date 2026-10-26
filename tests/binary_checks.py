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
print(f'All 20 exercises passed; {total} shortest paths and 200000-character boundaries verified.')
