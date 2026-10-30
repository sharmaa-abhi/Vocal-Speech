# Page-by-page bug report

**Repository:** `sharmaa-abhi/Vocal-Speech`  
**Workflow:** [Deno run 40877715944](https://github.com/sharmaa-abhi/Vocal-Speech/actions/runs/40877715944)  
**Failed job:** [test job 123460736576](https://github.com/sharmaa-abhi/Vocal-Speech/actions/runs/40877715944/job/123460736576)  
**Commit tested:** `162f608170a95c9199f50e39ade9966eecf23b9a`  
**Status:** The `Run linter` step failed with 90 problems; tests were skipped.

## Confirmed CI findings

### `/pipeline/audio-ingestion`

File: [`app/pipeline/audio-ingestion/page.tsx`](https://github.com/sharmaa-abhi/Vocal-Speech/blob/162f608170a95c9199f50e39ade9966eecf23b9a/app/pipeline/audio-ingestion/page.tsx)

- Unused import `motion` at line 6.
- Unused icon imports: `Square`, `ShieldCheck`, `Activity`, `Volume2`, `FileAudio`, `Info`, `Radio`, `Sparkles`, `Layers`, and `Cpu` at lines 12-24.
- Unused `INITIAL_METRICS` and `AcousticMetrics` imports at line 29.
- Unused state values `isPlaying` and `fileName` at lines 69-70.
- Deprecated `window` usage at lines 206 and 258; Deno recommends `globalThis` (`no-window`).

### `/pipeline/feature-extraction`

File: [`app/pipeline/feature-extraction/page.tsx`](https://github.com/sharmaa-abhi/Vocal-Speech/blob/162f608170a95c9199f50e39ade9966eecf23b9a)

- Unused import `motion` at line 6.
- Unused icon imports: `BarChart3`, `Activity`, `Layers`, `Sliders`, `AudioWaveform`, `Waves`, `CheckCircle2`, `Cpu`, `Sparkles`, `HelpCircle`, and `Clock` at lines 8-20.
- Unused state setters/values `showJitterScatter`, `setShowJitterScatter`, and `setEnergy` at line 103-104.
- Unused local `freqNorm` at line 133.

### `/pipeline/emotion-modeling`

File: [`app/pipeline/emotion-modeling/page.tsx`](https://github.com/sharmaa-abhi/Vocal-Speech/blob/162f608170a95c9199f50e39ade9966eecf23b9a)

- Unused import `motion` at line 6.
- Unused icon imports: `Brain`, `Cpu`, `Layers`, `Activity`, `ShieldAlert`, `Info`, `CheckCircle2`, `Workflow`, `Sparkles`, `GitBranch`, and `Network` at lines 8-20.

### `/pipeline/priority-triage`

File: [`app/pipeline/priority-triage/page.tsx`](https://github.com/sharmaa-abhi/Vocal-Speech/blob/162f608170a95c9199f50e39ade9966eecf23b9a)

- Unused imports `RADAR_TARGETS` and `RadarCallTarget` at line 25.
- Unused state setter `setSortBy` at line 154.

## Pages with no page-specific lint diagnostic in this run

The CI output did not report a direct lint diagnostic for these pages, but they still require functional testing:

- `/` (`app/page.tsx`)
- `/dashboard` (`app/dashboard/page.tsx`)
- `/pipeline` (`app/pipeline/page.tsx`)
- shared layout/navigation and visual scene components

“No lint diagnostic” does **not** mean “bug free.” It only means this failed run did not identify a lint error in that file.

## Required test checklist for every page

Run this checklist for each route at desktop and mobile widths, and with keyboard-only navigation:

- Page loads directly and through navigation without a console error.
- Refreshing the route does not lose the expected UI state or produce a hydration error.
- All links, buttons, tabs, selectors, upload controls, and back/next actions work.
- Loading, empty, success, failure, and retry states are visible and usable.
- Keyboard focus is visible; controls have accessible names; Escape closes overlays.
- Text remains readable at narrow widths; no horizontal overflow or clipped content occurs.
- Animations and canvas/3D scenes do not block interaction or crash when reduced motion is enabled.
- Audio/upload controls handle invalid files, cancellation, duplicate actions, and unsupported browser APIs.
- No uncaught exceptions, failed network requests, or leaked timers/listeners appear in the browser console.

## Page-specific functional tests

### Home (`/`)

- Verify the primary CTA reaches the intended pipeline route.
- Verify navigation links work from a fresh page load and after scrolling.
- Verify the animated/3D experience remains usable when WebGL is unavailable or reduced motion is enabled.

### Dashboard (`/dashboard`)

- Verify dashboard cards/charts render with empty and populated data.
- Verify filters, sorting, and navigation preserve valid state after refresh.
- Verify loading and error states do not leave stale or misleading metrics on screen.

### Pipeline overview (`/pipeline`)

- Verify every stage is reachable and the active stage is visually and semantically clear.
- Verify previous/next navigation handles the first and last stage correctly.
- Verify direct navigation to each stage and browser back/forward behavior.

### Audio ingestion (`/pipeline/audio-ingestion`)

- Verify microphone permission denial, cancellation, unsupported `AudioContext`, and repeated start/stop actions.
- Verify upload validation for empty, oversized, unsupported, and corrupted audio files.
- Verify playback state, filename display, reset/retry behavior, and cleanup when leaving the page.
- Replace deprecated `window` references and resolve all unused values before rerunning CI.

### Feature extraction (`/pipeline/feature-extraction`)

- Verify extraction starts, completes, fails, and can be retried without duplicating results.
- Verify feature charts render at empty, zero, minimum, maximum, and malformed values.
- Verify jitter/energy controls actually update the displayed chart, or remove dead state and controls.
- Verify charts remain usable on mobile and with reduced motion.

### Emotion modeling (`/pipeline/emotion-modeling`)

- Verify model loading, inference success, inference failure, and retry states.
- Verify confidence values are bounded and labels remain consistent with the displayed scores.
- Verify the visualization handles missing, delayed, and unexpected model output.

### Priority triage (`/pipeline/priority-triage`)

- Verify calls render for empty, normal, urgent, and malformed datasets.
- Verify urgency/timestamp sorting changes the visible order and persists only when intended.
- Verify selection, details, and navigation work with keyboard and on small screens.

## Recommended remediation order

1. Remove unused imports, state variables, setters, and locals, or wire them into the UI where they represent unfinished behavior.
2. Replace `window` with `globalThis` in audio-ingestion and guard browser-only APIs where necessary.
3. Run `deno lint` until clean, then run `deno test -A`.
4. Execute the route checklist above in a browser and record any runtime findings as separate entries with reproduction steps, expected behavior, severity, and screenshots.

This report records confirmed static findings from the failed CI job and a complete page-by-page test plan. Runtime bugs are not claimed as confirmed until the browser tests reproduce them.
