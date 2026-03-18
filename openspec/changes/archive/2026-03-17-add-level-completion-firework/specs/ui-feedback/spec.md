# Spec: UI Feedback - Level Completion Firework

## ADDED Requirements

### REQ-001: Firework Animation on Level Completion

When a level is completed, a firework animation shall be displayed in the center of the screen.

#### Scenario: Firework displays when level is completed

**Given** the user is playing a level
**When** the user successfully completes the level
**Then** a firework animation shall appear in the center of the screen
**And** the animation shall show particles exploding outward from the center
**And** the particles shall have random colors from a predefined palette
**And** the animation shall last for 5 seconds

#### Scenario: Firework auto-dismisses after 5 seconds

**Given** a firework animation is currently displaying
**When** 5 seconds have elapsed
**Then** the firework animation shall automatically disappear
**And** all animation resources shall be cleaned up

#### Scenario: Firework dismisses on next level click

**Given** a firework animation is currently displaying
**And** the "下一关" (Next Level) button is visible
**When** the user clicks the "下一关" button
**Then** the firework animation shall immediately disappear
**And** all animation resources shall be cleaned up before navigating

---

### REQ-002: Firework Sound Effect

A sound effect shall play when the firework animation is triggered.

#### Scenario: Sound plays with firework animation

**Given** the user completes a level
**When** the firework animation is triggered
**Then** a firework sound effect shall play
**And** the sound shall be preloaded to avoid playback delay

#### Scenario: Sound fails silently if unavailable

**Given** the firework sound file is unavailable or fails to load
**When** the firework animation is triggered
**Then** the animation shall still display
**And** no error shall be shown to the user

---

### REQ-003: Performance Requirements

The firework animation shall not significantly impact application performance.

#### Scenario: Animation maintains 55+ fps

**Given** a device with standard performance capabilities
**When** the firework animation is playing
**Then** the animation frame rate shall remain at or above 55 fps
**And** the main application UI shall remain responsive

#### Scenario: Particle count is limited

**Given** the firework animation is playing
**Then** the number of active particles shall not exceed 100
**And** excess particles shall be reused from the particle pool

#### Scenario: Resources are cleaned up on unmount

**Given** the firework component is about to unmount
**When** the component unmounts
**Then** all canvas drawing contexts shall be cleared
**And** all event listeners shall be removed
**And** all timers shall be cancelled
**And** audio resources shall be released
