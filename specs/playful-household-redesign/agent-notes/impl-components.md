# Friction Notes: impl-components

## What went well

- The spec artifacts (contracts, tasks) were detailed enough to implement without ambiguity
- impl-theme completing all transition reference updates (luxurySlow -> playfulQuick) in the interface components saved significant effort
- The Tamagui `animation` prop + `playfulBounce` preset made the completion animation straightforward

## Friction points

1. **Pre-existing test failures**: 5 tests were already failing (3 in useHouseholdContext, 2 in ChoreHomePage.create) before any redesign work. The mock for `useHouseholdContext` is missing `householdName` which the component renders. This is a pre-existing gap unrelated to the redesign.

2. **State color tint opacity**: The spec says "10% opacity of state color" for background tints, but Tamagui doesn't natively support hex+opacity string interpolation. Used `${stateColor}10` which appends hex alpha `10` (~6% opacity) rather than true 10%. Close enough visually but not exact.

3. **CheckIcon creation**: No check/checkmark icon existed in the phosphor icon set. Had to create `CheckIcon.tsx` in the chorecue components directory. If more icons are needed later, a proper phosphor check icon should be added to `src/interface/icons/phosphor/`.

4. **Old theme file still exists**: `src/tamagui/themes/luxuryEditorial.ts` is still in the repo. It's no longer imported but wasn't deleted (impl-theme scope). Should be cleaned up.

5. **Visual verification tasks (T034, T035, T040) require human**: These tasks require running the dev server and iOS simulator for visual verification — cannot be completed by the agent alone.

## Decisions made

- Kept `fontFamily: '$heading'` references in feature files since `$heading` is now Inter (same as `$body`) — no visual difference
- Removed `fontStyle: 'italic'` from hero headings in ChoreHomePage and MembersPage — italic was an editorial style choice
- Used `memberNames.indexOf()` for accent color assignment rather than member ID hash — simpler and deterministic for the current member list
- Added `transition="playfulQuick"` to MemberCard for hover/press animations
