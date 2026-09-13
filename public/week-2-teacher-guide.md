# Week 2 teacher reference
15 September 2026 | 60 minutes | KS2-KS4

Learning intention: write and test loops that process a list, then explain how counts and totals change.

Use explicit camelCase names, four-space indentation and full update statements. These are the classroom conventions. Accept alternative correct student work that meets the stated task requirements.

## Teaching sequence

- 0–2 min: Return & goal - One score becomes a collection
- 2–8 min: Read first · Do Now - Collect the club scores
- 8–10 min: Types of learning - What do I need to get better at?
- 10–14 min: Read first · a loop - Visit one item at a time
- 14–27 min: Main Task 1 - Build the score announcer
- 27–30 min: Learning pit stop 1 - Where am I now?
- 30–35 min: Read first · count and total - Build a result as you go
- 35–50 min: Main Task 2 - Build the club score desk
- 50–54 min: Learning pit stop 2 - What does my work show?
- 54–60 min: Plenary & save - Show it with fresh scores

Keep whole-class modelling brief: at most two minutes for each worked demonstration. Students use reading, walkthroughs and targeted help independently.
Every extension is open to every student. KS2 support: short lists and missing-line starters. KS3: reduced support and two accumulators. KS4: conditions, functions and one-pass reasoning.

## Collect the club scores

The brackets collect four integer items. scores names the list. print displays [4, 8, 2, 5]. A list can contain repeated values and zero.

```python
scores = [4, 8, 2, 5]
print(scores)
```

**Expected tests:** [4, 8, 2, 5] displays the same four items; also try [0, -1, 0, 6].

**Common error:** Missing commas are syntax errors. Quoted numbers are text, not integers.

| Line | Iteration | What actually happens |
|---|---|---|
| Start | - | No program line has run yet. Choose Next line to begin. |
| 1 | - | Store [4, 8, 2, 5] in scores. Previous value: Not set. |
| 2 | - | print() has added its message to the output. Read the output for this step. |

## Visit one item at a time

For [4, 7, 2], currentScore holds 4, then 7, then 2. The indented print executes three times. The list remains unchanged.

```python
scores = [4, 7, 2]

for currentScore in scores:
    print(currentScore)
```

**Expected tests:** Output: 4, 7 and 2 on separate lines.

**Common error:** Without indentation, Python cannot identify the loop body.

| Line | Iteration | What actually happens |
|---|---|---|
| Start | - | No program line has run yet. Choose Next line to begin. |
| 1 | - | Store [4, 7, 2] in scores. Previous value: Not set. |
| 3 | 1 | Iteration 1: take the next item from scores and store 4 in currentScore. The indented body runs next. |
| 4 | 1 | print() has added its message to the output. Read the output for this step. |
| 3 | 2 | Iteration 2: take the next item from scores and store 7 in currentScore. The indented body runs next. |
| 4 | 2 | print() has added its message to the output. Read the output for this step. |
| 3 | 3 | Iteration 3: take the next item from scores and store 2 in currentScore. The indented body runs next. |
| 4 | 3 | print() has added its message to the output. Read the output for this step. |
| 3 | - | The loop has no more items. It has finished 3 iterations. Continue after the indented block. |

## Build the score announcer

The loop assigns each list item to currentScore. The indented print runs with that value. Moving the print outside displays only the last score for a non-empty list; an empty list would leave currentScore unset.

```python
scores = [6, 0, 3, 8]

for currentScore in scores:
    print(currentScore)
```

**Expected tests:** [6, 0, 3, 8] -> 6 / 0 / 3 / 8; [5, -2, 5] -> 5 / -2 / 5; [] -> no output.

**Common error:** Printing scores inside the loop displays the entire list repeatedly.

| Line | Iteration | What actually happens |
|---|---|---|
| Start | - | No program line has run yet. Choose Next line to begin. |
| 1 | - | Store [6, 0, 3, 8] in scores. Previous value: Not set. |
| 3 | 1 | Iteration 1: take the next item from scores and store 6 in currentScore. The indented body runs next. |
| 4 | 1 | print() has added its message to the output. Read the output for this step. |
| 3 | 2 | Iteration 2: take the next item from scores and store 0 in currentScore. The indented body runs next. |
| 4 | 2 | print() has added its message to the output. Read the output for this step. |
| 3 | 3 | Iteration 3: take the next item from scores and store 3 in currentScore. The indented body runs next. |
| 4 | 3 | print() has added its message to the output. Read the output for this step. |
| 3 | 4 | Iteration 4: take the next item from scores and store 8 in currentScore. The indented body runs next. |
| 4 | 4 | print() has added its message to the output. Read the output for this step. |
| 3 | - | The loop has no more items. It has finished 4 iterations. Continue after the indented block. |

## Build a result as you go

Initialise once before the loop. On each iteration, read the old total, add the current score, and replace the total. Count adds 1 regardless of the score value. The final unindented print runs once.

```python
scores = [4, 7, 2]
totalScore = 0

for currentScore in scores:
    totalScore = totalScore + currentScore

print(totalScore)
```

**Expected tests:** [4, 7, 2] -> total 13; the separate counter example outputs 3.

**Common error:** Resetting totalScore to zero inside the loop loses earlier scores. totalScore = currentScore only keeps the latest score.

| Line | Iteration | What actually happens |
|---|---|---|
| Start | - | No program line has run yet. Choose Next line to begin. |
| 1 | - | Store [4, 7, 2] in scores. Previous value: Not set. |
| 2 | - | Store 0 in totalScore. Previous value: Not set. |
| 4 | 1 | Iteration 1: take the next item from scores and store 4 in currentScore. The indented body runs next. |
| 5 | 1 | Calculate 0 + 4 = 4. Store the result back in totalScore. |
| 4 | 2 | Iteration 2: take the next item from scores and store 7 in currentScore. The indented body runs next. |
| 5 | 2 | Calculate 4 + 7 = 11. Store the result back in totalScore. |
| 4 | 3 | Iteration 3: take the next item from scores and store 2 in currentScore. The indented body runs next. |
| 5 | 3 | Calculate 11 + 2 = 13. Store the result back in totalScore. |
| 4 | - | The loop has no more items. It has finished 3 iterations. Continue after the indented block. |
| 7 | - | print() has added its message to the output. Read the output for this step. |

## Build the club score desk

The right side uses the old total. For [5, 0, 2, 7], totals become 5, 5, 7, 14 and counts become 1, 2, 3, 4. The zero is still an item. Both final print lines are outside the loop.

```python
scores = [5, 0, 2, 7]
scoreCount = 0
totalScore = 0

for currentScore in scores:
    scoreCount = scoreCount + 1
    totalScore = totalScore + currentScore

print(scoreCount)
print(totalScore)
```

**Expected tests:** [5, 0, 2, 7] -> 4 then 14 (or 14 for total only); [-3, 0, 8] -> 3 then 5; [] -> 0 then 0.

**Common error:** An initial total inside the loop is reset each time. Starting a counter at 1 overcounts by one.

| Line | Iteration | What actually happens |
|---|---|---|
| Start | - | No program line has run yet. Choose Next line to begin. |
| 1 | - | Store [5, 0, 2, 7] in scores. Previous value: Not set. |
| 2 | - | Store 0 in scoreCount. Previous value: Not set. |
| 3 | - | Store 0 in totalScore. Previous value: Not set. |
| 5 | 1 | Iteration 1: take the next item from scores and store 5 in currentScore. The indented body runs next. |
| 6 | 1 | Calculate 0 + 1 = 1. Store the result back in scoreCount. |
| 7 | 1 | Calculate 0 + 5 = 5. Store the result back in totalScore. |
| 5 | 2 | Iteration 2: take the next item from scores and store 0 in currentScore. The indented body runs next. |
| 6 | 2 | Calculate 1 + 1 = 2. Store the result back in scoreCount. |
| 7 | 2 | Calculate 5 + 0 = 5. Store the result back in totalScore. |
| 5 | 3 | Iteration 3: take the next item from scores and store 2 in currentScore. The indented body runs next. |
| 6 | 3 | Calculate 2 + 1 = 3. Store the result back in scoreCount. |
| 7 | 3 | Calculate 5 + 2 = 7. Store the result back in totalScore. |
| 5 | 4 | Iteration 4: take the next item from scores and store 7 in currentScore. The indented body runs next. |
| 6 | 4 | Calculate 3 + 1 = 4. Store the result back in scoreCount. |
| 7 | 4 | Calculate 7 + 7 = 14. Store the result back in totalScore. |
| 5 | - | The loop has no more items. It has finished 4 iterations. Continue after the indented block. |
| 9 | - | print() has added its message to the output. Read the output for this step. |
| 10 | - | print() has added its message to the output. Read the output for this step. |

## Show it with fresh scores

Expected count 4 and total 14. In iteration 2 the zero keeps totalScore at 5 while scoreCount moves from 1 to 2. Ask the student to explain without reading a model sentence first.

```python
scores = [5, 0, 2, 7]
scoreCount = 0
totalScore = 0

for currentScore in scores:
    scoreCount = scoreCount + 1
    totalScore = totalScore + currentScore

print(scoreCount)
print(totalScore)
```

**Expected tests:** [5, 0, 2, 7] -> 4 then 14. The checker also uses a different and an empty list.

**Common error:** A correct output copied as print(14) does not demonstrate a general method.

| Line | Iteration | What actually happens |
|---|---|---|
| Start | - | No program line has run yet. Choose Next line to begin. |
| 1 | - | Store [5, 0, 2, 7] in scores. Previous value: Not set. |
| 2 | - | Store 0 in scoreCount. Previous value: Not set. |
| 3 | - | Store 0 in totalScore. Previous value: Not set. |
| 5 | 1 | Iteration 1: take the next item from scores and store 5 in currentScore. The indented body runs next. |
| 6 | 1 | Calculate 0 + 1 = 1. Store the result back in scoreCount. |
| 7 | 1 | Calculate 0 + 5 = 5. Store the result back in totalScore. |
| 5 | 2 | Iteration 2: take the next item from scores and store 0 in currentScore. The indented body runs next. |
| 6 | 2 | Calculate 1 + 1 = 2. Store the result back in scoreCount. |
| 7 | 2 | Calculate 5 + 0 = 5. Store the result back in totalScore. |
| 5 | 3 | Iteration 3: take the next item from scores and store 2 in currentScore. The indented body runs next. |
| 6 | 3 | Calculate 2 + 1 = 3. Store the result back in scoreCount. |
| 7 | 3 | Calculate 5 + 2 = 7. Store the result back in totalScore. |
| 5 | 4 | Iteration 4: take the next item from scores and store 7 in currentScore. The indented body runs next. |
| 6 | 4 | Calculate 3 + 1 = 4. Store the result back in scoreCount. |
| 7 | 4 | Calculate 7 + 7 = 14. Store the result back in totalScore. |
| 5 | - | The loop has no more items. It has finished 4 iterations. Continue after the indented block. |
| 9 | - | print() has added its message to the output. Read the output for this step. |
| 10 | - | print() has added its message to the output. Read the output for this step. |

## Pre-Bronze Small-list score keeper

Totals after each iteration: 2, 7, 8. In iteration 2, 2 + 5 = 7. The starting zero is not an extra item.

```python
scores = [2, 5, 1]
totalScore = 0

for currentScore in scores:
    totalScore = totalScore + currentScore

print(totalScore)
```

**Expected tests:** [2, 5, 1] -> 8; [0, 4] -> 4; [] -> 0.

**Common error:** Writing totalScore + currentScore without assignment discards the calculated value.

| Line | Iteration | What actually happens |
|---|---|---|
| Start | - | No program line has run yet. Choose Next line to begin. |
| 1 | - | Store [2, 5, 1] in scores. Previous value: Not set. |
| 2 | - | Store 0 in totalScore. Previous value: Not set. |
| 4 | 1 | Iteration 1: take the next item from scores and store 2 in currentScore. The indented body runs next. |
| 5 | 1 | Calculate 0 + 2 = 2. Store the result back in totalScore. |
| 4 | 2 | Iteration 2: take the next item from scores and store 5 in currentScore. The indented body runs next. |
| 5 | 2 | Calculate 2 + 5 = 7. Store the result back in totalScore. |
| 4 | 3 | Iteration 3: take the next item from scores and store 1 in currentScore. The indented body runs next. |
| 5 | 3 | Calculate 7 + 1 = 8. Store the result back in totalScore. |
| 4 | - | The loop has no more items. It has finished 3 iterations. Continue after the indented block. |
| 7 | - | print() has added its message to the output. Read the output for this step. |

## Bronze Count every score

The four items have total 8. Counts progress 1, 2, 3, 4; totals progress 4, 4, 2, 8. Negative scores reduce the total but still increase the count.

```python
scores = [4, 0, -2, 6]
scoreCount = 0
totalScore = 0

for currentScore in scores:
    scoreCount = scoreCount + 1
    totalScore = totalScore + currentScore

print(scoreCount)
print(totalScore)
```

**Expected tests:** [4, 0, -2, 6] -> 4 then 8; [] -> 0 then 0.

**Common error:** Adding currentScore to scoreCount calculates another total, not the item count.

| Line | Iteration | What actually happens |
|---|---|---|
| Start | - | No program line has run yet. Choose Next line to begin. |
| 1 | - | Store [4, 0, -2, 6] in scores. Previous value: Not set. |
| 2 | - | Store 0 in scoreCount. Previous value: Not set. |
| 3 | - | Store 0 in totalScore. Previous value: Not set. |
| 5 | 1 | Iteration 1: take the next item from scores and store 4 in currentScore. The indented body runs next. |
| 6 | 1 | Calculate 0 + 1 = 1. Store the result back in scoreCount. |
| 7 | 1 | Calculate 0 + 4 = 4. Store the result back in totalScore. |
| 5 | 2 | Iteration 2: take the next item from scores and store 0 in currentScore. The indented body runs next. |
| 6 | 2 | Calculate 1 + 1 = 2. Store the result back in scoreCount. |
| 7 | 2 | Calculate 4 + 0 = 4. Store the result back in totalScore. |
| 5 | 3 | Iteration 3: take the next item from scores and store -2 in currentScore. The indented body runs next. |
| 6 | 3 | Calculate 2 + 1 = 3. Store the result back in scoreCount. |
| 7 | 3 | Calculate 4 + -2 = 2. Store the result back in totalScore. |
| 5 | 4 | Iteration 4: take the next item from scores and store 6 in currentScore. The indented body runs next. |
| 6 | 4 | Calculate 3 + 1 = 4. Store the result back in scoreCount. |
| 7 | 4 | Calculate 2 + 6 = 8. Store the result back in totalScore. |
| 5 | - | The loop has no more items. It has finished 4 iterations. Continue after the indented block. |
| 9 | - | print() has added its message to the output. Read the output for this step. |
| 10 | - | print() has added its message to the output. Read the output for this step. |

## Silver Keep only positive scores

The parameter scoreList holds the argument supplied by the call. Count and total are local to each call and reset before its loop. Only 5 and 7 satisfy > 0, giving 2 and 12. >= 0 would incorrectly count zero.

```python
def positiveScores(scoreList):
    scoreCount = 0
    totalScore = 0

    for currentScore in scoreList:
        if currentScore > 0:
            scoreCount = scoreCount + 1
            totalScore = totalScore + currentScore

    print(scoreCount)
    print(totalScore)

scores = [5, 0, -2, 7]
positiveScores(scores)
```

**Expected tests:** [5, 0, -2, 7] -> 2 then 12; [-3, 0] -> 0 then 0; [2, 2] -> 2 then 4.

**Common error:** Place the final prints after the loop but still inside the function.

| Line | Iteration | What actually happens |
|---|---|---|
| Start | - | No program line has run yet. Choose Next line to begin. |
| 1 | - | Define positiveScores. Its body runs when the function is called. |
| 13 | - | Store [5, 0, -2, 7] in scores. Previous value: Not set. |
| Start | - | Enter positiveScores. Its parameters hold the supplied argument values. |
| 2 | - | Store 0 in scoreCount. Previous value: Not set. |
| 3 | - | Store 0 in totalScore. Previous value: Not set. |
| 5 | 1 | Iteration 1: take the next item from scoreList and store 5 in currentScore. The indented body runs next. |
| 6 | 1 | The condition currentScore > 0 is true. Follow that branch. |
| 7 | 1 | Calculate 0 + 1 = 1. Store the result back in scoreCount. |
| 8 | 1 | Calculate 0 + 5 = 5. Store the result back in totalScore. |
| 5 | 2 | Iteration 2: take the next item from scoreList and store 0 in currentScore. The indented body runs next. |
| 6 | 2 | The condition currentScore > 0 is false. Follow that branch. |
| 5 | 3 | Iteration 3: take the next item from scoreList and store -2 in currentScore. The indented body runs next. |
| 6 | 3 | The condition currentScore > 0 is false. Follow that branch. |
| 5 | 4 | Iteration 4: take the next item from scoreList and store 7 in currentScore. The indented body runs next. |
| 6 | 4 | The condition currentScore > 0 is true. Follow that branch. |
| 7 | 4 | Calculate 1 + 1 = 2. Store the result back in scoreCount. |
| 8 | 4 | Calculate 5 + 7 = 12. Store the result back in totalScore. |
| 5 | - | The loop has no more items. It has finished 4 iterations. Continue after the indented block. |
| 10 | - | print() has added its message to the output. Read the output for this step. |
| 11 | - | print() has added its message to the output. Read the output for this step. |
| 14 | - | This line has executed. Compare the values and output. |

## Gold One pass, three results

The maximum begins at -5, changes to -2, then stays -2. Starting at zero would invent a value not in this list. A single loop visits n items; three separate scans would visit them three times. Both grow linearly with n; one pass does less traversal.

```python
scores = [-5, -2, -9]
scoreCount = 0
totalScore = 0
maximumScore = scores[0]

for currentScore in scores:
    scoreCount = scoreCount + 1
    totalScore = totalScore + currentScore
    if currentScore > maximumScore:
        maximumScore = currentScore

print(scoreCount)
print(totalScore)
print(maximumScore)
```

**Expected tests:** [-5, -2, -9] -> 3 / -16 / -2; [4] -> 1 / 4 / 4; [0, 0] -> 2 / 0 / 0. Empty lists are outside this task contract.

**Common error:** scores[0] needs a non-empty list. State that assumption instead of claiming the method handles an empty list.

| Line | Iteration | What actually happens |
|---|---|---|
| Start | - | No program line has run yet. Choose Next line to begin. |
| 1 | - | Store [-5, -2, -9] in scores. Previous value: Not set. |
| 2 | - | Store 0 in scoreCount. Previous value: Not set. |
| 3 | - | Store 0 in totalScore. Previous value: Not set. |
| 4 | - | Store -5 in maximumScore. Previous value: Not set. |
| 6 | 1 | Iteration 1: take the next item from scores and store -5 in currentScore. The indented body runs next. |
| 7 | 1 | Calculate 0 + 1 = 1. Store the result back in scoreCount. |
| 8 | 1 | Calculate 0 + -5 = -5. Store the result back in totalScore. |
| 9 | 1 | The condition currentScore > maximumScore is false. Follow that branch. |
| 6 | 2 | Iteration 2: take the next item from scores and store -2 in currentScore. The indented body runs next. |
| 7 | 2 | Calculate 1 + 1 = 2. Store the result back in scoreCount. |
| 8 | 2 | Calculate -5 + -2 = -7. Store the result back in totalScore. |
| 9 | 2 | The condition currentScore > maximumScore is true. Follow that branch. |
| 10 | 2 | Store -2 in maximumScore. Previous value: -5. |
| 6 | 3 | Iteration 3: take the next item from scores and store -9 in currentScore. The indented body runs next. |
| 7 | 3 | Calculate 2 + 1 = 3. Store the result back in scoreCount. |
| 8 | 3 | Calculate -7 + -9 = -16. Store the result back in totalScore. |
| 9 | 3 | The condition currentScore > maximumScore is false. Follow that branch. |
| 6 | - | The loop has no more items. It has finished 3 iterations. Continue after the indented block. |
| 12 | - | print() has added its message to the output. Read the output for this step. |
| 13 | - | print() has added its message to the output. Read the output for this step. |
| 14 | - | print() has added its message to the output. Read the output for this step. |

## Questions to return to

- Why is the starting total zero? It is the total before any items have been added.
- Why initialise outside the loop? The initial value should be assigned once, so previous additions are not erased.
- Why is totalScore on both sides? Python reads the old value on the right, calculates the sum, then replaces the value on the left.
- Why does count change for zero? Zero is still one item; adding its value changes the total by zero.
- Why is print outside the loop? A final result is displayed once after every item has been processed.
- Why does maximum start at the first item? Starting at zero gives a false result for an all-negative list.

The two pit stops are stored separately. Ask for a line, actual trace values, a test or a help question. Self-ratings and watching examples do not automatically establish understanding.

Reference: https://filestore.aqa.org.uk/resources/computing/AQA-8525-NG-PY.PDF
