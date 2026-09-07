# KL Coding Lab

A static Python learning app for a mixed KS2–KS4 coding club. Lesson 1 contains ten learning cards, a 60-minute teacher guide, four open challenge routes, original scenarios, staged hints and task checks. There are no output-prediction activities or predictive code-completion extensions.

## Use the app

Choose a learning card or challenge, write Python and press **Run**. When `input()` asks a question, type in the console and press Enter (or Send). **Stop** interrupts the current program. **Check work** runs separate prepared cases without replacing the interactive transcript.

The editor supports Python highlighting, four-space indentation, block indent/outdent, undo and Ctrl/Cmd+Enter to run. Tablets have visible indentation buttons. Press Escape, then Tab to leave the editor using a keyboard.

Drafts, hints and reflection are saved in the current browser. **My files** exports Python files or all drafts as a JSON backup. Import a backup to move devices. Shared-device learners should download their work before using **Start a new learner**. Saving locally is not a cloud account or permanent backup.

## Develop and verify

Use Node.js 24 and npm:

```sh
npm ci
npm run dev
npm test
python3 tests/checks_test.py
npm run build
```

The Python command checks the assessment logic with Python 3. The browser app itself does not need an installed Python interpreter. Development and production both use a same-origin service worker to enable the live console; run through localhost or HTTPS rather than opening index.html directly.

## GitHub Pages

In the repository's **Settings → Pages**, select **GitHub Actions** as the publishing source. The included workflow builds and publishes `dist/` on pushes to `main`. Relative paths support a repository project URL. `.nojekyll` is included for manual static deployment as well.

The app runs Python in a module worker using pinned Pyodide 314.0.6. The runtime is downloaded from the official Pyodide distribution on jsDelivr. `coi-serviceworker` 0.1.7 is vendored with its MIT licence. It enables cross-origin isolation where GitHub Pages cannot directly configure COOP/COEP response headers; the first visit may refresh once. The page and Python worker must both be isolated. Loading failure is visible and does not silently replace interactive input with a different activity.

The Run controller sends UTF-8 input through a shared buffer and streams output from the worker. Interrupts are checked while waiting for input. Stop recreates a worker if a normal interrupt does not complete. Runs have fresh program namespaces; task checks have their own inputs and captured output. Excessive output is capped, and checks have a time limit. This is a learning checker running on the pupil's device, not a tamper-resistant competition judge.

Only Lesson 1 is implemented. The content data is structured to support later lessons. Silver and Gold are optional extensions informed by the club's competition practice, not a claim of qualification or contest readiness.

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
