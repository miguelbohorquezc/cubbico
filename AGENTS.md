# AGENTS.md

## 🚨 Mandatory Read Before Any Action

This file **MUST be read before planning, coding, or modifying anything** in this repository.

If you cannot follow these rules, **STOP**.

---

## 1. Mandatory Acknowledgement

Before doing anything, the agent MUST explicitly say:

> **“I have read AGENTS.md and will follow it strictly.”**

No acknowledgement → **NO WORK**.

---

## 2. One Task Rule

All work MUST be broken into **microtasks**.

- ONE microtask at a time
- ONE clear objective
- Small enough for **1–2 hours**
- Designed to modify **max 2 files**

❌ No multitasking  
❌ No hidden refactors  
❌ No scope expansion

If the task grows → **STOP and split**.

---

## 2.1 Architect Agent Rule (MANDATORY)

Before any coding, the **Architect Agent MUST**:

- Divide the feature into **microtasks**
- Ensure **each microtask modifies max 2 files**
- Declare files per microtask explicitly
- Stop if a microtask exceeds this limit

If microtasks are not defined → **NO CODE IS ALLOWED**.


- Work on **ONE task only**
- ONE clear objective
- Small enough for **1–2 hours**

❌ No multitasking  
❌ No hidden refactors  
❌ No scope expansion

If the task grows → **STOP and split**.

---

## 3. Two Files Maximum

- A task may modify **MAX 2 FILES**
- Creating or deleting a file counts as one

More than 2 files needed → **STOP**.

---

## 4. Task Declaration (Before Coding)

The agent MUST state:

- **Task objective**
- **Files to modify (max 2)**
- **Definition of done**

If this is not clear → **DO NOT CODE**.

---

## 5. Architecture Rules

```
domain/           → Pure TypeScript (no deps)
infrastructure/   → Firebase & services
presentation/     → React, hooks, UI
```

- `presentation` must NOT access Firebase directly
- Business logic must NOT live in UI

---

## 6. Protected Modules (DO NOT TOUCH)

```
src/presentation/components/notes/
src/presentation/components/achievement/
src/presentation/components/classRoomReport/
src/presentation/components/informeGeneral/
```

If a task requires touching these → **STOP AND ASK**.

---

## 7. TypeScript Rules

- Explicit types only
- No `any`
- No `//@ts-ignore` without explanation
- Reuse types from `domain/entities`

---

## 8. Redux Rules

- Use Redux **only for global/shared state**
- UI/local state must stay in components or hooks
- One slice = one responsibility
- Async logic via thunks or RTK patterns only
- No Firebase calls inside components
- Keep reducers pure and predictable

---

## 9. Tailwind Rules

- Tailwind only for new UI
- Mobile-first
- No new `.css` files
- Keep class names readable

---

## 10. Definition of Done

A task is DONE only if:

- Objective is met
- Max 2 files changed
- TypeScript passes
- No protected modules touched
- Code is simple and readable

---

**Project:** Cubbico  
**Stack:** React + TypeScript + Firebase

