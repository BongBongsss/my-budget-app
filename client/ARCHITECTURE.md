# Client Architecture Guidelines

This document outlines the architectural standards for the frontend (React) application to ensure consistency, scalability, and maintainability.

## 1. Data Layer Separation
- **No Direct API Calls:** Components must not use `fetch` or `axios` directly.
- **Centralization:** All API interactions must be performed through the service layer defined in `api.ts` or dedicated custom hooks.
- **Benefit:** Simplifies updates when server endpoints or data structures change.

## 2. Separation of Concerns (Logic vs. View)
- **Container vs. Presentational:** 
  - **Container:** Manage state and business logic (e.g., custom hooks).
  - **Presentational:** Focus on rendering UI based on props.
- **Custom Hooks:** Move complex state logic (e.g., `useEffect`, `useState` chains) out of components into custom hooks (e.g., `useTransactionList.ts`).

## 3. UI Reusability (DRY)
- **Component Extraction:** If a piece of UI (button, input, card) is reused more than twice, extract it into a dedicated component in `components/common/`.
- **Style Consistency:** Favor reusable components over inline styles or duplicate CSS to maintain a consistent design system.

## 4. State Management Hierarchy
- **Local State:** Use `useState` for UI-only state (e.g., toggle, input values).
- **Global State:** Use context or stores (e.g., Zustand) only for truly global data.
- **Server State:** API-fetched data should be managed through an efficient pattern (e.g., caching via `api.ts` abstractions) to avoid unnecessary re-fetches.

## 5. Single Responsibility Principle (SRP)
- **Component Size:** Keep individual component files under 200 lines of code.
- **Refactoring:** If a component grows beyond this limit, decompose it into smaller, manageable sub-components.
- **Feature Focused:** A component should do one thing well (e.g., a `TransactionForm` should only handle transaction creation/editing).
