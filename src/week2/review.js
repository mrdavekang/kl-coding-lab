import { cleanLearningReview, learningReviewReport } from '../learningReview.js';
import { validateWork, progressSummary } from '../evidence.js';
import { allTasks, coreTasks } from './content.js';
const topic = (id,group,title,statement,before,after,example,start,actions) => ({id,group,title,statement,before,after,example,start,actions});
export const topics = [
  topic('list','Knowledge','Lists and items','I can recognise a Python list and its items.','In your starter, which items did you change or add?','Point to your list and identify two items.','scores = [4, 7, 2]',['Read the list card. Change one item and run.','list'],{new:['Change one item, run and point to it in the output.','list'],consolidating:['Add an item without copying. Explain what brackets and commas do.','list'],stretch:['Try repeated and negative scores. Explain their positions and values.','announcer'],help:['Show your teacher the list. Find one item and one comma together.','list']}),
  topic('iteration','Knowledge','One iteration','I can explain what one loop iteration means.','Have you seen a loop visit each item, or is this new?','Use a recorded iteration. What did your loop variable hold on that visit?','for currentScore in scores:\n    print(currentScore)',['Walk through the loop example one iteration at a time.','loop'],{new:['Find iteration 2 in the walkthrough. Say which item is stored.','loop'],consolidating:['Use a different list. Explain each visit with less help.','announcer'],stretch:['Try two equal scores. Explain why these still make two iterations.','announcer'],help:['Use two scores with your teacher. Step through just the first visit.','loop']}),
  topic('indent','Skills','Writing an indented loop','I can write an indented loop that uses each item.','Have you written and run this yourself, or would an example help?','Change the list and run. Show which statement repeats.','for currentScore in scores:\n    print(currentScore)',['Build the score announcer using the loop example.','announcer'],{new:['Write the loop header, then one indented print line.','announcer'],consolidating:['Write the loop with less help and test a changed list.','announcer'],stretch:['Double the training laps. Explain why both instructions belong inside the loop.','laps'],help:['Show your teacher the colon and the start of the print line. Check four spaces together.','loop']}),
  topic('total','Skills','Building a running total','I can build and test a running total.','Have you updated a total inside a loop before?','Show two tests and the line that updates your running total.','totalScore = totalScore + currentScore',['Open the total-only worked example. Try its first iteration.','totals'],{new:['Step through one update. Read the old total, current score and new total.','totals'],consolidating:['Use a different list with less starter code. Explain one update using its actual values.','desk'],stretch:['Add a counter. Test a zero score and explain the two updates.','bronze2'],help:['Show your teacher one update. Use two items and work through one addition together.','totals']}),
  topic('initialise','Understanding','Starting the total','I can explain why the total starts before the loop.','If this is new, choose new. You will explore it later.','Use your code or a trace. Explain what goes wrong if you reset the total inside the loop.','totalScore = 0\nfor currentScore in scores:\n    totalScore = totalScore + currentScore',['Walk through the total example and find the starting zero.','totals'],{new:['Count how often the starting zero executes. Explain why it runs once.','totals'],consolidating:['Repair the rainfall recorder. Explain why its starting zero should run once.','rainfall'],stretch:['Explain why count starts at zero but maximum starts at the first item.','gold2'],help:['Use two scores with your teacher. Keep the first subtotal before adding the second.','totals']}),
  topic('countTotal','Understanding','Count versus total','I can explain the difference between counting and totalling.','Do you know how adding 1 differs from adding the current score?','Use a zero score. Why does the count change but the total stay the same?','scoreCount = scoreCount + 1\ntotalScore = totalScore + currentScore',['Compare the separate total and counter examples.','totals'],{new:['Walk through an update with zero. Read both old and new values.','desk'],consolidating:['Use a negative score. Explain why count rises and total falls.','bronze2'],stretch:['Count and total only positive scores. Explain why zero is excluded.','silver2'],help:['Ask your teacher to count two score cards, then add their values with you.','totals']}),
];
export function reviewAt(work, id) {
  const initial = cleanLearningReview(work.reviews?.before, topics);
  const checkpoint = cleanLearningReview(work.reviews?.[id], topics);
  return id === 'focus' ? initial : {...initial, after:checkpoint.after, priority:checkpoint.priority, evidence:checkpoint.evidence};
}
export function updateReview(work, id, review) {
  const clean = cleanLearningReview(review, topics);
  const record = id === 'focus' ? {before:clean.before,focus:clean.focus,reason:clean.reason} : {after:clean.after,priority:clean.priority,evidence:clean.evidence};
  return {...work,reviews:{...work.reviews,[id === 'focus' ? 'before' : id]:record}};
}
export function reviewReport(work) {
  const output = [];
  for (const id of ['pitstop1','pitstop2']) {
    if (!work.reviews?.[id]) continue;
    output.push([id === 'pitstop1' ? 'Learning pit stop 1' : 'Learning pit stop 2','Compare the student\'s starting points with this checkpoint. These are self-reports, not grades.']);
    output.push(...learningReviewReport(reviewAt(work,id),topics));
  }
  if (!output.length) output.push(...learningReviewReport(reviewAt(work,'focus'),topics));
  return output;
}
export const stats = work => progressSummary(work,allTasks,coreTasks);
export function validateWeek2(value) {
  const clean = validateWork(value,allTasks);
  clean.reviews = {};
  for (const id of ['before','pitstop1','pitstop2']) if(value.reviews?.[id]) clean.reviews[id]=cleanLearningReview(value.reviews[id],topics);
  clean.reading = {}; clean.traceEvidence = {}; clean.traceUses = {};
  for (const task of allTasks) {
    if (value.reading?.[task.id] === true) clean.reading[task.id]=true;
    clean.traceUses[task.id]=Math.min(100000,Math.max(0,Number(value.traceUses?.[task.id])||0));
    const entry=value.traceEvidence?.[task.id];
    if(entry && typeof entry.code === 'string' && typeof entry.description === 'string') clean.traceEvidence[task.id]={code:entry.code.slice(0,12000),description:entry.description.slice(0,5000),savedAt:typeof entry.savedAt === 'string'?entry.savedAt.slice(0,40):''};
  }
  return clean;
}
