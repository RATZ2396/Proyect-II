# PROJECT: TIMBA CLICKER (Arcade Version)

## OVERVIEW
A hybrid polished clicker game that functions as:
1. Web App (Standalone).
2. Telegram Mini App (Integrated).

## DEVELOPMENT RULES (STRICT MODE)
1. **Web First:** Priority is web logic using `localStorage`. Telegram integration adds a layer on top.
2. **Pure Javascript:** NO TypeScript. Use JSDoc for documentation.
3. **Mandatory Tests:** Jest tests for new logic.
4. **Design & Language:** - **Language:** English Only (Code & UI).
   - **Aesthetic:** Modern Arcade Clicker (Neon Orange/Dark).
   - **Assets:** Use local `/coin.png` for the main button.
   - **Features:** Bright orange energy bar, floaty text animations.

## WORKFLOW & DOCUMENTATION (NEW)
1. **Source Control:** - Use the **Source Control Panel** (GUI) for staging and committing.
   - **NO** CLI commands for git (unless emergency).
   - Commit often to avoid merge conflicts.
2. **Continuous Documentation:**
   - Antigravity/Claude must update this `.md` file or a dedicated `CHANGELOG.md` with every significant change.
   - Always read this file before starting a new task to maintain context.

## ROADMAP STATUS

### PHASE 1: Core Loop (Completed)
- [x] Next.js + Tailwind setup.
- [x] Basic Click/Energy logic implemented.
- [x] Jest configuration ready.

### PHASE 2: Economy (Completed)
- [x] Shop System UI & Logic (Multitap, Energy Tank, Refill).
- [x] Upgrades persistence in `localStorage`.

### PHASE 3: Telegram Integration (Completed)
- [x] Hybrid detection (Web vs Telegram Environment).
- [x] User data extraction (ID, Username).

### PHASE 4: Arcade Polish (IN PROGRESS)
- [ ] Visual overhaul (Arcade/Neon CSS).
- [ ] Complete English localization (UI Text).
- [ ] Image-based Coin implementation (`/coin.png`).
- [ ] Animations (Floating text on click, button press effects).

## LATEST CHANGELOG
- **System:** Enforced "Strict Mode" for workflow.
- **Docs:** Integrated "Master Instructions" as the single source of truth.
- **Git:** Switched to UI-based version control strategy (Source Control Panel).
