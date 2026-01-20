@.claude/plan.md @.claude/activity.md @CLAUDE.md

We are building the Chat feature for HomeCafe.

First read activity.md to see current progress, then read CLAUDE.md to understand patterns.

Open plan.md and find the FIRST task where passes is false.

Work on exactly ONE task: implement all steps listed.

After implementing, run: pnpm type-check && pnpm check

If validation passes:
- Update that task's passes from false to true in plan.md
- Append a dated entry to activity.md describing what you changed
- Commit: git add -A && git commit -m "feat(chat): [task description]"

Do not git init, do not change remotes, do not push.

ONLY WORK ON A SINGLE TASK.

When ALL tasks have passes true, output <promise>COMPLETE</promise>

If blocked, log in activity.md and output <promise>BLOCKED</promise>
