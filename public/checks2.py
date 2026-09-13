import ast as _w2_ast
import io as _w2_io
import contextlib as _w2_context
import json as _w2_json
import traceback as _w2_traceback
import sys as _w2_sys
import copy as _w2_copy

def __kl_check2(source, task):
    def result(message, cases=None, error=None):
        return _w2_json.dumps({'passed': bool(cases) and all(c['passed'] for c in cases), 'message': message, 'cases': cases or [], 'error': error})
    try:
        tree = _w2_ast.parse(source, 'main.py')
    except Exception:
        return result('Fix the Python error, then check again.', error=_w2_traceback.format_exc())
    assignments = [n for n in tree.body if isinstance(n, _w2_ast.Assign) and any(isinstance(t, _w2_ast.Name) and t.id == 'scores' for t in n.targets)]
    if not assignments:
        return result('Keep a scores list near the start. The checks replace that list with fresh test scores.')
    if task != 'w2-list' and not any(isinstance(n, _w2_ast.For) for n in _w2_ast.walk(tree)):
        return result('This practice asks you to use an explicit for loop. Add a loop, then check again.')
    if task != 'w2-list' and any(isinstance(n, _w2_ast.Call) and isinstance(n.func, _w2_ast.Name) and n.func.id in ('sum', 'len', 'max') for n in _w2_ast.walk(tree)):
        return result('For this loop practice, build the result with updates inside your loop instead of sum(), len() or max().')
    if task == 'w2-maximum' and sum(isinstance(n, _w2_ast.For) for n in _w2_ast.walk(tree)) != 1:
        return result('This extension asks for one for loop that builds all three results.')
    if task == 'w2-positive' and not any(isinstance(n, _w2_ast.FunctionDef) and n.name == 'positiveScores' for n in tree.body):
        return result('Define positiveScores(scoreList), then call it with your scores list.')
    cases = [None] if task == 'w2-list' else [[5, 0, 2, 7], [-3, 0, 8], [], [2, 2, -1]]
    if task == 'w2-maximum': cases = [[-5, -2, -9], [4], [0, 0], [6, -3, 8, 1]]
    results = []
    for scores in cases:
        test_tree = _w2_copy.deepcopy(tree)
        if scores is not None:
            index = tree.body.index(assignments[0])
            test_tree.body[index].value = _w2_ast.parse(repr(scores), mode='eval').body
        namespace = {'__name__': '__main__'}
        class LimitedOutput(_w2_io.StringIO):
            def write(self, value):
                if self.tell() + len(value) > 8000: raise RuntimeError('Too much output. Check which lines repeat.')
                return super().write(value)
        stream = LimitedOutput()
        steps = 0
        def limit(frame, event, arg):
            nonlocal steps
            if frame.f_code.co_filename == 'main.py':
                steps += 1
                if steps > 10000: raise RuntimeError('The check stopped after 10,000 Python events. Look for a loop or call that does not finish.')
            return limit
        expected = ''
        if scores is not None:
            total = sum(scores); count = len(scores)
            if task == 'w2-announcer': expected = '\n'.join(str(v) for v in scores)
            elif task == 'w2-count-total': expected = str(count) + '\n' + str(total)
            elif task == 'w2-positive': expected = str(sum(v > 0 for v in scores)) + '\n' + str(sum(v for v in scores if v > 0))
            elif task == 'w2-maximum': expected = str(count) + '\n' + str(total) + '\n' + str(max(scores))
            else: expected = str(total)
        old_trace = _w2_sys.gettrace()
        try:
            _w2_sys.settrace(limit)
            with _w2_context.redirect_stdout(stream), _w2_context.redirect_stderr(stream):
                exec(compile(_w2_ast.fix_missing_locations(test_tree), 'main.py', 'exec'), namespace)
            actual = stream.getvalue().strip()
            if task == 'w2-list':
                data = namespace.get('scores')
                expected = 'A list of at least four whole numbers, displayed once.'
                passed = isinstance(data, list) and len(data) >= 4 and all(type(v) is int for v in data) and actual == str(data)
            elif task == 'w2-total':
                passed = actual in (expected, str(count) + '\n' + expected)
                expected += '\n(or count ' + str(count) + ' first, then the total)'
            else: passed = actual == expected
            results.append({'input': 'Your scores list' if scores is None else 'scores = ' + str(scores), 'expected': expected, 'actual': actual, 'passed': passed})
        except Exception:
            results.append({'input': str(scores), 'expected': expected, 'actual': stream.getvalue()[:8000], 'passed': False, 'error': _w2_traceback.format_exc()})
        finally:
            _w2_sys.settrace(old_trace)
    passed = all(c['passed'] for c in results)
    return result('Your code passed these practice checks. Explain one test to show your understanding.' if passed else 'Compare a test with your output. Make one change and try again.', results)
