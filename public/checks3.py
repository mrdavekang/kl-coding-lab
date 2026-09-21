"""Week 3 classroom feedback. Fresh stdin; declared fixed-list exercises use AST data replacement.

This is a teaching checker, not a secure competition judge.
"""
import ast
import contextlib
import io
import json
import sys
import traceback


class _W3Output(io.StringIO):
    def write(self, text):
        if self.tell() + len(text) > 16000:
            raise RuntimeError("Too much output. Check whether print belongs after your loop.")
        return super().write(text)


def __kl_check3(source, spec_json):
    spec = json.loads(spec_json)
    cases = []
    try:
        original = ast.parse(source, filename="main.py")
        if spec.get("requireLoop") and not any(isinstance(node, (ast.For, ast.While)) for node in ast.walk(original)):
            return json.dumps({"passed": False, "message": "This exercise asks you to practise a loop. Add one, then check again.", "cases": []})
        for case in spec.get("tests", []):
            tree = ast.parse(source, filename="main.py")
            replacements = {}
            if spec.get("dataName"):
                replacements[spec["dataName"]] = case["data"]
            for name in spec.get("variables") or []:
                replacements[name] = case["data"][name]
            # Replace only the declared top-level data assignment, never the algorithm.
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
            output = _W3Output()
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
        return json.dumps({"passed": passed, "message": "Your current code passed these practice cases. Explain one test." if passed else "A test needs another look. Open its input and compare the outputs.", "cases": cases})
    except Exception:
        return json.dumps({"passed": False, "message": "The checks could not run. Read the error and make one small change.", "error": traceback.format_exc(limit=4), "cases": cases})
