# KL Coding Lab

A static Python learning app for a mixed KS2–KS4 coding club. Weeks 1–5 each contain a 60-minute learning sequence, teaching notes, open challenge routes and practice checks.

Supabase Classroom Mode provides **Screens down** only. Students use the ordinary app URL and choose their week normally. The teacher opens the same URL with `?teacher=1`, signs in, starts the classroom, and can cover or release every connected student screen. There are no page-pushing, live-code or answer controls, and no student leave button. Profiles, names and code remain local. Run `supabase/30-screen-down-classrooms.sql` once and check that it returns `screen_down_classrooms_ready = true`.

## MCO Tryout two pointers

**MCO Tryout** is a separate landing page after MCC Preparation in the lesson chooser, with a link from the MCC overview. Open `?week=mco`; a direct task link is `?week=mco&problem=two-pointers&activity=1&exercise=tp-try-1`. Existing class and teacher query parameters survive navigation.

The MCO 2023 Two Pointers easy-version path has eight stages and **16 Try tasks followed by the full question**:

1. **Understand the road** — Tries 1–3: identify input/output, distinguish coordinates from distance, and test a nearest-person guess.
2. **Compare cuts and route orders** — Tries 4–6: count all cuts, compare both endpoint orders and trace the best total so far.
3. **Start Python with input and output** — Tries 7–8: names, assignment, print, input, split, indexing and int.
4. **Prepare lists and endpoints** — Tries 9–11: explicit conversion loops, integer sorting, swapping starts and guarding empty groups.
5. **Calculate both journeys** — Tries 12–13: absolute distance, both route costs, min and combined totals.
6. **Keep the smallest total** — Try 14: initialise from the first real cost, then compare later costs.
7. **Repeat cases and test boundaries** — Tries 15–16: case loops, output placement and repairing a missing final cut.
8. **Solve Two Pointers** — combine the smaller programs for the supplied four-case sample and fresh checks.

Tries 1–6 use paper reasoning and labelled answer fields, not a Python editor or Python runtime. Each has its own SVG diagram, focused reading and prompts, IPO planning, clues, explanations and answer feedback. Try 5 explicitly keeps the cities at 1 and 9 while changing the start from 5 to −3. From Try 7, short analogous programs, syntax cards and the existing live Python workspace introduce the language one piece at a time. The original “easy” label is not a claim about a beginner’s expected pace; allow several sessions and use the KS2/KS3 support guidance.

The expandable route explorer appears at Try 6 and Tries 12–13. It moves through all eight sample cuts and shows both endpoint route orders for Alice and Bob, every leg’s direction and distance, selected minima, ties, empty groups, combined totals and best-so-far totals. Mathematical explanations connect the two routes to group width plus the nearer-end approach. The memory explanation distinguishes calculating endpoint costs from storing all routes.

The path keeps the teacher’s explicit variables, loops and first-calculated-total method. Starts are not appended as cities; no functions, comprehensions or invented large initial minimum are required. The final statement preserves the supplied constraints, scoring groups and sample. It links the official archive and distinguishes this classroom Python pathway from the 2023 contest’s C++ submission requirement.

Work saves independently under `twoPointersWork`, including manual answers, code, inputs, IPO plans, explanations, readiness and bounded check evidence. JSON backup validates the `mco-two-pointers` lesson identifier, downloads the existing work before a restore and rejects other lesson backups. The PDF includes labelled reasoning answers as well as code and evidence. Editing an answer or program invalidates its current passed status.

Teacher reference programs remain outside the student bundle in `tests/mco-reference.json`. Checks cover all 11 Python exercises, six reasoning tasks, examples and samples, seven incorrect algorithm variants, the supplied repair task, 1,075 independent shortest-walk cases using a Dijkstra oracle, both 200,000-city boundary cases, all eight route comparisons, saved-work isolation and rendered navigation. Existing MCC and weekly checks remain in the test suite.

## MCC Preparation: Building Fences, Corner Cover and Collatz

The preparation overview offers **three separate problem pages**. Building Fences saves under `mccWork`, Corner Cover under `cornerCoverWork`, and Collatz under `collatzWork`. Each keeps its own code, inputs, plans, evidence, readiness reflections, backup/restore and PDF report. The lesson chooser shows combined practice progress, while each problem page shows only its own checks.

### Collatz pathway

Use `?week=mcc&problem=collatz&activity=1` to open the new Collatz page. Its five activities contain 13 short exercises that follow the teacher’s solution:

1. **Read the list and the rounds:** identify n and k, read the text list, visit and convert items, then practise collecting values across lines.
2. **Choose the even or odd rule:** find a remainder, test parity and apply one rule once. Integer division uses `//`.
3. **Store the changed values:** distinguish the temporary variable from the list item, then update one whole list round.
4. **Repeat rounds and keep a total:** repeat one number, repeat a whole list and trace a fresh total for each round.
5. **Collatz:** combine the earlier code and print only the final sum after exactly k rounds.

The teaching keeps `numbers`, `n`, `k`, `list_of_numbers`, `number`, `index`, `i` and `total` from the teacher’s method. The input reader can append values from extra lines when needed. Functions and list comprehensions are not prerequisites. Each activity includes a reviewed PNG with a text alternative, enlargement and download, syntax guidance, a runnable analogous example (activities 1–4), IPO and lookup prompts, predictions, hints and reflections. Both supplied samples appear in the final task. No contest year or official URL is inferred from the supplied question.

The visuals distinguish n items from k rounds, one branch per visit, storing back into the list and resetting the total inside the outer loop. The final planning board leaves its answer areas blank. The rule diagram was revised so finishing one item does not imply finishing the whole list round.

Reference programs live outside the client bundle in `tests/collatz-reference.json`. Validation covers all 13 exercises and examples, both original samples, ten common misconceptions, 504 exhaustive small cases, 100 deterministic random cases with varying line breaks and the n = k = 1000 boundary. A separate per-number oracle checks the round-by-list implementation. Existing weekly and MCC problem work remains isolated.

### Corner Cover pathway

Corner Cover uses the teacher’s explicit solution style: split the input, convert each item in a loop, append it to `numbers`, assign `n`, `m`, `A` and `B`, calculate `landscape` and `portrait`, append one answer per case and print the saved answers. Functions and list comprehensions are not prerequisites. Its five activities contain 11 short exercises:

1. **Unpack the input:** split text, build an integer list, then name the four dimensions.
2. **Check whether it fits:** compare dimensions separately, then join them with `and`.
3. **Cover two corners:** recognise full height or width with `==` and `or`, then combine fit and span.
4. **Rotate and collect answers:** trace both complete orientation checks, accept either one, then practise an answer list using a separate score problem.
5. **Corner Cover:** combine the earlier programs with the original multiple-case input format.

Each step includes the reviewed Corner Cover visual, a syntax reference, a separate runnable example (activities 1–4), IPO planning, lookup and prediction prompts, hints, explanations and fresh-input checks. Input formats are stated explicitly: early exercises take one case, the batch exercise takes scores, and the final question takes T followed by T dimension lines. The final statement preserves the supplied sample and notes that its B = 1 conflicts with the printed lower bound of 2. No year or official web source is inferred for this supplied question.

Direct links use `?week=mcc&problem=corner-cover&activity=1`. Class and teacher parameters survive navigation. Backup import checks the problem identifier and downloads the previous work before restoring the selected problem. Browser Back/Forward switches between the hub and the separate paths.

`tests/corner-cover-reference.json` contains teacher-style reference programs outside the client bundle. Validation runs all examples and samples, rejects seven common misconceptions, compares the final program with every placement for 1,225 small dimension combinations, and checks 200 cases with dimensions up to 10¹⁸. The existing Building Fences checks remain in place.

### Building Fences pathway

**MCC Preparation** appears immediately after Week 5 in the lesson chooser and is also linked from the Week 5 footer. The Building Fences page contains **MCC 2025 P1: Building Fences**, with five activities and a linear path through 13 short exercises:

1. Decode the input: single-number input, splitting two numbers, then dimensions and area.
2. Count a chosen symbol: visit characters, select dots, then keep a counter.
3. Find the smallest cost: read/store costs, then track a minimum.
4. Explore a field by columns: store rows, visit one column, count it, then count every column.
5. Solve the original Building Fences past question independently.

Each exercise provides input/process/output planning, a syntax-lookup prompt, prediction/testing notes, a Python editor, buffered standard input and fresh-data checks. Activities 1–4 have separate worked examples and syntax explanations. All five include reviewed teaching images with text alternatives, an enlarged viewer, full-size access and downloads. The last activity keeps its planning board blank and does not display a reference solution. The imagery is generated teaching material; the official problem is linked separately.

Use `?week=mcc` for the preparation overview. A direct lesson link is `?week=mcc&problem=building-fences&activity=1`. The address records the current exercise as the pupil continues. Existing `classId` and teacher parameters are preserved. The landing page still defaults to Week 5, and the same local student-profile flow applies. Learners may revisit earlier activities; this is a linear recommended route, not a completion lock.

Preparation work saves independently under `mccWork`. My files provides a dedicated validated backup/restore and a PDF containing plans, code, explanations and recent practice evidence. Exploring an example does not replace a pupil draft or pass a check. An output file can be downloaded only after a successful run of the current code and input. Readiness checkboxes are explicitly self-reported. These checks award no official contest points and submit nothing to MCC.

Five activity sets are intended for several sessions with beginners; use the short exercises as readiness checks. References live in `tests/mcc-reference.json`, outside the client build. Verification covers all examples, common errors, every field up to 3 × 3, an 800 × 800 boundary field, navigation, assets, saved-work isolation and backup validation. Browser checks cover the complete exercise path, wrong-answer feedback, separate examples, downloads and narrow-screen layout.

## Week 5: counters, IDE practice and MCC readiness

Week 5 continues from the running-total and conditions facts covered in Week 4. It follows the school sequence: Do Now, Types of Learning, reading before Main Task 1, Main Task 1, Learning Pit Stop 1, reading before Main Task 2, Main Task 2, Learning Pit Stop 2, Extension and Plenary. Direct links use `?week=5`, and the landing page defaults to Week 5. Previous weeks remain available; Week 5 saves separately under `week5Work`.

Main Task 1 has positive-output support, a core qualifying-score counter and a conditional donations total. Every task includes short reading, syntax/vocabulary, an analogous worked example, an explanation for every nonblank source line, every iteration and the existing live Python tutor. Fresh-data checks include boundaries and no matches. Main Task 2 rehearses opening, running, testing, saving and reopening the pupil's own program in preinstalled Thonny or an organiser-listed browser fallback. Input adaptation and range/repeated-input extensions are available. External-IDE checklist entries are explicitly self-reported, not automatically verified.

The MCC 2026 briefing links to official dates, formats and rules, checked 5 October 2026. It distinguishes output-file and code submission. The school session and registration/payment process remain clearly marked to be confirmed. The Plenary collects participation intent, school/home preference, parent discussion, attendance, readiness and support needs. Responses save locally and are downloadable for the teacher; the app neither registers contestants nor sends the response automatically. The PDF and Week 5 backup also include the responses, fact discussions and rehearsal evidence.

The rehearsal editor imports/downloads Python files, loads/downloads small input files and exports output only after a successful run of the current code and input. Error, tutor, checker and stale output cannot be exported as the current answer. Backups reject other weeks and download existing work before a validated restore. Year 11 colours, Raleway reading text and monospace code carry forward.

Before teaching, prepare Thonny, check the browser fallback and file downloads on school devices, and confirm school logistics. During the contest, learners work independently and follow the official AI restriction. This app is classroom preparation, not the competition platform.

## Week 4: conditions, counting and MCC grids

Week 4 introduces AQA-style selection and then applies it to an adaptation of [MCC 2025 Problem 1: Building Fences](https://ioimalaysia.org/competition/mcc/2025/archive/p1/). The ten-stage plan runs from retrieval and Types of Learning through conditions, counting matches, nested loops, minimum tracking, two pit stops and an independent plenary. Main Task 1 contains four condition challenges; Main Task 2 contains four fence/grid challenges, with one Pre-Bronze, Bronze, Silver and Gold route in each bank.

Every task follows the same beginner sequence: **Read first → Study a complete analogous example → Follow written iteration steps → Open the live line-by-line tutor → Write and check your own program**. Worked examples are separate from pupil drafts. The real-execution tutor shows the executed and next source lines, values before and after, the active loop variable, every iteration and current output. `Next iteration` moves to the next loop visit or loop end without hiding the intermediate trace record.

The Week 4 presentation takes its visual cues from the Year 11 classroom app: Raleway-style typography, dark green and warm off-white, compact square teaching cards, WAGBA, timed stages, border accents and a dark code treatment. It remains responsive and uses the existing accessible editor, reports, backups and local student profiles. Direct links use `?week=4`; Week 4 progress is stored separately under `week4Work`.

## Week 3: Weeks 1 and 2 programming practice

Week 3 now revisits input, variables, integer arithmetic, lists, for loops, counting and running totals. The ten timed lesson stages and built-in Python editor remain. Main Task 1 has five Week 1 scenarios; Main Task 2 has five Week 2 scenarios. Across both banks there are **2 Pre-Bronze, 4 Bronze, 3 Silver and 1 Gold** challenges. The first three in each bank form a starting route; questions 4–5 offer optional stretch. Levels are classroom labels. Keep both pit stops even with unfinished work.

Each scenario shows an exact task, data format, sample input or supplied list, expected output, a plain-language explanation and visible short clues. Starters contain comments and required data only. Complete reference programs are not displayed in the lesson or teaching notes, and are kept outside the client bundle in test fixtures. The Gold task combines prior skills without requiring conditions, functions, grid indexing or nested loops. The Do Now and independent plenary are separate from the ten challenge levels.

Run uses the supplied sample input. Check my code tests fresh inputs or replaces the declared top-level list with fresh data. List tasks ask for an explicit loop. Tests verify all reference results and common mistakes. Report and backup exports include programs, run/check evidence and both reflections. The whole lesson remains free of accordions and dropdown menus.

Profiles keep the new curriculum separately from the earlier fence lesson. On first opening the replacement, earlier Week 3 work is archived intact and can be downloaded under My files; it never counts toward new challenge progress. Backups preserve that archive. Weeks 1 and 2 stay unchanged. Direct links use `?week=3`; other query parameters, including `classId`, remain intact. Profiles are local browser records, not server rosters.

Verification includes the production build, automated curriculum and backup tests, real browser Python runs and fresh-data checks, PDF/JSON downloads, small-screen layout and earlier-work migration. Physical classroom devices should still be checked on the school network.

## Week 2: lists, loops and running totals

Choose Week 2 on the landing page to revisit lists and loops, or Week 1 for input/output and variables. Direct links use `?week=2` and `?week=1`. Each student profile keeps Week 2 under `week2Work`; the existing Week 1 `work` remains intact. Reports, progress and validated backups are separate for the two weeks. A backup for the wrong week is rejected with a clear message.

Week 2 keeps ten timed stages, with a bank of **three Main Task 1 cards** and **five Main Task 2 cards**. Main Task 1 (14–27 minutes) covers announcing scores, printing name badges and doubling training laps. Main Task 2 (35–50 minutes) covers score totals, counting library shelves, ticket income, repairing a rainfall total and counting/totalling supply boxes. Each card has short reading, an example, its own starter, fresh-data checks, hints, discussion and separate saved code/evidence. Continue moves through the cards in order; any card is open. Pause everyone for the learning pit stops at minutes 27 and 50 even if cards are unfinished. The approximate 4-minute / 3-minute windows are flexible; the teacher can offer a starter or return to unfinished practice later. There are ten core practice checks including Do Now and plenary. The four levels live in the **Extensions** area and are always open. Worked examples have their own temporary editor space so exploring them does not replace the student's draft. Check work uses fresh lists and accepts the total-only or count-and-total route for the first Main Task 2 card.

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

Weeks 1–5 are implemented. Silver and Gold are optional classroom extensions, not a claim of qualification or contest readiness.

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

## MCC Practise: code and answer-file courses

`?week=mcc-practise` now offers four independent paths: Binary Sorting code (30 levels), Binary Sorting answer files (8), Winning Streak code (30), and Winning Streak answer files (8). Each level has a short executable typing example plus syntax/IPO questions. There are 76 typing examples and 156 MCQs across the four paths. A typing match or correct MCQ never grants a program or answer-file pass. Existing Binary Sorting IDs and `binarySortingWork` remain unchanged; new work uses `winningStreakWork`, `binarySortingOutputWork` and `winningStreakOutputWork`.

Winning Streak introduces spaced input, list indices, growth/reset counters, current versus best, inclusive endpoints, `>=`, `and`, and later ties. It culminates in a single-pass solution for up to 500,000 rounds. Its last starter contains only planning comments. Classroom checks include full-size runs and later ties; they are not competition timing measurements or official scores.

Answer-file paths accept manual answers or optional IDLE Python runs. Only a successful run of the current draft against the fixed case can be copied into its answer box. Checking is separate: Binary Sorting accepts any valid minimum swap sequence; Winning Streak validates both maximum length and the greatest start on ties. Changing an answer invalidates its current pass. Checked text downloads use matching filenames. The large Winning Streak input is loaded from a static asset, sent to Python as prepared input and shown only as a short preview; it is not duplicated into every saved draft.

The uploaded code/output PDFs for each problem were byte-identical; one canonical copy and all supplied sample pairs are under `public/mcc-sources`. The Winning Streak output kit supplied `in_01.txt` (500,000 rounds, wins then losses), which is the final answer-file exercise. Binary Sorting's scored `in_01.txt`–`in_04.txt` were absent: its output path uses the supplied samples and labelled practice cases. No uploaded shell/batch scripts are run or required. The page downloads answer text; it does not generate or submit competition ZIP archives.

Rebuild the 14 responsive diagram pairs with `python3 scripts/build-streak-visuals.py`. `npm test` includes executable examples and references, an independent exhaustive streak oracle, alternate swap checks, large inputs, rendering, storage isolation and backup validation.

### Short examples and playful practice

The MCC Practise lesson flow is adapted from the Helsinki Python MOOC's short explanation/example progression for KS2/KS3 learners. Every typed example can now run in place with F5 using the existing Python worker and its supplied sample input. After matching the example, **Try a change** opens a separate experiment based on the learner's typed code: personalise a robot message, change input data, extend a loop or move a streak endpoint. The matching exercise remains saved. Experiment code and input are bounded, included in backups and labelled separately in reports.

Example runs use a fresh Python namespace and prepared input. Their output, errors and stop controls stay beside the example. They do not replace the IDLE draft, modify its Shell session, create a main-task run/check record, enable an answer-file export, or pass a challenge. Quick checks show one MCQ at a time with retries, explanations, numbered navigation and a review-all option. Picture hints are available in a disclosure, and successful main checks provide a direct next-challenge button. The 76 task IDs and all saved program/answer-file passes remain unchanged.

### Student Python reference

[Open the student reference](https://mrdavekang.github.io/kl-coding-lab/?week=mcc-reference). This public page needs no student profile. Its 26 searchable topics explain the syntax and problem patterns used by the four MCC Practise courses, including input/process/output, binary-string and spaced-result readers, indices, counters, zero sections, streak endpoints, later ties and answer files. Topic links can be shared with `&topic=indexing`, for example. Each article has a complete small Python example, expected input/output, a parts-and-meaning table, a common mistake and links to relevant practice levels. Accessible diagrams include a clickable index table and a streak trace.

**Try it yourself** loads the existing Python runtime only when requested. The IDLE-style desk supports prepared input, interactive Shell input, F5, Stop, undo/redo and `.py` downloads. Reference drafts use the separate bounded `kl-coding-lab.mcc-reference.v1` browser-storage key; they do not alter course drafts, passes or reports. Reset example retains a restore-previous-draft option. Course and welcome-page reference links open in another tab and preserve the originating class and exercise in the return link. `npm test` runs every advertised example and checks topic links, draft isolation, public routing and all existing course tasks.

### Python playground landing page

The [main site address](https://mrdavekang.github.io/kl-coding-lab/) now opens a public Python playground. `?week=playground` opens the same page; existing explicit week, MCC, MCO and reference links retain their destinations. No student name or class is needed for free coding. The page starts Python automatically, with one editor above the real interactive Shell, simple three-step guidance and four starter examples. Run/F5 starts a fresh module, input normally receives typed Shell answers, and Stop interrupts running or waiting code. Optional prepared sample input, Shell commands, indentation tools, text sizes and line-specific error help are available.

New, examples and Open… retain up to five previous programs, including their filenames, prepared input and preferences. Opening a file does not execute it. Download .py exports the current code; the playground draft and recovery history use the separate bounded `kl-coding-lab.playground.v1` key. Course evidence and reference experiments are untouched. Programs over 50,000 characters are not silently truncated into storage; a visible saving warning asks the learner to download their file. The playground links to all existing courses, and course entry pages, MCC/MCO activities and the reference link back to the playground in another tab.

Validation includes all four starter outputs, default/deep-link routing, file validation, recovery history, storage isolation, real browser input/prepared-input/console runs, syntax errors, stopping a loop, open/download/reload and responsive layout. Open… accepts both `.py` and `.txt`: a text file can become prepared input without replacing code, or open as Python code. Uploaded text input supports up to 4 million characters; larger-than-16,000-character input is previewed while the complete file is supplied to Python. Input files can also be downloaded.
