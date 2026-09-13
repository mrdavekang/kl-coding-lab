import test from 'node:test';
import assert from 'node:assert/strict';
import { learningTopics, learningStages, cleanLearningReview, suggestedAction, startingAdvice, learningReviewReport } from '../src/learningReview.js';
import { validateWork, progressSummary } from '../src/evidence.js';
import { allTasks } from '../src/content.js';

test('each topic and stage gives a specific action linked to an existing practice', () => {
  for (const topic of learningTopics) {
    for (const stage of learningStages) {
      const action = suggestedAction(topic, stage.id);
      assert.ok(action[0].length > 20, `${topic.id}/${stage.id} needs an actionable suggestion`);
      assert.ok(allTasks.some(task => task.id === action[1]), `Missing practice ${action[1]}`);
    }
    assert.deepEqual(suggestedAction(topic, 'unattempted'), topic.start);
    assert.equal(suggestedAction(topic, ''), null);
  }
  assert.equal(suggestedAction(undefined, 'help'), null);
});

test('backup restoration keeps before/after evidence without fabricating a baseline', () => {
  const review = { before: { inputOutput: 'prompt' }, after: { inputOutput: 'consolidating', storeAnswers: 'unattempted' }, focus: 'inputOutput', priority: 'storeAnswers', reason: 'I needed the example.', evidence: 'I changed both inputs and checked the welcome.' };
  const restored = validateWork(JSON.parse(JSON.stringify({ drafts: { input: 'print(1)' }, learningReview: review })));
  assert.deepEqual(restored.learningReview, review);
  assert.equal(restored.drafts.input, 'print(1)');
  assert.equal(validateWork({ drafts: {}, pitstop: 'support' }).learningReview, undefined);
  assert.deepEqual(cleanLearningReview({ after: { inputOutput: 'help' } }).before, {});
  assert.deepEqual(progressSummary({ learningReview: review }), progressSummary({}));
});

test('unanswered topics stay open, and self-reports do not become attainment scores', () => {
  assert.match(startingAdvice({}), /Unanswered statements are left open/);
  const familiar = { before: Object.fromEntries(learningTopics.map(t => [t.id, 'prior'])) };
  assert.match(startingAdvice(familiar), /You report/);
  assert.match(startingAdvice(familiar), /show an example/);
  assert.deepEqual(learningReviewReport({}), []);
  const text = learningReviewReport({ before: { inputOutput: 'prompt' }, after: { inputOutput: 'help' }, evidence: 'Which message is output?' }).flat().join('\n');
  assert.match(text, /Starting point: I can do this with a reminder/);
  assert.match(text, /Learning pit stop: Drowning - I need help/);
  assert.match(text, /Which message is output\?/);
  assert.match(text, /Starting point: Not recorded/);
});

test('imports reject unknown fields and choices, and bound free text', () => {
  const clean = cleanLearningReview({ before: { inputOutput: 'invalid', rogue: 'prior' }, after: { inputOutput: 'help', variableValue: 'invalid' }, focus: 'rogue', priority: 'variableValue', reason: 'x'.repeat(4000), evidence: 123, score: 100 });
  assert.deepEqual(clean.before, {});
  assert.deepEqual(clean.after, { inputOutput: 'help' });
  assert.equal(clean.focus, '');
  assert.equal(clean.priority, 'variableValue');
  assert.equal(clean.reason.length, 3000);
  assert.equal(clean.evidence, '');
  assert.equal(clean.score, undefined);
  assert.deepEqual(cleanLearningReview([]), cleanLearningReview(null));
});
