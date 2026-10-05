import {main1 as previousTasks, warmups as previousWarmups} from '../week4/content.js';

export const curriculum = 'week5-counter-ide-mcc2026-v1';
export const stages = [
  {id:'donow',label:'Do Now',time:'0–5',title:'Remember running totals and conditions',teacher:'Use the complete retrieval model. Ask for one True and one False case before running.'},
  {id:'focus',label:'Types of Learning',time:'5–8',title:'Choose a starting focus',teacher:'Knowledge: syntax and formats. Skills: code and IDE use. Understanding: tests and independent preparation.'},
  {id:'read1',label:'Read before Main Task 1',time:'8–12',title:'Fact 3 · counter or running total?',teacher:'Read the structure and syntax. Discuss the three questions, then reveal answers.'},
  {id:'main1',label:'Main Task 1',time:'12–24',title:'Choose, count and total',teacher:'Most pupils begin with Count qualifying scores. Offer positive-only output for support and donations for stretch.'},
  {id:'pitstop1',label:'Learning Pit Stop 1',time:'24–27',title:'Explain one decision',teacher:'Pause everyone. Ask for current value, condition result and counter before/after.'},
  {id:'read2',label:'Read before Main Task 2',time:'27–34',title:'Competition formats and your IDE',teacher:'Brief the dates, formats and rules. Identify editor, input and output. School session and payment arrangements remain to be confirmed.'},
  {id:'main2',label:'Main Task 2',time:'34–49',title:'Open, run, test and save',teacher:'Rehearse in preinstalled Thonny. Use the tested browser fallback if needed. Input adaptation is optional for pupils still learning to save and run.'},
  {id:'pitstop2',label:'Learning Pit Stop 2',time:'49–52',title:'Show your saved program',teacher:'Ask students to reopen their .py file and distinguish code from an output file. Record external-IDE steps as self-reports.'},
  {id:'extension',label:'Extension',time:'52–56',title:'Prepare a fresh challenge',teacher:'Ready pupils try a range or multiple input lines. Others repeat the IDE essentials independently.'},
  {id:'plenary',label:'Plenary',time:'56–60',title:'Reflect, choose and hand in',teacher:'Collect the school/home response and one next step. Students download and hand in the response; the app does not send it.'}
];

const adapt = (task, id, group, lineNotes) => ({...task,id,group,check:id,lineNotes});
const printNotes = {
  1:'Store the data in a list. The items keep their order.',
  3:'Visit each list item. The loop variable holds only the current item.',
  4:'Compare the current item with the threshold. The result is True or False.',
  5:'Run this indented print only when the condition is True. False skips this line.'
};
const accumulatorNotes = {
  1:'Store the supplied items in a list.',
  2:'Initialise the counter or total at zero, once, before the loop.',
  4:'Start the next iteration and put the current item in the loop variable.',
  5:'Evaluate the condition again using this current item.',
  6:'If True, update the remembered value. If False, skip this update.',
  8:'The loop is over. Print the completed result once, with no indentation.'
};
export const main1 = [
  adapt(previousTasks[0],'w5-positive','main1',printNotes),
  adapt(previousTasks[1],'w5-qualifiers','main1',accumulatorNotes),
  adapt(previousTasks[2],'w5-donations','main1',accumulatorNotes)
];
main1[0].level = 'More support';
main1[1].level = 'Core';
main1[2].level = 'Stretch';

export const main2 = [{
  id:'w5-input',group:'main2',kind:'code',level:'Input practice',title:'Read one competition score',
  skills:'input() · int() · selection · exact output',
  scenario:'The score is provided as input instead of being written inside your code. A score of at least 10 qualifies.',
  reading:[
    'input() reads one line as text. Give the text a meaningful name, then convert it with int() when you need a whole number.',
    'The condition and counter work as before. This time the data changes in the Program input box. Print only the requested answer: 1 for a qualifying score or 0 otherwise.',
    'In Thonny, enter the value in the Shell when the program waits. In this app, put the value in Program input before pressing Run.'
  ],
  vocabulary:[['input()','read a line of text'],['int()','convert whole-number text to an integer'],['standard output','the answer your program prints']],
  goal:'Read one score. Print 1 if it is at least 10, or 0 otherwise. Use one if statement and an explicit counter update.',
  inputHelp:'One whole number on one line. No question or extra label should be printed.',
  needsInput:true,sampleInput:'12\n',sampleOutput:'1',sampleExplanation:'12 >= 10 is True, so the count changes from 0 to 1.',
  exampleTitle:'Worked example · one visitor age',exampleScenario:'Count one visitor as eligible if their age is at least 12.',
  example:'ageText = input()\nage = int(ageText)\neligibleCount = 0\n\nif age >= 12:\n    eligibleCount = eligibleCount + 1\n\nprint(eligibleCount)',
  exampleInput:'14\n',exampleOutput:'1',
  lineNotes:{1:'Read the text "14" from input.',2:'Convert "14" into the integer 14.',3:'Start the counter at 0.',5:'Test 14 >= 12: True.',6:'Run the update and change the counter from 0 to 1.',8:'Print the final counter: 1.'},
  exampleSteps:['Line 1 reads "14" as text.','Line 2 converts it to the integer 14.','Line 3 initialises eligibleCount to 0.','Line 5 evaluates 14 >= 12 as True.','Line 6 adds 1, changing the count from 0 to 1.','Line 8 prints 1. For input 9, the condition is False, line 6 is skipped and the output is 0.'],
  starter:'scoreText = input()\nscore = int(scoreText)\nqualifyingCount = 0\n\n# Add 1 only when this score qualifies.\n\nprint(qualifyingCount)\n',
  hints:['Test score >= 10.','Indent the counter update under if. Leave the final print outside.'],
  check:'w5-input',requireCondition:true,
  tests:[{input:'12\n',expected:'1'},{input:'10\n',expected:'1'},{input:'9\n',expected:'0'},{input:'0\n',expected:'0'}]
}];

export const extensions = [
  {...adapt(previousTasks[3],'w5-range','extension',accumulatorNotes),level:'Silver'},
  {
    id:'w5-input-loop',group:'extension',kind:'code',level:'Gold',title:'Read and count several scores',
    skills:'range() · repeated input · condition + counter',
    scenario:'The first input line tells you how many scores follow. Count the scores that are at least 10.',
    reading:[
      'Read the number of scores first. range(scoreCount) repeats the loop that many times: range(4) provides 0, 1, 2 and 3.',
      'Read one new score inside each iteration. Initialise the counter before the loop, update only for matches, and print after the loop.',
      'This classroom input format is one number per line. Always follow the actual problem’s input layout in a competition.'
    ],
    vocabulary:[['range(n)','repeat n times, starting the index at 0'],['input layout','the order and lines in which data is provided'],['boundary','a value at the edge of a condition']],
    goal:'Read scoreCount, then that many scores. Count scores >= 10 and print the final count once.',
    needsInput:true,inputHelp:'First line: number of scores. Remaining lines: one score per line.',
    sampleInput:'4\n9\n12\n7\n15\n',sampleOutput:'2',sampleExplanation:'Only 12 and 15 qualify.',
    exampleTitle:'Worked example · read visitor ages',exampleScenario:'The first line gives the number of visitors. Count ages of at least 12.',
    example:'visitorCountText = input()\nvisitorCount = int(visitorCountText)\neligibleCount = 0\n\nfor visitorIndex in range(visitorCount):\n    ageText = input()\n    age = int(ageText)\n    if age >= 12:\n        eligibleCount = eligibleCount + 1\n\nprint(eligibleCount)',
    exampleInput:'4\n9\n12\n14\n8\n',exampleOutput:'2',
    lineNotes:{1:'Read the number of visitors as text.',2:'Convert it to an integer so range can use it.',3:'Initialise once before repetition.',5:'Repeat visitorCount times. The index starts at 0.',6:'Read one visitor age in this iteration.',7:'Convert this age to an integer.',8:'Test whether this visitor is at least 12.',9:'Add 1 only when the condition is True.',11:'Print once after every visitor has been visited.'},
    exampleSteps:['Lines 1–3 read visitorCount = 4 and set eligibleCount = 0.',
      'Iteration 1: line 5 gives visitorIndex = 0. Lines 6–7 read age 9. Line 8 is False; line 9 is skipped and the count stays 0.',
      'Iteration 2: visitorIndex = 1, age = 12. Line 8 is True; line 9 changes the count 0 → 1.',
      'Iteration 3: visitorIndex = 2, age = 14. Line 8 is True; line 9 changes the count 1 → 2.',
      'Iteration 4: visitorIndex = 3, age = 8. Line 8 is False; line 9 is skipped and the count stays 2.',
      'The loop ends. Line 11 prints 2. The loop index counts positions; it is not the age.'],
    starter:'scoreCountText = input()\nscoreCount = int(scoreCountText)\nqualifyingCount = 0\n\n# Repeat for each score.\n# Read and convert one score in that iteration.\n# Add 1 when it qualifies.\n\nprint(qualifyingCount)\n',
    hints:['Use for scoreIndex in range(scoreCount):.','Read the score inside the loop; test score >= 10.'],
    check:'w5-input-loop',requireLoop:true,requireCondition:true,
    tests:[{input:'4\n9\n12\n7\n15\n',expected:'2'},{input:'2\n10\n10\n',expected:'2'},{input:'3\n0\n1\n9\n',expected:'0'},{input:'1\n20\n',expected:'1'}]
  }
];

export const donow = {
  ...adapt(previousWarmups[0],'w5-donow','donow',{1:'Store the three page counts.',2:'Initialise the total before the loop.',4:'Visit each page count.',5:'Add the current number of pages, not 1.',7:'Print after all iterations.'}),
  title:'Retrieve a running total',
  reading:['In Week 4 we discussed running totals and conditions. Start the total before the loop, add the current value inside, then print after the loop. Predict before running.'],
  predictionCode:'roundScores = [5, -2, 0, 7]\n\nfor score in roundScores:\n    if score > 0:\n        print(score)',
  predictionQuestion:'Which scores print? Explain why 0 is skipped.',
  predictionAnswer:'5 and 7 print on separate lines. 0 > 0 is False. -2 also fails the condition.'
};

export const tasks = [donow,...main1,...main2,...extensions];
export const checkedTasks = [...main1,...main2,...extensions];
export const taskById = id => tasks.find(task=>task.id===id);
export const checkSpec = task => ({tests:task.tests,dataName:task.dataName,requireLoop:!!task.requireLoop,requireCondition:!!task.requireCondition,requireAnd:!!task.requireAnd});

export const facts = {
  counter:{
    title:'Fact 3 · counter or running total?',
    reading:['A counter answers “how many?”. Each match adds 1. A running total answers “how much altogether?”. Each match adds its value.',
      'Both follow the same structure: initialise before the loop → decide and update inside → print after. The if line ends with a colon. The update is inside both for and if, so it has eight spaces.'],
    syntax:[['=','give a variable a value'],['for item in items:','visit each item'],['if item >= limit:','choose whether the block runs'],['count = count + 1','count a match'],['total = total + item','add its value']],
    code:'scores = [9, 12, 10, 7]\nqualifyingCount = 0\n\nfor score in scores:\n    if score >= 10:\n        qualifyingCount = qualifyingCount + 1\n\nprint(qualifyingCount)',
    questions:[
      ['Which update finds how many scores qualify?','Add 1 for each matching score. The final count for this list is 2.'],
      ['What are the count values after each iteration?','0, 1, 2, 2. The score 10 qualifies because >= includes the boundary.'],
      ['What changes if the question asks for their total value?','Add score instead of 1. The matching values are 12 and 10, so the total is 22.']
    ]
  },
  formats:{
    title:'What will I submit?',
    reading:['The same problem can appear in output format, code format or both. Read its instructions before choosing what to upload.'],
    questions:[
      ['Is a screenshot the same as an output file?','No. Prepare a plain-text file containing the requested answer only. A screenshot is an image.'],
      ['Which format asks for my Python program?','Code format. Submit your .py program, which must handle hidden inputs using standard input and output.'],
      ['Can I discuss the live contest problems with a friend?','No. Solve independently during the competition, even when you attend school together.']
    ]
  },
  ide:{
    title:'An IDE helps you write and run code',
    reading:['An IDE is a place to write, run and check a program. The editor holds your code. In Thonny, the Shell shows output and accepts a value when input() waits.',
      'Save your program as a .py file. An .in file holds input data; an .out file holds the answer. These extensions are our rehearsal names—follow the filenames requested by the actual contest.'],
    syntax:[['input()','read one line as text'],['int(text)','convert whole-number text'],['print(answer)','produce the requested output']],
    code:'scoreText = input()\nscore = int(scoreText)\nprint(score)',
    questions:[
      ['Where do I type code, and where do I enter input in Thonny?','Write code in the editor. Click Run; enter input in the Shell when the program waits.'],
      ['Why should a contest program use input() without a question?','A prompt would add extra output. The answer must match the problem’s output instructions.'],
      ['How can I check that my program was saved?','Close its tab and reopen the .py file from your folder. Run it with a second test.']
    ]
  }
};

export const arrangements = {
  checked:'5 October 2026',
  dates:'31 October 00:00 – 1 November 23:59, Malaysia time (GMT+8)',
  registration:'21 October 2026',payment:'30 October 2026',fee:'RM30 per participant',
  school:'School day, time, room, supervision and transport: to be confirmed by your teacher.',
  registrationPlan:'Who registers and how payment is collected: to be confirmed by your teacher.',
  links:[['Official dates and registration','https://ioimalaysia.org/competition/mcc/2026/'],['Official formats and rules','https://ioimalaysia.org/competition/mcc/info/'],['Registration website','https://registration.ioimalaysia.org/']]
};
export const rehearsalSteps = [
  ['open','Open your IDE','Use Thonny on a prepared school computer, or the tested browser fallback. Find the editor and output area.'],
  ['save','Save your program','Download your Main Task 1 Python file above. In Thonny choose File → Open, then File → Save as to keep your own copy in a competition folder.'],
  ['run','Predict and run','Predict the result before clicking Run. In Thonny use Run → Run current script. Output appears in the Shell.'],
  ['test','Try fresh data','Change one list value, save again and run. Test the qualifying boundary 10, and explain why the result changes or stays the same.'],
  ['reopen','Close and reopen','Close the program tab. Reopen your saved .py file from your folder and check that your latest changes are present.'],
  ['output','Prepare an answer file','For a small rehearsal, save ONLY the printed answer as plain text, named answer.out. Reopen it and check there are no prompts, code or shell messages. For large contest files, learn file input/output rather than copying the Shell.']
];
export const readinessItems = [['device','I have a suitable computer'],['internet','I have reliable internet'],['workspace','I have a quiet place to work'],['ide','I can open my IDE'],['save','I can save and reopen code'],['rules','I understand independent working and the AI rule']];
export const preferenceOptions = {
  intent:['Yes','Unsure','No'],location:['School','Home','Need advice'],
  parent:['Confirmed','Will ask','Need advice'],availability:['Can attend once time is confirmed','Cannot attend','Awaiting the school time']
};
