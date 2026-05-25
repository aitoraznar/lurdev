---
name: run
description: Start the Hugo dev server to preview the site locally and verify changes look correct before pushing.
---

Run the Hugo development server so the user can preview the site:

1. Run `hugo server` in the project root.
2. Tell the user the site is available at http://localhost:1313 and to open it in a browser.
3. Note any build warnings or errors from Hugo's output.
4. Remind the user to stop the server with Ctrl+C when done.

If a server is already running on port 1313, mention that and suggest visiting the existing instance instead.
