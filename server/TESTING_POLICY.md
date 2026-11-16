# Testing Policy

To ensure data integrity and system reliability, this project adheres to the following testing policy.

## 1. Core Philosophy
- **Automated Verification:** Every critical business logic change must be accompanied by an automated test.
- **Regression Prevention:** Add a regression test for critical business logic and data-integrity bugs. For other bugs, assess the regression risk and add a meaningful test when warranted; document why when it is not practical.

## 2. Testing Scope
### A. Mandatory (Unit Tests)
- **Business Logic:** Critical calculations, data transformations, and validation logic in `services/` must have corresponding automated tests.
- **Data Integrity:** Rules that prevent invalid transactions, improper categories, or asset miscalculations must be verified.

### B. Suggested (Integration Tests)
- **API Endpoints:** Critical paths (e.g., creating a transaction, processing imports) should be verified through integration tests to ensure `Routes` and `Services` work together correctly.

## 3. Best Practices
- **Test Case Isolation:** Each test should be independent and shouldn't rely on the state of other tests.
- **Descriptive Naming:** Tests must clearly describe the expected behavior (e.g., `it('should return error when transaction amount is negative')`).
- **Reproducibility:** Identify the failing scenario and capture it in an automated test when the risk warrants one.

## 4. Verification Workflow
1. **Identify:** A bug or requirement is identified.
2. **Write:** For a critical or regression-prone issue, write a meaningful test that reproduces the issue when practical.
3. **Fix/Implement:** Write the code to satisfy the test case.
4. **Verify:** Run checks appropriate to the change and follow the pre-push verification policy before pushing.
5. **Protect:** When a commit is requested, include the relevant test with the implementation.
