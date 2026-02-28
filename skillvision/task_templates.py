from __future__ import annotations

from typing import Any

TEMPLATES: dict[str, dict[str, Any]] = {
    "replace-outlet": {
        "id": "replace-outlet",
        "name": "Replace a Wall Outlet",
        "description": "Step-by-step guide to safely replace a standard wall outlet.",
        "steps": [
            {
                "step_number": 1,
                "title": "Safety Check",
                "instruction": (
                    "Locate the breaker panel. Identify the correct breaker "
                    "for this outlet. Switch it to the OFF position."
                ),
                "visual_criteria": (
                    "Breaker visibly in the OFF position. "
                    "Voltage tester confirms no power at the outlet."
                ),
                "safety_notes": (
                    "NEVER proceed without verifying power is off. "
                    "Use a non-contact voltage tester on the outlet."
                ),
            },
            {
                "step_number": 2,
                "title": "Remove Cover Plate",
                "instruction": (
                    "Unscrew the cover plate screw(s) and remove the "
                    "cover plate from the outlet."
                ),
                "visual_criteria": (
                    "Cover plate removed. Outlet mounting screws and "
                    "the outlet body are visible."
                ),
                "safety_notes": None,
            },
            {
                "step_number": 3,
                "title": "Disconnect Old Outlet",
                "instruction": (
                    "Unscrew the two mounting screws holding the outlet "
                    "to the electrical box. Carefully pull the outlet out. "
                    "Loosen each terminal screw and disconnect all wires."
                ),
                "visual_criteria": (
                    "All wires disconnected from the old outlet. "
                    "Old outlet fully removed from the box."
                ),
                "safety_notes": (
                    "Handle wires gently — do not bend them sharply or "
                    "nick the insulation."
                ),
            },
            {
                "step_number": 4,
                "title": "Identify Wires",
                "instruction": (
                    "Identify the three wires: hot (black), neutral (white), "
                    "and ground (bare copper or green). If wire colors differ, "
                    "describe what you see and I will help identify them."
                ),
                "visual_criteria": (
                    "Three wires visible and correctly identified: "
                    "black (hot), white (neutral), bare/green (ground)."
                ),
                "safety_notes": (
                    "If you see red wires or more than three wires, STOP — "
                    "this may be a multi-way switch circuit that needs "
                    "special handling."
                ),
            },
            {
                "step_number": 5,
                "title": "Connect Ground Wire",
                "instruction": (
                    "Take the bare copper or green ground wire. Form a "
                    "clockwise hook at the end. Attach it to the green "
                    "screw on the new outlet. Tighten the screw firmly."
                ),
                "visual_criteria": (
                    "Ground wire secured under the green screw terminal. "
                    "Wire wrapped clockwise. No loose strands."
                ),
                "safety_notes": None,
            },
            {
                "step_number": 6,
                "title": "Connect Neutral Wire",
                "instruction": (
                    "Take the white (neutral) wire. Form a clockwise hook. "
                    "Attach it to the silver screw on the new outlet. "
                    "Tighten firmly."
                ),
                "visual_criteria": (
                    "White wire secured under the silver screw terminal."
                ),
                "safety_notes": (
                    "Silver screw = neutral (white). Do NOT connect white "
                    "to the brass/gold screw."
                ),
            },
            {
                "step_number": 7,
                "title": "Connect Hot Wire",
                "instruction": (
                    "Take the black (hot) wire. Form a clockwise hook. "
                    "Attach it to the brass or gold screw on the new outlet. "
                    "Tighten firmly."
                ),
                "visual_criteria": (
                    "Black wire secured under the brass/gold screw terminal."
                ),
                "safety_notes": (
                    "Brass/gold screw = hot (black). Double-check that no "
                    "bare copper is exposed outside the screw terminal."
                ),
            },
            {
                "step_number": 8,
                "title": "Mount and Test",
                "instruction": (
                    "Carefully push the outlet and wires back into the "
                    "electrical box. Screw the outlet to the box with the "
                    "mounting screws. Attach the cover plate. Go to the "
                    "breaker panel and restore power. Test the outlet with "
                    "a plug-in tester or by plugging in a lamp."
                ),
                "visual_criteria": (
                    "Cover plate installed flush. Power restored. "
                    "Outlet tested and functional."
                ),
                "safety_notes": (
                    "Before restoring power, visually confirm no wires are "
                    "pinched or exposed outside the box."
                ),
            },
        ],
    },
    "inspect-panel": {
        "id": "inspect-panel",
        "name": "Inspect an Electrical Panel",
        "description": (
            "Guided visual inspection of a residential electrical panel "
            "to identify potential issues and code violations."
        ),
        "steps": [
            {
                "step_number": 1,
                "title": "Panel Overview",
                "instruction": (
                    "Open the panel cover (outer door only — do NOT remove "
                    "the dead front). Show me the full panel so I can assess "
                    "its overall condition, brand, and layout."
                ),
                "visual_criteria": (
                    "Full panel visible with breakers, labels, and main "
                    "breaker in view."
                ),
                "safety_notes": (
                    "Do NOT touch anything inside the panel. "
                    "Do NOT remove the inner dead-front cover."
                ),
            },
            {
                "step_number": 2,
                "title": "Breaker Labeling Check",
                "instruction": (
                    "Show me the panel schedule (the label on the inside "
                    "of the door). I will check if breakers are properly "
                    "labeled and match the circuit layout."
                ),
                "visual_criteria": (
                    "Panel schedule legible. Breaker positions match labels."
                ),
                "safety_notes": None,
            },
            {
                "step_number": 3,
                "title": "Signs of Overheating or Damage",
                "instruction": (
                    "Slowly pan the camera across all breakers and wires "
                    "visible through the panel opening. I am looking for "
                    "scorch marks, melted plastic, discoloration, or a "
                    "burning smell."
                ),
                "visual_criteria": (
                    "No visible scorch marks, melting, or discoloration "
                    "on breakers or wiring."
                ),
                "safety_notes": (
                    "If you see active arcing, scorch marks, or smell "
                    "burning, STOP and call a licensed electrician."
                ),
            },
            {
                "step_number": 4,
                "title": "Wire Gauge Verification",
                "instruction": (
                    "Show me the wires entering the top of the panel and "
                    "the connections at individual breakers. I will check "
                    "if wire gauges are appropriate for their breaker ratings."
                ),
                "visual_criteria": (
                    "Wire gauges appear consistent with breaker ratings "
                    "(e.g., 14 AWG on 15A, 12 AWG on 20A)."
                ),
                "safety_notes": None,
            },
            {
                "step_number": 5,
                "title": "Grounding Assessment",
                "instruction": (
                    "Show me the grounding bus bar and the main grounding "
                    "conductor. I will verify proper grounding connections."
                ),
                "visual_criteria": (
                    "Ground bus bar visible with properly connected ground "
                    "wires. Main ground conductor present and connected."
                ),
                "safety_notes": (
                    "In a sub-panel, grounds and neutrals must be on "
                    "separate bus bars. In the main panel, they may share."
                ),
            },
        ],
    },
}


def get_template(task_id: str) -> dict[str, Any] | None:
    return TEMPLATES.get(task_id)


def list_templates() -> list[dict[str, str | int]]:
    return [
        {
            "id": t["id"],
            "name": t["name"],
            "description": t["description"],
            "step_count": len(t["steps"]),
        }
        for t in TEMPLATES.values()
    ]
