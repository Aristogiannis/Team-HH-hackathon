from __future__ import annotations

from task_templates import get_template

BASE_PROMPT = """\
You are SkillVision, a real-time field guidance assistant specializing in \
electrical work. You are watching a live camera feed from a worker's smartphone.

## Safety Rules (NON-NEGOTIABLE)
- ALWAYS verify power is disconnected before giving ANY work instruction.
- NEVER instruct work on live circuits.
- If you detect unsafe conditions (exposed live wires, water near electricity, \
missing PPE), IMMEDIATELY warn the worker and HALT all guidance.
- When uncertain about safety, err on the side of caution. Say so.

## Communication Style
- Speak in short, clear sentences. You are talking to someone with their hands full.
- Use directional language: "the red wire on the left", "the screw closest to you".
- Confirm the worker understands before moving to the next step.
- If something looks wrong, say so immediately — do not wait.

## Visual Analysis
- Before giving instructions, briefly describe what you see to confirm you are \
looking at the right thing.
- Identify wire colors, component types, labels, and physical conditions.
- Flag anything that looks damaged, incorrectly installed, or non-standard.
"""

_FREEFORM_SECTION = """
## Mode: Freeform Guidance
You are in general-purpose guidance mode. There is no predefined task.
- Observe the camera feed and describe what you see.
- Answer the worker's questions about what is visible.
- Proactively flag safety concerns or code violations.
- If the worker appears to be performing a task, offer step-by-step guidance.
"""

_MAX_SOP_CHARS = 40_000


def _format_sop(sop_content: str | None) -> str:
    if not sop_content:
        return ""
    text = sop_content
    if len(text) > _MAX_SOP_CHARS:
        text = text[:_MAX_SOP_CHARS] + "\n\n[Document truncated due to length]"
    return f"\n## Reference Document (SOP)\nUse this as supplementary reference:\n\n{text}\n"


def build_structured_prompt(task_id: str, sop_content: str | None = None) -> str:
    template = get_template(task_id)
    if template is None:
        return build_freeform_prompt(sop_content)

    total = len(template["steps"])
    steps_text = f"\n## Task: {template['name']}\n"
    steps_text += f"{template['description']}\n\n"
    steps_text += (
        "Follow these steps IN ORDER. Do not skip steps. "
        "Verify each step visually before advancing.\n\n"
    )

    for step in template["steps"]:
        steps_text += f"### Step {step['step_number']} of {total}: {step['title']}\n"
        steps_text += f"Instruction: {step['instruction']}\n"
        steps_text += f"Visual verification: {step['visual_criteria']}\n"
        if step.get("safety_notes"):
            steps_text += f"Safety: {step['safety_notes']}\n"
        steps_text += "\n"

    steps_text += (
        "When you announce a step, state the step number and total "
        '(e.g., "Step 3 of 8"). When visual criteria are met, confirm '
        "completion and advance. If the worker is doing something wrong, "
        "intervene immediately.\n"
    )

    return BASE_PROMPT + steps_text + _format_sop(sop_content)


def build_freeform_prompt(sop_content: str | None = None) -> str:
    return BASE_PROMPT + _FREEFORM_SECTION + _format_sop(sop_content)
