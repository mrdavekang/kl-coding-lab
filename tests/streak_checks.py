import json
from pathlib import Path
import sys
ROOT=Path(__file__).resolve().parents[1]
namespace={}
exec((ROOT/'public/checks_streak.py').read_text(),namespace)
check=namespace['__kl_check_streak']
items=json.load(sys.stdin)
refs=json.loads((ROOT/'tests/streak-reference.json').read_text())
for item in items:
    result=json.loads(check(refs[item['id']],json.dumps(item['spec'])))
    assert result['passed'],(item['id'],result)
    wrong=json.loads(check('print(0)',json.dumps(item['spec'])))
    assert not wrong['passed'],item['id']
print('30 code references and 500000-round boundaries verified')
