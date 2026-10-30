const choices=(labels)=>labels.map((label,index)=>({id:String(index),label}));
const meaning=(prompt,labels,answer,explanation,hint)=>({id:'meaning',kind:'syntax',prompt,choices:choices(labels),answer:String(answer),explanation,hint});
const role=(code,answer,explanation)=>({id:'role',kind:'ipo',prompt:'What is the main job of this code?',code,choices:choices(['Input: get new information','Process: work with information','Output: show a result']),answer:String(answer),explanation,hint:'Input brings new information in. Processing stores, reads, compares or changes information already in the program. Output shows a result.'});
const unit=(code,input,output,intro,syntax,ipo)=>({version:1,code,input,output,intro,questions:[syntax,ipo]});

export const ipoDefinitions=[
  ['Input','New information enters the program, usually through input().'],
  ['Process','Store, look up, compare, count or change information.'],
  ['Output','Show a result, usually using print().'],
];

export const learningSupport={
  'bs-print':unit('print("Hi")','','Hi','Start with one instruction. Type its brackets and quotes as well as its letters.',
    meaning('What do the quotation marks in print("Hi") tell Python?',['Hi is text to display.','Hi is a variable to look up.','Hi is a number to add.'],0,'Quotes mark literal text. This instruction displays Hi without the quotation marks.','Look at the characters inside the quotation marks.'),
    role('print("Hi")',2,'print() displays text in the Shell, so this instruction produces output.')),
  'bs-lines':unit('print("A")\nprint("B")','','A\nB','Type two print instructions on separate lines. Enter starts the next code line.',
    meaning('What does the second print() do?',['Adds B to A on the same line.','Displays B on the next output line.','Waits for someone to type B.'],1,'Each print() ends its output with a new line, so A and B appear on separate lines.','There are two separate print instructions.'),
    role('print("B")',2,'This displays B. It does not read anything from the keyboard.')),
  'bs-name-input':unit('word = input()\nprint(word)','Hello\n','Hello','Type a program that remembers a typed word, then displays it. Your task below uses a name instead.',
    meaning('Why does print(word) use word without quotes?',['Quotes are never allowed in print().','word must always be the text Hello.','Python should read the value remembered as word.'],2,'Without quotes, word is a variable name. With quotes, "word" would display those four letters.','Compare a variable name with literal text in quotes.'),
    role('word = input()',0,'input() brings in a new line typed by the user. The assignment remembers that input as word.')),
  'bs-echo':unit('bits = input()','00101\n','','Type the input instruction. bits remembers the whole line as text, including the leading zeros.',
    meaning('If the user types 00101, what does bits remember?',['All five characters: "00101".','The number 101.','Only the first zero.'],0,'input() returns text. There is no int() conversion here, so the leading zeros remain.','There is no instruction converting the text to a number.'),
    role('bits = input()',0,'This gets new text from outside the program and stores it as bits.')),
  'bs-read':unit('size = int(input())\nprint(size)','5\n','5','Type the brackets from the inside out: input() reads text; int(...) converts it to a whole number.',
    meaning('What does int(input()) give size when the user types 5?',['The text "input()".','The whole number 5.','Five separate characters.'],1,'input() reads "5" as text. int() converts that text to the whole number 5, which can be used in range().','int() converts suitable text into a whole number.'),
    role('size = int(input())',0,'Its main job here is reading the size. The line also processes that input by converting it to an integer. One line can combine jobs.')),
  'bs-character':unit('bits = "10010"\nprint(bits[2])','','0','Square brackets choose one character. Python index 2 means the third character.',
    meaning('In "10010", which character does bits[2] select?',['The second character because the index is 2.','The character "2".','The third character, "0".'],2,'Indices start at 0: index 0 is "1", index 1 is "0", and index 2 is "0".','Count places from index 0, not index 1.'),
    role('bits[2]',1,'This looks up a character already stored in bits. It is processing, not new keyboard input.')),
  'bs-each':unit('for bit in "010":\n    print(bit)','','0\n1\n0','Type the colon, press Enter and keep the four-space indentation. bit is one character on each turn.',
    meaning('What does bit hold on each loop turn?',['One character from the string.','The entire string every time.','The number of characters.'],0,'The loop visits "0", then "1", then "0". The name bit remembers the current character.','Compare the current bit with the complete string.'),
    role('for bit in "010":',1,'The loop controls repeated work using characters already in the program. Its indented print produces output.')),
  'bs-filter':unit('for bit in "010":\n    if bit == "0":\n        print(bit)','','0\n0','The if line is inside the loop. Its print line is one indentation level further in.',
    meaning('What does == do in if bit == "0": ?',['Stores "0" as the new bit.','Checks whether bit equals "0".','Prints the zero.'],1,'== compares two values. A single = stores a value. The print runs only when the comparison is true.','Comparison and assignment use different symbols.'),
    role('if bit == "0":',1,'Comparing an existing value is processing. The condition decides whether the print instruction will run.')),
  'bs-count':unit('total = 0\ntotal = total + 1\nprint(total)','','1','Read the old total on the right of =, add one, then remember the new total on the left.',
    meaning('What does total = total + 1 do?',['Asks for another input.','Checks whether total equals one.','Increases the remembered total by one.'],2,'Python evaluates total + 1 first, then stores the result back in total. Starting at 0 gives 1.','A single = stores the result of the expression on its right.'),
    role('total = total + 1',1,'This changes a remembered value. Updating a counter is processing.')),
  'bs-positions':unit('for index in range(3):\n    print(index)','','0\n1\n2','range(3) gives three indices: 0, 1 and 2. Your program below will turn indices into question positions.',
    meaning('Which values does range(3) provide?',['0, 1, 2.','1, 2, 3.','0, 1, 2, 3.'],0,'range(3) starts at 0 and stops before 3, giving exactly three values.','The stopping value is not included.'),
    role('range(3)',1,'It generates values for a loop. It does not ask the user to type them.')),
  'bs-index-variable':unit('bits = "10010"\nindex = 2\nprint(bits[index])','','0','Replace index with its remembered value in your mind: bits[index] means bits[2] here.',
    meaning('With index = 2, how does Python read bits[index]?',['It prints the word index.','It reads bits[2].','It reads the second character using index 1.'],1,'Python looks up the value of index, then uses that number inside the brackets. Index 2 selects the third character.','The variable index holds a number to use as a place label.'),
    role('bits[index]',1,'Looking up a character in stored text is processing. Only input() would obtain a new typed line.')),
  'bs-index-choice':unit('index = int(input())\nprint(index)','1\n','1','Type the reader for a chosen index. The task below will use that number inside bits[...].',
    meaning('Why read the index using int(input())?',['To add 1 to every index automatically.','To turn the whole binary string into a number.','To remember the typed index as a whole number.'],2,'String indexing needs an integer place label. int() converts the typed text into that number.','The index is a number; bits stays as text.'),
    role('index = int(input())',0,'This reads a new index supplied by the user. Conversion also happens within this input instruction.')),
  'bs-index-loop':unit('bits = "10"\nfor index in range(2):\n    print(bits[index])','','1\n0','The index changes on every turn. Use its current value to read one character.',
    meaning('What changes between these two loop turns?',['index changes from 0 to 1.','The string changes from "10" to "01".','The printed characters are swapped.'],0,'The string stays "10". The changing index selects "1" first, then "0".','A lookup reads the string; it does not move its characters.'),
    role('bits[index]',1,'The lookup selects from existing information. The surrounding print displays the selected value as output.')),
  'bs-labels':unit('index = 1\nbit = "0"\nprint(index + 1, bit)','','2 0','A comma in print() separates two values. Here they are a question position and its character.',
    meaning('What will print(index + 1, bit) display here?',['1 0.','2 0.','The words index + 1, bit.'],1,'index + 1 becomes position 2. bit contains "0". print() places a space between them.','Calculate index + 1, then read the value of bit.'),
    role('print(index + 1, bit)',2,'Its main job is displaying two values. Adding 1 is a small calculation inside the output instruction.')),
  'bs-list':unit('places = []\nplaces.append(2)\nprint(places)','','[2]','Square brackets can create a list. append() adds a remembered item to its end.',
    meaning('What does places.append(2) do?',['Reads a new number from the keyboard.','Prints 2 immediately.','Adds 2 to the end of places.'],2,'The empty list becomes [2]. Remembering an item and displaying it are separate jobs.','append() changes a list; print() displays a value.'),
    role('places.append(2)',1,'This stores information in a list. It is processing.')),
  'bs-list-output':unit('places = [2, 4]\nprint(len(places))','','2','len() counts how many items a list contains. It does not add the stored position numbers.',
    meaning('Why is len([2, 4]) equal to 2?',['There are two items in the list.','2 + 4 equals 2.','The largest stored position is 2.'],0,'The list contains two items: 2 and 4. len() counts the items, so its result is 2.','Count the items, not their numerical values.'),
    role('print(len(places))',2,'The whole instruction displays a result. len(places) is processing performed inside that output instruction.')),
  'bs-zero-input':unit('n = int(input())\nbits = input()','5\n01010\n','','Practise reading the problem input in order: a length first, then a complete line of characters.',
    meaning('Which values should these variables remember?',['n is text and bits is a whole number.','n is a whole number and bits is text.','Both variables are single characters.'],1,'n controls the number of places. bits must preserve every character, including any initial zeros.','The int() conversion appears only in the first instruction.'),
    role('bits = input()',0,'This reads the second new input line. The length and string arrive on separate input() calls.')),
  'bs-zero-start':unit('zeroCount = 0\nprint(zeroCount)','','0','Start the counter before visiting any characters. At that point no zeros have been counted.',
    meaning('Where should zeroCount = 0 go when counting a string?',['Inside the if, after every zero.','After printing the final answer.','Before the loop, so the count is kept between visits.'],2,'Starting once lets the counter accumulate. Resetting inside the loop would discard earlier counting.','The counter needs to remember work from earlier turns.'),
    role('zeroCount = 0',1,'Preparing a remembered value is processing. It is not input because no new information is being read.')),
  'bs-zero-update':unit('zeroCount = 0\nfor bit in "010":\n    if bit == "0":\n        zeroCount = zeroCount + 1\n    print(zeroCount)','','1\n1\n2','Keep the final print aligned with if. It shows the count after both zero and one visits.',
    meaning('Why is print(zeroCount) indented like if rather than like the update?',['It should run after every character, including a one.','It should run only after a zero.','It should run only once after the whole loop.'],0,'Both if and print are inside the for loop. The update alone is inside if, so a one leaves the count unchanged and that unchanged count is still printed.','Indentation shows which block owns each instruction.'),
    role('zeroCount = zeroCount + 1',1,'Updating the count is processing. The following print reports that count as output.')),
  'bs-zero-total':unit('bits = "010"\nzeroCount = 0\nfor bit in bits:\n    if bit == "0":\n        zeroCount = zeroCount + 1\nprint(zeroCount)','','2','The print starts at the left edge. It runs once after all counting has finished.',
    meaning('Why is the last print outside the loop?',['To read a new string.','To display one finished count after every character has been checked.','To restart the counter for every character.'],1,'A print outside the loop waits for the loop to finish. This example outputs only the final count, 2.','Compare one finished count with a count printed on every turn.'),
    role('if bit == "0":\n    zeroCount = zeroCount + 1',1,'The decision and count update work with the stored string. Together they process the data.')),
  'bs-zero-section':unit('zeroCount = 3\nfor index in range(zeroCount):\n    print(index + 1)','','1\n2\n3','A sorted string puts all zeros first. Three zeros therefore require three zero places at its beginning.',
    meaning('If a five-character string contains four zeros, how many places must be in its zero section?',['Two, because that is half of five rounded down.','Five, because every character is a zero.','Four, because swapping keeps four zeros.'],2,'Sorting moves characters but keeps their counts. Four zeros must occupy the first four positions. The boundary is not always halfway along the string.','Use the number of zeros rather than the midpoint.'),
    role('range(zeroCount)',1,'The program uses a calculated count to choose which indices to inspect. This is processing.')),
  'bs-zero-select':unit('bits = "01010"\nzeroCount = 3\nfor index in range(zeroCount):\n    if bits[index] == "1":\n        print(index + 1)','','2','Only the first three places are inspected here. A one in this zero section needs to move.',
    meaning('Why is the one at question position 2 wrong here?',['The first three positions must hold zeros in the sorted result.','Every one anywhere in the string must be removed.','Question positions start at 0.'],0,'There are three zeros, so the zero section is positions 1, 2 and 3. Position 2 contains a one and must be fixed. Ones after this section are allowed.','Compare the current character with what this section should contain.'),
    role('if bits[index] == "1":',1,'The program compares a stored character with "1" to decide whether to print its position.')),
  'bs-left':unit('for bit in "01":\n    print(bit)\nfor index in range(2):\n    print(index + 1)','','0\n1\n1\n2','Practise two separate loops. Both for instructions start at the left edge: the second begins after the first finishes.',
    meaning('Why must the inspection loop begin after the counting loop finishes?',['It should reset the string before every visit.','It needs the complete zero count to know the section boundary.','Python only allows one for loop per program.'],1,'The boundary depends on the number of zeros in the entire string. Finish that count before inspecting its zero places.','Which value tells the second loop where to stop?'),
    role('for index in range(zeroCount):',1,'Using the completed count to inspect stored characters is processing. The position prints inside it are output.')),
  'bs-right':unit('for index in range(3, 5):\n    print(index + 1)','','4\n5','range(start, stop) includes start and stops before stop. This visits indices 3 and 4.',
    meaning('Which indices does range(3, 5) visit?',['4 and 5.','3, 4 and 5.','3 and 4.'],2,'The start 3 is included and the stop 5 is excluded. Adding 1 gives question positions 4 and 5.','The second value is an excluded stopping point.'),
    role('range(zeroCount, n)',1,'This chooses the remaining indices after the zero section. Choosing and inspecting is processing.')),
  'bs-both':unit('leftWrong = []\nrightWrong = []\nleftWrong.append(2)\nrightWrong.append(5)','','','Keep two groups separately. A wrong one from the zero section can exchange places with a wrong zero from the other section.',
    meaning('What does rightWrong.append(5) remember?',['Position 5 in the rightWrong list.','The digit 5 in the binary string.','Position 5 in both lists.'],0,'The number is a question position. It is appended only to the list named before .append().','Read the list name to the left of .append().'),
    role('rightWrong.append(5)',1,'Saving a position for later matching is processing, even though nothing is displayed yet.')),
  'bs-pairs':unit('first = [2, 4]\nsecond = [5, 6]\nfor pair in range(len(first)):\n    print(first[pair], second[pair])','','2 5\n4 6','Use the same list index to take one item from each group. The saved items are already question positions.',
    meaning('On the first turn, what does first[pair] select?',['The value 0, because pair starts at 0.','The first stored item, 2.','The number of items, 2.'],1,'pair is a list index. At pair = 0, first[0] reads the stored position 2 and second[0] reads 5.','Separate the list index from the value stored at that index.'),
    role('print(first[pair], second[pair])',2,'The instruction outputs a swap pair. Reading the list items happens inside that output instruction.')),
  'bs-answer':unit('places = [2, 4]\nprint(len(places))\nfor place in places:\n    print(place)','','2\n2\n4','Output the count first, then the stored data. Your program below prints pairs rather than single positions.',
    meaning('Why is print(len(places)) before the loop?',['It reads the number of places from the keyboard.','It changes the values inside the list.','The output needs the number of following items first.'],2,'len(places) gives the header count. The loop then prints the listed items. Binary Sorting needs a count followed by that many swap-pair lines.','Think about what the first output line means.'),
    role('print(len(places))',2,'The whole instruction outputs a count. len() calculates that count within the output expression.')),
  'bs-repair':unit('index = 0\nposition = index + 1\nprint(position)','','1','Convert Python indices into question positions once. The first index, 0, becomes position 1.',
    meaning('If a saved value is already index + 1, should you add 1 again when printing it?',['No. It is already a question position.','Yes. Every print needs another + 1.','Only when its digit is zero.'],0,'Adding once converts numbering systems. Adding again would shift the answer to the next position.','Check whether the stored value is an index or a question position.'),
    role('position = index + 1',1,'The program calculates and remembers a new value. That is processing.')),
  'bs-mixed':unit('places = []\nprint(len(places))\nfor place in places:\n    print(place)','','0','An empty list has length zero. A loop over it has no turns, so the program prints only 0.',
    meaning('What does the loop do when places is empty?',['Prints one blank pair.','Runs zero times.','Fails because empty lists are forbidden.'],1,'An empty collection supplies no items, so its for loop skips the indented instructions. This naturally handles a sorted string with no swaps.','How many items can this loop visit?'),
    role('len(places)',1,'len() calculates a value from a stored list. It is processing; print(len(places)) displays that value.')),
  'bs-challenge':unit('n = int(input())\nbits = input()','6\n010100\n','','Warm up the input reader. Then use the full question below to build your processing and output with less help.',
    meaning('Why can one swap fix a wrong one and a wrong zero together?',['The characters disappear when swapped.','Every swap must use neighbouring positions.','Each character moves into a section where it belongs.'],2,'A wrong one in the zero section exchanges places with a wrong zero in the one section. Both positions become correct. Any two different positions may be used.','Consider what each of the two positions should contain after the swap.'),
    role('n = int(input())\nbits = input()',0,'These instructions read the original question input: a length followed by the binary string.')),
};
learningSupport['bs-challenge'].questions.push(
  {...role('',1,'These operations work with the input to plan minimum swaps. They are the processing block.'),id:'final-process',prompt:'Which part of the solution counts zeros, collects wrong positions and matches partners?'},
  {...role('',2,'Displaying the answer in the required format is the output block.'),id:'final-output',prompt:'Which part of the solution displays the minimum count followed by the swap pairs?'},
);

export function normaliseTyping(value='') {return (typeof value==='string'?value:'').replace(/\r\n?/g,'\n').replace(/\t/g,'    ');}
export function typingStatus(value,target) {
  const raw=normaliseTyping(value),expected=normaliseTyping(target).replace(/\n+$/,'');
  const complete=raw.replace(/[ ]+$/gm,'').replace(/\n+$/,'')===expected&&expected.length>0,typed=complete?expected:raw;
  let prefix=0;while(prefix<typed.length&&prefix<expected.length&&typed[prefix]===expected[prefix])prefix++;
  const error=prefix<typed.length?prefix:null;
  const before=expected.slice(0,prefix),line=before.split('\n').length,column=before.length-(before.lastIndexOf('\n')+1)+1;
  return {typed,expected,prefix,error,line,column,complete};
}
export function supportStatus(item,record={}) {
  const questions=item.support?.questions||[],answers=record.answers||{};
  return {typed:!!item.support&&typingStatus(record.text||'',item.support.code).complete,correct:questions.filter(q=>answers[q.id]?.checked&&answers[q.id].choice===q.answer).length,total:questions.length};
}
export function supportTotals(tasks,work={}) {
  return tasks.reduce((total,item)=>{const status=supportStatus(item,work.practiceSupport?.[item.id]);return {typed:total.typed+Number(status.typed),correct:total.correct+status.correct,questions:total.questions+status.total};},{typed:0,correct:0,questions:0});
}
export function cleanSupport(source,tasks) {
  const data=source&&typeof source==='object'&&!Array.isArray(source)?source:{},clean={};
  for(const item of tasks){
    if(!item.support)continue;
    const raw=data[item.id];if(!raw||typeof raw!=='object'||Array.isArray(raw))continue;
    const answers={};
    if(raw.version===item.support.version)for(const q of item.support.questions){const answer=raw.answers?.[q.id];if(answer&&q.choices.some(c=>c.id===answer.choice))answers[q.id]={choice:answer.choice,checked:answer.checked===true};}
    clean[item.id]={version:item.support.version,text:typeof raw.text==='string'?raw.text.slice(0,2500):'',answers};
  }
  return clean;
}
