# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

---

## Development Workflow

Every non-trivial task follows this sequence. No exceptions.

1. **Brainstorm** — Use `superpowers:brainstorming` to refine the idea, explore requirements, and align on direction before any code is written.
2. **Plan** — Use `superpowers:writing-plans` to create a concrete implementation plan with clear, independent tasks.
3. **Execute** — Use `superpowers:subagent-driven-development` with maximum parallelization. Always prefer spawning multiple agents for independent tasks — if two pieces of work don't depend on each other, they should run in parallel. Never serialize work that can be parallelized.
4. **Code Review** — Use `superpowers:requesting-code-review` before finalizing any work.
5. **Verify** — Use `superpowers:verification-before-completion` before any commit or PR. Evidence before assertions — always.

When encountering bugs: use `superpowers:systematic-debugging` before proposing fixes. No guessing, no shotgun debugging.

### Parallelization Rules

- **Default to parallel.** When a plan has independent tasks, spawn sub-agents for each one simultaneously.
- **Never serialize independent work.** If tasks A and B don't share state or have ordering dependencies, run them at the same time.
- **Each agent gets its own context.** Brief agents like a colleague who just walked in — they don't know what you've discussed. Include file paths, what to change, and why.
- **Trust but verify.** When agents report back, check the actual changes before claiming the work is done.

### Git Workflow

All work happens in isolation via worktrees. Never commit directly to the primary branch.

1. **Start from the primary branch:**
   ```bash
   git checkout <primary-branch> && git pull origin <primary-branch>
   ```
2. **Create a worktree** using `superpowers:using-git-worktrees` for every task. This gives you an isolated copy of the repo — no risk of stepping on in-progress work.
3. **Branch naming:** Use prefixes that describe the work — `feat/`, `fix/`, `chore/`, `refactor/`.
4. **Do all work inside the worktree.** Commits, tests, builds — everything happens there.
5. **Create a PR** back to the primary branch when the work is complete and verified.
6. **Watch CI.** If checks fail, fix them in the same worktree and push until green.
7. **After merge, clean up:**
   - Use `superpowers:finishing-a-development-branch` to handle the cleanup process
   - Delete the local branch: `git branch -D <branch-name>`
   - Delete the remote branch: `git push origin --delete <branch-name>`
   - Remove the worktree: `git worktree remove <worktree-path>`
   - Prune stale references: `git worktree prune`

**Never push directly to the primary branch.** Every change goes through a PR.

### Debugging

- Use `superpowers:systematic-debugging` as the first response to any bug or unexpected behavior.
- Reproduce first, hypothesize second, fix third.
- Verify the fix actually resolves the issue before reporting it done.

---

## Skill Reference

These are the core skills that drive the workflow. Use them — they're not optional.

| Skill | When to Use |
|-------|-------------|
| `superpowers:brainstorming` | Before any creative work — new features, components, modifications |
| `superpowers:writing-plans` | After brainstorming, before writing code |
| `superpowers:subagent-driven-development` | During execution — parallelizes independent tasks across agents |
| `superpowers:dispatching-parallel-agents` | When facing 2+ independent tasks with no shared state |
| `superpowers:using-git-worktrees` | Before starting any feature work — ensures isolation |
| `superpowers:test-driven-development` | When implementing features or fixes — write tests first |
| `superpowers:systematic-debugging` | When encountering any bug or test failure |
| `superpowers:requesting-code-review` | Before finalizing work — get a review |
| `superpowers:verification-before-completion` | Before committing or creating PRs — run checks, confirm output |
| `superpowers:finishing-a-development-branch` | After PR merge — guides branch and worktree cleanup |
| `superpowers:receiving-code-review` | When getting feedback — verify before blindly implementing |
| `superpowers:executing-plans` | When running a plan in a follow-up session with review checkpoints |

---

## Rules

- **Worktrees for everything.** No exceptions. Every task gets its own worktree.
- **PRs for everything.** No direct pushes to the primary branch.
- **Parallel by default.** If tasks are independent, they run simultaneously.
- **Verify before claiming done.** Run the tests, check the build, confirm the output.
- **Clean up after yourself.** Merged branches and worktrees get deleted promptly.
- **Never commit secrets.** No `.env`, `.dev.vars`, credentials, or API keys in version control.

---

## Anti-Patterns

- Serializing work that could be parallelized
- Skipping the brainstorm/plan steps and jumping straight to code
- Working directly on the primary branch
- Claiming work is complete without running verification
- Leaving stale worktrees and branches after merge
- Guessing at bug fixes instead of systematically debugging
- Committing plan or design documents to the repo — they stay in the working conversation
