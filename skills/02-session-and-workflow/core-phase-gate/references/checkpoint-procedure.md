# Checkpoint procedure

Generalised from textclone tasks.md §G8. A checkpoint runs after the
phase's checks pass and before any merge.

1. Prepare what the user must see: the phase branch, the last commit
   hash, and a way to try it that touches neither the live data nor
   shared services. If the preview fails, record the error and hold
   the checkpoint anyway: tell the user it failed and why, and wait.
2. Record and announce. Add a dated `WAITING FOR USER` section to the
   handoff with the branch, the commit, how to try it, and the
   checklist. Then send the user one message: what is ready, where to
   try it, and the exact words that count as approval.
3. Stop. Make no commits, merges, pushes, or file edits, and start no
   other task or phase. Leave shared services and other agents' work
   alone. If the run cannot wait for a reply, end the run here; the
   user resumes it.
4. On the reply:
   - The exact approval phrase (the user's explicit words, never an
     inference): record the approval with its date and words, mark the
     section `APPROVED`, clean up anything the preview made, then merge.
   - Problems reported: fix them on the phase branch as extra commits,
     re-run the checks, rebuild what the user tries, update the
     checklist, and announce again. Repeat until approved.
   - No reply or an unclear reply: stay paused. Silence is never approval.
