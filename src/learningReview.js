// Topic-specific self-reflection, kept separate from code checks and attainment.
export const learningGroups = [
  { name: 'Knowledge', meaning: 'What I can recall', question: 'What do I already know?' },
  { name: 'Skills', meaning: 'What I can do', question: 'What can I do with my code?' },
  { name: 'Understanding', meaning: 'What I can explain and apply', question: 'Can I explain why it works?' },
];
export const startingPoints = [
  { id: 'prior', label: 'I could already do this' },
  { id: 'prompt', label: 'I can do this with a reminder' },
  { id: 'new', label: 'This is new to me' },
  { id: 'unsure', label: 'I am not sure yet' },
];
export const learningStages = [
  { id: 'new', label: 'New learning', description: 'A good struggle: this takes effort, but I am making progress.' },
  { id: 'consolidating', label: 'Consolidating', description: 'I am practising and becoming more secure.' },
  { id: 'stretch', label: 'Treading water', description: 'This feels easy. I need a new challenge.' },
  { id: 'help', label: 'Drowning - I need help', description: 'I am stuck. I need help with a smaller step.' },
  { id: 'unattempted', label: 'Not attempted yet', description: 'I have not had a go at this part yet.' },
];

export const learningTopics = [
  {
    id: 'inputOutput', group: 'Knowledge', title: 'Input and output',
    statement: 'I can tell input from output in a program.',
    before: 'Your Do Now displayed a message. That was output. If asking for an answer is new, say so.',
    after: 'Look at your welcome program. Which answer did you type? Which message did Python display?',
    example: 'coderName = input("Coder name: ")\nprint("Welcome,", coderName)',
    start: ['Read “Ask the coder a question”. Run it and point to your answer and the displayed message.', 'input'],
    actions: {
      new: ['Run the input example again. Point to what you typed and what Python displayed.', 'input'],
      consolidating: ['Use your own welcome program to explain which part is input and which part is output.', 'welcome'],
      stretch: ['Try a third question in the welcome challenge. Explain each input and output.', 'prebronze'],
      help: ['Show your teacher the input example. Enter one answer together and find the output.', 'input'],
    },
  },
  {
    id: 'variableValue', group: 'Knowledge', title: 'Variable names and values',
    statement: 'I can name a variable and the value it stores.',
    before: 'In clubName = "Code Explorers", can you point to the name and the text value? This may be new today.',
    after: 'Choose one assignment in your code. Say the variable name, then the value it holds after that line runs.',
    example: 'clubName = "Code Explorers"\nprint(clubName)',
    start: ['Read “Keep a value in a variable”. Identify the name and value, then change the value and run.', 'variable'],
    actions: {
      new: ['Point to the name and value in one assignment. Change the value, run and explain what changed.', 'variable'],
      consolidating: ['Explain the name and value of a second variable without the example. Then check your code.', 'welcome'],
      stretch: ['Explain why print(clubName) and print("clubName") display different things. Try both.', 'variable'],
      help: ['Show your teacher one assignment. Find just the name first, then the value on the right.', 'variable'],
    },
  },
  {
    id: 'storeAnswers', group: 'Skills', title: 'Keeping two answers',
    statement: 'I can store two answers in different variables.',
    before: 'Have you written and run two input() lines yourself? Recognising the example is a starting point.',
    after: 'Use your two questions. Can you change both answers and keep each one in its own variable?',
    example: 'coderName = input("Coder name: ")\nactivity = input("Activity: ")',
    start: ['Open “Build the club welcome”. Write one question, run it, then add the second question.', 'welcome'],
    actions: {
      new: ['Write one question first. Run it, then add a second question with a different variable name.', 'welcome'],
      consolidating: ['Build two questions with less help. Run with two new answers and check that both are kept.', 'welcome'],
      stretch: ['Add a third question to your welcome challenge. Keep and use all three answers.', 'prebronze'],
      help: ['Show your teacher the first input line. Run that one line together before adding another.', 'input'],
    },
  },
  {
    id: 'displayAnswers', group: 'Skills', title: 'Displaying stored answers',
    statement: 'I can display the answers stored in my variables.',
    before: 'You changed a quoted message in the Do Now. Have you also displayed a value using its variable name?',
    after: 'Find your print() line. Does the output use the answers you entered on this run?',
    example: 'print("Welcome,", coderName)\nprint("Your activity:", activity)',
    start: ['Read the input example. Add a print() line using the variable name without quotes.', 'input'],
    actions: {
      new: ['Add one print() line using a stored answer. Run it, then display the other answer.', 'welcome'],
      consolidating: ['Run your welcome with different answers. Check that neither old answer remains in the output.', 'welcome'],
      stretch: ['Change your welcome wording and order. Explain why the variables still refer to the same answers.', 'prebronze'],
      help: ['Show your teacher your print() line. Compare a variable name with the same name inside quotes.', 'input'],
    },
  },
  {
    id: 'variablePurpose', group: 'Understanding', title: 'Why this program uses two names',
    statement: 'I can explain why my welcome program uses two variables.',
    before: 'The program asks both questions before displaying the answers. Why might keeping both answers matter?',
    after: 'Use your two variable names. Explain what each keeps until your welcome message is displayed.',
    example: 'coderName = input("Coder name: ")\nactivity = input("Activity: ")\nprint(coderName, activity)',
    start: ['Read the welcome task. Explain which answer belongs to each name before writing the final message.', 'welcome'],
    actions: {
      new: ['Use your two variable names to finish: “This keeps ... so I can use it when ...”.', 'welcome'],
      consolidating: ['Explain how two variables keep the answers available until the final message. Use your own example.', 'welcome'],
      stretch: ['Try using the same name for both answers. Run it and explain which answer is replaced. Then repair it.', 'welcome'],
      help: ['Ask your teacher to label two answer boxes with you: coder name and activity. Link each box to your code.', 'welcome'],
    },
  },
  {
    id: 'testReason', group: 'Understanding', title: 'Why I test again',
    statement: 'I can explain what a second test tells me about my program.',
    before: 'After changing your Do Now message, what did running it help you check? Later, you can test different answers too.',
    after: 'Use two runs of your own program. Name what you changed and what you checked in the output.',
    example: 'First run: Nova / chess\nSecond run: Sam / music', exampleLabel: 'Two sets of test answers',
    start: ['Run the welcome task with two different sets of answers. Explain what the second run helps you check.', 'welcome'],
    actions: {
      new: ['Change both answers and run again. Check that the output uses the new answers.', 'welcome'],
      consolidating: ['Choose a new test yourself. Explain what it checks and compare the output with the task.', 'welcome'],
      stretch: ['Test the score desk using zero. Explain what that test checks after you have run it.', 'bronze'],
      help: ['Show your teacher one run. Choose just one answer to change, then compare the two outputs together.', 'input'],
    },
  },
];

const object = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
const text = value => typeof value === 'string' ? value.slice(0, 3000) : '';
export function cleanLearningReview(value) {
  const source = object(value), before = {}, after = {};
  for (const topic of learningTopics) {
    if (startingPoints.some(choice => choice.id === object(source.before)[topic.id])) before[topic.id] = source.before[topic.id];
    if (learningStages.some(choice => choice.id === object(source.after)[topic.id])) after[topic.id] = source.after[topic.id];
  }
  return { before, after,
    focus: learningTopics.some(t => t.id === source.focus) ? source.focus : '',
    priority: learningTopics.some(t => t.id === source.priority) ? source.priority : '',
    reason: text(source.reason), evidence: text(source.evidence),
  };
}
export function suggestedAction(topic, stage) {
  if (!topic || !learningStages.some(choice => choice.id === stage)) return null;
  return stage === 'unattempted' ? topic.start : topic.actions[stage];
}
export function startingAdvice(review) {
  const state = cleanLearningReview(review);
  const needs = learningTopics.filter(t => ['new', 'unsure', 'prompt'].includes(state.before[t.id]));
  if (needs.length) return 'Possible focus: ' + needs.map(t => t.title.toLowerCase()).join('; ') + '. Choose one that matters to you.';
  if (learningTopics.every(t => state.before[t.id] === 'prior')) return 'You report that these are familiar. Choose one to apply in a new situation and show an example.';
  return 'Use your starter work to choose a focus. Unanswered statements are left open; you can ask for help checking them.';
}
export function learningReviewReport(value) {
  const state = cleanLearningReview(value);
  if (!Object.keys(state.before).length && !Object.keys(state.after).length && !state.focus && !state.priority && !state.reason && !state.evidence) return [];
  const title = id => learningTopics.find(t => t.id === id)?.title || 'Not chosen';
  return [
    ['Types of learning - my starting point', `Chosen focus: ${title(state.focus)}\nMy reason: ${state.reason || 'Not recorded'}\n${startingAdvice(state)}`],
    ...learningTopics.map(topic => [`${topic.group}: ${topic.title}`, `${topic.statement}\nStarting point: ${startingPoints.find(c => c.id === state.before[topic.id])?.label || 'Not recorded'}\nLearning pit stop: ${learningStages.find(c => c.id === state.after[topic.id])?.label || 'Not recorded'}\nSuggested action: ${suggestedAction(topic, state.after[topic.id])?.[0] || 'Not selected'}`]),
    ['Learning pit stop - my next step', `Chosen focus: ${title(state.priority)}\nMy evidence or help request: ${state.evidence || 'Not recorded'}\nNext action: ${suggestedAction(learningTopics.find(t => t.id === state.priority), state.after[state.priority])?.[0] || 'Not selected'}`],
  ];
}
