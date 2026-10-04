---
"e2e": patch
---

A run that executes in the host process, such as `e2e explore`, no longer crashes that process when a test leaves a promise rejection or an exception uncaught. It handles them as a worker process does: a rejection fails the test running when it surfaces, or is recorded as `UNHANDLED_REJECTION` between tests, and an uncaught exception (or a rejection before any test has finished) is a run error that fails the test in flight with `WORKER_CRASH` and skips the rest of its file. The handlers are removed when the run ends.
