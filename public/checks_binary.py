"""Formative Binary Sorting checks, including constructive-answer validation."""
import ast
import contextlib
import io
import json
import re
import sys
import traceback


def _binary_moves(data, output, include_count=True):
    parts = data.split()
    if len(parts) != 2 or int(parts[0]) != len(parts[1]):
        raise ValueError("Invalid practice test input.")
    bits = parts[1]
    zero_count = bits.count("0")
    minimum = bits[:zero_count].count("1")
    lines = [line.split() for line in output.splitlines() if line.strip()]
    if include_count:
        if not lines or len(lines[0]) != 1:
            return False, "Print the swap count alone on the first line."
        if not re.fullmatch(r"[+-]?\d+", lines[0][0]):
            return False, "The first line must be an integer, with no labels or prompts."
        count = int(lines.pop(0)[0])
        if count != minimum:
            return False, f"The minimum is {minimum} swaps. Count wrong ones in the zero section."
    else:
        count = minimum
    if len(lines) != count:
        return False, f"Print exactly {count} pair lines" + (" after the count." if include_count else ", without a count line.")
    current = list(bits)
    for turn, values in enumerate(lines, 1):
        if len(values) != 2 or any(not re.fullmatch(r"[+-]?\d+", value) for value in values):
            return False, f"Pair {turn} must contain two integer positions."
        first, second = map(int, values)
        if not (1 <= first <= len(bits) and 1 <= second <= len(bits)):
            return False, f"Pair {turn}: question positions run from 1 to {len(bits)}."
        if first == second:
            return False, f"Pair {turn} must use two different positions."
        current[first - 1], current[second - 1] = current[second - 1], current[first - 1]
    if "".join(current) != "0" * zero_count + "1" * (len(bits) - zero_count):
        return False, "Applying these swaps does not sort the string. Match a wrong one with a wrong zero."
    return True, ""


class _BinaryOutput(io.StringIO):
    def write(self, text):
        if self.tell() + len(text) > 2_000_000:
            raise RuntimeError("Too much output. Check the number of loop turns.")
        return super().write(text)


def _binary_excerpt(text, limit=5000):
    return text if len(text) <= limit else text[:limit] + "\n[Display shortened; the complete output was checked.]"


def __kl_check_binary(source, spec_json):
    spec = json.loads(spec_json)
    cases = []
    try:
        tree = ast.parse(source, filename="main.py")
        nodes = list(ast.walk(tree))
        if spec.get("requireLoop") and not any(isinstance(node, (ast.For, ast.While)) for node in nodes):
            return json.dumps({"passed": False, "message": "Use a loop for this exercise.", "cases": []})
        if spec.get("requireCondition") and not any(isinstance(node, ast.If) for node in nodes):
            return json.dumps({"passed": False, "message": "Use an if condition for this exercise.", "cases": []})
        for case in spec.get("tests", []):
            output = _BinaryOutput()
            old_stdin = sys.stdin
            error = ""
            try:
                sys.stdin = io.StringIO(case.get("input", ""))
                with contextlib.redirect_stdout(output), contextlib.redirect_stderr(output):
                    exec(compile(source, "main.py", "exec"), {"__name__": "__main__"})
            except Exception:
                error = traceback.format_exc(limit=3)
            finally:
                sys.stdin = old_stdin
            actual = output.getvalue()
            if not error and spec.get("validator") in ("pairs", "swaps"):
                passed, reason = _binary_moves(case["input"], actual, spec["validator"] == "swaps")
                error = reason
            else:
                passed = not error and actual.strip() == str(case["expected"]).strip()
            cases.append({"input": _binary_excerpt(case.get("input", "")), "expected": _binary_excerpt(str(case["expected"])), "actual": _binary_excerpt(actual), "passed": passed, "error": error})
        passed = bool(cases) and all(case["passed"] for case in cases)
        success = "Exercise passed. Continue when you are ready."
        if spec.get("validator"):
            success = "Checks passed. Different valid minimum swap sequences are accepted."
        return json.dumps({"passed": passed, "message": success if passed else "Compare the test and your output, then change your code and check again.", "cases": cases})
    except Exception:
        return json.dumps({"passed": False, "message": "Read the error and make a small change.", "error": traceback.format_exc(limit=3), "cases": cases})
