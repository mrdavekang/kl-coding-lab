const tc = (input, expected) => ({input: input.trimEnd() + '\n', expected});
const exercise = (number, title, goal, options = {}) => ({
  id: `tp-try-${number}`, title: `Try ${number} · ${title}`, goal,
  inputHelp: '', sampleInput: '', sampleOutput: '', starter: '# Write one small program.\n# Plan the input, process and output before typing.\n',
  check: `mcc-mco-try-${number}`, tests: [],
  hints: ['Act out a small example and record each movement or variable.', 'Use the syntax card. Adapt one instruction at a time.'],
  ...options,
});
const question = (label, expected, explanation, choices) => ({label, expected: String(expected), explanation, ...(choices ? {choices} : {})});
const paper = (number, title, goal, scenario, reasoning, hints) => exercise(number, title, goal, {kind:'output', starter:'', scenario, reasoning, hints});
const sample = '7 -6 10\n-15 -1 12 8 11 -6 0\n';
const sampleCities = '-15 -1 12 8 11 -6 0';
const headerReader = 'nAB = input().split()\nn = int(nAB[0])\nA = int(nAB[1])\nB = int(nAB[2])\ncityPositions = input().split()\nfor index in range(n):\n    cityPositions[index] = int(cityPositions[index])\ncityPositions.sort()\n';
const aliceBlock = '    aliceDistance = 0\n    if cut > 0:\n        left = cityPositions[0]\n        right = cityPositions[cut - 1]\n        goLeftFirst = abs(A - left) + (right - left)\n        goRightFirst = abs(A - right) + (right - left)\n        aliceDistance = min(goLeftFirst, goRightFirst)\n';
const bobBlock = '    bobDistance = 0\n    if cut < n:\n        left = cityPositions[cut]\n        right = cityPositions[n - 1]\n        goLeftFirst = abs(B - left) + (right - left)\n        goRightFirst = abs(B - right) + (right - left)\n        bobDistance = min(goLeftFirst, goRightFirst)\n';
const buggySingleCase = headerReader + 'if A > B:\n    temporary = A\n    A = B\n    B = temporary\n\n# This loop is missing one possible cut. Find and repair it.\nfor cut in range(n):\n' + aliceBlock + bobBlock + '    totalDistance = aliceDistance + bobDistance\n    if cut == 0:\n        minimumDistance = totalDistance\n    elif totalDistance < minimumDistance:\n        minimumDistance = totalDistance\n\nprint(minimumDistance)\n';

export const activities = [
  {
    id:'tp-understand', title:'Understand the road', summary:'Separate the input, count distances and compare human plans.', image:'01-cities-and-starts.png', imageWidth:1600,imageHeight:620,
    imageAlt:'The first sample has city coordinates minus fifteen, minus six, minus one, zero, eight, eleven and twelve on one road. Alice starts at minus six and Bob at ten. A coordinate names a place; a distance measures movement.',
    reading:[
      'Start with a ruler, paper city cards and two counters. A coordinate is a place on a straight road. Distance counts how many units you travel, so it is never negative.',
      'Every city must be visited by Alice or Bob. Passing a city counts as visiting it. A city at a starting position is already visited. Either person may stay still, and neither has to return home.',
      'Input tells us the starting positions and the cities. Process means choosing and comparing journeys. Output is their smallest combined distance, not the city coordinates or the time taken by the slower person.',
      'Tries 1–6 are reasoning tasks. You can solve them without knowing Python. Record your calculation and explain it to a partner before moving on.',
    ], syntax:[], example:null,
    questions:['Which numbers describe places, and which describe movement?', 'Can a journey have distance zero?', 'Why might giving each city to its nearest person produce a longer total?'],
    ready:'I can identify the input and explain a distance using a number line.',
    exercises:[
      paper(1,'Name the input and output','Find how far each person would travel to one city. Choose the smaller distance.', 'Alice starts at 4. Bob starts at 6. The only city is at 1.',[
        question('Alice’s distance from 4 to 1',3,'Count three units left: 4 to 1.'),question('Bob’s distance from 6 to 1',5,'Count five units left: 6 to 1.'),question('Smallest combined distance',3,'Alice travels 3 and Bob stays still for 0.'),question('Must they return to their starting positions?','NO','The question allows either person to finish anywhere.',['NO','YES']),
      ],['Draw the positions 1, 4 and 6 on a number line.', 'One person may do nothing. Add Alice’s chosen distance and Bob’s chosen distance.']),
      paper(2,'A place and a distance','Find three gaps. Reversing direction changes the journey, but not the size of the gap.', 'Compare the journeys −3 to 5, 5 to −3, and 2 to 2.',[
        question('Distance from −3 to 5',8,'Three units to zero, then five more: 3 + 5 = 8.'),question('Distance from 5 to −3',8,'The same gap is crossed in the opposite direction.'),question('Distance from 2 to 2',0,'The person is already there; no movement is required.'),
      ],['Mark zero between −3 and 5.', 'A distance cannot be negative. Starting and finishing at the same place costs zero.']),
      paper(3,'Test a nearest-person guess','Compare two complete plans before choosing the smaller combined distance.', 'Alice starts at 0, Bob at 10. Cities are −5 and 4. Plan A: Alice goes 0 → 4 → −5; Bob stays still. Plan B: Alice goes 0 → −5 and Bob goes 10 → 4.',[
        question('Plan A: Alice’s 4 + 9 units, with Bob staying still',13,'Alice first travels 4, then 9. Bob adds 0.'),question('Plan B: Alice’s 5 units plus Bob’s 6 units',11,'The two journeys cost 5 + 6 = 11.'),question('Smaller combined distance',11,'Both cities are initially nearer to Alice, yet sharing them is shorter.'),
      ],['Add every movement in each complete plan.', 'A locally nearer city does not guarantee the best total after all cities are visited.']),
    ],
  },
  {
    id:'tp-cuts',title:'Compare cuts and route orders',summary:'Share the sorted cities, compare both endpoint orders and keep the smaller totals.',image:'02-both-route-orders.png',imageWidth:1800,imageHeight:1890,explorer:true,
    imageAlt:'At cut two, Alice’s left-end-first route costs eighteen and her right-end-first route costs nine. Bob compares twenty four with fifteen. Use nine plus fifteen to obtain twenty four. Cut three similarly gives thirty three.',
    reading:[
      'A cut is a divider in the sorted city list. It counts how many cities the left-starting person receives. The remaining cities go to the right-starting person. Before the first city and after the last city are valid cuts.',
      'For one assigned group, identify its leftmost and rightmost city. Visit the left end first and then the right end, or the right end first and then the left end. Reaching both ends passes every assigned city between them.',
      'Compare the two route costs separately for Alice and Bob. Add their chosen distances to get this cut’s total. Then compare that total with the best total from earlier cuts. These are two different minimum decisions.',
      'The shorter group journey is the width of the group plus the distance to its nearer end. An empty group costs zero. A one-city group has width zero. Left end first names the destination; the first movement can still point right when the start is left of both cities.',
      'We compare endpoint costs using arithmetic. We do not build and save every possible visiting order. After sorting, each cut uses at most four route-cost calculations and reuses the same variables. Doubling the city count roughly doubles the number of cuts.',
    ],syntax:[['Distance between two coordinates','Find their gap on the number line. Absolute value will later express this in Python.'],['Group width + nearer-end distance','The mathematical shortcut for the smaller of the two route orders.']],example:null,
    questions:['At cut 2, which two cities belong to Alice?', 'Why does Bob compare 24 with 15 before adding Alice’s chosen 9?', 'Why do we compare a new total with the best so far, rather than only with the previous total?'],
    ready:'I can explain a cut, compare both endpoint orders and trace the best combined total.',
    exercises:[
      paper(4,'Count every cut','Use three city cards to include empty groups as well as shared groups.', 'Sorted cities: [−4, 3, 12]. A cut can be placed before, between or after the cards. Cut 2 gives Alice the first two cities.',[
        question('Number of possible cuts',4,'The cut values are 0, 1, 2 and 3: n + 1 cuts.'),question('Alice’s city count at cut 2',2,'The cut counts how many cities Alice receives.'),question('Bob’s city count at cut 2',1,'Three cities minus Alice’s two leaves one for Bob.'),
      ],['Draw all the gaps, including both outside gaps.', 'cut = 2 is a count. It does not mean coordinate 2.']),
      paper(5,'Compare both route orders','Use the same city coordinates twice; change only the starting position.', 'The assigned cities stay at 1 and 9. First the person starts at 5. Then repeat with the person starting at −3. They may finish at either end.',[
        question('Start 5: left end first, 5 → 1 → 9',12,'4 + 8 = 12.'),question('Start 5: right end first, 5 → 9 → 1',12,'4 + 8 = 12; either order works.'),question('Start −3: left end first, −3 → 1 → 9',12,'4 + 8 = 12.'),question('Start −3: right end first, −3 → 9 → 1',20,'12 + 8 = 20.'),question('Start −3: choose the smaller distance',12,'Choose 12 rather than 20. The cities remain at 1 and 9.'),
      ],['The width between the cities is always 9 − 1 = 8.', 'Add the distance from the start to the first end. You do not need to return home.']),
      paper(6,'Trace the best so far','Read the candidate totals in order and keep the smallest seen.', 'The eight cut totals are 29, 29, 24, 33, 27, 34, 37 and 36.',[
        question('Best after the first total, 29',29,'The first calculated total becomes the first best value.'),question('Best after seeing 29, 29 and 24',24,'24 replaces 29.'),question('Best after the next total, 33',24,'33 is larger than 24, so keep 24.'),question('Best after the next total, 27',24,'Compare 27 with the best 24. It is smaller than 33 but still larger than 24.'),question('Best after all eight totals',24,'None of the later totals improves on 24.'),
      ],['Write candidate total and best so far in separate columns.', 'Use the first real total as the initial best. No invented huge number is needed.']),
    ],
  },
  {
    id:'tp-input',title:'Start Python with input and output',summary:'Name values, read text, split a line and convert its items.',image:'03-read-split-convert.png',imageWidth:1600,imageHeight:650,
    imageAlt:'The text line 7 minus six 10 is split into the strings 7, minus six and 10 at indices zero, one and two. int converts the items to n equals seven, A equals minus six and B equals ten.',
    reading:[
      'A variable is a name for a value. = stores a value under a name. print(value) displays it. Read code from top to bottom and predict what each name contains.',
      'input() reads one line as text. .split() separates its whitespace-delimited items into a list of strings. Python starts list indices at zero, so nAB[0] is the first item.',
      'int(text) converts valid whole-number text to an integer. Convert before doing arithmetic: the text "9" and the integer 9 are different kinds of value.',
      'You may look up unfamiliar syntax on the reference card or Python documentation. Find the small instruction you need, try it with a simple value, then explain what it does. Functions and list comprehensions are not prerequisites.',
    ],syntax:[['print(value)','Display the value, followed by a new line.'],['name = value','Store a value under a meaningful name.'],['parts = input().split()','Read a line and split it into text items.'],['parts[0]','Read the first item; [1] is the second.'],['int(parts[0])','Convert that text item to a whole number.'],['# explanation','A comment for the reader; Python ignores it.']],
    example:'parts = "8 5".split()\nfirstDistance = int(parts[0])\nsecondDistance = int(parts[1])\ntotalDistance = firstDistance + secondDistance\nprint(totalDistance)',exampleOutput:'13',exampleNotes:['The example uses fixed text so you can predict it before reading keyboard input.', 'Change one value and predict the new total. In your exercise input() reads the provided line.'],
    questions:['What does = do?', 'What type of value does input() return?', 'Why does the first item use [0]?'],ready:'I can read one line, name converted values and predict what print displays.',
    exercises:[
      exercise(7,'Add two named distances','Read two non-negative distances on one line. Convert them, name them aliceDistance and bobDistance, add them and print totalDistance.',{sampleInput:'9 15\n',sampleOutput:'24',inputHelp:'One line: aliceDistance bobDistance. There is no n, city list or T in this smaller exercise.',tests:[tc('5 6','11'),tc('0 29','29'),tc('12 0','12')],beforeCoding:'Write the input numbers in two labelled boxes. Draw an arrow from each box to their combined total.'}),
      exercise(8,'Read the first input line','Read n, A and B from one line. Print n, then A, then B on separate lines.',{sampleInput:'7 -6 10\n',sampleOutput:'7\n-6\n10',inputHelp:'This exercise contains only the header n A B. No city list follows yet.',starter:'nAB = input().split()\n# Convert and name the three items.\n# Print n, A and B on separate lines.\n',tests:[tc('1 4 6','1\n4\n6'),tc('3 10 -2','3\n10\n-2'),tc('2 -1000000000 1000000000','2\n-1000000000\n1000000000')],beforeCoding:'Label each text item with its index before choosing the int() calls.'}),
    ],
  },
  {
    id:'tp-lists',title:'Prepare lists and endpoints',summary:'Convert and sort city coordinates, order the starts and guard empty groups.',image:'04-convert-list-items.png',imageWidth:1600,imageHeight:620,
    imageAlt:'Strings minus fifteen, minus six and minus one at indices zero, one and two are individually converted with int and stored back into the same list positions.',
    reading:[
      'Read the cities separately from the starting positions. A and B describe where the travellers begin; do not append them as extra cities. Every input city, including repeated coordinates, stays in the list.',
      'for index in range(n): visits the positions 0 through n − 1. Indent its repeated instruction by four spaces. Replace each string with int(cityPositions[index]), then call cityPositions.sort() once.',
      'Sort integers, not strings: text ordering can place "10" before "3". .sort() changes the existing list and does not return a new list. Write cityPositions.sort() on its own line.',
      'If A > B, use a temporary variable to put the smaller start into A and the larger into B. The algorithm uses A for the left starter and B for the right starter from then on; the people can be exchanged because the objective is their combined distance.',
      'At cut c, Alice’s endpoints are indices 0 and c − 1 only when c > 0. Bob’s endpoints are c and n − 1 only when c < n. An empty group has no endpoint to look up. The full program assigns that person distance zero.',
    ],syntax:[['for index in range(n):','Repeat for indices 0 to n − 1. Indent the loop body.'],['cityPositions[index] = int(cityPositions[index])','Convert and replace one item at the same position.'],['cityPositions.sort()','Sort the converted list in place.'],['if A > B:','Run the indented swap only when A is to the right of B.'],['temporary = A; A = B; B = temporary','Read these as three separate lines. temporary preserves the original A.'],['if cut > 0: / if cut < n:','Check the group is non-empty before selecting its endpoints.']],
    example:'positions = "10 -2 3".split()\nfor index in range(3):\n    positions[index] = int(positions[index])\npositions.sort()\nprint(positions)',exampleOutput:'[-2, 3, 10]',exampleNotes:['Each list item is converted and stored back. The sort happens once after conversion.', 'The largest valid index in a three-item list is 2. range(3) supplies 0, 1 and 2.'],
    questions:['What is the difference between an index and a coordinate?', 'Why convert before sorting?', 'Why must an empty group be checked before using an endpoint?'],ready:'I can prepare an integer list and select valid endpoints for a cut.',
    exercises:[
      exercise(9,'Convert and sort the cities','Read n, then n city coordinates on the next line. Convert each item in a loop, sort the integer list and print the list.',{sampleInput:'3\n10 -2 3\n',sampleOutput:'[-2, 3, 10]',inputHelp:'Line 1 is n only. Line 2 contains n cities. A and B are not used in this smaller exercise.',tests:[tc('4\n8 0 -15 -6','[-15, -6, 0, 8]'),tc('3\n3 10 2','[2, 3, 10]'),tc('4\n2 -2 2 0','[-2, 0, 2, 2]')],requireLoop:true,beforeCoding:'Write the positions 0 through n − 1 above the items. Predict which order changes after conversion and sorting.'}),
      exercise(10,'Put the left start first','Read A and B. If A > B, swap the values using temporary. Print A, then B, on separate lines.',{sampleInput:'8 -2\n',sampleOutput:'-2\n8',inputHelp:'One line contains two starting positions, A B. There are no cities in this exercise.',tests:[tc('4 6','4\n6'),tc('5 5','5\n5'),tc('-1 -9','-9\n-1')],requireCondition:true,beforeCoding:'Use three paper boxes named A, B and temporary. Move the values without losing either one.'}),
      exercise(11,'Identify the four endpoints','Read a header and city list, then one cut value. Prepare the list. Print Alice’s left and right endpoints, then Bob’s left and right endpoints, one per line. Print EMPTY twice for an empty group.',{sampleInput:sample+'2\n',sampleOutput:'-15\n-6\n-1\n12',inputHelp:'Line 1: n A B, with A ≤ B here. Line 2: n cities. Line 3: cut from 0 to n. The cut line is for practice only.',tests:[tc(sample+'0','EMPTY\nEMPTY\n-15\n12'),tc(sample+'7','-15\n12\nEMPTY\nEMPTY'),tc(sample+'3','-15\n-1\n0\n12'),tc('1 0 10\n5\n1','5\n5\nEMPTY\nEMPTY')],requireLoop:true,requireCondition:true,beforeCoding:'Draw the divider and label list indices first. Identify which group, if any, has no cities.',hints:['Alice uses [0] and [cut - 1] only when cut > 0. Otherwise print EMPTY twice.', 'Bob uses [cut] and [n - 1] only when cut < n. Otherwise print EMPTY twice.']}),
    ],
  },
  {
    id:'tp-journeys',title:'Calculate both journeys',summary:'Translate the two endpoint orders into abs(), min() and named distances.',image:'05-compare-endpoint-costs.png',imageWidth:1600,imageHeight:750,explorer:true,
    imageAlt:'At cut two Alice compares left end first eighteen with right end first nine. Bob compares left end first twenty four with right end first fifteen. The smaller distances are nine and fifteen.',
    reading:[
      'abs(first - second) measures the non-negative gap between two coordinates. The group width is right - left because the city list is sorted.',
      'goLeftFirst = abs(start - left) + (right - left) calculates the route through the left end first. goRightFirst uses the right end first. min(goLeftFirst, goRightFirst) chooses the smaller total.',
      'Set aliceDistance = 0 and bobDistance = 0 for each new cut. Only calculate endpoints for a non-empty group. This also handles a cut where one person does nothing.',
      'For this sample A = −6 and B = 10. At cut 2 Alice compares 18 with 9; Bob compares 24 with 15. Add the chosen 9 and 15, not all four route costs.',
    ],syntax:[['abs(start - left)','Find the distance from the start to the left end.'],['right - left','Find the width between the assigned endpoints.'],['min(goLeftFirst, goRightFirst)','Choose the smaller complete route cost.'],['totalDistance = aliceDistance + bobDistance','Combine the two chosen distances for this cut.']],
    example:'start = -3\nleft = 1\nright = 9\ngoLeftFirst = abs(start - left) + (right - left)\ngoRightFirst = abs(start - right) + (right - left)\nprint(goLeftFirst)\nprint(goRightFirst)\nprint(min(goLeftFirst, goRightFirst))',exampleOutput:'12\n20\n12',exampleNotes:['This is Try 5 expressed as Python. The cities stay at 1 and 9.', 'The two route costs are arithmetic results. We do not store a route containing every city.'],
    questions:['Which part of both expressions is the same?', 'What happens when left and right are the same city?', 'Which values are added to make this cut’s total?'],ready:'I can calculate both route orders and explain which distance is selected.',
    exercises:[
      exercise(12,'Calculate Alice’s minimum','Read the header, city list and one cut. Print Alice’s shortest distance for her assigned prefix. Print 0 if her group is empty.',{sampleInput:sample+'2\n',sampleOutput:'9',inputHelp:'Line 1: n A B with A ≤ B. Line 2: n cities. Line 3: cut. This extra cut line is only for practice.',tests:[tc(sample+'0','0'),tc(sample+'1','9'),tc(sample+'3','19'),tc(sample+'7','36'),tc('3 0 20\n-5 0 4\n3','13')],requireLoop:true,requireCondition:true,beforeCoding:'For cut 2, write Alice’s two endpoint coordinates and both route totals before coding.'}),
      exercise(13,'Calculate Bob and the combined total','Using the same input format, print Alice’s chosen distance, Bob’s chosen distance and their combined total on three separate lines.',{sampleInput:sample+'2\n',sampleOutput:'9\n15\n24',inputHelp:'Line 1: n A B with A ≤ B. Line 2: n cities. Line 3: cut. Print three numbers for this practice task.',tests:[tc(sample+'0','0\n29\n29'),tc(sample+'4','21\n6\n27'),tc(sample+'6','35\n2\n37'),tc(sample+'7','36\n0\n36')],requireLoop:true,requireCondition:true,beforeCoding:'Use the explorer to check one cut. Reset both person distances before calculating the new groups.'}),
    ],
  },
  {
    id:'tp-minimum',title:'Keep the smallest total',summary:'Start with the first calculated value and replace it only when a smaller one arrives.',image:'06-first-total-and-best.png',imageWidth:1600,imageHeight:1020,
    imageAlt:'Calculate a total. On the first cut store that total. On later cuts replace the best only when the new total is smaller. Candidate totals twenty nine, twenty nine, twenty four and thirty three produce best values twenty nine, twenty nine, twenty four and twenty four.',
    reading:[
      'We need a best value that comes from the actual input. Store the first calculated total as minimumDistance. Compare every later candidate with it.',
      'Starting the minimum at zero is incorrect when all journey costs are positive: no positive total can replace it. A made-up large value such as 10**30 is unnecessary when the first real total can initialise the variable.',
      'if cut == 0 recognises the first candidate. elif totalDistance < minimumDistance compares later candidates. == asks whether values are equal; = assigns a value.',
      'Keep only the best total. The complete program reuses the same few distance variables for the next cut. It stores the city list once, sorts it once, then performs constant work at each cut. We do not keep every route in memory.',
    ],syntax:[['if index == 0:','Identify the first value in this smaller minimum exercise.'],['minimumDistance = totalDistance','Store the first real candidate or a later improvement.'],['elif totalDistance < minimumDistance:','For later values, replace the best only if the candidate is smaller.'],['range(n + 1)','The full problem needs cut values 0 through n, including both empty-group cuts.']],
    example:'costs = [18, 15, 12, 20]\nfor index in range(4):\n    totalDistance = costs[index]\n    if index == 0:\n        minimumDistance = totalDistance\n    elif totalDistance < minimumDistance:\n        minimumDistance = totalDistance\n    print(minimumDistance)',exampleOutput:'18\n15\n12\n12',exampleNotes:['Printing inside the loop shows the changing best for learning.', 'The final question prints once after all cuts, so it displays only the last best value.'],
    questions:['Why can a first calculated total initialise the minimum?', 'Why would zero fail for positive route costs?', 'What stays in memory when the next cut is calculated?'],ready:'I can trace the minimum without a made-up initial upper limit.',
    exercises:[exercise(14,'Use the first real total','Read a count, then that many non-negative candidate costs. Use the first cost to initialise minimumDistance and compare the remaining costs. Print only the final minimum.',{sampleInput:'8\n29 29 24 33 27 34 37 36\n',sampleOutput:'24',inputHelp:'Line 1 is the number of costs. Line 2 contains those costs. This smaller exercise has no cities or starting positions.',tests:[tc('1\n29','29'),tc('4\n18 15 12 20','12'),tc('3\n5 5 5','5'),tc('3\n7 0 2','0'),tc('2\n2000000000 1000000000','1000000000')],requireLoop:true,requireCondition:true,beforeCoding:'Trace two columns: new cost and best so far. Include a one-cost list and a list containing zero.'})],
  },
  {
    id:'tp-test',title:'Repeat cases and test the boundaries',summary:'Place the loops, give one answer per case and repair a missing cut.',image:'07-loops-and-output.png',imageWidth:1600,imageHeight:770,
    imageAlt:'The outer loop repeats test cases. The inner loop repeats cuts. The final print is inside the case loop and outside the cut loop, with four leading spaces.',
    reading:[
      'T counts independent problems. Read it once. Inside for case in range(T): read a fresh header and city list, solve that case and print one final answer.',
      'The cut loop belongs inside the case loop. Each cut repeats a complete Alice and Bob calculation. The final print is outside the cut loop but still inside the case loop.',
      'A useful test catches a specific possible mistake. One city can reveal a missing outside cut. Reversed starts test the swap. Repeated cities test zero widths. Large and negative coordinates test the distance calculation.',
      'Try 16 supplies a single-case program with one bug: a missing cut. Predict a case where the omission changes the answer, run it and repair the loop. The last activity adds multiple cases to your working single-case solution.',
    ],syntax:[['T = int(input())','Read the number of independent cases.'],['for case in range(T):','Repeat the indented work once per case.'],['for cut in range(n + 1):','Inside a case, include all cuts from 0 to n.'],['print(minimumDistance)','Place it after the cut loop and inside the case loop.']],
    example:'T = 2\nfor case in range(T):\n    costs = [9, 15]\n    for index in range(2):\n        value = costs[index]\n        if index == 0:\n            best = value\n        elif value < best:\n            best = value\n    print(best)',exampleOutput:'9\n9',exampleNotes:['Each case starts its own search and prints one final value.', 'The fixed list isolates indentation. Your tasks will read different data for each case.'],
    questions:['Which work repeats for each case, and which for each cut?', 'Why is a one-city case useful?', 'Why can passing the sample be insufficient?'],ready:'I can explain the two loops and use a boundary test to diagnose a bug.',
    exercises:[
      exercise(15,'Repeat a small problem','Read T. For each case read A, B and one city coordinate on a single line. Print the smaller distance from Alice or Bob to that city.',{sampleInput:'2\n4 6 1\n-3 10 9\n',sampleOutput:'3\n1',inputHelp:'Line 1: T. Each following line: A B city. This smaller task always has exactly one city per case.',tests:[tc('1\n0 10 0','0'),tc('3\n4 6 1\n5 5 9\n10 -3 -4','3\n4\n1'),tc('2\n-1000000000 -1000000000 1000000000\n8 -2 4','2000000000\n4')],requireLoop:true,beforeCoding:'Draw a box around each independent input case. Predict how many output lines T requires.'}),
      exercise(16,'Repair a missing cut','The supplied single-case program omits the final cut. Find a test that exposes this, then repair the loop and print the minimum for one case.',{sampleInput:'1 4 6\n1\n',sampleOutput:'3',inputHelp:'This task reads ONE case: n A B, then the n cities. There is NO T line here. The final activity will add T.',starter:buggySingleCase,tests:[tc('1 4 6\n1','3'),tc('1 0 100\n-20','20'),tc(sample,'24'),tc('3 10 -3\n-4 0 12','7'),tc('2 5 5\n5 5','0')],requireNested:false,requireLoop:true,requireCondition:true,beforeCoding:'At the supplied one-city input, compare cut 0 with cut 1. Which one is missing from range(n)?',hints:['range(n) stops at n − 1. The outside cut after the last city is cut n.', 'Test a case where Alice should visit every city and Bob should do nothing.']}),
    ],
  },
  {
    id:'challenge',title:'Solve Two Pointers',summary:'Combine your own smaller solutions and explain the finished program.',image:'08-final-planning-board.svg',imageWidth:1600,imageHeight:780,
    imageAlt:'A blank planning board asks for the given counts and coordinates as input, the sorting, cut loop, two route comparisons and minimum tracking as processing, and one final distance per case as output.',
    reading:[
      'Use your working single-case program and the test-case loop you practised. Read T once. For each case, read and convert the input, sort the cities and order the two starts.',
      'Try all n + 1 cuts. Reset each person’s distance to zero. For a non-empty group, compare both endpoint route orders. Add the chosen distances.',
      'Use the first cut’s calculated total as minimumDistance. Compare later totals with the best so far. Print one integer for each case after all its cuts have been examined.',
      'The picture explains individual movements; the program calculates their costs. For n cities there are n + 1 cuts and at most four route-cost calculations per cut. The city list is stored once. Sorting takes O(n log n) time, the cut scan O(n) time, and the list O(n) memory.',
      'Use the tests to investigate your own program. The word “easy” is the original problem label, not an expectation about how quickly a beginner should finish. This pathway is intended for several sessions.',
    ],syntax:[],example:null,
    questions:['Where does your first minimum come from?', 'Why is an empty group safe?', 'Which test would catch a missing final cut or reversed starting positions?', 'Can you explain the input, process and output without reading the code aloud?'],ready:'I can explain, change and test my own complete solution.',
    exercises:[{...exercise('final','Two Pointers · Full past question','For each case find the smallest combined distance Alice and Bob need to visit every city.',{id:'two-pointers',sampleInput:'4\n'+sample+'2 -1000000000 -1000000000\n1000000000 -1000000000\n1 4 6\n1\n4 727 137\n39 852 201 696\n',sampleOutput:'24\n2000000000\n3\n413',inputHelp:'Line 1: T. Each case has a line n A B and a line of n city coordinates. Output T integers on separate lines. No extra cut input or explanatory prompts.',starter:'# Two Pointers easy version\n# Combine your input reader, single-case solution and case loop.\n# Use the first calculated total as the starting minimum.\n',tests:[tc('1\n1 4 6\n1','3'),tc('1\n7 -6 10\n'+sampleCities,'24'),tc('1\n3 10 -3\n-4 0 12','7'),tc('1\n2 5 5\n5 5','0'),tc('1\n2 -1000000000 -1000000000\n1000000000 -1000000000','2000000000'),tc('3\n1 0 100\n-20\n1 -10 0\n20\n2 -2 8\n-2 8','20\n20\n0')],requireLoop:true,requireCondition:true,hints:['Reuse Try 16 inside the case loop from Try 15. Remove the extra cut input used in Tries 11–13.', 'The city list contains only the supplied cities. Sort after converting its strings to integers.', 'Include cut 0 and cut n. Initialise with cut 0’s total, compare later totals, then print once.']})}],
  },
];
const reasoningVisuals=[
  ['try-01-one-city.svg','A number line from zero to seven marks city one, Alice at four and Bob at six. Count the distance from each start to the city.',730],
  ['try-02-distance.svg','Two opposite journeys connect minus three and five on numbered ticks. A further prompt asks how much movement is needed from two to two.',700],
  ['try-03-compare-plans.svg','Plan A sends Alice from zero to four and then minus five while Bob stays at ten. Plan B sends Alice to minus five and Bob to four. Totals are left blank.',700],
  ['try-04-count-cuts.svg','Three city cards at minus four, three and twelve have divider positions before, between and after them. Count the divider positions.',700],
  ['try-05-same-cities.svg','Two number lines keep the gold city markers at one and nine. The blue starting marker changes from five to minus three.',730],
  ['try-06-best-so-far.svg','Cut totals twenty nine, twenty nine, twenty four, thirty three, twenty seven, thirty four, thirty seven and thirty six have blank spaces for the best value seen so far.',700],
];
const paperPrompts=[
  {reading:['The input gives two starting positions and one city. Mark them on a number line. A starting position is where a person begins; it is not an extra city to visit.', 'Count the distance from each start to the city. One person can visit it while the other stays still. Add the distances actually travelled.', 'The output is the smallest combined distance. Neither person must return home.'], questions:['Which values are starting positions?', 'What answer is required?', 'How can one person’s journey have distance zero?']},
  {reading:['A coordinate is a place. Distance is the size of the gap between two places. Crossing zero does not make a distance negative.', 'Count the units from the start to zero, then from zero to the destination. Reversing the journey crosses the same gap.', 'Starting and finishing at the same coordinate requires no movement.'], questions:['What changes when the direction reverses?', 'Why do the first two journeys have equal distances?', 'What is the distance from a place to itself?']},
  {reading:['Both cities are initially nearer to Alice. That gives us a guess, but we must check the complete journeys.', 'In Plan A, Alice visits 4 and then −5. Add both movements. In Plan B, Alice visits −5 while Bob visits 4. Add the two people’s distances.', 'Compare the two complete totals. A nearby choice for one city can leave a longer journey later.'], questions:['What are the individual movements in each plan?', 'Which complete plan is shorter?', 'Why is a nearest-person guess not enough?']},
  {reading:['Sort the city cards from left to right. A cut is a divider between items in that list. Its value counts how many cities the left-starting person receives.', 'Include the gap before the first card and the gap after the last card. These cuts let one person receive no cities.', 'For n cities there are n + 1 cuts. A cut number is a count, not a city coordinate or the coordinate of the divider.'], questions:['What does cut 2 count?', 'Which cuts give an empty group?', 'Why are there more cuts than city cards?']},
  {reading:['The assigned city coordinates stay at 1 and 9. First use start 5, then use start −3. Change only the start.', 'Try start → left end → right end. Add those two movements. Then try start → right end → left end and add again.', 'Choose the smaller complete route. Travelling between the end cities passes all cities in between. You can finish at either end.'], questions:['Which values stay the same in both examples?', 'What is the width between the two cities?', 'Which route is shorter from −3, and why?']},
  {reading:['Every cut makes a complete candidate plan. For each person choose their shorter endpoint route, then add the two chosen distances.', 'Store the first calculated total as the first best value. For each later cut, replace the best only when its new total is smaller.', 'Keep candidate total and best so far in separate columns. Compare against the best, not only against the immediately previous candidate.'], questions:['Why does 24 stay best after seeing 33?', 'Why does the later 27 not become the best?', 'Which two different minimum comparisons happen in this method?']},
];
for(const [index,item] of activities.slice(0,2).flatMap(activity=>activity.exercises).entries()){
  const [image,imageAlt,imageHeight]=reasoningVisuals[index];
  item.visual={image,imageAlt,imageWidth:1600,imageHeight};
  Object.assign(item,paperPrompts[index]);
  item.syntax=[];
  item.explorer=index===5;
}
for(const item of activities[4].exercises)item.explorer=true;
activities.at(-1).exercises[0].title='Final challenge · Two Pointers';
const tasks=activities.flatMap((activity,index)=>activity.exercises.map(item=>({...item,activityId:activity.id,activityNumber:index+1})));
export const twoPointers={
  problemId:'two-pointers',problemTitle:'MCO 2023 A: Two Pointers (easy version)',shortTitle:'Two Pointers',storageField:'twoPointersWork',filePrefix:'MCO-Two-Pointers',imageDirectory:'mco-two-pointers',
  sectionId:'mco',sectionTitle:'MCO Tryout',sectionNumber:'MCO',
  description:'Build a solution through number lines, paper routes and sixteen small Try tasks, then solve the complete past question in Python.',
  activities,tasks,taskById:id=>tasks.find(item=>item.id===id),activityFor:id=>activities.find(activity=>activity.exercises.some(item=>item.id===id)),
  statement:{description:'Alice starts at A and Bob starts at B on a straight road. There are n cities at the supplied coordinates. Every city must be visited by at least one person, in any order. A city passed on a journey is visited. Either person may stay still, and neither has to return to their start. Find the minimum combined distance travelled.',input:'Read T test cases. For each case, read n A B followed by n city coordinates on the next line. Print one minimum combined distance per case on a separate line.',constraints:'1 ≤ T ≤ 100; 1 ≤ n ≤ 200,000; −10⁹ ≤ A, B and each city coordinate ≤ 10⁹. The sum of n across cases is at most 200,000.',tableCaption:'Original scoring groups',tableHead:['Subtask','Additional limits','Points'],tableRows:[['1','n ≤ 20; coordinates within ±10⁶','16'],['2','n ≤ 5000; coordinates within ±10⁶','36'],['3','n ≤ 5000','21'],['4','No additional limits','27']],note:'The four sample answers are shown below. These are classroom Python activities using the original problem; no code is submitted to an official judge. The 2023 contest archive specified C++ for official submissions.',sourceUrl:'https://codeforces.com/group/IO0c6wbyI8/contest/431909/problem/A',sourceLabel:'Read the original problem in the official contest archive ↗'},
};
