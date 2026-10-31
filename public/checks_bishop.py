"""Formative checks for Block Bishop. Integer calculations use Python's exact int."""
import ast
import contextlib
import io
import json
import sys
import traceback


class _BishopOutput(io.StringIO):
    def write(self, value):
        if self.tell() + len(value) > 50000:
            raise RuntimeError('Too much output. Check the number of loop turns.')
        return super().write(value)


def __kl_check_bishop(source, spec_json):
    spec = json.loads(spec_json)
    cases = []
    try:
        compiled = compile(source, 'main.py', 'exec')
        nodes = list(ast.walk(ast.parse(source)))
        if spec.get('requireLoop') and not any(isinstance(node, (ast.For, ast.While)) for node in nodes):
            return json.dumps({'passed': False, 'message': 'Practise a loop for this exercise. Keep its repeated instructions indented.', 'cases': []})
        if spec.get('requireCondition') and not any(isinstance(node, ast.If) for node in nodes):
            return json.dumps({'passed': False, 'message': 'Practise the if condition for this exercise.', 'cases': []})
        for test in spec.get('tests', []):
            previous = sys.stdin
            stream = _BishopOutput()
            error = ''
            try:
                sys.stdin = io.StringIO(test.get('input', ''))
                with contextlib.redirect_stdout(stream), contextlib.redirect_stderr(stream):
                    exec(compiled, {'__name__': '__main__'})
            except Exception:
                error = traceback.format_exc(limit=4)
            finally:
                sys.stdin = previous
            actual = stream.getvalue()
            passed = not error and actual.strip() == str(test['expected']).strip()
            cases.append({'input': test.get('input', '')[:6000], 'expected': str(test['expected'])[:6000], 'actual': actual[:6000], 'passed': passed, 'error': error})
        passed = bool(cases) and all(test['passed'] for test in cases)
        return json.dumps({'passed': passed, 'message': 'Your current program passed these practice cases. Continue when you are ready.' if passed else 'Compare the input and output. Check the coordinates, the starting square and the number of cases.', 'cases': cases})
    except Exception:
        return json.dumps({'passed': False, 'message': 'Read the Python error and make one small change.', 'error': traceback.format_exc(limit=4), 'cases': cases})
