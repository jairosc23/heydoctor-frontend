# HCX Motion System v1.0  
## Purposeful Motion for Clinical Clarity

| Field | Value |
|-------|-------|
| **Program** | HCX Phase 1 — Foundations |
| **Document** | HCX Motion System |
| **Version** | 1.0 |
| **Status** | Official motion specification — **no implementation** |
| **Path** | `docs/design/hcx/HCX-MOTION-SYSTEM-v1.0.md` |

**Laws:** Spec only · no CSS/JS animation code · no commits.  
**Law of motion:** If it does not improve understanding, remove it.

---

## 1. Motion philosophy

1. Motion **explains state change**, never decorates.  
2. Clinical clarity outranks delight.  
3. Stability during AI streaming and documentation beats flourish.  
4. Authority moments (HAB) use restrained, attention-locking motion — not celebration.  
5. Reduced motion is a first-class path, not an afterthought.

---

## 2. Durations

| Token | Duration | Use |
|-------|----------|-----|
| `fast` | 150ms | Hover, color, border, press feedback |
| `base` | 200ms | Enter/exit small panels, focus shift |
| `slow` | 250–320ms | Sheets, drawers, stage content change |
| `continuity` | ≤400ms | Rare journey morph; never longer for UI chrome |

**Forbidden:** Multi-second decorative loops; infinite shimmer on clinical text.

---

## 3. Easing

| Token | Character | Use |
|-------|-----------|-----|
| `standard` | Ease-out | Entrances, fades |
| `spatial` | Ease-in-out | Positional moves |
| `linear` | Linear | Determinate progress bars only |
| `emphasis` | Slightly stronger ease-out | HAB present (still no bounce) |

**Forbidden:** Bounce, elastic, springy overshoot on Confirm/Reject/critical alerts.

---

## 4. Transition principles

| Principle | Spec |
|-----------|------|
| Chrome stability | Nav/chrome stay put; content transitions |
| Shared axis | Stage changes glide on one axis |
| Opacity + translate | Prefer small translate (4–8px) + fade |
| No layout thrash | Streaming AI must not reflow entire workspace |
| Scrim | Modal/HAB: fade scrim `base`–`slow` |
| Exit faster or equal | Avoid sticky exits that feel laggy |

---

## 5. Micro-interactions

| Interaction | Motion |
|-------------|--------|
| **Hover** | Color/border `fast`; optional 1px elevation — no large lift |
| **Focus** | Instant ring appearance; no delay > fast |
| **Press** | Background deepens `fast`; scale optional ≤0.98 on non-HAB |
| **Selection** | Soft brand fill `fast`; checkbox tick `fast` |
| **Toggle** | Thumb/state `base`; label updates immediately |
| **Expand/collapse** | Height/opacity `base`–`slow`; preserve scroll position when possible |

---

## 6. Loading states

| Pattern | Spec |
|---------|------|
| Local spinner | Prefer over full-page block |
| Skeleton | Match final layout structure |
| Progress determinate | Linear easing; honest percentage when known |
| Progress indeterminate | Subtle; not competing with clinical text |
| Timeout | Static error — stop motion |

**Forbidden:** Skeleton forever; shimmer across paragraphs being read.

---

## 7. Success feedback

| Context | Motion |
|---------|--------|
| Soft success | Brief check fade-in `base`; no confetti |
| Save draft | Quiet toast optional; no workspace shake |
| HAB Confirm success | Short confirmation text; optional single check; **no** fireworks |
| Tele connected | Indicator ease; calm |

---

## 8. Warning feedback

| Context | Motion |
|---------|--------|
| Warning banner enter | Fade + slight drop `base` |
| Unbound context | Optional **single** soft border pulse, then static |
| Degraded assist | Static amber + copy; no looping glow |

---

## 9. Critical / error feedback

| Context | Motion |
|---------|--------|
| Critical alert | Immediate appear; high contrast; motion optional and short |
| Field error | Inline text; optional brief highlight `fast` |
| Fail-closed block | Static clarity preferred over shake |
| Connection loss | Persistent banner; pulse max once |

**Forbidden:** Screen shake loops; red strobe; alarming vibration patterns without cause.

---

## 10. Attention guidance

| Technique | When |
|-----------|------|
| Focus move | After opening HAB / critical dialog |
| Scroll into view | Only for user-initiated or critical; not on every AI token |
| Spotlight dim | HAB/modal scrim; keep clinical contrast on the challenge |
| Pin | Alerts pin; don’t rely on fleeting motion |

---

## 11. Clinical-specific motion map

| Moment | Allowed | Forbidden |
|--------|---------|-----------|
| Journey stage change | Content cross-fade `slow` | Parallax workspace |
| Assist open | Dock slide/fade `base`–`slow` | Overlay covering HAB |
| Dispose suggestion | Quiet dismiss `fast` | Same motion as HAB Confirm |
| HAB present | Elevation.4 enter `slow` | Bounce, confetti, long delay |
| Rx confirmation | Opaque static emphasis | Glass morph |
| Timeline new event | Ease-in on spine `base` | Auto-scroll stealing focus while typing |
| Tele join | Soft lobby → call | Celebratory bursts |

---

## 12. Reduced motion

Under `prefers-reduced-motion: reduce` (or product equivalent):

| Keep | Drop |
|------|------|
| Instant state changes | Transforms, decorative fades |
| Opacity cuts (0↔1) if needed for comprehension | Loops, pulses, slides |
| Focus rings | Continuity morphs |

Essential feedback must remain via **color + text + icon**.

---

## 13. Performance constraints

- Prefer compositor-friendly properties (opacity, transform) in future impl  
- No continuous blur animation  
- Cap concurrent animated elements in encounter view (guideline: ≤3)  
- Disable non-essential motion on low-power / data-saver if detectable later  

---

## 14. QA checklist (motion)

- [ ] Does this motion teach a state change?  
- [ ] Can a clinician ignore it and still work safely?  
- [ ] Is HAB visually distinct from Dispose without relying on motion alone?  
- [ ] Does reduced-motion path still communicate success/warning/error?  
- [ ] Does AI streaming avoid layout jump?  

---

## Document control

| Field | Value |
|-------|-------|
| Implementation | **None** |
| COS impact | **None** |

**End of HCX Motion System v1.0.**
