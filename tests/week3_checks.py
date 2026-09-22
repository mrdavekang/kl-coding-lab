import contextlib, io, json, runpy, sys
from pathlib import Path
root = Path(__file__).resolve().parents[1]
check = runpy.run_path(str(root/'public/checks3.py'))['__kl_check3']
trace = runpy.run_path(str(root/'public/trace.py'))['__kl_trace']
refs=json.loads((root/'tests/week3-reference.json').read_text())
tasks=json.load(sys.stdin)
for t in tasks:
 result=json.loads(check(refs[t['id']],json.dumps(t['spec'])))
 assert result['passed'],(t['id'],result)
 assert result['cases'][0]['actual'].strip()==t['sampleOutput'].strip(),t['id']
 assert not json.loads(check(t['starter'],json.dumps(t['spec'])))['passed'],t['id']
 if t.get('level') or t['id']=='rev-exit':
  fixed='print('+repr(t['sampleOutput'])+')'
  assert not json.loads(check(fixed,json.dumps(t['spec'])))['passed'],t['id']
 # Reference uses only taught core syntax: no conditions, indexing, functions, nested loops or imports.
 import ast
 tree=ast.parse(refs[t['id']])
 assert not any(isinstance(n,(ast.If,ast.FunctionDef,ast.Import,ast.ImportFrom,ast.Subscript,ast.While,ast.ListComp)) for n in ast.walk(tree)),t['id']
 assert sum(isinstance(n,ast.For) for n in ast.walk(tree))<=1,t['id']
 if t.get('requireLoop'):
  old=sys.stdin;events=[]
  try:
   sys.stdin=io.StringIO(t['sampleInput'])
   with contextlib.redirect_stdout(io.StringIO()):trace(refs[t['id']],lambda v:events.append(json.loads(v)))
  finally:sys.stdin=old
  assert events,t['id']
# Useful misconceptions must fail: reset inside loop; count rather than total; repeat delivery fee.
mutants={
 'rev-w2-3':'returnedBooks = [4,0,5,2]\nfor n in returnedBooks:\n    total=0\n    total=total+n\nprint(total)',
 'rev-w2-4':'canCounts = [3,0,5,2]\nn=0\nfor v in canCounts:\n    n=n+1\nprint(n)\nprint(n)',
 'rev-w2-5':'orderQuantities = [2,0,3,1]\nprice=int(input())\nfee=int(input())\npacks=0\nbill=0\nfor n in orderQuantities:\n    packs=packs+n\n    bill=bill+n*price+fee\nprint(packs)\nprint(bill)'
}
for id,source in mutants.items():
 t=next(t for t in tasks if t['id']==id)
 assert not json.loads(check(source,json.dumps(t['spec'])))['passed'],id
print(f'{len(tasks)} reference solutions passed; samples, starters, fresh data, misconceptions and trace verified.')
