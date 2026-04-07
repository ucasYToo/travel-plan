# PRD: UI Layout Refactor — Collapsible Panels, Removed Detail Modals, Responsive Architecture

Version: v1.0.0 | Date: 2026-04-07

---

## Overview

Refactor the Seoul travel map app's UI layout to support collapsible side panels (both left and right), remove location/transport detail modals, fix overlapping map controls, and restructure the component architecture to cleanly separate layout from content for better mobile/desktop adaptation.

### Current State

- **Layout**: CSS Grid `sm:grid-cols-[280px_1fr_360px]` with three columns (sidebar | map | detail panel)
- **Left panel (Sidebar)**: Always visible on desktop, toggleable on mobile only. Contains day cards, route info, hotel info.
- **Right panel (LocationDetailPanel)**: Always visible on desktop (`hidden sm:flex`). Shows location detail on click.
- **Map controls**: `MapControls` component with top-right quick actions and mobile bottom toolbar. Leaflet zoom controls added at `bottomright` via `MapController`.
- **Detail modals**: `LocationDetailModal` (mobile only, triggered by marker click) and `TransportModal` (triggered by clicking transit labels).
- **Overlapping issue**: Leaflet's zoom control (`bottomright`) and the `ZoomIndicator` component (`bottom: 40px, right: 10px`) overlap with each other, and may conflict with any layer-switcher controls.

### Problems Identified

1. Zoom controls + zoom indicator + layer selector overlap in bottom-right corner
2. Right panel is always visible on desktop, consuming 360px of screen width even when not needed
3. Detail modals (`LocationDetailModal`, `TransportModal`) add friction — users want to browse without modal interruption
4. Left panel cannot collapse on desktop
5. Layout and content are tightly coupled via inline Tailwind classes, making responsive adaptation difficult

---

## Requirements

### R1: Fix Overlapping Controls in Bottom-Right Corner

- Leaflet zoom control (+/-), ZoomIndicator (z-level display), and any layer selection controls currently overlap
- Need to either: consolidate into a single unified control widget, or reposition them to avoid overlap

### R2: Right Panel — Collapsible, Default Collapsed

- The right detail panel (`LocationDetailPanel`) should be collapsed by default on desktop
- A toggle button should allow expanding/collapsing
- When expanded, it should show the currently selected location's details
- When collapsed, the full width should be available to the map

### R3: Remove Detail Modals

- Remove `LocationDetailModal` component entirely
- Remove `TransportModal` component entirely
- Location detail on marker click → selects location for the right panel (instead of opening a modal)
- Transit detail on label click → shows inline in the right panel or as a slide-over
- All detail information should be accessible through the panels without modals

### R4: Left Panel — Collapsible on Desktop

- The left sidebar should have a collapse/expand toggle on desktop (not just mobile)
- When collapsed, the map expands to fill the freed space
- A small toggle button should remain visible to re-expand

### R5: Separate Layout and Content Layers

- Extract layout logic (grid structure, responsive breakpoints, panel visibility, collapse states) into dedicated layout components
- Extract content components (sidebar content, detail panel content, map controls) as pure presentational components
- Create a unified `AppLayout` component that handles responsive behavior, panel states, and orchestration
- Mobile and desktop should share the same component structure, only differing in layout configuration

---

## User Stories

### US1: View Map Without Panels Taking Up Space

As a user viewing the travel map, I want both side panels to be collapsible so that I can see the full map when I don't need the sidebar or detail view.

**Acceptance Criteria:**
- [ ] On desktop, both left and right panels start in collapsed state
- [ ] Each panel has a visible toggle button when collapsed
- [ ] Clicking the toggle smoothly animates the panel open/closed
- [ ] Map area expands/contracts proportionally when panels toggle
- [ ] Mobile behavior remains unchanged (sidebar overlay pattern preserved)

### US2: View Location and Transit Details Without Modals

As a user exploring the itinerary, I want to see location and transit details inline (in the side panel) rather than in modal popups, so I can quickly browse without closing dialogs.

**Acceptance Criteria:**
- [ ] Clicking a map marker selects the location and updates the right detail panel
- [ ] Clicking a transit label shows transit details inline (right panel or dedicated section)
- [ ] `LocationDetailModal` and `TransportModal` components are removed from the app
- [ ] No functionality is lost — all information previously shown in modals is still accessible
- [ ] Clicking "查看详情" or "交通详情" in the sidebar updates the right panel content

### US3: Map Controls Do Not Overlap

As a user interacting with the map, I want the zoom buttons, zoom level indicator, and layer selector to be clearly separated so I can click them without misclicking.

**Acceptance Criteria:**
- [ ] Zoom control (+/-) and zoom level indicator are visually integrated or clearly separated
- [ ] No visual overlap between any map overlay controls
- [ ] Controls remain accessible at all zoom levels and screen sizes

### US4: Clean Responsive Layout

As a developer maintaining the app, I want layout and content to be in separate components so that adapting to new screen sizes or adding new panels doesn't require rewriting everything.

**Acceptance Criteria:**
- [ ] Layout configuration (grid columns, breakpoints, panel widths) is centralized
- [ ] Content components are layout-agnostic and receive width/visibility via props
- [ ] Mobile layout uses overlay pattern (unchanged from current)
- [ ] Desktop layout uses grid with collapsible side panels
- [ ] Adding a new panel or changing widths requires modifying only the layout component

---

## Constraints

- **Technology**: React + TypeScript + Vite + Leaflet + react-leaflet
- **Styling**: Tailwind CSS (CDN) — no additional CSS libraries
- **Build**: Single-file output (`vite-plugin-singlefile`)
- **Backward compatibility**: Existing data files (`seoul/locations.ts`, `seoul/days.ts`) must not change
- **Mobile**: Current mobile behavior (sidebar as overlay, bottom toolbar) should be preserved or improved
- **Tests**: Existing tests for removed components should be cleaned up; new components need tests

---

## Technical Approach

### Component Architecture (After Refactor)

```
src/components/
├── layout/
│   ├── AppLayout.tsx          # Top-level responsive layout orchestrator
│   ├── CollapsiblePanel.tsx   # Reusable collapsible panel wrapper
│   └── MapArea.tsx            # Map container with overlay controls
├── content/
│   ├── SidebarContent.tsx     # Sidebar content (day cards, routes)
│   ├── DetailContent.tsx      # Right panel content (location + transit detail)
│   └── MapControls.tsx        # Map action buttons (refactored, no overlap)
└── shared/
    └── LocationDetailContent.tsx  # Existing, reused as-is
```

### Key Changes Summary

| Change | Files Affected | Scope |
|--------|---------------|-------|
| Fix overlapping controls | `MapView.tsx`, `MapControls.tsx`, `ZoomIndicator.tsx` | Refactor control positioning |
| Collapsible left panel | `App.tsx`, `Sidebar.tsx` | Add collapse state + toggle |
| Collapsible right panel | `App.tsx`, `LocationDetailPanel.tsx` | Add collapse state, default collapsed |
| Remove modals | `App.tsx`, `LocationDetailModal.tsx`, `TransportModal.tsx` | Delete components, redirect to panel |
| Layout/content separation | New `layout/` and `content/` dirs | Extract layout logic |

### State Changes in App.tsx

```
- sidebarOpen: boolean (mobile overlay state)
+ leftPanelCollapsed: boolean (desktop)
+ rightPanelCollapsed: boolean (desktop, default true)
- detailModalOpen, detailData (removed — replaced by right panel state)
- modalOpen, transitDetail (removed — replaced by right panel state)
+ selectedLocation: existing state (kept)
+ selectedTransit: new state for transit detail viewing
```

---

## Risks and Assumptions

| Risk | Mitigation |
|------|-----------|
| Removing modals may lose mobile transit detail access | Transit detail shown in right panel on desktop; on mobile, use a bottom sheet or slide-over |
| Collapsible panels add complexity to grid layout | Use CSS Grid with dynamic `grid-template-columns` controlled by panel state |
| `alert()` used for copy feedback in `LocationDetailContent.tsx` | Out of scope, but should be addressed separately |

---

## Next Steps

- [ ] `/plan` — Create detailed implementation plan
- [ ] `/tdd` — Jump directly into test-driven development
- [ ] "Execute based on PRD" — Start implementing immediately
- [ ] Continue discussing requirements — Modify PRD or refine further
