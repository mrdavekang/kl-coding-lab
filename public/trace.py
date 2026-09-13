"""A bounded, real-execution walkthrough for the club's introductory Python subset."""
import ast as _kl_ast
import sys as _kl_sys
import json as _kl_json
import traceback as _kl_tb
import math as _kl_math

class _KLTraceLimit(Exception):
    pass

def __kl_trace(source, emit):
    tree = _kl_ast.parse(source, 'main.py')
    forbidden = (_kl_ast.Import, _kl_ast.ImportFrom, _kl_ast.While, _kl_ast.ClassDef,
                 _kl_ast.Lambda, _kl_ast.ListComp, _kl_ast.SetComp, _kl_ast.DictComp,
                 _kl_ast.GeneratorExp, _kl_ast.Try, _kl_ast.With, _kl_ast.AsyncFunctionDef,
                 _kl_ast.Yield, _kl_ast.YieldFrom, _kl_ast.Global, _kl_ast.Nonlocal,
                 _kl_ast.Delete, _kl_ast.Match, _kl_ast.NamedExpr)
    defined = {n.name for n in _kl_ast.walk(tree) if isinstance(n, _kl_ast.FunctionDef)}
    allowed_calls = defined | {'print', 'input', 'int', 'float', 'str', 'bool', 'range', 'len', 'sum', 'min', 'max', 'abs', 'round'}
    for node in _kl_ast.walk(tree):
        if isinstance(node, forbidden):
            raise ValueError('Walk through does not yet support ' + type(node).__name__ + '. Use Run for this program, or try the lesson example.')
        if isinstance(node, _kl_ast.Call) and (not isinstance(node.func, _kl_ast.Name) or node.func.id not in allowed_calls):
            raise ValueError('Walk through supports the lesson functions and simple Python calls. Use Run for other calls.')
        if isinstance(node, _kl_ast.Name) and node.id.startswith('_kl'):
            raise ValueError('Please choose a variable name that does not start with _kl.')
        if isinstance(node, (_kl_ast.Assign, _kl_ast.AugAssign, _kl_ast.Expr, _kl_ast.Return)) and node.end_lineno != node.lineno:
            raise ValueError('Walk through needs each simple statement on one line. Use Run for this layout.')
    statement_lines = [n.lineno for n in _kl_ast.walk(tree) if isinstance(n, _kl_ast.stmt)]
    if len(statement_lines) != len(set(statement_lines)):
        raise ValueError('Walk through needs one statement per line. Put the loop body on its own indented line, or use Run.')
    nodes = {n.lineno: n for n in _kl_ast.walk(tree) if isinstance(n, _kl_ast.stmt)}
    source_lines = source.splitlines()
    names = sorted({n.id for n in _kl_ast.walk(tree) if isinstance(n, _kl_ast.Name) and isinstance(n.ctx, _kl_ast.Store)})
    pending, loops = {}, {}
    frames = {}
    count = 0

    def clean(value, depth=0):
        if value is None or isinstance(value, (bool, int, float)):
            if isinstance(value, float) and not _kl_math.isfinite(value): return '<float ' + str(value) + '>'
            return value if not isinstance(value, int) or abs(value) < 10**30 else str(value)
        if isinstance(value, str): return value[:250]
        if isinstance(value, (list, tuple)) and depth < 2:
            return [clean(v, depth + 1) for v in value[:40]] + (['... more items'] if len(value) > 40 else [])
        return '<' + type(value).__name__ + '>'

    def values(frame):
        merged = dict(frame.f_globals)
        merged.update(frame.f_locals)
        return {k: clean(v) for k, v in merged.items() if not k.startswith('__') and not k.startswith('_kl') and not callable(v)}

    def operand(node, vals):
        if isinstance(node, _kl_ast.Constant): return node.value
        if isinstance(node, _kl_ast.Name): return vals.get(node.id, 'Not set')
        if isinstance(node, _kl_ast.UnaryOp) and isinstance(node.op, _kl_ast.USub):
            value = operand(node.operand, vals)
            return -value if isinstance(value, (float, int)) else '?'
        return '?'

    def display(v): return _kl_json.dumps(v, ensure_ascii=False)

    def context(frame, line):
        active = []
        for (fid, header), item in loops.items():
            node = nodes.get(header)
            if fid == id(frame) and node and header <= line <= node.end_lineno and item['active']:
                active.append({k: v for k, v in item.items() if k != 'active'})
        return sorted(active, key=lambda x: x['line'])

    def publish(frame, line, next_line, before, event='line', returned=None):
        nonlocal count
        count += 1
        if count > 300: raise _KLTraceLimit('Walkthrough stopped at 300 steps. Try a shorter list or use Run. Your code is kept.')
        after = values(frame)
        node = nodes.get(line)
        explanation = 'This line has executed. Compare the values and output.'
        iteration_changed = False
        loop_finished = False
        if event == 'start': explanation = 'No program line has run yet. Choose Next line to begin.'
        elif event == 'call': explanation = 'Enter ' + frame.f_code.co_name + '. Its parameters hold the supplied argument values.'
        elif isinstance(node, _kl_ast.For):
            key = (id(frame), line)
            item = loops.setdefault(key, {'line': line, 'iteration': 0, 'active': True, 'variable': _kl_ast.unparse(node.target), 'listName': _kl_ast.unparse(node.iter)})
            if next_line and line < next_line <= node.end_lineno:
                item['iteration'] += 1; item['active'] = True
                item['value'] = after.get(item['variable'], 'Not set')
                iteration_changed = True
                explanation = 'Iteration ' + str(item['iteration']) + ': take the next item from ' + item['listName'] + ' and store ' + display(item['value']) + ' in ' + item['variable'] + '. The indented body runs next.'
            else:
                item['active'] = False; loop_finished = True
                explanation = 'The loop has no more items. It has finished ' + str(item['iteration']) + ' iterations. Continue after the indented block.'
        elif isinstance(node, (_kl_ast.Assign, _kl_ast.AugAssign)):
            targets = node.targets if isinstance(node, _kl_ast.Assign) else [node.target]
            target = _kl_ast.unparse(targets[0])
            old = before.get(target, 'Not set'); new = after.get(target, 'Not set')
            explanation = 'Store ' + display(new) + ' in ' + target + '. Previous value: ' + ('Not set' if target not in before else display(old)) + '.'
            expr = node.value
            if isinstance(expr, _kl_ast.BinOp):
                symbols = {_kl_ast.Add: '+', _kl_ast.Sub: '-', _kl_ast.Mult: '*', _kl_ast.Div: '/', _kl_ast.FloorDiv: '//', _kl_ast.Mod: '%', _kl_ast.Pow: '**'}
                left, right = operand(expr.left, before), operand(expr.right, before)
                if left != '?' and right != '?' and type(expr.op) in symbols:
                    explanation = 'Calculate ' + display(left) + ' ' + symbols[type(expr.op)] + ' ' + display(right) + ' = ' + display(new) + '. Store the result back in ' + target + '.'
            if isinstance(expr, _kl_ast.Call) and isinstance(expr.func, _kl_ast.Name) and expr.func.id == 'input':
                explanation = 'input() kept the answer as text. Store ' + display(new) + ' in ' + target + '.'
        elif isinstance(node, _kl_ast.If):
            branch = 'true' if next_line and node.body[0].lineno <= next_line <= node.body[-1].end_lineno else 'false'
            explanation = 'The condition ' + _kl_ast.unparse(node.test) + ' is ' + branch + '. Follow that branch.'
        elif isinstance(node, _kl_ast.FunctionDef): explanation = 'Define ' + node.name + '. Its body runs when the function is called.'
        elif isinstance(node, _kl_ast.Return): explanation = 'Return ' + display(clean(returned)) + ' to the code that called this function.'
        elif isinstance(node, _kl_ast.Expr) and isinstance(node.value, _kl_ast.Call):
            if isinstance(node.value.func, _kl_ast.Name) and node.value.func.id == 'print': explanation = 'print() has added its message to the output. Read the output for this step.'
        emit(_kl_json.dumps({'executedLine': line, 'nextLine': next_line, 'before': before, 'after': after, 'names': names, 'scope': frame.f_code.co_name, 'explanation': explanation, 'loops': context(frame, line or next_line or 0), 'iterationChanged': iteration_changed, 'loopFinished': loop_finished, 'event': event}, ensure_ascii=False))

    def trace(frame, event, arg):
        if frame.f_code.co_filename != 'main.py': return None
        fid = id(frame)
        frames[fid] = frame
        if event == 'line':
            current = frame.f_lineno
            if fid in pending:
                previous, before = pending.pop(fid)
                publish(frame, previous, current, before)
            else:
                publish(frame, None, current, {}, 'start' if frame.f_code.co_name == '<module>' else 'call')
            pending[fid] = (current, values(frame))
        elif event == 'return':
            if fid in pending:
                previous, before = pending.pop(fid)
                parent_line = pending.get(id(frame.f_back), (None,))[0]
                publish(frame, previous, parent_line, before, 'return' if frame.f_code.co_name != '<module>' else 'end', arg)
            for key in list(loops):
                if key[0] == fid: del loops[key]
            frames.pop(fid, None)
        elif event == 'exception':
            # Let Python propagate the real exception; never label a failing line completed.
            pending.pop(fid, None)
        return trace

    namespace = {'__name__': '__main__'}
    old_trace = _kl_sys.gettrace()
    try:
        _kl_sys.settrace(trace)
        exec(compile(source, 'main.py', 'exec'), namespace)
    finally:
        _kl_sys.settrace(old_trace)
        frames.clear(); pending.clear()
