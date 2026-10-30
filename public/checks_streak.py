"""Formative Winning Streak coding checks. No competition submissions."""
import ast
import contextlib
import io
import json
import sys
import traceback


class _StreakOutput(io.StringIO):
    def write(self, text):
        if self.tell() + len(text) > 2_000_000:
            raise RuntimeError("Too much output. Check the number of loop turns.")
        return super().write(text)


def __kl_check_streak(source, spec_json):
    spec = json.loads(spec_json)
    cases = []
    try:
        tree = ast.parse(source, filename="main.py")
        nodes = list(ast.walk(tree))
        if spec.get("requireLoop") and not any(isinstance(node, (ast.For, ast.While)) for node in nodes):
            return json.dumps({"passed": False, "message": "Use a loop for this exercise.", "cases": []})
        if spec.get("requireCondition") and not any(isinstance(node, ast.If) for node in nodes):
            return json.dumps({"passed": False, "message": "Use an if condition for this exercise.", "cases": []})
        tests = list(spec.get("tests", []))
        if spec.get("generatedTests") == "streak-full":
            n = 500000
            tests += [{"input": str(n) + "\n" + "1 " * (n-1) + "1\n", "expected": "1 " + str(n), "label": "500,000 rounds: all wins"},
                      {"input": str(n) + "\n" + "1 0 " * (n//2-1) + "0 1\n", "expected": str(n) + " " + str(n), "label": "500,000 rounds: later ties and final single win"}]
        for case in tests:
            output = _StreakOutput()
            before = sys.stdin
            error = ""
            try:
                sys.stdin = io.StringIO(case.get("input", ""))
                with contextlib.redirect_stdout(output), contextlib.redirect_stderr(output):
                    exec(compile(source, "main.py", "exec"), {"__name__": "__main__"})
            except Exception:
                error = traceback.format_exc(limit=3)
            finally:
                sys.stdin = before
            actual = output.getvalue()
            passed = not error and actual.strip() == str(case["expected"]).strip()
            shown = case.get("label", case.get("input", ""))
            cases.append({"input": shown[:1500], "expected": str(case["expected"])[:5000], "actual": actual[:5000], "passed": passed, "error": error})
        passed = bool(cases) and all(case["passed"] for case in cases)
        return json.dumps({"passed": passed, "message": "Exercise passed. Continue when you are ready." if passed else "Compare the input and your output. Check resets, round numbers and the later-tie rule.", "cases": cases})
    except Exception:
        return json.dumps({"passed": False, "message": "Read the error and make a small change.", "error": traceback.format_exc(limit=3), "cases": cases})
