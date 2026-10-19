export function checkReasoning(item, answer) {
  const values = String(answer || '').split('\n');
  const cases = item.reasoning.map((field, index) => {
    const actual = (values[index] || '').trim();
    const passed = field.choices ? actual.toUpperCase() === field.expected : /^-?\d+$/.test(actual) && Number(actual) === Number(field.expected);
    return {input: field.label, expected: String(field.expected), actual, passed, error: ''};
  });
  const passed = cases.every(row => row.passed);
  return {passed, message: passed ? 'Your answers match. Explain how you found one of them.' : 'Compare one answer with the number line or route steps. Change it and try again.', cases};
}
