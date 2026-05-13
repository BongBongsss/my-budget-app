# Client Error Handling Policy

To ensure the application remains stable and provides helpful feedback, this project follows these frontend error handling standards.

## 1. Component Stability (Error Boundaries)
- **Isolation:** Wrap high-risk UI sections (e.g., charts, complex data lists) in `Error Boundaries`.
- **Graceful Failure:** If a component fails to render, show a fallback UI (e.g., "Something went wrong in this section") instead of allowing the entire application to crash.

## 2. Centralized API Handling (Interceptors)
- **Global Interception:** Use an API interceptor in `api.ts` to catch common HTTP errors (e.g., 401 Unauthorized, 500 Internal Server Error) across all requests.
- **Unified Actions:** 
  - **401/403:** Automatically redirect to Login or show an unauthorized warning.
  - **500:** Display a generic "Server issue" alert and log the error.

## 3. UX-Focused Feedback
- **User-Friendly Messages:** Never show raw server error codes (e.g., `DB_ERR_001`) to the user. Map technical errors to clear, actionable human-readable messages.
- **Feedback Methods:**
  - **Toast/Notification:** Use for non-critical/transient errors (e.g., "Failed to save, please retry").
  - **Inline Error:** Use for input-specific errors (e.g., invalid amount, missing date).
  - **Modal/Full-Page:** Use only for critical failures that prevent usage.

## 4. Resilience Patterns
- **Retry Logic:** For transient network errors, implement a simple retry mechanism or offer a "Retry" button to the user.
- **Loading/Empty States:** Ensure every data-driven component has a defined "Loading" state and "Empty" state to avoid layout shifts or confusing blanks.
