# KL Coding Lab

A static Python learning app for a mixed KS2–KS4 coding club. Weeks 1 and 2 each contain a 60-minute learning sequence, a teacher guide, open challenge routes, reading examples, staged hints and practice checks. There are no output-prediction activities or predictive code-completion extensions.

## Week 2: lists, loops and running totals

The landing page opens Week 2 by default. Choose Week 1 to revisit input/output and variables. Direct links use `?week=2` and `?week=1`. Each student profile keeps Week 2 under `week2Work`; the existing Week 1 `work` remains intact. Reports, progress and validated backups are separate for the two weeks. A backup for the wrong week is rejected with a clear message.

Week 2 moves through return/roles, a list Do Now, Types of Learning, a loop reading card, the score announcer, Pit Stop 1, total/counter reading, the score desk, Pit Stop 2 and plenary. The four levels live in the **Extensions** area and are always open. Worked examples have their own temporary editor space so exploring them does not replace the student's draft. Check work uses fresh lists and accepts the total-only or count-and-total route for Main Task 2.

**Walk through** pauses real Python execution using CPython's trace events inside the Pyodide worker. It shows the completed line and next line, actual old/new values, loop iteration and item, and output at each recorded step. Previous step replays history; it does not rerun input. Enter submits input through the same interactive console. Next iteration records intermediate steps but pauses at the next iteration or loop end. The last step has a Finish walkthrough button. Stop interrupts running, waiting or stepping code. Editing after stopping starts a fresh trace.

The teaching subset supports single-line assignments, lists, arithmetic, print/input, conversions, for loops, conditions and ordinary function definitions/calls/returns used by the extensions. Imports, while loops, comprehensions, arbitrary method calls and multi-statement/multiline simple statements receive an explicit unsupported-walkthrough message; **Run** remains available. Trace capture stops at 300 events, and displayed strings/lists are bounded. Explanations describe executed operations, not a guessed purpose for arbitrary code. This is an educational tool, not a general debugger or a security sandbox.

Students can keep one selected trace step per task, with the source used for that run, in their PDF and backup. Reading/walkthrough use does not pass checks. Types of Learning uses six statements about lists, iterations, indentation, totals, initialisation and counting versus totalling. Both pit stops are stored independently with the original starting points, topic stages, evidence and next focus.

The **Teacher guide** contains the sequence, suggested KS2/KS3/KS4 support, explicit camelCase solutions, actual line/iteration explanations, expected tests and common errors. [Download the reference](public/week-2-teacher-guide.md). These examples follow the classroom conventions informed by [AQA Python guidance](https://filestore.aqa.org.uk/resources/computing/AQA-8525-NG-PY.PDF). See [Python trace events](https://docs.python.org/3/library/sys.html#sys.settrace) and [Pyodide streams](https://pyodide.org/en/stable/usage/streams.html) for the underlying execution APIs.

## Use the app

Choose a learning card or challenge, write Python and press **Run**. When `input()` asks a question, type in the console and press Enter (or Send). **Stop** interrupts the current program. **Check work** runs separate prepared cases without replacing the interactive transcript.

The editor supports Python highlighting, four-space indentation, block indent/outdent, undo and Ctrl/Cmd+Enter to run. Tablets have visible indentation buttons. Press Escape, then Tab to leave the editor using a keyboard.

Start with a student name and class, or choose a saved profile on the landing page. Each profile keeps its own drafts, hints, explanations, reflection, check progress and recent run/check evidence in the current browser. Reopening the app returns to the landing page. **Switch student** preserves each profile. An optional checkbox brings existing work from the earlier app into a new profile without deleting the original record.

**Types of learning** and **Learning pit stop** use the same six topic-specific statements, grouped into Knowledge, Skills and Understanding. Students record starting points, revisit them with evidence, and choose a specific next action. Two statements appear at a time with optional examples. Learning stages describe the current task; they do not award marks, lock challenges or send teacher alerts. The profile, backup and PDF preserve both sets of responses, the chosen focus and supporting explanation. Older backups remain supported without inventing earlier responses.

**My learning report** downloads a real PDF with the student's name/class, progress overview, current code, per-task explanations, reflection, recent attempts, console answers/output, errors and prepared check results. Students attach the PDF to their teacher's Teams assignment and turn it in themselves. There is no automatic submission or teacher dashboard. A passed status applies only when the current code equals the checked version. Supplied checks and self-reported work are formative evidence, not authentication or a grade.

The latest eight attempts per task are retained, along with total run/check counts. Each recorded attempt stores up to 12,000 code characters, 4,000 console characters and the first 30 answers (500 characters each). Long report code is labelled as an excerpt; full drafts remain in Python/JSON downloads. Non-ASCII report lines use the browser's font fallback and are embedded as high-resolution images; ordinary text remains selectable. PDF generation loads on demand using [jsPDF](https://github.com/parallax/jsPDF).

**My files** exports individual Python files or a full JSON lesson backup including progress and evidence. Import a backup to move devices; importing restores its progress and merges its drafts, after downloading the current work first. Imported files are validated against the known tasks. Profile names and classes are not sent to GitHub or any database. Profiles are not password-protected: anyone using the same browser can open them. Clearing browser data removes local profiles, so keep backups. Concurrent tabs with stale profile revisions cannot overwrite newer saved work. Saving failures are visible and leave existing saved data intact. This GitHub Pages version does not sync automatically across devices.

## Develop and verify

Use Node.js 24 and npm:

```sh
npm ci
npm run dev
npm test
python3 tests/checks_test.py
python3 tests/week2_test.py
npm run build
```

The Python command checks the assessment logic with Python 3. The browser app itself does not need an installed Python interpreter. Development and production both use a same-origin service worker to enable the live console; run through localhost or HTTPS rather than opening index.html directly.

## GitHub Pages

In the repository's **Settings → Pages**, select **GitHub Actions** as the publishing source. The included workflow builds and publishes `dist/` on pushes to `main`. Relative paths support a repository project URL. `.nojekyll` is included for manual static deployment as well.

The app runs Python in a module worker using pinned Pyodide 314.0.6. The runtime is downloaded from the official Pyodide distribution on jsDelivr. `coi-serviceworker` 0.1.7 is vendored with its MIT licence. It enables cross-origin isolation where GitHub Pages cannot directly configure COOP/COEP response headers; the first visit may refresh once. The page and Python worker must both be isolated. Loading failure is visible and does not silently replace interactive input with a different activity.

The Run controller sends UTF-8 input through a shared buffer and streams output from the worker. Interrupts are checked while waiting for input. Stop recreates a worker if a normal interrupt does not complete. Runs have fresh program namespaces; task checks have their own inputs and captured output. Excessive output is capped, and checks have a time limit. This is a learning checker running on the pupil's device, not a tamper-resistant competition judge.

Weeks 1 and 2 are implemented. Silver and Gold are optional extensions informed by the club's competition practice, not a claim of qualification or contest readiness.

## Classroom validation

Before the first class, open the published URL on the school network using the actual desktop, laptop and tablet browsers. Verify a first visit, repeated `input()` calls, Enter/Send with the virtual keyboard, Stop, and file download/import. Desktop viewport testing does not replace a test on a physical school tablet. An internet connection is needed to load Python; the app does not promise full offline operation. Optional text fonts load from Google Fonts, with a system-font fallback.

## Learning and technical references

- [Raspberry Pi editor design](https://www.raspberrypi.org/blog/code-editor-beta-testing/)
- [Helsinki introductory input lesson](https://programming-26.mooc.fi/part-1/2-information-from-the-user/)
- [EEF self-regulated learning guidance](https://educationendowmentfoundation.org.uk/education-evidence/guidance-reports/metacognition%20)
- [Pyodide standard streams](https://pyodide.org/en/stable/usage/streams.html)
- [Pyodide interrupts](https://pyodide.org/en/stable/usage/keyboard-interrupts.html)
- [Cross-origin isolation service worker](https://github.com/gzuidhof/coi-serviceworker)

The app's learning scenarios and interface text were written for this club. Third-party software retains its respective licences; see the dependency lockfile and vendored service-worker licence.
