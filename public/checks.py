import ast as __kl_ast
import builtins as __kl_builtins
import contextlib as __kl_context
import io as __kl_io
import json as __kl_json
import traceback as __kl_traceback


def __kl_check(source, task):
    def rectangles(grid, target):
        total = 0
        for top in range(len(grid)):
            for bottom in range(top, len(grid)):
                for left in range(len(grid[0])):
                    for right in range(left, len(grid[0])):
                        if sum(grid[r][c] for r in range(top, bottom + 1)
                               for c in range(left, right + 1)) == target:
                            total += 1
        return total

    simple = {
        'hello': [([], None)],
        'variable': [([], None)],
        'debug': [([], 'Ready to code!')],
        'input': [(['Nova'], ['Nova']), (['River 7'], ['River 7'])],
        'welcome': [(['Nova', 'chess'], ['Nova', 'chess']),
                    (['River 7', 'making games'], ['River 7', 'making games'])],
        'total': [(['4', '7'], '11'), (['0', '9'], '9'), (['12', '18'], '30'), (['-3', '8'], '5')],
        'duplicates': [(['3 5 3 2 5 8'], '4'), (['4 4 4 1'], '3'),
                       (['1 2 3'], '0'), ([''], '0'), (['0 -1 0 -1 -1'], '5')],
    }
    if task == 'rectangles':
        cases = []
        for grid, target in [([[1, 1], [1, 1]], 2), ([[1, 2], [3, 4]], 3),
                             ([[0, 0], [0, 0]], 0), ([[1, -1], [-1, 1]], 0),
                             ([[2]], 2), ([[1, 2, 0], [0, -1, 3], [2, 1, 1]], 3)]:
            inputs = [f'{len(grid)} {len(grid[0])}'] + [' '.join(map(str, row)) for row in grid] + [str(target)]
            cases.append((inputs, str(rectangles(grid, target))))
    else:
        cases = simple.get(task)
    if cases is None:
        return __kl_json.dumps({'passed': False, 'cases': [], 'message': 'This task uses a teacher or self-check.'})
    results = []
    try:
        compiled = compile(source, 'main.py', 'exec')
    except Exception:
        return __kl_json.dumps({'passed': False, 'cases': [], 'message': 'Fix the Python error, then check again.', 'error': __kl_traceback.format_exc()})
    for inputs, expected in cases:
        position = 0
        def test_input(prompt=''):
            nonlocal position
            if position >= len(inputs):
                raise EOFError('Your program asked for more answers than this task supplies.')
            answer = inputs[position]
            position += 1
            return answer
        custom_builtins = dict(vars(__kl_builtins))
        custom_builtins['input'] = test_input
        namespace = {'__name__': '__main__', '__builtins__': custom_builtins}
        class LimitedOutput(__kl_io.StringIO):
            def write(self, value):
                if self.tell() + len(value) > 24000:
                    raise RuntimeError('Too much output during a check. Look for a print() inside a repeating loop.')
                return super().write(value)
        stream = LimitedOutput()
        try:
            with __kl_context.redirect_stdout(stream), __kl_context.redirect_stderr(stream):
                exec(compiled, namespace)
            actual = stream.getvalue().strip()
            reason = 'Matches this test.'
            if task == 'hello':
                lines = [line for line in actual.splitlines() if line.strip()]
                passed = len(lines) >= 2 and any(line.strip() != 'Hello, coding club!' for line in lines)
                expectation = 'At least two non-empty lines, with your own message.'
            elif task == 'variable':
                tree = __kl_ast.parse(source)
                stores = {node.id for node in __kl_ast.walk(tree) if isinstance(node, __kl_ast.Name) and isinstance(node.ctx, __kl_ast.Store)}
                used = {node.id for node in __kl_ast.walk(tree) if isinstance(node, __kl_ast.Name) and isinstance(node.ctx, __kl_ast.Load)}
                lines = actual.splitlines()
                passed = any(isinstance(namespace.get(name), str) and namespace[name].strip() and
                             sum(namespace[name] in line for line in lines) >= 2 for name in stores & used)
                expectation = 'Use a variable holding text and display its value on two lines.'
            elif isinstance(expected, list):
                passed = all(value in actual for value in expected) and position == len(inputs)
                expectation = 'Output including: ' + ' and '.join(expected)
            else:
                passed = actual == expected and position == len(inputs)
                expectation = expected
            if not passed:
                reason = 'Compare your output with the task requirement. Try these inputs using Run.'
            results.append({'passed': bool(passed), 'input': '\n'.join(inputs), 'expected': expectation, 'actual': actual[:1500], 'message': reason})
        except Exception:
            results.append({'passed': False, 'input': '\n'.join(inputs), 'expected': str(expected), 'actual': stream.getvalue()[:1500], 'message': 'The program raised an error on this test.', 'error': __kl_traceback.format_exc()})
    passed = all(result['passed'] for result in results)
    return __kl_json.dumps({'passed': passed, 'cases': results,
                            'message': 'All checks passed. Can you explain why your program works?' if passed else 'Keep going. Use the test details to choose your next change.'})
