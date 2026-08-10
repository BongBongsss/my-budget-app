# Client Testing Policy

To ensure a seamless user experience and robust interface, this project follows these frontend testing standards.

## 1. Core Philosophy
- **User-Centric:** Focus tests on what the user experiences (e.g., "can the user add a transaction?") rather than internal implementation details.
- **Resilience:** The UI should gracefully handle failures (API errors, loading states, invalid inputs) rather than crashing.

## 2. Testing Scope
### A. Component Testing
- **Critical UI:** Reusable components (forms, inputs, buttons) must be verified to ensure they render correctly with various props.
- **State Logic:** Logic within complex components or custom hooks should be unit-tested to ensure state updates (e.g., filtering transactions) behave as expected.

### B. Scenario/Integration Testing
- **User Journeys:** Core flows (Login, Adding/Editing a Transaction, Asset Management) must be tested to ensure the integration between UI, state management, and the API works correctly.
- **Error Resilience:** Test how the UI behaves when the server returns 4xx or 5xx errors or when the network is offline.

## 3. Best Practices
- **Mocking:** Mock API calls using consistent data to ensure tests are fast, predictable, and isolated from the live server.
- **Accessibility:** Ensure that critical paths remain accessible (e.g., keyboard navigation for forms).
- **Snapshot/Visual Check:** Use visual or structure snapshots for complex components to quickly detect unwanted layout shifts.

## 4. Verification Workflow
1. **Define:** Identify the expected UI behavior or user flow.
2. **Setup:** Create a test environment (using tools like Vitest, React Testing Library, or Playwright).
3. **Execute:** Run tests to confirm the component or flow is stable.
4. **Iterate:** After UI changes, update tests to reflect new requirements and ensure no regressions (e.g., breaking a button's functionality).

## 5. Responsive and Overlay Verification
- **Reported Viewport First:** Reproduce layout reports at the actual reported viewport before deciding whether the affected rule is desktop or mobile.
- **Breakpoint Coverage:** For a responsive layout change, verify at least one desktop width and one narrow mobile width unless the user explicitly limited the scope to one breakpoint.
- **Control Fit:** Check that form inputs, labels, icons, and action buttons remain inside their container and that action labels do not wrap unexpectedly.
- **Overlay Interactions:** Verify dropdowns and modals against sticky headers, sticky action bars, and floating controls. Opening a collapsible menu must not reveal a previously hidden modal.

## Revision History

- **2026-08-10**: Added responsive layout and overlay verification requirements.
  - **Reason**: Make screenshot-driven UI regressions reproducible before release.
