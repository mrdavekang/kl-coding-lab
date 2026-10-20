import contextlib
import io
import json
import pathlib
import runpy
import unittest
from unittest.mock import patch

idle = runpy.run_path(str(pathlib.Path(__file__).parents[1] / "public" / "idle.py"))
run_module = idle["__kl_idle_run"]
push = idle["__kl_idle_push"]


class IdleShellTests(unittest.TestCase):
    def setUp(self):
        idle["__kl_idle_reset"]()

    def test_shell_inspects_run_variables_and_next_run_starts_fresh(self):
        output = io.StringIO()
        with contextlib.redirect_stdout(output):
            run_module("number = 6\nprint(number * 2)")
            self.assertFalse(push("number + 1"))
        self.assertEqual(output.getvalue(), "12\n7\n")
        run_module("other = 2")
        error = io.StringIO()
        with contextlib.redirect_stderr(error):
            self.assertFalse(push("number"))
        self.assertIn("NameError", error.getvalue())

    def test_block_needs_empty_line_and_shell_survives_errors(self):
        output, error = io.StringIO(), io.StringIO()
        with contextlib.redirect_stdout(output), contextlib.redirect_stderr(error):
            self.assertTrue(push("for i in range(3):"))
            self.assertTrue(push("    print(i)"))
            self.assertFalse(push("    "))
            self.assertFalse(push("1 / 0"))
            self.assertFalse(push("2 + 3"))
        self.assertEqual(output.getvalue(), "0\n1\n2\n5\n")
        self.assertIn("ZeroDivisionError", error.getvalue())

    def test_interactive_input_is_not_part_of_program_output(self):
        output = io.StringIO()
        with patch("builtins.input", side_effect=["", "  雪 café  "]), contextlib.redirect_stdout(output):
            run_module("first = input()\nsecond = input()\nprint(repr(first))\nprint(repr(second))")
        self.assertEqual(output.getvalue(), "''\n'  雪 café  '\n")

    def test_variables_before_run_error_remain_available_for_debugging(self):
        with self.assertRaises(ZeroDivisionError):
            run_module("first = 8\nsecond = 1 / 0")
        output = io.StringIO()
        with contextlib.redirect_stdout(output):
            push("first")
        self.assertEqual(output.getvalue(), "8\n")

    def test_pupil_errors_show_their_source_and_line_without_runner_internals(self):
        execute = idle["__kl_idle_execute"]
        result = json.loads(execute("number = 4\nprint(number / 0)"))
        self.assertIn('File "main.py", line 2', result["error"])
        self.assertIn("print(number / 0)", result["error"])
        self.assertNotIn("__kl_idle_run", result["error"])
        self.assertNotIn("__kl_idle_execute", result["error"])
        syntax = json.loads(execute("if True\n    print(1)"))
        self.assertIn("SyntaxError", syntax["error"])
        self.assertIn('File "main.py", line 1', syntax["error"])
        self.assertIsNone(json.loads(execute("number = 4"))["error"])


if __name__ == "__main__":
    unittest.main()
