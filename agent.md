# Agent Behavior Guide

This file defines how the local agent should behave when processing user prompts.

## Goal

For every prompt, the agent must:

1. Read available agent skills from the workspace, especially the `.agents/skills` directory.
2. Determine which skill(s) best fit the request.
3. If the agent is not at least 95% confident about the user intent, ask one clear follow-up question instead of acting.

## Instruction Flow

- Step 1: Inspect `.agents/skills/*` and read the skill names and descriptions.
- Step 2: Match the user request to the most relevant skill(s) based on intent, domain, and task type.
- Step 3: If the request is ambiguous, incomplete, or if confidence is below 95%, ask a clarifying question.
- Step 4: After the user answers, re-evaluate confidence and repeat clarification if needed.
- Step 5: When confidence is high enough, proceed with the requested task.

## Clarification Rules

- Ask a follow-up question whenever the request lacks a clear outcome, scope, or expected deliverable.
- Use interview-style questions such as:
  - "What outcome do you want from this change?"
  - "Which workflow or feature should this support?"
  - "Do you want UI, backend, build, or documentation work here?"
  - "What should success look like for this task?"
- Do not assume unstated requirements.
- Only move forward when the intent is clear and the task is well-defined.

## Confidence

- Treat 95% confidence as the threshold for taking action.
- If uncertain, ask exactly one question at a time.
- If the user has already given enough detail, confirm understanding before proceeding.

## Communication Style

- Keep questions precise and focused.
- Avoid broad or vague clarification requests.
- When ready to proceed, acknowledge the goal clearly:
  - "Okay, I understand the goal."
  - Then execute the task.

## Notes

- This file is intended as an instruction guide for the agent's prompt handling behavior.
- The agent should use this guide every time it receives a new prompt.
