import json
from pathlib import Path
import runpy
import unittest

ROOT = Path(__file__).resolve().parents[1]
trace = runpy.run_path(str(ROOT / 'public/trace.py'))['__kl_trace']
check = runpy.run_path(str(ROOT / 'public/checks2.py'))['__kl_check2']
TOTAL = 'scores = [4, 7, 2]\ntotalScore = 0\nfor currentScore in scores:\n    totalScore = totalScore + currentScore\nprint(totalScore)\n'

class Week2Tests(unittest.TestCase):
    def capture(self, code):
        events=[]
        trace(code,lambda e: events.append(json.loads(e)))
        return events
    def test_real_total_iterations_and_initial_values(self):
        events=self.capture(TOTAL)
        self.assertEqual(events[0]['before'],{})
        self.assertIsNone(events[0]['executedLine'])
        updates=[e for e in events if e['executedLine']==4]
        self.assertEqual([e['before']['totalScore'] for e in updates],[0,4,11])
        self.assertEqual([e['after']['totalScore'] for e in updates],[4,11,13])
        self.assertIn('4 + 7 = 11',updates[1]['explanation'])
        self.assertEqual([e['loops'][0]['iteration'] for e in updates],[1,2,3])
        self.assertTrue(any(e['loopFinished'] for e in events))
        self.assertEqual(events[-1]['event'],'end')
    def test_repeated_values_are_separate_iterations(self):
        events=self.capture(TOTAL.replace('[4, 7, 2]','[2, 2]'))
        self.assertEqual([e['loops'][0]['iteration'] for e in events if e['iterationChanged']],[1,2])
    def test_empty_loop_finishes_without_inventing_item(self):
        events=self.capture(TOTAL.replace('[4, 7, 2]','[]'))
        self.assertEqual(events[-1]['after']['totalScore'],0)
        self.assertNotIn('currentScore',events[-1]['after'])
        self.assertTrue(any(e['loopFinished'] for e in events))
    def test_function_return_and_negative_selection(self):
        code='def addPositive(values):\n    total = 0\n    for item in values:\n        if item > 0:\n            total = total + item\n    return total\nresult = addPositive([-2, 0, 5])\nprint(result)\n'
        events=self.capture(code)
        self.assertEqual(events[-1]['after']['result'],5)
        self.assertTrue(any('is false' in e['explanation'] for e in events))
        self.assertTrue(any('Return 5' in e['explanation'] for e in events))
    def test_walkthrough_limit_and_unsupported_construct(self):
        with self.assertRaisesRegex(ValueError,'does not yet support While'):
            self.capture('while True:\n    pass')
        with self.assertRaisesRegex(Exception,'300 steps'):
            self.capture('for item in range(1000):\n    value = item')
    def test_real_exception_not_labelled_as_success(self):
        events=[]
        with self.assertRaises(ZeroDivisionError):
            trace('first = 1\nsecond = 1 / 0',lambda e:events.append(json.loads(e)))
        self.assertFalse(any(e['executedLine']==2 for e in events))
    def test_untraced_layouts_are_reported_and_nonfinite_values_are_serializable(self):
        for code in ['a = 1; b = 2', 'scores = [\n1, 2\n]']:
            with self.assertRaisesRegex(ValueError, 'Walk through needs'):
                self.capture(code)
        events=self.capture('number = float("inf")')
        self.assertEqual(events[-1]['after']['number'],'<float inf>')
    def test_checks_reject_hardcoded_total_and_test_changed_data(self):
        self.assertTrue(json.loads(check(TOTAL,'w2-total'))['passed'])
        bad='scores = [4, 7, 2]\nfor score in scores:\n    pass\nprint(13)'
        self.assertFalse(json.loads(check(bad,'w2-total'))['passed'])
        self.assertFalse(json.loads(check('scores = [4, 7, 2]\nprint(sum(scores))','w2-total'))['passed'])
    def test_check_counter_and_total_and_empty_list(self):
        code=TOTAL.replace('totalScore = 0','totalScore = 0\nscoreCount = 0').replace('    totalScore = totalScore + currentScore','    totalScore = totalScore + currentScore\n    scoreCount = scoreCount + 1').replace('print(totalScore)','print(scoreCount)\nprint(totalScore)')
        self.assertTrue(json.loads(check(code,'w2-count-total'))['passed'])

if __name__=='__main__': unittest.main()
