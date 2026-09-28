// Week 4 introduces selection, then combines it with loops in an MCC-style grid problem.
// Worked examples use different stories and data so pupils can study a pattern without
// receiving the answer to the task beside it.
export const curriculum = 'conditions-and-fences-v1';
export const levels = ['Pre-Bronze', 'Bronze', 'Silver', 'Gold'];

export const stages = [
  {id:'ready',label:'Return & goal',time:'0–2',title:'Decide, count and compare'},
  {id:'donow',label:'Do Now',time:'2–8',title:'Retrieve a running total'},
  {id:'focus',label:'Types of Learning',time:'8–10',title:'Choose today’s focus'},
  {id:'condition',label:'Teacher model',time:'10–16',title:'How Python makes a decision'},
  {id:'main1',label:'Main Task 1',time:'16–27',title:'Conditions and counting'},
  {id:'pitstop1',label:'Learning Pit Stop 1',time:'27–30',title:'Explain a condition'},
  {id:'grid',label:'MCC model',time:'30–37',title:'Rows, columns and missing cells'},
  {id:'main2',label:'Main Task 2',time:'37–50',title:'Building Fences progression'},
  {id:'pitstop2',label:'Learning Pit Stop 2',time:'50–54',title:'Explain an iteration'},
  {id:'plenary',label:'Plenary & save',time:'54–60',title:'One independent count'}
];

const common = {
  kind:'code',
  teacher:'Ask the pupil to point to the line that changes a variable, then explain one test with different data.'
};

export const main1 = [
  {...common,
    id:'w4-positive-scores',group:'main1',level:'Pre-Bronze',title:'Positive round scores',
    skills:'AQA-style selection · for + if + output',
    scenario:'A player can gain or lose points in each round. The results screen should show only the positive round scores.',
    reading:[
      'A condition is a question with a True or False answer. Python runs the indented line under if only when the answer is True.',
      'The loop visits one score at a time. The condition decides whether that score should be printed.'
    ],
    vocabulary:[['condition','a True-or-False test'],['selection','choosing which code runs'],['>','greater than']],
    goal:'Use a for loop and an if statement. Print every score greater than 0 on its own line, in the original order.',
    inputHelp:'No typed input. Keep the supplied roundScores assignment so the checker can try other lists.',
    dataDisplay:'roundScores = [5, -2, 0, 7]',sampleInput:'',sampleOutput:'5\n7',
    sampleExplanation:'5 and 7 are greater than zero. -2 and 0 do not pass the condition.',
    exampleTitle:'Worked example · warm temperatures',
    exampleScenario:'A weather display shows only temperatures of 25°C or above.',
    example:'temperatures = [18, 26, 23, 29]\n\nfor temperature in temperatures:\n    if temperature >= 25:\n        print(temperature)',
    exampleOutput:'26\n29',exampleInput:'',
    exampleSteps:[
      'Line 1 stores four temperatures.',
      'Iteration 1: temperature is 18. 18 >= 25 is False, so nothing prints.',
      'Iteration 2: temperature is 26. The condition is True, so 26 prints.',
      'Iteration 3: temperature is 23. The condition is False.',
      'Iteration 4: temperature is 29. The condition is True, so 29 prints.'
    ],
    starter:'roundScores = [5, -2, 0, 7]\n\n# Visit each score.\n# Print it only when it is positive.\n',
    hints:['Start with: for score in roundScores:', 'The print line belongs inside the if block, so it needs eight spaces.'],
    check:'w4-positive-scores',dataName:'roundScores',requireLoop:true,requireCondition:true,
    tests:[
      {data:[5,-2,0,7],expected:'5\n7'},
      {data:[-3,1,2],expected:'1\n2'},
      {data:[0,-1],expected:''},
      {data:[9],expected:'9'}
    ]
  },
  {...common,
    id:'w4-count-qualifiers',group:'main1',level:'Bronze',title:'Count qualifying scores',
    skills:'AQA-style selection · counter + if',
    scenario:'A score of 10 or more qualifies for the next round. The organiser needs one number: how many scores qualify?',
    reading:[
      'A counter remembers how many matches have been found. Set it to 0 before the loop.',
      'Inside the if block, add 1 for a qualifying score. Print once after the loop because only the final count is needed.'
    ],
    vocabulary:[['counter','a variable that increases by a fixed amount'],['>=','greater than or equal to'],['initialise','give a starting value']],
    goal:'Count the values in scores that are 10 or more. Print the final count once.',
    inputHelp:'No typed input. Keep the supplied scores assignment.',dataDisplay:'scores = [9, 12, 7, 15]',
    sampleInput:'',sampleOutput:'2',sampleExplanation:'12 and 15 qualify, so the final counter is 2.',
    exampleTitle:'Worked example · count older pupils',
    exampleScenario:'Count the ages that are 12 or above.',
    example:'ages = [9, 12, 14, 8]\neligibleCount = 0\n\nfor age in ages:\n    if age >= 12:\n        eligibleCount = eligibleCount + 1\n\nprint(eligibleCount)',
    exampleOutput:'2',exampleInput:'',
    exampleSteps:[
      'Line 2 starts eligibleCount at 0.',
      'Iteration 1: age is 9. The condition is False; the count stays 0.',
      'Iteration 2: age is 12. The condition is True; the count becomes 1.',
      'Iteration 3: age is 14. The condition is True; the count becomes 2.',
      'Iteration 4: age is 8. The condition is False; the count stays 2.',
      'After the loop, print the final count: 2.'
    ],
    starter:'scores = [9, 12, 7, 15]\nqualifyingCount = 0\n\n# Visit each score.\n# Add 1 when the score qualifies.\n\nprint(qualifyingCount)\n',
    hints:['The condition is score >= 10.', 'Only the counter update belongs inside the if block. Print after the loop.'],
    check:'w4-count-qualifiers',dataName:'scores',requireLoop:true,requireCondition:true,
    tests:[
      {data:[9,12,7,15],expected:'2'},
      {data:[10,10,4],expected:'2'},
      {data:[1,2],expected:'0'},
      {data:[20],expected:'1'}
    ]
  },
  {...common,
    id:'w4-total-positive',group:'main1',level:'Silver',title:'Total successful donations',
    skills:'Selection · conditional running total',
    scenario:'Positive numbers are successful donations. Zero and negative values are cancelled records. Find the total donated.',
    reading:[
      'A running total adds the current value, not just 1. The if statement protects the total from cancelled records.',
      'Initialise the total before the loop so it remembers the result from every earlier iteration.'
    ],
    vocabulary:[['running total','a value updated using each matching item'],['accumulator','another name for a running-total variable']],
    goal:'Add only the positive values in donations. Print the total once.',
    inputHelp:'No typed input. Keep the donations assignment.',dataDisplay:'donations = [5, 0, -2, 7]',
    sampleInput:'',sampleOutput:'12',sampleExplanation:'5 and 7 are positive. Their total is 12.',
    exampleTitle:'Worked example · total stock added',
    exampleScenario:'Positive stock changes are deliveries; negative changes are sales. Total only the deliveries.',
    example:'stockChanges = [4, -2, 0, 5]\ndeliveredTotal = 0\n\nfor change in stockChanges:\n    if change > 0:\n        deliveredTotal = deliveredTotal + change\n\nprint(deliveredTotal)',
    exampleOutput:'9',exampleInput:'',
    exampleSteps:[
      'Start deliveredTotal at 0.',
      'Iteration 1: change is 4. It is positive, so the total becomes 4.',
      'Iteration 2: change is -2. The condition is False; the total stays 4.',
      'Iteration 3: change is 0. The condition is False; the total stays 4.',
      'Iteration 4: change is 5. Add 5, so the total becomes 9.',
      'Print 9 after the loop.'
    ],
    starter:'donations = [5, 0, -2, 7]\ndonationTotal = 0\n\n# Add only successful donations.\n\nprint(donationTotal)\n',
    hints:['Test donation > 0.', 'Add donation to the total, not 1.'],
    check:'w4-total-positive',dataName:'donations',requireLoop:true,requireCondition:true,
    tests:[
      {data:[5,0,-2,7],expected:'12'},
      {data:[1,2,3],expected:'6'},
      {data:[0,-4],expected:'0'},
      {data:[12,-8,4],expected:'16'}
    ]
  },
  {...common,
    id:'w4-count-range',group:'main1',level:'Gold',title:'Scores inside a target range',
    skills:'Compound condition · and · boundary tests',
    scenario:'The target band includes scores from 10 to 20. Both boundary values count.',
    reading:[
      'A compound condition joins two True-or-False questions. With and, both parts must be True.',
      'Inclusive means the boundaries count, so use >= for 10 and <= for 20.'
    ],
    vocabulary:[['compound condition','two or more tests joined together'],['and','True only when both sides are True'],['inclusive','including the boundary values']],
    goal:'Count values from 10 through 20 inclusive. Print the count once.',
    inputHelp:'No typed input. Keep the targetScores assignment.',dataDisplay:'targetScores = [9, 10, 14, 20, 21]',
    sampleInput:'',sampleOutput:'3',sampleExplanation:'10, 14 and 20 are inside the inclusive range.',
    exampleTitle:'Worked example · comfortable temperatures',
    exampleScenario:'Count temperatures from 20°C through 24°C inclusive.',
    example:'temperatures = [18, 20, 22, 24, 25]\ncomfortableCount = 0\n\nfor temperature in temperatures:\n    if temperature >= 20 and temperature <= 24:\n        comfortableCount = comfortableCount + 1\n\nprint(comfortableCount)',
    exampleOutput:'3',exampleInput:'',
    exampleSteps:[
      'Start comfortableCount at 0.',
      'Iteration 1: 18 fails the lower test, so the count stays 0.',
      'Iteration 2: 20 passes both tests, so the count becomes 1.',
      'Iteration 3: 22 passes both tests, so the count becomes 2.',
      'Iteration 4: 24 passes both tests, so the count becomes 3.',
      'Iteration 5: 25 fails the upper test. Print the final count 3.'
    ],
    starter:'targetScores = [9, 10, 14, 20, 21]\ntargetCount = 0\n\n# Count scores inside the inclusive range.\n\nprint(targetCount)\n',
    hints:['Write both comparisons around and.', 'Test 10 and 20: each must be included.'],
    check:'w4-count-range',dataName:'targetScores',requireLoop:true,requireCondition:true,requireAnd:true,
    tests:[
      {data:[9,10,14,20,21],expected:'3'},
      {data:[10,20],expected:'2'},
      {data:[0,9,21],expected:'0'},
      {data:[15,15,30],expected:'2'}
    ]
  }
];

export const main2 = [
  {...common,
    id:'w4-one-column',group:'main2',level:'Pre-Bronze',title:'One fence column',
    skills:'MCC preparation · count missing cells',
    scenario:'A column contains fence cells (#) and grass cells (.). Every grass cell needs one new fence.',
    reading:[
      'Treat each symbol as data. A dot means one fence is missing; a hash means a fence already exists.',
      'This first task is one column only. Count dots exactly as you counted matching numbers.'
    ],
    vocabulary:[['cell','one position in a grid'],['column','cells arranged vertically'],['symbol','a character used to represent something']],
    goal:'Count the dots in fenceColumn. Print the number of fences that must be added.',
    inputHelp:'No typed input. Keep the fenceColumn assignment.',dataDisplay:"fenceColumn = ['.', '#', '.', '#']",
    sampleInput:'',sampleOutput:'2',sampleExplanation:'Two cells contain a dot, so two fences are missing.',
    exampleTitle:'Worked example · unavailable seats',
    exampleScenario:'A dot marks an unavailable seat. Count the dots in one row.',
    example:"seats = ['X', '.', '.', 'X']\nunavailableCount = 0\n\nfor seat in seats:\n    if seat == '.':\n        unavailableCount = unavailableCount + 1\n\nprint(unavailableCount)",
    exampleOutput:'2',exampleInput:'',
    exampleSteps:[
      'Start unavailableCount at 0.',
      "Iteration 1: seat is X, so seat == '.' is False.",
      "Iteration 2: seat is ., so the count becomes 1.",
      "Iteration 3: seat is ., so the count becomes 2.",
      "Iteration 4: seat is X. The count stays 2, then 2 is printed."
    ],
    starter:"fenceColumn = ['.', '#', '.', '#']\nmissingCount = 0\n\n# Count the grass cells.\n\nprint(missingCount)\n",
    hints:["Compare the current cell with '.'.", 'Add 1 only for a grass cell.'],
    check:'w4-one-column',dataName:'fenceColumn',requireLoop:true,requireCondition:true,
    tests:[
      {data:['.','#','.','#'],expected:'2'},
      {data:['#','#'],expected:'0'},
      {data:['.','.','.'],expected:'3'},
      {data:['#','.'],expected:'1'}
    ]
  },
  {...common,
    id:'w4-each-column',group:'main2',level:'Bronze',title:'Count every column',
    skills:'MCC preparation · nested loops',
    scenario:'The field is stored as a list of columns. Find how many fences each column is missing.',
    reading:[
      'The outer loop chooses one column. For that column, reset missingCount to 0.',
      'The inner loop visits every cell in the current column. This is a nested loop: one loop inside another.'
    ],
    vocabulary:[['outer loop','the loop that chooses a whole group'],['inner loop','the loop that visits items inside that group'],['nested','placed inside another block']],
    goal:'Use nested loops. Print the missing-fence count for each column on its own line.',
    inputHelp:'No typed input. Keep the fenceColumns assignment.',dataDisplay:"fenceColumns = [['.', '#', '.'], ['#', '#', '.'], ['#', '#', '#']]",
    sampleInput:'',sampleOutput:'2\n1\n0',sampleExplanation:'The three columns need 2, 1 and 0 new fences.',
    exampleTitle:'Worked example · locker repairs',
    exampleScenario:'Each locker bank is a list. A dot marks one locker needing repair.',
    example:"lockerBanks = [['.', 'X'], ['X', 'X'], ['.', '.']]\n\nfor bank in lockerBanks:\n    repairCount = 0\n    for locker in bank:\n        if locker == '.':\n            repairCount = repairCount + 1\n    print(repairCount)",
    exampleOutput:'1\n0\n2',exampleInput:'',
    exampleSteps:[
      'Outer iteration 1 selects the first bank and resets repairCount to 0.',
      'Inner iteration 1.1 visits a dot, so repairCount becomes 1.',
      'Inner iteration 1.2 visits X, so repairCount stays 1. Print 1.',
      'Outer iteration 2 selects the second bank and resets the count.',
      'Inner iteration 2.1 visits X, so repairCount stays 0.',
      'Inner iteration 2.2 visits X, so repairCount stays 0. Print 0.',
      'Outer iteration 3 selects the third bank and resets the count.',
      'Inner iteration 3.1 visits a dot, so repairCount becomes 1.',
      'Inner iteration 3.2 visits a dot, so repairCount becomes 2. Print 2.'
    ],
    starter:"fenceColumns = [['.', '#', '.'], ['#', '#', '.'], ['#', '#', '#']]\n\n# Outer loop: choose a column.\n# Reset its count.\n# Inner loop: inspect every cell.\n# Print this column's result.\n",
    hints:['Reset missingCount after selecting each new column.', 'The inner for line and its if block need deeper indentation.'],
    check:'w4-each-column',dataName:'fenceColumns',requireLoop:true,requireCondition:true,requireNested:true,
    tests:[
      {data:[['.','#','.'],['#','#','.'],['#','#','#']],expected:'2\n1\n0'},
      {data:[['.'],['#']],expected:'1\n0'},
      {data:[['.','.'],['#','.']],expected:'2\n1'},
      {data:[['#','#','#']],expected:'0'}
    ]
  },
  {...common,
    id:'w4-best-column',group:'main2',level:'Silver',title:'Choose the best column',
    skills:'MCC preparation · nested loops + minimum',
    scenario:'You may complete just one vertical wall. Choose the column needing the fewest new fences.',
    reading:[
      'First calculate one missing count. Then compare it with the best count seen so far.',
      'Set bestMissing to a value larger than any possible answer. A column has four cells here, so 5 is a safe starting value.'
    ],
    vocabulary:[['minimum','the smallest value'],['best so far','the smallest value found up to this iteration'],['sentinel value','a safe starting value outside the possible answers']],
    goal:'Count the dots in every column. Print only the smallest missing-fence count.',
    inputHelp:'No typed input. Each column has four cells. Keep the fenceColumns assignment.',dataDisplay:"fenceColumns = [['.', '.', '#', '.'], ['#', '.', '#', '#'], ['.', '.', '.', '.']]",
    sampleInput:'',sampleOutput:'1',sampleExplanation:'The columns need 3, 1 and 4 fences. The minimum is 1.',
    exampleTitle:'Worked example · best locker bank',
    exampleScenario:'A 0 marks an empty locker. Find the bank with the fewest empty lockers.',
    example:'lockerBanks = [[0, 0, 1], [1, 1, 0], [0, 0, 0]]\nbestEmpty = 4\n\nfor bank in lockerBanks:\n    emptyCount = 0\n    for locker in bank:\n        if locker == 0:\n            emptyCount = emptyCount + 1\n    if emptyCount < bestEmpty:\n        bestEmpty = emptyCount\n\nprint(bestEmpty)',
    exampleOutput:'1',exampleInput:'',
    exampleSteps:[
      'Start bestEmpty at 4, which is larger than one bank of three lockers.',
      'Outer iteration 1 resets emptyCount. Inner iteration 1.1 sees 0 and changes it to 1.',
      'Inner iteration 1.2 sees 0 and changes the count to 2. Inner iteration 1.3 sees 1, so it stays 2.',
      '2 < 4 is True, so bestEmpty becomes 2.',
      'Outer iteration 2 resets emptyCount. Inner iterations 2.1 and 2.2 see 1; iteration 2.3 sees 0 and makes the count 1.',
      '1 < 2 is True, so bestEmpty becomes 1.',
      'Outer iteration 3 resets emptyCount. Inner iterations 3.1, 3.2 and 3.3 each see 0, so the count reaches 3.',
      '3 < 1 is False. The best stays 1, which is printed after both loops.'
    ],
    starter:"fenceColumns = [['.', '.', '#', '.'], ['#', '.', '#', '#'], ['.', '.', '.', '.']]\nbestMissing = 5\n\n# For each column, count its dots.\n# Update bestMissing when this count is smaller.\n\nprint(bestMissing)\n",
    hints:['The count resets for every column; bestMissing does not.', 'Compare after the inner loop has finished counting the whole column.'],
    check:'w4-best-column',dataName:'fenceColumns',requireLoop:true,requireCondition:true,requireNested:true,
    tests:[
      {data:[['.','.','#','.'],['#','.','#','#'],['.','.','.','.']],expected:'1'},
      {data:[['#','#'],['.','#']],expected:'0'},
      {data:[['.','.'],['.','.']],expected:'2'},
      {data:[['.','#','#'],['.','.','#'],['#','#','.']],expected:'1'}
    ]
  },
  {...common,
    id:'w4-building-fences',group:'main2',level:'Gold',title:'MCC 2025 P1 · Building Fences',
    skills:'Past-question adaptation · input grid + nested loops + minimum',
    scenario:'A field has N rows and M columns. A dot is grass and a hash is an existing fence. Find the fewest fences needed to complete one vertical wall.',
    reading:[
      'Competition input stores the grid as rows, even though the answer is about columns. Use rowIndex and columnIndex to visit gridRows[rowIndex][columnIndex].',
      'The outer loop can choose a column. The inner loop then travels down all rows in that column. Keep only the smallest missing count.'
    ],
    vocabulary:[['grid','data arranged in rows and columns'],['index','a position number starting at 0'],['constraint','a limit that helps you judge whether an algorithm is suitable']],
    goal:'Read N, M and the N grid rows. Print the minimum number of dots in any one column.',
    inputHelp:'Line 1: N and M. Next N lines: M characters made from . and #. Print one integer only.',
    sampleInput:'4 5\n.....\n...#.\n.##..\n...#.\n',sampleOutput:'2',
    sampleExplanation:'The five columns need 4, 3, 3, 2 and 4 fences. The minimum is 2.',
    exampleTitle:'Worked example · cinema columns',
    exampleScenario:'Read a seating grid. A dot is an empty seat. Find the column with the fewest empty seats.',
    example:"dimensions = input().split()\nrowCount = int(dimensions[0])\ncolumnCount = int(dimensions[1])\nseatRows = []\nfor rowIndex in range(rowCount):\n    seatRows.append(input())\n\nbestEmpty = rowCount + 1\nfor columnIndex in range(columnCount):\n    emptyCount = 0\n    for rowIndex in range(rowCount):\n        if seatRows[rowIndex][columnIndex] == '.':\n            emptyCount = emptyCount + 1\n    if emptyCount < bestEmpty:\n        bestEmpty = emptyCount\n\nprint(bestEmpty)",
    exampleInput:'3 4\nX..X\nXX.X\n.X.X\n',exampleOutput:'0',
    exampleSteps:[
      'Read 3 rows and 4 columns, then store each row.',
      'Outer iteration 1 selects column 0. Inner iteration 1.1 sees X; 1.2 sees X; 1.3 sees a dot and makes emptyCount 1. bestEmpty becomes 1.',
      'Outer iteration 2 selects column 1. Inner iteration 2.1 sees a dot and counts 1; 2.2 sees X; 2.3 sees a dot and counts 2. The best stays 1.',
      'Outer iteration 3 selects column 2. Inner iterations 3.1, 3.2 and 3.3 each see a dot, so emptyCount becomes 3. The best stays 1.',
      'Outer iteration 4 selects column 3. Inner iterations 4.1, 4.2 and 4.3 each see X, so emptyCount stays 0. bestEmpty becomes 0.',
      'Print 0. No answer can be smaller, but the simple loop still checks every column.'
    ],
    starter:"dimensions = input().split()\nrowCount = int(dimensions[0])\ncolumnCount = int(dimensions[1])\nfieldRows = []\nfor rowIndex in range(rowCount):\n    fieldRows.append(input())\n\n# Try each column.\n# Count grass cells down that column.\n# Keep the smallest count.\n",
    hints:['Use for columnIndex in range(columnCount): for the outer loop.', "The current cell is fieldRows[rowIndex][columnIndex]. Compare it with '.'."],
    check:'w4-building-fences',requireLoop:true,requireCondition:true,requireNested:true,needsInput:true,
    source:'Adapted from Malaysian Computing Challenge 2025 Problem 1: Building Fences.',
    tests:[
      {input:'4 5\n.....\n...#.\n.##..\n...#.\n',expected:'2'},
      {input:'2 2\n##\n##\n',expected:'0'},
      {input:'3 1\n.\n#\n.\n',expected:'2'},
      {input:'2 3\n...\n#.#\n',expected:'1'}
    ]
  }
];

export const warmups = [{...common,
  id:'w4-warmup',group:'donow',level:null,title:'Training minutes total',skills:'Retrieval · loop + running total',
  scenario:'Three training activities lasted 3, 2 and 4 minutes. Find the total time.',
  reading:['A running total starts before the loop, changes once per iteration and is printed after the loop. This retrieves the Week 2 pattern you will reuse today.'],
  vocabulary:[['iteration','one visit through a loop'],['running total','a total updated one item at a time']],
  goal:'Use a for loop to total trainingMinutes. Print the final total once.',inputHelp:'No typed input. Keep the trainingMinutes assignment.',
  dataDisplay:'trainingMinutes = [3, 2, 4]',sampleInput:'',sampleOutput:'9',sampleExplanation:'3 + 2 + 4 = 9.',
  exampleTitle:'Worked example · pages read',exampleScenario:'Total the pages read over three days.',
  example:'pagesRead = [2, 5, 1]\ntotalPages = 0\n\nfor pages in pagesRead:\n    totalPages = totalPages + pages\n\nprint(totalPages)',exampleInput:'',exampleOutput:'8',
  exampleSteps:['Start totalPages at 0.','Iteration 1 adds 2, so the total becomes 2.','Iteration 2 adds 5, so the total becomes 7.','Iteration 3 adds 1, so the total becomes 8.','After the loop, print 8.'],
  starter:'trainingMinutes = [3, 2, 4]\ntotalMinutes = 0\n\n# Add each activity time.\n\nprint(totalMinutes)\n',
  hints:['Update totalMinutes inside the loop.', 'Print only after all three iterations.'],
  check:'w4-warmup',dataName:'trainingMinutes',requireLoop:true,
  tests:[{data:[3,2,4],expected:'9'},{data:[0,5],expected:'5'},{data:[7],expected:'7'}]
}];

export const plenary = {...common,
  id:'w4-exit',group:'plenary',level:null,title:'Exit ticket · available computers',skills:'Independent condition + counter',
  scenario:'A value of 1 means a computer is available; 0 means it is unavailable.',
  reading:['Use one counter, one loop and one condition. This is your independent evidence: first explain the pattern to yourself, then code it.'],
  vocabulary:[['evidence','something that shows what you can explain or do independently']],
  goal:'Count the 1 values in computerStatus. Print the final count once.',inputHelp:'No typed input. Keep the computerStatus assignment.',
  dataDisplay:'computerStatus = [1, 0, 1, 1, 0]',sampleInput:'',sampleOutput:'3',sampleExplanation:'Three values are equal to 1.',
  exampleTitle:'Worked example · open rooms',exampleScenario:'A letter O means a room is open. Count the open rooms.',
  example:"roomStatus = ['O', 'C', 'O']\nopenCount = 0\n\nfor status in roomStatus:\n    if status == 'O':\n        openCount = openCount + 1\n\nprint(openCount)",exampleInput:'',exampleOutput:'2',
  exampleSteps:['Start openCount at 0.','Iteration 1 is O, so the count becomes 1.','Iteration 2 is C, so the count stays 1.','Iteration 3 is O, so the count becomes 2.','Print 2 after the loop.'],
  starter:'computerStatus = [1, 0, 1, 1, 0]\navailableCount = 0\n\n# Count the available computers.\n\nprint(availableCount)\n',
  hints:['Compare each status with 1.', 'Add 1 for a match; print after the loop.'],
  check:'w4-exit',dataName:'computerStatus',requireLoop:true,requireCondition:true,
  tests:[{data:[1,0,1,1,0],expected:'3'},{data:[0,0],expected:'0'},{data:[1,1],expected:'2'}]
};

export const challenges = [...main1,...main2];
export const tasks = [...challenges,...warmups,plenary];
export const taskById = id => tasks.find(task=>task.id===id);
export const checkSpec = task => ({
  tests:task.tests||[],dataName:task.dataName,
  requireLoop:!!task.requireLoop,requireCondition:!!task.requireCondition,
  requireNested:!!task.requireNested,requireAnd:!!task.requireAnd
});
