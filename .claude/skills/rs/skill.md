---
name: rs
description: Restart the dev server. Kills any process on the dev port and relaunches `npm run dev` in the background.
---

# Restart Dev Server

Kill the existing dev server and start a fresh one.

## Steps

1. Kill any process listening on port 5200
2. Wait 1 second for cleanup
3. Run `npm run dev` in the background

```bash
lsof -ti:5200 | xargs kill 2>/dev/null; sleep 1; npm run dev
```

Run this command in the background. Report the URL (http://localhost:5200) when done.
