import json
from pathlib import Path
import runpy
import unittest

check = runpy.run_path(str(Path(__file__).parents[1] / 'public' / 'checks.py'))['__kl_check']

class TaskChecks(unittest.TestCase):
    def result(self, code, task):
        return json.loads(check(code, task))

    def test_beginner_solutions(self):
        solutions = {
            'hello': 'print("Welcome!")\nprint("Let us code")',
            'variable': 'team = "Explorers"\nprint(team)\nprint("Go", team)',
            'input': 'answer = input()\nprint(answer)',
            'welcome': 'answers = [input(), input()]\nprint(" / ".join(answers))',
            'total': 'rounds = [int(input()) for _ in range(2)]\nprint(sum(rounds))',
            'debug': 'print("Ready to code!")',
        }
        for task, code in solutions.items():
            with self.subTest(task=task):
                self.assertTrue(self.result(code, task)['passed'])

    def test_silver_multiple_valid_algorithms(self):
        solutions = [
            'scores = list(map(int, input().split()))\nprint(sum(1 for value in scores if scores.count(value) > 1))',
            'from collections import Counter\ncounts = Counter(map(int, input().split()))\nprint(sum(n for n in counts.values() if n > 1))',
        ]
        for code in solutions:
            self.assertTrue(self.result(code, 'duplicates')['passed'])

    def test_gold_baseline_including_zeros_and_negatives(self):
        code = '''rows, cols = map(int, input().split())
grid = [list(map(int, input().split())) for _ in range(rows)]
target = int(input())
count = 0
for top in range(rows):
    for bottom in range(top, rows):
        for left in range(cols):
            for right in range(left, cols):
                total = sum(grid[r][c] for r in range(top, bottom + 1) for c in range(left, right + 1))
                if total == target:
                    count += 1
print(count)
'''
        result = self.result(code, 'rectangles')
        self.assertTrue(result['passed'])
        self.assertEqual([item['expected'] for item in result['cases'][:5]], ['4', '2', '9', '5', '1'])

    def test_incorrect_and_incomplete_solutions_fail(self):
        for code, task in [('print("one line")', 'hello'), ('print("Hello, coding club!")\nprint("Hello, coding club!")', 'hello'), ('print("x")\nprint("x")', 'variable'),
                           ('a=input()\nb=input()\nprint(a+b)', 'total'),
                           ('input()\nprint("Nova")', 'input'), ('print(4)', 'duplicates'),
                           ('input()\ninput()\ninput()', 'welcome')]:
            with self.subTest(task=task):
                self.assertFalse(self.result(code, task)['passed'])

    def test_prompts_are_separate_from_assessed_output(self):
        self.assertTrue(self.result('a=int(input("First: "))\nb=int(input("Second: "))\nprint(a+b)', 'total')['passed'])

    def test_syntax_errors_and_excessive_output_are_reported(self):
        self.assertIn('SyntaxError', self.result('print("broken)', 'hello')['error'])
        self.assertFalse(self.result('print("x" * 30000)', 'hello')['passed'])

if __name__ == '__main__':
    unittest.main()
