---
"e2e": patch
---

A run that executes in the host process, such as `e2e explore`, handles a promise rejection nobody caught the way a worker process does: it fails the test running when it surfaces, or is recorded as `UNHANDLED_REJECTION` between tests, instead of crashing the process. An uncaught exception there becomes a run error. The handlers are removed when the run ends.
