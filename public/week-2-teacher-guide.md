# Week 2 teacher reference

15 September 2026 · 60 minutes · KS2–KS4

Lists, loops and running totals. Read a short example, build a program, test changed data, then explain an actual value.

## Lesson sequence

| Minutes | Stage | Focus |
| --- | --- | --- |
| 0–2 min | Return & goal | One score becomes a collection |
| 2–8 min | Read first · Do Now | Collect the club scores |
| 8–10 min | Types of learning | What do I need to get better at? |
| 10–14 min | Read first · a loop | Visit one item at a time |
| 14–27 min | Main Task 1 | Main Task 1 · Visit and use each item |
| 27–30 min | Learning pit stop 1 | Where am I now? |
| 30–35 min | Read first · count and total | Build a result as you go |
| 35–50 min | Main Task 2 | Main Task 2 · Build and test a result |
| 50–54 min | Learning pit stop 2 | What does my work show? |
| 54–60 min | Plenary & save | Show it with fresh scores |

## Practice and pacing

Main Task 1 has three programs in 13 minutes (about 4 minutes each). Main Task 2 has five in 15 minutes (about 3 minutes each). These are flexible windows including reading, coding and checking. Offer the worked example or hints to students who need them. Confident students can build with less help.

Swap coder and checker after a card. Every student explains one step. Pause everyone for the pit stops at minutes 27 and 50, even with unfinished cards; students can return to those later. Cards are available to every student, and each keeps its own code, tests and evidence.

KS2: use short lists and missing-line starters. KS3: reduce scaffolding and compare contexts. KS4: use conditions, functions or one-pass reasoning in the separate Extensions area. These guide support, not access.

Use meaningful camelCase names, double-quoted strings, four spaces and explicit updates. Accept correct alternatives when they meet the stated task. Check work substitutes fresh data in the named list; model code and student drafts are unchanged.

### Main Task 1 · Visit and use each item

Start with Scores, then try Badges and Training laps. Run and change the data on each card. Swap coder and checker after a card.

1. **Build the score announcer** — Print each item.
2. **Print the club name badges** — Repeat with text.
3. **Double the training laps** — Change each value.

### Main Task 2 · Build and test a result

Start with Score desk, then work through the scenarios. Use a hint when needed. Swap roles after a card; explain one update each.

1. **Build the club score desk** — Build a total.
2. **Count the library shelves** — Count the items.
3. **Total the ticket income** — Calculate, then total.
4. **Repair the rainfall recorder** — Find and fix a bug.
5. **Check the classroom supply boxes** — Combine two results.

## Solutions and actual execution traces

These traces come from running the model through the same Python tracing engine as the app. Line numbers refer to the model shown. Use a student’s own trace when discussing their program.

### Collect the club scores

The brackets collect four integer items. scores names the list. print displays [4, 8, 2, 5]. A list can contain repeated values and zero.

```python
scores = [4, 8, 2, 5]
print(scores)
```

**Expected tests:** [4, 8, 2, 5] displays the same four items; also try [0, -1, 0, 6].

**Common error:** Missing commas are syntax errors. Quoted numbers are text, not integers.

**Ask after running:** Why might a club keep several scores in one list?

| Line | Iteration | What happened and why |
| --- | --- | --- |
| Start | — | No program line has run yet. Choose Next line to begin. |
| 1 | — | Store [4, 8, 2, 5] in scores. Previous value: Not set. |
| 2 | — | print() has added its message to the output. Read the output for this step. |

### Visit one item at a time

For [4, 7, 2], currentScore holds 4, then 7, then 2. The indented print executes three times. The list remains unchanged.

```python
scores = [4, 7, 2]

for currentScore in scores:
    print(currentScore)
```

**Expected tests:** Output: 4, 7 and 2 on separate lines.

**Common error:** Without indentation, Python cannot identify the loop body.

**Ask after running:** In iteration 2, what value does currentScore hold? Use the trace you have just seen.

| Line | Iteration | What happened and why |
| --- | --- | --- |
| Start | — | No program line has run yet. Choose Next line to begin. |
| 1 | — | Store [4, 7, 2] in scores. Previous value: Not set. |
| 3 | 1 | Iteration 1: take the next item from scores and store 4 in currentScore. The indented body runs next. |
| 4 | 1 | print() has added its message to the output. Read the output for this step. |
| 3 | 2 | Iteration 2: take the next item from scores and store 7 in currentScore. The indented body runs next. |
| 4 | 2 | print() has added its message to the output. Read the output for this step. |
| 3 | 3 | Iteration 3: take the next item from scores and store 2 in currentScore. The indented body runs next. |
| 4 | 3 | print() has added its message to the output. Read the output for this step. |
| 3 | — | The loop has no more items. It has finished 3 iterations. Continue after the indented block. |

### Build the score announcer

The loop assigns each list item to currentScore. The indented print runs with that value. Moving the print outside displays only the last score for a non-empty list; an empty list would leave currentScore unset.

```python
scores = [6, 0, 3, 8]

for currentScore in scores:
    print(currentScore)
```

**Expected tests:** [6, 0, 3, 8] -> 6 / 0 / 3 / 8; [5, -2, 5] -> 5 / -2 / 5; [] -> no output.

**Common error:** Printing scores inside the loop displays the entire list repeatedly.

**Ask after running:** What happens if you move print outside the loop? Run a small example and explain.

| Line | Iteration | What happened and why |
| --- | --- | --- |
| Start | — | No program line has run yet. Choose Next line to begin. |
| 1 | — | Store [6, 0, 3, 8] in scores. Previous value: Not set. |
| 3 | 1 | Iteration 1: take the next item from scores and store 6 in currentScore. The indented body runs next. |
| 4 | 1 | print() has added its message to the output. Read the output for this step. |
| 3 | 2 | Iteration 2: take the next item from scores and store 0 in currentScore. The indented body runs next. |
| 4 | 2 | print() has added its message to the output. Read the output for this step. |
| 3 | 3 | Iteration 3: take the next item from scores and store 3 in currentScore. The indented body runs next. |
| 4 | 3 | print() has added its message to the output. Read the output for this step. |
| 3 | 4 | Iteration 4: take the next item from scores and store 8 in currentScore. The indented body runs next. |
| 4 | 4 | print() has added its message to the output. Read the output for this step. |
| 3 | — | The loop has no more items. It has finished 4 iterations. Continue after the indented block. |

### Print the club name badges

The loop variable receives a string on each iteration. Identical names at different positions still cause separate visits. No conversion to int is needed.

```python
memberNames = ["Mia", "Sam", "Zara"]

for currentName in memberNames:
    print(currentName)
```

**Expected tests:** ["Mia", "Sam", "Zara"] -> Mia / Sam / Zara; ["Kai", "Kai"] prints Kai twice; [] prints nothing.

**Common error:** Printing memberNames inside the loop repeats the entire list.

**Ask after running:** Two members have the same first name. Why does the loop still print two badges?

| Line | Iteration | What happened and why |
| --- | --- | --- |
| Start | — | No program line has run yet. Choose Next line to begin. |
| 1 | — | Store ["Mia", "Sam", "Zara"] in memberNames. Previous value: Not set. |
| 3 | 1 | Iteration 1: take the next item from memberNames and store "Mia" in currentName. The indented body runs next. |
| 4 | 1 | print() has added its message to the output. Read the output for this step. |
| 3 | 2 | Iteration 2: take the next item from memberNames and store "Sam" in currentName. The indented body runs next. |
| 4 | 2 | print() has added its message to the output. Read the output for this step. |
| 3 | 3 | Iteration 3: take the next item from memberNames and store "Zara" in currentName. The indented body runs next. |
| 4 | 3 | print() has added its message to the output. Read the output for this step. |
| 3 | — | The loop has no more items. It has finished 3 iterations. Continue after the indented block. |

### Double the training laps

The outputs are 6, 0, 10 and 4. Each multiplication uses the current item. targetLaps is replaced on every visit; it is not a running total. The original list is unchanged.

```python
lapCounts = [3, 0, 5, 2]

for currentLaps in lapCounts:
    targetLaps = currentLaps * 2
    print(targetLaps)
```

**Expected tests:** [3, 0, 5, 2] -> 6 / 0 / 10 / 4; [2, 2] -> 4 / 4; [] -> no output.

**Common error:** Printing currentLaps displays the original value. An unindented print displays only the final target for a non-empty list.

**Ask after running:** Which instructions must be indented so every runner gets a new target?

| Line | Iteration | What happened and why |
| --- | --- | --- |
| Start | — | No program line has run yet. Choose Next line to begin. |
| 1 | — | Store [3, 0, 5, 2] in lapCounts. Previous value: Not set. |
| 3 | 1 | Iteration 1: take the next item from lapCounts and store 3 in currentLaps. The indented body runs next. |
| 4 | 1 | Calculate 3 * 2 = 6. Store the result back in targetLaps. |
| 5 | 1 | print() has added its message to the output. Read the output for this step. |
| 3 | 2 | Iteration 2: take the next item from lapCounts and store 0 in currentLaps. The indented body runs next. |
| 4 | 2 | Calculate 0 * 2 = 0. Store the result back in targetLaps. |
| 5 | 2 | print() has added its message to the output. Read the output for this step. |
| 3 | 3 | Iteration 3: take the next item from lapCounts and store 5 in currentLaps. The indented body runs next. |
| 4 | 3 | Calculate 5 * 2 = 10. Store the result back in targetLaps. |
| 5 | 3 | print() has added its message to the output. Read the output for this step. |
| 3 | 4 | Iteration 4: take the next item from lapCounts and store 2 in currentLaps. The indented body runs next. |
| 4 | 4 | Calculate 2 * 2 = 4. Store the result back in targetLaps. |
| 5 | 4 | print() has added its message to the output. Read the output for this step. |
| 3 | — | The loop has no more items. It has finished 4 iterations. Continue after the indented block. |

### Build a result as you go

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

**Ask after running:** A score is zero. Why does it increase the count but not the total?

| Line | Iteration | What happened and why |
| --- | --- | --- |
| Start | — | No program line has run yet. Choose Next line to begin. |
| 1 | — | Store [4, 7, 2] in scores. Previous value: Not set. |
| 2 | — | Store 0 in totalScore. Previous value: Not set. |
| 4 | 1 | Iteration 1: take the next item from scores and store 4 in currentScore. The indented body runs next. |
| 5 | 1 | Calculate 0 + 4 = 4. Store the result back in totalScore. |
| 4 | 2 | Iteration 2: take the next item from scores and store 7 in currentScore. The indented body runs next. |
| 5 | 2 | Calculate 4 + 7 = 11. Store the result back in totalScore. |
| 4 | 3 | Iteration 3: take the next item from scores and store 2 in currentScore. The indented body runs next. |
| 5 | 3 | Calculate 11 + 2 = 13. Store the result back in totalScore. |
| 4 | — | The loop has no more items. It has finished 3 iterations. Continue after the indented block. |
| 7 | — | print() has added its message to the output. Read the output for this step. |

### Build the club score desk

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

**Ask after running:** Why is totalScore allowed on both sides of the equals sign?

| Line | Iteration | What happened and why |
| --- | --- | --- |
| Start | — | No program line has run yet. Choose Next line to begin. |
| 1 | — | Store [5, 0, 2, 7] in scores. Previous value: Not set. |
| 2 | — | Store 0 in scoreCount. Previous value: Not set. |
| 3 | — | Store 0 in totalScore. Previous value: Not set. |
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
| 5 | — | The loop has no more items. It has finished 4 iterations. Continue after the indented block. |
| 9 | — | print() has added its message to the output. Read the output for this step. |
| 10 | — | print() has added its message to the output. Read the output for this step. |

### Count the library shelves

Four items mean four shelves. The values sum to 13 books, but that is not the requested result. The zero-book shelf increases shelfCount from 1 to 2.

```python
booksOnShelves = [4, 0, 7, 2]
shelfCount = 0

for currentBooks in booksOnShelves:
    shelfCount = shelfCount + 1

print(shelfCount)
```

**Expected tests:** [4, 0, 7, 2] -> 4; [0, 0] -> 2; [] -> 0.

**Common error:** Adding currentBooks counts books instead of shelves.

**Ask after running:** Which change increased the shelf count: changing a book value or adding another item?

| Line | Iteration | What happened and why |
| --- | --- | --- |
| Start | — | No program line has run yet. Choose Next line to begin. |
| 1 | — | Store [4, 0, 7, 2] in booksOnShelves. Previous value: Not set. |
| 2 | — | Store 0 in shelfCount. Previous value: Not set. |
| 4 | 1 | Iteration 1: take the next item from booksOnShelves and store 4 in currentBooks. The indented body runs next. |
| 5 | 1 | Calculate 0 + 1 = 1. Store the result back in shelfCount. |
| 4 | 2 | Iteration 2: take the next item from booksOnShelves and store 0 in currentBooks. The indented body runs next. |
| 5 | 2 | Calculate 1 + 1 = 2. Store the result back in shelfCount. |
| 4 | 3 | Iteration 3: take the next item from booksOnShelves and store 7 in currentBooks. The indented body runs next. |
| 5 | 3 | Calculate 2 + 1 = 3. Store the result back in shelfCount. |
| 4 | 4 | Iteration 4: take the next item from booksOnShelves and store 2 in currentBooks. The indented body runs next. |
| 5 | 4 | Calculate 3 + 1 = 4. Store the result back in shelfCount. |
| 4 | — | The loop has no more items. It has finished 4 iterations. Continue after the indented block. |
| 7 | — | print() has added its message to the output. Read the output for this step. |

### Total the ticket income

Group incomes are 6, 0, 12 and 3. Running totals are 6, 6, 18 and 21. A correct loop that totals ticket counts then multiplies once by 3 also meets the task; ask the student to explain it.

```python
ticketCounts = [2, 0, 4, 1]
totalIncome = 0

for currentTickets in ticketCounts:
    groupIncome = currentTickets * 3
    totalIncome = totalIncome + groupIncome

print(totalIncome)
```

**Expected tests:** [2, 0, 4, 1] -> 21; [1] -> 3; [] -> 0.

**Common error:** Adding currentTickets directly without multiplying gives the ticket count rather than the income.

**Ask after running:** What different values do currentTickets, groupIncome and totalIncome hold?

| Line | Iteration | What happened and why |
| --- | --- | --- |
| Start | — | No program line has run yet. Choose Next line to begin. |
| 1 | — | Store [2, 0, 4, 1] in ticketCounts. Previous value: Not set. |
| 2 | — | Store 0 in totalIncome. Previous value: Not set. |
| 4 | 1 | Iteration 1: take the next item from ticketCounts and store 2 in currentTickets. The indented body runs next. |
| 5 | 1 | Calculate 2 * 3 = 6. Store the result back in groupIncome. |
| 6 | 1 | Calculate 0 + 6 = 6. Store the result back in totalIncome. |
| 4 | 2 | Iteration 2: take the next item from ticketCounts and store 0 in currentTickets. The indented body runs next. |
| 5 | 2 | Calculate 0 * 3 = 0. Store the result back in groupIncome. |
| 6 | 2 | Calculate 6 + 0 = 6. Store the result back in totalIncome. |
| 4 | 3 | Iteration 3: take the next item from ticketCounts and store 4 in currentTickets. The indented body runs next. |
| 5 | 3 | Calculate 4 * 3 = 12. Store the result back in groupIncome. |
| 6 | 3 | Calculate 6 + 12 = 18. Store the result back in totalIncome. |
| 4 | 4 | Iteration 4: take the next item from ticketCounts and store 1 in currentTickets. The indented body runs next. |
| 5 | 4 | Calculate 1 * 3 = 3. Store the result back in groupIncome. |
| 6 | 4 | Calculate 18 + 3 = 21. Store the result back in totalIncome. |
| 4 | — | The loop has no more items. It has finished 4 iterations. Continue after the indented block. |
| 8 | — | print() has added its message to the output. Read the output for this step. |

### Repair the rainfall recorder

The broken program prints 2, the last reading. The repaired program prints 10. In the broken trace, the previous subtotal is erased at the start of every visit. An empty list also exposes a missing initial value.

```python
rainfall = [3, 0, 5, 2]
totalRainfall = 0

for currentRainfall in rainfall:
    totalRainfall = totalRainfall + currentRainfall

print(totalRainfall)
```

**Expected tests:** [3, 0, 5, 2] -> 10; [0, 4] -> 4; [] -> 0.

**Common error:** Changing the indentation of the update instead of the initial zero can leave only the last reading added.

**Ask after running:** Which line should run once, and which line should repeat for every reading?

| Line | Iteration | What happened and why |
| --- | --- | --- |
| Start | — | No program line has run yet. Choose Next line to begin. |
| 1 | — | Store [3, 0, 5, 2] in rainfall. Previous value: Not set. |
| 2 | — | Store 0 in totalRainfall. Previous value: Not set. |
| 4 | 1 | Iteration 1: take the next item from rainfall and store 3 in currentRainfall. The indented body runs next. |
| 5 | 1 | Calculate 0 + 3 = 3. Store the result back in totalRainfall. |
| 4 | 2 | Iteration 2: take the next item from rainfall and store 0 in currentRainfall. The indented body runs next. |
| 5 | 2 | Calculate 3 + 0 = 3. Store the result back in totalRainfall. |
| 4 | 3 | Iteration 3: take the next item from rainfall and store 5 in currentRainfall. The indented body runs next. |
| 5 | 3 | Calculate 3 + 5 = 8. Store the result back in totalRainfall. |
| 4 | 4 | Iteration 4: take the next item from rainfall and store 2 in currentRainfall. The indented body runs next. |
| 5 | 4 | Calculate 8 + 2 = 10. Store the result back in totalRainfall. |
| 4 | — | The loop has no more items. It has finished 4 iterations. Continue after the indented block. |
| 7 | — | print() has added its message to the output. Read the output for this step. |

### Check the classroom supply boxes

The output is 4 boxes then 14 pencils. On the zero item, boxCount changes from 1 to 2 while totalPencils stays 6. Students transfer the score pattern to a different setting with meaningful variable names.

```python
pencilsInBoxes = [6, 0, 3, 5]
boxCount = 0
totalPencils = 0

for currentPencils in pencilsInBoxes:
    boxCount = boxCount + 1
    totalPencils = totalPencils + currentPencils

print(boxCount)
print(totalPencils)
```

**Expected tests:** [6, 0, 3, 5] -> 4 then 14; [0] -> 1 then 0; [] -> 0 then 0.

**Common error:** Starting boxCount at 1 adds a box that was never in the list.

**Ask after running:** An empty box has no pencils. Why does one result change while the other stays the same?

| Line | Iteration | What happened and why |
| --- | --- | --- |
| Start | — | No program line has run yet. Choose Next line to begin. |
| 1 | — | Store [6, 0, 3, 5] in pencilsInBoxes. Previous value: Not set. |
| 2 | — | Store 0 in boxCount. Previous value: Not set. |
| 3 | — | Store 0 in totalPencils. Previous value: Not set. |
| 5 | 1 | Iteration 1: take the next item from pencilsInBoxes and store 6 in currentPencils. The indented body runs next. |
| 6 | 1 | Calculate 0 + 1 = 1. Store the result back in boxCount. |
| 7 | 1 | Calculate 0 + 6 = 6. Store the result back in totalPencils. |
| 5 | 2 | Iteration 2: take the next item from pencilsInBoxes and store 0 in currentPencils. The indented body runs next. |
| 6 | 2 | Calculate 1 + 1 = 2. Store the result back in boxCount. |
| 7 | 2 | Calculate 6 + 0 = 6. Store the result back in totalPencils. |
| 5 | 3 | Iteration 3: take the next item from pencilsInBoxes and store 3 in currentPencils. The indented body runs next. |
| 6 | 3 | Calculate 2 + 1 = 3. Store the result back in boxCount. |
| 7 | 3 | Calculate 6 + 3 = 9. Store the result back in totalPencils. |
| 5 | 4 | Iteration 4: take the next item from pencilsInBoxes and store 5 in currentPencils. The indented body runs next. |
| 6 | 4 | Calculate 3 + 1 = 4. Store the result back in boxCount. |
| 7 | 4 | Calculate 9 + 5 = 14. Store the result back in totalPencils. |
| 5 | — | The loop has no more items. It has finished 4 iterations. Continue after the indented block. |
| 9 | — | print() has added its message to the output. Read the output for this step. |
| 10 | — | print() has added its message to the output. Read the output for this step. |

### Show it with fresh scores

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

**Ask after running:** Which line can you now explain more clearly than at the start?

| Line | Iteration | What happened and why |
| --- | --- | --- |
| Start | — | No program line has run yet. Choose Next line to begin. |
| 1 | — | Store [5, 0, 2, 7] in scores. Previous value: Not set. |
| 2 | — | Store 0 in scoreCount. Previous value: Not set. |
| 3 | — | Store 0 in totalScore. Previous value: Not set. |
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
| 5 | — | The loop has no more items. It has finished 4 iterations. Continue after the indented block. |
| 9 | — | print() has added its message to the output. Read the output for this step. |
| 10 | — | print() has added its message to the output. Read the output for this step. |

### Pre-Bronze · Small-list score keeper

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

**Ask after running:** What changed when you ran the program?

| Line | Iteration | What happened and why |
| --- | --- | --- |
| Start | — | No program line has run yet. Choose Next line to begin. |
| 1 | — | Store [2, 5, 1] in scores. Previous value: Not set. |
| 2 | — | Store 0 in totalScore. Previous value: Not set. |
| 4 | 1 | Iteration 1: take the next item from scores and store 2 in currentScore. The indented body runs next. |
| 5 | 1 | Calculate 0 + 2 = 2. Store the result back in totalScore. |
| 4 | 2 | Iteration 2: take the next item from scores and store 5 in currentScore. The indented body runs next. |
| 5 | 2 | Calculate 2 + 5 = 7. Store the result back in totalScore. |
| 4 | 3 | Iteration 3: take the next item from scores and store 1 in currentScore. The indented body runs next. |
| 5 | 3 | Calculate 7 + 1 = 8. Store the result back in totalScore. |
| 4 | — | The loop has no more items. It has finished 3 iterations. Continue after the indented block. |
| 7 | — | print() has added its message to the output. Read the output for this step. |

### Bronze · Count every score

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

**Ask after running:** What changed when you ran the program?

| Line | Iteration | What happened and why |
| --- | --- | --- |
| Start | — | No program line has run yet. Choose Next line to begin. |
| 1 | — | Store [4, 0, -2, 6] in scores. Previous value: Not set. |
| 2 | — | Store 0 in scoreCount. Previous value: Not set. |
| 3 | — | Store 0 in totalScore. Previous value: Not set. |
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
| 5 | — | The loop has no more items. It has finished 4 iterations. Continue after the indented block. |
| 9 | — | print() has added its message to the output. Read the output for this step. |
| 10 | — | print() has added its message to the output. Read the output for this step. |

### Silver · Keep only positive scores

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

**Ask after running:** What changed when you ran the program?

| Line | Iteration | What happened and why |
| --- | --- | --- |
| Start | — | No program line has run yet. Choose Next line to begin. |
| 1 | — | Define positiveScores. Its body runs when the function is called. |
| 13 | — | Store [5, 0, -2, 7] in scores. Previous value: Not set. |
| Start | — | Enter positiveScores. Its parameters hold the supplied argument values. |
| 2 | — | Store 0 in scoreCount. Previous value: Not set. |
| 3 | — | Store 0 in totalScore. Previous value: Not set. |
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
| 5 | — | The loop has no more items. It has finished 4 iterations. Continue after the indented block. |
| 10 | — | print() has added its message to the output. Read the output for this step. |
| 11 | — | print() has added its message to the output. Read the output for this step. |
| 14 | — | This line has executed. Compare the values and output. |

### Gold · One pass, three results

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

**Ask after running:** What changed when you ran the program?

| Line | Iteration | What happened and why |
| --- | --- | --- |
| Start | — | No program line has run yet. Choose Next line to begin. |
| 1 | — | Store [-5, -2, -9] in scores. Previous value: Not set. |
| 2 | — | Store 0 in scoreCount. Previous value: Not set. |
| 3 | — | Store 0 in totalScore. Previous value: Not set. |
| 4 | — | Store -5 in maximumScore. Previous value: Not set. |
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
| 6 | — | The loop has no more items. It has finished 3 iterations. Continue after the indented block. |
| 12 | — | print() has added its message to the output. Read the output for this step. |
| 13 | — | print() has added its message to the output. Read the output for this step. |
| 14 | — | print() has added its message to the output. Read the output for this step. |

## Learning pit stops

Use the same Knowledge, Skills and Understanding statements before and after learning. Ask for the scenario title, the line or iteration, an actual value, and a precise next action. A checked program is evidence for discussion, not a grade. Both pit stops are saved separately.

Students download their Week 2 PDF and lesson backup. Reports include each attempted scenario separately. Saving is local to the browser; students attach the PDF to Teams themselves.
