# Testing Policy

To ensure data integrity and system reliability, this project adheres to the following testing policy.

## 1. Core Philosophy
- **Automated Verification:** Every critical business logic change must be accompanied by an automated test.
- **Regression Prevention:** If a bug is discovered, a test case reproducing that bug must be added to the test suite before or during the fix.

## 2. Testing Scope
### A. Mandatory (Unit Tests)
- **Business Logic:** Any calculation, data transformation, or validation logic in `services/` must have corresponding unit tests.
- **Data Integrity:** Rules that prevent invalid transactions, improper categories, or asset miscalculations must be verified.

### B. Suggested (Integration Tests)
- **API Endpoints:** Critical paths (e.g., creating a transaction, processing imports) should be verified through integration tests to ensure `Routes` and `Services` work together correctly.

## 3. Best Practices
- **Test Case Isolation:** Each test should be independent and shouldn't rely on the state of other tests.
- **Descriptive Naming:** Tests must clearly describe the expected behavior (e.g., `it('should return error when transaction amount is negative')`).
- **Reproducibility:** When reporting a bug or requesting a fix, the agent/developer must include a test case that captures the failing scenario.

## 4. Verification Workflow
1. **Identify:** A bug or requirement is identified.
2. **Write:** Write a failing test case that reproduces the issue.
3. **Fix/Implement:** Write the code to satisfy the test case.
4. **Verify:** Run the test suite and confirm all tests pass.
5. **Protect:** Commit the test case along with the implementation to prevent future regressions.
