const flow=(caption,panels)=>({kind:'flow',caption,panels:panels.map(([label,...lines])=>({label,lines}))});
const table=(caption,headers,rows)=>({kind:'table',caption,headers,rows});
const image=(caption,name,alt)=>({kind:'image',caption,name,alt});
const lesson=(title,reading,diagram)=>({title,reading,diagram});

export const bishopIntroductions={
 'bb-print':lesson('Tell Python what to display',[
  'A program is a set of instructions. Python follows them from top to bottom. print() tells Python to display something in the Shell, the area where results appear.',
  'Put text inside matching quotes, inside the round brackets. In print("Hello"), the word Hello is displayed. The brackets and quotes help Python read your instruction; they are not displayed.'
 ],flow('Read the instruction on the left, then look at what appears in the Shell.',[['PYTHON EDITOR','print("Hello")'],['PYTHON SHELL','Hello'],['JOB: OUTPUT','Show a result.','No keyboard input is needed.']])),
 'bb-input':lesson('Read a word and remember it',[
  'input() waits for you to type a line and press Enter. name = input() stores that line using the variable name name. A variable is a name for a remembered value. The = sign stores the value on its right using the name on its left.',
  'print(name) displays the remembered value. print("name") displays the literal word name instead. Look carefully for the quotes before you type.'
 ],flow('The typed word travels into a variable, then back out to the Shell.',[['INPUT','You type: Dragon'],['REMEMBER','name = input()','name now holds "Dragon"'],['OUTPUT','print(name)','Dragon']])),
 'bb-int':lesson('Turn number text into a whole number',[
  'Even when you type a digit, input() first gives Python text. The text "2" and the whole number 2 are different kinds of value. Use int(...) to turn suitable number text into an integer, which is a whole number.',
  'Read int(input()) from the inside out: input() receives the text, then int(...) converts it. You can now add 1. A + sign adds numbers when both values are numbers.'
 ],flow('Convert the input before doing arithmetic.',[['INPUT: TEXT','You type: 2','input() gives "2"'],['PROCESS: CONVERT','int("2") gives 2'],['PROCESS: ADD','2 + 1 gives 3'],['OUTPUT','print(column + 1)','3']])),
 'bb-split':lesson('One line can hold several items',[
  'The line 4 1 3 contains three items separated by spaces. input() reads the whole line as text. Adding .split() separates it into a list of text items.',
  'A list keeps items in order. Square brackets surround the displayed list, and commas separate its items. The quotes around each item show that split() has kept it as text. It has not converted the items to whole numbers yet.'
 ],flow('Spaces separate the items; their order stays the same.',[['INPUT','4 1 3'],['PROCESS','input().split()'],['LIST OF TEXT ITEMS',"['4', '1', '3']"]])),
 'bb-first':lesson('Find an item by its index',[
  'An index is an item’s position in a list. Python starts list indices at 0: first item 0, second item 1, third item 2. The index is a position, not the value stored there.',
  'parts[0] means “look up the item at index 0 in parts”. If parts contains ["6", "1", "3"], that item is "6". The board’s column labels start at 1; the input list’s indices start at 0.'
 ],{kind:'index',caption:'Follow index 0 down to its stored value. Index 0 holds "6", not zero.',values:['6','1','3'],selected:0}),
 'bb-three':lesson('Give each input item its own name',[
  'The case line has a fixed order: N is the number of columns, X is the starting row, and Y is the starting column. After split(), these items have indices 0, 1 and 2.',
  'Use int(parts[0]) to convert the first item, and store it in N. Repeat for X and Y using their own indices. The variable name goes on the left of =; the value to remember goes on the right.'
 ],{kind:'index',caption:'Each index selects a text item. int(...) converts it before its variable stores it.',values:['6','1','3'],selected:2,names:['N = 6','X = 1','Y = 3']}),
 'bb-position':lesson('Read a square as row, then column',[
  'A coordinate names a square. In this question, (X, Y) means (row, column). Row 1 is at the bottom and row 2 is at the top. Columns increase from left to right.',
  'On this five-column board, (2, 2) is in the top row, second column. N tells you the board’s width; it is not part of the bishop’s coordinate. print(X, Y) displays two values with a space between them.'
 ],image('Find the row first. Then find the column. B marks their meeting square.','bishop-coordinates','A five-column board. Row 2 is above row 1. The bishop B is at row 2, column 2.')),
 'bb-other-row':lesson('Switch between the two rows',[
  'A diagonal step changes the row. There are only two rows, so moving from row 1 reaches row 2, and moving from row 2 reaches row 1.',
  'The calculation 3 - X makes this swap. If X is 1, it gives 2. If X is 2, it gives 1. In X = 3 - X, Python uses the old X on the right, calculates the new value, then stores it back in X.'
 ],table('The number 3 is used in the calculation. It is not a third board row.',['Starting row X','Calculation','Other row'],[['1','3 - 1','2'],['2','3 - 2','1']])),
 'bb-left-column':lesson('Left means one smaller',[
  'Column numbers increase from left to right. Moving one column left makes the column number one smaller. From column 4, the next column on the left is 3.',
  'A minus sign means subtract. Y - 1 calculates the left-hand column. This exercise asks for the column number only; we will combine it with a row change later.'
 ],flow('Follow the change in the column number.',[['START','column = 4'],['PROCESS: MOVE LEFT','4 - 1'],['NEW COLUMN','3']])),
 'bb-right-column':lesson('Right means one larger',[
  'Moving one column right makes the column number one larger. From column 3, the next column on the right is 4.',
  'Y + 1 calculates that neighbour. This exercise promises a right-hand neighbour exists. Soon you will also check whether a move would leave the board.'
 ],flow('The + 1 changes the column by one place.',[['START','column = 3'],['PROCESS: MOVE RIGHT','3 + 1'],['NEW COLUMN','4']])),
 'bb-diagonal':lesson('A diagonal move changes both coordinates',[
  'You have practised the two changes separately. A diagonal step needs both of them at once: switch rows and move one column. Keeping the same row would make a sideways move.',
  'From (2, 3), a right diagonal step reaches (1, 4). The new row is 3 - 2 and the new column is 3 + 1. In print(3 - X, Y + 1), the comma separates the two values to display.'
 ],flow('Track the row and column separately, then join them into a coordinate.',[['START: (2, 3)','X = 2','Y = 3'],['PROCESS','New row: 3 - 2 = 1','New column: 3 + 1 = 4'],['DESTINATION: (1, 4)','print(3 - X, Y + 1)','1 4']])),
 'bb-left-edge':lesson('Ask whether a left-hand column exists',[
  'The first board column is 1. A step left from column 1 would reach column 0, which is outside the board. A left step needs Y > 1. The > symbol means “greater than”.',
  'A comparison gives True or False. if checks that result. A colon starts its block, and four spaces indent the instructions that belong to it. else runs its block when the comparison is false. Your task will display YES or NO.'
 ],table('Only one branch runs for each value of Y.',['Y','Is Y > 1?','Task output'],[['1','False: no column on the left','NO'],['2','True: column 1 is on the left','YES']])),
 'bb-right-edge':lesson('Check against the last column',[
  'N is the last column number. A bishop at column N cannot move to column N + 1. A right neighbour exists only when Y < N. The < symbol means “less than”.',
  'Compare Y with N before choosing YES or NO. Equality is not enough: when Y equals N, you are already at the right edge. Keep the two possible outputs inside their separate indented blocks.'
 ],table('Here the board has five columns.',['N','Y','Is Y < N?','Task output'],[['5','4','True: column 5 exists','YES'],['5','5','False: column 6 is outside','NO']])),
 'bb-start-count':lesson('Count a square even when there are no moves',[
  'Reachable means the bishop can be on that square after zero or more moves. Zero moves leaves it on its starting square, so the starting square counts.',
  'A one-column board has two squares, one in each row. Neither diagonal move stays on the board. You must block the other square, but the bishop can still stay where it started: zero moves, one reachable square.'
 ],image('Count the square marked B. The blocked square is not counted.','bishop-start','A one-column, two-row board. The bishop occupies the bottom square and the top square is blocked. One square remains reachable.')),
 'bb-repeat':lesson('Repeat an indented instruction',[
  'A for loop repeats a block of instructions. range(2) supplies two turn values, 0 and 1, so its loop body runs twice. The turn name can be used to remember which turn is happening.',
  'The colon ends the for line. The four spaces before print put it inside the loop. An unindented instruction after the loop runs once when the loop finishes. Your task reads T and repeats MOVE that many times.'
 ],flow('Both turns run the same indented print instruction.',[['LOOP','for turn in range(2):','    print("MOVE")'],['TWO TURNS','turn = 0: print MOVE','turn = 1: print MOVE'],['OUTPUT: TWO LINES','MOVE','MOVE']])),
 'bb-left-places':lesson('Include the first number, stop before the last',[
  'range(start, stop) supplies whole numbers beginning with start and stopping before stop. For example, range(1, 4) supplies 1, 2 and 3. It does not supply 4.',
  'To visit columns 1 through Y, including Y, set the stop value to Y + 1. If Y is 3, range(1, Y + 1) becomes range(1, 4). The loop prints each supplied column on its own line.'
 ],{kind:'range',caption:'range(1, 4) includes 1, 2 and 3. The stop value 4 is excluded.',start:1,stop:4}),
 'bb-zigzag':lesson('Follow one turn at a time',[
  'First print the starting coordinate. For each step left, replace X with 3 - X and replace Y with Y - 1. Then print the updated coordinate. The order matters: update first, display second.',
  'From column 4, there are three moves to column 1. range(Y - 1) sets up those three loop turns before Y starts changing. The start plus those three destinations makes four printed coordinates.'
 ],table('Follow the row swap and column subtraction through this small route.',['Moment','Row X','Column Y','Printed coordinate'],[['Start','2','4','2 4'],['Move 1','1','3','1 3'],['Move 2','2','2','2 2'],['Move 3','1','1','1 1']])),
 'bb-left-count':lesson('Use the column number as a count',[
  'The left route uses one square in every column from the start to column 1. Starting in column 4 visits columns 4, 3, 2 and 1. That is four reachable squares.',
  'There are only three moves between those four squares. This task asks for squares, so keep the start in your count. left = Y remembers the whole left-route count without making a list or tracing every move.'
 ],image('Four squares, three moves. Include B when you count.','bishop-zigzag','The zigzag from row 2, column 4 reaches columns 4, 3, 2 and 1. Four squares include the start.')),
 'bb-right-count':lesson('Subtraction counts gaps; add the starting square',[
  'From column Y to column N, the number of moves right is N - Y. The number of visited squares is one larger, because the starting square counts before any move.',
  'With N = 6 and Y = 3, the route uses columns 3, 4, 5 and 6. There are three gaps and four squares. Calculate right = N - Y + 1. The + 1 also makes the right-edge case count its starting square.'
 ],image('Read the right route as 3, 4, 5, 6: four squares including both ends.','bishop-counts','For N equal to 6 and Y equal to 3, the left count is 3 and the right count is 6 minus 3 plus 1, which is 4.')),
 'bb-keep-side':lesson('Name the side you keep',[
  'Blocking the first diagonal square on one side stops the bishop travelling along that side. The bishop can still use the other side. To leave fewer reachable squares, keep the shorter side and block the opposite direction.',
  'left <= right asks whether left is smaller than or equal to right. In this exercise, print LEFT when that is true, including a tie. LEFT names the side kept; it does not name the square you block.'
 ],image('Keeping the left route means blocking to the right. Compare the two remaining counts.','bishop-block','For N equal to 6 with the bishop at row 1, column 3, blocking row 2, column 4 leaves three reachable squares. Blocking row 2, column 2 instead leaves four.')),
 'bb-best-if':lesson('Store the count chosen by the comparison',[
  'You can now choose a side. Next, remember its count. In an if/else block, only the branch whose condition applies runs. Both branches can store their chosen value using the same name, answer.',
  'For left = 2 and right = 4, left <= right is true, so answer becomes 2. Put print(answer) after the block, without indentation, to display whichever value was chosen. On a one-column board both counts are 1.'
 ],table('Trace one decision. The else branch is skipped in this example.',['Instruction','What happens'],[['left = 2; right = 4','Two counts are ready.'],['if left <= right:','2 <= 4 is True.'],['    answer = left','Store 2 in answer.'],['else: answer = right','Skipped for these counts.'],['print(answer)','Display 2.']])),
 'bb-min':lesson('Give min() the two counts',[
  'min(left, right) returns the smaller of its two values. A comma separates the values inside its round brackets. The result can be stored in answer or passed straight to print().',
  'This does the comparison you already built using if/else. With left = 4 and right = 3, min(left, right) gives 3. min() chooses a value; print() is the instruction that displays it.'
 ],flow('Choosing and displaying are two different jobs.',[['TWO VALUES','left = 4','right = 3'],['PROCESS: CHOOSE','min(left, right)','Returns 3.'],['OUTPUT: DISPLAY','print(min(left, right))','3']])),
 'bb-test-count':lesson('Separate the case count from the board data',[
  'A test case is one separate puzzle. The first input line T says how many cases follow. T is not a row or column. Convert it with int(input()) so range(T) can repeat the right number of times.',
  'If T is 2, the loop turn values are 0 and 1. This practice displays caseNumber + 1 to show case labels 1 and 2. Later, the final answer will be a reachable-square count rather than a case label.'
 ],table('Turn values start at zero. These displayed case labels start at one.',['T','Loop value caseNumber','caseNumber + 1'],[['2','0: first turn','1'],['2','1: second turn','2']])),
 'bb-many-rows':lesson('Read a fresh line on every turn',[
  'Each call to input() reads the next line. Read T before the loop. Put the case reader inside the loop so that every turn receives a different N X Y line.',
  'Indent all the instructions for one case by four spaces: reading, splitting, converting and displaying. If you read the case outside the loop, repeating the body would reuse that old case instead of receiving the next one.'
 ],table('Follow the input line that each instruction consumes.',['Input line','Read when?','Remembered values'],[['2','Before the loop','T = 2'],['5 2 2','First loop turn','N = 5, X = 2, Y = 2'],['6 1 3','Second loop turn','N = 6, X = 1, Y = 3']])),
 'bb-many-left':lesson('Calculate and display one value for each case',[
  'The input loop now gives you a fresh N, X and Y on each turn. For this practice, calculate only the left-route count. It equals Y, including the starting square.',
  'Print the count inside the loop, before the next case is read. That gives one output line per case in the same order. This is practice for a single count; the complete solution must compare both sides.'
 ],table('This exercise displays the left count only. It does not yet choose the minimum.',['Case line','Left count Y','Output line'],[['5 2 2','2','2'],['1 1 1','1','1'],['6 1 3','3','3']])),
 'bb-large-integers':lesson('Calculate a count without building a huge board',[
  'The board can have 1,000,000,000,000,000,000 columns. Python int keeps these whole numbers exactly. Keep the input as integers and use addition and subtraction for the counts.',
  'The same two calculations work on a small board or a huge one: left = Y and right = N - Y + 1. You do not need a list of every square or a loop over every column. Use a loop only when there are several test cases.'
 ],flow('A large board size can stay as one integer. The example subtracts 1 exactly.',[['INPUT','1000000000000000000'],['PROCESS','N = int(input())','N - 1'],['OUTPUT','999999999999999999']])),
 'bb-repair':lesson('Use a tiny case to find a counting error',[
  'A useful test makes a mistake easy to see. Try N = 1 and Y = 1. There are no gaps to move across, but the starting square still exists. Its reachable count must be 1.',
  'If right = N - Y gives zero, the program has counted gaps instead of squares. Restore + 1. An error of one in a count is often called an off-by-one error; checking the first and last positions helps you find it.'
 ],table('Compare the calculation with the one square you can count by hand.',['For N = 1, Y = 1','Calculation','Result'],[['Count gaps only','1 - 1','0: misses the start'],['Count squares','1 - 1 + 1','1: includes the start']])),
 'bb-helper':lesson('Join the small programs into one plan',[
  'A helper program can calculate the results for an answer file. Build it from the pieces you have practised: read the number of cases, repeat, read one case, calculate both counts, choose the smaller count and display it.',
  'Read T once before the loop. Keep all the work for one case inside the loop. Print one count on each turn. X tells you the starting row; the counts come from the columns N and Y.'
 ],flow('Follow input, process and output for every case. This is a plan, not code to paste.',[['INPUT','Read T once.','On each turn: read N X Y.'],['PROCESS: EACH CASE','left = Y','right = N - Y + 1','Choose the smaller count.'],['OUTPUT: EACH CASE','Print that count.','Then read the next case.']])),
 'bb-answer-text':lesson('An answer file contains the program’s results',[
  'A Python file holds instructions such as print(2). An answer text file holds the result, such as 2. For this output task, you check and download the results rather than submitting your Python instructions.',
  'If there are two input cases, write two answer lines in the same order. Do not add labels, quotes, brackets or input prompts. You may calculate by hand or use the optional Python desk.'
 ],flow('The instructions belong in Python. Only their displayed results belong in the answer box.',[['PYTHON INSTRUCTIONS','print(2)','print(1)'],['DISPLAYED RESULTS','2','1'],['ANSWER TEXT FILE','2','1']])),
 'bb-answer-edges':lesson('Check the edge before doing a long calculation',[
  'At the first or last column, the bishop can be left with only its starting square by blocking the adjacent diagonal square into the board. With one column, block the other row’s square instead.',
  'In either case the start remains reachable, so the minimum is 1. Work through each input case separately and write its answer on its own line. Keep counting squares rather than moves.'
 ],image('This smallest board is a useful check: zero moves still leaves one reachable square.','bishop-start','A one-column board with the starting square reachable and the only other square blocked. The count is one.')),
 'bb-answer-choice':lesson('Compare two counts for every case',[
  'For each case, find left = Y and right = N - Y + 1. Keep whichever count is smaller. A tie is allowed: either blocking direction gives the same minimum count.',
  'The table shows worked examples. Your practice input below uses its own cases. Write one number per case, following the input order; the answer file needs the counts, not LEFT or RIGHT labels.'
 ],table('Worked examples: keep left, keep right, or handle a tie.',['N, Y','Left','Right','Smaller count'],[['8, 3','3','6','3'],['8, 6','6','3','3'],['7, 4','4','4','4']])),
 'bb-answer-rows':lesson('Changing the row changes the picture, not the count',[
  'Starting in the other row flips the zigzag: the bishop uses the other square in each column. It still uses one square per visited column, so the two counts stay the same when N and Y stay the same.',
  'Compare the worked pair below. Only X changes. You still read X from every case, but you calculate the reachable counts from N and Y. Treat the two inputs as two cases and keep both answer lines.'
 ],table('The two row choices have the same number of reachable columns.',['N X Y','Left = Y','Right = N - Y + 1','Minimum'],[['6 1 2','2','5','2'],['6 2 2','2','5','2']])),
 'bb-answer-big':lesson('Keep the digits and the case order',[
  'For large-number cases, use your helper if arithmetic by hand becomes awkward. Read each value using int(...). Calculate with whole numbers, and copy the complete printed count into the matching answer line.',
  'These are classroom practice cases. Match the number of answer lines to T and check your answers before downloading the text file. The worked example below demonstrates an exact calculation close to the right edge.'
 ],flow('A worked example: the start is one column before the last column.',[['INPUT VALUES','N = 1000000000000000000','Y = 999999999999999999'],['PROCESS','right = N - Y + 1','right = 1 + 1 = 2'],['MINIMUM COUNT','Left is much larger.','Keep the right count: 2.']])),
 'bb-past-question':lesson('Use the full input, process and output routine',[
  'Read the supplied question and its sample. The first line is T. Each following case gives N, X and Y. For each case, block exactly one square other than the start and minimise the reachable-square count, including the start.',
  'Use your helper or work by hand. For the official sample, enter the three counts on separate lines, check them, then download out_sample_01.txt. The answer file contains only results. The scored input files were not supplied.'
 ],image('The sample has three cases and needs three answer lines in the same order.','bishop-files','Official sample input: three cases, 5 2 2, 1 1 1, and 6 1 3. The output file contains 2, 1, and 3 on separate lines.')),
};
