# Spec: UI Layout - Terminal Right Panel

## MODIFIED Requirements

### REQ-001: Main Layout Structure

The main layout shall use a two-column layout on desktop screens (lg breakpoint and above):
- **Left column**: Contains Progress navigation and Level content stacked vertically
- **Right column**: Contains the Terminal component

```
┌─────────────────────────────────────────────────────────┐
│ Header                                                  │
├────────────────────────────┬────────────────────────────┤
│ Progress (关卡导航)         │                            │
├────────────────────────────┤      Terminal              │
│ Level (关卡内容)            │      (sticky, fills height)│
│                            │                            │
│                            │                            │
└────────────────────────────┴────────────────────────────┘
```

#### Scenario: Desktop layout renders Terminal on right side

**Given** the viewport width is >= 1024px (lg breakpoint)
**When** the user views the main page
**Then** the layout shall display as two columns:
  - Left column width: 1/3 of container
  - Right column width: 2/3 of container
**And** the Terminal shall be positioned on the right side

#### Scenario: Mobile layout stacks components vertically

**Given** the viewport width is < 1024px
**When** the user views the main page
**Then** the layout shall stack components vertically:
  - Progress on top
  - Level in the middle
  - Terminal at the bottom

---

### REQ-002: Terminal Height Behavior

The Terminal component shall fill the available height in its container without expanding the page height.

#### Scenario: Terminal fills right column height on desktop

**Given** the viewport width is >= 1024px
**When** the page renders
**Then** the Terminal container shall have height equal to `calc(100vh - header height)`
**And** the Terminal shall not cause the page to scroll
**And** scrolling the left column content shall not affect Terminal position

#### Scenario: Terminal uses sticky positioning

**Given** the viewport width is >= 1024px
**When** the user scrolls the page
**Then** the Terminal shall remain visible and fixed in the viewport
**And** only the left column content shall scroll

#### Scenario: Terminal maintains fixed height on mobile

**Given** the viewport width is < 1024px
**When** the page renders
**Then** the Terminal shall use a reasonable fixed height (e.g., 320px)
**And** the Terminal shall scroll with the page normally

---

## ADDED Requirements

### REQ-003: Terminal Container Sticky Behavior

The Terminal's parent container shall use CSS sticky positioning to maintain visibility during scroll.

#### Scenario: Terminal container uses sticky positioning

**Given** the viewport width is >= 1024px
**When** the user scrolls the left column content beyond the viewport
**Then** the Terminal container shall remain fixed at the top of its scroll area
**And** the Terminal container shall have `position: sticky` with `top` offset matching header height
**And** the Terminal container height shall be `calc(100vh - header height - padding)`
