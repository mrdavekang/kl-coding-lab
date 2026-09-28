"""Week 4 classroom feedback for selection, counters and nested loops.

This is a formative teaching checker, not a secure competition judge.
"""
import ast
import contextlib
import io
import json
import sys
import traceback


class _W4Output(io.StringIO):
    def write(self, text):
        if self.tell() + len(text) > 16000:
            raise RuntimeError("Too much output. Check whether print belongs after a loop.")
        return super().write(text)


def _has_nested_loop(tree):
    for loop in (node for node in ast.walk(tree) if isinstance(node, (ast.For, ast.While))):
        for child in loop.body:
            if any(isinstance(node, (ast.For, ast.While)) for node in ast.walk(child)):
                return True
    return False


def __kl_check4(source, spec_json):
    spec = json.loads(spec_json)
    cases = []
    try:
        original = ast.parse(source, filename="main.py")
        nodes = list(ast.walk(original))
        if spec.get("requireLoop") and not any(isinstance(node, (ast.For, ast.While)) for node in nodes):
            return json.dumps({"passed": False, "message": "This task asks you to practise iteration. Add a loop, then check again.", "cases": []})
        if spec.get("requireCondition") and not any(isinstance(node, ast.If) for node in nodes):
            return json.dumps({"passed": False, "message": "This task asks you to practise selection. Add an if statement, then check again.", "cases": []})
        if spec.get("requireNested") and not _has_nested_loop(original):
            return json.dumps({"passed": False, "message": "Use a loop inside another loop: one for groups or columns and one for their items or cells.", "cases": []})
        if spec.get("requireAnd") and not any(isinstance(node, ast.BoolOp) and isinstance(node.op, ast.And) for node in nodes):
            return json.dumps({"passed": False, "message": "Join the two boundary comparisons with and for this practice task.", "cases": []})
        for case in spec.get("tests", []):
            tree = ast.parse(source, filename="main.py")
            replacements = {}
            if spec.get("dataName"):
                replacements[spec["dataName"]] = case["data"]
            for name, value in replacements.items():
                found = False
                for node in tree.body:
                    if isinstance(node, ast.Assign) and len(node.targets) == 1 and isinstance(node.targets[0], ast.Name) and node.targets[0].id == name:
                        node.value = ast.parse(repr(value), mode="eval").body
                        found = True
                        break
                if not found:
                    raise ValueError("Keep the supplied top-level " + name + " assignment so the checker can try fresh data.")
            ast.fix_missing_locations(tree)
            output = _W4Output()
            old_stdin = sys.stdin
            error = ""
            try:
                sys.stdin = io.StringIO(case.get("input", ""))
                with contextlib.redirect_stdout(output), contextlib.redirect_stderr(output):
                    exec(compile(tree, "main.py", "exec"), {"__name__": "__main__"})
            except Exception:
                error = traceback.format_exc(limit=4)
            finally:
                sys.stdin = old_stdin
            actual = output.getvalue()
            expected = str(case["expected"])
            passed = not error and actual.strip() == expected.strip()
            data_label = case.get("input", "")
            if replacements:
                data_label = "\n".join(name + " = " + repr(value) for name, value in replacements.items())
            cases.append({"input": data_label, "expected": expected, "actual": actual, "passed": passed, "error": error})
        passed = bool(cases) and all(case["passed"] for case in cases)
        message = "Your current code passed these practice cases. Explain one iteration." if passed else "A test needs another look. Compare the fresh data, expected output and your output."
        return json.dumps({"passed": passed, "message": message, "cases": cases})
    except Exception:
        return json.dumps({"passed": False, "message": "The checks could not run. Read the error and make one small change.", "error": traceback.format_exc(limit=4), "cases": cases})
