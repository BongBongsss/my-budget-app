# Client Data Integrity Rules

This document defines the rules for handling data on the frontend to ensure UI consistency and reliable data communication with the server.

## 1. UI-Server Synchronization (Single Source of Truth)
- **Server as Source:** The server's data is always the ultimate source of truth. UI state should reflect the server state as closely as possible.
- **Rollback Policy:** In the case of optimistic UI updates (updating the UI before the server confirms), if the server request fails, the UI **MUST** be reverted to the last known valid state immediately to prevent discrepancies.

## 2. Robust Input Validation
- **Client-Side Validation:** Always validate input data (type, range, required fields) in the client before sending it to the server.
- **Shared Validation Logic:** If possible, use shared validation schemas (e.g., Zod) between the client and server to ensure that validation rules never drift apart.
- **Immediate Feedback:** Provide clear, instant feedback for invalid inputs (e.g., highlighting fields in red, showing error messages) so the user can correct errors before submission.

## 3. Duplicate Prevention (Request Idempotency)
- **Submit Button Handling:** All "Save" or "Submit" buttons **MUST** be disabled immediately upon the first click to prevent duplicate form submissions during the processing window.
- **Loading State:** Utilize loading indicators to inform the user that their request is being processed and to prevent further interaction until completion.

## 4. Handling Stale Data
- **Re-fetching Policy:** After any mutation (Create, Update, Delete), ensure the UI fetches the most recent data from the server or manually updates the local state to match the server's response.
- **Invalidation:** Do not assume the client state is correct if the server response indicates a change; trigger a refresh of affected data segments.
