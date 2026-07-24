---
title: Designing long-running agents
description: Why managing context is the key ingredient to robust long-running agents. 
date: 2026-05-16
tags:
  - long-running agents
  - agent memory
  - harness engineering
---

Strip away the product surface, and every LLM agent is the same ten lines:

```text
1:  Add initial user prompt to messages list
2:  LOOP:
3:      Call model with messages list
4:      Extract tool calls from the model response
5:      IF no tool calls are found THEN:
6:          RETURN final assistant message          ← session handling
7:      END IF
8:      Execute extracted tool calls                ← agent capabilities
9:      Append tool results back to messages list
10: END LOOP
```

It is a model wrapped in a harness: a loop that keeps a conversation history, exposes tools, executes the tools the model asks for, and feeds the results back into the next model call.

Lines 6, and 8 define the primary degrees of freedom when designing an agent harness: *session handling*, and *agent capabilities*. Session handling is especially critical for long-running tasks, where the loop must persist past premature agent termination or context exhaustion. Coding Agents like Claude Code and Codex manage context limits via auto-compaction, where a model summarizes the session, the conversation history is reset, and the agent resumes using only the compacted summary. For most tasks, that is fine. However this quickly becomes a failure mode on tasks that spand hundreds of tool calls and huge context windows: GPU kernel optimization. It is a fitting setting for studying long-running agents in general: the reward is objective and machine-verifiable and the search space is deep enough that no single clever edit wins.

## Kernel Optimization Agent

Problem formulation / basic setup: let agent edit code and give it 'benchmark_kernel' tool. 
 - measure speedup vs token usage

Big Gap compared to production kernels. 

Key question: **how must the harness be architected to remove the need for human steering cost-effectively?**

### Failure modes

Initial experiments systematically varied prompting strategies (such as prescribing explicit performance targets or instructing the agent to prioritize exploration) alongside diverse session-handling policies, including Claude Code’s native multi-turn loops (`\loop`), compaction (`\compact`), and free-form memory capabilities.

While these modifications yielded minor incremental gains, the agent consistently plateaued well short of expert performance. Analyzing these runs revealed two recurring behavioral failure modes:

1. **Premature Structural Commitment**: The agent frequently terminates prematurely, rationalizing the choice as hitting a "structural wall," facing "diminishing returns," or "deferring to protect the working kernel." Yet when a human directive forces it to persist or attempt the rewrite, it clears these plateaus and unlocks substantial gains, which confirms the termination is a behavioral policy rather than an objective hardware or algorithmic ceiling.
2. **Self-Poisoning via Free-Form Memory**: Free-form text memory reinforces the agent's confirmation bias. When the agent abandons a path at a temporary bottleneck, it records the unverified conclusion in persistent memory (e.g., that "the remaining gap is structural and bounded by constraints, and further rewrites have low expected-value"). Later sessions reimport these notes as objective truth, cementing the premature convergence and stalling exploration.

**Central hypothesis.** Together, these failure modes suggest that the central bottleneck is behavioral: a self-reinforcing confirmation bias in which the agent conditions on its own unverified conclusions, including its accumulated context, the free-form memory it writes for itself, and the summary an auto-compaction leaves behind. It carries these priors forward, so the search converges prematurely. This points to structural requirements for a resilient, long-running agent environment:

1. **Reset the context, but keep what's learned** *(session handling, line 6)*. Periodically discarding the conversation stops accumulated priors from compounding, but a reset is only safe if the right knowledge survives it. The agent carries forward its measured results together with the qualitative insight it judges useful: hardware hazards, untried structural hypotheses, and its current best guess at the biggest next lever. What it must *not* carry forward is the unverified conclusions it uses to justify giving up.
2. **Version control over experiments** *(agent capabilities, line 8)*. Kernel optimization is a non-convex search: a given architecture may reach a local optimum worth deepening, but rarely the best possible basin. The agent therefore needs more than linear undo. It must be able to preserve measured results, branch from known-good states, compare alternatives, and decide which direction to pursue next. No measured progress should be lost, including across a reset.
3. **Prompts that push commitment and reward exploration** *(prompting, line 1)*. Directives must counter the agent's tendency to play it safe, pushing it to attempt high-upside structural rewrites and persist through a temporary regression rather than abandoning them, and to keep trying genuinely different ideas instead of dismissing them by argument.

## Harness Design

These findings motivate a new primitive, a *git for long-running agents*: a tree of experiments in which every node is a measured kernel snapshot together with its full evaluation and annotatable notes. Three tools operate on it: `log_experiment` snapshots the working kernel as a new node, `checkout_experiment` restores any node as the working kernel, and `diff_experiment` compares two. This makes experimentation non-destructive: the agent can attempt a risky structural rewrite and fall back to a known-good kernel if it regresses, instead of playing safe to protect the working kernel or rebuilding a good version by hand.

The **optimization journal** is the rendered view of that tree and the only channel that crosses a reset; the agent reads it with `read_journal` and attaches structured notes with `annotate_journal`. Two properties guard it against the self-poisoning above: knowledge lives in structured notes rather than free-form text, and an experiment can enter only once it has actually been measured. Unverified conclusions therefore cannot propagate across sessions, while measured results and the insight the agent judges worth keeping can. Resets therefore discard the full context rather than compacting it, preventing unverified free-form conclusions from crossing the boundary while preserving measured results through the journal.