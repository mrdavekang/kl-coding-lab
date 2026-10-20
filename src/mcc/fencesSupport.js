// Give first-time writers one small, named edit in a runnable program.
// Existing exercise IDs and goals stay the same, so earlier work remains valid.
const visual=(image,imageAlt)=>({image,imageAlt,imageWidth:1000,imageHeight:400});
const pictures={
  print:visual('small-print.svg','print("#") sends a hash to the Python Shell. Change the symbol inside the quotes to a dot.'),
  input:visual('small-input.svg','Type .#. into the Shell. input() stores that text as row. print(row) displays the same text.'),
  numbers:visual('small-number.svg','input reads the text 6. int changes it into the number 6. Multiplying by two gives 12.'),
  split:visual('small-split.svg','The line 3 5 splits into two text items. Index zero selects 3 and index one selects 5. int makes each a number.'),
  loop:visual('small-loop.svg','for symbol in row visits dot, hash and dot in order. print(symbol) prints the character currently being visited.'),
  counter:visual('small-counter.svg','For the characters dot, hash and dot, a counter starting at zero becomes one, stays one, then becomes two.'),
  repeat:visual('small-repeat.svg','range(3) gives three turns: zero, one and two. print("#") runs once per turn.'),
  list:visual('small-list.svg','An empty list becomes [4] after appending 4, then [4, 2] after appending 2.'),
  minimum:visual('small-minimum.svg','Smallest starts at 4. Checking 3 changes it to 3. Checking 2 changes it to 2. A larger value leaves it unchanged.'),
  column:visual('small-column.svg','Rows .#.., ##.# and .#.. form a field. Index 2 selects the third character of every row: dot, dot, dot.'),
  columns:visual('small-columns.svg','For the same three by four field, count down each column separately. The counts from left to right are 2, 0, 3 and 2.'),
  final:visual('small-wall.svg','The original sample has column repair counts 4, 3, 3, 2 and 4. The fourth column needs two new fences, the smallest count.'),
};
const reader='parts = input().split()\nn = int(parts[0])\nm = int(parts[1])\ngrid = []\nfor rowNumber in range(n):\n    row = input()\n    grid.append(row)\n';
const costs='number = int(input())\ncosts = []\nfor turn in range(number):\n    cost = int(input())\n    costs.append(cost)\n';
const entry=(id,title,goal,sampleInput,sampleOutput,starter,tests,options={})=>({id,title,goal,inputHelp:'',sampleInput,sampleOutput,starter,tests,check:`mcc-${id}`,hints:[],...options});
const supports={
  'fence-print':{
    reading:['A dot means grass. A hash means a fence is already there. print() makes Python show something in the Shell.'],
    syntax:[['print(".")','Show the dot inside the quotes. Keep both quotes and brackets.']],
    visual:pictures.print,guideLine:1,change:'Click inside the quotes on line 1. Replace # with . and keep both quotes. Then choose Run Module.',
    ipo:['Nothing to type into the Shell yet.','Tell Python which symbol to show.','One dot.'],
    explain:'What did you change inside the quotes?',edit:['#','.'],
  },
  'fence-input':{
    reading:['The code is ready. Run it, type .#. in the Shell and press Enter. Python stores your text under the name row.'],
    syntax:[['row = input()','Wait for one line from the keyboard and remember it as row.'],['print(row)','Show the text remembered as row.']],
    visual:pictures.input,guideLine:null,change:'Run the ready-made code. When the Shell waits, type .#. and press Enter. Then run again with ###.',
    ipo:['One line of dots and hashes.','Remember that line as row.','Show the same line.'],
    explain:'Where did you type the dots and hashes?',
  },
  double:{
    reading:['The first line already reads a whole number. Your only job is to make the last line print twice that number.'],
    syntax:[['int(input())','Read text from the keyboard and turn it into a whole number.'],['number * 2','Multiply the number by two.']],
    starter:'number = int(input())\nprint(number)\n',guideLine:2,visual:pictures.numbers,
    change:'On line 2, change print(number) to print(number * 2).',
    ipo:['One whole number, such as 6.','Multiply it by two.','The doubled number: 12.'],explain:'If the input is 4, what should appear?',edit:['print(number)','print(number * 2)'],
  },
  'add-parts':{
    reading:['The first three lines are ready. They read two numbers from one line and name them first and second.'],
    syntax:[['.split()','Separate the two items at the space.'],['first + second','Add the two numbers.']],
    starter:'parts = input().split()\nfirst = int(parts[0])\nsecond = int(parts[1])\nprint(first)\n',guideLine:4,visual:pictures.split,
    change:'On line 4, change print(first) to print(first + second).',
    ipo:['Two numbers on one line: 3 5.','Add the numbers.','Their sum: 8.'],explain:'Why do we need both first and second?',edit:['print(first)','print(first + second)'],
  },
  dimensions:{
    reading:['The reading code is ready. n means rows and m means columns. The program already prints both; add the number of cells.'],
    syntax:[['n * m','Rows multiplied by columns gives the number of cells.']],
    starter:'parts = input().split()\nn = int(parts[0])\nm = int(parts[1])\nprint(n)\nprint(m)\nprint(n)\n',guideLine:6,visual:pictures.split,
    change:'On line 6 only, change print(n) to print(n * m).',
    ipo:['The row and column counts: 3 5.','Work out 3 times 5.','Print 3, then 5, then 15, on separate lines.'],explain:'What do n and m tell us about a field?',edit:['print(n)\nprint(m)\nprint(n)','print(n)\nprint(m)\nprint(n * m)'],
  },
  characters:{
    reading:['for visits the characters one at a time. symbol is the character being visited now. The indented line belongs to the loop.'],
    syntax:[['for symbol in row:','Visit each character in row.'],['    print(symbol)','Print the current character, with four spaces before print.']],
    starter:'row = input()\nfor symbol in row:\n    print(row)\n',guideLine:3,visual:pictures.loop,
    change:'On line 3, change print(row) to print(symbol). Keep the four spaces at the start.',
    ipo:['One line, such as .#..','Visit one character at a time.','Print each character on its own line.'],explain:'What does symbol contain on the second turn?',edit:['print(row)','print(symbol)'],
  },
  'only-dots':{
    reading:['if asks a yes-or-no question. == means “is this the same as?”. The extra indentation means print only happens when the answer is yes.'],
    syntax:[['if symbol == ".":','Only run the next indented instruction for a dot.']],
    starter:'row = input()\nfor symbol in row:\n    if symbol == "#":\n        print(symbol)\n',guideLine:3,visual:pictures.loop,
    change:'On line 3, change only "#" to ".". We want to print grass cells.',
    ipo:['Dots and hashes, such as .##..','Ask whether each character is a dot.','Print only the dots, one per line.'],explain:'What should happen when the current character is #?',edit:['"#"','"."'],
  },
  'count-dots':{
    reading:['A counter remembers how many dots we have found. Start at zero. Each dot adds one; a hash leaves the counter alone.'],
    syntax:[['total = 0','No dots have been counted yet.'],['total = total + 1','Add one to the count and remember the new value.']],
    starter:'row = input()\ntotal = 1\nfor symbol in row:\n    if symbol == ".":\n        total = total + 1\nprint(total)\n',guideLine:2,visual:pictures.counter,
    change:'On line 2, change total = 1 to total = 0. Then try the input ### as well as the sample.',
    ipo:['One line of dots and hashes.','Add one for every dot.','One final count.'],explain:'Why must the counter start at zero?',edit:['total = 1','total = 0'],
  },
  'fence-repeat':{
    reading:['Sometimes we know how many turns we need. range(number) gives that many turns. The turn names start at zero, but there are still number turns.'],
    syntax:[['for turn in range(number):','Repeat the indented instruction number times.']],
    visual:pictures.repeat,guideLine:2,change:'On line 2, replace 2 with number, so the keyboard input controls how many fences are printed.',
    ipo:['A number of turns, such as 3.','Repeat once for each turn.','Print # three times, on separate lines.'],explain:'How many lines should print for input 1?',edit:['range(2)','range(number)'],
  },
  'store-costs':{
    reading:['A list keeps several values together. [] starts an empty list. append adds one item at the end. Most of the reading code is already done.'],
    syntax:[['costs.append(cost)','Keep this cost in the list.'],['int(input())','Store a number rather than numeric text.']],
    starter:costs.replace('cost = int(input())','cost = input()')+'print(costs)\n',guideLine:4,visual:pictures.list,
    change:'On line 4, change input() to int(input()). This makes each stored cost a number.',
    ipo:['How many costs, then one cost on each line.','Read each number and append it.','Print the list of numbers.'],explain:'What happens to a list when we append an item?',edit:['cost = input()','cost = int(input())'],
  },
  cheapest:{
    reading:['smallest remembers the cheapest cost seen so far. Only replace it when a lower cost appears. The symbol < means “less than”.'],
    syntax:[['smallest = costs[0]','Begin with the first cost.'],['if cost < smallest:','Is the new cost cheaper than the remembered one?']],
    starter:costs+'smallest = costs[0]\nfor cost in costs:\n    if cost > smallest:\n        smallest = cost\nprint(smallest)\n',guideLine:8,visual:pictures.minimum,
    change:'On line 8, change > to <. We want a smaller cost to replace smallest.',
    ipo:['A list of costs.','Keep the smallest cost seen so far.','Print just the cheapest cost.'],explain:'Should a bigger cost replace smallest?',edit:['cost > smallest','cost < smallest'],
  },
  'store-field':{
    reading:['Now read a real field. The first line gives n and m. Each later input() reads a whole row, including every dot and hash.'],
    syntax:[['grid.append(row)','Keep the row we have just read.'],['grid[0]','Select the first stored row.']],
    starter:reader.replace('grid.append(row)','grid.append("")')+'print(grid[0])\n',guideLine:7,visual:pictures.input,
    change:'On line 7, replace "" with row, so grid.append(row) keeps the actual row.',
    ipo:['n m, then n rows of dots and hashes.','Keep each row in grid.','Print the first row.'],explain:'Which input lines describe the contents of the field?',edit:['grid.append("")','grid.append(row)'],
  },
  'visit-column':{
    reading:['Each stored row is a line of characters. Index 0 is the first character; 1 is the second; 2 is the third. Choose the same index in every row to travel down a column.'],
    syntax:[['row[2]','Select the third character of this row.']],
    starter:reader+'for row in grid:\n    print(row[0])\n',guideLine:9,visual:pictures.column,
    change:'On line 9, change row[0] to row[2]. Keep that same position in every row.',
    ipo:['The complete field.','Take the third character from each row.','Print those characters down the third column.'],explain:'Why do we use 2 for the third column?',edit:['row[0]','row[2]'],
  },
  'count-column':{
    reading:['Reuse your dot counter, but look only at row[2]. The counter increases only when that third character is grass.'],
    syntax:[['if row[2] == ".":','Does this row have grass in its third position?']],
    starter:reader+'missing = 0\nfor row in grid:\n    if row[2] == "#":\n        missing = missing + 1\nprint(missing)\n',guideLine:10,visual:pictures.column,
    change:'On line 10, change "#" to ".". Count the grass cells that need new fences.',
    ipo:['The complete field.','Count dots down column index 2.','Print one count.'],explain:'Does an existing # need a new fence?',edit:['== "#"','== "."'],
  },
  'all-columns':{
    reading:['The inner loop already counts one column. The outer loop repeats that job for each column. missing = 0 is inside the outer loop, so every column starts with a fresh count.'],
    syntax:[['for column in range(m):','Use column positions 0 to m - 1.'],['row[column]','Look at this column in the current row.']],
    starter:reader+'for column in range(1):\n    missing = 0\n    for row in grid:\n        if row[column] == ".":\n            missing = missing + 1\n    print(missing)\n',guideLine:8,visual:pictures.columns,
    change:'On line 8, change range(1) to range(m). There are m columns to check.',
    ipo:['The complete field.','Count each column separately.','Print one dot count per column.'],explain:'Why does each column need a fresh zero?',edit:['range(1)','range(m)'],
  },
  'building-fences':{
    reading:['This supported program combines the earlier pieces. It reads the field, counts each column and remembers the smallest count. Your last job is to choose which remembered value to print.'],
    syntax:[['missing','The count for the column just visited.'],['smallest','The lowest column count found anywhere in the field.']],
    starter:reader+'smallest = n\nfor column in range(m):\n    missing = 0\n    for row in grid:\n        if row[column] == ".":\n            missing = missing + 1\n    if missing < smallest:\n        smallest = missing\nprint(missing)\n',guideLine:16,visual:pictures.final,
    change:'On the last line, change print(missing) to print(smallest). Then explain why these values can be different.',
    ipo:['n m and every row of dots and hashes.','Count grass in each column; keep the smallest count.','One number: the fewest new fences needed.'],
    explain:'For the sample, why do we print 2 instead of the last column’s count, 4?',edit:['print(missing)','print(smallest)'],
  },
};

export function supportFenceWriters(activities){
  activities[0].title='Start with two Python lines';
  activities[0].summary='Run ready-made code, then change one small thing.';
  activities[0].exercises.unshift(
    entry('fence-print','A · Show one symbol','Make the Shell show one dot. Change only the symbol inside the quotes.','','.','print("#")\n',[{input:'',expected:'.'}],{fixedOutput:true,inputHelp:'No keyboard input is needed for this first program.'}),
    entry('fence-input','B · Type a row into the Shell','Run the supplied code and type a row. Watch Python show the same row back.','.#.\n','.#.','row = input()\nprint(row)\n',[{input:'###\n',expected:'###'},{input:'.\n',expected:'.'},{input:'..##\n',expected:'..##'}],{inputHelp:'Type one line of dots and hashes when the Shell waits.'}),
  );
  activities[0].exercises.slice(2).forEach((item,i)=>{item.title=String.fromCharCode(67+i)+item.title.slice(1);});
  activities[1].title='Visit, choose, count';activities[1].summary='Change one line at a time to build a dot counter.';
  activities[2].title='Repeat and remember';activities[2].summary='Keep the reading code. Practise repeating, storing and comparing.';
  activities[2].exercises.unshift(entry('fence-repeat','A · Repeat one instruction','Print one # per line, as many times as the input number says.','3\n','#\n#\n#','number = int(input())\nfor turn in range(2):\n    print("#")\n',[{input:'1\n',expected:'#'},{input:'4\n',expected:'#\n#\n#\n#'},{input:'0\n',expected:''}],{requireLoop:true,inputHelp:'One line gives the number of turns.'}));
  activities[2].exercises.slice(1).forEach((item,i)=>{item.title=String.fromCharCode(66+i)+item.title.slice(1);});
  activities[3].title='One column, then the next';activities[3].summary='The field-reading code is supplied. Focus on one highlighted line.';
  activities[4].summary='Finish a supported solution, explain it, then try again with less help.';
  activities[4].ready='I can explain what the supported program does and why it prints the smallest column count.';
  for(const activity of activities)for(const item of activity.exercises){
    const support=supports[item.id];Object.assign(item,support);
    item.questions=[support.explain];
    item.hints=[support.change,support.syntax.map(([code,meaning])=>`${code} — ${meaning}`).join(' ')];
  }
}
