export const problemId = 'building-fences';
export const problemTitle = 'MCC 2025 P1: Building Fences';
export const sourceUrl = 'https://ioimalaysia.org/competition/mcc/2025/archive/p1/';
const field = '3 4\n.#..\n##.#\n.#..\n';
const costs = '5\n4\n3\n3\n2\n4\n';
const sample = '4 5\n.....\n...#.\n.##..\n...#.\n';
const task = (id, title, goal, inputHelp, sampleInput, sampleOutput, starter, tests, options = {}) => ({
  id, title, goal, inputHelp, sampleInput, sampleOutput, starter, tests,
  check: `mcc-${id}`, hints: ['Write the input, processing and output in words.', 'Try one small input by hand. Compare it with what your code prints.'], ...options,
});

export const activities = [
  {
    id: 'input', title: 'Decode the input', summary: 'Turn a line of text into numbers you can use.',
    image: '01-unpack-the-input.png', imageAlt: 'Input 3 4 becomes the string "3 4", then the list ["3", "4"]. Index 0 selects "3" and index 1 selects "4". int converts them into n = 3 and m = 4. Multiplication outputs 12.',
    reading: ['input() reads one line as text. A line containing 3 5 is still text until you convert its parts.', '.split() separates a line at whitespace. Use index 0 for its first item and index 1 for its second. int() converts numeric text into an integer.'],
    syntax: [['input()', 'Read one line as text.'], ['.split()', 'Separate text into a list of words or numeric text.'], ['parts[0]', 'Access the first item; positions start at zero.'], ['int(text)', 'Convert text such as "7" into the integer 7.'], ['print(value)', 'Display a value.'], ['*', 'Multiply two numbers.']],
    example: 'parts = "7 2".split()\nfirst = int(parts[0])\nsecond = int(parts[1])\nprint(first + second)', exampleInput: '', exampleOutput: '9',
    exampleNotes: ['The split produces two strings: "7" and "2".', 'The two int() calls produce numbers that can be added.'],
    questions: ['What is the difference between "3" and 3?', 'Which part of the input tells you the number of rows?'],
    ready: 'I can read two numbers on one line and explain why split and int do different jobs.',
    exercises: [
      task('double', 'A · Read one number', 'Read one whole number and print twice its value.', 'One line contains a whole number.', '6\n', '12', '# Read one number.\n# Print twice its value.\n', [{input:'1\n',expected:'2'},{input:'9\n',expected:'18'},{input:'0\n',expected:'0'}]),
      task('add-parts', 'B · Separate two numbers', 'Read two whole numbers on the same line and print their sum.', 'One line contains two whole numbers separated by a space.', '3 5\n', '8', '# Read and split the line.\n# Convert the parts into numbers, then add them.\n', [{input:'2 7\n',expected:'9'},{input:'10 3\n',expected:'13'},{input:'0 0\n',expected:'0'}]),
      task('dimensions', 'C · Describe a field', 'Print the number of rows, the number of columns and the total number of cells, each on a separate line.', 'This exercise reads only the two dimensions. No grid rows follow yet.', '3 5\n', '3\n5\n15', '# Read the dimensions.\n# Print rows, columns and their product on separate lines.\n', [{input:'1 1\n',expected:'1\n1\n1'},{input:'2 7\n',expected:'2\n7\n14'},{input:'6 6\n',expected:'6\n6\n36'}]),
    ],
  },
  {
    id: 'symbols', title: 'Count a chosen symbol', summary: 'Visit characters, make a decision and update a counter.',
    image: '02-pointer-and-counter.png', imageAlt: 'A pointer visits the characters dot, hash, dot, hash at indices 0 to 3. The counter afterwards is 1, 1, 2, 2. A dot increases the counter; a hash leaves it unchanged. Assignment stores a value; double equals compares values.',
    reading: ['A string is a sequence of characters. A for loop can visit each one, even when the input has a different length.', 'A counter starts at zero and increases by one for each match. = stores a value; == compares values. A colon starts a block, and indentation shows which instructions belong to it.'],
    syntax: [['for symbol in text:', 'Visit each character in text. Indent the repeated instructions.'], ['if symbol == ".":', 'Run the indented instruction only for a dot.'], ['total = 0', 'Start the counter before the loop.'], ['total = total + 1', 'Read the old value, add one and store the new value.'], ['"#"', 'A hash inside quotes is text. A hash outside a string starts a comment.']],
    example: 'text = "ABBA"\ntotal = 0\nfor symbol in text:\n    if symbol == "A":\n        total = total + 1\nprint(total)', exampleInput: '', exampleOutput: '2',
    exampleNotes: ['The example counts the letter A. The counter after each character is 1, 1, 1, 2.', 'The final print is outside the loop, so it displays one final count.'],
    questions: ['What happens when no characters match?', 'Why should the counter start before the loop?'],
    ready: 'I can trace a counter and explain why it changes for a dot but not a hash.',
    exercises: [
      task('characters', 'A · Visit every character', 'Read a string of dots and hashes. Print each character on its own line.', 'One line contains at least one dot or hash.', '.#.#\n', '.\n#\n.\n#', '# Read the string.\n# Visit and print each character.\n', [{input:'#\n',expected:'#'},{input:'..#\n',expected:'.\n.\n#'},{input:'#.#.\n',expected:'#\n.\n#\n.'}], {requireLoop:true}),
      task('only-dots', 'B · Make a decision', 'Read a string. Print only its dots, one dot per line. If there are no dots, print nothing.', 'One line contains only dots and hashes.', '.##.\n', '.\n.', '# Read the string.\n# Print a character only if it is a dot.\n', [{input:'####\n',expected:''},{input:'.\n',expected:'.'},{input:'#..#\n',expected:'.\n.'}], {requireLoop:true,requireCondition:true}),
      task('count-dots', 'C · Keep a count', 'Read a string and print the number of dots it contains.', 'One line contains only dots and hashes.', '.##...\n', '4', '# Start a counter.\n# Count matching characters.\n# Print the final count.\n', [{input:'####\n',expected:'0'},{input:'....\n',expected:'4'},{input:'.#.#\n',expected:'2'},{input:'.\n',expected:'1'}], {requireLoop:true,requireCondition:true}),
    ],
  },
  {
    id: 'minimum', title: 'Find the smallest cost', summary: 'Store several values and remember the smallest so far.',
    image: '03-smallest-so-far.png', imageAlt: 'The costs 4, 3, 3, 2, 4 are checked in order. The smallest afterwards is 4, 3, 3, 2, 2. A separate append example adds 2 to [4, 3]. range(5) provides 0, 1, 2, 3, 4.',
    reading: ['A list stores several values. Start with [] and append one value at a time. range(number) lets you repeat reading a known number of times.', 'To find a minimum, treat the first value as the smallest so far. Compare each cost with it and update when a lower value appears. Equal costs do not require a change.'],
    syntax: [['costs = []', 'Create an empty list.'], ['costs.append(value)', 'Add one value at the end of a list.'], ['for turn in range(number):', 'Repeat number times; the positions run from 0 to number - 1.'], ['smallest = costs[0]', 'Use the first stored cost as the starting minimum.'], ['if cost < smallest:', 'Check whether the current cost is lower.']],
    example: 'numbers = [8, 5, 9]\nsmallest = numbers[0]\nfor number in numbers:\n    if number < smallest:\n        smallest = number\nprint(smallest)', exampleInput: '', exampleOutput: '5',
    exampleNotes: ['Start with 8. Checking 8 leaves it at 8; checking 5 changes it to 5; checking 9 leaves it at 5.', 'Starting at zero would give the wrong answer for this list of positive values.'],
    questions: ['Why does range(5) stop before 5?', 'What if the lowest cost appears twice?'],
    ready: 'I can read several costs and explain how the smallest-so-far value changes.',
    exercises: [
      task('store-costs', 'A · Read and store costs', 'Read the number of repair jobs, followed by that many costs. Store the costs in a list and print that list.', 'The first line is the number of costs (at least one). Each following line contains one non-negative cost.', costs, '[4, 3, 3, 2, 4]', '# Read how many costs follow.\n# Store each cost in a list, then print the list.\n', [{input:'1\n7\n',expected:'[7]'},{input:'3\n0\n5\n0\n',expected:'[0, 5, 0]'},{input:'2\n12\n2\n',expected:'[12, 2]'}], {requireLoop:true}),
      task('cheapest', 'B · Choose the cheapest', 'Read the repair costs and print only the smallest cost.', 'The format is the same as part A. There is always at least one cost.', costs, '2', '# Read and store the costs.\n# Compare them and print the smallest.\n', [{input:'1\n7\n',expected:'7'},{input:'3\n4\n4\n4\n',expected:'4'},{input:'4\n3\n8\n0\n5\n',expected:'0'},{input:'3\n9\n7\n2\n',expected:'2'}], {requireLoop:true}),
    ],
  },
  {
    id: 'columns', title: 'Explore a field by columns', summary: 'Store rows, select a column and repeat the counting.',
    image: '04-grid-and-nested-loops.png', imageAlt: 'The grid rows are ".#..", "##.#" and ".#..". Column indices are 0 to 3 and row indices 0 to 2. Index 2 is the third column and contains three dots. grid[1][3] is a hash. Counts for the four columns are 2, 0, 3, 2. The counter resets once per new column.',
    reading: ['Read N and M first, then read N row strings into a list. Keep every dot and hash: they describe the contents of the field.', 'grid[row][column] first selects a row string, then a character within it. Keep the column fixed and change the row to travel downwards.', 'To count every column, put the row loop inside a column loop. Reset the counter once for each new column, then print after its row loop has finished.'],
    syntax: [['grid.append(input())', 'Read and store one whole row string.'], ['grid[row][column]', 'Select a row first, then a character.'], ['range(n)', 'Visit row indices 0 to n - 1.'], ['range(m)', 'Visit column indices 0 to m - 1.'], ['A loop inside a loop', 'For each column, repeat the row visits.'], ['missing = 0', 'Place this inside the column loop and before the row loop.']],
    example: 'board = ["ABCD", "EFGH", "IJKL"]\nfor row in board:\n    print(row[2])', exampleInput: '', exampleOutput: 'C\nG\nK',
    exampleNotes: ['The selected position is always index 2, the third character.', 'The row changes from ABCD to EFGH to IJKL, so the output travels down a column.'],
    questions: ['Which index stays fixed as you travel down one column?', 'Why must each column get a fresh counter?'],
    ready: 'I can read a field, count one column and restart the counter for the next column.',
    exercises: [
      task('store-field', 'A · Read the whole field', 'Read the dimensions and all N row strings into a list. Then print the first row string.', 'The first line is N M. The next N lines each contain M dots and hashes.', field, '.#..', '# Read N and M.\n# Store all N rows.\n# Print the first row.\n', [{input:'1 1\n#\n',expected:'#'},{input:'2 5\n..#.#\n#####\n',expected:'..#.#'},{input:'3 2\n##\n..\n.#\n',expected:'##'}], {requireLoop:true}),
      task('visit-column', 'B · Visit the third column', 'Read the field and print the third character from every row, one per line. Use column index 2.', 'The field has at least three columns. Read every row after N M.', field, '.\n.\n.', '# Store the field.\n# Keep column index 2 fixed while visiting every row.\n', [{input:'2 4\n..#.\n....\n',expected:'#\n.'},{input:'1 3\n###\n',expected:'#'},{input:'4 3\n...\n###\n..#\n...\n',expected:'.\n#\n#\n.'}], {requireLoop:true}),
      task('count-column', 'C · Count the third column', 'Read the field and print how many dots are in its third column (index 2).', 'The field has at least three columns.', field, '3', '# Start a counter for column index 2.\n# Count its dots down the rows.\n', [{input:'2 4\n..#.\n....\n',expected:'1'},{input:'1 3\n###\n',expected:'0'},{input:'4 3\n...\n###\n..#\n...\n',expected:'2'}], {requireLoop:true,requireCondition:true}),
      task('all-columns', 'D · Count every column', 'Read the field. Print the number of dots in each column from left to right, one count per line.', 'Fields may be rectangular. Reset the count for each new column.', field, '2\n0\n3\n2', '# For each column, start a fresh counter.\n# Visit its rows and count dots.\n# Print that column count.\n', [{input:'1 1\n#\n',expected:'0'},{input:'2 3\n...\n...\n',expected:'2\n2\n2'},{input:'2 4\n..#.\n#...\n',expected:'1\n2\n1\n2'},{input:'3 2\n.#\n.#\n##\n',expected:'2\n0'}], {requireNested:true}),
    ],
  },
  {
    id: 'challenge', title: 'Building Fences', summary: 'Combine your skills to solve the original past question.',
    image: '05-mcc-planning-board.png', imageAlt: 'An unfilled planning board with the original sample input and field. Input prompts ask what numbers and symbols mean and how to store them. Process prompts ask for smaller jobs, remembered values and repetition. Output prompts ask for the required answer, predicted result and checking method.',
    reading: ['Use your input, processing and output plan to decide which earlier skills to combine. Your notes, diagrams and practice programs are available during this preparation activity.', 'This activity uses the original input format. The first line gives the dimensions; the dots and hashes in the following lines give the contents of every cell.'],
    syntax: [], example: null,
    questions: ['Which earlier activities contain useful skills?', 'How can you explain why your method always finds the minimum?', 'What tests will distinguish counting across rows from counting down columns?'],
    ready: 'I can explain my method and test it on unfamiliar fields.',
    exercises: [task('building-fences', problemTitle, 'Find the minimum number of new fences needed to complete at least one vertical column.', 'The first line contains N M. The next N lines each contain M characters: . for grass and # for an existing fence. Print one integer.', sample, '2', '# MCC 2025 P1: Building Fences\n# Plan the input, smaller processing jobs and output first.\n# Then write and test your own solution.\n', [
      {input:'1 1\n.\n',expected:'1'}, {input:'1 1\n#\n',expected:'0'},
      {input:'3 4\n....\n....\n....\n',expected:'3'},
      {input:'3 2\n.#\n.#\n.#\n',expected:'0'},
      {input:'2 4\n..#.\n#...\n',expected:'1'},
      {input:'4 1\n.\n#\n.\n#\n',expected:'2'},
      {input:'3 3\n#..\n.#.\n..#\n',expected:'2'},
    ], {hints:['Return to the activity that counts dots in columns.', 'Return to the activity that compares costs. Decide which values your final answer should compare.', 'Check the required output carefully. A column number and a fence count are different answers.']})],
  },
];

export const tasks = activities.flatMap((activity, index) => activity.exercises.map(exercise => ({...exercise, activityId:activity.id, activityNumber:index+1})));
export const taskById = id => tasks.find(item => item.id === id);
export const activityFor = id => activities.find(item => item.exercises.some(exercise => exercise.id === id));
export const checkSpec = item => ({tests:item.tests, requireAnd:!!item.requireAnd, requireLoop:!!item.requireLoop, requireCondition:!!item.requireCondition, requireNested:!!item.requireNested});
export const scoringTasks = [[1,6],[2,6],[3,20],[4,20],[5,150],[6,200],[7,500],[8,500],[9,500],[10,800]];
export const buildingFences = {
  problemId,problemTitle,shortTitle:'Building Fences',storageField:'mccWork',filePrefix:'MCC-Building-Fences',imageDirectory:'mcc-building-fences',
  description:'A field contains grass and existing fences. Build the skills to find the cheapest vertical wall.',
  activities,tasks,taskById,activityFor,
  statement:{description:'A grassy field is represented by N rows and M columns. Each cell is grass (.) or an existing fence (#). You can turn any number of grass cells into fences. Find the minimum number of new fences needed to make one complete vertical column of fences.',input:'The first line contains N and M. Each of the next N lines contains M dots or hashes. Output one integer: the minimum number of new fences needed.',constraints:'1 ≤ N, M ≤ 800. The grid contains only . and #.',tableCaption:'Official scoring groups · 10 points each',tableHead:['Task','Maximum N and M'],tableRows:scoringTasks,note:'These are scoring groups for the same problem. Your method should handle fields of different sizes. The classroom checks below are separate from the official judge.',sourceUrl,sourceLabel:'Read the official MCC 2025 question ↗'},
};
