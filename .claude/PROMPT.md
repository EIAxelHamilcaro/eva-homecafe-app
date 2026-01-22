@.claude/plan.md @.claude/activity.md @.claude/PRD.md

We are implementing the HomeCafe Expo mobile app UI in the expo/ directory.

First read activity.md to see what was recently accomplished.

Reference existing web UI from .claude/screenshots/ and continue from already implemented Expo screens to maintain consistent styling.

Open plan.md and choose the single highest priority task where passes is false.

Work on exactly ONE task:
1. Read the task steps carefully
2. Check .claude/screenshots/ for relevant UI references
3. Implement the changes in expo/ directory
4. Use NativeWind (Tailwind classes) for styling
5. Follow shadcn-style patterns for UI components
6. Ensure TypeScript types are correct

After implementing:
1. Run `cd expo && pnpm type-check` to verify no TS errors
2. Run `cd expo && pnpm check` to verify lint passes

Append a dated progress entry to activity.md describing:
- What you implemented
- Which files were created/modified
- Any issues encountered

When task is complete and verified, update ONLY the `"passes"` field in plan.md from `false` to `true`. Do not modify any other part of the task JSON.

Make one git commit for that task only with format: "feat(expo): [task description]"

Do not git init, do not change remotes, do not push.

ONLY WORK ON A SINGLE TASK.

When ALL tasks have passes true, output <promise>COMPLETE</promise>
